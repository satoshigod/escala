'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

const ESTADOS = {
  recibida:       { label: 'Recibida',        color: '#8FA3CC' },
  en_revision:    { label: 'Por revisar',     color: '#E8A020' },
  info_pendiente: { label: 'Falta info',      color: '#AFA9EC' },
  preaprobada:    { label: 'Preaprobada',     color: '#4A90D9' },
  verificada:     { label: 'Verificada',      color: '#1D9E75' },
  cotizada:       { label: 'Cotizada',        color: '#1D9E75' },
  contratada:     { label: 'Contratada',      color: '#1D9E75' },
  rechazada:      { label: 'Rechazada',       color: '#6B7280' },
  caducada:       { label: 'Caducada',        color: '#6B7280' },
}
const BANDA_COLOR = { alta: '#1D9E75', media: '#E8A020', baja: '#8FA3CC' }
const fmt = v => '$' + Math.round(Number(v || 0)).toLocaleString('es-CO')

export default function AdminPrograma() {
  const [cargando, setCargando] = useState(true)
  const [sols, setSols] = useState([])
  const [resumen, setResumen] = useState({})
  const [filtro, setFiltro] = useState('todas')
  const [abierta, setAbierta] = useState(null)
  const [procesando, setProcesando] = useState(null)
  const [err, setErr] = useState('')

  async function cargar() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/registro?modo=login'; return }
    try {
      const r = await fetch('/api/programa/solicitudes', { headers: { Authorization: 'Bearer ' + session.access_token } })
      const d = await r.json()
      if (d.error) { setErr(d.error); setCargando(false); return }
      setSols(d.solicitudes || []); setResumen(d.resumen || {})
    } catch (e) { setErr(e.message) }
    setCargando(false)
  }
  useEffect(() => { cargar() }, [])

  async function mover(id, estado, motivo) {
    setProcesando(id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const r = await fetch('/api/programa/solicitudes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
        body: JSON.stringify({ id, estado, motivo }),
      })
      const d = await r.json()
      if (d.error) { alert('No se pudo: ' + d.error); setProcesando(null); return }
      setAbierta(null); await cargar()
    } catch (e) { alert('Error: ' + e.message) }
    setProcesando(null)
  }

  const s = {
    page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff', padding: '0 0 4rem' },
    wrap: { maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.25rem' },
    h1: { fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '0.3rem' },
    sub: { fontSize: '0.85rem', color: '#8FA3CC', marginBottom: '1.5rem' },
    kpis: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '0.7rem', marginBottom: '1.5rem' },
    kpi: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px', padding: '0.8rem' },
    tabs: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.2rem' },
    tab: (on) => ({ fontSize: '0.78rem', fontWeight: '700', padding: '0.4rem 0.8rem', borderRadius: '99px', cursor: 'pointer', border: `1px solid ${on ? '#1D9E75' : 'rgba(255,255,255,0.12)'}`, background: on ? 'rgba(29,158,117,0.14)' : 'transparent', color: on ? '#5FD3A8' : '#8FA3CC' }),
    row: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '11px', padding: '0.9rem 1rem', marginBottom: '0.6rem', cursor: 'pointer' },
    pill: (c) => ({ display: 'inline-block', fontSize: '0.68rem', fontWeight: '800', padding: '0.15rem 0.6rem', borderRadius: '99px', color: c, background: c + '22', border: `1px solid ${c}44` }),
    btn: { background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 0.9rem', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter,sans-serif' },
    btnR: { background: 'rgba(216,90,48,0.15)', color: '#FF9B76', border: '1px solid rgba(216,90,48,0.3)' },
    modal: { position: 'fixed', inset: 0, background: 'rgba(4,8,18,0.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem', zIndex: 50 },
    box: { background: '#0C1528', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '1.4rem', maxWidth: '520px', width: '100%', maxHeight: '88vh', overflowY: 'auto' },
    lbl: { fontSize: '0.7rem', fontWeight: '700', color: '#8FA3CC', letterSpacing: '0.05em', textTransform: 'uppercase' },
  }

  if (cargando) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8FA3CC' }}>Cargando…</div>

  const lista = filtro === 'todas' ? sols : sols.filter(x => x.estado === filtro)
  const porRevisar = (resumen.en_revision || 0) + (resumen.recibida || 0)

  return (
    <div style={s.page}><div style={s.wrap}>
      <a href="/dashboard" style={{ fontSize: '0.8rem', color: '#8FA3CC', textDecoration: 'none' }}>← Dashboard</a>
      <div style={{ ...s.h1, marginTop: '1rem' }}>Programa 10 Máquinas</div>
      <div style={s.sub}>Bandeja de solicitudes · {sols.length} en total</div>

      {err && <div style={{ background: 'rgba(216,90,48,0.12)', color: '#FF9B76', borderRadius: '9px', padding: '0.75rem', fontSize: '0.85rem', marginBottom: '1rem' }}>{err}</div>}

      <div style={s.kpis}>
        <div style={s.kpi}><div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#E8A020' }}>{porRevisar}</div><div style={{ fontSize: '0.72rem', color: '#8FA3CC' }}>Por revisar</div></div>
        <div style={s.kpi}><div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#4A90D9' }}>{resumen.preaprobada || 0}</div><div style={{ fontSize: '0.72rem', color: '#8FA3CC' }}>Preaprobadas</div></div>
        <div style={s.kpi}><div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1D9E75' }}>{(resumen.verificada || 0) + (resumen.cotizada || 0)}</div><div style={{ fontSize: '0.72rem', color: '#8FA3CC' }}>Verificadas</div></div>
        <div style={s.kpi}><div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff' }}>{resumen.contratada || 0}<span style={{ fontSize: '0.9rem', color: '#8FA3CC' }}>/10</span></div><div style={{ fontSize: '0.72rem', color: '#8FA3CC' }}>Máquinas colocadas</div></div>
      </div>

      <div style={s.tabs}>
        <div style={s.tab(filtro === 'todas')} onClick={() => setFiltro('todas')}>Todas</div>
        {Object.keys(ESTADOS).filter(e => resumen[e]).map(e => (
          <div key={e} style={s.tab(filtro === e)} onClick={() => setFiltro(e)}>{ESTADOS[e].label} ({resumen[e]})</div>
        ))}
      </div>

      {lista.length === 0 ? (
        <div style={{ color: '#6B7280', fontSize: '0.85rem', padding: '2rem 0', textAlign: 'center' }}>
          No hay solicitudes {filtro !== 'todas' ? 'en este estado' : 'todavía'}.
        </div>
      ) : lista.map(x => {
        const est = ESTADOS[x.estado] || ESTADOS.recibida
        return (
          <div key={x.id} style={s.row} onClick={() => setAbierta(x)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.8rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: '800' }}>{x.nombre}</div>
                <div style={{ fontSize: '0.78rem', color: '#8FA3CC', marginTop: '0.15rem' }}>
                  {x.tipo_equipo} · {fmt(x.valor_estimado)} · {x.barrio || x.ciudad}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.3rem' }}>
                  {x.anios_oficio} años · {x.produccion_semanal} prendas/sem · {fmt(x.ingreso_mensual)}/mes
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {x.score !== null && (
                  <div style={{ fontSize: '1.2rem', fontWeight: '900', color: BANDA_COLOR[x.banda] || '#8FA3CC' }}>{x.score}</div>
                )}
                <div style={{ marginTop: '0.3rem' }}><span style={s.pill(est.color)}>{est.label}</span></div>
              </div>
            </div>
          </div>
        )
      })}

      {abierta && (
        <div style={s.modal} onClick={() => setAbierta(null)}>
          <div style={s.box} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '1.15rem', fontWeight: '900' }}>{abierta.nombre}</div>
            <div style={{ fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '1rem' }}>
              {abierta.celular} · {abierta.barrio || abierta.ciudad}
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: '9px', padding: '0.7rem' }}>
                <div style={s.lbl}>Score</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: BANDA_COLOR[abierta.banda] }}>{abierta.score}<span style={{ fontSize: '0.8rem', color: '#6B7280' }}>/100</span></div>
              </div>
              <div style={{ flex: 2, background: 'rgba(255,255,255,0.04)', borderRadius: '9px', padding: '0.7rem' }}>
                <div style={s.lbl}>Equipo</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', marginTop: '0.2rem' }}>{abierta.tipo_equipo}</div>
                <div style={{ fontSize: '0.8rem', color: '#8FA3CC' }}>{fmt(abierta.valor_estimado)}</div>
              </div>
            </div>

            {abierta.score_detalle?.resumen && (
              <div style={{ background: 'rgba(29,158,117,0.07)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '9px', padding: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#C8D4E8', lineHeight: 1.6 }}>{abierta.score_detalle.resumen}</div>
              </div>
            )}

            <div style={s.lbl}>Su negocio hoy</div>
            <div style={{ fontSize: '0.85rem', color: '#C8D4E8', lineHeight: 1.8, margin: '0.4rem 0 1rem' }}>
              {abierta.anios_oficio} años en el oficio · {abierta.produccion_semanal} prendas por semana<br />
              Le vende a: {abierta.a_quien_vende} · Ingreso: {fmt(abierta.ingreso_mensual)}/mes<br />
              {abierta.tiene_maquina ? 'Ya tiene máquina propia' : 'No tiene máquina propia'}
              {abierta.para_que && <><br />"{abierta.para_que}"</>}
            </div>

            {abierta.score_detalle?.plan?.rango_meses && (
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '9px', padding: '0.7rem', marginBottom: '1.2rem' }}>
                <div style={s.lbl}>Plan estimado</div>
                <div style={{ fontSize: '0.85rem', color: '#C8D4E8', marginTop: '0.3rem' }}>
                  {fmt(abierta.score_detalle.plan.abono_mensual_estimado)}/mes · {abierta.score_detalle.plan.rango_meses}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['recibida', 'en_revision'].includes(abierta.estado) && (
                <>
                  <button style={s.btn} disabled={procesando === abierta.id}
                          onClick={() => mover(abierta.id, 'preaprobada')}>Preaprobar</button>
                  <button style={{ ...s.btn, ...s.btnR }} disabled={procesando === abierta.id}
                          onClick={() => { const m = prompt('Motivo del rechazo:'); if (m) mover(abierta.id, 'rechazada', m) }}>Rechazar</button>
                </>
              )}
              {abierta.estado === 'preaprobada' && (
                <button style={s.btn} disabled={procesando === abierta.id}
                        onClick={() => mover(abierta.id, 'verificada')}>Marcar verificada</button>
              )}
              {abierta.estado === 'verificada' && (
                <button style={s.btn} disabled={procesando === abierta.id}
                        onClick={() => mover(abierta.id, 'cotizada')}>Marcar cotizada</button>
              )}
              <button style={{ ...s.btn, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#8FA3CC' }}
                      onClick={() => setAbierta(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div></div>
  )
}
