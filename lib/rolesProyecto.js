// lib/rolesProyecto.js
//
// Crear roles de un proyecto. Un rol abierto es lo único a lo que alguien se puede
// postular: sin roles, un proyecto publicado no recibe a nadie.
//
// Antes los chips "¿Qué perfiles necesitas?" del formulario solo guardaban
// proyectos.roles_buscados y no creaban ningún rol, así que 2 de los 4 primeros
// proyectos externos quedaron publicados sin dónde postularse. Ahora cada chip crea
// su rol abierto al publicar (y al editar los chips), sin duplicar los que ya existen.

import { SEGMENTOS_ROLES } from './segmentosRoles.js'

// Chip del formulario (id guardado en roles_buscados) → rol abierto.
// tipo_aporte y modalidad respetan los CHECK de la tabla roles.
export const ROL_DESDE_CHIP = {
  Capitalista: {
    nombre: 'Inversionista inicial', tipo_aporte: 'capital', modalidad: 'equity', es_prioritario: true,
    descripcion: 'Aporta capital al proyecto a cambio de participación. Monto y condiciones se acuerdan con el fundador; el dinero pasa por la custodia de Escala.',
  },
  Cofundador: {
    nombre: 'Co-fundador', tipo_aporte: 'conocimiento', modalidad: 'equity',
    descripcion: 'Construye el negocio junto al fundador a cambio de participación.',
  },
  Desarrollador: {
    nombre: 'Desarrollador Full-Stack', tipo_aporte: 'servicio', modalidad: 'deuda_diferida',
    descripcion: 'Desarrolla la tecnología del proyecto a cambio de participación.',
  },
  'Diseñador': {
    nombre: 'Diseñador', tipo_aporte: 'servicio', modalidad: 'deuda_diferida',
    descripcion: 'Diseña la marca y las piezas del proyecto a cambio de participación.',
  },
  Contador: {
    nombre: 'Contador', tipo_aporte: 'servicio', modalidad: 'deuda_diferida',
    descripcion: 'Lleva la contabilidad y los impuestos del proyecto a cambio de participación.',
  },
  Abogado: {
    nombre: 'Abogado', tipo_aporte: 'servicio', modalidad: 'deuda_diferida',
    descripcion: 'Acompaña lo legal del proyecto (constitución, contratos) a cambio de participación.',
  },
  Marketing: {
    nombre: 'Marketing', tipo_aporte: 'servicio', modalidad: 'deuda_diferida',
    descripcion: 'Consigue clientes y hace crecer la marca a cambio de participación.',
  },
  Ventas: {
    nombre: 'Ventas', tipo_aporte: 'servicio', modalidad: 'deuda_diferida',
    descripcion: 'Vende los productos o servicios del proyecto a cambio de participación.',
  },
  // 'Otro' no crea rol: no sabemos qué perfil es. El fundador lo publica a mano.
}

/**
 * Roles a crear según los chips, sin repetir los que el proyecto ya tiene. Función pura.
 * El de capital se omite si ya existe cualquier rol con tipo_aporte 'capital'.
 * @param {string[]} rolesBuscados - ids de chips (proyectos.roles_buscados)
 * @param {{nombre:string, tipo_aporte:string}[]} existentes - roles actuales del proyecto
 * @param {number} capitalNecesario - monto que pide el fundador (valor del rol de capital)
 */
export function rolesPorCrear(rolesBuscados, existentes, capitalNecesario) {
  const nombres = new Set((existentes || []).map(r => String(r.nombre || '').trim().toLowerCase()))
  const yaHayCapital = (existentes || []).some(r => r.tipo_aporte === 'capital')
  const vistos = new Set()
  const porCrear = []
  for (const chip of rolesBuscados || []) {
    const spec = ROL_DESDE_CHIP[chip]
    if (!spec || vistos.has(spec.nombre)) continue
    vistos.add(spec.nombre)
    if (nombres.has(spec.nombre.toLowerCase())) continue
    if (spec.tipo_aporte === 'capital' && yaHayCapital) continue
    porCrear.push({
      nombre: spec.nombre,
      descripcion: spec.descripcion,
      tipo_aporte: spec.tipo_aporte,
      modalidad: spec.modalidad,
      es_prioritario: !!spec.es_prioritario,
      valor_mercado: spec.tipo_aporte === 'capital' ? (Math.max(0, Math.round(Number(capitalNecesario) || 0))) : 0,
    })
  }
  return porCrear
}

/**
 * Crea un rol abierto y le inicializa las tareas de sus segmentos (si el nombre del rol
 * tiene segmentos en SEGMENTOS_ROLES). Mismo comportamiento que POST /api/roles.
 */
export async function crearRol(supabase, { proyecto_id, fundador_id, nombre, sub_especialidad, descripcion, tipo_aporte, valor_mercado, modalidad, es_prioritario, estado }) {
  const { data: rol, error } = await supabase
    .from('roles')
    .insert([{ proyecto_id, nombre, sub_especialidad: sub_especialidad || null, descripcion, tipo_aporte, valor_mercado, modalidad, es_prioritario, estado: estado || 'abierto' }])
    .select()
    .single()
  if (error) throw new Error(error.message)

  let tareasCreadas = 0
  const segmentosDelRol = SEGMENTOS_ROLES[nombre]
  if (segmentosDelRol) {
    const todasLasTareas = []
    for (const [segmento, tareas] of Object.entries(segmentosDelRol)) {
      for (const tarea of tareas) {
        todasLasTareas.push({
          proyecto_id,
          rol_nombre: nombre,
          asignado_a: null,
          nombre: tarea.nombre,
          descripcion: tarea.descripcion || '',
          categoria: tarea.categoria || 'General',
          estado: 'pendiente',
          creado_por: fundador_id,
          razon_creacion: `Tarea inicial del rol ${nombre} — ${segmento}`,
        })
      }
    }
    if (todasLasTareas.length > 0) {
      const { error: errTareas } = await supabase.from('tareas').insert(todasLasTareas)
      if (errTareas) console.error('[crearRol] tareas de ' + nombre + ':', errTareas.message)
      else tareasCreadas = todasLasTareas.length
    }
  }
  return { rol, tareasCreadas }
}

/** Crea los roles que faltan según proyecto.roles_buscados. Devuelve los roles creados. */
export async function crearRolesDesdeBuscados(supabase, proyecto, fundadorId) {
  if (!proyecto?.id || !(proyecto.roles_buscados || []).length) return []
  const { data: existentes, error } = await supabase
    .from('roles').select('nombre, tipo_aporte').eq('proyecto_id', proyecto.id)
  if (error) throw new Error(error.message)
  const creados = []
  for (const spec of rolesPorCrear(proyecto.roles_buscados, existentes, proyecto.capital_necesario)) {
    const { rol } = await crearRol(supabase, { proyecto_id: proyecto.id, fundador_id: fundadorId, ...spec })
    creados.push(rol)
  }
  return creados
}
