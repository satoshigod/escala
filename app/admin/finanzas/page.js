'use client'
// /admin/finanzas — Panel financiero consolidado de toda la plataforma Escala
// Solo accesible para admin_ids

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

const fmt = (n) => Math.round(parseFloat(n || 0)).toLocaleString('es-CO')

export default function AdminFinanzasPage() {
  const [data, setData] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('resumen')

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setCargando(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError('Debes iniciar sesion'); setCargando(false); return }
    const res = await fetch('/api/admin/finanzas', { headers: { Authorization: `Bearer ${session.access_token}` } })
    const d = await res.json()
    if (!d.ok) { setError(d.error); setCargando(false); return }
    setData(d)
    setCargando(false)
  }

  async function verificarFondeo(fondeo_id) {
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/presupuesto/fondeo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ fondeo_id, accion: 'verificar' }),
    })
    cargar()
  }

  const s = {
    page: { minHeight: '100vh', background: '#0B1628', fontFamily: 'Inter,sans-serif', color: '#fff' },
    nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    wrap: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' },
    card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' },
    stat: (color) => ({ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)`, borderRadius: '10px', padding: '0.875rem', textAlign: 'center', borderTop: `3px solid ${color}` }),
    btn: (color) => ({ background: color, color: '#fff', border: 'none', borderRadius: '6px', padding: '0.4rem 0.875rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }),
  }

  if (cargando) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8FA3CC' }}>Cargando panel financiero...</div>
  if (error) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E05555' }}>{error}</div>
  if (!data) return null

  const { resumen } = data

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href="/dashboard" style={{ fontSize: '1rem', fontWeight: '900', color: '#fff', textDecoration: 'none', letterSpacing: '-0.03em' }}>Esca<span style={{ color: '#1D9E75' }}>la</span></a>
        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff' }}>Admin — Finanzas</div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a href="/admin" style={{ fontSize: '0.78rem', color: '#8FA3CC', textDecoration: 'none' }}>← Admin</a>
          <a href="/admin/local-comercial" style={{ fontSize: '0.78rem', color: '#8FA3CC', textDecoration: 'none' }}>Locales</a>
        </div>
      </nav>

      <div style={s.wrap}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '0.4rem' }}>Panel financiero — Escala</h1>
          <p style={{ fontSize: '0.82rem', color: '#8FA3CC' }}>Capital en movimiento, fondeos pendientes, locales activos y alertas de mora.</p>
        </div>

        {/* Alertas criticas */}
        {(resumen.fondeos_por_verificar > 0 || resumen.locales_en_mora > 0) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {resumen.fondeos_por_verificar > 0 && (
              <div style={{ background: 'rgba(232,160,32,0.08)', border: '1px solid rgba(232,160,32,0.3)', borderRadius: '10px', padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#E8A020' }}>⚠️ {resumen.fondeos_por_verificar} transferencia{resumen.fondeos_por_verificar > 1 ? 's' : ''} pendiente{resumen.fondeos_por_verificar > 1 ? 's' : ''} de verificacion</span>
                <button onClick={() => setTab('verificar')} style={s.btn('#E8A020')}>Ver ahora</button>
              </div>
            )}
            {resumen.locales_en_mora > 0 && (
              <div style={{ background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.3)', borderRadius: '10px', padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#E05555' }}>🔴 {resumen.locales_en_mora} negocio{resumen.locales_en_mora > 1 ? 's' : ''} sin reporte en mas de 3 dias</span>
                <button onClick={() => setTab('mora')} style={s.btn('#E05555')}>Ver mora</button>
              </div>
            )}
          </div>
        )}

        {/* Stats globales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Capital total en movimiento', valor: `$${fmt(resumen.capital_en_movimiento)}`, color: '#4A90D9' },
            { label: 'Capital presupuesto verificado', valor: `$${fmt(resumen.capital_presupuesto_verificado)}`, color: '#1D9E75' },
            { label: 'Pendiente de verificar', valor: `$${fmt(resumen.capital_presupuesto_pendiente)}`, color: '#E8A020' },
            { label: 'Capital local total', valor: `$${fmt(resumen.capital_local_total)}`, color: '#AFA9EC' },
            { label: 'Capital local pagado', valor: `$${fmt(resumen.capital_local_pagado)}`, color: '#1D9E75' },
            { label: 'Intereses cobrados (locales)', valor: `$${fmt(resumen.intereses_local_total)}`, color: '#E05555' },
            { label: 'Locales activos', valor: resumen.locales_activos, color: '#4A90D9' },
            { label: 'Locales en mora', valor: resumen.locales_en_mora, color: resumen.locales_en_mora > 0 ? '#E05555' : '#1D9E75' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.875rem', textAlign: 'center', borderTop: `2px solid ${s.color}` }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: s.color, letterSpacing: '-0.02em' }}>{s.valor}</div>
              <div style={{ fontSize: '0.62rem', color: '#6B7280', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: '1.4' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {[
            { id: 'verificar', label: `Verificar (${data.fondeos_por_verificar?.length || 0})` },
            { id: 'fondeos', label: `Fondeos recientes (${data.fondeos_recientes?.length || 0})` },
            { id: 'mora', label: `Mora (${data.locales_en_mora?.length || 0})` },
            { id: 'locales', label: `Locales (${data.locales?.length || 0})` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? '#1D9E75' : 'rgba(255,255,255,0.06)', border: '1px solid ' + (tab === t.id ? '#1D9E75' : 'rgba(255,255,255,0.12)'), color: tab === t.id ? '#fff' : '#8FA3CC', borderRadius: '20px', padding: '0.3rem 0.875rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenido por tab */}

        {tab === 'verificar' && (
          <div>
            {data.fondeos_por_verificar?.length === 0 ? (
              <div style={{ ...s.card, textAlign: 'center', color: '#6B7280', padding: '2rem' }}>No hay transferencias pendientes de verificacion</div>
            ) : data.fondeos_por_verificar?.map(f => (
              <div key={f.id} style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '2px' }}>{f.presupuesto_items?.nombre}</div>
                    <div style={{ fontSize: '0.75rem', color: '#8FA3CC' }}>{f.presupuesto_items?.proyectos?.nombre} · Inv: {f.perfiles?.nombre} ({f.perfiles?.email})</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>{new Date(f.created_at).toLocaleDateString('es-CO')}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1rem', fontWeight: '700', color: '#E8A020' }}>${fmt(f.monto)}</div>
                      <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>{f.a_cambio_de}</div>
                    </div>
                    <button onClick={() => verificarFondeo(f.id)} style={s.btn('#1D9E75')}>Verificar ✓</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'fondeos' && (
          <div>
            {data.fondeos_recientes?.map(f => (
              <div key={f.id} style={{ ...s.card, padding: '0.875rem 1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem', alignItems: 'center', fontSize: '0.78rem' }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: '600' }}>{f.presupuesto_items?.nombre || '-'}</div>
                    <div style={{ color: '#6B7280' }}>{f.presupuesto_items?.proyectos?.nombre}</div>
                  </div>
                  <div style={{ color: '#8FA3CC' }}>{f.perfiles?.nombre}</div>
                  <div style={{ color: '#E8A020', fontWeight: '600' }}>${fmt(f.monto)}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', background: f.estado === 'verificado' ? 'rgba(29,158,117,0.15)' : f.estado === 'transferido' ? 'rgba(232,160,32,0.15)' : 'rgba(255,255,255,0.08)', color: f.estado === 'verificado' ? '#1D9E75' : f.estado === 'transferido' ? '#E8A020' : '#8FA3CC', padding: '2px 8px', borderRadius: '10px' }}>{f.estado}</span>
                    <span style={{ color: '#4B5563' }}>{new Date(f.created_at).toLocaleDateString('es-CO')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'mora' && (
          <div>
            {data.locales_en_mora?.length === 0 ? (
              <div style={{ ...s.card, textAlign: 'center', color: '#1D9E75', padding: '2rem' }}>Todos los locales estan al dia con sus reportes</div>
            ) : data.locales_en_mora?.map(l => (
              <div key={l.proyecto_id} style={{ ...s.card, borderColor: 'rgba(224,85,85,0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>{l.nombre_negocio}</div>
                    <div style={{ fontSize: '0.75rem', color: '#8FA3CC' }}>{l.nombre_proyecto} · {l.ciudad}</div>
                    <div style={{ fontSize: '0.75rem', color: '#8FA3CC' }}>Operador: {l.fundador} · {l.email}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#E05555' }}>${fmt(l.saldo_pendiente)}</div>
                    <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>saldo pendiente</div>
                    <a href={`/proyectos/${l.proyecto_id}/workspace/local`} style={{ fontSize: '0.75rem', color: '#4A90D9', textDecoration: 'none' }}>Ver panel →</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'locales' && (
          <div>
            {data.locales?.map(l => (
              <div key={l.id} style={{ ...s.card, padding: '0.875rem 1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.75rem', alignItems: 'center', fontSize: '0.78rem' }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: '600' }}>{l.nombre_negocio}</div>
                    <div style={{ color: '#6B7280' }}>{l.proyectos?.nombre} · {l.proyectos?.ciudad}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#4A90D9', fontWeight: '600' }}>${fmt(l.capital_total)}</div>
                    <div style={{ color: '#6B7280', fontSize: '0.65rem' }}>capital total</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#1D9E75', fontWeight: '600' }}>${fmt(l.capital_pagado)}</div>
                    <div style={{ color: '#6B7280', fontSize: '0.65rem' }}>{Math.round((parseFloat(l.capital_pagado || 0) / parseFloat(l.capital_total)) * 100)}% pagado</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.68rem', background: l.fase_actual === 'libre' ? 'rgba(29,158,117,0.15)' : l.fase_actual === 'regalia' ? 'rgba(232,160,32,0.15)' : 'rgba(74,144,217,0.15)', color: l.fase_actual === 'libre' ? '#1D9E75' : l.fase_actual === 'regalia' ? '#E8A020' : '#4A90D9', padding: '2px 8px', borderRadius: '10px' }}>{l.fase_actual}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
