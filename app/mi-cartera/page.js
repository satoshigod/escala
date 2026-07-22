'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

// Panel del inversionista: su cartera de equipos financiados, cuanto ha
// recuperado y el estado real de cada uno. Transparencia sobre el activo,
// que es justo lo que lo hace entrar.

const ESTADOS = {
  pendiente_angel: { label: 'Por firmar',        color: '#E8A020' },
  activo:          { label: 'Comprando equipo',  color: '#4A90D9' },
  equipo_comprado: { label: 'Equipo comprado',   color: '#AFA9EC' },
  entregado:       { label: 'Entregado',         color: '#5FD3A8' },
  en_operacion:    { label: 'Produciendo',       color: '#1D9E75' },
  en_mora:         { label: 'Sin reportar',      color: '#D85A30' },
  reestructurado:  { label: 'Plan ajustado',     color: '#E8A020' },
  recuperacion:    { label: 'En recuperación',   color: '#D85A30' },
  liquidado:       { label: 'Recuperado 100%',   color: '#1D9E75' },
}
const fmt = v => '$' + Math.round(Number(v || 0)).toLocaleString('es-CO')

export default function MiCartera() {
  const [cargando, setCargando] = useState(true)
  const [contratos, setContratos] = useState([])
  const [err, setErr] = useState('')

  useEffect(() => { (async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/registro?modo=login'; return }
    try {
      const r = await fetch('/api/programa/entrega', { headers: { Authorization: 'Bearer ' + session.access_token } })
      const d = await r.json()
      if (d.error) setErr(d.error)
      else setContratos((d.contratos || []).filter(c => c.angel_id === session.user.id))
    } catch (e) { setErr(e.message) }
    setCargando(false)
  })() }, [])

  const s = {
    page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff', padding: '0 0 4rem' },
    wrap: { maxWidth: '620px', margin: '0 auto', padding: '2rem 1.25rem' },
    h1: { fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '0.3rem' },
    sub: { fontSize: '0.85rem', color: '#8FA3CC', marginBottom: '1.5rem' },
    kpis: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.6rem', marginBottom: '1.5rem' },
    kpi: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '11px', padding: '0.85rem' },
    card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '13px', padding: '1.1rem', marginBottom: '0.85rem' },
    pill: (c) => ({ display: 'inline-block', fontSize: '0.68rem', fontWeight: '800', padding: '0.15rem 0.65rem', borderRadius: '99px', color: c, background: c + '22', border: `1px solid ${c}44` }),
    lbl: { fontSize: '0.68rem', fontWeight: '700', color: '#8FA3CC', letterSpacing: '0.05em', textTransform: 'uppercase' },
    btn: { display: 'block', textAlign: 'center', background: '#1D9E75', color: '#fff', borderRadius: '10px', padding: '0.85rem', fontSize: '0.9rem', fontWeight: '800', textDecoration: 'none', marginTop: '1rem' },
  }

  if (cargando) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8FA3CC' }}>Cargando…</div>

  const invertido = contratos.reduce((a, c) => a + Number(c.valor_equipo || 0), 0)
  const recuperado = contratos.reduce((a, c) => a + Number(c.capital_abonado || 0), 0)
  const pctTotal = invertido ? Math.round((recuperado / invertido) * 100) : 0
  const enRiesgo = contratos.filter(c => ['en_mora', 'recuperacion'].includes(c.estado)).length

  if (!contratos.length) {
    return (
      <div style={s.page}><div style={s.wrap}>
        <div style={s.h1}>Mi cartera</div>
        <p style={s.sub}>Aquí verás los equipos que has financiado y cuánto has recuperado.</p>
        <div style={s.card}>
          <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>📈</div>
          <div style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.4rem' }}>Todavía no has financiado ningún equipo</div>
          <p style={{ fontSize: '0.85rem', color: '#8FA3CC', lineHeight: 1.6 }}>
            Cuando financias un equipo, la máquina queda a tu nombre hasta que se recupera el capital.
            Ves la producción reportada y los abonos en tiempo real.
          </p>
          <a href="/directorio-inversion" style={s.btn}>Ver oportunidades</a>
        </div>
      </div></div>
    )
  }

  return (
    <div style={s.page}><div style={s.wrap}>
      <div style={s.h1}>Mi cartera</div>
      <p style={s.sub}>{contratos.length} {contratos.length === 1 ? 'equipo financiado' : 'equipos financiados'}</p>

      {err && <div style={{ background: 'rgba(216,90,48,0.12)', color: '#FF9B76', borderRadius: '9px', padding: '0.75rem', fontSize: '0.85rem', marginBottom: '1rem' }}>{err}</div>}

      <div style={s.kpis}>
        <div style={s.kpi}><div style={{ fontSize: '1rem', fontWeight: '900' }}>{fmt(invertido)}</div><div style={{ fontSize: '0.7rem', color: '#8FA3CC', marginTop: '0.15rem' }}>Invertido</div></div>
        <div style={s.kpi}><div style={{ fontSize: '1rem', fontWeight: '900', color: '#5FD3A8' }}>{fmt(recuperado)}</div><div style={{ fontSize: '0.7rem', color: '#8FA3CC', marginTop: '0.15rem' }}>Recuperado · {pctTotal}%</div></div>
        <div style={s.kpi}><div style={{ fontSize: '1rem', fontWeight: '900', color: enRiesgo ? '#D85A30' : '#fff' }}>{enRiesgo}</div><div style={{ fontSize: '0.7rem', color: '#8FA3CC', marginTop: '0.15rem' }}>En riesgo</div></div>
      </div>

      {contratos.map(c => {
        const est = ESTADOS[c.estado] || ESTADOS.activo
        const total = Number(c.valor_equipo || 0)
        const abonado = Number(c.capital_abonado || 0)
        const pct = total ? Math.round((abonado / total) * 100) : 0
        const e = (c.entregas_equipo || [])[0]

        return (
          <div key={c.id} style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.8rem', marginBottom: '0.9rem' }}>
              <div>
                <div style={{ fontSize: '0.98rem', fontWeight: '800' }}>{c.tipo_equipo} {c.marca}</div>
                <div style={{ fontSize: '0.78rem', color: '#8FA3CC', marginTop: '0.15rem' }}>
                  {c.nombre_beneficiaria} · {c.ciudad}
                </div>
              </div>
              <span style={s.pill(est.color)}>{est.label}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
              <span style={s.lbl}>Capital recuperado</span>
              <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: '800' }}>{fmt(abonado)} de {fmt(total)}</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: c.estado === 'en_mora' ? '#D85A30' : '#4A90D9' }} />
            </div>

            {e && (e.fecha_entrega || e.serial_real) && (
              <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '0.6rem' }}>
                {e.fecha_entrega && `Entregado el ${new Date(e.fecha_entrega).toLocaleDateString('es-CO')}`}
                {e.serial_real && ` · Serial ${e.serial_real}`}
              </div>
            )}

            {c.estado === 'en_mora' && (
              <div style={{ background: 'rgba(216,90,48,0.1)', border: '1px solid rgba(216,90,48,0.25)', borderRadius: '8px', padding: '0.7rem', marginTop: '0.8rem', fontSize: '0.78rem', color: '#FFB79B', lineHeight: 1.55 }}>
                Escala está gestionando este caso. El equipo sigue siendo tuyo hasta que se recupere el capital.
              </div>
            )}
          </div>
        )
      })}

      <p style={{ fontSize: '0.78rem', color: '#6B7280', lineHeight: 1.6, textAlign: 'center', marginTop: '1.2rem' }}>
        El equipo queda a tu nombre hasta que el capital se recupera por completo.
      </p>
    </div></div>
  )
}
