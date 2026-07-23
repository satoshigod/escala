// app/api/wallet/route.js
//
// GET /api/wallet — devuelve todos los wallets del usuario con saldos calculados
// POST /api/wallet — crear wallet para una moneda nueva

import { calcularSaldo, obtenerOCrearWallet } from '@/lib/financiero/ledger'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return Response.json({ error: 'Sin autorización' }, { status: 401 })

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return Response.json({ error: 'No autenticado' }, { status: 401 })

  // Obtener todos los wallets del usuario
  const { data: wallets, error } = await supabase
    .from('wallets')
    .select('id, moneda, estado, pais, created_at')
    .eq('usuario_id', user.id)
    .eq('estado', 'activo')
    .order('created_at', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Calcular saldo de cada wallet desde el ledger
  const walletsConSaldo = await Promise.all(
    (wallets || []).map(async (w) => {
      const saldo = await calcularSaldo(w.id)

      // Obtener saldo comprometido (órdenes aprobadas pendientes)
      const { data: comprometido } = await supabase
        .from('payment_requests')
        .select('monto')
        .eq('wallet_origen_id', w.id)
        .in('estado', ['aprobada'])

      const saldo_comprometido = (comprometido || []).reduce(
        (s, p) => s + parseFloat(p.monto), 0
      )

      // Obtener saldo pendiente (fondeos en proceso)
      const { data: pendientes } = await supabase
        .from('fondeos')
        .select('monto_solicitado')
        .eq('wallet_id', w.id)
        .in('estado', ['iniciado', 'instrucciones_enviadas', 'pendiente_confirmacion', 'validando'])

      const saldo_pendiente = (pendientes || []).reduce(
        (s, f) => s + parseFloat(f.monto_solicitado), 0
      )

      return {
        ...w,
        saldo_disponible: saldo.disponible,
        saldo_disponible_usd: saldo.disponible_usd,
        saldo_comprometido,
        saldo_pendiente,
        saldo_total: saldo.disponible + saldo_pendiente,
      }
    })
  )

  return Response.json({ wallets: walletsConSaldo })
}

export async function POST(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return Response.json({ error: 'Sin autorización' }, { status: 401 })

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return Response.json({ error: 'No autenticado' }, { status: 401 })

  const { moneda, pais } = await request.json()
  if (!moneda) return Response.json({ error: 'Falta moneda' }, { status: 400 })

  try {
    const wallet = await obtenerOCrearWallet(user.id, moneda, pais)
    return Response.json({ wallet }, { status: 201 })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
