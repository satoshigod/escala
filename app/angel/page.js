'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Angel() {
  const [usuario, setUsuario] = useState(null)
  const [proyectos, setProyectos] = useState([])
  const [hitosDisponibles, setHitosDisponibles] = useState([])
  const [misImpulsos, setMisImpulsos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [financiando, setFinanciando] = useState(null)
  const [msgHito, setMsgHito] = useState({})
  const [tab, setTab] = useState('explorar')
  const [logrosOtorgado, setLogrosOtorgado] = useState(false)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)

      const pRes = await fetch('/api/proyectos')
      const pData = await pRes.json()
      const proyectosData = pData.proyectos || []
      setProyectos(proyectosData)

      const todosHitos = []
      await Promise.all(proyectosData.map(async p => {
        const hRes = await fetch('/api/hitos?proyecto_id=' + p.id)
        const hData = await hRes.json()
        const pendientes = (hData.hitos || []).filter(h => !h.completado)
        pendientes.forEach(h => todosHitos.push({ ...h, proyecto_nombre: p.nombre, proyecto_ciudad: p.ciudad, proyecto_sector: p.sector }))
      }))
      setHitosDisponibles(todosHitos)

      const impulRes = await fetch('/api/impulsos?angel_id=' + user.id).catch(() => ({ json: () => ({ impulsos: [] }) }))
      const impulData = await impulRes.json().catch(() => ({ impulsos: [] }))
      setMisImpulsos(impulData.impulsos || [])

      // Otorgar logro si tiene impulsos
      if (impulData.impulsos?.length > 0 && !logrosOtorgado) {
        fetch('/api/logros', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario_id: user.id, tipo: 'primer_impulso' })
        }).catch(() => {})
        setLogrosOtorgado(true)
      }
      setCargando(false)
    }
    cargar()
  }, [])

  async function financiarHito(hito) {
    setFinanciando(hito.id)
    const res = await fetch('/api/impulsos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proyecto_id: hito.proyecto_id,
        angel_id: usuario.id,
        hito_id: hito.id,
        descripcion: 'Impulso al hito: ' + hito.nombre,
        valor: 0
      })
    }).catch(() => null)

    if (res && res.ok) {
      setMsgHito({ [hito.id]: '✅ Impulso registrado. El equipo del proyecto te contactará.' })
    } else {
      setMsgHito({ [hito.id]: '📲 Escríbenos por WhatsApp para coordinar el pago de este hito.' })
    }
    setFinanciando(null)
  }

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando...
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/dashboard" style={{textDecoration:'none',display:'flex',alignItems:'center'}}><img src="/brand/isotipo.svg" alt="Escala" width="26" height="26" style={{display:"inline-block",verticalAlign:"middle",marginRight:"6px"}}/><span style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Esca<span style={{color:'#1D9E75'}}>la</span></span></a>
        <div style={{display:'flex',gap:'1.5rem'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Dashboard</a>
          <a href="/angel" style={{color:'#fff',fontSize:'0.82rem',fontWeight:'600',textDecoration:'none'}}>🌟 Ángel de Impulso</a>
          <a href="/proyectos" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Proyectos</a>
        </div>
      </nav>

      <main style={{maxWidth:'900px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'2rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#E8A020',marginBottom:'0.4rem'}}>Rol especial</div>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#E8A020',marginBottom:'0.3rem'}}>Financiamiento por hitos</div>
          <div style={{fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>🌟 Ángel de Impulso</div>
          <div style={{fontSize:'0.82rem',color:'#8FA3CC',marginTop:'0.3rem',lineHeight:'1.6'}}>Financia hitos específicos de proyectos en Escala. A cambio recibes un retorno proporcional cuando el proyecto genere ingresos — sin intervenir en las decisiones del equipo.</div>
          <div style={{fontSize:'0.85rem',color:'#8FA3CC',marginTop:'0.3rem',maxWidth:'580px'}}>Financia un hito específico sin esperar equity ni devolución. Tu aporte queda rastreado con fecha y evidencia. Recibes acceso al expediente del proyecto y prioridad en rondas futuras.</div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginBottom:'2rem'}}>
          <div style={{background:'rgba(232,160,32,0.08)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
            <div style={{fontSize:'1.5rem',marginBottom:'0.4rem'}}>📋</div>
            <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>Sin equity</div>
            <div style={{fontSize:'0.7rem',color:'#8FA3CC'}}>No se convierte en socio</div>
          </div>
          <div style={{background:'rgba(232,160,32,0.08)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
            <div style={{fontSize:'1.5rem',marginBottom:'0.4rem'}}>🔍</div>
            <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>Trazabilidad total</div>
            <div style={{fontSize:'0.7rem',color:'#8FA3CC'}}>Expediente del proyecto</div>
          </div>
          <div style={{background:'rgba(232,160,32,0.08)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
            <div style={{fontSize:'1.5rem',marginBottom:'0.4rem'}}>⭐</div>
            <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>Prioridad en rondas</div>
            <div style={{fontSize:'0.7rem',color:'#8FA3CC'}}>Antes que inversionistas externos</div>
          </div>
        </div>

        <div style={{display:'flex',gap:'0',marginBottom:'1.5rem',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          {[
            { id: 'explorar', label: `Hitos disponibles (${hitosDisponibles.length})` },
            { id: 'mis_impulsos', label: `Mis impulsos (${misImpulsos.length})` },
            { id: 'metricas', label: '📊 Métricas' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{background:'none',border:'none',borderBottom: tab===t.id ? '2px solid #E8A020' : '2px solid transparent',color: tab===t.id ? '#fff' : '#8FA3CC',padding:'0.5rem 1.25rem',fontSize:'0.85rem',fontWeight: tab===t.id ? '600' : '400',cursor:'pointer',fontFamily:'Inter,sans-serif',marginBottom:'-1px'}}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'explorar' && (
          hitosDisponibles.length === 0 ? (
            <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.12)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
              <div style={{fontSize:'2rem',marginBottom:'1rem'}}>🎯</div>
              <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.5rem'}}>Sin hitos disponibles por ahora</div>
              <div style={{color:'#8FA3CC',fontSize:'0.85rem',marginBottom:'1.5rem'}}>Cuando los proyectos publiquen hitos pendientes, aparecerán aquí para que puedas financiarlos.</div>
              <a href="/hitos" style={{background:'#E8A020',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.875rem',fontWeight:'700',display:'inline-block'}}>Crear hito en mi proyecto →</a>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              {hitosDisponibles.map(h => (
                <div key={h.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'1rem',marginBottom:'0.875rem'}}>
                    <div>
                      <div style={{fontSize:'0.65rem',fontWeight:'700',color:'#E8A020',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'0.3rem'}}>{h.proyecto_nombre} · {h.proyecto_sector}</div>
                      <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>{h.nombre}</div>
                      {h.descripcion && <div style={{fontSize:'0.78rem',color:'#8FA3CC',lineHeight:'1.5'}}>{h.descripcion}</div>}
                    </div>
                  </div>
                  <button
                    onClick={() => financiarHito(h)}
                    disabled={financiando === h.id || !!msgHito[h.id]}
                    style={{background: msgHito[h.id] ? 'rgba(232,160,32,0.1)' : '#E8A020',color:'#fff',border: msgHito[h.id] ? '1px solid rgba(232,160,32,0.3)' : 'none',borderRadius:'8px',padding:'0.7rem 1.25rem',fontSize:'0.82rem',fontWeight:'700',cursor: financiando === h.id || msgHito[h.id] ? 'not-allowed' : 'pointer',fontFamily:'Inter,sans-serif',transition:'all 0.2s'}}
                  >
                    {financiando === h.id ? 'Registrando...' : msgHito[h.id] ? msgHito[h.id] : '🌟 Quiero impulsar este hito'}
                  </button>
                  {msgHito[h.id] && msgHito[h.id].includes('WhatsApp') && (
                    <a href={'https://wa.me/573005485019?text=' + encodeURIComponent('Quiero impulsar el hito: ' + h.nombre)} style={{display:'inline-block',marginTop:'0.5rem',background:'#1D9E75',color:'#fff',padding:'0.5rem 1rem',borderRadius:'6px',textDecoration:'none',fontSize:'0.78rem',fontWeight:'700'}}>
                      📲 Escribir por WhatsApp
                    </a>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'metricas' && (() => {
          const totalInvertido = misImpulsos.reduce((s, i) => s + (i.valor || 0), 0)
          const ejecutados = misImpulsos.filter(i => i.ejecutado)
          const pendientes = misImpulsos.filter(i => !i.ejecutado)
          const pctEjecutado = misImpulsos.length > 0 ? Math.round((ejecutados.length / misImpulsos.length) * 100) : 0
          const fmt = v => '$' + v.toLocaleString('es-CO')
          return (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
                <div style={{background:'rgba(232,160,32,0.08)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'12px',padding:'1.25rem'}}>
                  <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#E8A020'}}>{fmt(totalInvertido)}</div>
                  <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Total invertido en hitos</div>
                </div>
                <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.25rem'}}>
                  <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#1D9E75'}}>{pctEjecutado}%</div>
                  <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Hitos ejecutados ({ejecutados.length} de {misImpulsos.length})</div>
                </div>
                <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem'}}>
                  <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#fff'}}>{misImpulsos.length}</div>
                  <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Total de impulsos</div>
                </div>
                <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem'}}>
                  <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#AFA9EC'}}>{fmt(pendientes.reduce((s,i)=>s+(i.valor||0),0))}</div>
                  <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Pendiente de ejecución</div>
                </div>
              </div>

              {misImpulsos.length > 0 && (
                <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem'}}>
                  <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff',marginBottom:'1rem'}}>Historial de impulsos</div>
                  {misImpulsos.map(imp => (
                    <div key={imp.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.75rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)',gap:'1rem'}}>
                      <div>
                        <div style={{fontSize:'0.82rem',fontWeight:'600',color:'#fff'}}>{imp.hitos?.nombre || imp.descripcion}</div>
                        <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>{imp.proyectos?.nombre || 'Proyecto'}</div>
                      </div>
                      <div style={{textAlign:'right',flexShrink:0}}>
                        <div style={{fontFamily:'monospace',fontSize:'0.875rem',fontWeight:'700',color:'#E8A020'}}>{fmt(imp.valor)}</div>
                        <div style={{fontSize:'0.68rem',color:imp.ejecutado ? '#1D9E75' : '#8FA3CC',marginTop:'0.1rem'}}>{imp.ejecutado ? '✓ Ejecutado' : '⏳ Pendiente'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {misImpulsos.length === 0 && (
                <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.12)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
                  <div style={{fontSize:'2rem',marginBottom:'1rem'}}>📊</div>
                  <div style={{fontSize:'0.875rem',color:'#8FA3CC'}}>Tus métricas aparecerán aquí cuando hagas tu primer impulso.</div>
                </div>
              )}
            </div>
          )
        })()}

        {tab === 'mis_impulsos' && (
          misImpulsos.length === 0 ? (
            <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.12)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
              <div style={{fontSize:'2rem',marginBottom:'1rem'}}>🌟</div>
              <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.5rem'}}>Sin impulsos todavía</div>
              <div style={{color:'#8FA3CC',fontSize:'0.85rem'}}>Explora los hitos disponibles y financia el primero.</div>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              {misImpulsos.map(i => (
                <div key={i.id} style={{background:'rgba(232,160,32,0.06)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'10px',padding:'1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
                  <div>
                    <div style={{fontSize:'0.9rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>{i.descripcion}</div>
                    <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>{new Date(i.created_at).toLocaleDateString('es-CO')}</div>
                  </div>
                  <span style={{fontSize:'0.72rem',fontWeight:'700',padding:'0.25rem 0.75rem',borderRadius:'20px',background: i.ejecutado ? 'rgba(29,158,117,0.15)' : 'rgba(232,160,32,0.15)',color: i.ejecutado ? '#1D9E75' : '#E8A020'}}>
                    {i.ejecutado ? '✅ Ejecutado' : '⏳ En proceso'}
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  )
}
