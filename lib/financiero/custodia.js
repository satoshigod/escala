// lib/financiero/custodia.js
//
// Motor de CUSTODIA. Escala custodia y paga TODO: cada movimiento de recursos
// son dos tramos con confirmacion manual, nunca un pago directo pagador->receptor.
//
// Maquina de estados de una orden_pago:
//
//   pendiente_pago                     [1] Escala le dice al pagador "paga $X a Escala"
//     -> reportarPago (pagador)        [2] el pagador marca "ya pague"
//   pago_reportado
//     -> confirmarRecepcion (admin)    [3] Escala confirma que recibio -> LEDGER tramo 1
//   en_custodia                            (pagador -> escala:custodia). El dinero esta en Escala.
//     -> emitirPago (admin)            [4] Escala marca "pague al receptor"
//   pago_emitido
//     -> confirmarRecepcionReceptor    [5] el receptor confirma que recibio -> LEDGER tramo 2
//   completado                             (escala:custodia -> receptor). Aqui SI sale el "recibido" real.
//
//   Cualquier estado no terminal -> cancelar -> cancelado
//
// Regla de oro: el "recibido" del receptor SOLO ocurre en [5], nunca antes.
// Los tramos del medio ([3] y [4]) los confirma el admin (equipo Escala).

import { createClient } from '@supabase/supabase-js'
import { registrarMovimiento } from './ledger'
import { notificar } from '@/lib/notificaciones/notificar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const CUENTA_CUSTODIA = 'escala:custodia'

// Transiciones validas: estado_actual -> [estados_permitidos]
const TRANSICIONES = {
  pendiente_pago: ['pago_reportado', 'cancelado'],
  pago_reportado: ['en_custodia', 'cancelado'],
  en_custodia: ['pago_emitido', 'cancelado'],
  pago_emitido: ['completado'],
  completado: [],
  cancelado: [],
}

async function obtenerOrden(ordenId) {
  const { data, error } = await supabase
    .from('ordenes_pago')
    .select('*')
    .eq('id', ordenId)
    .single()
  if (error || !data) throw new Error('Orden de pago no encontrada')
  return data
}

function validarTransicion(orden, nuevoEstado) {
  const permitidos = TRANSICIONES[orden.estado] || []
  if (!permitidos.includes(nuevoEstado)) {
    throw new Error(`Transicion invalida: ${orden.estado} -> ${nuevoEstado}`)
  }
}

// ---------------------------------------------------------------------------
// [1] Crear la obligacion. No toca el ledger todavia: solo declara que el
//     pagador debe pagar $monto a Escala.
// ---------------------------------------------------------------------------
export async function crearOrdenPago({
  tipo_flujo,          // 'local_repago' | 'compra_maquina' | 'arriendo' | 'fondeo' | 'reparto'
  proyecto_id = null,
  pagador_id,
  receptor_id = null,  // usuario que recibe; null si el receptor es externo
  receptor_externo = null, // texto si el receptor no es usuario (arrendador, proveedor)
  monto,
  moneda = 'COP',
  concepto,
  referencia_tipo = null,
  referencia_id = null,
  metadata_flujo = null,
  idempotency_key,
}) {
  if (!pagador_id || !monto || monto <= 0 || !concepto || !idempotency_key) {
    throw new Error('crearOrdenPago: faltan campos requeridos')
  }

  // Idempotencia: si ya existe una orden con esta key, la devolvemos
  const { data: existente } = await supabase
    .from('ordenes_pago')
    .select('*')
    .eq('idempotency_key', idempotency_key)
    .maybeSingle()
  if (existente) return { ok: true, idempotente: true, orden: existente }

  const { data, error } = await supabase
    .from('ordenes_pago')
    .insert({
      tipo_flujo,
      proyecto_id,
      pagador_id,
      receptor_id,
      receptor_externo,
      monto,
      moneda,
      concepto,
      referencia_tipo,
      referencia_id,
      estado: 'pendiente_pago',
      nota: metadata_flujo ? JSON.stringify(metadata_flujo) : null,
      idempotency_key,
    })
    .select()
    .single()

  if (error) throw new Error('Error creando orden: ' + error.message)

  // Avisar al pagador que debe pagar a Escala
  const { data: pagador } = await supabase.from('perfiles').select('id, email, nombre').eq('id', pagador_id).single()
  if (pagador?.email) {
    await notificar('custodia_pago_requerido', { id: pagador.id, email: pagador.email }, {
      monto_formateado: Math.round(monto).toLocaleString('es-CO'),
      concepto,
      orden_id: data.id,
    }).catch(() => {})
  }

  return { ok: true, orden: data }
}

// ---------------------------------------------------------------------------
// [2] El pagador confirma que ya pago a Escala (aporta referencia BREB).
//     Aun NO toca el ledger: queda pendiente de que Escala verifique.
// ---------------------------------------------------------------------------
export async function reportarPago(ordenId, pagadorId, ref_pago_pagador = null) {
  const orden = await obtenerOrden(ordenId)
  if (orden.pagador_id !== pagadorId) throw new Error('Solo el pagador puede reportar el pago')
  validarTransicion(orden, 'pago_reportado')

  const { data, error } = await supabase
    .from('ordenes_pago')
    .update({ estado: 'pago_reportado', pago_reportado_at: new Date().toISOString(), ref_pago_pagador, updated_at: new Date().toISOString() })
    .eq('id', ordenId)
    .eq('estado', 'pendiente_pago') // guard optimista
    .select()
    .single()
  if (error || !data) throw new Error('No se pudo reportar el pago (estado cambiado)')

  // Avisar al admin que hay un pago por verificar
  await notificar('admin_custodia_por_verificar', { id: 'a57b6849-1388-4186-8880-2ec31dd31af5', email: 'ivan@escala.network' }, {
    monto_formateado: Math.round(orden.monto).toLocaleString('es-CO'),
    concepto: orden.concepto,
    referencia: ref_pago_pagador || 'sin referencia',
    orden_id: ordenId,
  }).catch(() => {})

  return { ok: true, orden: data }
}

// ---------------------------------------------------------------------------
// [3] ADMIN confirma que Escala recibio el dinero del pagador.
//     LEDGER tramo 1: pagador -> escala:custodia. El dinero queda en Escala.
// ---------------------------------------------------------------------------
export async function confirmarRecepcion(ordenId, adminId) {
  const orden = await obtenerOrden(ordenId)
  validarTransicion(orden, 'en_custodia')

  await registrarMovimiento({
    tipo_referencia: 'custodia_ingreso',
    referencia_id: ordenId,
    cuenta_origen: `perfil:${orden.pagador_id}`,
    cuenta_destino: CUENTA_CUSTODIA,
    monto: orden.monto,
    moneda: orden.moneda,
    descripcion: `Ingreso a custodia — ${orden.concepto}`,
    idempotency_key: `custodia_in_${ordenId}`,
    created_by: adminId,
    metadata: { tipo_flujo: orden.tipo_flujo, orden_id: ordenId },
  })

  const { data, error } = await supabase
    .from('ordenes_pago')
    .update({ estado: 'en_custodia', en_custodia_at: new Date().toISOString(), en_custodia_by: adminId, updated_at: new Date().toISOString() })
    .eq('id', ordenId)
    .eq('estado', 'pago_reportado')
    .select()
    .single()
  if (error || !data) throw new Error('No se pudo confirmar la recepcion (estado cambiado)')

  // Avisar al pagador que Escala confirmo su pago
  const { data: pagador } = await supabase.from('perfiles').select('id, email').eq('id', orden.pagador_id).single()
  if (pagador?.email) {
    await notificar('custodia_pago_confirmado', { id: pagador.id, email: pagador.email }, {
      monto_formateado: Math.round(orden.monto).toLocaleString('es-CO'),
      concepto: orden.concepto,
      orden_id: ordenId,
    }).catch(() => {})
  }

  return { ok: true, orden: data }
}

// ---------------------------------------------------------------------------
// [4] ADMIN marca que Escala ya envio el dinero al receptor (transferencia BREB de Escala).
//     Aun NO acredita al receptor: queda pendiente de que el receptor confirme.
// ---------------------------------------------------------------------------
export async function emitirPago(ordenId, adminId, ref_pago_escala = null) {
  const orden = await obtenerOrden(ordenId)
  validarTransicion(orden, 'pago_emitido')

  const { data, error } = await supabase
    .from('ordenes_pago')
    .update({ estado: 'pago_emitido', pago_emitido_at: new Date().toISOString(), pago_emitido_by: adminId, ref_pago_escala, updated_at: new Date().toISOString() })
    .eq('id', ordenId)
    .eq('estado', 'en_custodia')
    .select()
    .single()
  if (error || !data) throw new Error('No se pudo emitir el pago (estado cambiado)')

  // Avisar al receptor (si es usuario) que Escala le envio un pago por confirmar
  if (orden.receptor_id) {
    const { data: receptor } = await supabase.from('perfiles').select('id, email').eq('id', orden.receptor_id).single()
    if (receptor?.email) {
      await notificar('custodia_pago_emitido', { id: receptor.id, email: receptor.email }, {
        monto_formateado: Math.round(orden.monto).toLocaleString('es-CO'),
        concepto: orden.concepto,
        referencia: ref_pago_escala || 'sin referencia',
        orden_id: ordenId,
      }).catch(() => {})
    }
  }

  return { ok: true, orden: data }
}

// ---------------------------------------------------------------------------
// [5] El receptor confirma que recibio el dinero de Escala.
//     LEDGER tramo 2: escala:custodia -> receptor. Aqui SI sale el "recibido" real.
//     Si el receptor es externo (arrendador/proveedor), lo confirma el admin y
//     el destino del ledger es 'pagos_externos'.
// ---------------------------------------------------------------------------
export async function confirmarRecepcionReceptor(ordenId, quienConfirmaId, esAdmin = false) {
  const orden = await obtenerOrden(ordenId)
  validarTransicion(orden, 'completado')

  if (orden.receptor_id) {
    if (!esAdmin && orden.receptor_id !== quienConfirmaId) {
      throw new Error('Solo el receptor puede confirmar que recibio')
    }
  } else if (!esAdmin) {
    throw new Error('El pago a un receptor externo lo confirma el admin')
  }

  const cuentaDestino = orden.receptor_id ? `perfil:${orden.receptor_id}` : 'pagos_externos'

  await registrarMovimiento({
    tipo_referencia: 'custodia_egreso',
    referencia_id: ordenId,
    cuenta_origen: CUENTA_CUSTODIA,
    cuenta_destino: cuentaDestino,
    monto: orden.monto,
    moneda: orden.moneda,
    descripcion: `Egreso de custodia — ${orden.concepto}`,
    idempotency_key: `custodia_out_${ordenId}`,
    created_by: quienConfirmaId,
    metadata: { tipo_flujo: orden.tipo_flujo, orden_id: ordenId, receptor_externo: orden.receptor_externo || null },
  })

  const { data, error } = await supabase
    .from('ordenes_pago')
    .update({ estado: 'completado', completado_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', ordenId)
    .eq('estado', 'pago_emitido')
    .select()
    .single()
  if (error || !data) throw new Error('No se pudo confirmar la recepcion final (estado cambiado)')

  // El "recibido" real — solo aqui
  if (orden.receptor_id) {
    const { data: receptor } = await supabase.from('perfiles').select('id, email').eq('id', orden.receptor_id).single()
    if (receptor?.email) {
      await notificar('custodia_recibido', { id: receptor.id, email: receptor.email }, {
        monto_formateado: Math.round(orden.monto).toLocaleString('es-CO'),
        concepto: orden.concepto,
        orden_id: ordenId,
      }).catch(() => {})
    }
  }

  // Efectos por tipo de flujo: recien aqui (pago completado) se aplica el
  // avance real del negocio. Reportar no es pagar; pagar de verdad si abona.
  if (orden.tipo_flujo === 'local_repago' && orden.proyecto_id) {
    try {
      // los montos del waterfall viajan en la nota de la orden (el reporte
      // diario no persiste intereses_dia/abono_capital como columnas)
      let rep = null
      try { rep = orden.nota ? JSON.parse(orden.nota) : null } catch (_) { rep = null }

      if (rep) {
        const { data: local } = await supabase
          .from('proyectos_local_comercial')
          .select('id, capital_pagado, intereses_pagados, capital_original, fase_actual')
          .eq('proyecto_id', orden.proyecto_id)
          .single()

        if (local) {
          const nuevoCapital = (local.capital_pagado || 0) + (rep.abono_capital || 0)
          const nuevosIntereses = (local.intereses_pagados || 0) + (rep.intereses_dia || 0)
          const saldo = (local.capital_original || 0) - nuevoCapital
          await supabase
            .from('proyectos_local_comercial')
            .update({
              capital_pagado: nuevoCapital,
              intereses_pagados: nuevosIntereses,
              fase_actual: (local.fase_actual === 'repago' && saldo <= 0) ? 'regalia' : local.fase_actual,
              updated_at: new Date().toISOString(),
            })
            .eq('id', local.id)
        }
      }
    } catch (e) {
      console.error('custodia efecto local_repago:', e.message)
    }
  }

  return { ok: true, orden: data }
}

// Cancelar una orden en cualquier estado no terminal
export async function cancelarOrden(ordenId, quienId, motivo = null) {
  const orden = await obtenerOrden(ordenId)
  validarTransicion(orden, 'cancelado')
  const { data, error } = await supabase
    .from('ordenes_pago')
    .update({ estado: 'cancelado', nota: motivo, updated_at: new Date().toISOString() })
    .eq('id', ordenId)
    .neq('estado', 'completado')
    .neq('estado', 'cancelado')
    .select()
    .single()
  if (error || !data) throw new Error('No se pudo cancelar la orden')
  return { ok: true, orden: data }
}

export const ESTADOS_ORDEN = {
  pendiente_pago: { label: 'Pendiente de pago', color: '#E8A020' },
  pago_reportado: { label: 'Pago reportado — Escala verificando', color: '#4A90D9' },
  en_custodia:    { label: 'En custodia de Escala', color: '#AFA9EC' },
  pago_emitido:   { label: 'Escala pagó — por confirmar', color: '#4A90D9' },
  completado:     { label: 'Completado', color: '#1D9E75' },
  cancelado:      { label: 'Cancelado', color: '#8FA3CC' },
}
