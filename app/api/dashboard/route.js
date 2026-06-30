import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

// GET — todo lo que necesita el dashboard, en una sola llamada desde el cliente.
// El servidor hace todas las consultas en paralelo internamente con Promise.all.
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')

  if (!userId) return Response.json({ error: 'Falta user_id' }, { status: 400 })

  try {
    // PASO 1 — consultas que no dependen de nada más, todas en paralelo
    const [perfilRes, todosProyectosRes, misPostulacionesRes] = await Promise.all([
      supabase.from('perfiles').select('*').eq('id', userId).single(),
      supabase.from('proyectos').select('*').eq('estado', 'activo').order('created_at', { ascending: false }),
      supabase.from('postulaciones')
        .select('*, perfiles:postulante_id ( nombre, ciudad, especialidad, pais ), roles ( nombre, proyecto_id )')
        .eq('postulante_id', userId)
    ])

    const perfil = perfilRes.data || null
    const todosProyectos = todosProyectosRes.data || []
    const misPostulaciones = misPostulacionesRes.data || []
    const misProyectos = todosProyectos.filter(p => p.fundador_id === userId)
    const misProyectoIds = misProyectos.map(p => p.id)

    // PASO 2 — todo lo que depende de "cuáles son mis proyectos", en paralelo entre sí
    let misAportes = []
    let postulacionesRecibidas = []
    let misTareas = []
    let misHitos = []
    let mensajesRecientes = []

    if (misProyectoIds.length > 0) {
      const [aportesRes, rolesRes, tareasRes, hitosRes, mensajesRes] = await Promise.all([
        supabase.from('aportes').select('*').in('proyecto_id', misProyectoIds),
        supabase.from('roles').select('id, nombre, proyecto_id').in('proyecto_id', misProyectoIds),
        supabase.from('tareas').select('*').in('proyecto_id', misProyectoIds).eq('estado', 'completada'),
        supabase.from('hitos').select('*').in('proyecto_id', misProyectoIds).eq('completado', false),
        supabase.from('mensajes').select('*, perfiles:autor_id ( nombre )').in('proyecto_id', misProyectoIds).order('created_at', { ascending: false }).limit(10)
      ])

      misAportes = (aportesRes.data || []).filter(a => a.aportante_id === userId)
      misTareas = tareasRes.data || []
      misHitos = hitosRes.data || []
      mensajesRecientes = mensajesRes.data || []

      const todosRoles = rolesRes.data || []
      const rolIds = todosRoles.map(r => r.id)

      if (rolIds.length > 0) {
        const { data: postsData } = await supabase
          .from('postulaciones')
          .select('*, perfiles:postulante_id ( nombre, ciudad, especialidad, pais ), roles!inner ( id, nombre, proyecto_id )')
          .in('rol_id', rolIds)

        const proyectoPorId = Object.fromEntries(misProyectos.map(p => [p.id, p.nombre]))
        postulacionesRecibidas = (postsData || []).map(p => ({
          ...p,
          rol_nombre: p.roles?.nombre,
          proyecto_id: p.roles?.proyecto_id,
          proyecto_nombre: proyectoPorId[p.roles?.proyecto_id] || ''
        })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      }
    }

    // PASO 3 — tareas asignadas a mí en CUALQUIER proyecto (no solo los míos), para la bandeja de trabajo
    const { data: tareasAsignadasAMi } = await supabase
      .from('tareas')
      .select('*, proyectos:proyecto_id ( nombre )')
      .eq('asignado_a', userId)
      .neq('estado', 'completada')
      .order('created_at', { ascending: false })

    // PASO 4 — construir la bandeja de trabajo unificada (lo que el usuario debe atender YA)
    const bandeja = []

    postulacionesRecibidas.filter(p => p.estado === 'pendiente').forEach(p => {
      bandeja.push({
        tipo: 'postulacion_pendiente',
        texto: 'Aprobar postulación de ' + (p.perfiles?.nombre || 'alguien') + ' al rol de ' + p.rol_nombre,
        href: '/admin',
        fecha: p.created_at,
        id: p.id
      })
    })

    ;(tareasAsignadasAMi || []).filter(t => t.estado === 'pendiente').slice(0, 5).forEach(t => {
      bandeja.push({
        tipo: 'tarea_pendiente',
        texto: t.nombre + ' en ' + (t.proyectos?.nombre || 'tu proyecto'),
        href: '/proyectos/' + t.proyecto_id + '/workspace/tareas',
        fecha: t.created_at,
        id: t.id
      })
    })

    misHitos.slice(0, 3).forEach(h => {
      bandeja.push({
        tipo: 'hito_pendiente',
        texto: 'Hito pendiente: ' + h.nombre,
        href: '/hitos',
        fecha: h.created_at,
        id: h.id
      })
    })

    bandeja.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

    // Notificaciones (formato compatible con el dashboard actual, para no romper el frontend existente)
    const notificaciones = []
    misPostulaciones.forEach(p => {
      if (p.estado === 'aceptada') notificaciones.push({ tipo: 'aceptado', texto: 'Te aceptaron en el rol de ' + (p.roles?.nombre || 'un rol'), fecha: p.updated_at || p.created_at, color: '#1D9E75', icon: '✅' })
      if (p.estado === 'rechazada') notificaciones.push({ tipo: 'rechazado', texto: 'No quedaste seleccionado para ' + (p.roles?.nombre || 'un rol'), fecha: p.updated_at || p.created_at, color: '#D85A30', icon: '✗' })
    })
    postulacionesRecibidas.filter(p => p.estado === 'pendiente').forEach(p => {
      notificaciones.push({ tipo: 'nueva_postulacion', texto: (p.perfiles?.nombre || 'Alguien') + ' se postuló al rol de ' + p.rol_nombre + ' en ' + p.proyecto_nombre, postulante_id: p.postulante_id, fecha: p.created_at, color: '#E8A020', icon: '📬' })
    })
    notificaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

    // PASO 5 — datos específicos por rol: impulsos para Ángel de Impulso
    const { data: misImpulsos } = await supabase
      .from('impulsos')
      .select('*, hitos:hito_id ( nombre, completado ), proyectos:proyecto_id ( nombre )')
      .eq('angel_id', userId)

    // Detección de qué vista mostrar — cruza rol_principal con especialidad de texto libre
    const especialidadLower = (perfil?.especialidad || '').toLowerCase()
    const esGerente = especialidadLower.includes('gerente') || especialidadLower.includes('project manager')
    const esAngelRol = perfil?.rol_principal === 'angel' || (misImpulsos && misImpulsos.length > 0)

    let vistaSugerida = 'especialista'
    if (esGerente) vistaSugerida = 'gerente'
    else if (esAngelRol) vistaSugerida = 'angel'
    else if (misProyectos.length > 0) vistaSugerida = 'fundador'

    // Carga de trabajo del equipo (para vista Gerente) — proyectos donde el usuario tiene rol de Gerente ACEPTADO,
    // no solo los que fundó. Una postulación aceptada con nombre de rol "Gerente de Proyecto" cuenta.
    const proyectosComoGerenteIds = [...new Set(
      misPostulaciones
        .filter(p => p.estado === 'aceptada' && (p.roles?.nombre || '').toLowerCase().includes('gerente'))
        .map(p => p.roles?.proyecto_id)
        .filter(Boolean)
    )]
    const proyectosGestionadosIds = [...new Set([...misProyectoIds, ...proyectosComoGerenteIds])]

    let cargaEquipo = []
    if (esGerente && proyectosGestionadosIds.length > 0) {
      const { data: todasTareasEquipo } = await supabase
        .from('tareas')
        .select('asignado_a, estado, proyectos:proyecto_id ( nombre ), perfiles:asignado_a ( nombre )')
        .in('proyecto_id', proyectosGestionadosIds)

      const porPersona = {}
      ;(todasTareasEquipo || []).forEach(t => {
        if (!t.asignado_a) return
        const nombre = t.perfiles?.nombre || 'Sin asignar'
        if (!porPersona[nombre]) porPersona[nombre] = { nombre, pendientes: 0, completadas: 0, proyecto: t.proyectos?.nombre || '' }
        if (t.estado === 'completada') porPersona[nombre].completadas++
        else porPersona[nombre].pendientes++
      })
      cargaEquipo = Object.values(porPersona).sort((a,b) => b.pendientes - a.pendientes)
    }

    const proyectosGestionados = todosProyectos.filter(p => proyectosGestionadosIds.includes(p.id))

    return Response.json({
      perfil,
      misProyectos,
      todosProyectos,
      misPostulaciones,
      misAportes,
      postulacionesRecibidas,
      tareasAsignadasAMi: tareasAsignadasAMi || [],
      misHitos,
      mensajesRecientes,
      bandeja,
      notificaciones,
      misImpulsos: misImpulsos || [],
      vistaSugerida,
      cargaEquipo,
      proyectosGestionados,
      contadores: {
        proyectos: misProyectos.length,
        tareas_pendientes: (tareasAsignadasAMi || []).filter(t => t.estado === 'pendiente').length,
        postulaciones_pendientes: postulacionesRecibidas.filter(p => p.estado === 'pendiente').length,
        hitos_pendientes: misHitos.length,
        roles_cubiertos: postulacionesRecibidas.filter(p => p.estado === 'aceptada').length,
      }
    })

  } catch (e) {
    return Response.json({ error: 'Error cargando dashboard: ' + e.message }, { status: 500 })
  }
}
