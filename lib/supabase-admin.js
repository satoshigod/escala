// lib/supabase-admin.js
//
// Cliente unico de Supabase para el servidor (service role).
//
// Antes cada ruta API creaba el suyo: 67 de 70 repetian el mismo bloque. El
// costo real no era la repeticion sino que cualquier cambio de patron exigia
// tocar 67 archivos — y que un mismo error se multiplicara por copia-pega.
// Paso de verdad: 10 inserts al ledger en 6 archivos usaban la columna
// equivocada, no pasaban tasa_usd y mandaban un enum invalido. Ninguna
// comision de Escala se registro nunca, y fallaba en silencio.
//
// IMPORTANTE: este cliente usa la SERVICE ROLE KEY, que IGNORA RLS. Solo debe
// importarse desde rutas API o codigo de servidor, NUNCA desde un componente
// del navegador. Para el cliente esta lib/supabase.js, que usa la clave
// publica y si respeta RLS.

import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  // En el servidor no hay sesion que refrescar ni que persistir: es la
  // configuracion correcta y la que ya usaban 8 rutas por su cuenta.
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Alias para las rutas que ya nombraban su cliente `supabase`.
export const supabase = supabaseAdmin

export default supabaseAdmin
