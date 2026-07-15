'use client'
// Panel del operador — negocio en local comercial
// Reporte diario de ventas + estado del waterfall

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../../../lib/supabase'

const fmt = (n) => Math.round(parseFloat(n || 0)).toLocaleString('es-CO')

export default function PanelLocalComercial() {
  const { id } = useParams()
  const [local, setLocal] = useState(null)
  const [reportes, setReportes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [yaReportoHoy, setYaReportoHoy] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    ventas_efectivo: '',
    ventas_breb: '',
    nota: '',
  })

  useEffect(() => {
    cargar()
  }, [id])

  async function cargar() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch(`/api/local-comercial/reporte-diario?proyecto_id=${id}`, {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
    const data = await res.json()
    if (data.local) setLocal(data.local)
    if (data.reportes) {
      setReportes(data.reportes)
      const hoy = new Date().toISOString().split('T')[0]
      setYaReportoHoy(data.reportes.some(r => r.fecha === hoy))
    }
    setCargando(false)
  }

  async function reportar() {
    const efectivo = parseFloat(form.ventas_efectivo || 0)
    const breb = parseFloat(form.ventas_breb || 0)
    if (efectivo + breb <= 0) { setError('Ingresa las ventas del dia'); return }
    setEnviando(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/local-comercial/reporte-diario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ proyecto_id: id, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResultado(data.resumen)
      await cargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const s = {
    page: { minHeight: '100vh', background: '#0B1628', fontFamily: 'Inter,sans-serif', color: '#fff', padding: '0 0 4rem' },
    nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    wrap: { maxWidth: '680px', margin: '0 auto', padding: '2rem 1.5rem' },
    card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem' },
    label: { fontSize: '0.78rem', fontWeight: '700', color: '#C8D4E8', marginBottom: '0.4rem', display: 'block' },
    sublabel: { fontSize: '0.7rem', color: '#6B7280', marginBottom: '0.5rem', display: 'block', marginTop: '-0.25rem' },
    input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '0.7rem 0.875rem', color: '#fff', fontSize: '0.9rem', outline: 'none', fontFamily: 'Inter,sans-serif', marginBottom: '0.875rem', boxSizing: 'border-box' },
    btn: { width: '100%', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.875rem', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter,sans-serif' },
  }

  if (cargando) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: '#8FA3CC' }}>Cargando...</div>
  if (!local) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: '#8FA3CC' }}>Proyecto no encontrado</div>

  const saldo_pendiente = parseFloat(local.capital_total) - parseFloat(local.capital_pagado || 0)
  const pct_pagado = Math.round((parseFloat(local.capital_pagado || 0) / parseFloat(local.capital_total)) * 100)
  const hoy = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href={`/proyectos/${id}/workspace`} style={{ fontSize: '0.85rem', color: '#8FA3CC', textDecoration: 'none' }}>← Workspace</a>
        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff' }}>🏪 {local.nombre_negocio}</div>
        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{local.ciudad}</div>
      </nav>

      <div style={s.wrap}>

        {/* Estado actual */}
        <div style={{ ...s.card, borderColor: local.fase_actual === 'repago' ? 'rgba(74,144,217,0.3)' : local.fase_actual === 'regalia' ? 'rgba(232,160,32,0.3)' : 'rgba(29,158,117,0.3)', background: local.fase_actual === 'repago' ? 'rgba(74,144,217,0.06)' : local.fase_actual === 'regalia' ? 'rgba(232,160,32,0.06)' : 'rgba(29,158,117,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: '700', color: '#8FA3CC', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                {local.fase_actual === 'repago' ? 'Fase 1 - Pagando al inversionista' : local.fase_actual === 'regalia' ? 'Fase 2 - Regalía' : 'Fase 3 - Libre'}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.03em' }}>
                ${fmt(saldo_pendiente)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#8FA3CC', marginTop: '2px' }}>saldo pendiente con el inversionista</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1D9E75' }}>{pct_pagado}%</div>
              <div style={{ fontSize: '0.75rem', color: '#8FA3CC' }}>pagado</div>
            </div>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
            <div style={{ height: '100%', width: `${pct_pagado}%`, background: '#1D9E75', borderRadius: '4px', transition: 'width 0.5s' }}></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>Capital total</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>${fmt(local.capital_total)}</div>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>Pagado</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1D9E75' }}>${fmt(local.capital_pagado)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>Intereses</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#E05555' }}>${fmt(local.intereses_pagados)}</div>
            </div>
          </div>
        </div>

        {/* Resultado del ultimo reporte */}
        {resultado && (
          <div style={{ ...s.card, borderColor: 'rgba(29,158,117,0.3)', background: 'rgba(29,158,117,0.06)', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1D9E75', marginBottom: '0.875rem' }}>Reporte de hoy procesado</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                ['Ventas totales del dia', `$${fmt(resultado.ventas_total)}`, '#fff'],
                ['- Costo del producto', `-$${fmt(resultado.costo_producto_dia)}`, '#E05555'],
                ['- Gastos fijos del dia', `-$${fmt(resultado.fijo_dia)}`, '#E05555'],
                ['= Excedente', `$${fmt(resultado.excedente)}`, resultado.excedente > 0 ? '#1D9E75' : '#E8A020'],
              ].map(([label, value, color]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.82rem' }}>
                  <span style={{ color: '#8FA3CC' }}>{label}</span>
                  <span style={{ fontWeight: '600', color }}>{value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.9rem', marginTop: '4px' }}>
                <span style={{ color: '#fff', fontWeight: '600' }}>Pago al inversionista hoy</span>
                <span style={{ fontWeight: '700', color: '#4A90D9' }}>${fmt(resultado.pago_inversionista)}</span>
              </div>
              {resultado.intereses_dia > 0 && (
                <div style={{ fontSize: '0.72rem', color: '#6B7280', paddingTop: '4px' }}>
                  Intereses del dia: ${fmt(resultado.intereses_dia)} | Abono capital: ${fmt(resultado.abono_capital)}
                </div>
              )}
            </div>
            <div style={{ marginTop: '0.875rem', padding: '0.75rem', background: 'rgba(74,144,217,0.08)', borderRadius: '8px', fontSize: '0.78rem', color: '#4A90D9' }}>
              Paga <strong>${fmt(resultado.pago_inversionista)}</strong> via BREB al numero que te indico Escala. Saldo pendiente: <strong>${fmt(resultado.saldo_pendiente)}</strong>
            </div>
          </div>
        )}

        {/* Formulario de reporte diario */}
        {!yaReportoHoy && !resultado ? (
          <div style={s.card}>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '0.25rem' }}>Reporte de ventas de hoy</div>
            <div style={{ fontSize: '0.78rem', color: '#6B7280', marginBottom: '1.25rem' }}>{hoy}</div>

            <div style={{ background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.78rem', color: '#8FA3CC', lineHeight: '1.6' }}>
              Reporta todo lo que vendiste hoy — tanto lo que recibiste en efectivo como lo que te pagaron por BREB. Escala calcula automaticamente cuanto le corresponde al inversionista.
            </div>

            <label style={s.label}>¿Cuánto vendiste en efectivo hoy?</label>
            <span style={s.sublabel}>Lo que recibiste en billetes — si no vendiste nada en efectivo, pon $0</span>
            <input
              style={s.input}
              type="number"
              placeholder="120.000"
              value={form.ventas_efectivo}
              onChange={e => setForm(f => ({ ...f, ventas_efectivo: e.target.value }))}
            />

            <label style={s.label}>¿Cuánto te pagaron por BREB hoy?</label>
            <span style={s.sublabel}>Transferencias Nequi, Daviplata, bancolombia u otra app — si no recibiste, pon $0</span>
            <input
              style={s.input}
              type="number"
              placeholder="60.000"
              value={form.ventas_breb}
              onChange={e => setForm(f => ({ ...f, ventas_breb: e.target.value }))}
            />

            {/* Preview en tiempo real */}
            {(parseFloat(form.ventas_efectivo || 0) + parseFloat(form.ventas_breb || 0)) > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.875rem', marginBottom: '0.875rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#6B7280', marginBottom: '6px' }}>Asi quedaria el calculo:</div>
                {(() => {
                  const total = parseFloat(form.ventas_efectivo || 0) + parseFloat(form.ventas_breb || 0)
                  const costo = total * (1 - parseFloat(local.margen_pct) / 100)
                  const fijo = parseFloat(local.fijo_dia)
                  const exc = total - costo - fijo
                  const tasa_diaria = parseFloat(local.tasa_mensual || 3) / 100 / 30
                  const saldo = parseFloat(local.capital_total) - parseFloat(local.capital_pagado || 0)
                  const intereses = exc > 0 ? Math.round(saldo * tasa_diaria) : 0
                  const abono = exc > intereses ? Math.round(exc - intereses) : 0
                  const pago = Math.max(0, Math.min(exc, intereses + abono))
                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#8FA3CC', padding: '2px 0' }}><span>Total ventas</span><span>${fmt(total)}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#E05555', padding: '2px 0' }}><span>- Costo producto</span><span>-${fmt(costo)}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#E05555', padding: '2px 0' }}><span>- Gastos fijos del dia</span><span>-${fmt(fijo)}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '600', color: exc > 0 ? '#1D9E75' : '#E8A020', padding: '4px 0', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '4px' }}><span>Excedente</span><span>${fmt(exc)}</span></div>
                      {exc > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', color: '#4A90D9', padding: '4px 0' }}><span>Pagas al inversionista</span><span>${fmt(pago)}</span></div>}
                      {exc <= 0 && <div style={{ fontSize: '0.75rem', color: '#E8A020', padding: '4px 0' }}>Hoy no hay excedente — no pagas al inversionista. El deficit se acumula.</div>}
                    </>
                  )
                })()}
              </div>
            )}

            <label style={s.label}>Nota del dia (opcional)</label>
            <input style={s.input} placeholder="Ej: Dia lento por lluvia, tuve una venta grande en la tarde..." value={form.nota} onChange={e => setForm(f => ({ ...f, nota: e.target.value }))} />

            {error && <div style={{ fontSize: '0.8rem', color: '#E05555', marginBottom: '0.875rem', padding: '0.75rem', background: 'rgba(224,85,85,0.08)', borderRadius: '8px' }}>{error}</div>}

            <button style={{ ...s.btn, opacity: enviando ? 0.7 : 1 }} onClick={reportar} disabled={enviando}>
              {enviando ? 'Guardando...' : 'Reportar ventas del dia →'}
            </button>
          </div>
        ) : yaReportoHoy && !resultado ? (
          <div style={{ ...s.card, textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✅</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.4rem' }}>Ya reportaste las ventas de hoy</div>
            <div style={{ fontSize: '0.8rem', color: '#8FA3CC' }}>Vuelve manana para reportar el siguiente dia.</div>
          </div>
        ) : null}

        {/* Historial de ultimos 30 dias */}
        {reportes.length > 0 && (
          <div style={s.card}>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', marginBottom: '1rem' }}>Historial de reportes</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {reportes.slice(0, 10).map((r, i) => (
                <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', padding: '8px 0', borderBottom: i < 9 && i < reportes.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#8FA3CC' }}>{new Date(r.fecha + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</div>
                  <div style={{ fontSize: '0.75rem', color: '#fff', textAlign: 'right' }}>${fmt(r.ventas_total)}</div>
                  <div style={{ fontSize: '0.75rem', color: r.excedente > 0 ? '#1D9E75' : '#E8A020', textAlign: 'right' }}>{r.excedente > 0 ? '+' : ''}{fmt(r.excedente)}</div>
                  <div style={{ fontSize: '0.75rem', color: '#4A90D9', textAlign: 'right' }}>${fmt(r.pago_inversionista)}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '4px' }}>
              <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>Fecha</div>
              <div style={{ fontSize: '0.68rem', color: '#6B7280', textAlign: 'right' }}>Ventas</div>
              <div style={{ fontSize: '0.68rem', color: '#6B7280', textAlign: 'right' }}>Excedente</div>
              <div style={{ fontSize: '0.68rem', color: '#6B7280', textAlign: 'right' }}>Pago inv.</div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
