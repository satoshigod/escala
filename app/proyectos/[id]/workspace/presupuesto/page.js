'use client'
// /proyectos/[id]/workspace/presupuesto
// Vista fundador: agregar items por categoria, ver estado de fondeo
// Vista inversionista: ver items disponibles, proponer fondeo

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../../../lib/supabase'

const fmt = (n) => Math.round(parseFloat(n || 0)).toLocaleString('es-CO')

const CATEGORIAS = {
  equipo: { label: 'Equipo', emoji: '👥', color: '#1D9E75', bg: 'rgba(29,158,117,0.08)', border: 'rgba(29,158,117,0.2)', desc: 'Nomina, honorarios, freelancers, contratistas' },
  equipos_activos: { label: 'Equipos y activos', emoji: '🔧', color: '#4A90D9', bg: 'rgba(74,144,217,0.08)', border: 'rgba(74,144,217,0.2)', desc: 'Maquinaria, computadores, vehiculos, mobiliario' },
  tecnologia: { label: 'Tecnologia', emoji: '💻', color: '#AFA9EC', bg: 'rgba(175,169,236,0.08)', border: 'rgba(175,169,236,0.2)', desc: 'Software, servidores, licencias, dominios' },
  capital_trabajo: { label: 'Capital de trabajo', emoji: '📦', color: '#E8A020', bg: 'rgba(232,160,32,0.08)', border: 'rgba(232,160,32,0.2)', desc: 'Inventario, materia prima, insumos' },
  marketing_ventas: { label: 'Marketing y ventas', emoji: '📣', color: '#E05555', bg: 'rgba(224,85,85,0.08)', border: 'rgba(224,85,85,0.2)', desc: 'Publicidad, eventos, contenido, agencias' },
  legal_operacion: { label: 'Legal y operacion', emoji: '⚖️', color: '#8FA3CC', bg: 'rgba(143,163,204,0.08)', border: 'rgba(143,163,204,0.2)', desc: 'Constitucion, permisos, arriendos, servicios' },
  otro: { label: 'Otro', emoji: '📋', color: '#6B7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.2)', desc: 'Logistica, propiedad intelectual, R&D y otros' },
}

const SUBCATEGORIAS_OTRO = [
  { id: 'logistica', label: 'Logistica y distribucion' },
  { id: 'propiedad_intelectual', label: 'Propiedad intelectual' },
  { id: 'investigacion', label: 'Investigacion y desarrollo' },
  { id: 'seguros', label: 'Seguros y garantias' },
  { id: 'capacitacion', label: 'Capacitacion y formacion' },
  { id: 'viajes', label: 'Viajes y representacion' },
  { id: 'instalaciones', label: 'Instalaciones y obras' },
  { id: 'certificaciones', label: 'Certificaciones y normas' },
  { id: 'otros_general', label: 'Otros gastos generales' },
]

const PRIORIDADES = {
  critica: { label: 'Critica', color: '#E05555' },
  alta: { label: 'Alta', color: '#E8A020' },
  media: { label: 'Media', color: '#4A90D9' },
  baja: { label: 'Baja', color: '#6B7280' },
}

const ESTADO_FONDEO = {
  sin_fondear: { label: 'Sin fondear', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
  parcialmente_fondeado: { label: 'Parcial', color: '#E8A020', bg: 'rgba(232,160,32,0.1)' },
  fondeado: { label: 'Fondeado', color: '#1D9E75', bg: 'rgba(29,158,117,0.1)' },
  ejecutado: { label: 'Ejecutado', color: '#4A90D9', bg: 'rgba(74,144,217,0.1)' },
  verificado: { label: 'Verificado', color: '#AFA9EC', bg: 'rgba(175,169,236,0.1)' },
}

export default function PresupuestoPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const [esFundador, setEsFundador] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [filtroCat, setFiltroCat] = useState('todas')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mostrarFondeoModal, setMostrarFondeoModal] = useState(null)

  const [form, setForm] = useState({
    categoria: '', subcategoria: '', nombre: '', descripcion: '',
    cantidad: '1', valor_unitario: '', tipo_gasto: 'capex',
    es_recurrente: false, frecuencia: 'unico', vida_util_meses: '',
    prioridad: 'media', justificacion: '', es_aporte_especie: false,
    fecha_requerida: '',
  })

  const [formFondeo, setFormFondeo] = useState({
    monto: '', a_cambio_de: 'participacion',
    pct_participacion: '', tasa_mensual: '', pct_revenue: '',
  })

  useEffect(() => { cargar() }, [id])

  async function cargar() {
    const { data: { user } } = await supabase.auth.getUser()
    setUsuario(user)

    const { data: proy } = await supabase.from('proyectos').select('fundador_id').eq('id', id).single()
    const esFund = proy?.fundador_id === user?.id
    setEsFundador(esFund)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const res = await fetch(`/api/presupuesto?proyecto_id=${id}`, {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
    const d = await res.json()
    if (d.ok) setData(d)
    setCargando(false)
  }

  async function guardarItem() {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (!form.categoria) { setError('Selecciona una categoria'); return }
    if (!form.valor_unitario || parseFloat(form.valor_unitario) <= 0) { setError('El valor unitario es obligatorio'); return }
    if (form.categoria === 'otro' && !form.subcategoria) { setError('Selecciona el tipo de gasto'); return }

    setGuardando(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const method = editando ? 'PUT' : 'POST'
      const body = editando ? { id: editando, ...form } : { proyecto_id: id, ...form }

      const res = await fetch('/api/presupuesto', {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(body),
      })
      const d = await res.json()
      if (!d.ok) throw new Error(d.error)

      setMostrarForm(false)
      setEditando(null)
      setForm({ categoria: '', subcategoria: '', nombre: '', descripcion: '', cantidad: '1', valor_unitario: '', tipo_gasto: 'capex', es_recurrente: false, frecuencia: 'unico', vida_util_meses: '', prioridad: 'media', justificacion: '', es_aporte_especie: false, fecha_requerida: '' })
      await cargar()
    } catch (err) { setError(err.message) }
    finally { setGuardando(false) }
  }

  async function eliminarItem(itemId) {
    if (!confirm('¿Eliminar este item del presupuesto?')) return
    const { data: { session } } = await supabase.auth.getSession()
    await fetch(`/api/presupuesto?id=${itemId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${session.access_token}` } })
    await cargar()
  }

  async function proponerFondeo() {
    if (!formFondeo.monto || parseFloat(formFondeo.monto) <= 0) { setError('El monto es obligatorio'); return }
    setGuardando(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/presupuesto/fondeo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ item_id: mostrarFondeoModal.id, ...formFondeo }),
      })
      const d = await res.json()
      if (!d.ok) throw new Error(d.error)
      setMostrarFondeoModal(null)
      setFormFondeo({ monto: '', a_cambio_de: 'participacion', pct_participacion: '', tasa_mensual: '', pct_revenue: '' })
      await cargar()
    } catch (err) { setError(err.message) }
    finally { setGuardando(false) }
  }

  async function accionFondeo(fondeo_id, accion) {
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/presupuesto/fondeo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ fondeo_id, accion }),
    })
    await cargar()
  }

  const s = {
    page: { minHeight: '100vh', background: '#0B1628', fontFamily: 'Inter,sans-serif', color: '#fff' },
    nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    wrap: { maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' },
    card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', marginBottom: '0.75rem' },
    label: { fontSize: '0.75rem', fontWeight: '700', color: '#8FA3CC', marginBottom: '4px', display: 'block' },
    input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '0.6rem 0.875rem', color: '#fff', fontSize: '0.85rem', outline: 'none', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box', marginBottom: '0.75rem' },
    btn: (color) => ({ background: color, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.25rem', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }),
    row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  }

  const itemsFiltrados = filtroCat === 'todas'
    ? (data?.items || [])
    : (data?.items || []).filter(i => i.categoria === filtroCat)

  if (cargando) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8FA3CC' }}>Cargando...</div>

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href={`/proyectos/${id}/workspace`} style={{ fontSize: '0.85rem', color: '#8FA3CC', textDecoration: 'none' }}>← Workspace</a>
        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff' }}>💰 Presupuesto e inversión</div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a href={`/api/presupuesto/exportar?proyecto_id=${id}`} target="_blank" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#8FA3CC', padding: '0.4rem 0.875rem', borderRadius: '6px', textDecoration: 'none', fontSize: '0.78rem', fontWeight: '600' }}>
            📄 Exportar PDF
          </a>
          {esFundador && (
            <button onClick={() => setMostrarForm(true)} style={s.btn('#1D9E75')}>+ Agregar item</button>
          )}
        </div>
      </nav>

      <div style={s.wrap}>

        {/* Resumen financiero */}
        {data?.resumen && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total presupuesto', valor: `$${fmt(data.resumen.total_presupuesto)}`, color: '#fff' },
              { label: 'Total fondeado', valor: `$${fmt(data.resumen.total_fondeado)}`, color: '#1D9E75' },
              { label: 'CAPEX', valor: `$${fmt(data.resumen.total_capex)}`, color: '#4A90D9' },
              { label: 'OPEX', valor: `$${fmt(data.resumen.total_opex)}`, color: '#E8A020' },
              { label: '% fondeado', valor: `${data.resumen.pct_fondeado}%`, color: data.resumen.pct_fondeado >= 100 ? '#1D9E75' : '#E8A020' },
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.875rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: '#6B7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: item.color }}>{item.valor}</div>
              </div>
            ))}
          </div>
        )}

        {/* Barra de progreso */}
        {data?.resumen && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#8FA3CC', marginBottom: '6px' }}>
              <span>Progreso de fondeo</span>
              <span>{data.resumen.pct_fondeado}% — ${fmt(data.resumen.total_fondeado)} de ${fmt(data.resumen.total_presupuesto)}</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(data.resumen.pct_fondeado, 100)}%`, background: '#1D9E75', borderRadius: '4px', transition: 'width 0.5s' }}></div>
            </div>
          </div>
        )}

        {/* Filtros por categoria */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <button onClick={() => setFiltroCat('todas')} style={{ background: filtroCat === 'todas' ? '#1D9E75' : 'rgba(255,255,255,0.06)', border: '1px solid ' + (filtroCat === 'todas' ? '#1D9E75' : 'rgba(255,255,255,0.1)'), color: '#fff', borderRadius: '20px', padding: '0.3rem 0.875rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
            Todas ({data?.items?.length || 0})
          </button>
          {Object.entries(CATEGORIAS).map(([key, cat]) => {
            const count = (data?.items || []).filter(i => i.categoria === key).length
            if (!count) return null
            return (
              <button key={key} onClick={() => setFiltroCat(key)} style={{ background: filtroCat === key ? cat.bg : 'rgba(255,255,255,0.04)', border: '1px solid ' + (filtroCat === key ? cat.border : 'rgba(255,255,255,0.08)'), color: filtroCat === key ? cat.color : '#8FA3CC', borderRadius: '20px', padding: '0.3rem 0.875rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                {cat.emoji} {cat.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Lista de items */}
        {itemsFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
            {esFundador ? (
              <>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>💰</div>
                <div style={{ fontSize: '0.88rem', marginBottom: '1rem' }}>El presupuesto está vacío. Agrega los recursos que necesitas para que los inversionistas puedan fondearte.</div>
                <button onClick={() => setMostrarForm(true)} style={s.btn('#1D9E75')}>+ Agregar primer item</button>
              </>
            ) : (
              <div style={{ fontSize: '0.88rem' }}>Este proyecto aún no tiene ítems en el presupuesto.</div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {itemsFiltrados.map(item => {
              const cat = CATEGORIAS[item.categoria]
              const estadoF = ESTADO_FONDEO[item.estado_fondeo]
              const pctFond = item.valor_total > 0 ? Math.round((parseFloat(item.monto_fondeado || 0) / parseFloat(item.valor_total)) * 100) : 0

              return (
                <div key={item.id} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${cat?.border || 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>{cat?.emoji}</span>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>{item.nombre}</div>
                        <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                          {cat?.label}{item.subcategoria ? ` — ${SUBCATEGORIAS_OTRO.find(s => s.id === item.subcategoria)?.label || item.subcategoria}` : ''} ·{' '}
                          {item.tipo_gasto?.toUpperCase()} ·{' '}
                          <span style={{ color: PRIORIDADES[item.prioridad]?.color }}>{PRIORIDADES[item.prioridad]?.label}</span>
                          {item.es_aporte_especie && ' · Aporte en especie'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: '700', background: estadoF?.bg, color: estadoF?.color, padding: '2px 8px', borderRadius: '20px' }}>{estadoF?.label}</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>${fmt(item.valor_total)}</div>
                        <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>{item.cantidad} × ${fmt(item.valor_unitario)}</div>
                      </div>
                    </div>
                  </div>

                  {item.descripcion && <div style={{ fontSize: '0.8rem', color: '#8FA3CC', marginBottom: '0.75rem', lineHeight: '1.5' }}>{item.descripcion}</div>}

                  {/* Barra de fondeo */}
                  {parseFloat(item.valor_total) > 0 && (
                    <div style={{ marginBottom: '0.875rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#6B7280', marginBottom: '4px' }}>
                        <span>Fondeado: ${fmt(item.monto_fondeado)}</span>
                        <span>{pctFond}%</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(pctFond, 100)}%`, background: cat?.color || '#1D9E75', borderRadius: '2px' }}></div>
                      </div>
                    </div>
                  )}

                  {/* Fondeos existentes */}
                  {item.presupuesto_fondeos?.length > 0 && (
                    <div style={{ marginBottom: '0.875rem' }}>
                      <div style={{ fontSize: '0.68rem', color: '#6B7280', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inversiones en este item</div>
                      {item.presupuesto_fondeos.map(f => (
                        <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.78rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#8FA3CC' }}>{f.perfiles?.nombre || 'Inversionista'}</span>
                            <span style={{ fontSize: '0.65rem', color: '#6B7280' }}>
                              {f.a_cambio_de === 'participacion' ? `${f.pct_participacion}% participacion` : f.a_cambio_de === 'deuda' ? `${f.tasa_mensual}%/mes` : `${f.pct_revenue}% revenue`}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '600', color: '#fff' }}>${fmt(f.monto)}</span>
                            <span style={{ fontSize: '0.65rem', background: f.estado === 'verificado' ? 'rgba(29,158,117,0.15)' : f.estado === 'aceptado' ? 'rgba(74,144,217,0.15)' : 'rgba(255,255,255,0.08)', color: f.estado === 'verificado' ? '#1D9E75' : f.estado === 'aceptado' ? '#4A90D9' : '#8FA3CC', padding: '1px 6px', borderRadius: '10px' }}>{f.estado}</span>
                            {esFundador && f.estado === 'propuesta' && (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button onClick={() => accionFondeo(f.id, 'aceptar')} style={{ ...s.btn('#1D9E75'), padding: '2px 8px', fontSize: '0.7rem' }}>Aceptar</button>
                                <button onClick={() => accionFondeo(f.id, 'rechazar')} style={{ ...s.btn('rgba(224,85,85,0.2)'), padding: '2px 8px', fontSize: '0.7rem', color: '#E05555', border: '1px solid rgba(224,85,85,0.3)' }}>Rechazar</button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Acciones */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {!esFundador && !['fondeado', 'verificado'].includes(item.estado_fondeo) && (
                      <button onClick={() => setMostrarFondeoModal(item)} style={s.btn('#4A90D9')}>
                        💰 Quiero fondear este item
                      </button>
                    )}
                    {esFundador && (
                      <>
                        <button onClick={() => { setEditando(item.id); setForm({ categoria: item.categoria, subcategoria: item.subcategoria || '', nombre: item.nombre, descripcion: item.descripcion || '', cantidad: String(item.cantidad), valor_unitario: String(item.valor_unitario), tipo_gasto: item.tipo_gasto || 'capex', es_recurrente: item.es_recurrente, frecuencia: item.frecuencia || 'unico', vida_util_meses: item.vida_util_meses || '', prioridad: item.prioridad, justificacion: item.justificacion || '', es_aporte_especie: item.es_aporte_especie, fecha_requerida: item.fecha_requerida || '' }); setMostrarForm(true) }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#8FA3CC', borderRadius: '8px', padding: '0.4rem 0.875rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                          Editar
                        </button>
                        {!['fondeado', 'ejecutado', 'verificado'].includes(item.estado_fondeo) && (
                          <button onClick={() => eliminarItem(item.id)} style={{ background: 'none', border: 'none', color: 'rgba(224,85,85,0.6)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                            Eliminar
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* MODAL — Agregar/editar item */}
        {mostrarForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <div style={{ background: '#0F1E3A', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>{editando ? 'Editar item' : 'Agregar item al presupuesto'}</div>
                <button onClick={() => { setMostrarForm(false); setEditando(null); setError('') }} style={{ background: 'none', border: 'none', color: '#8FA3CC', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
              </div>

              {/* Selector de categoria */}
              <label style={s.label}>Categoria *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0.5rem', marginBottom: '0.875rem' }}>
                {Object.entries(CATEGORIAS).map(([key, cat]) => (
                  <div key={key} onClick={() => setForm(f => ({ ...f, categoria: key, subcategoria: '' }))} style={{ cursor: 'pointer', border: form.categoria === key ? `2px solid ${cat.color}` : '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.625rem', textAlign: 'center', background: form.categoria === key ? cat.bg : 'rgba(255,255,255,0.03)' }}>
                    <div style={{ fontSize: '1.25rem', marginBottom: '2px' }}>{cat.emoji}</div>
                    <div style={{ fontSize: '0.7rem', color: form.categoria === key ? cat.color : '#8FA3CC', fontWeight: form.categoria === key ? '700' : '400', lineHeight: '1.3' }}>{cat.label}</div>
                  </div>
                ))}
              </div>

              {/* Submenu de Otros */}
              {form.categoria === 'otro' && (
                <div style={{ marginBottom: '0.875rem' }}>
                  <label style={s.label}>Tipo de gasto *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                    {SUBCATEGORIAS_OTRO.map(sub => (
                      <div key={sub.id} onClick={() => setForm(f => ({ ...f, subcategoria: sub.id }))} style={{ cursor: 'pointer', border: form.subcategoria === sub.id ? '2px solid #6B7280' : '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.5rem 0.625rem', background: form.subcategoria === sub.id ? 'rgba(107,114,128,0.15)' : 'rgba(255,255,255,0.03)', fontSize: '0.7rem', color: form.subcategoria === sub.id ? '#fff' : '#8FA3CC', textAlign: 'center', lineHeight: '1.3' }}>
                        {sub.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <label style={s.label}>Nombre *</label>
              <input style={s.input} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Horno industrial, Sueldo desarrollador, Meta Ads..." />

              <label style={s.label}>Descripcion</label>
              <input style={s.input} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Para que se va a usar este recurso..." />

              <div style={s.row2}>
                <div>
                  <label style={s.label}>Cantidad *</label>
                  <input style={s.input} type="number" value={form.cantidad} onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} placeholder="1" />
                </div>
                <div>
                  <label style={s.label}>Valor unitario (COP) *</label>
                  <input style={s.input} type="number" value={form.valor_unitario} onChange={e => setForm(f => ({ ...f, valor_unitario: e.target.value }))} placeholder="5.000.000" />
                </div>
              </div>

              {form.cantidad && form.valor_unitario && (
                <div style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '8px', padding: '0.625rem 0.875rem', marginBottom: '0.875rem', fontSize: '0.82rem', color: '#1D9E75' }}>
                  Total: <strong>${fmt(parseFloat(form.cantidad) * parseFloat(form.valor_unitario))}</strong>
                </div>
              )}

              <div style={s.row2}>
                <div>
                  <label style={s.label}>Tipo de gasto</label>
                  <select style={s.input} value={form.tipo_gasto} onChange={e => setForm(f => ({ ...f, tipo_gasto: e.target.value }))}>
                    <option value="capex">CAPEX (activo duradero)</option>
                    <option value="opex">OPEX (gasto operativo)</option>
                  </select>
                </div>
                <div>
                  <label style={s.label}>Prioridad</label>
                  <select style={s.input} value={form.prioridad} onChange={e => setForm(f => ({ ...f, prioridad: e.target.value }))}>
                    <option value="critica">Critica</option>
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#C8D4E8', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.es_recurrente} onChange={e => setForm(f => ({ ...f, es_recurrente: e.target.checked }))} />
                  Es recurrente
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#C8D4E8', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.es_aporte_especie} onChange={e => setForm(f => ({ ...f, es_aporte_especie: e.target.checked }))} />
                  Es aporte en especie (ya lo tengo)
                </label>
              </div>

              {form.es_recurrente && (
                <div style={s.row2}>
                  <div>
                    <label style={s.label}>Frecuencia</label>
                    <select style={s.input} value={form.frecuencia} onChange={e => setForm(f => ({ ...f, frecuencia: e.target.value }))}>
                      <option value="mensual">Mensual</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>
                  <div>
                    <label style={s.label}>Vida util (meses)</label>
                    <input style={s.input} type="number" value={form.vida_util_meses} onChange={e => setForm(f => ({ ...f, vida_util_meses: e.target.value }))} placeholder="12" />
                  </div>
                </div>
              )}

              <label style={s.label}>Justificacion</label>
              <input style={s.input} value={form.justificacion} onChange={e => setForm(f => ({ ...f, justificacion: e.target.value }))} placeholder="Por que se necesita este recurso..." />

              {error && <div style={{ fontSize: '0.8rem', color: '#E05555', marginBottom: '0.75rem', padding: '0.625rem', background: 'rgba(224,85,85,0.08)', borderRadius: '8px' }}>{error}</div>}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={guardarItem} disabled={guardando} style={{ ...s.btn('#1D9E75'), flex: 1, opacity: guardando ? 0.7 : 1 }}>
                  {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Agregar al presupuesto'}
                </button>
                <button onClick={() => { setMostrarForm(false); setEditando(null); setError('') }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#8FA3CC', borderRadius: '8px', padding: '0.6rem 1.25rem', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL — Proponer fondeo */}
        {mostrarFondeoModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <div style={{ background: '#0F1E3A', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '480px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>Fondear: {mostrarFondeoModal.nombre}</div>
                <button onClick={() => { setMostrarFondeoModal(null); setError('') }} style={{ background: 'none', border: 'none', color: '#8FA3CC', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.875rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '4px' }}>
                  <span>Valor total del item</span><span style={{ color: '#fff', fontWeight: '600' }}>${fmt(mostrarFondeoModal.valor_total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#8FA3CC' }}>
                  <span>Ya fondeado</span><span style={{ color: '#1D9E75', fontWeight: '600' }}>${fmt(mostrarFondeoModal.monto_fondeado)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: '700', color: '#fff', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <span>Falta fondear</span><span style={{ color: '#E8A020' }}>${fmt(parseFloat(mostrarFondeoModal.valor_total) - parseFloat(mostrarFondeoModal.monto_fondeado))}</span>
                </div>
              </div>

              <label style={s.label}>Monto que quieres invertir (COP) *</label>
              <input style={s.input} type="number" value={formFondeo.monto} onChange={e => setFormFondeo(f => ({ ...f, monto: e.target.value }))} placeholder="5.000.000" />

              <label style={s.label}>A cambio de *</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem' }}>
                {[
                  { id: 'participacion', label: '% Participacion' },
                  { id: 'deuda', label: 'Deuda con tasa' },
                  { id: 'revenue_share', label: '% Revenue' },
                ].map(op => (
                  <div key={op.id} onClick={() => setFormFondeo(f => ({ ...f, a_cambio_de: op.id }))} style={{ flex: 1, cursor: 'pointer', border: formFondeo.a_cambio_de === op.id ? '2px solid #4A90D9' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.5rem', textAlign: 'center', background: formFondeo.a_cambio_de === op.id ? 'rgba(74,144,217,0.12)' : 'rgba(255,255,255,0.03)', fontSize: '0.72rem', color: formFondeo.a_cambio_de === op.id ? '#4A90D9' : '#8FA3CC', fontWeight: formFondeo.a_cambio_de === op.id ? '700' : '400' }}>
                    {op.label}
                  </div>
                ))}
              </div>

              {formFondeo.a_cambio_de === 'participacion' && (
                <div>
                  <label style={s.label}>% de participacion en el proyecto</label>
                  <input style={s.input} type="number" step="0.1" value={formFondeo.pct_participacion} onChange={e => setFormFondeo(f => ({ ...f, pct_participacion: e.target.value }))} placeholder="5" />
                </div>
              )}
              {formFondeo.a_cambio_de === 'deuda' && (
                <div>
                  <label style={s.label}>Tasa mensual (%)</label>
                  <input style={s.input} type="number" step="0.1" value={formFondeo.tasa_mensual} onChange={e => setFormFondeo(f => ({ ...f, tasa_mensual: e.target.value }))} placeholder="3" />
                </div>
              )}
              {formFondeo.a_cambio_de === 'revenue_share' && (
                <div>
                  <label style={s.label}>% de los ingresos mensuales del proyecto</label>
                  <input style={s.input} type="number" step="0.1" value={formFondeo.pct_revenue} onChange={e => setFormFondeo(f => ({ ...f, pct_revenue: e.target.value }))} placeholder="2" />
                </div>
              )}

              {error && <div style={{ fontSize: '0.8rem', color: '#E05555', marginBottom: '0.75rem', padding: '0.625rem', background: 'rgba(224,85,85,0.08)', borderRadius: '8px' }}>{error}</div>}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={proponerFondeo} disabled={guardando} style={{ ...s.btn('#4A90D9'), flex: 1, opacity: guardando ? 0.7 : 1 }}>
                  {guardando ? 'Enviando...' : 'Enviar propuesta de fondeo →'}
                </button>
                <button onClick={() => { setMostrarFondeoModal(null); setError('') }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#8FA3CC', borderRadius: '8px', padding: '0.6rem 1rem', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
