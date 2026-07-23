// app/api/admin/financiero/route.js
//
// GET   /api/admin/financiero          — todas las órdenes con filtros
// PATCH /api/admin/financiero          — aprobar | rechazar | ejecutar | reversar

import { notificar } from '@/lib/notificaciones/notificar'
import { registrarMovimiento, registrarAuditoria, calcularSaldo, tasaDelDia } from '@/lib/financiero/ledger'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

async function verificarAdmin(token) {
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  const { data: perfil } = await supabase.from('perfiles').select('es_admin').eq('id', user.id).single()
  if (!perfil?.es_admin) return null
  return user
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return Response.json({ error: 'Sin autorización' }, { status: 401 })

  const admin = await verificarAdmin(authHeader.replace('Bearer ', ''))
  if (!admin) return Response.json({ error: 'Acceso solo para administradores' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const estado = searchParams.get('estado')
  const proyecto_id = searchParams.get('proyecto_id')
  const usuario_id = searchParams.get('usuario_id')
  const moneda = searchParams.get('moneda')
  const desde = searchParams.get('desde')
  const hasta = searchParams.get('hasta')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  let query = supabase
    .from('payment_requests')
    .select(`
      *,
      proyectos ( nombre ),
      solicitante:perfiles!payment_requests_solicitante_id_fkey ( nombre, email ),
      beneficiario:perfiles!payment_requests_beneficiario_id_fkey ( nombre, email ),
      wallets!payment_requests_wallet_origen_id_fkey ( moneda, usuario_id )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (estado) query = query.eq('estado', estado)
  if (proyecto_id) query = query.eq('proyecto_id', proyecto_id)
  if (usuario_id) query = query.eq('solicitante_id', usuario_id)
  if (moneda) query = query.eq('moneda', moneda)
  if (desde) query = query.gte('created_at', desde)
  if (hasta) query = query.lte('created_at', hasta)

  const { data: ordenes, count, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })

  // KPIs del panel
  const { data: kpis } = await supabase
    .from('payment_requests')
    .select('estado, monto_usd')

  const resumen = {
    total_pagado_usd: (kpis || []).filter(k => k.estado === 'pagada').reduce((s, k) => s + parseFloat(k.monto_usd || 0), 0),
    pendientes: (kpis || []).filter(k => k.estado === 'pendiente').length,
    en_revision: (kpis || []).filter(k => k.estado === 'en_revision').length,
    aprobadas: (kpis || []).filter(k => k.estado === 'aprobada').length,
  }

  return Response.json({ ordenes: ordenes || [], total: count || 0, resumen })
}

export async function PATCH(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return Response.json({ error: 'Sin autorización' }, { status: 401 })

  const admin = await verificarAdmin(authHeader.replace('Bearer ', ''))
  if (!admin) return Response.json({ error: 'Acceso solo para administradores' }, { status: 403 })

  const { orden_id, accion, razon, comprobante_url, numero_referencia, observaciones, metodo_pago } = await request.json()
  if (!orden_id || !accion) return Response.json({ error: 'Faltan orden_id y accion' }, { status: 400 })

  const accionesValidas = ['aprobar', 'rechazar', 'ejecutar', 'reversar', 'en_revision']
  if (!accionesValidas.includes(accion)) {
    return Response.json({ error: `Acción inválida. Usa: ${accionesValidas.join(', ')}` }, { status: 400 })
  }

  // Obtener la orden
  const { data: orden, error: ordenError } = await supabase
    .from('payment_requests')
    .select('*, wallets!payment_requests_wallet_origen_id_fkey(moneda, usuario_id)')
    .eq('id', orden_id)
    .single()

  if (ordenError || !orden) return Response.json({ error: 'Orden no encontrada' }, { status: 404 })

  // Validar transiciones de estado
  const transicionesValidas = {
    en_revision: ['pendiente'],
    aprobar: ['pendiente', 'en_revision'],
    rechazar: ['pendiente', 'en_revision'],
    ejecutar: ['aprobada'],
    reversar: ['pagada'],
  }
  if (!transicionesValidas[accion]?.includes(orden.estado)) {
    return Response.json({
      error: `No se puede ${accion} una orden en estado "${orden.estado}"`
    }, { status: 400 })
  }

  const estadoMap = {
    en_revision: 'en_revision',
    aprobar: 'aprobada',
    rechazar: 'rechazada',
    ejecutar: 'pagada',
    reversar: 'reversada',
  }
  const estado_nuevo = estadoMap[accion]
  const estado_anterior = orden.estado

  // Construir update
  const update = {
    estado: estado_nuevo,
    updated_at: new Date().toISOString(),
    observaciones_admin: observaciones || orden.observaciones_admin,
  }

  if (accion === 'rechazar') {
    update.rechazado_por = admin.id
    update.razon_rechazo = razon
  }
  if (accion === 'aprobar') {
    update.aprobado_por = admin.id
    update.aprobado_at = new Date().toISOString()
  }
  if (accion === 'ejecutar') {
    if (!comprobante_url && !numero_referencia) {
      return Response.json({ error: 'Se requiere comprobante o número de referencia para ejecutar' }, { status: 400 })
    }
    update.ejecutado_por = admin.id
    update.ejecutado_at = new Date().toISOString()
    update.comprobante_url = comprobante_url
    update.numero_referencia = numero_referencia
    update.metodo_pago_externo = metodo_pago || 'transferencia'

    // Obtener tasa al momento de ejecución
    const tasa = await tasaDelDia(orden.moneda)
    update.tasa_cambio_ejecucion = parseFloat(tasa)
    update.monto_ejecutado = orden.monto
  }
  if (accion === 'reversar') {
    update.reversado_por = admin.id
    update.reversado_at = new Date().toISOString()
  }

  // Actualizar la orden
  const { data: ordenActualizada, error: updateError } = await supabase
    .from('payment_requests')
    .update(update)
    .eq('id', orden_id)
    .select()
    .single()

  if (updateError) return Response.json({ error: updateError.message }, { status: 500 })

  // Si se ejecuta el pago → registrar en ledger
  if (accion === 'ejecutar') {
    const tasa = await tasaDelDia(orden.moneda)
    await registrarMovimiento({
      referencia_tipo: 'pago',
      referencia_id: orden.id,
      cuenta_origen: `wallet:${orden.wallet_origen_id}`,
      cuenta_destino: 'pagos_externos',
      monto: orden.monto,
      moneda: orden.moneda,
      descripcion: `Pago ejecutado — ${orden.concepto} — Ref: ${numero_referencia || 'N/A'}`,
      idempotency_key: `pago_ejecutado_${orden.id}`,
      created_by: admin.id,
    })
  }

  // Si se reversa → registrar reversal en ledger
  if (accion === 'reversar') {
    await registrarMovimiento({
      referencia_tipo: 'reversal',
      referencia_id: orden.id,
      cuenta_origen: 'pagos_externos',
      cuenta_destino: `wallet:${orden.wallet_origen_id}`,
      monto: orden.monto,
      moneda: orden.moneda,
      descripcion: `Reversal de pago — ${orden.concepto}`,
      idempotency_key: `reversal_${orden.id}`,
      created_by: admin.id,
    })
  }

  // Auditoría
  await registrarAuditoria({
    operacion: `pago.${accion}`,
    entidad_tipo: 'payment_request',
    entidad_id: orden.id,
    usuario_id: orden.solicitante_id,
    administrador_id: admin.id,
    proyecto_id: orden.proyecto_id,
    monto: orden.monto,
    moneda: orden.moneda,
    estado_anterior,
    estado_nuevo,
    observaciones,
  })

  // Notificar al solicitante
  const { data: solicitante } = await supabase
    .from('perfiles').select('email, nombre').eq('id', orden.solicitante_id).single()
  const fmt = (n) => `${orden.moneda} ${parseFloat(n).toLocaleString('es-CO')}`

  const eventosNotif = {
    en_revision: 'pago_en_revision',
    aprobar: 'pago_aprobado',
    rechazar: 'pago_rechazado',
    ejecutar: 'pago_ejecutado',
    reversar: 'pago_reversado',
  }

  if (solicitante?.email && eventosNotif[accion]) {
    await notificar(eventosNotif[accion], {
      id: orden.solicitante_id,
      email: solicitante.email,
      nombre: solicitante.nombre,
    }, {
      monto_formateado: fmt(orden.monto),
      orden_id: orden.id,
      razon: razon || '',
      numero_referencia: numero_referencia || '',
    }).catch(() => {})
  }

  // Si es pago ejecutado → también notificar al beneficiario y disparar evento en motor Escala
  if (accion === 'ejecutar') {
    const { data: beneficiario } = await supabase
      .from('perfiles').select('id, email, nombre').eq('id', orden.beneficiario_id).single()

    if (beneficiario?.email) {
      await notificar('pago_ejecutado', {
        id: beneficiario.id,
        email: beneficiario.email,
        nombre: beneficiario.nombre,
      }, {
        monto_formateado: fmt(orden.monto),
        orden_id: orden.id,
        numero_referencia: numero_referencia || '',
      }).catch(() => {})
    }

    // Notificar débito del wallet del solicitante (crítica)
    const saldo = await calcularSaldo(orden.wallet_origen_id)
    if (solicitante?.email) {
      await notificar('wallet_debito_ejecutado', {
        id: orden.solicitante_id,
        email: solicitante.email,
        nombre: solicitante.nombre,
      }, {
        monto_formateado: fmt(orden.monto),
        numero_referencia: numero_referencia || orden.id,
        saldo_formateado: fmt(saldo.disponible),
      }).catch(() => {})
    }

    // PUENTE CON MOTOR ESCALA: si el pago está asociado a un hito, disparar cumplimiento_confirmado
    if (orden.postulacion_id) {
      await notificar('cumplimiento_confirmado', {
        id: orden.beneficiario_id,
        email: beneficiario?.email,
        nombre: beneficiario?.nombre,
      }, {
        proyecto_id: orden.proyecto_id,
        monto_formateado: fmt(orden.monto),
      }).catch(() => {})
    }

    // PUENTE CON MOTOR ESCALA: si es el primer pago del proyecto, disparar primera_venta
    if (orden.proyecto_id) {
      const { count } = await supabase
        .from('payment_requests')
        .select('id', { count: 'exact', head: true })
        .eq('proyecto_id', orden.proyecto_id)
        .eq('estado', 'pagada')
      if (count === 1) {
        const { data: proyecto } = await supabase.from('proyectos').select('nombre, fundador_id, perfiles!proyectos_fundador_id_fkey(email, nombre)').eq('id', orden.proyecto_id).single()
        if (proyecto?.perfiles?.email) {
          await notificar('primera_venta', {
            id: proyecto.fundador_id,
            email: proyecto.perfiles.email,
            nombre: proyecto.perfiles.nombre,
          }, {
            proyecto_nombre: proyecto.nombre,
            proyecto_id: orden.proyecto_id,
            valor_formateado: fmt(orden.monto),
          }).catch(() => {})
        }
      }
    }
  }

  return Response.json({ orden: ordenActualizada })
}
