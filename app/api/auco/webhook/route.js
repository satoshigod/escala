
import { supabaseAdmin } from '@/lib/supabase-admin'// /api/auco/webhook
// Recibe notificaciones de Auco cuando un contrato cambia de estado
//
// Estados posibles de Auco:
// CREATE   → proceso creado, esperando firmas
// FINISH   → todos firmaron ✅
// EXPIRED  → venció el plazo
// BLOCKED  → un firmante fue bloqueado
// REJECTED → un firmante rechazó

export async function POST(request) {
  try {
    const payload = await request.json()

    const { code, status, name, url, custom } = payload

    console.log('Auco webhook:', { code, status, name })

    // Extraer datos de Escala desde el campo custom
    // Formato: ['escala_tipo:leasing', 'escala_id:uuid', 'escala_proyecto:uuid']
    let tipo, contrato_id, proyecto_id
    if (Array.isArray(custom)) {
      custom.forEach(c => {
        if (c.startsWith('escala_tipo:')) tipo = c.replace('escala_tipo:', '')
        if (c.startsWith('escala_id:')) contrato_id = c.replace('escala_id:', '')
        if (c.startsWith('escala_proyecto:')) proyecto_id = c.replace('escala_proyecto:', '')
      })
    }

    if (!tipo || !contrato_id) {
      // Webhook de Auco sin datos de Escala — ignorar
      return Response.json({ ok: true, ignorado: true })
    }

    // Mapear estado de Auco a estado de Escala
    const mapEstado = {
      CREATE: 'pendiente_firma_auco',
      FINISH: 'activo',           // ✅ todos firmaron
      EXPIRED: 'expirado',
      BLOCKED: 'bloqueado',
      REJECTED: 'rechazado',
    }

    const estadoEscala = mapEstado[status] || status.toLowerCase()
    const firmadoAuco = status === 'FINISH'

    if (tipo === 'leasing') {
      await supabaseAdmin
        .from('contratos_leasing')
        .update({
          estado: estadoEscala,
          firmado_auco: firmadoAuco,
          auco_url_firmado: firmadoAuco ? url : null,
          fecha_firma_auco: firmadoAuco ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('auco_code', code)

      // Si todos firmaron, notificar a ambas partes
      if (firmadoAuco) {
        const { data: contrato } = await supabaseAdmin
          .from('contratos_leasing')
          .select('*, proyectos:proyecto_id(nombre)')
          .eq('auco_code', code)
          .single()

        if (contrato) {
          // Notificar admin
          const { data: admins } = await supabaseAdmin
            .from('perfiles').select('id').eq('es_admin', true)
          if (admins?.length) {
            await supabaseAdmin.from('notificaciones').insert(admins.map(a => ({
              destinatario_id: a.id,
              tipo: 'contrato_leasing_firmado',
              titulo: 'Contrato de leasing firmado por todas las partes',
              mensaje: `El contrato ${contrato.numero_contrato} para ${contrato.tipo_equipo} ${contrato.marca} fue firmado. URL: ${url}`,
              data: { contrato_id: contrato.id, auco_url: url },
              leida: false,
            })))
          }

          // Notificar beneficiaria
          if (contrato.beneficiaria_id) {
            await supabaseAdmin.from('notificaciones').insert({
              destinatario_id: contrato.beneficiaria_id,
              tipo: 'contrato_leasing_firmado',
              titulo: '¡Tu contrato de leasing está firmado!',
              mensaje: `El contrato para tu ${contrato.tipo_equipo} ${contrato.marca} fue firmado por todas las partes. Puedes descargarlo aquí: ${url}`,
              data: { contrato_id: contrato.id, auco_url: url },
              leida: false,
            })
          }
        }
      }

    } else if (tipo === 'servicios') {
      await supabaseAdmin
        .from('contratos')
        .update({
          auco_firmado: firmadoAuco,
          auco_url_firmado: firmadoAuco ? url : null,
          updated_at: new Date().toISOString(),
        })
        .eq('auco_code', code)
    }

    return Response.json({ ok: true, status: estadoEscala, tipo, contrato_id })

  } catch (err) {
    console.error('Error webhook Auco:', err)
    // Siempre responder 200 a Auco para evitar reintentos
    return Response.json({ ok: true, error: err.message })
  }
}
