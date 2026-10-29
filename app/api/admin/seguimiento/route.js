// app/api/admin/seguimiento/route.js
//
// GET — a quién hay que escribirle hoy, con el enlace de WhatsApp y el mensaje listo.
// Solo admin. Existe porque casi nadie vuelve solo después del primer día y WhatsApp es
// el canal que sí llega (16 de 20 usuarios lo dejaron; 4 de 20 confirmaron el correo).
//
// Grupos: solicitudes de 10 Máquinas sin revisar, postulaciones sin respuesta, fundadores
// sin proyecto, proyectos sin roles, inversionistas sin actividad y registros sin rol.

import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
import { usuarioDesdeRequest } from '@/lib/auth'
import { enlaceWhatsApp } from '@/lib/whatsapp'
import { buscaInversion, rolLabel } from '@/lib/roles'

const DIA = 24 * 60 * 60 * 1000
const diasDesde = (fecha) => Math.max(0, Math.floor((Date.now() - new Date(fecha).getTime()) / DIA))
const primer = (n) => String(n || '').trim().split(/\s+/)[0] || ''
const esPrueba = (p) => /^qa[-\s]/i.test(p.nombre || '') || /^smoke@/i.test(p.email || '')

function contacto({ whatsapp, pais, email }, mensaje, asunto) {
  return {
    whatsapp_url: enlaceWhatsApp(whatsapp, pais, mensaje),
    email_url: email ? 'mailto:' + email + '?subject=' + encodeURIComponent(asunto) + '&body=' + encodeURIComponent(mensaje) : null,
    mensaje,
  }
}

export async function GET(req) {
  const { user, admin } = await usuarioDesdeRequest(req)
  if (!user) return NextResponse.json({ error: 'Inicia sesión' }, { status: 401 })
  if (!admin) return NextResponse.json({ error: 'Solo para el equipo de Escala' }, { status: 403 })

  try {
    const hace90 = new Date(Date.now() - 90 * DIA).toISOString()
    const [perfilesRes, proyectosRes, rolesRes, postulacionesRes, solicitudesRes] = await Promise.all([
      supabase.from('perfiles').select('id, nombre, email, whatsapp, pais, ciudad, rol_principal, created_at, es_admin').order('created_at', { ascending: false }),
      supabase.from('proyectos').select('id, nombre, fundador_id, estado, escenario, created_at, roles_buscados').order('created_at', { ascending: false }),
      supabase.from('roles').select('proyecto_id, estado'),
      supabase.from('postulaciones').select('id, estado, created_at, postulante_id, roles ( nombre, proyecto_id )').order('created_at', { ascending: false }),
      supabase.from('solicitudes_programa').select('id, nombre, celular, email, ciudad, tipo_equipo, score, estado, created_at, revisada_at').order('created_at', { ascending: false }),
    ])
    for (const r of [perfilesRes, proyectosRes, rolesRes, postulacionesRes, solicitudesRes]) {
      if (r.error) throw new Error(r.error.message)
    }

    const perfiles = perfilesRes.data || []
    const proyectos = proyectosRes.data || []
    const postulaciones = postulacionesRes.data || []
    const porId = new Map(perfiles.map(p => [p.id, p]))
    const yo = porId.get(user.id)
    const firma = primer(yo?.nombre) || 'el equipo'
    const reales = perfiles.filter(p => !p.es_admin && !esPrueba(p))
    const recientes = reales.filter(p => new Date(p.created_at) >= new Date(hace90))

    const conProyecto = new Set(proyectos.map(p => p.fundador_id))
    const conRolAbierto = new Set((rolesRes.data || []).filter(r => r.estado === 'abierto').map(r => r.proyecto_id))
    const sePostularon = new Set(postulaciones.map(p => p.postulante_id))
    const proyectoPorId = new Map(proyectos.map(p => [p.id, p]))
    const buscanCapital = proyectos.filter(p => p.estado === 'activo' && buscaInversion(p))

    // 1. Solicitudes al programa 10 Máquinas sin revisar
    const solicitudes = (solicitudesRes.data || [])
      .filter(s => !s.revisada_at && ['recibida', 'en_revision', 'info_pendiente', 'preaprobada'].includes(s.estado))
      .map(s => ({
        id: s.id,
        nombre: s.nombre,
        detalle: `${s.tipo_equipo || 'Equipo'} · ${s.ciudad || ''} · score ${s.score ?? '—'} · ${s.estado}`,
        dias: diasDesde(s.created_at),
        href: '/admin/programa',
        ...contacto({ whatsapp: s.celular, pais: 'Colombia', email: s.email },
          s.estado === 'preaprobada'
            ? `Hola ${primer(s.nombre)}, soy ${firma} de Escala. Tu solicitud al programa Las 10 Máquinas para la ${s.tipo_equipo || 'máquina'} quedó preaprobada. ¿Cuándo podemos visitar tu taller?`
            : `Hola ${primer(s.nombre)}, soy ${firma} de Escala. Recibimos tu solicitud al programa Las 10 Máquinas. ¿Tienes unos minutos para hablar de ella?`,
          'Tu solicitud a Las 10 Máquinas'),
      }))

    // 2. Postulaciones pendientes hace 3+ días: el que tiene que responder es el fundador
    const postulacionesSinRespuesta = postulaciones
      .filter(p => p.estado === 'pendiente' && diasDesde(p.created_at) >= 3)
      .map(p => {
        const proyecto = proyectoPorId.get(p.roles?.proyecto_id)
        const fundador = porId.get(proyecto?.fundador_id)
        const postulante = porId.get(p.postulante_id)
        if (!proyecto || !fundador || fundador.id === p.postulante_id) return null // se postuló a su propio proyecto
        const dias = diasDesde(p.created_at)
        return {
          id: p.id,
          nombre: fundador.nombre,
          detalle: `${postulante?.nombre || 'Alguien'} → ${p.roles?.nombre || 'rol'} en "${proyecto.nombre}"`,
          dias,
          href: '/mis-contratos',
          ...contacto(fundador,
            `Hola ${primer(fundador.nombre)}, soy ${firma} de Escala. ${postulante?.nombre || 'Alguien'} se postuló a ${p.roles?.nombre || 'un rol'} en "${proyecto.nombre}" hace ${dias} días y está esperando tu respuesta. ¿La revisamos?`,
            'Una postulación espera tu respuesta'),
        }
      })
      .filter(Boolean)

    // 3. Fundadores y empresas sin proyecto
    const fundadoresSinProyecto = recientes
      .filter(p => ['ideador', 'empresa'].includes(p.rol_principal) && !conProyecto.has(p.id))
      .map(p => ({
        id: p.id,
        nombre: p.nombre,
        detalle: `${rolLabel(p.rol_principal)} · ${[p.ciudad, p.pais].filter(Boolean).join(', ') || 'sin ciudad'}`,
        dias: diasDesde(p.created_at),
        href: '/perfil/' + p.id,
        ...contacto(p,
          `Hola ${primer(p.nombre)}, soy ${firma} de Escala. Vi que te registraste para armar tu proyecto. ¿Te ayudo a publicarlo? Toma 5 minutos y así te empiezan a llegar especialistas e inversionistas.`,
          'Tu proyecto en Escala'),
      }))

    // 4. Proyectos activos sin roles abiertos (nadie se puede postular)
    const proyectosSinRoles = proyectos
      .filter(p => p.estado === 'activo' && !['local_comercial', 'maquinaria'].includes(p.escenario) && !conRolAbierto.has(p.id))
      .map(p => {
        const fundador = porId.get(p.fundador_id)
        if (!fundador || fundador.es_admin) return null
        return {
          id: p.id,
          nombre: fundador.nombre,
          detalle: `"${p.nombre}" — publicado sin roles abiertos`,
          dias: diasDesde(p.created_at),
          href: '/proyectos/' + p.id,
          ...contacto(fundador,
            `Hola ${primer(fundador.nombre)}, soy ${firma} de Escala. Tu proyecto "${p.nombre.trim()}" ya está publicado, pero todavía no tiene roles abiertos, así que nadie se puede postular. ¿Qué perfil necesitas primero? Te ayudo a crearlo.`,
            'Tu proyecto en Escala'),
        }
      })
      .filter(Boolean)

    // 5. Inversionistas que no se han postulado a nada
    const inversionistas = recientes
      .filter(p => ['capitalista', 'angel'].includes(p.rol_principal) && !sePostularon.has(p.id))
      .map(p => {
        const oportunidades = buscanCapital.filter(x => x.fundador_id !== p.id)
        const ejemplos = oportunidades.slice(0, 2).map(x => x.nombre.trim()).join(' y ')
        return {
          id: p.id,
          nombre: p.nombre,
          detalle: `Inversionista · ${[p.ciudad, p.pais].filter(Boolean).join(', ') || 'sin ciudad'}`,
          dias: diasDesde(p.created_at),
          href: '/perfil/' + p.id,
          ...contacto(p,
            `Hola ${primer(p.nombre)}, soy ${firma} de Escala. Hoy hay ${oportunidades.length} proyectos buscando inversionista en Escala${ejemplos ? ', como ' + ejemplos : ''}. ¿Qué tipo de negocio te interesa? Te muestro los que encajan contigo.`,
            'Proyectos buscando inversionista en Escala'),
        }
      })

    // 6. Se registraron y no eligieron perfil (onboarding sin terminar)
    const sinRol = recientes
      .filter(p => !p.rol_principal && !conProyecto.has(p.id))
      .map(p => ({
        id: p.id,
        nombre: p.nombre,
        detalle: 'No terminó el registro (sin perfil elegido)',
        dias: diasDesde(p.created_at),
        href: '/perfil/' + p.id,
        ...contacto(p,
          `Hola ${primer(p.nombre)}, soy ${firma} de Escala. Vi que empezaste tu registro. ¿Qué estás buscando: capital, equipo o proyectos donde aportar? Te ayudo a arrancar.`,
          'Tu registro en Escala'),
      }))

    return NextResponse.json({
      ok: true,
      grupos: [
        { id: 'solicitudes', titulo: 'Solicitudes a Las 10 Máquinas sin revisar', items: solicitudes },
        { id: 'postulaciones', titulo: 'Postulaciones sin respuesta (3+ días)', items: postulacionesSinRespuesta },
        { id: 'fundadores', titulo: 'Fundadores sin proyecto', items: fundadoresSinProyecto },
        { id: 'sin_roles', titulo: 'Proyectos sin roles abiertos', items: proyectosSinRoles },
        { id: 'inversionistas', titulo: 'Inversionistas sin actividad', items: inversionistas },
        { id: 'sin_rol', titulo: 'Registros sin terminar', items: sinRol },
      ],
    })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
