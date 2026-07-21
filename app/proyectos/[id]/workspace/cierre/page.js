'use client'
// /proyectos/[id]/workspace/cierre
// Flujo de cierre formal del proyecto
// Solo el fundador puede iniciarlo

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../../../lib/supabase'

const fmt = (n) => Math.round(parseFloat(n || 0)).toLocaleString('es-CO')

function CalificacionMutua({ proyectoId, usuario, equipo }) {
  const [califs, setCalifs] = useState({}) // { userId: { estrellas, comentario } }
  const [enviados, setEnviados] = useState({})
  const [enviando, setEnviando] = useState(false)

  const personas = (equipo || []).filter(m => m.id !== usuario?.id).slice(0, 10)
  if (!personas.length) return null

  async function enviarCalif(destinatarioId) {
    const c = califs[destinatarioId]
    if (!c?.estrellas) return
    setEnviando(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/calificaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          proyecto_id: proyectoId,
          de_usuario_id: usuario.id,
          para_usuario_id: destinatarioId,
          estrellas: c.estrellas,
          comentario: c.comentario || '',
        }),
      })
      const d = await res.json()
      if (d.ok || d.calificacion) setEnviados(e => ({ ...e, [destinatarioId]: true }))
    } catch (err) { console.error(err) }
    setEnviando(false)
  }

  const pendientes = personas.filter(p => !enviados[p.id]).length

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'left', background: 'rgba(232,160,32,0.06)', border: '1px solid rgba(232,160,32,0.2)', borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.25rem' }}>⭐</span>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>Califica a tu equipo</div>
          <div style={{ fontSize: '0.75rem', color: '#8FA3CC' }}>Ayuda a que otros sepan con quién vale la pena trabajar. {pendientes > 0 ? `${pendientes} persona${pendientes > 1 ? 's' : ''} por calificar.` : '¡Todas enviadas!'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
        {personas.map(persona => (
          <div key={persona.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>{persona.nombre}</div>
                <div style={{ fontSize: '0.72rem', color: '#8FA3CC' }}>{persona.rol || 'Miembro del equipo'}</div>
              </div>
              {enviados[persona.id] && <span style={{ fontSize: '0.72rem', color: '#1D9E75', fontWeight: '600' }}>✓ Enviada</span>}
            </div>

            {!enviados[persona.id] && (
              <>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  {[1,2,3,4,5].map(n => (
                    <span key={n} onClick={() => setCalifs(c => ({ ...c, [persona.id]: { ...c[persona.id], estrellas: n } }))}
                      style={{ fontSize: '1.3rem', cursor: 'pointer', color: (califs[persona.id]?.estrellas || 0) >= n ? '#E8A020' : '#4B5563' }}>
                      ★
                    </span>
                  ))}
                </div>
                <input
                  placeholder="Comentario opcional..."
                  value={califs[persona.id]?.comentario || ''}
                  onChange={e => setCalifs(c => ({ ...c, [persona.id]: { ...c[persona.id], comentario: e.target.value } }))}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.4rem 0.625rem', fontSize: '0.78rem', color: '#fff', fontFamily: 'Inter,sans-serif', marginBottom: '0.5rem' }}
                />
                <button
                  onClick={() => enviarCalif(persona.id)}
                  disabled={!califs[persona.id]?.estrellas || enviando}
                  style={{ background: califs[persona.id]?.estrellas ? '#E8A020' : 'rgba(255,255,255,0.06)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.4rem 1rem', fontSize: '0.78rem', fontWeight: '700', cursor: califs[persona.id]?.estrellas ? 'pointer' : 'not-allowed', fontFamily: 'Inter,sans-serif', opacity: califs[persona.id]?.estrellas ? 1 : 0.5 }}>
                  Enviar calificacion
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CierrePage() {
  const { id } = useParams()
  const [usuario, setUsuario] = useState(null)
  const [esFundador, setEsFundador] = useState(false)
  const [datos, setDatos] = useState(null)
  const [equipo, setEquipo] = useState([])
  const [cargando, setCargando] = useState(true)
  const [paso, setPaso] = useState(1) // 1: checklist, 2: confirmacion, 3: cerrado
  const [motivo, setMotivo] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const [confirmacion, setConfirmacion] = useState(false)

  useEffect(() => { cargar() }, [id])

  async function cargar() {
    const { data: { user } } = await supabase.auth.getUser()
    setUsuario(user)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setCargando(false); return }

    const res = await fetch(`/api/cierre?proyecto_id=${id}`, {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
    const d = await res.json()
    if (d.ok) {
      setDatos(d)
      if (d.proyecto.estado === 'cerrado') setPaso(3)
      else if (d.proyecto.estado === 'completado') setPaso(2)
    }
    const { data: proy } = await supabase.from('proyectos').select('fundador_id').eq('id', id).single()
    setEsFundador(proy?.fundador_id === user?.id)

    // Cargar equipo para calificacion mutua
    const { data: postulaciones } = await supabase
      .from('postulaciones')
      .select('postulante_id, perfiles!postulaciones_postulante_id_fkey(id, nombre), roles!postulaciones_rol_id_fkey(nombre)')
      .eq('proyecto_id', id)
      .eq('estado', 'aceptada')
    setEquipo((postulaciones || []).map(p => ({
      id: p.perfiles?.id,
      nombre: p.perfiles?.nombre,
      rol: p.roles?.nombre,
    })).filter(p => p.id))
    setCargando(false)
  }

  async function iniciarCierre() {
    setProcesando(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/cierre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ proyecto_id: id, motivo_cierre: motivo }),
      })
      const d = await res.json()
      if (!d.ok) throw new Error(d.error)
      setPaso(2)
      await cargar()
    } catch (err) { setError('Error: ' + err.message) }
    finally { setProcesando(false) }
  }

  async function cerrarDefinitivo() {
    if (!confirmacion) { setError('Debes confirmar que entiendes el cierre es permanente'); return }
    setProcesando(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/cierre', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ proyecto_id: id }),
      })
      const d = await res.json()
      if (!d.ok) throw new Error(d.error)
      setPaso(3)
      await cargar()
    } catch (err) { setError('Error: ' + err.message) }
    finally { setProcesando(false) }
  }

  const s = {
    page: { minHeight: '100vh', background: '#0B1628', fontFamily: 'Inter,sans-serif', color: '#fff' },
    nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    wrap: { maxWidth: '680px', margin: '0 auto', padding: '2rem 1.5rem' },
    card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', marginBottom: '0.875rem' },
    input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '0.6rem 0.875rem', color: '#fff', fontSize: '0.85rem', outline: 'none', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box', marginBottom: '0.75rem' },
    btn: (c) => ({ background: c, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.5rem', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }),
  }

  if (cargando) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8FA3CC' }}>Cargando...</div>
  if (!datos) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E05555' }}>Error cargando datos del proyecto</div>

  const { proyecto, checklist, resumen } = datos

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href={`/proyectos/${id}/workspace`} style={{ fontSize: '0.85rem', color: '#8FA3CC', textDecoration: 'none' }}>Workspace</a>
        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff' }}>Cierre formal del proyecto</div>
        <div style={{ width: '80px' }} />
      </nav>

      <div style={s.wrap}>

        {/* Paso indicador */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '2rem', overflow: 'hidden', borderRadius: '8px' }}>
          {[
            { n: 1, label: 'Checklist' },
            { n: 2, label: 'Confirmacion' },
            { n: 3, label: 'Cerrado' },
          ].map((p, i) => (
            <div key={p.n} style={{ flex: 1, padding: '0.5rem', textAlign: 'center', background: paso >= p.n ? 'rgba(29,158,117,0.15)' : 'rgba(255,255,255,0.04)', borderBottom: `2px solid ${paso >= p.n ? '#1D9E75' : 'rgba(255,255,255,0.08)'}`, fontSize: '0.72rem', color: paso >= p.n ? '#1D9E75' : '#6B7280', fontWeight: paso === p.n ? '700' : '400' }}>
              {p.n}. {p.label}
            </div>
          ))}
        </div>

        {/* ====== PASO 1: CHECKLIST ====== */}
        {paso === 1 && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>{proyecto.nombre}</h2>
              <p style={{ fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6' }}>
                Antes de cerrar el proyecto formalmente, revisa el estado de cada elemento. El cierre es permanente — una vez cerrado, el proyecto queda archivado.
              </p>
            </div>

            {/* Checklist */}
            <div style={{ ...s.card, marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff', marginBottom: '1rem' }}>Estado del proyecto</div>
              {(checklist || []).map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', padding: '0.625rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '1px' }}>{item.ok ? '✅' : item.bloqueante ? '🔴' : '⚠️'}</span>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#fff' }}>{item.label}</div>
                    <div style={{ fontSize: '0.72rem', color: item.ok ? '#1D9E75' : '#E8A020' }}>{item.detalle}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen numerico */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Hitos', valor: `${resumen.hitos_completados}/${resumen.hitos_total}`, color: resumen.hitos_completados === resumen.hitos_total ? '#1D9E75' : '#E8A020' },
                { label: 'Tareas', valor: `${resumen.tareas_completadas}/${resumen.tareas_total}`, color: '#4A90D9' },
                { label: 'Total ingresos', valor: `$${fmt(resumen.total_ingresos)}`, color: '#1D9E75' },
                { label: 'Inversiones activas', valor: resumen.inversiones_activas, color: '#AFA9EC' },
              ].map(k => (
                <div key={k.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.875rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: k.color }}>{k.valor}</div>
                  <div style={{ fontSize: '0.65rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* Participantes que seran notificados */}
            {(resumen.participantes?.length > 0 || resumen.inversores?.length > 0) && (
              <div style={s.card}>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#fff', marginBottom: '0.75rem' }}>Se notificara a estos participantes</div>
                {resumen.participantes?.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: '#C8D4E8' }}>{p.nombre}</span>
                    <span style={{ color: '#6B7280' }}>{p.rol}</span>
                  </div>
                ))}
                {resumen.inversores?.map(i => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: '#C8D4E8' }}>{i.nombre}</span>
                    <span style={{ color: '#AFA9EC' }}>Angel · ${fmt(i.monto)} · {i.modelo}</span>
                  </div>
                ))}
              </div>
            )}

            {esFundador ? (
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#8FA3CC', display: 'block', marginBottom: '4px' }}>Motivo del cierre (opcional)</label>
                <input style={s.input} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ej: Proyecto completado, empresa operando, objetivos alcanzados..." />
                {error && <div style={{ fontSize: '0.8rem', color: '#E05555', marginBottom: '0.75rem', padding: '0.625rem', background: 'rgba(224,85,85,0.08)', borderRadius: '8px' }}>{error}</div>}
                <button onClick={iniciarCierre} disabled={procesando} style={{ ...s.btn('#1D9E75'), opacity: procesando ? 0.7 : 1 }}>
                  {procesando ? 'Iniciando cierre...' : 'Iniciar proceso de cierre →'}
                </button>
              </div>
            ) : (
              <div style={{ ...s.card, background: 'rgba(107,114,128,0.06)', textAlign: 'center', color: '#6B7280', fontSize: '0.82rem' }}>
                Solo el fundador puede iniciar el cierre del proyecto.
              </div>
            )}
          </div>
        )}

        {/* ====== PASO 2: CONFIRMACION ====== */}
        {paso === 2 && (
          <div>
            <div style={{ background: 'rgba(232,160,32,0.06)', border: '1px solid rgba(232,160,32,0.2)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#E8A020', marginBottom: '0.5rem' }}>El proyecto esta en estado completado</div>
              <div style={{ fontSize: '0.78rem', color: '#8FA3CC', lineHeight: '1.6' }}>
                Todos los participantes han sido notificados. Cuando confirmes el cierre definitivo, el proyecto pasara a estado cerrado y ya no podra modificarse.
              </div>
            </div>

            {/* Resumen final */}
            <div style={{ ...s.card, marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff', marginBottom: '1rem' }}>Resumen del proyecto</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8FA3CC' }}>Metas completadas</span>
                  <span style={{ color: '#1D9E75', fontWeight: '600' }}>{resumen.hitos_completados}/{resumen.hitos_total}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8FA3CC' }}>Total ingresos registrados</span>
                  <span style={{ color: '#fff', fontWeight: '600' }}>${fmt(resumen.total_ingresos)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8FA3CC' }}>Inversiones activas</span>
                  <span style={{ color: '#AFA9EC', fontWeight: '600' }}>{resumen.inversiones_activas}</span>
                </div>
              </div>
            </div>

            {esFundador && (
              <div>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', marginBottom: '1.25rem', background: 'rgba(224,85,85,0.06)', border: '1px solid rgba(224,85,85,0.2)', borderRadius: '10px', padding: '0.875rem' }}>
                  <input type="checkbox" checked={confirmacion} onChange={e => setConfirmacion(e.target.checked)} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', color: '#C8D4E8', lineHeight: '1.6' }}>
                    Entiendo que el cierre del proyecto es <strong style={{ color: '#E05555' }}>permanente e irreversible</strong>. El proyecto quedara archivado con toda su informacion, contratos e historial de participaciones.
                  </span>
                </label>

                {error && <div style={{ fontSize: '0.8rem', color: '#E05555', marginBottom: '0.75rem', padding: '0.625rem', background: 'rgba(224,85,85,0.08)', borderRadius: '8px' }}>{error}</div>}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={cerrarDefinitivo} disabled={procesando || !confirmacion} style={{ ...s.btn('#E05555'), opacity: (!confirmacion || procesando) ? 0.5 : 1 }}>
                    {procesando ? 'Cerrando...' : 'Cerrar proyecto definitivamente'}
                  </button>
                  <a href={`/proyectos/${id}/workspace`} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#8FA3CC', borderRadius: '8px', padding: '0.6rem 1.25rem', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-block' }}>
                    Volver al workspace
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====== PASO 3: CERRADO ====== */}
        {paso === 3 && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff', marginBottom: '0.75rem' }}>Proyecto cerrado</h2>
            <p style={{ fontSize: '0.88rem', color: '#8FA3CC', lineHeight: '1.6', maxWidth: '480px', margin: '0 auto 2rem' }}>
              El proyecto <strong style={{ color: '#fff' }}>{proyecto.nombre}</strong> ha sido cerrado formalmente. Toda la informacion, contratos y participaciones quedan archivados.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '0.75rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
              {[
                { label: 'Hitos completados', valor: `${resumen.hitos_completados}/${resumen.hitos_total}`, color: '#1D9E75' },
                { label: 'Total ingresos', valor: `$${fmt(resumen.total_ingresos)}`, color: '#1D9E75' },
                { label: 'Inversiones', valor: resumen.inversiones_activas, color: '#AFA9EC' },
              ].map(k => (
                <div key={k.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.875rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: k.color }}>{k.valor}</div>
                  <div style={{ fontSize: '0.65rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* CALIFICACION MUTUA — C2.23 */}
            <CalificacionMutua proyectoId={id} usuario={usuario} equipo={equipo} />

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              <a href="/dashboard" style={{ background: '#1D9E75', color: '#fff', padding: '0.6rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700' }}>
                Ir al dashboard
              </a>
              <a href={`/proyectos/${id}/workspace`} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#8FA3CC', padding: '0.6rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem' }}>
                Ver archivo del proyecto
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
