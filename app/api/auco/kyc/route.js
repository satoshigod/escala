
import { supabaseAdmin } from '@/lib/supabase-admin'// /api/auco/kyc
// Valida identidad usando AucoFace:
// - Foto del documento (cédula)
// - Selfie o video del usuario
// - Compara con IA y devuelve score de similitud
//
// Se llama antes de firmar el contrato de leasing
// para verificar que quien firma es quien dice ser

const AUCO_BASE = process.env.AUCO_ENV === 'production'
  ? 'https://api.auco.ai/v1.5/ext'
  : 'https://dev.auco.ai/v1.5/ext'

const AUCO_PRK = process.env.AUCO_PRK

// POST — iniciar proceso de validación de identidad AucoFace
export async function POST(request) {
  try {
    const body = await request.json()
    const { usuario_id, nombre, email, phone, cedula, tipo } = body

    if (!AUCO_PRK) {
      return Response.json({
        error: 'AUCO_PRK no configurada',
        modo: 'sin_auco'
      }, { status: 503 })
    }

    // Crear proceso AucoFace
    // Auco envía un link al usuario para que suba su cédula y selfie
    const aucoPayload = {
      name: nombre || 'Usuario Escala',
      email: email || '',
      phone: phone || '',           // +57XXXXXXXXXX
      document: cedula || '',       // número de cédula
      documentType: 'CC',           // Cédula de Ciudadanía Colombia
      notificationWhatsapp: !!phone, // notificar por WhatsApp si hay teléfono
      notificationEmail: !!email,
      // Campo para identificar en el webhook
      reference: `escala_usuario:${usuario_id}_tipo:${tipo || 'firma'}`,
      webhook: `${process.env.NEXT_PUBLIC_APP_URL || 'https://escala.network'}/api/auco/kyc/webhook`,
    }

    const res = await fetch(`${AUCO_BASE}/aucoface`, {
      method: 'POST',
      headers: {
        'Authorization': AUCO_PRK,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aucoPayload),
    })

    const data = await res.json()

    if (!res.ok) {
      return Response.json({ error: 'Error Auco KYC: ' + (data.message || JSON.stringify(data)) }, { status: 502 })
    }

    const aucoCode = data.code || data.data?.code
    const aucoUrl = data.url || data.data?.url

    // Guardar en perfil del usuario
    if (usuario_id) {
      await supabaseAdmin
        .from('perfiles')
        .update({
          auco_kyc_code: aucoCode,
          auco_kyc_estado: 'pendiente',
          updated_at: new Date().toISOString(),
        })
        .eq('id', usuario_id)
    }

    return Response.json({
      ok: true,
      auco_code: aucoCode,
      auco_url: aucoUrl,
      mensaje: `Proceso de validación iniciado. ${phone ? 'Recibirás un WhatsApp' : 'Recibirás un email'} con el link para subir tu cédula y selfie.`,
    })

  } catch (err) {
    console.error('Error /api/auco/kyc:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

// GET — consultar estado del KYC
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const usuario_id = searchParams.get('usuario_id')

  if (!AUCO_PRK) {
    return Response.json({ error: 'AUCO_PRK no configurada' }, { status: 503 })
  }

  if (!code && !usuario_id) {
    return Response.json({ error: 'Falta code o usuario_id' }, { status: 400 })
  }

  let aucoCode = code

  // Si no tienen el code, buscar en el perfil
  if (!aucoCode && usuario_id) {
    const { data: perfil } = await supabaseAdmin
      .from('perfiles')
      .select('auco_kyc_code, auco_kyc_estado')
      .eq('id', usuario_id)
      .single()
    aucoCode = perfil?.auco_kyc_code
    if (!aucoCode) {
      return Response.json({ kyc_estado: perfil?.auco_kyc_estado || 'sin_iniciar' })
    }
  }

  const res = await fetch(`${AUCO_BASE}/aucoface/${aucoCode}`, {
    headers: { 'Authorization': AUCO_PRK },
  })
  const data = await res.json()

  return Response.json({
    ok: res.ok,
    auco_code: aucoCode,
    estado: data.status,
    similitud: data.similarity,   // % de similitud cédula vs selfie
    aprobado: data.status === 'APPROVED',
    data,
  })
}
