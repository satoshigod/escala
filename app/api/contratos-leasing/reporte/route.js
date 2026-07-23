
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request) {
  const body = await request.json()
  const {
    proyecto_id, contrato_id, ingresos_mes, costos_directos,
    gastos_fijos, excedente, abono_angel, pct_excedente, nota, fecha_mes,
  } = body

  if (!proyecto_id || !contrato_id) {
    return Response.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  // Verificar que no exista reporte para este mes
  const { data: existente } = await supabaseAdmin
    .from('reportes_leasing')
    .select('id')
    .eq('contrato_id', contrato_id)
    .eq('fecha_mes', fecha_mes)
    .maybeSingle()

  if (existente) {
    return Response.json({ error: 'Ya existe un reporte para este mes' }, { status: 400 })
  }

  // Cargar contrato actual
  const { data: contrato } = await supabaseAdmin
    .from('contratos_leasing')
    .select('capital_pendiente, capital_abonado, valor_equipo')
    .eq('id', contrato_id)
    .single()

  if (!contrato) return Response.json({ error: 'Contrato no encontrado' }, { status: 404 })

  const capitalPendienteAnterior = parseFloat(contrato.capital_pendiente || 0)
  const capitalAbonadoAnterior = parseFloat(contrato.capital_abonado || 0)
  const abonoReal = Math.min(abono_angel, capitalPendienteAnterior) // No abonar más de lo pendiente
  const capitalPendienteNuevo = Math.max(0, capitalPendienteAnterior - abonoReal)
  const capitalAbonadoNuevo = capitalAbonadoAnterior + abonoReal
  const valorEquipo = parseFloat(contrato.valor_equipo || 0)
  const mesesRestantes = abonoReal > 0 ? Math.ceil(capitalPendienteNuevo / abonoReal) : null
  const contratoTerminado = capitalPendienteNuevo === 0

  // Crear reporte
  const idempotencyKey = 'reporte-leasing-' + contrato_id + '-' + fecha_mes
  const { data: reporte, error: errReporte } = await supabaseAdmin
    .from('reportes_leasing')
    .insert({
      proyecto_id,
      contrato_id,
      fecha_mes,
      ingresos_mes: parseFloat(ingresos_mes || 0),
      costos_directos: parseFloat(costos_directos || 0),
      gastos_fijos: parseFloat(gastos_fijos || 0),
      excedente: parseFloat(excedente || 0),
      abono_angel: abonoReal,
      pct_excedente: parseFloat(pct_excedente || 60),
      nota: nota || '',
      capital_pendiente_antes: capitalPendienteAnterior,
      capital_pendiente_despues: capitalPendienteNuevo,
      idempotency_key: idempotencyKey,
    })
    .select()
    .single()

  if (errReporte) return Response.json({ error: errReporte.message }, { status: 500 })

  // Comision Escala 3% sobre el abono real
  if (abonoReal > 0) {
    const comisionEscala = Math.round(abonoReal * 0.03)
    await supabaseAdmin.from('ledger_entries').insert({
      tipo: 'debito',
      referencia_tipo: 'comision_escala',
      referencia_id: reporte.id,
      cuenta_origen: `proyecto:${proyecto_id}`,
      cuenta_destino: 'escala:comisiones',
      monto: comisionEscala,
      monto_usd: comisionEscala / 4200,

      tasa_usd: 1 / 4200,
      moneda: 'COP',
      descripcion: `Comision Escala 3% reporte leasing ${fecha_mes}`,
      idempotency_key: `comision-leasing-${contrato_id}-${fecha_mes}`,
      metadata: { comision_escala: comisionEscala },
    }).catch(() => {})
  }

  // Actualizar contrato con nuevo capital
  await supabaseAdmin
    .from('contratos_leasing')
    .update({
      capital_abonado: capitalAbonadoNuevo,
      capital_pendiente: capitalPendienteNuevo,
      estado: contratoTerminado ? 'completado' : 'activo',
      updated_at: new Date().toISOString(),
    })
    .eq('id', contrato_id)

  // Si el contrato se terminó, notificar al admin
  if (contratoTerminado) {
    try {
      const { data: admins } = await supabaseAdmin
        .from('perfiles').select('id').eq('es_admin', true)
      if (admins?.length) {
        await supabaseAdmin.from('notificaciones').insert(admins.map(a => ({
          destinatario_id: a.id,
          tipo: 'leasing_completado',
          titulo: 'Leasing completado',
          mensaje: 'El contrato ' + contrato_id + ' ha sido pagado en su totalidad. La maquina debe transferirse a la beneficiaria.',
          data: { contrato_id, proyecto_id },
          leida: false,
        })))
      }
    } catch (e) { console.error(e) }
  }

  return Response.json({
    ok: true,
    reporte,
    excedente: parseFloat(excedente || 0),
    abono_angel: abonoReal,
    capital_pendiente_nuevo: capitalPendienteNuevo,
    capital_abonado_nuevo: capitalAbonadoNuevo,
    meses_restantes: mesesRestantes,
    contrato_terminado: contratoTerminado,
  })
}
