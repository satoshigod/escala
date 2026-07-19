// app/api/presupuesto/fondeo/route.js
// POST — angel propone fondear un item del presupuesto
// PUT  — fundador acepta, contraofertar o rechaza
// GET  — estado de fondeos de un item o proyecto

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { notificar } from '@/lib/notificaciones/notificar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const item_id = searchParams.get('item_id')
    const proyecto_id = searchParams.get('proyecto_id')

    let query = supabase
      .from('presupuesto_fondeos')
      .select(`
        *, 
        presupuesto_items(id, nombre, categoria, valor_total, valor_unitario, cantidad),
        perfiles!inversionista_id(id, nombre, email)
      `)
      .order('created_at', { ascending: false })

    if (item_id) query = query.eq('item_id', item_id)
    if (proyecto_id) query = query.eq('proyecto_id', proyecto_id)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ ok: true, fondeos: data || [] })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Sin autorizacion' }, { status: 401 })
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const body = await req.json()
    const { item_id, monto, a_cambio_de, pct_participacion, tasa_mensual, pct_revenue } = body

    if (!item_id || !monto || !a_cambio_de) {
      return NextResponse.json({ error: 'item_id, monto y a_cambio_de son obligatorios' }, { status: 400 })
    }

    // Obtener datos del item y el proyecto
    const { data: item } = await supabase
      .from('presupuesto_items')
      .select('*, proyectos(id, nombre, fundador_id, perfiles!fundador_id(id, nombre, email))')
      .eq('id', item_id).single()

    if (!item) return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 })
    if (['fondeado', 'verificado'].includes(item.estado_fondeo)) {
      return NextResponse.json({ error: 'Este item ya está completamente fondeado' }, { status: 400 })
    }

    // Crear el fondeo
    const { data: fondeo, error } = await supabase
      .from('presupuesto_fondeos')
      .insert({
        item_id,
        proyecto_id: item.proyecto_id,
        inversionista_id: user.id,
        monto: parseFloat(monto),
        a_cambio_de,
        pct_participacion: a_cambio_de === 'participacion' ? parseFloat(pct_participacion || 0) : null,
        tasa_mensual: a_cambio_de === 'deuda' ? parseFloat(tasa_mensual || 0) : null,
        pct_revenue: a_cambio_de === 'revenue_share' ? parseFloat(pct_revenue || 0) : null,
        estado: 'propuesta',
      })
      .select()
      .single()

    if (error) throw error

    // Notificar al fundador
    const fundador = item.proyectos?.perfiles
    if (fundador) {
      await notificar('inversion_propuesta_recibida', {
        id: fundador.id,
        email: fundador.email,
      }, {
        nombre_item: item.nombre,
        monto_formateado: parseFloat(monto).toLocaleString('es-CO'),
        proyecto_id: item.proyecto_id,
        item_id,
        fondeo_id: fondeo.id,
      }).catch(() => {})
    }

    return NextResponse.json({ ok: true, fondeo })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Sin autorizacion' }, { status: 401 })
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const body = await req.json()
    const { fondeo_id, accion, contrapropuesta_monto, contrapropuesta_terminos, comprobante_url } = body

    if (!fondeo_id || !accion) {
      return NextResponse.json({ error: 'fondeo_id y accion son obligatorios' }, { status: 400 })
    }

    const { data: fondeo } = await supabase
      .from('presupuesto_fondeos')
      .select('*, presupuesto_items(*, proyectos(fundador_id, nombre, perfiles!fundador_id(id, nombre, email)))')
      .eq('id', fondeo_id).single()

    if (!fondeo) return NextResponse.json({ error: 'Fondeo no encontrado' }, { status: 404 })

    const fundador_id = fondeo.presupuesto_items?.proyectos?.fundador_id
    const es_fundador = user.id === fundador_id
    const es_inversionista = user.id === fondeo.inversionista_id

    if (!es_fundador && !es_inversionista) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    let nuevo_estado = fondeo.estado
    let updates = { updated_at: new Date().toISOString() }

    if (accion === 'aceptar' && es_fundador) {
      nuevo_estado = 'aceptado'
      updates.estado = nuevo_estado

      // Actualizar el item — sumar monto fondeado
      const nuevo_monto = parseFloat(fondeo.presupuesto_items.monto_fondeado || 0) + parseFloat(fondeo.monto)
      const valor_total = parseFloat(fondeo.presupuesto_items.valor_total || 0)
      const nuevo_estado_fondeo = nuevo_monto >= valor_total ? 'fondeado' : 'parcialmente_fondeado'

      await supabase.from('presupuesto_items').update({
        monto_fondeado: nuevo_monto,
        estado_fondeo: nuevo_estado_fondeo,
        updated_at: new Date().toISOString(),
      }).eq('id', fondeo.item_id)

      // Generar contrato automatico
      const terminos = fondeo.a_cambio_de === 'participacion'
        ? `${fondeo.pct_participacion}% de participacion en el proyecto`
        : fondeo.a_cambio_de === 'deuda'
        ? `Deuda con tasa ${fondeo.tasa_mensual}% mensual sobre saldo`
        : `${fondeo.pct_revenue}% de los ingresos mensuales del proyecto`

      const { data: contrato } = await supabase.from('contratos').insert({
        proyecto_id: fondeo.proyecto_id,
        especialista_id: fondeo.inversionista_id,
        fundador_id: user.id,
        rol_nombre: 'Angel de Impulso',
        tipo: 'inversion_presupuesto',
        estado: 'activo',
        monto: parseFloat(fondeo.monto),
        descripcion: `Inversion en: ${fondeo.presupuesto_items?.nombre}. A cambio de: ${terminos}.`,
        fecha_inicio: new Date().toISOString().split('T')[0],
      }).select('id').single().catch(() => ({ data: null }))

      if (contrato?.id) {
        updates.contrato_id = contrato.id
      }

      // Notificar al inversionista
      const { data: invPerfil } = await supabase.from('perfiles').select('id, nombre, email').eq('id', fondeo.inversionista_id).single()
      if (invPerfil) {
        await notificar('inversion_propuesta_aceptada', { id: invPerfil.id, email: invPerfil.email }, {
          nombre_item: fondeo.presupuesto_items.nombre,
          monto_formateado: parseFloat(fondeo.monto).toLocaleString('es-CO'),
          proyecto_id: fondeo.proyecto_id,
          fondeo_id,
        }).catch(() => {})
      }

    } else if (accion === 'rechazar') {
      nuevo_estado = 'rechazado'
      updates.estado = nuevo_estado

    } else if (accion === 'contraofertar' && es_fundador) {
      nuevo_estado = 'negociando'
      updates.estado = nuevo_estado
      if (contrapropuesta_monto) updates.monto = parseFloat(contrapropuesta_monto)

    } else if (accion === 'confirmar_transferencia' && es_inversionista && fondeo.estado === 'aceptado') {
      nuevo_estado = 'transferido'
      updates.estado = nuevo_estado
      updates.comprobante_url = comprobante_url || null

      // Notificar a Escala (admin) para verificar
      await notificar('inversion_transferencia_pendiente_verificacion', {
        id: 'a57b6849-1388-4186-8880-2ec31dd31af5',
        email: 'ivan@escala.network',
      }, {
        nombre_item: fondeo.presupuesto_items.nombre,
        monto: parseFloat(fondeo.monto).toLocaleString('es-CO'),
        proyecto_id: fondeo.proyecto_id,
        fondeo_id,
      }).catch(() => {})

    } else if (accion === 'verificar' && es_fundador && fondeo.estado === 'transferido') {
      nuevo_estado = 'verificado'
      updates.estado = nuevo_estado
      updates.comprobante_verificado = true
      updates.verificado_por = user.id
      updates.verificado_at = new Date().toISOString()

      // Marcar el item como ejecutado
      const { data: itemActualizado } = await supabase.from('presupuesto_items').update({
        estado: 'completado',
        estado_fondeo: 'verificado',
        updated_at: new Date().toISOString(),
      }).eq('id', fondeo.item_id).select('hito_id').single()

      // Si el item tiene un hito vinculado, avanzar su estado
      if (itemActualizado?.hito_id) {
        const { data: hito } = await supabase
          .from('hitos').select('estado').eq('id', itemActualizado.hito_id).single()
        if (hito && hito.estado === 'pendiente') {
          await supabase.from('hitos').update({
            estado: 'en_progreso',
            updated_at: new Date().toISOString(),
          }).eq('id', itemActualizado.hito_id)
        }
      }

      // Notificar al inversionista que el capital fue verificado
      const { data: invPerfilV } = await supabase.from('perfiles').select('id, nombre, email').eq('id', fondeo.inversionista_id).single()
      if (invPerfilV) {
        await notificar('inversion_fondeada_verificada', { id: invPerfilV.id, email: invPerfilV.email }, {
          nombre_item: fondeo.presupuesto_items?.nombre,
          proyecto_id: fondeo.proyecto_id,
        }).catch(() => {})
      }

      // Notificar al fundador que el capital quedó acreditado al proyecto
      const fundadorId = fondeo.presupuesto_items?.proyectos?.fundador_id
      const { data: fundadorPerfil } = await supabase.from('perfiles').select('id, nombre, email').eq('id', fondadorId).single()
      if (fundadorPerfil) {
        await notificar('wallet_proyecto_fondeado', { id: fundadorPerfil.id, email: fundadorPerfil.email }, {
          monto_formateado: Math.round(parseFloat(fondeo.monto)).toLocaleString('es-CO'),
          proyecto_nombre: fondeo.presupuesto_items?.proyectos?.nombre || 'tu proyecto',
          proyecto_id: fondeo.proyecto_id,
        }).catch(() => {})
      }

      // Notificar al admin
      await notificar('admin_fondeo_presupuesto_verificado', {
        id: 'a57b6849-1388-4186-8880-2ec31dd31af5',
        email: 'ivan@escala.network',
      }, {
        monto_formateado: Math.round(parseFloat(fondeo.monto)).toLocaleString('es-CO'),
        nombre_item: fondeo.presupuesto_items?.nombre,
        proyecto_nombre: fondeo.presupuesto_items?.proyectos?.nombre,
      }).catch(() => {})

      // Acreditar capital al wallet del proyecto
      try {
        const monto = parseFloat(fondeo.monto)
        const idempotency_key = `fondeo-presupuesto-${fondeo_id}-verificado`

        // Registrar en ledger como credito al proyecto
        const comision_escala = Math.round(monto * 0.03)

        await supabase.from('ledger_entries').insert({
          tipo: 'credito',
          tipo_referencia: 'fondeo_presupuesto',
          referencia_id: fondeo_id,
          cuenta_origen: `angel:${fondeo.inversionista_id}`,
          cuenta_destino: `proyecto:${fondeo.proyecto_id}`,
          monto,
          monto_usd: monto / 4200,
          moneda: 'COP',
          descripcion: `Fondeo verificado: ${fondeo.presupuesto_items?.nombre} — ${fondeo.a_cambio_de}`,
          idempotency_key,
        }).select().single()

        // Comision Escala 3% sobre el fondeo
        await supabase.from('ledger_entries').insert({
          tipo: 'comision',
          tipo_referencia: 'comision_escala',
          referencia_id: fondeo_id,
          cuenta_origen: `proyecto:${fondeo.proyecto_id}`,
          cuenta_destino: 'escala:comisiones',
          monto: comision_escala,
          monto_usd: comision_escala / 4200,
          moneda: 'COP',
          descripcion: `Comision Escala 3% sobre fondeo ${fondeo.presupuesto_items?.nombre}`,
          idempotency_key: `comision-fondeo-${fondeo_id}`,
          comision_escala: comision_escala,
        }).catch(() => {}) // No bloquea si falla

        // Buscar o crear wallet del proyecto
        const { data: walletExistente } = await supabase
          .from('wallets').select('id, saldo_disponible').eq('usuario_id', fondeo.proyecto_id).eq('moneda', 'COP').maybeSingle()

        if (walletExistente) {
          await supabase.from('wallets').update({
            saldo_disponible: (parseFloat(walletExistente.saldo_disponible) + monto),
            updated_at: new Date().toISOString(),
          }).eq('id', walletExistente.id)
        } else {
          await supabase.from('wallets').insert({
            usuario_id: fondeo.proyecto_id,
            moneda: 'COP',
            saldo_disponible: monto,
            saldo_comprometido: 0,
            saldo_pendiente: 0,
          })
        }
      } catch (walletErr) {
        console.error('Error acreditando wallet:', walletErr)
        // No falla el flujo principal si el wallet falla
      }
    }

    const { data: updated, error } = await supabase
      .from('presupuesto_fondeos').update(updates).eq('id', fondeo_id).select().single()
    if (error) throw error

    return NextResponse.json({ ok: true, fondeo: updated, nuevo_estado })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
