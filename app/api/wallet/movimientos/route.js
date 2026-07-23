import { supabaseAdmin as supabase } from '@/lib/supabase-admin'
// app/api/wallet/movimientos/route.js
//
// GET /api/wallet/movimientos — historial de movimientos del ledger del usuario
// Parámetros: ?wallet_id=X&moneda=COP&limit=20&offset=0&tipo=entrada|salida

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return Response.json({ error: 'Sin autorización' }, { status: 401 })

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return Response.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const wallet_id = searchParams.get('wallet_id')
  const moneda = searchParams.get('moneda')
  const tipo = searchParams.get('tipo') // 'entrada' | 'salida' | null
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  // Obtener wallets del usuario
  let walletQuery = supabase
    .from('wallets')
    .select('id')
    .eq('usuario_id', user.id)

  if (wallet_id) walletQuery = walletQuery.eq('id', wallet_id)
  if (moneda) walletQuery = walletQuery.eq('moneda', moneda)

  const { data: wallets } = await walletQuery
  if (!wallets?.length) return Response.json({ movimientos: [], total: 0 })

  const cuentas = wallets.map(w => `wallet:${w.id}`)

  // Construir query del ledger
  let query = supabase
    .from('ledger_entries')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (tipo === 'entrada') {
    query = query.in('cuenta_destino', cuentas).eq('tipo', 'credito')
  } else if (tipo === 'salida') {
    query = query.in('cuenta_origen', cuentas).eq('tipo', 'debito')
  } else {
    // Todos los movimientos que involucran las cuentas del usuario
    query = query.or(
      `cuenta_destino.in.(${cuentas.map(c => `"${c}"`).join(',')}),` +
      `cuenta_origen.in.(${cuentas.map(c => `"${c}"`).join(',')})`
    )
  }

  const { data: movimientos, count, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Enriquecer cada movimiento con el tipo de operación desde el punto de vista del usuario
  const enriquecidos = (movimientos || []).map(m => {
    const esEntrada = cuentas.some(c => m.cuenta_destino === c) && m.tipo === 'credito'
    return {
      ...m,
      direccion: esEntrada ? 'entrada' : 'salida',
    }
  })

  return Response.json({ movimientos: enriquecidos, total: count || 0 })
}
