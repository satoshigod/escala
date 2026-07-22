'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'

const HITOS = [
  { id: 'compra',       label: 'Equipo comprado',  desde: 'activo' },
  { id: 'entrega',      label: 'Entregado',        desde: 'equipo_comprado' },
  { id: 'capacitacion', label: 'Capacitación OK',  desde: 'entregado' },
]

const ESTADO_COLOR = {
  borrador: '#6B7280', pendiente_angel: '#E8A020', activo: '#4A90D9',
  equipo_comprado: '#AFA9EC', entregado: '#5FD3A8', en_operacion: '#1D9E75',
  en_mora: '#D85A30', reestructurado: '#E8A020', recuperacion: '#D85A30',
  liquidado: '#1D9E75', rechazado: '#6B7280',
}
const NIVEL_COLOR = { al_dia: '#1D9E75', recordatorio: '#E8A020', contacto: '#E8A020', alerta: '#D85A30', acuerdo: '#D85A30', recuperacion: '#D85A30' }
const fmt = v => '$' + Math.round(Number(v || 0)).toLocaleString('es-CO')

export default function OperacionPrograma() {
  const [cargando, setCargando] = useState(true)
  const [tab, setTab] = useState('equipos')
  const [contratos, setContratos] = useState([])
  const [mora, setMora] = useState({ casos: [], resumen: {} })
  const [kpis, setKpis] = useState(null)
  const [proc, setProc] = useState(null)
  const [err, setErr] = useState('')

  async function cargar() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/registro?modo=login'; return }
    const h = { Authorization: 'Bearer ' + session.access_token }
    try {
      const [e, m, k] = await Promise.all([
        fetch('/api/programa/entrega', { headers: h }).then(r => r.json()),
        fetch('/api/programa/mora', { headers: h }).then(r => r.json()),
        fetch('/api/programa/kpis', { headers: h }).then(r => r.json()),
      ])
      if (e.error) setErr(e.error); else setContratos(e.contratos || [])
      if (!m.error) setMora({ casos: m.casos || [], resumen: m.resumen || {} })
      if (!k.error) setKpis(k)
    } catch (ex) { setErr(ex.message) }
    setCargando(false)
  }
  useEffect(() => { cargar() }, [])

  async function registrarHito(contrato_id, hito) {
    const extra = {}
    if (hito === 'entrega') {
      const serial = prompt('Serial real del equipo entregado (opcional):')
      if (serial) extra.serial_real = serial
      const quien = prompt('¿Quién instaló? (opcional):')
      if (quien) extra.instalado_por = quien
    }
    if (hito === 'capacitacion') {
      const quien = prompt('¿Quién capacitó? (opcional):')
      if (quien) extra.capacitado_por = quien
    }
    setProc(contrato_id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const r = await fetch('/api/programa/entrega', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
        body: JSON.stringify({ contrato_id, hito, ...extra }),
      })
      const d = await r.json()
      if (d.error) { alert('No se pudo: ' + d.error); setProc(null); return }
      await cargar()
    } catch (e) { alert('Error: ' + e.message) }
    setProc(null)
  }

  async function accionMora(contrato_id, accion) {
    let nota = null, nuevo_pct = null
    if (accion === 'reestructurar') {
      nuevo_pct = prompt('Nuevo % del excedente (ej: 50):')
      if (!nuevo_pct) return
      nota = prompt('Nota del acuerdo:') || ''
    } else if (accion === 'recuperacion') {
      if (!confirm('Esto inicia el retiro del equipo. Es la última instancia. ¿Continuar?')) return
      nota = prompt('Justificación del comité:') || ''
    } else {
      nota = prompt('Nota de la gestión (opcional):') || ''
    }
    setProc(contrato_id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const r = await fetch('/api/programa/mora', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
        body: JSON.stringify({ contrato_id, accion, nota, nuevo_pct }),
      })
      const d = await r.json()
      if (d.error) { alert('No se pudo: ' + d.error); setProc(null); return }
      await cargar()
    } catch (e) { alert('Error: ' + e.message) }
    setProc(null)
  }

  async function emitirCarta(contrato_id) {
    if (!confirm('Esto certifica que el equipo pasa a propiedad de la persona. ¿Emitir la carta?')) return
    setProc(contrato_id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const r = await fetch('/api/programa/liberacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
        body: JSON.stringify({ contrato_id }),
      })
      const d = await r.json()
      if (d.error) { alert('No se pudo: ' + d.error); setProc(null); return }
      alert('Carta emitida. Se notifico a ambas partes.')
      await cargar()
    } catch (e) { alert('Error: ' + e.message) }
    setProc(null)
  }

  const s = {
    page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff', padding: '0 0 4rem' },
    wrap: { maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.25rem' },
    h1: { fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.02em' },
    sub: { fontSize: '0.85rem', color: '#8FA3CC', marginBottom: '1.5rem' },
    kpis: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '0.7rem', marginBottom: '1.5rem' },
    kpi: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px', padding: '0.85rem' },
    tabs: { display: 'flex', gap: '0.4rem', marginBottom: '1.2rem' },
    tab: (on) => ({ fontSize: '0.82rem', fontWeight: '700', padding: '0.45rem 1rem', borderRadius: '99px', cursor: 'pointer', border: `1px solid ${on ? '#1D9E75' : 'rgba(255,255,255,0.12)'}`, background: on ? 'rgba(29,158,117,0.14)' : 'transparent', color: on ? '#5FD3A8' : '#8FA3CC' }),
    row: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '11px', padding: '0.9rem 1rem', marginBottom: '0.6rem' },
    pill: (c) => ({ display: 'inline-block', fontSize: '0.68rem', fontWeight: '800', padding: '0.15rem 0.6rem', borderRadius: '99px', color: c, background: c + '22', border: `1px solid ${c}44` }),
    btn: { background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '7px', padding: '0.42rem 0.8rem', fontSize: '0.76rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter,sans-serif' },
    btnW: { background: 'rgba(232,160,32,0.15)', color: '#E8A020', border: '1px solid rgba(232,160,32,0.3)' },
    btnR: { background: 'rgba(216,90,48,0.15)', color: '#FF9B76', border: '1px solid rgba(216,90,48,0.3)' },
    vacio: { color: '#6B7280', fontSize: '0.85rem', padding: '2rem 0', textAlign: 'center' },
  }

  if (cargando) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8FA3CC' }}>Cargando…</div>

  const operando = contratos.filter(c => ['en_operacion', 'en_mora', 'reestructurado'].includes(c.estado)).length
  const entregados = contratos.filter(c => ['entregado', 'en_operacion', 'en_mora', 'reestructurado', 'liquidado'].includes(c.estado)).length
  const capital = contratos.reduce((a, c) => a + Number(c.valor_equipo || 0), 0)

  return (
    <div style={s.page}><div style={s.wrap}>
      <a href="/admin/programa" style={{ fontSize: '0.8rem', color: '#8FA3CC', textDecoration: 'none' }}>← Solicitudes</a>
      <div style={{ ...s.h1, marginTop: '1rem' }}>Operación del piloto</div>
      <div style={s.sub}>Las 10 máquinas: compra, entrega y recaudo</div>

      {err && <div style={{ background: 'rgba(216,90,48,0.12)', color: '#FF9B76', borderRadius: '9px', padding: '0.75rem', fontSize: '0.85rem', marginBottom: '1rem' }}>{err}</div>}

      <div style={s.kpis}>
        <div style={s.kpi}><div style={{ fontSize: '1.5rem', fontWeight: '900' }}>{contratos.length}<span style={{ fontSize: '0.9rem', color: '#8FA3CC' }}>/10</span></div><div style={{ fontSize: '0.72rem', color: '#8FA3CC' }}>Contratos</div></div>
        <div style={s.kpi}><div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#5FD3A8' }}>{entregados}</div><div style={{ fontSize: '0.72rem', color: '#8FA3CC' }}>Entregadas</div></div>
        <div style={s.kpi}><div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1D9E75' }}>{operando}</div><div style={{ fontSize: '0.72rem', color: '#8FA3CC' }}>Operando</div></div>
        <div style={s.kpi}><div style={{ fontSize: '1.5rem', fontWeight: '900', color: mora.resumen.en_mora ? '#D85A30' : '#fff' }}>{mora.resumen.en_mora || 0}</div><div style={{ fontSize: '0.72rem', color: '#8FA3CC' }}>En mora</div></div>
        <div style={s.kpi}><div style={{ fontSize: '1.15rem', fontWeight: '900' }}>{fmt(capital)}</div><div style={{ fontSize: '0.72rem', color: '#8FA3CC' }}>Capital colocado</div></div>
      </div>

      <div style={s.tabs}>
        <div style={s.tab(tab === 'equipos')} onClick={() => setTab('equipos')}>Equipos y entrega</div>
        <div style={s.tab(tab === 'mora')} onClick={() => setTab('mora')}>Recaudo y mora {mora.resumen.en_mora ? `(${mora.resumen.en_mora})` : ''}</div>
        <div style={s.tab(tab === 'kpis')} onClick={() => setTab('kpis')}>KPIs</div>
      </div>

      {tab === 'equipos' && (
        contratos.length === 0 ? <div style={s.vacio}>Todavía no hay contratos de leasing.</div> :
        contratos.map(c => {
          const hito = HITOS.find(h => h.desde === c.estado)
          const e = (c.entregas_equipo || [])[0]
          return (
            <div key={c.id} style={s.row}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: '800' }}>{c.nombre_beneficiaria || 'Sin nombre'}</div>
                  <div style={{ fontSize: '0.78rem', color: '#8FA3CC', marginTop: '0.15rem' }}>
                    {c.tipo_equipo} {c.marca} · {fmt(c.valor_equipo)} · {c.numero_contrato}
                  </div>
                  {e && (
                    <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '0.35rem' }}>
                      {e.fecha_compra && '✓ Comprado '}
                      {e.fecha_entrega && '· ✓ Entregado '}
                      {e.fecha_capacitacion && '· ✓ Capacitada'}
                      {e.serial_real && ` · Serial ${e.serial_real}`}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={s.pill(ESTADO_COLOR[c.estado] || '#8FA3CC')}>{c.estado}</span>
                  {Number(c.valor_equipo || 0) - Number(c.capital_abonado || 0) <= 0 && c.estado !== 'liquidado' && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <button style={s.btn} disabled={proc === c.id} onClick={() => emitirCarta(c.id)}>
                        {proc === c.id ? '...' : 'Emitir carta de propiedad'}
                      </button>
                    </div>
                  )}
                  {hito && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <button style={s.btn} disabled={proc === c.id} onClick={() => registrarHito(c.id, hito.id)}>
                        {proc === c.id ? '...' : `Registrar: ${hito.label}`}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })
      )}

      {tab === 'kpis' && kpis && (
        <>
          <div style={{ ...s.row, background: 'rgba(29,158,117,0.07)', borderColor: 'rgba(29,158,117,0.25)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#5FD3A8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Meta del piloto</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '900' }}>{kpis.meta.contratadas}<span style={{ fontSize: '1rem', color: '#8FA3CC' }}>/{kpis.meta.objetivo_piloto} máquinas</span></div>
            <div style={{ fontSize: '0.8rem', color: '#8FA3CC', marginTop: '0.2rem' }}>Faltan {kpis.meta.faltan} por colocar</div>
          </div>

          <div style={{ ...s.row }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', marginBottom: '0.7rem' }}>Embudo de conversión</div>
            {kpis.embudo.map(e => (
              <div key={e.paso} style={{ marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#C8D4E8' }}>{e.paso}</span>
                  <span style={{ fontWeight: '800' }}>{e.valor} <span style={{ color: '#6B7280', fontWeight: '400' }}>· {e.conversion}%</span></span>
                </div>
                <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ width: `${e.conversion}%`, height: '100%', background: '#1D9E75' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ ...s.row }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', marginBottom: '0.7rem' }}>Cartera</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.7rem' }}>
              <div><div style={{ fontSize: '1.05rem', fontWeight: '900' }}>{fmt(kpis.cartera.capital_colocado)}</div><div style={{ fontSize: '0.72rem', color: '#8FA3CC' }}>Colocado</div></div>
              <div><div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#5FD3A8' }}>{kpis.cartera.pct_recuperado}%</div><div style={{ fontSize: '0.72rem', color: '#8FA3CC' }}>Recuperado</div></div>
              <div><div style={{ fontSize: '1.05rem', fontWeight: '900', color: kpis.cartera.tasa_mora_capital > 15 ? '#D85A30' : '#fff' }}>{kpis.cartera.tasa_mora_capital}%</div><div style={{ fontSize: '0.72rem', color: '#8FA3CC' }}>Mora sobre capital</div></div>
              <div><div style={{ fontSize: '1.05rem', fontWeight: '900' }}>{kpis.reporte.cumplimiento}%</div><div style={{ fontSize: '0.72rem', color: '#8FA3CC' }}>Cumple el reporte</div></div>
            </div>
          </div>

          <div style={{ ...s.row }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', marginBottom: '0.7rem' }}>¿El scoring separa bien?</div>
            {kpis.scoring.map(b => (
              <div key={b.banda} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#C8D4E8', textTransform: 'capitalize' }}>Banda {b.banda}</span>
                <span style={{ color: '#8FA3CC' }}>{b.solicitudes} sol · {b.tasa}% llegó a verificación</span>
              </div>
            ))}
          </div>

          <div style={{ ...s.row }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', marginBottom: '0.7rem' }}>Preguntas que el piloto debe contestar</div>
            {kpis.preguntas_clave.map((q, i) => (
              <div key={i} style={{ marginBottom: '0.55rem' }}>
                <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: '700' }}>{q.pregunta}</div>
                <div style={{ fontSize: '0.75rem', color: '#8FA3CC' }}>{q.responde}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'mora' && (
        mora.casos.length === 0 ? <div style={s.vacio}>No hay equipos en operación todavía.</div> :
        mora.casos.map(c => (
          <div key={c.contrato_id} style={s.row}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: '800' }}>{c.beneficiaria}</div>
                <div style={{ fontSize: '0.78rem', color: '#8FA3CC', marginTop: '0.15rem' }}>
                  {c.equipo} · {c.pct_recuperado}% recuperado · pendiente {fmt(c.capital_pendiente)}
                </div>
                <div style={{ fontSize: '0.75rem', color: c.dias_sin_reportar > 35 ? '#E8A020' : '#6B7280', marginTop: '0.35rem' }}>
                  {c.dias_sin_reportar} días sin reportar · {c.accion_sugerida}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={s.pill(NIVEL_COLOR[c.nivel] || '#8FA3CC')}>{c.nivel.replace('_', ' ')}</span>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {c.nivel !== 'al_dia' && c.estado === 'en_operacion' && (
                    <>
                      <button style={{ ...s.btn, ...s.btnW }} disabled={proc === c.contrato_id} onClick={() => accionMora(c.contrato_id, 'recordar')}>Recordar</button>
                      <button style={{ ...s.btn, ...s.btnR }} disabled={proc === c.contrato_id} onClick={() => accionMora(c.contrato_id, 'marcar_mora')}>Marcar mora</button>
                    </>
                  )}
                  {['en_mora', 'reestructurado'].includes(c.estado) && (
                    <>
                      <button style={s.btn} disabled={proc === c.contrato_id} onClick={() => accionMora(c.contrato_id, 'poner_al_dia')}>Al día</button>
                      <button style={{ ...s.btn, ...s.btnW }} disabled={proc === c.contrato_id} onClick={() => accionMora(c.contrato_id, 'reestructurar')}>Reestructurar</button>
                      <button style={{ ...s.btn, ...s.btnR }} disabled={proc === c.contrato_id} onClick={() => accionMora(c.contrato_id, 'recuperacion')}>Recuperar equipo</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div></div>
  )
}
