// app/api/fondeos/route.js
//
// POST /api/fondeos — iniciar un fondeo (genera instrucciones de pago)
// GET  /api/fondeos — historial de fondeos del usuario

import { createClient } from '@supabase/supabase-js'
import { notificar } from '@/lib/notificaciones/notificar'
import { registrarAuditoria, obtenerOCrearWallet, tasaDelDia } from '@/lib/financiero/ledger'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

// Instrucciones de pago por proveedor
const INSTRUCCIONES_BREB = {
  banco: 'Bancolombia',
  tipo_cuenta: 'Corriente',
  numero: '394-829100-47',
  titular: 'Escala Network S.A.S.',
  nit: '901.234.567-8',
}

const DIRECCION_BINANCE_USDT = '0x742d35Cc6634C0532925a3b8D4C9B8D7f5e1234' // TRON TRC-20
const DIRECCION_BINANCE_USDC = '0x742d35Cc6634C0532925a3b8D4C9B8D7f5e5678' // ERC-20

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return Response.json({ error: 'Sin autorización' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return Response.json({ error: 'No autenticado' }, { status: 401 })

    const { proveedor, moneda, monto, pais } = await request.json()

    if (!proveedor || !moneda || !monto) {
      return Response.json({ error: 'Faltan campos: proveedor, moneda, monto' }, { status: 400 })
    }
    if (parseFloat(monto) <= 0) {
      return Response.json({ error: 'El monto debe ser mayor a 0' }, { status: 400 })
    }
    if (parseFloat(monto) > 50000000) {
      return Response.json({ error: 'Monto máximo por transacción: $50,000,000' }, { status: 400 })
    }

    // Validar combinación proveedor-moneda
    const combValidas = {
      breb: ['COP'],
      binance: ['USDT', 'USDC'],
    }
    if (!combValidas[proveedor]?.includes(moneda)) {
      return Response.json({
        error: `${proveedor} no soporta ${moneda}. Usa ${combValidas[proveedor]?.join(' o ')}`
      }, { status: 400 })
    }

    // Obtener o crear wallet
    const wallet = await obtenerOCrearWallet(user.id, moneda, pais)
    if (wallet.estado !== 'activo') {
      return Response.json({ error: 'Wallet suspendido o bloqueado' }, { status: 403 })
    }

    // Generar referencia única para BRE-B
    const referencia = `ESC-${Date.now().toString(36).toUpperCase()}`

    // Instrucciones según proveedor
    let instrucciones = null
    let direccion_crypto = null
    let expires_at = null

    if (proveedor === 'breb') {
      instrucciones = {
        ...INSTRUCCIONES_BREB,
        referencia,
        monto: parseFloat(monto),
        moneda: 'COP',
        nota: `Incluir exactamente la referencia ${referencia} en la descripción de la transferencia.`,
      }
      // BRE-B expira en 2 horas
      expires_at = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
    } else if (proveedor === 'binance') {
      direccion_crypto = moneda === 'USDT' ? DIRECCION_BINANCE_USDT : DIRECCION_BINANCE_USDC
      instrucciones = {
        red: moneda === 'USDT' ? 'TRC-20 (TRON)' : 'ERC-20 (Ethereum)',
        direccion: direccion_crypto,
        monto: parseFloat(monto),
        moneda,
        memo: referencia,
        nota: 'Verifica que estás enviando por la red correcta. Las transacciones a red incorrecta son irrecuperables.',
      }
      // Binance expira en 24 horas
      expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }

    // Obtener tasa del día
    const tasa = await tasaDelDia(moneda)

    // Crear el fondeo
    const { data: fondeo, error } = await supabase
      .from('fondeos')
      .insert({
        wallet_id: wallet.id,
        usuario_id: user.id,
        proveedor,
        moneda_origen: moneda,
        moneda_destino: moneda,
        monto_solicitado: parseFloat(monto),
        tasa_cambio: parseFloat(tasa),
        estado: 'instrucciones_enviadas',
        referencia_proveedor: referencia,
        instrucciones_pago: instrucciones,
        direccion_crypto,
        expires_at,
        idempotency_key: `fondeo_${user.id}_${referencia}`,
      })
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })

    // Registrar auditoría
    await registrarAuditoria({
      operacion: 'fondeo.iniciado',
      entidad_tipo: 'fondeo',
      entidad_id: fondeo.id,
      usuario_id: user.id,
      wallet_origen: `wallet:${wallet.id}`,
      monto: parseFloat(monto),
      moneda,
      estado_nuevo: 'instrucciones_enviadas',
    })

    // Notificar al usuario
    const { data: perfil } = await supabase.from('perfiles').select('email, nombre').eq('id', user.id).single()
    if (perfil?.email) {
      await notificar('fondeo_iniciado', { id: user.id, email: perfil.email, nombre: perfil.nombre }, {
        monto_formateado: new Intl.NumberFormat('es-CO', { style: 'currency', currency: moneda === 'COP' ? 'COP' : 'USD' }).format(monto),
        proveedor: proveedor.toUpperCase(),
      }).catch(() => {})
    }

    // Notificar al admin
    const { data: admins } = await supabase.from('perfiles').select('id, email, nombre').eq('es_admin', true)
    for (const admin of admins || []) {
      await notificar('fondeo_pendiente_admin', { id: admin.id, email: admin.email, nombre: admin.nombre }, {
        usuario_nombre: perfil?.nombre || 'Usuario',
        monto_formateado: `${moneda} ${parseFloat(monto).toLocaleString('es-CO')}`,
        proveedor: proveedor.toUpperCase(),
      }).catch(() => {})
    }

    return Response.json({ fondeo, instrucciones }, { status: 201 })
  } catch (e) {
    console.error('[fondeos POST]', e.message)
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
    .from('fondeos')
    .select('*')
    .eq('usuario_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ fondeos: data || [] })
}
