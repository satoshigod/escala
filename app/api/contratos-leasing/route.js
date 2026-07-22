import { createClient } from '@supabase/supabase-js'
import { crearOrdenPago } from '@/lib/financiero/custodia'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// GET — obtener contrato de leasing de un proyecto
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const proyecto_id = searchParams.get('proyecto_id')
  const id = searchParams.get('id')

  let query = supabaseAdmin.from('contratos_leasing').select('*')
  if (proyecto_id) query = query.eq('proyecto_id', proyecto_id)
  if (id) query = query.eq('id', id)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ contratos: data || [] })
}

// POST — crear contrato de leasing
export async function POST(request) {
  const body = await request.json()
  const {
    proyecto_id, beneficiaria_id,
    tipo_equipo, marca, modelo, serial, valor_equipo, descripcion_equipo,
    pct_excedente, excedente_estimado, opcion_compra, meses_estimados, abono_mensual_estimado,
    nombre_beneficiaria, cedula_beneficiaria, direccion_beneficiaria, ciudad,
  } = body

  if (!proyecto_id || !beneficiaria_id || !tipo_equipo || !valor_equipo) {
    return Response.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  // Verificar que no exista ya
  const { data: existente } = await supabaseAdmin
    .from('contratos_leasing')
    .select('id, estado')
    .eq('proyecto_id', proyecto_id)
    .maybeSingle()

  if (existente) return Response.json({ contrato: existente, existia: true, ok: true })

  const numeroContrato = 'CL-' + Date.now().toString().slice(-8)
  const textoContrato = generarTextoContratoLeasing({
    numero: numeroContrato, nombre_beneficiaria, cedula_beneficiaria, ciudad,
    tipo_equipo, marca, modelo, serial, valor_equipo, pct_excedente,
    excedente_estimado, meses_estimados, opcion_compra, fecha: new Date().toLocaleDateString('es-CO'),
  })

  const { data: contrato, error } = await supabaseAdmin
    .from('contratos_leasing')
    .insert({
      proyecto_id,
      beneficiaria_id,
      numero_contrato: numeroContrato,
      tipo_equipo, marca, modelo, serial,
      valor_equipo: parseFloat(valor_equipo),
      descripcion_equipo,
      pct_excedente: parseFloat(pct_excedente),
      excedente_estimado: parseFloat(excedente_estimado),
      opcion_compra,
      meses_estimados,
      abono_mensual_estimado,
      nombre_beneficiaria, cedula_beneficiaria, ciudad, direccion_beneficiaria,
      estado: 'pendiente_angel',
      firmado_beneficiaria: true,
      fecha_firma_beneficiaria: new Date().toISOString(),
      capital_pendiente: parseFloat(valor_equipo),
      capital_abonado: 0,
      texto_contrato: textoContrato,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Notificar al admin (Ivan) que hay un contrato pendiente de aprobar
  try {
    const { data: admins } = await supabaseAdmin.from('perfiles').select('id').eq('es_admin', true)
    if (admins?.length) {
      await supabaseAdmin.from('notificaciones').insert(admins.map(a => ({
        destinatario_id: a.id,
        tipo: 'contrato_leasing_pendiente',
        titulo: 'Contrato de leasing para aprobar',
        mensaje: `${nombre_beneficiaria} firmó un contrato de leasing para ${tipo_equipo} ${marca} por $${parseFloat(valor_equipo).toLocaleString('es-CO')} COP. Revisa y aprueba en el panel de admin.`,
        data: { contrato_id: contrato.id, proyecto_id },
        leida: false,
      })))
    }
  } catch (e) { console.error('Error notificando admin:', e) }

  return Response.json({ ok: true, contrato })
}

// PATCH — actualizar estado del contrato (el angel aprueba, reportes de ventas, etc.)
export async function PATCH(request) {
  const body = await request.json()
  const { id, ...updates } = body

  if (!id) return Response.json({ error: 'Falta id' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('contratos_leasing')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // CUSTODIA: cuando el inversionista firma y el contrato queda activo, nace la
  // obligacion de que el inversionista le pague a Escala el valor del equipo.
  // Escala custodia ese dinero y compra la maquina (el receptor es externo: el
  // proveedor/distribuidor), por eso receptor_id va null y lo confirma el admin.
  if (updates.estado === 'activo' && updates.firmado_angel && data?.angel_id && data?.valor_equipo > 0) {
    try {
      await crearOrdenPago({
        tipo_flujo: 'compra_maquina',
        proyecto_id: data.proyecto_id || null,
        pagador_id: data.angel_id,
        receptor_id: null,
        receptor_externo: `Proveedor del equipo — ${data.tipo_equipo || 'equipo'} ${data.marca || ''} ${data.modelo || ''}`.trim(),
        monto: parseFloat(data.valor_equipo),
        moneda: 'COP',
        concepto: `Compra de ${data.tipo_equipo || 'equipo'} ${data.marca || ''} ${data.modelo || ''} — contrato ${data.numero_contrato || data.id}`.trim(),
        referencia_tipo: 'contrato_leasing',
        referencia_id: data.id,
        idempotency_key: `custodia-leasing-${data.id}`,
      })
    } catch (e) {
      console.error('custodia compra_maquina:', e.message)
    }
  }

  return Response.json({ ok: true, contrato: data })
}

function generarTextoContratoLeasing({ numero, nombre_beneficiaria, cedula_beneficiaria, ciudad, tipo_equipo, marca, modelo, serial, valor_equipo, pct_excedente, excedente_estimado, meses_estimados, opcion_compra, fecha }) {
  const fmt = (n) => Math.round(parseFloat(n || 0)).toLocaleString('es-CO')
  return `CONTRATO DE LEASING OPERATIVO DE MAQUINARIA
Número: ${numero}
Fecha: ${fecha}
Ciudad: ${ciudad}, Colombia

PARTES

ARRENDADOR (INVERSIONISTA ÁNGEL): Persona natural o jurídica identificada en el sistema de Escala como el ángel asignado a este proyecto, quien actúa como propietario del equipo durante la vigencia del contrato.

ARRENDATARIA (BENEFICIARIA): ${nombre_beneficiaria}, identificada con cédula de ciudadanía N.° ${cedula_beneficiaria}, domiciliada en ${ciudad}, Colombia.

INTERMEDIARIO TECNOLÓGICO: ESCALA (escala.network), que actúa únicamente como plataforma tecnológica de intermediación y no es parte del contrato ni asume obligaciones financieras.

OBJETO

El Arrendador entrega en calidad de leasing operativo el siguiente equipo a la Arrendataria:

Tipo de equipo: ${tipo_equipo}
Marca: ${marca}
Modelo: ${modelo || 'No especificado'}
Serial: ${serial}
Valor de adquisición: $${fmt(valor_equipo)} COP

La Arrendataria recibe el equipo para su uso exclusivo en actividades productivas en la ciudad de ${ciudad}.

CÁNONES Y FORMA DE PAGO

El pago se realiza mediante el mecanismo de excedente operacional (waterfall):

1. La Arrendataria reporta mensualmente en la plataforma Escala sus ingresos totales, costos directos y gastos fijos operacionales.
2. El sistema calcula el excedente mensual: Ingresos - Costos - Gastos fijos = Excedente.
3. El ${pct_excedente}% del excedente mensual se abona automáticamente al capital pendiente del Arrendador.
4. El ${100 - pct_excedente}% restante queda disponible para la Arrendataria.
5. El contrato termina cuando el capital abonado acumula $${fmt(valor_equipo)} COP.

Proyección estimada al momento de firma:
- Excedente mensual estimado por la Arrendataria: $${fmt(excedente_estimado)} COP
- Abono mensual estimado: $${fmt(parseFloat(excedente_estimado) * parseFloat(pct_excedente) / 100)} COP
- Meses estimados para pagar el total: ~${meses_estimados} meses

Nota: Estas proyecciones son estimadas. El tiempo real depende del excedente real reportado cada mes.

OBLIGACIONES DE LA ARRENDATARIA

1. Reportar ventas, costos y gastos mensualmente antes del último día de cada mes.
2. Mantener el equipo en buen estado y realizar mantenimiento preventivo.
3. No vender, ceder, empeñar ni usar el equipo como garantía de otra deuda.
4. Notificar cualquier daño, avería o pérdida en menos de 48 horas.
5. Permitir inspección del equipo con 24 horas de aviso previo.
6. Mantener el equipo asegurado contra daño y robo.

INCUMPLIMIENTO Y RECUPERACIÓN DEL ACTIVO

Constituye incumplimiento: (a) no reportar por 3 meses consecutivos sin justificación; (b) usar el equipo para fines diferentes a los declarados; (c) dañar el equipo por negligencia grave.

Procedimiento: (1) Notificación escrita con 15 días para subsanar; (2) si no hay subsanación, terminación anticipada del contrato; (3) devolución del equipo en el estado en que se encuentre.

${opcion_compra === 'si' ? `OPCIÓN DE COMPRA ANTICIPADA

La Arrendataria puede en cualquier momento pagar el capital pendiente y recibir la propiedad del equipo de forma inmediata. El valor es el capital pendiente en ese momento, sin intereses adicionales ni penalidades.` : ''}

TRANSFERENCIA DE PROPIEDAD

Cuando el capital abonado acumule $${fmt(valor_equipo)} COP, Escala emite automáticamente la Carta de Liberación del Activo y el equipo pasa a ser propiedad de la Arrendataria.

PROTECCIÓN DE DATOS

El tratamiento de datos personales se rige por la Política de Privacidad de Escala, conforme a la Ley 1581 de 2012 y sus decretos reglamentarios.

SOLUCIÓN DE CONTROVERSIAS

Las partes intentarán resolver cualquier diferencia directamente. Si en 15 días hábiles no hay acuerdo, acudirán a conciliación. En caso de no conciliación, a los Jueces Civiles de la ciudad de ${ciudad}.

FIRMA ELECTRÓNICA

La firma electrónica de este contrato tiene plena validez legal conforme a la Ley 527 de 1999 de Comercio Electrónico en Colombia. Se registra nombre, cédula, fecha, hora e identificador de sesión de la Arrendataria.

FIRMADO ELECTRÓNICAMENTE POR LA ARRENDATARIA: ${nombre_beneficiaria} — C.C. ${cedula_beneficiaria}
Fecha: ${fecha}

PENDIENTE FIRMA DEL ARRENDADOR (ÁNGEL INVERSIONISTA): Por aprobar en plataforma Escala.

INTERMEDIARIO TECNOLÓGICO: ESCALA (escala.network) — Este contrato es administrado tecnológicamente por Escala, que actúa como intermediario y no asume obligaciones financieras propias de las partes.`
}
