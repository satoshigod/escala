// lib/financiero/ledger.js
//
// Motor central del ledger de doble partida.
// NUNCA modificar ni eliminar entradas existentes.
// Toda operación genera exactamente 2 entradas: débito + crédito.
//
// Uso:
//   import { registrarMovimiento, calcularSaldo } from '@/lib/financiero/ledger'

import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

// Obtener tasa de cambio del día para una moneda
export async function tasaDelDia(moneda) {
  const { data } = await supabase
    .from('exchange_rates')
    .select('tasa_usd')
    .eq('moneda', moneda)
    .lte('fecha', new Date().toISOString().split('T')[0])
    .order('fecha', { ascending: false })
    .limit(1)
    .single()
  return data?.tasa_usd || 1
}

// Calcular saldo de un wallet desde el ledger
export async function calcularSaldo(walletId) {
  const cuenta = `wallet:${walletId}`

  const { data: creditos } = await supabase
    .from('ledger_entries')
    .select('monto, monto_usd')
    .eq('cuenta_destino', cuenta)
    .eq('tipo', 'credito')

  const { data: debitos } = await supabase
    .from('ledger_entries')
    .select('monto, monto_usd')
    .eq('cuenta_origen', cuenta)
    .eq('tipo', 'debito')

  const totalCreditos = (creditos || []).reduce((s, e) => s + parseFloat(e.monto), 0)
  const totalDebitos = (debitos || []).reduce((s, e) => s + parseFloat(e.monto), 0)
  const totalCreditosUsd = (creditos || []).reduce((s, e) => s + parseFloat(e.monto_usd), 0)
  const totalDebitosUsd = (debitos || []).reduce((s, e) => s + parseFloat(e.monto_usd), 0)

  return {
    disponible: totalCreditos - totalDebitos,
    disponible_usd: totalCreditosUsd - totalDebitosUsd,
  }
}

// Registrar movimiento en el ledger (doble partida)
// Siempre genera 2 entradas: una de origen y una de destino
export async function registrarMovimiento({
  tipo_referencia,  // 'fondeo', 'pago', 'comision', 'reversal'
  referencia_id,    // UUID del fondeo/pago que origina el movimiento
  cuenta_origen,    // 'wallet:uuid' o nombre de cuenta sistema
  cuenta_destino,   // 'wallet:uuid' o nombre de cuenta sistema
  monto,
  moneda,
  descripcion,
  idempotency_key,
  created_by = null,
  metadata = {},
}) {
  // Verificar idempotencia — si ya existe, retornar el resultado anterior
  const { data: existente } = await supabase
    .from('ledger_entries')
    .select('id, referencia_id')
    .eq('idempotency_key', idempotency_key)
    .maybeSingle()

  if (existente) {
    console.log(`[ledger] Operación idempotente — ya existe: ${idempotency_key}`)
    return { ok: true, idempotente: true, id: existente.id }
  }

  // Obtener tasa de cambio del día
  const tasa = await tasaDelDia(moneda)
  const monto_usd = parseFloat(monto) * parseFloat(tasa)

  // Calcular saldos antes para auditoría rápida
  let balance_antes = null
  let balance_despues = null
  if (cuenta_origen.startsWith('wallet:')) {
    const walletId = cuenta_origen.replace('wallet:', '')
    const saldo = await calcularSaldo(walletId)
    balance_antes = saldo.disponible
    balance_despues = saldo.disponible - parseFloat(monto)
  }

  // Insertar las 2 entradas de doble partida en una sola transacción
  const entradas = [
    {
      tipo: 'debito',
      cuenta_origen,
      cuenta_destino,
      monto: parseFloat(monto),
      moneda,
      monto_usd,
      tasa_usd: parseFloat(tasa),
      referencia_tipo: tipo_referencia,
      referencia_id,
      descripcion,
      idempotency_key: `${idempotency_key}_db`,
      balance_antes,
      balance_despues,
      metadata,
      created_by,
    },
    {
      tipo: 'credito',
      cuenta_origen,
      cuenta_destino,
      monto: parseFloat(monto),
      moneda,
      monto_usd,
      tasa_usd: parseFloat(tasa),
      referencia_tipo: tipo_referencia,
      referencia_id,
      descripcion,
      idempotency_key: `${idempotency_key}_cr`,
      balance_antes: null,
      balance_despues: null,
      metadata,
      created_by,
    },
  ]

  const { data, error } = await supabase
    .from('ledger_entries')
    .insert(entradas)
    .select('id')

  if (error) {
    console.error('[ledger] Error registrando movimiento:', error.message)
    throw new Error(`Ledger error: ${error.message}`)
  }

  return { ok: true, ids: data.map(d => d.id), monto_usd }
}

// Registrar auditoría financiera
export async function registrarAuditoria({
  operacion,
  entidad_tipo,
  entidad_id,
  usuario_id = null,
  administrador_id = null,
  wallet_origen = null,
  wallet_destino = null,
  proyecto_id = null,
  monto = null,
  moneda = null,
  monto_usd = null,
  estado_anterior = null,
  estado_nuevo = null,
  ip = null,
  user_agent = null,
  observaciones = null,
  metadata = {},
}) {
  const { error } = await supabase
    .from('financial_audit')
    .insert({
      operacion,
      entidad_tipo,
      entidad_id,
      usuario_id,
      administrador_id,
      wallet_origen,
      wallet_destino,
      proyecto_id,
      monto,
      moneda,
      monto_usd,
      estado_anterior,
      estado_nuevo,
      ip,
      user_agent,
      observaciones,
      metadata,
    })

  if (error) {
    console.error('[auditoria] Error registrando:', error.message)
    // No bloquear el flujo por fallo de auditoría
  }
}

// Obtener o crear wallet para usuario+moneda
export async function obtenerOCrearWallet(usuario_id, moneda, pais = null) {
  const { data: existente } = await supabase
    .from('wallets')
    .select('id, estado')
    .eq('usuario_id', usuario_id)
    .eq('moneda', moneda)
    .maybeSingle()

  if (existente) return existente

  const { data, error } = await supabase
    .from('wallets')
    .insert({ usuario_id, moneda, pais })
    .select('id, estado')
    .single()

  if (error) throw new Error(`Error creando wallet: ${error.message}`)
  return data
}
