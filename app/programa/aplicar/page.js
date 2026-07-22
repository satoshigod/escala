'use client'

import { useState } from 'react'

const EQUIPOS = [
  { id: 'overlock',   emoji: '🧵', label: 'Overlock / Fileteadora', valor: 4500000 },
  { id: 'plana',      emoji: '📏', label: 'Máquina plana',          valor: 1800000 },
  { id: 'collarin',   emoji: '🪡', label: 'Collarín / Recubridora', valor: 5000000 },
  { id: 'cortadora',  emoji: '✂️', label: 'Cortadora',              valor: 2200000 },
  { id: 'otra',       emoji: '⚙️', label: 'Otra máquina',           valor: null },
]

const CLIENTES = [
  { id: 'marca',    label: 'Una marca o fábrica fija' },
  { id: 'taller',   label: 'Un taller que me da maquila' },
  { id: 'tienda',   label: 'Tiendas o boutiques' },
  { id: 'directo',  label: 'Directo al cliente (redes, feria)' },
]

const fmt = v => '$' + Number(v || 0).toLocaleString('es-CO')

export default function AplicarPrograma() {
  const [paso, setPaso] = useState(1)
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')
  const [f, setF] = useState({
    tipo_equipo: '', para_que: '', valor_estimado: '',
    anios_oficio: '', produccion_semanal: '', a_quien_vende: '', ingreso_mensual: '', tiene_maquina: false,
    nombre: '', celular: '', cedula: '', barrio: '', ciudad: 'Medellin', email: '',
  })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  const puedeP1 = f.tipo_equipo && f.valor_estimado
  const puedeP2 = f.anios_oficio !== '' && f.produccion_semanal !== '' && f.a_quien_vende && f.ingreso_mensual !== ''
  const puedeP3 = f.nombre.trim().length > 2 && f.celular.trim().length >= 7

  async function enviar() {
    setEnviando(true); setError('')
    try {
      const res = await fetch('/api/programa/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...f,
          valor_estimado: parseFloat(f.valor_estimado) || null,
          anios_oficio: parseFloat(f.anios_oficio) || 0,
          produccion_semanal: parseFloat(f.produccion_semanal) || 0,
          ingreso_mensual: parseFloat(f.ingreso_mensual) || 0,
          origen: typeof window !== 'undefined' ? window.location.search : null,
        }),
      })
      const d = await res.json()
      if (d.error) { setError(d.error); setEnviando(false); return }
      setResultado(d)
    } catch (e) { setError(e.message) }
    setEnviando(false)
  }

  const s = {
    page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff', padding: '0 0 4rem' },
    wrap: { maxWidth: '560px', margin: '0 auto', padding: '2.5rem 1.25rem' },
    ey: { fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '0.6rem' },
    h1: { fontSize: '1.65rem', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '0.6rem' },
    sub: { fontSize: '0.9rem', color: '#8FA3CC', lineHeight: 1.65, marginBottom: '1.75rem' },
    prog: { display: 'flex', gap: '0.4rem', marginBottom: '1.5rem' },
    seg: (on) => ({ flex: 1, height: '4px', borderRadius: '99px', background: on ? '#1D9E75' : 'rgba(255,255,255,0.12)' }),
    pasoTxt: { fontSize: '0.72rem', fontWeight: '700', color: '#8FA3CC', letterSpacing: '0.05em', marginBottom: '1rem' },
    label: { display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#C8D4E8', marginBottom: '0.45rem' },
    hint: { fontSize: '0.72rem', color: '#6B7280', marginTop: '0.3rem', lineHeight: 1.5 },
    input: { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '9px', padding: '0.8rem 0.9rem', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', marginBottom: '1.1rem', fontFamily: 'Inter,sans-serif' },
    opt: (on) => ({ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.75rem 0.85rem', borderRadius: '10px', cursor: 'pointer', marginBottom: '0.5rem', background: on ? 'rgba(29,158,117,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${on ? '#1D9E75' : 'rgba(255,255,255,0.1)'}` }),
    btn: { width: '100%', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.9rem', fontSize: '0.95rem', fontWeight: '800', cursor: 'pointer', fontFamily: 'Inter,sans-serif' },
    btnG: { background: 'transparent', color: '#8FA3CC', border: 'none', fontSize: '0.85rem', cursor: 'pointer', padding: '0.7rem', fontFamily: 'Inter,sans-serif' },
    card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem' },
  }

  // ---------- Resultado ----------
  if (resultado) {
    const ok = resultado.estado !== 'rechazada'
    return (
      <div style={s.page}><div style={s.wrap}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{ok ? '✅' : '🤝'}</div>
        <div style={s.h1}>{ok ? 'Recibimos tu solicitud' : 'Gracias por aplicar'}</div>
        <p style={{ ...s.sub, marginBottom: '1.5rem' }}>{resultado.mensaje}</p>

        {ok && resultado.plan_estimado?.rango_meses && (
          <div style={s.card}>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#5FD3A8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Estimado con lo que nos contaste</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#C8D4E8', marginBottom: '0.35rem' }}>
              <span>Abono mensual aproximado</span><span style={{ color: '#fff', fontWeight: '800' }}>{fmt(resultado.plan_estimado.abono_mensual_estimado)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#C8D4E8' }}>
              <span>Tiempo estimado</span><span style={{ color: '#fff', fontWeight: '800' }}>{resultado.plan_estimado.rango_meses}</span>
            </div>
            <p style={{ ...s.hint, marginTop: '0.7rem' }}>
              No es una cuota fija: si un mes produces menos, abonas menos. El monto exacto se define cuando confirmemos el valor de la máquina.
            </p>
          </div>
        )}

        <a href="/" style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>Volver a Escala</a>
      </div></div>
    )
  }

  // ---------- Formulario ----------
  return (
    <div style={s.page}><div style={s.wrap}>
      <div style={s.ey}>Programa 10 Máquinas · Medellín</div>
      <div style={s.h1}>Tu máquina, sin cuota fija.</div>
      <p style={s.sub}>Un inversionista compra la máquina y tú la pagas desde lo que produces. Si un mes trabajas menos, abonas menos. Cuando terminas de pagar, es tuya.</p>

      <div style={s.prog}>{[1,2,3].map(n => <div key={n} style={s.seg(paso >= n)} />)}</div>
      <div style={s.pasoTxt}>Paso {paso} de 3 · menos de 2 minutos</div>

      {error && <div style={{ background: 'rgba(216,90,48,0.12)', border: '1px solid rgba(216,90,48,0.3)', color: '#FF9B76', borderRadius: '9px', padding: '0.75rem', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}

      {paso === 1 && (
        <>
          <label style={s.label}>¿Qué máquina necesitas?</label>
          {EQUIPOS.map(e => (
            <div key={e.id} style={s.opt(f.tipo_equipo === e.id)}
                 onClick={() => { set('tipo_equipo', e.id); if (e.valor) set('valor_estimado', String(e.valor)) }}>
              <span style={{ fontSize: '1.1rem' }}>{e.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{e.label}</div>
                {e.valor && <div style={{ fontSize: '0.75rem', color: '#8FA3CC' }}>≈ {fmt(e.valor)}</div>}
              </div>
            </div>
          ))}

          <label style={{ ...s.label, marginTop: '1rem' }}>¿Cuánto cuesta aproximadamente?</label>
          <input style={s.input} type="number" inputMode="numeric" value={f.valor_estimado}
                 onChange={e => set('valor_estimado', e.target.value)} placeholder="4500000" />

          <label style={s.label}>¿Para qué la necesitas? <span style={{ color: '#6B7280', fontWeight: 400 }}>· opcional</span></label>
          <input style={s.input} value={f.para_que} onChange={e => set('para_que', e.target.value)}
                 placeholder="Ej: tengo pedidos que estoy rechazando" />

          <button style={{ ...s.btn, opacity: puedeP1 ? 1 : 0.4 }} disabled={!puedeP1} onClick={() => setPaso(2)}>Continuar →</button>
        </>
      )}

      {paso === 2 && (
        <>
          <label style={s.label}>¿Hace cuántos años trabajas en confección?</label>
          <input style={s.input} type="number" inputMode="numeric" value={f.anios_oficio}
                 onChange={e => set('anios_oficio', e.target.value)} placeholder="5" />

          <label style={s.label}>¿Cuántas prendas haces por semana?</label>
          <input style={s.input} type="number" inputMode="numeric" value={f.produccion_semanal}
                 onChange={e => set('produccion_semanal', e.target.value)} placeholder="200" />
          <div style={{ ...s.hint, marginTop: '-0.85rem', marginBottom: '1.1rem' }}>Un aproximado está bien. No tiene que ser exacto.</div>

          <label style={s.label}>¿A quién le vendes hoy?</label>
          {CLIENTES.map(c => (
            <div key={c.id} style={s.opt(f.a_quien_vende === c.id)} onClick={() => set('a_quien_vende', c.id)}>
              <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{c.label}</div>
            </div>
          ))}

          <label style={{ ...s.label, marginTop: '1rem' }}>¿Cuánto te entra al mes por tu trabajo?</label>
          <input style={s.input} type="number" inputMode="numeric" value={f.ingreso_mensual}
                 onChange={e => set('ingreso_mensual', e.target.value)} placeholder="1800000" />
          <div style={{ ...s.hint, marginTop: '-0.85rem', marginBottom: '1.1rem' }}>Nos sirve para calcular un plan que puedas pagar sin ahogarte.</div>

          <div style={s.opt(f.tiene_maquina)} onClick={() => set('tiene_maquina', !f.tiene_maquina)}>
            <span style={{ fontSize: '1.1rem' }}>{f.tiene_maquina ? '☑️' : '⬜'}</span>
            <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Ya tengo al menos una máquina propia</div>
          </div>

          <button style={{ ...s.btn, marginTop: '1rem', opacity: puedeP2 ? 1 : 0.4 }} disabled={!puedeP2} onClick={() => setPaso(3)}>Continuar →</button>
          <button style={s.btnG} onClick={() => setPaso(1)}>← Volver</button>
        </>
      )}

      {paso === 3 && (
        <>
          <label style={s.label}>¿Cómo te llamas?</label>
          <input style={s.input} value={f.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Nombre y apellido" />

          <label style={s.label}>¿A qué número te llamamos?</label>
          <input style={s.input} type="tel" inputMode="tel" value={f.celular} onChange={e => set('celular', e.target.value)} placeholder="300 000 0000" />

          <label style={s.label}>¿En qué barrio queda tu taller?</label>
          <input style={s.input} value={f.barrio} onChange={e => set('barrio', e.target.value)} placeholder="Ej: Robledo" />

          <label style={s.label}>Correo <span style={{ color: '#6B7280', fontWeight: 400 }}>· opcional</span></label>
          <input style={s.input} type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="tucorreo@ejemplo.com" />

          <div style={{ ...s.card, marginBottom: '1.1rem' }}>
            <p style={{ fontSize: '0.78rem', color: '#8FA3CC', lineHeight: 1.6, margin: 0 }}>
              No pedimos documentos todavía. Si tu solicitud avanza, te llamamos para agendar una visita corta a tu taller.
            </p>
          </div>

          <button style={{ ...s.btn, opacity: puedeP3 && !enviando ? 1 : 0.4 }} disabled={!puedeP3 || enviando} onClick={enviar}>
            {enviando ? 'Enviando...' : 'Enviar mi solicitud'}
          </button>
          <button style={s.btnG} onClick={() => setPaso(2)}>← Volver</button>
        </>
      )}
    </div></div>
  )
}
