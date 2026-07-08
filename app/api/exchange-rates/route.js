// app/api/exchange-rates/route.js
//
// GET  /api/exchange-rates          — tasas del día para todas las monedas
// POST /api/exchange-rates (admin)  — actualizar tasa del día

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function GET() {
  const hoy = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('exchange_rates')
    .select('moneda, tasa_usd, fecha, fuente')
    .lte('fecha', hoy)
    .order('moneda')
    .order('fecha', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Una tasa por moneda (la más reciente)
  const tasas = {}
  for (const row of data || []) {
    if (!tasas[row.moneda]) tasas[row.moneda] = row
  }

  // Calcular tasas cruzadas contra COP para conveniencia
  const cop = tasas['COP']?.tasa_usd || 0.000245
  const tasasConCop = Object.entries(tasas).reduce((acc, [moneda, tasa]) => {
    acc[moneda] = {
      ...tasa,
      tasa_cop: cop > 0 ? (tasa.tasa_usd / cop) : null,
    }
    return acc
  }, {})

  return Response.json({ tasas: tasasConCop, actualizado: hoy })
}

export async function POST(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return Response.json({ error: 'Sin autorización' }, { status: 401 })

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return Response.json({ error: 'No autenticado' }, { status: 401 })

  const { data: perfil } = await supabase.from('perfiles').select('es_admin').eq('id', user.id).single()
  if (!perfil?.es_admin) return Response.json({ error: 'Solo administradores' }, { status: 403 })

  const { moneda, tasa_usd, fuente = 'manual' } = await request.json()
  if (!moneda || !tasa_usd) return Response.json({ error: 'Faltan moneda y tasa_usd' }, { status: 400 })

  const fecha = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('exchange_rates')
    .upsert({ moneda, tasa_usd, fuente, fecha, created_by: user.id }, { onConflict: 'moneda,fecha' })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ tasa: data })
}
