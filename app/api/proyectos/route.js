import { notificar, avisarAdmin } from '../../../lib/notificaciones/notificar'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { crearRolesDesdeBuscados } from '../../../lib/rolesProyecto'
import { buscaInversion, formatoCapital } from '../../../lib/roles'

const BASE_URL = 'https://escala.network'

// Monto pedido por el fundador: entero >= 0 (null si no vino en el body)
function montoCapital(valor) {
  if (valor === undefined || valor === null || valor === '') return null
  const n = Math.round(Number(String(valor).replace(/[^0-9.]/g, '')))
  return Number.isFinite(n) && n >= 0 ? n : null
}

// Los chips "perfiles que busco" se vuelven roles abiertos (sin esto el proyecto queda
// publicado sin nada a qué postularse). Un fallo aquí no tumba la creación del proyecto.
async function asegurarRoles(proyecto, fundadorId) {
  try {
    await crearRolesDesdeBuscados(supabase, proyecto, fundadorId)
  } catch (e) {
    console.error('[proyectos] crear roles desde chips:', e.message)
  }
}

// Proyecto publicado que pide inversionista → avisar a los inversionistas de Escala
async function avisarInversionistas(proyecto, fundadorId) {
  if (!buscaInversion(proyecto)) return
  try {
    const { data: inversionistas, error } = await supabase
      .from('perfiles').select('id, email, nombre')
      .in('rol_principal', ['capitalista', 'angel'])
      .neq('id', fundadorId)
    if (error) throw new Error(error.message)
    if (!inversionistas?.length) return
    await notificar('inversion_proyecto_nuevo', inversionistas, {
      proyecto_nombre: proyecto.nombre,
      proyecto_id: proyecto.id,
      lugar: [proyecto.ciudad, proyecto.pais].filter(Boolean).join(', '),
      monto: formatoCapital(proyecto.capital_necesario, proyecto.pais),
    })
  } catch (e) {
    console.error('[proyectos] avisar inversionistas:', e.message)
  }
}

// GET — listar proyectos activos
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get('tipo')
  const sector = searchParams.get('sector')

  let query = supabase
    .from('proyectos')
    .select(`
      *,
      perfiles ( nombre, ciudad ),
      roles ( id, nombre, estado, es_prioritario, tipo_aporte )
    `)
    .eq('estado', 'activo')
    .order('created_at', { ascending: false })

  if (tipo) query = query.eq('tipo', tipo)
  if (sector) query = query.eq('sector', sector)

  const { data, error } = await query

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ proyectos: data })
}

// POST — crear nuevo proyecto
export async function POST(request) {
  const body = await request.json()
  const { nombre, descripcion, tipo, sector, ciudad, fundador_id, industria, pais, estado, estado_financiacion, nivel_avance, modalidad_trabajo, roles_buscados, capital_necesario } = body

  if (!nombre || !descripcion || !tipo || !fundador_id) {
    return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('proyectos')
    .insert([{ nombre, descripcion, tipo, sector, ciudad, fundador_id, industria: industria || null, pais: pais || null, estado: estado || 'borrador', estado_financiacion: estado_financiacion || 'riesgo_compartido', nivel_avance: nivel_avance || null, modalidad_trabajo: modalidad_trabajo || null, roles_buscados: roles_buscados || [], capital_necesario: montoCapital(capital_necesario) || 0 }])
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  await asegurarRoles(data, fundador_id)

  const { data: fundador } = await supabase.from('perfiles').select('nombre, email').eq('id', fundador_id).single()

  // Avisar al admin de todo proyecto nuevo, también en borrador: un borrador que nunca
  // se publica es un fundador al que hay que llamar.
  await avisarAdmin('admin_proyecto_nuevo', {
    proyecto_nombre: data.nombre,
    proyecto_id: data.id,
    fundador_nombre: fundador?.nombre,
    lugar: [data.ciudad, data.pais].filter(Boolean).join(', '),
    estado: data.estado,
  }, { actorId: fundador_id })

  // Notificar al fundador — solo si quedó publicado (no en borrador)
  if (data.estado !== 'borrador') {
    try {
      if (fundador?.email) {
        await notificar('proyecto_publicado', { id: fundador_id, email: fundador.email }, {
          fundador_nombre: fundador.nombre,
          proyecto_nombre: data.nombre,
          proyecto_id: data.id,
          proyecto_url: BASE_URL + '/proyectos/' + data.id,
        })
      }
    } catch (e) {
      console.error('Error notificando proyecto publicado:', e.message)
    }
    await avisarInversionistas(data, fundador_id)
  }

  return Response.json({ proyecto: data }, { status: 201 })
}

// PATCH — actualizar datos del proyecto o marcarlo como completado
export async function PATCH(request) {
  try {
    const body = await request.json()
    const { id, fundador_id, estado, nombre, descripcion, sector, ciudad, pais, industria, nivel_avance, modalidad_trabajo, roles_buscados, capital_necesario } = body

    if (!id || !fundador_id) return Response.json({ error: 'Faltan id y fundador_id' }, { status: 400 })

    // Verificar ownership
    const { data: proyecto, error: projError } = await supabase
      .from('proyectos').select('fundador_id, nombre, estado').eq('id', id).single()

    if (projError || !proyecto) return Response.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    if (proyecto.fundador_id !== fundador_id) return Response.json({ error: 'Solo el fundador puede editar este proyecto' }, { status: 403 })

    // Construir campos a actualizar
    const updates = {}
    if (nombre) updates.nombre = nombre
    if (descripcion) updates.descripcion = descripcion
    if (sector) updates.sector = sector
    if (ciudad) updates.ciudad = ciudad
    if (pais) updates.pais = pais
    if (industria) updates.industria = industria
    if (nivel_avance) updates.nivel_avance = nivel_avance
    if (modalidad_trabajo) updates.modalidad_trabajo = modalidad_trabajo
    if (roles_buscados) updates.roles_buscados = roles_buscados
    if (montoCapital(capital_necesario) !== null) updates.capital_necesario = montoCapital(capital_necesario)
    if (estado) updates.estado = estado

    const { data, error } = await supabase
      .from('proyectos').update(updates).eq('id', id).select().single()

    if (error) return Response.json({ error: error.message }, { status: 500 })

    // Chips nuevos → roles abiertos (nunca borra los que ya existen)
    if (roles_buscados) await asegurarRoles(data, fundador_id)

    // Notificar según el tipo de cambio
    const { data: fundador } = await supabase.from('perfiles').select('nombre, email').eq('id', fundador_id).single()
    const dest = { id: fundador_id, email: fundador?.email, nombre: fundador?.nombre }

    if (estado === 'completado' && proyecto.estado !== 'completado') {
      // Notificar a todo el equipo — solo las postulaciones aceptadas en roles de ESTE
      // proyecto (antes tomaba las aceptadas de todos los proyectos de Escala)
      const { data: rolesProyecto } = await supabase.from('roles').select('id').eq('proyecto_id', id)
      const rolIds = (rolesProyecto || []).map(r => r.id)
      const { data: miembros } = rolIds.length ? await supabase
        .from('postulaciones')
        .select('postulante_id, perfiles!postulaciones_postulante_id_fkey(id, email, nombre)')
        .eq('estado', 'aceptada')
        .in('rol_id', rolIds) : { data: [] }

      const todos = [dest, ...(miembros || []).map(m => m.perfiles).filter(p => p?.email && p.id !== fundador_id)]
      await Promise.allSettled(todos.map(d =>
        notificar('proyecto_completado', d, { proyecto_nombre: data.nombre, proyecto_id: id })
      ))

      // Logro: primer proyecto completado para cada miembro
      const { otorgarLogro } = await import('@/lib/logros')
      await Promise.allSettled(todos.map(d =>
        otorgarLogro(supabase, d.id, 'primer_proyecto_completado', id)
      ))

    } else if (estado === 'activo' && proyecto.estado === 'borrador') {
      // Proyecto publicado por primera vez — notificar al fundador
      await notificar('proyecto_publicado', dest, {
        fundador_nombre: fundador?.nombre,
        proyecto_nombre: data.nombre,
        proyecto_id: id,
        proyecto_url: BASE_URL + '/proyectos/' + id,
      }).catch(() => {})

      await avisarAdmin('admin_proyecto_publicado', {
        proyecto_nombre: data.nombre,
        proyecto_id: id,
        fundador_nombre: fundador?.nombre,
      }, { actorId: fundador_id })
      await avisarInversionistas(data, fundador_id)

    } else if (Object.keys(updates).some(k => k !== 'estado')) {
      // Actualización de datos — notificar solo al fundador
      await notificar('proyecto_actualizado', dest, {
        proyecto_nombre: data.nombre,
        proyecto_id: id,
      }).catch(() => {})
    }

    return Response.json({ proyecto: data })
  } catch(e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const fundador_id = searchParams.get('fundador_id')

    if (!id) return Response.json({ error: 'Se requiere id del proyecto' }, { status: 400 })
    if (!fundador_id) return Response.json({ error: 'Se requiere fundador_id' }, { status: 400 })

    // Verificar que el solicitante es el fundador
    const { data: proyecto } = await supabase
      .from('proyectos').select('fundador_id, nombre').eq('id', id).single()

    if (!proyecto) return Response.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    if (proyecto.fundador_id !== fundador_id) {
      return Response.json({ error: 'Solo el fundador puede eliminar este proyecto' }, { status: 403 })
    }

    const { error } = await supabase.from('proyectos').delete().eq('id', id)
    if (error) throw error

    return Response.json({ ok: true, mensaje: 'Proyecto eliminado: ' + proyecto.nombre })
  } catch(e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
