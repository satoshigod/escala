// /api/auco/firma
// Envía un contrato a Auco para firma electrónica
// Soporta: contrato de leasing, contrato de local, contrato de servicios
//
// Flujo:
// 1. Escala genera el texto del contrato (ya lo hace)
// 2. Esta API lo convierte en PDF base64 y lo envía a Auco
// 3. Auco notifica a los firmantes por email o WhatsApp
// 4. Cuando todos firman, Auco dispara el webhook → /api/auco/webhook
// 5. El webhook actualiza el estado del contrato en Escala

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Entorno: dev (stage) o producción
const AUCO_BASE = process.env.AUCO_ENV === 'production'
  ? 'https://api.auco.ai/v1.5/ext'
  : 'https://dev.auco.ai/v1.5/ext'

const AUCO_PRK = process.env.AUCO_PRK  // llave privada (prk_...)
const AUCO_PUK = process.env.AUCO_PUK  // llave pública  (puk_...)

export async function POST(request) {
  try {
    const body = await request.json()
    const { tipo, contrato_id, proyecto_id } = body

    if (!tipo || !contrato_id) {
      return Response.json({ error: 'Faltan tipo y contrato_id' }, { status: 400 })
    }

    if (!AUCO_PRK) {
      return Response.json({
        error: 'AUCO_PRK no configurada. Agrega AUCO_PRK en variables de entorno de Vercel.',
        modo: 'sin_auco'
      }, { status: 503 })
    }

    // Cargar datos del contrato según tipo
    let contrato, firmantes, nombre_doc

    if (tipo === 'leasing') {
      const { data } = await supabaseAdmin
        .from('contratos_leasing')
        .select('*, proyectos:proyecto_id(nombre)')
        .eq('id', contrato_id)
        .single()
      contrato = data
      nombre_doc = `Contrato Leasing ${contrato.tipo_equipo} ${contrato.marca} - ${contrato.numero_contrato}`
      firmantes = [
        {
          type: 'solicitante',
          name: contrato.nombre_beneficiaria,
          email: body.email_beneficiaria || '',
          phone: body.phone_beneficiaria || '',
          label: true,
        },
        ...(contrato.angel_id ? [{
          type: 'solicitante',
          name: body.nombre_angel || 'Angel Inversionista',
          email: body.email_angel || '',
          phone: body.phone_angel || '',
          label: true,
        }] : []),
      ]
    } else if (tipo === 'local') {
      const { data } = await supabaseAdmin
        .from('proyectos_local_comercial')
        .select('*, proyectos:proyecto_id(nombre, fundador_id, perfiles!fundador_id(nombre, email))')
        .eq('proyecto_id', proyecto_id)
        .single()
      contrato = data
      nombre_doc = `Contrato Local Comercial - ${contrato.proyectos?.nombre}`
      firmantes = [
        {
          type: 'solicitante',
          name: contrato.proyectos?.perfiles?.nombre || 'Operador',
          email: contrato.proyectos?.perfiles?.email || body.email_operador || '',
          phone: body.phone_operador || '',
          label: true,
        },
      ]
    } else if (tipo === 'servicios') {
      const { data } = await supabaseAdmin
        .from('contratos')
        .select('*, proyectos:proyecto_id(nombre), postulaciones!postulacion_id(postulante_id, perfiles!postulante_id(nombre, email))')
        .eq('id', contrato_id)
        .single()
      contrato = data
      nombre_doc = `Contrato Servicios - ${contrato.proyectos?.nombre} - ${contrato.numero}`
      firmantes = [
        {
          type: 'solicitante',
          name: body.nombre_fundador || 'Fundador',
          email: body.email_fundador || '',
          phone: body.phone_fundador || '',
          label: true,
        },
        {
          type: 'solicitante',
          name: contrato.postulaciones?.perfiles?.nombre || 'Especialista',
          email: contrato.postulaciones?.perfiles?.email || '',
          phone: body.phone_especialista || '',
          label: true,
        },
      ]
    } else {
      return Response.json({ error: 'tipo no válido: leasing | local | servicios' }, { status: 400 })
    }

    // Construir el texto del contrato como PDF embed
    // Auco acepta PDF en base64 via campo "document" (base64)
    // o via URL pública. Usamos el texto_contrato que ya generamos.
    const texto = contrato.texto_contrato || 'Contrato Escala'

    // Generar PDF simple con el texto (Auco también acepta HTML)
    // Por ahora enviamos como documento con variables de plantilla
    // En producción: usar plantilla pre-creada en Auco con el template

    const aucoPayload = {
      name: nombre_doc,
      message: 'Por favor firme el contrato de Escala. Puede hacerlo desde este enlace o por WhatsApp.',
      options: {
        whatsapp: true,         // firma disponible por WhatsApp
        camera: 'identification', // captura cédula + selfie
      },
      otpCode: true,            // código OTP de verificación
      signProfile: firmantes,
      // Referencia interna para el webhook
      custom: [`escala_tipo:${tipo}`, `escala_id:${contrato_id}`, `escala_proyecto:${proyecto_id}`],
      webhook: `${process.env.NEXT_PUBLIC_APP_URL || 'https://escala.network'}/api/auco/webhook`,
    }

    // Llamar a la API de Auco
    const aucoRes = await fetch(`${AUCO_BASE}/document`, {
      method: 'POST',
      headers: {
        'Authorization': AUCO_PRK,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aucoPayload),
    })

    const aucoData = await aucoRes.json()

    if (!aucoRes.ok) {
      console.error('Auco error:', aucoData)
      return Response.json({ error: 'Error en Auco: ' + (aucoData.message || JSON.stringify(aucoData)) }, { status: 502 })
    }

    // Guardar el código de Auco en el contrato
    const aucoCode = aucoData.code || aucoData.data?.code

    if (tipo === 'leasing') {
      await supabaseAdmin
        .from('contratos_leasing')
        .update({ auco_code: aucoCode, auco_url: aucoData.url, estado: 'pendiente_firma_auco' })
        .eq('id', contrato_id)
    } else if (tipo === 'servicios') {
      await supabaseAdmin
        .from('contratos')
        .update({ auco_code: aucoCode, auco_url: aucoData.url })
        .eq('id', contrato_id)
    }

    return Response.json({
      ok: true,
      auco_code: aucoCode,
      auco_url: aucoData.url,
      firmantes: firmantes.length,
      mensaje: `Contrato enviado a ${firmantes.length} firmante(s). Recibirán el link por email y WhatsApp.`,
    })

  } catch (err) {
    console.error('Error /api/auco/firma:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

// GET — consultar estado de un proceso en Auco
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  if (!code) return Response.json({ error: 'Falta code' }, { status: 400 })

  if (!AUCO_PUK) {
    return Response.json({ error: 'AUCO_PUK no configurada' }, { status: 503 })
  }

  const res = await fetch(`${AUCO_BASE}/document?code=${code}`, {
    headers: { 'Authorization': AUCO_PUK },
  })
  const data = await res.json()
  return Response.json(data)
}
