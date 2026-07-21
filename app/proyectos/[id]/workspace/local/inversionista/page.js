'use client'
// Panel del inversionista — negocio en local comercial
// Capital invertido, saldo pendiente, historial, semaforo, proyeccion

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../../../../lib/supabase'

const fmt = (n) => Math.round(parseFloat(n || 0)).toLocaleString('es-CO')

const SEMAFORO = {
  verde: { color: '#1D9E75', bg: 'rgba(29,158,117,0.12)', border: 'rgba(29,158,117,0.3)', icono: '🟢' },
  amarillo: { color: '#E8A020', bg: 'rgba(232,160,32,0.12)', border: 'rgba(232,160,32,0.3)', icono: '🟡' },
  rojo: { color: '#E05555', bg: 'rgba(224,85,85,0.12)', border: 'rgba(224,85,85,0.3)', icono: '🔴' },
}

export default function PanelInversionistaLocal() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { cargar() }, [id])

  async function cargar() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch(`/api/local-comercial/inversionista?proyecto_id=${id}`, {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
    const d = await res.json()
    if (!res.ok) { setError(d.error); setCargando(false); return }
    setData(d)
    setCargando(false)
  }

  const s = {
    page: { minHeight: '100vh', background: '#0B1628', fontFamily: 'Inter,sans-serif', color: '#fff' },
    nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    wrap: { maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' },
    card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem' },
    grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' },
    statCard: (color) => ({ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)`, borderRadius: '12px', padding: '1rem 1.25rem', borderTop: `3px solid ${color}` }),
  }

  if (cargando) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8FA3CC' }}>Cargando...</div>
  if (error) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E05555' }}>{error}</div>
  if (!data) return null

  const { local, proyecto, reportes, semaforo, resumen } = data
  const sem = SEMAFORO[semaforo.estado]
  const pct = resumen.pct_recuperado
  const canon_anio = parseFloat(local.canon_mensual) * 12

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href={`/proyectos/${id}/workspace`} style={{ fontSize: '0.85rem', color: '#8FA3CC', textDecoration: 'none' }}>← Workspace</a>
        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff' }}>📊 {proyecto.nombre} — Vista inversionista</div>
        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{local.ciudad}</div>
      </nav>

      <div style={s.wrap}>

        {/* Semaforo */}
        <div style={{ ...s.card, background: sem.bg, borderColor: sem.border, marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{sem.icono}</span>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: sem.color }}>{semaforo.mensaje}</div>
              <div style={{ fontSize: '0.75rem', color: '#8FA3CC', marginTop: '2px' }}>
                {resumen.dias_reportados} dias reportados · Negocio: {local.nombre_negocio} · {local.tipo_negocio}
              </div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '0.68rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fase actual</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: local.fase_actual === 'repago' ? '#4A90D9' : local.fase_actual === 'regalia' ? '#E8A020' : '#1D9E75' }}>
                {local.fase_actual === 'repago' ? 'Repago' : local.fase_actual === 'regalia' ? 'Regalía' : 'Libre'}
              </div>
            </div>
          </div>
        </div>

        {/* Stats principales */}
        <div style={s.grid3}>
          <div style={s.statCard('#4A90D9')}>
            <div style={{ fontSize: '0.68rem', color: '#6B7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Capital invertido</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em' }}>${fmt(resumen.capital_invertido)}</div>
            <div style={{ fontSize: '0.72rem', color: '#8FA3CC', marginTop: '4px' }}>COP</div>
          </div>
          <div style={s.statCard('#1D9E75')}>
            <div style={{ fontSize: '0.68rem', color: '#6B7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recuperado</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1D9E75', letterSpacing: '-0.02em' }}>${fmt(resumen.capital_recuperado)}</div>
            <div style={{ fontSize: '0.72rem', color: '#8FA3CC', marginTop: '4px' }}>+ ${fmt(resumen.intereses_cobrados)} intereses</div>
          </div>
          <div style={s.statCard(resumen.saldo_pendiente > 0 ? '#E8A020' : '#1D9E75')}>
            <div style={{ fontSize: '0.68rem', color: '#6B7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saldo pendiente</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: resumen.saldo_pendiente > 0 ? '#E8A020' : '#1D9E75', letterSpacing: '-0.02em' }}>${fmt(resumen.saldo_pendiente)}</div>
            <div style={{ fontSize: '0.72rem', color: '#8FA3CC', marginTop: '4px' }}>
              {resumen.dias_estimados_recuperacion ? `~${resumen.dias_estimados_recuperacion} dias para recuperar` : 'Sin proyeccion aun'}
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div style={{ ...s.card }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff' }}>Progreso de recuperacion</div>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1D9E75' }}>{pct}%</div>
          </div>
          <div style={{ height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden', marginBottom: '0.75rem' }}>
            <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: pct >= 100 ? '#1D9E75' : pct >= 50 ? '#4A90D9' : '#E8A020', borderRadius: '5px', transition: 'width 0.5s' }}></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>Abono capital</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>${fmt(resumen.capital_recuperado)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>Intereses cobrados</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#E05555' }}>${fmt(resumen.intereses_cobrados)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>Total recibido</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1D9E75' }}>${fmt(resumen.capital_recuperado + resumen.intereses_cobrados)}</div>
            </div>
          </div>
        </div>

        {/* Info del negocio y local */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={s.card}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#8FA3CC', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>El negocio</div>
            {[
              ['Nombre', local.nombre_negocio],
              ['Tipo', local.tipo_negocio],
              ['Ciudad', local.ciudad],
              ['Direccion', local.direccion_local],
              ['Margen declarado', `${local.margen_pct}%`],
              ['Venta dia normal', `$${fmt(local.ventas_dia_normal)}`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#6B7280' }}>{k}</span>
                <span style={{ color: '#fff', fontWeight: '500' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={s.card}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#8FA3CC', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>El arrendamiento</div>
            {[
              ['Propietario', local.propietario_nombre],
              ['Telefono', local.propietario_telefono],
              ['Canon mensual', `$${fmt(local.canon_mensual)}`],
              ['Deposito', `${local.meses_deposito} meses`],
              ['Adecuacion', local.necesita_adecuacion ? `$${fmt(local.presupuesto_adecuacion)}` : 'No requiere'],
              ['Arriendos anuales', `$${fmt(canon_anio)}`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#6B7280' }}>{k}</span>
                <span style={{ color: '#fff', fontWeight: '500' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Opcion de salida anticipada del comerciante */}
        <div style={{ ...s.card, borderColor: 'rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff', marginBottom: '0.75rem' }}>Opcion de salida anticipada del operador</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(224,85,85,0.06)', border: '1px solid rgba(224,85,85,0.2)', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ fontSize: '0.68rem', color: '#E05555', fontWeight: '700', marginBottom: '6px' }}>Si sale en Fase 1 (pagando capital)</div>
              <div style={{ fontSize: '0.75rem', color: '#C8D4E8', marginBottom: '8px', lineHeight: '1.5' }}>Tasa pactada pendiente + 4% del total de arriendos del año</div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>+ ${fmt(canon_anio * 0.04)}</div>
            </div>
            <div style={{ background: 'rgba(232,160,32,0.06)', border: '1px solid rgba(232,160,32,0.2)', borderRadius: '10px', padding: '1rem' }}>
              <div style={{ fontSize: '0.68rem', color: '#E8A020', fontWeight: '700', marginBottom: '6px' }}>Si sale en Fase 2 (regalia)</div>
              <div style={{ fontSize: '0.75rem', color: '#C8D4E8', marginBottom: '8px', lineHeight: '1.5' }}>Tasa pactada pendiente + 8% del total de arriendos del año</div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>+ ${fmt(canon_anio * 0.08)}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '0.75rem' }}>Total arriendos del año: ${fmt(canon_anio)} (12 meses × ${fmt(local.canon_mensual)})</div>
        </div>

        {/* Historial de reportes */}
        <div style={s.card}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', marginBottom: '1rem' }}>Historial de reportes ({reportes.length} dias)</div>
          {reportes.length === 0 ? (
            <div style={{ fontSize: '0.82rem', color: '#6B7280', textAlign: 'center', padding: '2rem' }}>El operador aun no ha reportado ventas</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '0.5rem', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '4px' }}>
                {['Fecha', 'Ventas', 'Excedente', 'Intereses', 'Pago inv.'].map(h => (
                  <div key={h} style={{ fontSize: '0.65rem', color: '#6B7280', fontWeight: '600', textAlign: h !== 'Fecha' ? 'right' : 'left' }}>{h}</div>
                ))}
              </div>
              {reportes.map((r, i) => {
                const sinReporte = i > 0 && calcularGapDias(reportes[i - 1].fecha, r.fecha) > 1
                return (
                  <div key={r.id}>
                    {sinReporte && (
                      <div style={{ fontSize: '0.65rem', color: '#E8A020', padding: '4px 0', textAlign: 'center', background: 'rgba(232,160,32,0.06)', borderRadius: '4px', margin: '4px 0' }}>
                        Sin reporte {calcularGapDias(reportes[i - 1].fecha, r.fecha) - 1} dia(s)
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '0.5rem', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#8FA3CC' }}>{new Date(r.fecha + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</div>
                      <div style={{ fontSize: '0.75rem', color: '#fff', textAlign: 'right' }}>${fmt(r.ventas_total)}</div>
                      <div style={{ fontSize: '0.75rem', color: r.excedente > 0 ? '#1D9E75' : '#E8A020', textAlign: 'right' }}>{r.excedente > 0 ? '+' : ''}${fmt(r.excedente)}</div>
                      <div style={{ fontSize: '0.75rem', color: '#E05555', textAlign: 'right' }}>${fmt(r.intereses_dia)}</div>
                      <div style={{ fontSize: '0.75rem', color: '#4A90D9', fontWeight: '600', textAlign: 'right' }}>${fmt(r.pago_inversionista)}</div>
                    </div>
                  </div>
                )
              })}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '0.5rem', padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '4px' }}>
                <div style={{ fontSize: '0.72rem', color: '#8FA3CC', fontWeight: '700' }}>Total</div>
                <div style={{ fontSize: '0.72rem', color: '#fff', textAlign: 'right', fontWeight: '700' }}>${fmt(resumen.total_ventas_periodo)}</div>
                <div></div>
                <div></div>
                <div style={{ fontSize: '0.72rem', color: '#4A90D9', textAlign: 'right', fontWeight: '700' }}>${fmt(resumen.total_pagado_inversionista)}</div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}

function calcularGapDias(fechaAntes, fechaDespues) {
  const a = new Date(fechaAntes + 'T12:00:00')
  const b = new Date(fechaDespues + 'T12:00:00')
  return Math.round(Math.abs(a - b) / (1000 * 60 * 60 * 24))
}
