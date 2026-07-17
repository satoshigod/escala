'use client'
// /directorio-inversion
// Angeles ven todos los items de presupuesto sin fondear
// Filtros por categoria, monto, prioridad

import { useState, useEffect } from 'react'
import NavApp from '@/components/NavApp'
import { supabase } from '../../lib/supabase'

const fmt = (n) => Math.round(parseFloat(n || 0)).toLocaleString('es-CO')

const CATEGORIAS = {
  todas: { label: 'Todas', emoji: '🔍' },
  equipo: { label: 'Equipo', emoji: '👥', color: '#1D9E75' },
  equipos_activos: { label: 'Equipos y activos', emoji: '🔧', color: '#4A90D9' },
  tecnologia: { label: 'Tecnologia', emoji: '💻', color: '#AFA9EC' },
  capital_trabajo: { label: 'Capital de trabajo', emoji: '📦', color: '#E8A020' },
  marketing_ventas: { label: 'Marketing', emoji: '📣', color: '#E05555' },
  legal_operacion: { label: 'Legal', emoji: '⚖️', color: '#8FA3CC' },
  otro: { label: 'Otro', emoji: '📋', color: '#6B7280' },
}

const PRIORIDADES = {
  critica: { label: 'Critica', color: '#E05555', bg: 'rgba(224,85,85,0.12)' },
  alta: { label: 'Alta', color: '#E8A020', bg: 'rgba(232,160,32,0.12)' },
  media: { label: 'Media', color: '#4A90D9', bg: 'rgba(74,144,217,0.12)' },
  baja: { label: 'Baja', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
}

export default function DirectorioInversionPage() {
  const [items, setItems] = useState([])
  const [resumen, setResumen] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroPrioridad, setFiltroPrioridad] = useState('')
  const [filtroMontoMax, setFiltroMontoMax] = useState('')
  const [mostrarFondeo, setMostrarFondeo] = useState(null)
  const [formFondeo, setFormFondeo] = useState({ monto: '', a_cambio_de: 'participacion', pct_participacion: '', tasa_mensual: '', pct_revenue: '' })
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUsuario(user))
  }, [])

  useEffect(() => {
    setCargando(true)
    let url = '/api/inversiones/oportunidades?per_page=30'
    if (filtroCategoria && filtroCategoria !== 'todas') url += `&categoria=${filtroCategoria}`
    if (filtroPrioridad) url += `&prioridad=${filtroPrioridad}`
    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (d.ok) { setItems(d.items || []); setResumen(d.resumen) }
        setCargando(false)
      })
      .catch(() => setCargando(false))
  }, [filtroCategoria, filtroPrioridad])

  async function cargar() {
    setCargando(true)
    let url = '/api/inversiones/oportunidades?per_page=30'
    if (filtroCategoria && filtroCategoria !== 'todas') url += `&categoria=${filtroCategoria}`
    if (filtroPrioridad) url += `&prioridad=${filtroPrioridad}`
    if (filtroMontoMax) url += `&monto_max=${filtroMontoMax}`
    const res = await fetch(url)
    const d = await res.json()
    if (d.ok) { setItems(d.items || []); setResumen(d.resumen) }
    setCargando(false)
  }

  async function proponerFondeo() {
    if (!usuario) { window.location.href = '/registro?modo=login'; return }
    if (!formFondeo.monto || parseFloat(formFondeo.monto) <= 0) { setMensaje('Ingresa el monto'); return }
    setEnviando(true)
    setMensaje('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/presupuesto/fondeo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ item_id: mostrarFondeo.id, ...formFondeo }),
      })
      const d = await res.json()
      if (!d.ok) throw new Error(d.error)
      setMensaje('Propuesta enviada. El fundador recibirá una notificación.')
      setTimeout(() => { setMostrarFondeo(null); setMensaje(''); cargar() }, 2000)
    } catch (err) { setMensaje('Error: ' + err.message) }
    finally { setEnviando(false) }
  }

  const s = {
    page: { minHeight: '100vh', background: '#0B1628', fontFamily: 'Inter,sans-serif', color: '#fff' },
    wrap: { maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' },
    card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', marginBottom: '0.75rem' },
    input: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '0.5rem 0.875rem', color: '#fff', fontSize: '0.82rem', outline: 'none', fontFamily: 'Inter,sans-serif' },
    btn: (color) => ({ background: color, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }),
  }

  return (
    <div style={s.page}>
      <NavApp />
      <div style={s.wrap}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4A90D9', marginBottom: '0.5rem' }}>Angel de Impulso</div>
          <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Oportunidades de inversión</h1>
          <p style={{ fontSize: '0.88rem', color: '#8FA3CC', lineHeight: '1.6', maxWidth: '600px' }}>
            Proyectos activos en Escala que necesitan capital para recursos específicos. Fondea un item concreto — una máquina, un empleado, tecnología — y recibes participación, un retorno con tasa o revenue share.
          </p>
        </div>

        {/* Banner para visitantes sin cuenta */}
        {!usuario && (
          <div style={{ background: 'rgba(29,158,117,0.06)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#1D9E75', marginBottom: '2px' }}>Invierte desde $500.000 COP en negocios reales</div>
              <div style={{ fontSize: '0.75rem', color: '#8FA3CC' }}>Crea tu cuenta gratis para proponer fondeo en cualquier item. Sin mínimos de inversión.</div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <a href="/registro" style={{ background: '#1D9E75', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: '700', whiteSpace: 'nowrap' }}>Crear cuenta gratis →</a>
              <a href="/registro?modo=login" style={{ fontSize: '0.78rem', color: '#8FA3CC', textDecoration: 'none', whiteSpace: 'nowrap' }}>Ya tengo cuenta</a>
            </div>
          </div>
        )}

        {/* Stats */}
        {resumen && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Oportunidades disponibles', valor: resumen.total_oportunidades, color: '#4A90D9' },
              { label: 'Capital requerido total', valor: `$${fmt(resumen.capital_requerido)}`, color: '#E8A020' },
              { label: 'Proyectos activos', valor: new Set(items.map(i => i.proyectos?.id)).size, color: '#1D9E75' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.875rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: s.color, letterSpacing: '-0.02em' }}>{s.valor}</div>
                <div style={{ fontSize: '0.65rem', color: '#6B7280', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {Object.entries(CATEGORIAS).map(([key, cat]) => (
              <button key={key} onClick={() => setFiltroCategoria(key)} style={{ background: filtroCategoria === key ? '#4A90D9' : 'rgba(255,255,255,0.05)', border: `1px solid ${filtroCategoria === key ? '#4A90D9' : 'rgba(255,255,255,0.1)'}`, color: filtroCategoria === key ? '#fff' : '#8FA3CC', borderRadius: '20px', padding: '0.25rem 0.75rem', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
          <select style={{ ...s.input, marginLeft: 'auto' }} value={filtroPrioridad} onChange={e => setFiltroPrioridad(e.target.value)}>
            <option value="">Todas las prioridades</option>
            <option value="critica">Critica</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>

        {/* Items */}
        {cargando ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8FA3CC' }}>Cargando oportunidades...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>No hay oportunidades disponibles con estos filtros.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {items.map(item => {
              const cat = CATEGORIAS[item.categoria] || CATEGORIAS.otro
              const prio = PRIORIDADES[item.prioridad] || PRIORIDADES.media
              const pct_fondeado = item.valor_total > 0 ? Math.round((parseFloat(item.monto_fondeado || 0) / parseFloat(item.valor_total)) * 100) : 0

              return (
                <div key={item.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{cat.emoji}</span>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '2px' }}>{item.nombre}</div>
                        <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                          {item.proyectos?.nombre} · {item.proyectos?.sector} · {item.proyectos?.ciudad}
                        </div>
                        {item.descripcion && <div style={{ fontSize: '0.78rem', color: '#8FA3CC', marginTop: '4px', lineHeight: '1.5' }}>{item.descripcion}</div>}
                        {item.justificacion && <div style={{ fontSize: '0.75rem', color: '#4B5563', marginTop: '3px', fontStyle: 'italic' }}>"{item.justificacion}"</div>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em' }}>${fmt(item.faltante)}</div>
                      <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>falta fondear de ${fmt(item.valor_total)}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', background: prio.bg, color: prio.color, padding: '2px 8px', borderRadius: '20px' }}>{prio.label}</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', background: 'rgba(255,255,255,0.06)', color: '#8FA3CC', padding: '2px 8px', borderRadius: '20px' }}>{item.tipo_gasto?.toUpperCase()}</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', background: 'rgba(255,255,255,0.06)', color: '#8FA3CC', padding: '2px 8px', borderRadius: '20px' }}>{cat.label}</span>
                    {pct_fondeado > 0 && <span style={{ fontSize: '0.65rem', fontWeight: '700', background: 'rgba(29,158,117,0.12)', color: '#1D9E75', padding: '2px 8px', borderRadius: '20px' }}>{pct_fondeado}% fondeado</span>}
                  </div>

                  {pct_fondeado > 0 && (
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.875rem' }}>
                      <div style={{ height: '100%', width: `${pct_fondeado}%`, background: '#1D9E75', borderRadius: '2px' }}></div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {usuario ? (
                      <button onClick={() => setMostrarFondeo(item)} style={s.btn('#4A90D9')}>
                        💰 Quiero fondear este item
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <a href="/registro" style={{ ...s.btn('#1D9E75'), textDecoration: 'none', display: 'inline-block' }}>
                          Registrarme para invertir →
                        </a>
                        <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>¿Ya tienes cuenta? <a href="/registro?modo=login" style={{ color: '#4A90D9', textDecoration: 'none' }}>Inicia sesión</a></span>
                      </div>
                    )}
                    <a href={`/proyectos/${item.proyectos?.id}/workspace`} style={{ fontSize: '0.78rem', color: '#8FA3CC', textDecoration: 'none' }}>
                      Ver proyecto →
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal fondeo */}
        {mostrarFondeo && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <div style={{ background: '#0F1E3A', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '480px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>Fondear: {mostrarFondeo.nombre}</div>
                <button onClick={() => { setMostrarFondeo(null); setMensaje('') }} style={{ background: 'none', border: 'none', color: '#8FA3CC', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.875rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8FA3CC' }}><span>Proyecto</span><span style={{ color: '#fff' }}>{mostrarFondeo.proyectos?.nombre}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8FA3CC', marginTop: '4px' }}><span>Falta fondear</span><span style={{ color: '#E8A020', fontWeight: '600' }}>${fmt(mostrarFondeo.faltante)}</span></div>
              </div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#8FA3CC', display: 'block', marginBottom: '4px' }}>Monto a invertir (COP) *</label>
              <input style={{ ...s.input, width: '100%', marginBottom: '0.875rem', boxSizing: 'border-box' }} type="number" value={formFondeo.monto} onChange={e => setFormFondeo(f => ({ ...f, monto: e.target.value }))} placeholder="5.000.000" />
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#8FA3CC', display: 'block', marginBottom: '6px' }}>A cambio de *</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem' }}>
                {[{ id: 'participacion', label: '% Participacion' }, { id: 'deuda', label: 'Deuda + tasa' }, { id: 'revenue_share', label: '% Revenue' }].map(op => (
                  <div key={op.id} onClick={() => setFormFondeo(f => ({ ...f, a_cambio_de: op.id }))} style={{ flex: 1, cursor: 'pointer', border: formFondeo.a_cambio_de === op.id ? '2px solid #4A90D9' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.5rem', textAlign: 'center', background: formFondeo.a_cambio_de === op.id ? 'rgba(74,144,217,0.12)' : 'transparent', fontSize: '0.72rem', color: formFondeo.a_cambio_de === op.id ? '#4A90D9' : '#8FA3CC', fontWeight: formFondeo.a_cambio_de === op.id ? '700' : '400' }}>
                    {op.label}
                  </div>
                ))}
              </div>
              {formFondeo.a_cambio_de === 'participacion' && <input style={{ ...s.input, width: '100%', marginBottom: '0.875rem', boxSizing: 'border-box' }} type="number" step="0.1" value={formFondeo.pct_participacion} onChange={e => setFormFondeo(f => ({ ...f, pct_participacion: e.target.value }))} placeholder="% participacion en el proyecto" />}
              {formFondeo.a_cambio_de === 'deuda' && <input style={{ ...s.input, width: '100%', marginBottom: '0.875rem', boxSizing: 'border-box' }} type="number" step="0.1" value={formFondeo.tasa_mensual} onChange={e => setFormFondeo(f => ({ ...f, tasa_mensual: e.target.value }))} placeholder="Tasa mensual %" />}
              {formFondeo.a_cambio_de === 'revenue_share' && <input style={{ ...s.input, width: '100%', marginBottom: '0.875rem', boxSizing: 'border-box' }} type="number" step="0.1" value={formFondeo.pct_revenue} onChange={e => setFormFondeo(f => ({ ...f, pct_revenue: e.target.value }))} placeholder="% de ingresos mensuales" />}
              {mensaje && <div style={{ fontSize: '0.8rem', color: mensaje.includes('Error') ? '#E05555' : '#1D9E75', marginBottom: '0.75rem', padding: '0.625rem', background: mensaje.includes('Error') ? 'rgba(224,85,85,0.08)' : 'rgba(29,158,117,0.08)', borderRadius: '8px' }}>{mensaje}</div>}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={proponerFondeo} disabled={enviando} style={{ ...s.btn('#4A90D9'), flex: 1, opacity: enviando ? 0.7 : 1 }}>{enviando ? 'Enviando...' : 'Enviar propuesta →'}</button>
                <button onClick={() => { setMostrarFondeo(null); setMensaje('') }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#8FA3CC', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
