'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

// Panel de quien tiene un equipo en leasing — sirve para cualquier activo
// (maquina de confeccion, freidora, secadora, vehiculo, herramienta).
// Pensado para celular: es donde lo van a abrir.

const ESTADOS = {
  pendiente_angel: { label: 'Esperando inversionista', color: '#E8A020', ayuda: 'Tu solicitud esta publicada. Te avisamos apenas alguien la tome.' },
  activo:          { label: 'Comprando tu equipo',     color: '#4A90D9', ayuda: 'Ya tienes inversionista. Escala esta comprando tu equipo.' },
  equipo_comprado: { label: 'Equipo comprado',         color: '#AFA9EC', ayuda: 'Tu equipo ya fue comprado. Estamos coordinando la entrega.' },
  entregado:       { label: 'Entregado',               color: '#5FD3A8', ayuda: 'Tu equipo ya esta contigo. Falta la capacitacion.' },
  en_operacion:    { label: 'En operacion',            color: '#1D9E75', ayuda: 'Todo listo. Reporta tu produccion cada mes.' },
  en_mora:         { label: 'Sin reportar',            color: '#D85A30', ayuda: 'Llevas varios meses sin reportar. Escribenos, siempre hay salida.' },
  reestructurado:  { label: 'Plan ajustado',           color: '#E8A020', ayuda: 'Acordamos un nuevo plan. Sigue reportando cada mes.' },
  liquidado:       { label: 'Pagado — es tuyo',        color: '#1D9E75', ayuda: 'Terminaste de pagar. El equipo es tuyo.' },
}

const fmt = v => '$' + Math.round(Number(v || 0)).toLocaleString('es-CO')

export default function MiEquipo() {
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
      else setContratos((d.contratos || []).filter(c => c.beneficiaria_id === session.user.id))
    } catch (e) { setErr(e.message) }
    setCargando(false)
  })() }, [])

  const s = {
    page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff', padding: '0 0 4rem' },
    wrap: { maxWidth: '520px', margin: '0 auto', padding: '2rem 1.25rem' },
    h1: { fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '0.3rem' },
    sub: { fontSize: '0.85rem', color: '#8FA3CC', marginBottom: '1.5rem' },
    card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '1.2rem', marginBottom: '1rem' },
    pill: (c) => ({ display: 'inline-block', fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.7rem', borderRadius: '99px', color: c, background: c + '22', border: `1px solid ${c}44` }),
    lbl: { fontSize: '0.7rem', fontWeight: '700', color: '#8FA3CC', letterSpacing: '0.05em', textTransform: 'uppercase' },
    big: { fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-0.02em' },
    btn: { display: 'block', textAlign: 'center', background: '#1D9E75', color: '#fff', borderRadius: '10px', padding: '0.85rem', fontSize: '0.92rem', fontWeight: '800', textDecoration: 'none', marginTop: '1rem' },
    ayuda: { background: 'rgba(255,255,255,0.03)', borderRadius: '9px', padding: '0.75rem', fontSize: '0.8rem', color: '#C8D4E8', lineHeight: 1.6, marginTop: '0.9rem' },
  }

  if (cargando) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8FA3CC' }}>Cargando…</div>

  if (!contratos.length) {
    return (
      <div style={s.page}><div style={s.wrap}>
        <div style={s.h1}>Mi equipo</div>
        <p style={s.sub}>Aquí verás tu equipo financiado, cuánto llevas pagado y cuándo reportar.</p>
        <div style={s.card}>
          <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>🔧</div>
          <div style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.4rem' }}>Todavía no tienes un equipo financiado</div>
          <p style={{ fontSize: '0.85rem', color: '#8FA3CC', lineHeight: 1.6 }}>
            Si necesitas una máquina, un horno, una secadora o cualquier equipo para tu negocio,
            puedes aplicar y un inversionista lo compra por ti.
          </p>
          <a href="/programa/aplicar" style={s.btn}>Aplicar por un equipo</a>
        </div>
      </div></div>
    )
  }

  return (
    <div style={s.page}><div style={s.wrap}>
      <div style={s.h1}>Mi equipo</div>
      <p style={s.sub}>{contratos.length === 1 ? 'Tu equipo financiado' : `Tus ${contratos.length} equipos financiados`}</p>

      {err && <div style={{ background: 'rgba(216,90,48,0.12)', color: '#FF9B76', borderRadius: '9px', padding: '0.75rem', fontSize: '0.85rem', marginBottom: '1rem' }}>{err}</div>}

      {contratos.map(c => {
        const est = ESTADOS[c.estado] || ESTADOS.activo
        const total = Number(c.valor_equipo || 0)
        const abonado = Number(c.capital_abonado || 0)
        const pendiente = Math.max(0, total - abonado)
        const pct = total ? Math.round((abonado / total) * 100) : 0
        const e = (c.entregas_equipo || [])[0]
        const operando = ['en_operacion', 'en_mora', 'reestructurado'].includes(c.estado)
        const listo = c.estado === 'liquidado'

        return (
          <div key={c.id} style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.8rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: '800' }}>
                  {c.tipo_equipo} {c.marca}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#8FA3CC', marginTop: '0.15rem' }}>
                  {c.modelo && `${c.modelo} · `}{fmt(total)}
                </div>
              </div>
              <span style={s.pill(est.color)}>{est.label}</span>
            </div>

            {/* Progreso — lo que mas le importa */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                <span style={s.lbl}>{listo ? 'Pagado completo' : 'Te falta'}</span>
                <span style={{ fontSize: '0.75rem', color: '#8FA3CC' }}>{pct}%</span>
              </div>
              <div style={{ ...s.big, color: listo ? '#1D9E75' : '#fff', marginBottom: '0.5rem' }}>
                {listo ? '¡Es tuyo!' : fmt(pendiente)}
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: listo ? '#1D9E75' : '#5FD3A8', transition: 'width .3s' }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.4rem' }}>
                Has abonado {fmt(abonado)} de {fmt(total)}
              </div>
            </div>

            {/* Linea de tiempo simple */}
            {e && (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.72rem' }}>
                <span style={{ color: e.fecha_compra ? '#5FD3A8' : '#4B5563' }}>{e.fecha_compra ? '✓' : '○'} Comprado</span>
                <span style={{ color: e.fecha_entrega ? '#5FD3A8' : '#4B5563' }}>{e.fecha_entrega ? '✓' : '○'} Entregado</span>
                <span style={{ color: e.fecha_capacitacion ? '#5FD3A8' : '#4B5563' }}>{e.fecha_capacitacion ? '✓' : '○'} Capacitación</span>
              </div>
            )}

            <div style={s.ayuda}>{est.ayuda}</div>

            {operando && (
              <a href={`/proyectos/${c.id}/workspace/equipos`} style={s.btn}>
                Reportar lo que produje este mes
              </a>
            )}
            {listo && (
              <div style={{ ...s.ayuda, background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.25)', marginTop: '1rem' }}>
                Terminaste de pagar tu equipo. Escala te envía la carta que certifica que ahora es tuyo.
              </div>
            )}
          </div>
        )
      })}

      <p style={{ fontSize: '0.78rem', color: '#6B7280', lineHeight: 1.6, textAlign: 'center', marginTop: '1.5rem' }}>
        Recuerda: no hay cuota fija. Si un mes produces menos, abonas menos.
        Lo importante es reportar siempre, aunque sea poco.
      </p>
    </div></div>
  )
}
