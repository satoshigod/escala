// app/api/pagos/route.js
//
// POST /api/pagos — crear solicitud de pago
// GET  /api/pagos — mis solicitudes de pago

import { notificar } from '@/lib/notificaciones/notificar'
import { registrarAuditoria, calcularSaldo, tasaDelDia } from '@/lib/financiero/ledger'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return Response.json({ error: 'Sin autorización' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return Response.json({ error: 'No autenticado' }, { status: 401 })

    const {
      proyecto_id, beneficiario_id, wallet_origen_id,
      moneda, monto, concepto, descripcion,
      hito_id, postulacion_id,
    } = await request.json()

    if (!beneficiario_id || !wallet_origen_id || !moneda || !monto || !concepto) {
      return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }
    if (user.id === beneficiario_id) {
      return Response.json({ error: 'No puedes solicitarte un pago a ti mismo' }, { status: 400 })
    }

    // Verificar que el wallet pertenece al solicitante
    const { data: wallet } = await supabase
      .from('wallets')
      .select('id, estado, usuario_id')
      .eq('id', wallet_origen_id)
      .single()

    if (!wallet || wallet.usuario_id !== user.id) {
      return Response.json({ error: 'Wallet no válido' }, { status: 403 })
    }
    if (wallet.estado !== 'activo') {
      return Response.json({ error: 'Wallet suspendido o bloqueado' }, { status: 403 })
    }

    // Verificar saldo suficiente
    const saldo = await calcularSaldo(wallet_origen_id)
    if (saldo.disponible < parseFloat(monto)) {
      return Response.json({
        error: `Saldo insuficiente. Disponible: ${moneda} ${saldo.disponible.toLocaleString('es-CO')}`
      }, { status: 400 })
    }

    // Obtener tasa del día
    const tasa = await tasaDelDia(moneda)
    const monto_usd = parseFloat(monto) * parseFloat(tasa)

    // Crear la orden
    const idempotency_key = `pr_${user.id}_${Date.now()}`
    const { data: orden, error } = await supabase
      .from('payment_requests')
      .insert({
        proyecto_id: proyecto_id || null,
        solicitante_id: user.id,
        beneficiario_id,
        wallet_origen_id,
        moneda,
        monto: parseFloat(monto),
        monto_usd,
        tasa_cambio_creacion: parseFloat(tasa),
        concepto,
        descripcion,
        estado: 'pendiente',
        hito_id: hito_id || null,
        postulacion_id: postulacion_id || null,
        idempotency_key,
      })
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })

    // Auditoría
    await registrarAuditoria({
      operacion: 'pago.solicitado',
      entidad_tipo: 'payment_request',
      entidad_id: orden.id,
      usuario_id: user.id,
      proyecto_id,
      monto: parseFloat(monto),
      moneda,
      monto_usd,
      estado_nuevo: 'pendiente',
    })

    // Notificar al solicitante
    const { data: perfil } = await supabase.from('perfiles').select('email, nombre').eq('id', user.id).single()
    const { data: proyecto } = proyecto_id
      ? await supabase.from('proyectos').select('nombre').eq('id', proyecto_id).single()
      : { data: null }

    const fmt = (n) => `${moneda} ${parseFloat(n).toLocaleString('es-CO')}`

    if (perfil?.email) {
      await notificar('pago_solicitado', { id: user.id, email: perfil.email, nombre: perfil.nombre }, {
        monto_formateado: fmt(monto),
        proyecto_nombre: proyecto?.nombre || 'tu proyecto',
        orden_id: orden.id,
      }).catch(() => {})
    }

    // Notificar a admins
    const { data: admins } = await supabase.from('perfiles').select('id, email, nombre').eq('es_admin', true)
    for (const admin of admins || []) {
      await notificar('admin_pago_pendiente', { id: admin.id, email: admin.email, nombre: admin.nombre }, {
        solicitante_nombre: perfil?.nombre || 'Usuario',
        monto_formateado: fmt(monto),
        proyecto_nombre: proyecto?.nombre || 'sin proyecto',
        orden_id: orden.id,
      }).catch(() => {})
    }

    return Response.json({ orden }, { status: 201 })
  } catch (e) {
    console.error('[pagos POST]', e.message)
    return Response.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return Response.json({ error: 'Sin autorización' }, { status: 401 })

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return Response.json({ error: 'No autenticado' }, { status: 401 })

  const { data, error } = await supabase
    .from('payment_requests')
    .select(`
      *,
      proyectos ( nombre ),
      perfiles!payment_requests_beneficiario_id_fkey ( nombre, email )
    `)
    .or(`solicitante_id.eq.${user.id},beneficiario_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ordenes: data || [] })
}
