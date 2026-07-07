import { createClient } from '@supabase/supabase-js'
import { notificar } from '../../../lib/notificaciones/notificar'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const BASE_URL = 'https://escala.network'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const rol_id = searchParams.get('rol_id')
  const postulante_id = searchParams.get('postulante_id')
  const proyecto_id = searchParams.get('proyecto_id')
  const fundador_id = searchParams.get('fundador_id')
  let query = supabase
    .from('postulaciones')
    .select('*, perfiles ( nombre, ciudad, pais, rol_principal, escala_score, especialidad, whatsapp ), roles!inner ( nombre, proyecto_id, proyectos!inner ( nombre, sector, ciudad, fundador_id, estado_financiacion ) )')
  if (rol_id) query = query.eq('rol_id', rol_id)
  if (postulante_id) query = query.eq('postulante_id', postulante_id)
  if (proyecto_id) query = query.eq('roles.proyecto_id', proyecto_id)
  if (fundador_id) query = query.eq('roles.proyectos.fundador_id', fundador_id)
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ postulaciones: data })
}

export async function POST(request) {
  const body = await request.json()
  const { rol_id, postulante_id, mensaje, origen } = body
  if (!rol_id || !postulante_id) return Response.json({ error: 'Faltan campos' }, { status: 400 })

  const { data, error } = await supabase
    .from('postulaciones')
    .insert([{ rol_id, postulante_id, mensaje, origen: origen || 'postulante' }])
    .select('*, perfiles ( nombre, email ), roles ( nombre, proyecto_id, proyectos ( nombre, fundador_id, perfiles ( nombre, email ) ) )')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Notificación al fundador — solo si fue el postulante quien aplicó. Si fue el fundador
  // quien creó la oferta (invitación), no tiene sentido notificarlo de su propia acción;
  // el correo de invitación ya se envía por separado desde /invitar.
  if (origen !== 'fundador') try {
    const fundador_id = data.roles?.proyectos?.fundador_id
    const fundador_email = data.roles?.proyectos?.perfiles?.email
    const fundador_nombre = data.roles?.proyectos?.perfiles?.nombre || 'Fundador'
    const postulante_nombre = data.perfiles?.nombre || 'Alguien'
    const rol_nombre = data.roles?.nombre || 'un rol'
    const proyecto_nombre = data.roles?.proyectos?.nombre || 'tu proyecto'

    if (fundador_id || fundador_email) {
      await notificar('nueva_postulacion', { id: fundador_id, email: fundador_email }, {
        fundador_nombre,
        postulante_nombre,
        rol_nombre,
        proyecto_nombre,
        postulante_id,
        perfil_url: BASE_URL + '/perfil/' + postulante_id,
      })
    }
  } catch (e) {
    console.error('Error notificando nueva postulacion:', e)
  }

  return Response.json({ postulacion: data }, { status: 201 })
}

export async function PATCH(request) {
  const body = await request.json()
  const { id, estado, cumplio, cumplio_confirmado_por, forma_pago, valor, concepto } = body
  if (!id) return Response.json({ error: 'Falta id' }, { status: 400 })

  const updates = {}
  if (estado) updates.estado = estado
  if (typeof cumplio === 'boolean') {
    updates.cumplio = cumplio
    updates.cumplio_confirmado_por = cumplio_confirmado_por || null
    updates.cumplio_confirmado_en = new Date().toISOString()
  }
  if (forma_pago) updates.forma_pago = forma_pago

  const { data, error } = await supabase
    .from('postulaciones')
    .update(updates)
    .eq('id', id)
    .select('*, perfiles ( nombre, email ), roles ( nombre, proyecto_id, proyectos ( nombre, estado_financiacion ) )')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Notificación al postulante
  try {
    const postulante_email = data.perfiles?.email
    const postulante_nombre = data.perfiles?.nombre || 'Usuario'
    const rol_nombre = data.roles?.nombre || 'el rol'
    const proyecto_nombre = data.roles?.proyectos?.nombre || 'el proyecto'
    const proyecto_id = data.roles?.proyecto_id

    if (data.postulante_id && (estado === 'aceptada' || estado === 'rechazada')) {
      await notificar(
        estado === 'aceptada' ? 'postulacion_aceptada' : 'postulacion_rechazada',
        { id: data.postulante_id, email: postulante_email },
        {
          postulante_nombre,
          rol_nombre,
          proyecto_nombre,
          proyecto_id,
          workspace_url: BASE_URL + '/proyectos/' + proyecto_id + '/workspace',
          proyectos_url: BASE_URL + '/proyectos',
        }
      )
    }

    // Generar contrato automáticamente al aceptar
    if (estado === 'aceptada' && data.roles?.proyectos?.fundador_id) {
      try {
        await fetch(BASE_URL + '/api/contratos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postulacion_id: data.id,
            fundador_id: data.roles.proyectos.fundador_id,
          })
        })
      } catch (e) {
        console.error('Error generando contrato:', e.message)
      }

      // Otorgar logro: primera postulación aceptada
      fetch(BASE_URL + '/api/logros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: data.postulante_id,
          tipo: 'primera_postulacion_aceptada',
          proyecto_id,
        })
      }).catch(() => {})
    }
  } catch (e) {
    console.error('Error notificando cambio de postulacion:', e)
  }

  // Cumplimiento confirmado — notifica y, si el proyecto está en Riesgo Compartido, registra la deuda
  if (typeof cumplio === 'boolean') {
    try {
      const postulante_email = data.perfiles?.email
      const postulante_nombre = data.perfiles?.nombre || 'Usuario'
      const rol_nombre = data.roles?.nombre || 'el rol'
      const proyecto_nombre = data.roles?.proyectos?.nombre || 'el proyecto'
      const proyecto_id = data.roles?.proyecto_id
      const estadoFin = data.roles?.proyectos?.estado_financiacion || 'riesgo_compartido'

      if (cumplio === true && forma_pago && estadoFin === 'riesgo_compartido' && (forma_pago === 'acciones' || forma_pago === 'pasivo')) {
        await supabase.from('deuda_pendiente').insert([{
          proyecto_id,
          postulacion_id: data.id,
          beneficiario_id: data.postulante_id,
          concepto: concepto || (rol_nombre + ' — ' + proyecto_nombre),
          valor: valor || 0,
          forma_pago,
        }])
      }

      if (data.postulante_id) {
        const forma_pago_labels = { cash: 'pago en efectivo', acciones: 'convertible en acciones', pasivo: 'deuda como pasivo de la empresa' }
        await notificar('cumplimiento_confirmado', { id: data.postulante_id, email: postulante_email }, {
          postulante_nombre,
          proyecto_nombre,
          proyecto_id,
          cumplio,
          forma_pago_label: forma_pago_labels[forma_pago] || forma_pago || '',
          workspace_url: BASE_URL + '/proyectos/' + proyecto_id + '/workspace',
        })
      }
    } catch (e) {
      console.error('Error procesando cumplimiento/deuda:', e.message)
    }
  }

  return Response.json({ postulacion: data })
}
