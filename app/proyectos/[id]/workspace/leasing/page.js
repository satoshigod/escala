'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const fmt = (n) => Math.round(parseFloat(n || 0)).toLocaleString('es-CO')

const s = {
  page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff', padding: '2rem 1rem' },
  wrap: { maxWidth: '680px', margin: '0 auto' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem', marginBottom: '1rem' },
  h1: { fontSize: '1.4rem', fontWeight: '800', color: '#fff', marginBottom: '0.25rem' },
  h2: { fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '0.75rem' },
  sub: { fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6', marginBottom: '1.25rem' },
  label: { fontSize: '0.72rem', fontWeight: '600', color: '#8FA3CC', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.375rem' },
  input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '0.625rem 0.875rem', fontSize: '0.88rem', color: '#fff', fontFamily: 'Inter,sans-serif', marginBottom: '0.875rem' },
  btn: (c) => ({ background: c, color: '#fff', border: 'none', borderRadius: '10px', padding: '0.75rem 1.5rem', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter,sans-serif', width: '100%' }),
  pill: (ok) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', background: ok ? 'rgba(29,158,117,0.15)' : 'rgba(175,169,236,0.12)', color: ok ? '#1D9E75' : '#AFA9EC' }),
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  kpi: { background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '0.875rem', textAlign: 'center' },
  kpiV: { fontSize: '1.1rem', fontWeight: '800', color: '#1D9E75' },
  kpiL: { fontSize: '0.65rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' },
  step: (activo) => ({ width: '28px', height: '28px', borderRadius: '50%', background: activo ? '#1D9E75' : 'rgba(255,255,255,0.08)', color: activo ? '#fff' : '#4B5563', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: '700', flexShrink: 0 }),
  clausula: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '1rem', marginBottom: '0.75rem' },
}

const PASOS = ['Acuerdo', 'Equipo', 'Finanzas', 'Contrato', 'Firma', 'Listo']

export default function LeasingPage({ params }) {
  const id = params.id
  const [paso, setPaso] = useState(0)
  const [proyecto, setProyecto] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [contrato, setContrato] = useState(null)
  const [aceptada, setAceptada] = useState({ c1: false, c2: false, c3: false, c4: false, c5: false })

  const [form, setForm] = useState({
    // Equipo
    tipo_equipo: '',
    marca: '',
    modelo: '',
    serial: '',
    valor_equipo: '',
    descripcion_equipo: '',
    // Financiero
    pct_excedente: '60',
    excedente_estimado: '',
    opcion_compra: 'si',
    valor_opcion_compra: '',
    // Partes
    nombre_beneficiaria: '',
    cedula_beneficiaria: '',
    direccion_beneficiaria: '',
    ciudad: 'Medellín',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: perfil } = await supabase.from('perfiles').select('id,nombre,email,cedula,ciudad,direccion').eq('user_id', user.id).single()
      setUsuario(perfil)
      const { data: proy } = await supabase.from('proyectos').select('id,nombre,descripcion,escenario,tipo_escenario').eq('id', id).single()
      setProyecto(proy)
      // Pre-llenar datos del usuario
      if (perfil) {
        setForm(f => ({
          ...f,
          nombre_beneficiaria: perfil.nombre || '',
          cedula_beneficiaria: perfil.cedula || '',
          ciudad: perfil.ciudad || 'Medellín',
          direccion_beneficiaria: perfil.direccion || '',
        }))
      }
      // Verificar si ya existe contrato de leasing
      const { data: contratoExistente } = await supabase
        .from('contratos_leasing')
        .select('*')
        .eq('proyecto_id', id)
        .maybeSingle()
      if (contratoExistente) {
        setContrato(contratoExistente)
        setPaso(5) // Ya está firmado
      }
    }
    cargar()
  }, [id])

  // Cálculos financieros en tiempo real
  const mesesEstimados = form.excedente_estimado && form.pct_excedente && form.valor_equipo
    ? Math.ceil(parseFloat(form.valor_equipo) / (parseFloat(form.excedente_estimado) * parseFloat(form.pct_excedente) / 100))
    : null
  const abonoMensual = form.excedente_estimado && form.pct_excedente
    ? parseFloat(form.excedente_estimado) * parseFloat(form.pct_excedente) / 100
    : null

  async function firmarContrato() {
    if (!Object.values(aceptada).every(Boolean)) return
    setGuardando(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const payload = {
        proyecto_id: id,
        beneficiaria_id: usuario?.id,
        angel_id: null, // Se asigna cuando Ivan lo aprueba
        ...form,
        estado: 'pendiente_angel',
        fecha_firma_beneficiaria: new Date().toISOString(),
        ip_firma: 'registrada',
        meses_estimados: mesesEstimados,
        abono_mensual_estimado: abonoMensual,
      }
      const res = await fetch('/api/contratos-leasing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.ok) { setContrato(data.contrato); setPaso(5) }
    } catch (e) { console.error(e) }
    setGuardando(false)
  }

  // ====== PASO 0: RESUMEN DEL ACUERDO ======
  if (paso === 0) return (
    <div style={s.page}>
      <div style={s.wrap}>
        <StepBar paso={paso} />
        <div style={{ ...s.card, borderColor: 'rgba(29,158,117,0.25)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#1D9E75', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>LEASING DE MAQUINARIA · ESCALA</div>
          <h1 style={s.h1}>¿En qué consiste este acuerdo?</h1>
          <p style={s.sub}>Antes de firmar, lee esto con calma. Está escrito en lenguaje simple, sin términos complicados.</p>
          {[
            { emoji: '🔧', t: 'Un ángel inversionista compra la máquina', d: 'La máquina es comprada por un inversionista de Escala. Tú la recibes y la usas desde el primer día, pero el inversionista es el dueño durante el contrato.' },
            { emoji: '💰', t: 'Tú pagas desde lo que produce la máquina', d: 'Cada mes reportas tus ventas en la plataforma. Del excedente (ventas menos costos y gastos), el porcentaje acordado se abona al capital. Si produces más, pagas más rápido. Si produces menos, pagas menos ese mes.' },
            { emoji: '🏆', t: 'Cuando terminas de pagar, la máquina es tuya', d: 'Una vez el inversionista recupera el 100% del valor de la máquina, la propiedad se transfiere a tu nombre de forma automática. Puedes acelerarla comprándola antes con la opción de compra.' },
            { emoji: '🤝', t: 'Escala es el intermediario tecnológico', d: 'Escala no es dueño de la máquina ni prestamista. Conecta al inversionista con la beneficiaria y administra el proceso a través de la plataforma.' },
          ].map(c => (
            <div key={c.t} style={{ display: 'flex', gap: '0.875rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{c.emoji}</span>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff', marginBottom: '3px' }}>{c.t}</div>
                <div style={{ fontSize: '0.8rem', color: '#8FA3CC', lineHeight: '1.6' }}>{c.d}</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setPaso(1)} style={s.btn('#1D9E75')}>Entendido, continuar →</button>
      </div>
    </div>
  )

  // ====== PASO 1: DATOS DEL EQUIPO ======
  if (paso === 1) return (
    <div style={s.page}>
      <div style={s.wrap}>
        <StepBar paso={paso} />
        <h1 style={s.h1}>¿Qué máquina vas a recibir?</h1>
        <p style={s.sub}>Estos datos identifican el equipo específico. Guarda el serial de tu máquina — es tu garantía.</p>
        <div style={s.card}>
          <label style={s.label}>Tipo de equipo *</label>
          <select style={s.input} value={form.tipo_equipo} onChange={e => set('tipo_equipo', e.target.value)}>
            <option value="">Selecciona el tipo</option>
            {['Máquina plana industrial','Overlock / fileteadora','Flatseamer (ropa interior/baño)','Kansai (pretinas/dobladillos)','Cortadora industrial','Bordadora industrial','Freidora industrial','Horno panadero','Amasadora industrial','Estufa industrial','Nevera comercial','Silla hidráulica','Secadora de casco','Cabina de ozono','Otro equipo'].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <label style={s.label}>Marca *</label>
          <input style={s.input} value={form.marca} onChange={e => set('marca', e.target.value)} placeholder="Ej: Juki, Jack, Pegasus, Inventto..." />
          <label style={s.label}>Modelo</label>
          <input style={s.input} value={form.modelo} onChange={e => set('modelo', e.target.value)} placeholder="Ej: DDL-8700, MO-6704S..." />
          <label style={s.label}>Número de serial *</label>
          <input style={s.input} value={form.serial} onChange={e => set('serial', e.target.value)} placeholder="Número que aparece en la placa de la máquina" />
          <label style={s.label}>Valor de compra de la máquina (COP) *</label>
          <input style={{ ...s.input }} type="number" value={form.valor_equipo} onChange={e => set('valor_equipo', e.target.value)} placeholder="Ej: 8500000" />
          {form.valor_equipo && <div style={{ fontSize: '0.75rem', color: '#1D9E75', marginTop: '-0.5rem', marginBottom: '0.875rem' }}>${fmt(form.valor_equipo)} COP</div>}
          <label style={s.label}>Descripción del equipo</label>
          <textarea style={{ ...s.input, minHeight: '80px', resize: 'vertical' }} value={form.descripcion_equipo} onChange={e => set('descripcion_equipo', e.target.value)} placeholder="Estado del equipo, especificaciones adicionales, accesorios incluidos..." />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setPaso(0)} style={{ ...s.btn('rgba(255,255,255,0.06)'), border: '1px solid rgba(255,255,255,0.12)' }}>← Atrás</button>
          <button onClick={() => setPaso(2)} disabled={!form.tipo_equipo || !form.marca || !form.serial || !form.valor_equipo} style={{ ...s.btn('#4A90D9'), opacity: (!form.tipo_equipo || !form.marca || !form.serial || !form.valor_equipo) ? 0.5 : 1 }}>Continuar →</button>
        </div>
      </div>
    </div>
  )

  // ====== PASO 2: CONDICIONES FINANCIERAS ======
  if (paso === 2) return (
    <div style={s.page}>
      <div style={s.wrap}>
        <StepBar paso={paso} />
        <h1 style={s.h1}>¿Cómo vas a pagar?</h1>
        <p style={s.sub}>El pago no es una cuota fija. Sale del excedente que genera la misma máquina. Si produces más, pagas más rápido.</p>
        <div style={s.card}>
          <label style={s.label}>% del excedente mensual que va al inversionista *</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
            {['50','60','70','80'].map(p => (
              <button key={p} onClick={() => set('pct_excedente', p)} style={{ background: form.pct_excedente === p ? '#1D9E75' : 'rgba(255,255,255,0.06)', color: form.pct_excedente === p ? '#fff' : '#8FA3CC', border: '1px solid ' + (form.pct_excedente === p ? '#1D9E75' : 'rgba(255,255,255,0.12)'), borderRadius: '8px', padding: '0.5rem 1.25rem', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                {p}%
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#8FA3CC', marginBottom: '1rem', lineHeight: '1.5' }}>
            El {form.pct_excedente}% del excedente va al inversionista hasta recuperar ${fmt(form.valor_equipo)} COP. El {100 - parseInt(form.pct_excedente)}% restante es tuyo para reinvertir o ahorrar.
          </div>

          <label style={s.label}>¿Cuánto calculas que va a ser tu excedente mensual adicional? (COP) *</label>
          <input style={s.input} type="number" value={form.excedente_estimado} onChange={e => set('excedente_estimado', e.target.value)} placeholder="Ej: 1000000" />
          <div style={{ fontSize: '0.72rem', color: '#8FA3CC', marginBottom: '1rem', lineHeight: '1.5' }}>
            El excedente es lo que te sobra después de pagar costos y gastos fijos. No es lo que vendes — es la ganancia real que genera la máquina nueva.
          </div>

          {mesesEstimados && abonoMensual && (
            <div style={{ background: 'rgba(29,158,117,0.06)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#1D9E75', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Proyección basada en tus datos</div>
              <div style={s.row}>
                <div style={s.kpi}><div style={s.kpiV}>${fmt(abonoMensual)}</div><div style={s.kpiL}>Abono mensual estimado</div></div>
                <div style={s.kpi}><div style={s.kpiV}>~{mesesEstimados} meses</div><div style={s.kpiL}>Para pagar todo</div></div>
                <div style={s.kpi}><div style={s.kpiV}>${fmt(form.valor_equipo)}</div><div style={s.kpiL}>Lo que recupera el ángel</div></div>
                <div style={s.kpi}><div style={{ ...s.kpiV, color: '#E8A020' }}>Tuya al terminar</div><div style={s.kpiL}>La máquina pasa a tu nombre</div></div>
              </div>
            </div>
          )}

          <label style={s.label}>¿Quieres opción de compra anticipada?</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem' }}>
            {[{ v: 'si', l: 'Sí, quiero poder comprarla antes' }, { v: 'no', l: 'No, solo pago hasta terminar' }].map(o => (
              <button key={o.v} onClick={() => set('opcion_compra', o.v)} style={{ background: form.opcion_compra === o.v ? 'rgba(232,160,32,0.15)' : 'rgba(255,255,255,0.04)', color: form.opcion_compra === o.v ? '#E8A020' : '#8FA3CC', border: '1px solid ' + (form.opcion_compra === o.v ? 'rgba(232,160,32,0.4)' : 'rgba(255,255,255,0.1)'), borderRadius: '8px', padding: '0.5rem 0.875rem', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif', flex: 1, textAlign: 'left' }}>
                {o.l}
              </button>
            ))}
          </div>
          {form.opcion_compra === 'si' && (
            <div style={{ fontSize: '0.75rem', color: '#8FA3CC', lineHeight: '1.5', padding: '0.75rem', background: 'rgba(232,160,32,0.05)', borderRadius: '8px', marginBottom: '0.875rem' }}>
              La opción de compra anticipada te permite pagar el saldo restante en cualquier momento y recibir la máquina a tu nombre de inmediato. El valor es el capital pendiente en ese momento.
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setPaso(1)} style={{ ...s.btn('rgba(255,255,255,0.06)'), border: '1px solid rgba(255,255,255,0.12)' }}>← Atrás</button>
          <button onClick={() => setPaso(3)} disabled={!form.pct_excedente || !form.excedente_estimado} style={{ ...s.btn('#4A90D9'), opacity: (!form.pct_excedente || !form.excedente_estimado) ? 0.5 : 1 }}>Ver el contrato →</button>
        </div>
      </div>
    </div>
  )

  // ====== PASO 3: CLÁUSULAS EN LENGUAJE SIMPLE ======
  if (paso === 3) return (
    <div style={s.page}>
      <div style={s.wrap}>
        <StepBar paso={paso} />
        <h1 style={s.h1}>Tu contrato de leasing</h1>
        <p style={s.sub}>Estas son las condiciones del acuerdo en lenguaje simple. Lee cada punto antes de firmar.</p>

        {/* Resumen visual */}
        <div style={{ ...s.card, borderColor: 'rgba(29,158,117,0.2)', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#1D9E75', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>Resumen del acuerdo</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
            {[
              { l: 'Beneficiaria', v: form.nombre_beneficiaria },
              { l: 'Equipo', v: form.tipo_equipo + ' ' + form.marca },
              { l: 'Valor del equipo', v: '$' + fmt(form.valor_equipo) + ' COP' },
              { l: 'Tu % del excedente para abonar', v: form.pct_excedente + '%' },
              { l: 'Excedente estimado/mes', v: '$' + fmt(form.excedente_estimado) + ' COP' },
              { l: 'Meses estimados', v: '~' + mesesEstimados + ' meses' },
            ].map(r => (
              <div key={r.l}>
                <div style={{ fontSize: '0.65rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{r.l}</div>
                <div style={{ color: '#fff', fontWeight: '600' }}>{r.v || '—'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cláusulas en lenguaje simple */}
        {[
          {
            n: '1', titulo: 'El equipo es tuyo para usar — pero no para vender',
            texto: 'Recibes el equipo y lo usas como si fuera tuyo. Puedes usarlo todos los días para producir. Lo que no puedes hacer es venderlo, prestarlo, empeñarlo ni usarlo como garantía de otra deuda mientras el contrato esté activo.'
          },
          {
            n: '2', titulo: 'Reportas tus ventas cada mes en la plataforma',
            texto: 'El último día de cada mes, ingresas tus ventas totales, costos y gastos fijos. El sistema calcula el excedente automáticamente y aplica el ' + form.pct_excedente + '% como abono al capital. Recibes un comprobante de cada abono.'
          },
          {
            n: '3', titulo: 'Si un mes produces poco, el abono es menor',
            texto: 'No hay cuota fija. Si un mes el negocio va mal, el abono es menor. Si va bien, pagas más rápido. Lo que sí es obligatorio es reportar — aunque el excedente sea cero, debes registrarlo en la plataforma.'
          },
          {
            n: '4', titulo: 'Tú cuidas el equipo y lo mantienes en buen estado',
            texto: 'El mantenimiento preventivo es tu responsabilidad. Si el equipo se daña por mal uso, la reparación va por tu cuenta. Si se daña por falla del fabricante o causas ajenas a ti, lo evaluamos juntos. Debes notificar cualquier daño en menos de 48 horas.'
          },
          {
            n: '5', titulo: 'Si el equipo es robado o se pierde',
            texto: 'En caso de robo, debes denunciar ante la Policía en menos de 24 horas y notificar a Escala. El seguro cubre el valor del equipo. Si no hay seguro, el saldo pendiente sigue siendo tu responsabilidad. Recomendamos asegurar el equipo desde el día de recepción.'
          },
          {
            n: '6', titulo: 'Incumplimiento: qué pasa si no reportas 3 meses seguidos',
            texto: 'Si no reportas tus ventas por 3 meses consecutivos sin justificación, Escala puede dar por terminado el contrato y recuperar el equipo. Antes de llegar a eso, te contactamos para entender qué está pasando. El objetivo siempre es encontrar una solución.'
          },
          {
            n: '7', titulo: 'Cuando terminas de pagar, la máquina es tuya',
            texto: 'Cuando el capital pendiente llega a cero, Escala emite una Carta de Liberación del Activo que certifica que la máquina es de tu propiedad. Puedes solicitar este documento en cualquier momento una vez pagado el total.'
          },
          {
            n: '8', titulo: 'Opción de compra anticipada',
            texto: form.opcion_compra === 'si'
              ? 'En cualquier momento puedes pagar el saldo pendiente y recibir la máquina a tu nombre de inmediato. El valor es exactamente el capital que le falta al inversionista para recuperar su inversión — sin intereses adicionales ni penalidades.'
              : 'Este contrato no incluye opción de compra anticipada. El proceso es pagar el excedente mensual hasta completar el total.'
          },
          {
            n: '9', titulo: 'Tus datos personales',
            texto: 'Tus datos se usan únicamente para administrar este contrato y cumplir con obligaciones legales. Escala cumple con la Ley 1581 de 2012 (Habeas Data). No vendemos ni compartimos tu información con terceros sin tu autorización, salvo cuando la ley lo exige.'
          },
          {
            n: '10', titulo: 'Si hay un problema entre las partes',
            texto: 'Primero intentamos resolverlo directamente. Si no hay acuerdo en 15 días, buscamos un conciliador autorizado. Si tampoco hay acuerdo, acudimos a los jueces civiles de Medellín. Escala como intermediario facilita la comunicación pero las partes son el inversionista y la beneficiaria.'
          },
        ].map(c => (
          <div key={c.n} style={s.clausula}>
            <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(29,158,117,0.15)', color: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '700', flexShrink: 0, marginTop: '2px' }}>{c.n}</div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', marginBottom: '0.375rem' }}>{c.titulo}</div>
                <div style={{ fontSize: '0.8rem', color: '#8FA3CC', lineHeight: '1.6' }}>{c.texto}</div>
              </div>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button onClick={() => setPaso(2)} style={{ ...s.btn('rgba(255,255,255,0.06)'), border: '1px solid rgba(255,255,255,0.12)' }}>← Atrás</button>
          <button onClick={() => setPaso(4)} style={s.btn('#4A90D9')}>Ir a firmar →</button>
        </div>
      </div>
    </div>
  )

  // ====== PASO 4: FIRMA DIGITAL ======
  if (paso === 4) return (
    <div style={s.page}>
      <div style={s.wrap}>
        <StepBar paso={paso} />
        <h1 style={s.h1}>Firma el contrato</h1>
        <p style={s.sub}>Al marcar cada punto confirmas que lo leíste y lo entendiste. Tu firma digital tiene validez legal en Colombia bajo la Ley 527 de 1999.</p>

        <div style={s.card}>
          {[
            { k: 'c1', t: 'Entiendo que el equipo es del inversionista hasta que pague el total' },
            { k: 'c2', t: 'Me comprometo a reportar mis ventas en la plataforma cada mes' },
            { k: 'c3', t: 'Acepto que el ' + form.pct_excedente + '% de mi excedente mensual se abona al capital' },
            { k: 'c4', t: 'Me hago responsable del cuidado y mantenimiento del equipo' },
            { k: 'c5', t: 'He leído y entendido todas las cláusulas del contrato' },
          ].map(item => (
            <div key={item.k} onClick={() => setAceptada(a => ({ ...a, [item.k]: !a[item.k] }))} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', padding: '0.875rem', background: aceptada[item.k] ? 'rgba(29,158,117,0.06)' : 'rgba(255,255,255,0.02)', border: '1px solid ' + (aceptada[item.k] ? 'rgba(29,158,117,0.25)' : 'rgba(255,255,255,0.07)'), borderRadius: '10px', marginBottom: '0.625rem', cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '5px', background: aceptada[item.k] ? '#1D9E75' : 'rgba(255,255,255,0.08)', border: '1px solid ' + (aceptada[item.k] ? '#1D9E75' : 'rgba(255,255,255,0.2)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                {aceptada[item.k] && <span style={{ color: '#fff', fontSize: '12px', fontWeight: '900' }}>✓</span>}
              </div>
              <span style={{ fontSize: '0.82rem', color: aceptada[item.k] ? '#fff' : '#8FA3CC', lineHeight: '1.5' }}>{item.t}</span>
            </div>
          ))}
        </div>

        {/* Nota sobre firma con Auco */}
        <div style={{ background: 'rgba(175,169,236,0.05)', border: '1px solid rgba(175,169,236,0.15)', borderRadius: '10px', padding: '0.875rem', marginBottom: '1.25rem', fontSize: '0.78rem', color: '#8FA3CC', lineHeight: '1.6' }}>
          <strong style={{ color: '#AFA9EC' }}>Firma electrónica válida:</strong> Al marcar cada punto y firmar, Escala registra tu consentimiento con validez legal bajo la Ley 527 de 1999. El contrato se envía por WhatsApp y email para que ambas partes lo firmen digitalmente.
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setPaso(3)} style={{ ...s.btn('rgba(255,255,255,0.06)'), border: '1px solid rgba(255,255,255,0.12)', flex: '0 0 auto', width: 'auto', padding: '0.75rem 1.25rem' }}>← Atrás</button>
          <button
            onClick={firmarContrato}
            disabled={!Object.values(aceptada).every(Boolean) || guardando}
            style={{ ...s.btn(Object.values(aceptada).every(Boolean) ? '#1D9E75' : 'rgba(255,255,255,0.06)'), opacity: (!Object.values(aceptada).every(Boolean) || guardando) ? 0.5 : 1, flex: 1 }}>
            {guardando ? 'Registrando firma...' : '✍️ Firmar contrato'}
          </button>
        </div>
      </div>
    </div>
  )

  // ====== PASO 5: CONFIRMACIÓN ======
  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <StepBar paso={5} />
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
          <h1 style={{ ...s.h1, textAlign: 'center', marginBottom: '0.5rem' }}>¡Contrato firmado!</h1>
          <p style={{ ...s.sub, textAlign: 'center', maxWidth: '400px', margin: '0 auto 2rem' }}>
            Tu firma quedó registrada. El contrato está pendiente de aprobación del ángel inversionista. Te notificamos cuando esté completo.
          </p>
          <div style={{ ...s.card, textAlign: 'left', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#1D9E75', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>Estado del contrato</div>
            {[
              { l: '✅ Tu firma', v: 'Registrada', c: '#1D9E75' },
              { l: '⏳ Firma del ángel', v: 'Pendiente', c: '#E8A020' },
              { l: '📦 Entrega del equipo', v: 'Después de la aprobación', c: '#8FA3CC' },
              { l: '📊 Primer reporte de ventas', v: 'El último día del mes', c: '#8FA3CC' },
            ].map(r => (
              <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#8FA3CC' }}>{r.l}</span>
                <span style={{ color: r.c, fontWeight: '600' }}>{r.v}</span>
              </div>
            ))}
          </div>
          <a href={`/proyectos/${id}/workspace`} style={{ ...s.btn('#1D9E75'), display: 'inline-block', textDecoration: 'none', width: 'auto', padding: '0.75rem 2rem' }}>
            Volver al workspace →
          </a>
        </div>
      </div>
    </div>
  )
}

function StepBar({ paso }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
      {PASOS.map((nombre, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
          <div style={s.step(i <= paso)}>
            {i < paso ? '✓' : i + 1}
          </div>
          <span style={{ fontSize: '0.72rem', color: i === paso ? '#fff' : i < paso ? '#1D9E75' : '#4B5563', fontWeight: i === paso ? '700' : '400', display: window?.innerWidth > 500 ? 'block' : i === paso ? 'block' : 'none' }}>{nombre}</span>
          {i < PASOS.length - 1 && <div style={{ width: '16px', height: '1px', background: i < paso ? '#1D9E75' : 'rgba(255,255,255,0.1)' }} />}
        </div>
      ))}
    </div>
  )
}
