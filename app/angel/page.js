'use client'
// /angel — Panel del Ángel Inversionista
// Centro de operaciones: portafolio, alertas, oportunidades, estado de inversiones

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const fmt = (n) => Math.round(parseFloat(n || 0)).toLocaleString('es-CO')
const fmtK = (n) => {
  const v = parseFloat(n || 0)
  if (v >= 1000000) return '$' + (v/1000000).toFixed(1) + 'M'
  if (v >= 1000) return '$' + (v/1000).toFixed(0) + 'K'
  return '$' + fmt(v)
}

const ESTADO_FONDEO = {
  propuesta: { label: 'Propuesta enviada', color: '#6B7280', bg: 'rgba(107,114,128,0.12)', accion: 'Esperando respuesta del fundador' },
  negociando: { label: 'Negociando', color: '#E8A020', bg: 'rgba(232,160,32,0.12)', accion: 'El fundador hizo una contrapropuesta' },
  aceptado: { label: 'Aceptado', color: '#4A90D9', bg: 'rgba(74,144,217,0.12)', accion: 'Accion requerida: realiza la transferencia' },
  transferido: { label: 'Transferido', color: '#E8A020', bg: 'rgba(232,160,32,0.12)', accion: 'Esperando verificacion de Escala' },
  verificado: { label: 'Activo', color: '#1D9E75', bg: 'rgba(29,158,117,0.12)', accion: 'Capital acreditado al proyecto' },
  rechazado: { label: 'Rechazado', color: '#E05555', bg: 'rgba(224,85,85,0.12)', accion: 'El fundador no acepto esta propuesta' },
}

const CATEGORIA_LABEL = {
  equipo: 'Equipo', equipos_activos: 'Equipos/Activos',
  tecnologia: 'Tecnologia', capital_trabajo: 'Capital trabajo',
  marketing_ventas: 'Marketing', legal_operacion: 'Legal', otro: 'Otro',
}

export default function AngelPage() {
  const [usuario, setUsuario] = useState(null)
  const [tab, setTab] = useState('portafolio')
  const [fondeos, setFondeos] = useState([])
  const [oportunidades, setOportunidades] = useState([])
  const [resumen, setResumen] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [mostrarFondeo, setMostrarFondeo] = useState(null)
  const [formFondeo, setFormFondeo] = useState({ monto: '', a_cambio_de: 'participacion', pct_participacion: '', tasa_mensual: '', pct_revenue: '' })
  const [comprobante, setComprobante] = useState('')
  const [mostrarComprobante, setMostrarComprobante] = useState(null)
  const [enviando, setEnviando] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [contratosLeasing, setContratosLeasing] = useState([])
  const [firmandoLeasing, setFirmandoLeasing] = useState(null)

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/registro?modo=login'; return }
    setUsuario(user)

    const { data: misfondeos } = await supabase
      .from('presupuesto_fondeos')
      .select('*, presupuesto_items(id, nombre, categoria, valor_total, proyecto_id), proyectos!proyecto_id(id, nombre, sector, ciudad)')
      .eq('inversionista_id', user.id)
      .order('created_at', { ascending: false })

    const todos = misfondeos || []
    setFondeos(todos)

    const activos = todos.filter(f => f.estado === 'verificado')
    const enProceso = todos.filter(f => ['propuesta','negociando','aceptado','transferido'].includes(f.estado))
    const accionRequerida = todos.filter(f => f.estado === 'aceptado')

    setResumen({
      total_invertido: activos.reduce((s, f) => s + parseFloat(f.monto || 0), 0),
      total_comprometido: enProceso.reduce((s, f) => s + parseFloat(f.monto || 0), 0),
      proyectos_activos: new Set(activos.map(f => f.proyecto_id)).size,
      accion_requerida: accionRequerida.length,
    })

    fetch('/api/inversiones/oportunidades?per_page=6')
      .then(r => r.json())
      .then(d => { if (d.ok) setOportunidades(d.items || []) })
      .catch(() => {})

    // Cargar contratos de leasing donde este angel es el inversionista
    const { data: leasings } = await supabase
      .from('contratos_leasing')
      .select('*, proyectos:proyecto_id(id, nombre, ciudad)')
      .or('angel_id.eq.' + user.id + ',estado.eq.pendiente_angel')
      .order('created_at', { ascending: false })
    setContratosLeasing(leasings || [])

    setCargando(false)
  }

  async function accionFondeo(fondeo_id, accion, extra) {
    setEnviando(fondeo_id)
    setMensaje('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/presupuesto/fondeo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
        body: JSON.stringify({ fondeo_id, accion, ...(extra || {}) }),
      })
      const d = await res.json()
      if (!d.ok) throw new Error(d.error)
      setMostrarComprobante(null)
      setComprobante('')
      await init()
    } catch (err) { setMensaje('Error: ' + err.message) }
    finally { setEnviando(null) }
  }

  async function proponerFondeo() {
    if (!formFondeo.monto || parseFloat(formFondeo.monto) <= 0) { setMensaje('Ingresa el monto'); return }
    setEnviando('nuevo')
    setMensaje('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/presupuesto/fondeo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
        body: JSON.stringify({ item_id: mostrarFondeo.id, ...formFondeo }),
      })
      const d = await res.json()
      if (!d.ok) throw new Error(d.error)
      setMostrarFondeo(null)
      setFormFondeo({ monto: '', a_cambio_de: 'participacion', pct_participacion: '', tasa_mensual: '', pct_revenue: '' })
      setTab('portafolio')
      await init()
    } catch (err) { setMensaje('Error: ' + err.message) }
    finally { setEnviando(null) }
  }

  async function firmarLeasing(contratoId) {
    setFirmandoLeasing(contratoId)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/contratos-leasing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
        body: JSON.stringify({
          id: contratoId,
          angel_id: usuario.id,
          estado: 'activo',
          firmado_angel: true,
          fecha_firma_angel: new Date().toISOString(),
        }),
      })
      const d = await res.json()
      if (d.ok) await init()
      else setMensaje('Error al firmar: ' + d.error)
    } catch (err) { setMensaje('Error: ' + err.message) }
    setFirmandoLeasing(null)
  }
    page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff' },
    nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 },
    wrap: { maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' },
    card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', marginBottom: '0.75rem' },
    btn: (color) => ({ background: color, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter,sans-serif', whiteSpace: 'nowrap' }),
    input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '0.6rem 0.875rem', color: '#fff', fontSize: '0.85rem', outline: 'none', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box', marginBottom: '0.75rem' },
  }

  if (cargando) return (
    <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8FA3CC' }}>
      Cargando tu panel...
    </div>
  )

  const accion_requerida = fondeos.filter(f => f.estado === 'aceptado')
  const activos = fondeos.filter(f => f.estado === 'verificado')
  const enProceso = fondeos.filter(f => ['propuesta','negociando','transferido'].includes(f.estado))
  const rechazados = fondeos.filter(f => f.estado === 'rechazado')

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href="/dashboard" style={{ fontSize: '1rem', fontWeight: '900', color: '#fff', textDecoration: 'none', letterSpacing: '-0.03em' }}>
          Esca<span style={{ color: '#1D9E75' }}>la</span>
        </a>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[
            { id: 'portafolio', label: 'Portafolio' },
            { id: 'alertas', label: accion_requerida.length > 0 ? 'Alertas (' + accion_requerida.length + ')' : 'Alertas' },
            { id: 'leasing', label: contratosLeasing.filter(c => c.estado === 'pendiente_angel').length > 0 ? 'Leasing (' + contratosLeasing.filter(c => c.estado === 'pendiente_angel').length + ')' : 'Leasing' },
            { id: 'oportunidades', label: 'Oportunidades' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? 'rgba(255,255,255,0.1)' : 'none', border: tab === t.id ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent', color: tab === t.id ? '#fff' : '#8FA3CC', borderRadius: '8px', padding: '0.3rem 0.875rem', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
              {t.label}
            </button>
          ))}
        </div>
        <a href="/directorio-inversion" style={{ background: '#4A90D9', color: '#fff', padding: '0.4rem 1rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.78rem', fontWeight: '700' }}>
          + Invertir
        </a>
      </nav>

      <div style={s.wrap}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#AFA9EC', marginBottom: '0.4rem' }}>Angel de Impulso</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em' }}>Mi portafolio</h1>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Capital invertido', valor: fmtK(resumen?.total_invertido), color: '#1D9E75' },
            { label: 'Capital comprometido', valor: fmtK(resumen?.total_comprometido), color: '#E8A020' },
            { label: 'Proyectos activos', valor: resumen?.proyectos_activos || 0, color: '#4A90D9' },
            { label: 'Accion requerida', valor: resumen?.accion_requerida || 0, color: resumen?.accion_requerida > 0 ? '#E05555' : '#6B7280' },
          ].map(k => (
            <div key={k.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem', borderTop: '2px solid ' + k.color }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: k.color, letterSpacing: '-0.02em', marginBottom: '2px' }}>{k.valor}</div>
              <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#8FA3CC', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Alerta accion requerida */}
        {accion_requerida.length > 0 && (
          <div style={{ background: 'rgba(74,144,217,0.06)', border: '1px solid rgba(74,144,217,0.3)', borderRadius: '12px', padding: '0.875rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#4A90D9' }}>
                {accion_requerida.length} inversion{accion_requerida.length > 1 ? 'es' : ''} aceptada{accion_requerida.length > 1 ? 's' : ''} pendiente{accion_requerida.length > 1 ? 's' : ''} de transferencia
              </div>
              <div style={{ fontSize: '0.75rem', color: '#8FA3CC' }}>El fundador acepto tu propuesta. Transfiere para activar la inversion.</div>
            </div>
            <button onClick={() => setTab('alertas')} style={s.btn('#4A90D9')}>Ver ahora</button>
          </div>
        )}

        {/* TAB PORTAFOLIO */}
        {tab === 'portafolio' && (
          <div>
            {fondeos.length === 0 ? (
              <div style={{ ...s.card, textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🌟</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>Aún no has financiado ningún negocio</div>
                <div style={{ fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '1.25rem' }}>Entra al directorio y elige qué quieres financiar.</div>
                <button onClick={() => setTab('oportunidades')} style={s.btn('#4A90D9')}>Ver oportunidades</button>
              </div>
            ) : (
              <div>
                {activos.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Inversiones activas ({activos.length})</div>
                    {activos.map(f => <TarjetaFondeo key={f.id} f={f} s={s} accionFondeo={accionFondeo} enviando={enviando} mostrarComprobante={mostrarComprobante} setMostrarComprobante={setMostrarComprobante} comprobante={comprobante} setComprobante={setComprobante} />)}
                  </div>
                )}
                {enProceso.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#E8A020', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>En proceso ({enProceso.length})</div>
                    {enProceso.map(f => <TarjetaFondeo key={f.id} f={f} s={s} accionFondeo={accionFondeo} enviando={enviando} mostrarComprobante={mostrarComprobante} setMostrarComprobante={setMostrarComprobante} comprobante={comprobante} setComprobante={setComprobante} />)}
                  </div>
                )}
                {rechazados.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Rechazados ({rechazados.length})</div>
                    {rechazados.map(f => <TarjetaFondeo key={f.id} f={f} s={s} accionFondeo={accionFondeo} enviando={enviando} mostrarComprobante={mostrarComprobante} setMostrarComprobante={setMostrarComprobante} comprobante={comprobante} setComprobante={setComprobante} />)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB ALERTAS */}
        {tab === 'alertas' && (
          <div>
            {accion_requerida.length === 0 ? (
              <div style={{ ...s.card, textAlign: 'center', padding: '2.5rem', color: '#6B7280' }}>
                Todo al dia - no tienes acciones pendientes
              </div>
            ) : accion_requerida.map(f => (
              <div key={f.id} style={{ background: 'rgba(74,144,217,0.06)', border: '1px solid rgba(74,144,217,0.25)', borderRadius: '12px', padding: '1.25rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.875rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: '700', color: '#4A90D9', marginBottom: '3px', textTransform: 'uppercase' }}>Transferencia requerida</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>{f.presupuesto_items?.nombre}</div>
                    <div style={{ fontSize: '0.75rem', color: '#8FA3CC' }}>{f.proyectos?.nombre}</div>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#4A90D9' }}>${fmt(f.monto)}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.875rem', fontSize: '0.78rem', color: '#8FA3CC', lineHeight: '1.6' }}>
                  Transfiere <strong style={{ color: '#fff' }}>${fmt(f.monto)} COP</strong> via BREB (Nequi, Daviplata, Bancolombia) a la cuenta de fondeo de Escala. Sube el numero de comprobante para verificar.
                </div>
                {mostrarComprobante === f.id ? (
                  <div>
                    <input style={s.input} placeholder="Numero de comprobante o referencia" value={comprobante} onChange={e => setComprobante(e.target.value)} />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => accionFondeo(f.id, 'confirmar_transferencia', { comprobante_url: comprobante })} disabled={enviando === f.id || !comprobante} style={{ ...s.btn('#4A90D9'), opacity: !comprobante ? 0.5 : 1 }}>
                        {enviando === f.id ? 'Enviando...' : 'Confirmar transferencia'}
                      </button>
                      <button onClick={() => setMostrarComprobante(null)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', color: '#8FA3CC', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setMostrarComprobante(f.id)} style={s.btn('#4A90D9')}>Ya transferi - subir comprobante</button>
                )}
              </div>
            ))}
            {mensaje && <div style={{ fontSize: '0.82rem', color: '#E05555', marginTop: '1rem', padding: '0.75rem', background: 'rgba(224,85,85,0.08)', borderRadius: '8px' }}>{mensaje}</div>}
          </div>
        )}

        {/* TAB OPORTUNIDADES */}
        {tab === 'oportunidades' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.82rem', color: '#8FA3CC' }}>Emprendedores que necesitan tu capital ahora</div>
              <a href="/directorio-inversion" style={{ fontSize: '0.78rem', color: '#4A90D9', textDecoration: 'none' }}>Ver directorio completo</a>
            </div>
            {oportunidades.length === 0 ? (
              <div style={{ ...s.card, textAlign: 'center', padding: '2rem', color: '#6B7280' }}>No hay oportunidades disponibles en este momento.</div>
            ) : oportunidades.map(item => {
              const yaInvertido = fondeos.some(f => f.item_id === item.id && f.estado !== 'rechazado')
              return (
                <div key={item.id} style={{ ...s.card, opacity: yaInvertido ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff', marginBottom: '2px' }}>{item.nombre}</div>
                      <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{item.proyectos?.nombre} - {item.proyectos?.sector} - {item.proyectos?.ciudad}</div>
                      {item.descripcion && <div style={{ fontSize: '0.75rem', color: '#8FA3CC', marginTop: '3px' }}>{item.descripcion}</div>}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>${fmt(item.faltante)}</div>
                      <div style={{ fontSize: '0.65rem', color: '#6B7280' }}>falta fondear</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.06)', color: '#8FA3CC', padding: '2px 8px', borderRadius: '20px' }}>{CATEGORIA_LABEL[item.categoria] || item.categoria}</span>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.06)', color: '#8FA3CC', padding: '2px 8px', borderRadius: '20px' }}>{item.tipo_gasto?.toUpperCase()}</span>
                    <span style={{ fontSize: '0.65rem', background: item.prioridad === 'critica' ? 'rgba(224,85,85,0.12)' : 'rgba(255,255,255,0.06)', color: item.prioridad === 'critica' ? '#E05555' : '#8FA3CC', padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>{item.prioridad}</span>
                  </div>
                  {yaInvertido ? (
                    <div style={{ fontSize: '0.75rem', color: '#1D9E75' }}>Ya tienes una propuesta enviada aquí</div>
                  ) : (
                    <button onClick={() => { setMostrarFondeo(item); setMensaje('') }} style={s.btn('#4A90D9')}>Financiar esto</button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ====== TAB LEASING ====== */}
      {tab === 'leasing' && (
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', marginBottom: '0.375rem' }}>Contratos de leasing de maquinaria</h2>
          <p style={{ fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '1.5rem' }}>
            Cuando una beneficiaria firma un contrato de maquinaria, aparece aqui para tu aprobacion y firma digital.
          </p>

          {contratosLeasing.filter(c => c.estado === 'pendiente_angel').length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#E8A020', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Pendientes de tu firma
              </div>
              {contratosLeasing.filter(c => c.estado === 'pendiente_angel').map(c => (
                <div key={c.id} style={{ background: 'rgba(232,160,32,0.06)', border: '1px solid rgba(232,160,32,0.25)', borderRadius: '14px', padding: '1.5rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '3px' }}>{c.tipo_equipo} · {c.marca} {c.modelo || ''}</div>
                      <div style={{ fontSize: '0.75rem', color: '#8FA3CC' }}>{c.proyectos?.nombre || 'Proyecto'} · {c.ciudad} · Contrato #{c.numero_contrato}</div>
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', background: 'rgba(232,160,32,0.15)', color: '#E8A020', padding: '3px 10px', borderRadius: '20px', flexShrink: 0 }}>Pendiente tu firma</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    {[
                      { l: 'Beneficiaria', v: c.nombre_beneficiaria },
                      { l: 'Cedula', v: c.cedula_beneficiaria },
                      { l: 'Valor equipo', v: '$' + fmt(c.valor_equipo) + ' COP' },
                      { l: '% excedente angel', v: c.pct_excedente + '%' },
                      { l: 'Excedente est./mes', v: '$' + fmt(c.excedente_estimado) },
                      { l: 'Meses estimados', v: '~' + c.meses_estimados },
                    ].map(r => (
                      <div key={r.l} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.625rem' }}>
                        <div style={{ fontSize: '0.62rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>{r.l}</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#fff' }}>{r.v || '—'}</div>
                      </div>
                    ))}
                  </div>

                  {c.serial && (
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '1rem' }}>
                      Serial: <strong style={{ color: '#8FA3CC' }}>{c.serial}</strong>
                    </div>
                  )}

                  <div style={{ background: 'rgba(175,169,236,0.06)', border: '1px solid rgba(175,169,236,0.2)', borderRadius: '8px', padding: '0.875rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.78rem', color: '#AFA9EC', lineHeight: '1.65' }}>
                      Al firmar confirmas que: (1) compras este equipo y lo entregas a <strong style={{ color: '#fff' }}>{c.nombre_beneficiaria}</strong>,
                      (2) recibes el <strong style={{ color: '#fff' }}>{c.pct_excedente}%</strong> del excedente mensual hasta recuperar{' '}
                      <strong style={{ color: '#fff' }}>${fmt(c.valor_equipo)} COP</strong>,
                      (3) cuando se complete el pago la maquina pasa a nombre de la beneficiaria.
                      Firma valida bajo Ley 527/1999 de Colombia.
                    </div>
                  </div>

                  <button
                    onClick={() => firmarLeasing(c.id)}
                    disabled={firmandoLeasing === c.id}
                    style={{ width: '100%', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.875rem', fontSize: '0.92rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter,sans-serif', opacity: firmandoLeasing === c.id ? 0.7 : 1 }}>
                    {firmandoLeasing === c.id ? 'Firmando...' : '✍️ Firmar y aprobar contrato'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {contratosLeasing.filter(c => c.estado === 'activo').length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#1D9E75', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Contratos activos
              </div>
              {contratosLeasing.filter(c => c.estado === 'activo').map(c => {
                const abonado = parseFloat(c.capital_abonado || 0)
                const total = parseFloat(c.valor_equipo || 0)
                const pct = total > 0 ? Math.min(100, Math.round(abonado / total * 100)) : 0
                return (
                  <div key={c.id} style={{ background: 'rgba(29,158,117,0.04)', border: '1px solid rgba(29,158,117,0.15)', borderRadius: '12px', padding: '1.25rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#fff', marginBottom: '2px' }}>{c.tipo_equipo} {c.marca}</div>
                        <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{c.nombre_beneficiaria} · #{c.numero_contrato}</div>
                      </div>
                      <span style={{ fontSize: '0.65rem', fontWeight: '700', background: 'rgba(29,158,117,0.15)', color: '#1D9E75', padding: '3px 10px', borderRadius: '20px' }}>Activo</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '0.875rem' }}>
                      {[
                        { l: 'Abonado', v: '$' + fmt(abonado), c: '#1D9E75' },
                        { l: 'Pendiente', v: '$' + fmt(total - abonado), c: '#E8A020' },
                        { l: 'Recuperado', v: pct + '%', c: '#4A90D9' },
                      ].map(k => (
                        <div key={k.l} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.625rem', textAlign: 'center' }}>
                          <div style={{ fontSize: '1rem', fontWeight: '800', color: k.c }}>{k.v}</div>
                          <div style={{ fontSize: '0.62rem', color: '#6B7280', textTransform: 'uppercase', marginTop: '2px' }}>{k.l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '6px', height: '6px', overflow: 'hidden' }}>
                      <div style={{ width: pct + '%', height: '100%', background: '#1D9E75', borderRadius: '6px' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {contratosLeasing.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#4B5563', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔧</div>
              <div style={{ fontSize: '0.88rem', color: '#6B7280', marginBottom: '0.5rem' }}>No tienes contratos de leasing todavia</div>
              <div style={{ fontSize: '0.78rem', color: '#4B5563' }}>Cuando una beneficiaria firme un contrato de maquinaria, aparecera aqui</div>
            </div>
          )}

          {mensaje && <div style={{ background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.2)', borderRadius: '8px', padding: '0.75rem', color: '#E05555', fontSize: '0.82rem', marginTop: '1rem' }}>{mensaje}</div>}
        </div>
      )}

      {/* Modal fondeo */}
      {mostrarFondeo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: '#0F1E3A', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>Fondear: {mostrarFondeo.nombre}</div>
              <button onClick={() => { setMostrarFondeo(null); setMensaje('') }} style={{ background: 'none', border: 'none', color: '#8FA3CC', fontSize: '1.25rem', cursor: 'pointer' }}>X</button>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.875rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8FA3CC', marginBottom: '3px' }}><span>Proyecto</span><span style={{ color: '#fff' }}>{mostrarFondeo.proyectos?.nombre}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8FA3CC' }}><span>Falta fondear</span><span style={{ color: '#E8A020', fontWeight: '600' }}>${fmt(mostrarFondeo.faltante)}</span></div>
            </div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#8FA3CC', display: 'block', marginBottom: '4px' }}>Monto a invertir (COP)</label>
            <input style={s.input} type="number" value={formFondeo.monto} onChange={e => setFormFondeo(f => ({ ...f, monto: e.target.value }))} placeholder="5000000" />
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#8FA3CC', display: 'block', marginBottom: '6px' }}>A cambio de</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem' }}>
              {[{ id: 'participacion', label: '% Participacion' }, { id: 'deuda', label: 'Deuda + tasa' }, { id: 'revenue_share', label: '% Revenue' }].map(op => (
                <div key={op.id} onClick={() => setFormFondeo(f => ({ ...f, a_cambio_de: op.id }))} style={{ flex: 1, cursor: 'pointer', border: formFondeo.a_cambio_de === op.id ? '2px solid #4A90D9' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.5rem', textAlign: 'center', background: formFondeo.a_cambio_de === op.id ? 'rgba(74,144,217,0.12)' : 'transparent', fontSize: '0.72rem', color: formFondeo.a_cambio_de === op.id ? '#4A90D9' : '#8FA3CC', fontWeight: formFondeo.a_cambio_de === op.id ? '700' : '400' }}>
                  {op.label}
                </div>
              ))}
            </div>
            {formFondeo.a_cambio_de === 'participacion' && <input style={s.input} type="number" step="0.1" value={formFondeo.pct_participacion} onChange={e => setFormFondeo(f => ({ ...f, pct_participacion: e.target.value }))} placeholder="% participacion en el proyecto" />}
            {formFondeo.a_cambio_de === 'deuda' && <input style={s.input} type="number" step="0.1" value={formFondeo.tasa_mensual} onChange={e => setFormFondeo(f => ({ ...f, tasa_mensual: e.target.value }))} placeholder="Tasa mensual %" />}
            {formFondeo.a_cambio_de === 'revenue_share' && <input style={s.input} type="number" step="0.1" value={formFondeo.pct_revenue} onChange={e => setFormFondeo(f => ({ ...f, pct_revenue: e.target.value }))} placeholder="% de ingresos mensuales" />}
            {mensaje && <div style={{ fontSize: '0.8rem', color: '#E05555', marginBottom: '0.75rem', padding: '0.625rem', background: 'rgba(224,85,85,0.08)', borderRadius: '8px' }}>{mensaje}</div>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={proponerFondeo} disabled={enviando === 'nuevo'} style={{ ...s.btn('#4A90D9'), flex: 1, opacity: enviando === 'nuevo' ? 0.7 : 1 }}>
                {enviando === 'nuevo' ? 'Enviando...' : 'Enviar propuesta'}
              </button>
              <button onClick={() => { setMostrarFondeo(null); setMensaje('') }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#8FA3CC', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TarjetaFondeo({ f, s, accionFondeo, enviando, mostrarComprobante, setMostrarComprobante, comprobante, setComprobante }) {
  const est = ESTADO_FONDEO[f.estado] || ESTADO_FONDEO.propuesta
  const monto = parseFloat(f.monto || 0)

  // Calcular retorno esperado segun modelo
  let terminos = ''
  let retornoTexto = ''
  let retornoColor = '#6B7280'
  if (f.a_cambio_de === 'participacion') {
    terminos = (f.pct_participacion || 0) + '% del negocio'
    retornoTexto = 'Retorno variable segun valoracion futura del negocio'
    retornoColor = '#4A90D9'
  } else if (f.a_cambio_de === 'deuda') {
    const tasa = parseFloat(f.tasa_mensual || 0)
    const cuotaMes = Math.round(monto * tasa / 100)
    const mesesParaPagar = tasa > 0 ? Math.ceil(100 / tasa) : 0
    const totalRecuperar = monto + (cuotaMes * mesesParaPagar)
    terminos = tasa + '% mensual'
    retornoTexto = `~$${Math.round(cuotaMes).toLocaleString('es-CO')}/mes · Total a recuperar: $${Math.round(totalRecuperar).toLocaleString('es-CO')} en ~${mesesParaPagar} meses`
    retornoColor = '#1D9E75'
  } else if (f.a_cambio_de === 'revenue_share') {
    const pct = parseFloat(f.pct_revenue || 0)
    terminos = pct + '% de ventas'
    retornoTexto = `Si el negocio vende $10M/mes recuperas $${Math.round(10000000 * pct / 100).toLocaleString('es-CO')}/mes`
    retornoColor = '#E8A020'
  }
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem', marginBottom: '0.6rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff' }}>{f.presupuesto_items?.nombre}</div>
          <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{f.proyectos?.nombre} · {terminos}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff' }}>${Math.round(monto).toLocaleString('es-CO')}</span>
          <span style={{ fontSize: '0.62rem', fontWeight: '700', background: est.bg, color: est.color, padding: '2px 7px', borderRadius: '20px' }}>{est.label}</span>
        </div>
      </div>

      {/* Retorno esperado — C3.26 */}
      {f.estado === 'verificado' && retornoTexto && (
        <div style={{ background: `rgba(${retornoColor === '#1D9E75' ? '29,158,117' : retornoColor === '#4A90D9' ? '74,144,217' : '232,160,32'},0.08)`, borderRadius: '6px', padding: '0.5rem 0.75rem', marginBottom: '0.5rem', fontSize: '0.72rem', color: retornoColor }}>
          💰 {retornoTexto}
        </div>
      )}

      <div style={{ fontSize: '0.7rem', color: '#4B5563' }}>{est.accion}</div>
      {f.estado === 'aceptado' && (
        <div style={{ marginTop: '0.75rem' }}>
          {mostrarComprobante === f.id ? (
            <div>
              <input style={{ ...s.input, marginTop: '0.5rem' }} placeholder="Numero de comprobante" value={comprobante} onChange={e => setComprobante(e.target.value)} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => accionFondeo(f.id, 'confirmar_transferencia', { comprobante_url: comprobante })} disabled={enviando === f.id || !comprobante} style={{ ...s.btn('#4A90D9'), opacity: !comprobante ? 0.5 : 1 }}>
                  {enviando === f.id ? 'Enviando...' : 'Confirmar'}
                </button>
                <button onClick={() => setMostrarComprobante(null)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', color: '#8FA3CC', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setMostrarComprobante(f.id)} style={{ ...s.btn('#4A90D9'), marginTop: '0.5rem' }}>Ya transferi</button>
          )}
        </div>
      )}
    </div>
  )
}
