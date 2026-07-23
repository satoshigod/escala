// app/api/fondeos/webhook/route.js
//
// POST /api/fondeos/webhook — recibe confirmaciones de BRE-B y Binance
// Protegido con firma HMAC-SHA256 en el header x-webhook-signature
//
// Flujo:
//   1. Proveedor envía webhook con datos de la transacción
//   2. Verificar firma HMAC
//   3. Encontrar el fondeo por referencia
//   4. Validar monto y estado
//   5. Registrar en ledger (doble partida)
//   6. Actualizar estado del fondeo
//   7. Notificar al usuario
//   8. Disparar evento en motor Escala si aplica

import { createHmac } from 'crypto'
import { notificar } from '@/lib/notificaciones/notificar'
import { registrarMovimiento, registrarAuditoria, calcularSaldo } from '@/lib/financiero/ledger'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

function verificarFirma(body, signature, secret) {
  const hmac = createHmac('sha256', secret)
  hmac.update(body)
  const expected = hmac.digest('hex')
  return expected === signature
}

export async function POST(request) {
  try {
    const rawBody = await request.text()
    const payload = JSON.parse(rawBody)

    // Detectar proveedor por header
    const proveedor = request.headers.get('x-proveedor') ||
      (request.headers.get('x-breb-signature') ? 'breb' : 'binance')

    // Verificar firma
    const firma = request.headers.get('x-webhook-signature') ||
      request.headers.get('x-breb-signature') ||
      request.headers.get('x-binance-signature')

    const secret = proveedor === 'breb'
      ? process.env.BREB_WEBHOOK_SECRET
      : process.env.BINANCE_WEBHOOK_SECRET

    if (secret && firma) {
      const firmaValida = verificarFirma(rawBody, firma, secret)
      if (!firmaValida) {
        console.error('[webhook] Firma inválida — posible ataque')
        await registrarAuditoria({
          operacion: 'webhook.firma_invalida',
          entidad_tipo: 'fondeo',
          entidad_id: '00000000-0000-0000-0000-000000000000',
          metadata: { proveedor, payload },
        })
        return Response.json({ error: 'Firma inválida' }, { status: 401 })
      }
    }

    // Extraer datos del payload según proveedor
    let referencia, monto_recibido, estado_proveedor, hash_tx = null

    if (proveedor === 'breb') {
      referencia = payload.referencia || payload.reference
      monto_recibido = parseFloat(payload.valor || payload.amount || 0)
      estado_proveedor = payload.estado || payload.status
    } else {
      referencia = payload.memo || payload.tag
      monto_recibido = parseFloat(payload.amount || 0)
      estado_proveedor = payload.status
      hash_tx = payload.txHash || payload.hash
    }

    if (!referencia) {
      return Response.json({ error: 'Referencia no encontrada en el payload' }, { status: 400 })
    }

    // Encontrar el fondeo
    const { data: fondeo, error: fondeoError } = await supabase
      .from('fondeos')
      .select('*, wallets(usuario_id, moneda)')
      .eq('referencia_proveedor', referencia)
      .maybeSingle()

    if (fondeoError || !fondeo) {
      console.error('[webhook] Fondeo no encontrado:', referencia)
      return Response.json({ error: 'Fondeo no encontrado' }, { status: 404 })
    }

    // Verificar que no esté ya procesado (idempotencia)
    if (fondeo.estado === 'completado') {
      console.log('[webhook] Fondeo ya procesado:', fondeo.id)
      return Response.json({ ok: true, mensaje: 'Ya procesado' })
    }

    // Verificar que no haya expirado
    if (fondeo.expires_at && new Date(fondeo.expires_at) < new Date()) {
      await supabase.from('fondeos').update({ estado: 'expirado' }).eq('id', fondeo.id)
      return Response.json({ error: 'Fondeo expirado' }, { status: 400 })
    }

    // Verificar estado del proveedor
    const estadosExitosos = ['completado', 'confirmed', 'success', 'SUCCESS', 'CONFIRMED', 'PAID']
    if (!estadosExitosos.includes(estado_proveedor)) {
      await supabase
        .from('fondeos')
        .update({ estado: 'fallido', razon_fallo: `Estado proveedor: ${estado_proveedor}` })
        .eq('id', fondeo.id)

      const { data: perfil } = await supabase
        .from('perfiles').select('email, nombre').eq('id', fondeo.wallets.usuario_id).single()
      if (perfil?.email) {
        await notificar('fondeo_fallido', { id: fondeo.wallets.usuario_id, email: perfil.email, nombre: perfil.nombre }, {
          monto_formateado: `${fondeo.moneda_origen} ${fondeo.monto_solicitado.toLocaleString('es-CO')}`,
          razon: `Estado del proveedor: ${estado_proveedor}`,
        }).catch(() => {})
      }
      return Response.json({ ok: true, estado: 'fallido' })
    }

    // ACREDITAR — registrar en el ledger
    const cuenta_puente = proveedor === 'breb' ? 'puente_breb' : 'puente_binance'
    const monto_final = monto_recibido || fondeo.monto_solicitado

    const ledgerResult = await registrarMovimiento({
      referencia_tipo: 'fondeo',
      referencia_id: fondeo.id,
      cuenta_origen: cuenta_puente,
      cuenta_destino: `wallet:${fondeo.wallet_id}`,
      monto: monto_final,
      moneda: fondeo.moneda_destino,
      descripcion: `Fondeo ${proveedor.toUpperCase()} — Ref: ${referencia}`,
      idempotency_key: `fondeo_acreditado_${fondeo.id}`,
      created_by: null,
    })

    // Comision Escala 3% sobre el fondeo recibido
    const comision_escala = Math.round(monto_final * 0.03)
    await supabase.from('ledger_entries').insert({
      tipo: 'debito',
      referencia_tipo: 'comision_escala',
      referencia_id: fondeo.id,
      cuenta_origen: `wallet:${fondeo.wallet_id}`,
      cuenta_destino: 'escala:comisiones',
      monto: comision_escala,
      monto_usd: comision_escala / 4200,

      tasa_usd: 1 / 4200,
      moneda: 'COP',
      descripcion: `Comision Escala 3% fondeo ${proveedor.toUpperCase()} ref ${referencia}`,
      idempotency_key: `comision-fondeo-webhook-${fondeo.id}`,
      metadata: { comision_escala },
    }).catch(() => {})

    // Actualizar estado del fondeo
    await supabase
      .from('fondeos')
      .update({
        estado: 'completado',
        monto_recibido: monto_final,
        monto_neto: monto_final,
        hash_tx,
        confirmado_at: new Date().toISOString(),
        acreditado_at: new Date().toISOString(),
      })
      .eq('id', fondeo.id)

    // Calcular nuevo saldo
    const saldo = await calcularSaldo(fondeo.wallet_id)

    // Registrar auditoría
    await registrarAuditoria({
      operacion: 'fondeo.completado',
      entidad_tipo: 'fondeo',
      entidad_id: fondeo.id,
      usuario_id: fondeo.wallets.usuario_id,
      wallet_origen: cuenta_puente,
      wallet_destino: `wallet:${fondeo.wallet_id}`,
      monto: monto_final,
      moneda: fondeo.moneda_destino,
      monto_usd: ledgerResult.monto_usd,
      estado_anterior: fondeo.estado,
      estado_nuevo: 'completado',
    })

    // Notificar al usuario
    const { data: perfil } = await supabase
      .from('perfiles').select('email, nombre').eq('id', fondeo.wallets.usuario_id).single()

    if (perfil?.email) {
      const fmt = (n) => new Intl.NumberFormat('es-CO').format(n)
      const moneda = fondeo.moneda_destino

      await Promise.all([
        notificar('fondeo_completado', { id: fondeo.wallets.usuario_id, email: perfil.email, nombre: perfil.nombre }, {
          monto_formateado: `${moneda} ${fmt(monto_final)}`,
          saldo_formateado: `${moneda} ${fmt(saldo.disponible)}`,
        }),
        notificar('wallet_fondeo_acreditado', { id: fondeo.wallets.usuario_id, email: perfil.email, nombre: perfil.nombre }, {
          monto_formateado: `${moneda} ${fmt(monto_final)}`,
          saldo_formateado: `${moneda} ${fmt(saldo.disponible)}`,
        }),
      ]).catch(() => {})
    }

    console.log(`[webhook] Fondeo completado: ${fondeo.id} — ${monto_final} ${fondeo.moneda_destino}`)
    return Response.json({ ok: true, estado: 'completado', monto_acreditado: monto_final })

  } catch (e) {
    console.error('[webhook] Error:', e.message)
    return Response.json({ error: e.message }, { status: 500 })
  }
}
