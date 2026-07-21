'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

const modalidadLabels = {
  equity: 'Equity', deuda_diferida: 'Deuda diferida', success_fee: 'Success Fee',
  hibrido: 'Híbrido', regalias: 'Regalías', bonos_hitos: 'Bonos por metas',
  nueva_unidad: 'Nueva unidad', convertible: 'Deuda convertible'
}

export default function ProyectoDetalle() {
  const [proyecto, setProyecto] = useState(null)
  const [roles, setRoles] = useState([])
  const [hitos, setHitos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [usuario, setUsuario] = useState(null)
  const [msgRol, setMsgRol] = useState({})
  const [postulando, setPostulando] = useState(null)
  const [misPostulaciones, setMisPostulaciones] = useState([])

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      // No redirigir — visitantes sin cuenta pueden ver el proyecto
      setUsuario(user || null)
      const parts = window.location.pathname.split('/').filter(Boolean)
      const proyectoIndex = parts.indexOf('proyectos')
      const pid = proyectoIndex !== -1 ? parts[proyectoIndex + 1] : null

      const peticiones = [
        fetch('/api/proyectos/' + pid),
        fetch('/api/roles?proyecto_id=' + pid),
        fetch('/api/hitos?proyecto_id=' + pid),
      ]
      if (user) peticiones.push(fetch('/api/postulaciones?postulante_id=' + user.id))

      const resultados = await Promise.all(peticiones)
      const d1 = await resultados[0].json()
      const d2 = await resultados[1].json()
      const d3 = await resultados[2].json()
      const d4 = user ? await resultados[3].json() : { postulaciones: [] }

      setProyecto(d1.proyecto || null)
      setRoles(d2.roles || [])
      setHitos((d3.hitos || []).filter(h => h.completado))
      setMisPostulaciones((d4.postulaciones || []).map(p => p.rol_id))
      setCargando(false)
    }
    cargar()
  }, [])

  async function postularse(rol) {
    setPostulando(rol.id)
    const res = await fetch('/api/postulaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rol_id: rol.id, postulante_id: usuario.id, mensaje: 'Me postulo al rol de ' + rol.nombre })
    })
    const data = await res.json()
    if (data.error) {
      setMsgRol({ [rol.id]: 'Ya te postulaste a este rol' })
    } else {
      setMsgRol({ [rol.id]: '✅ Postulación enviada' })
      setMisPostulaciones(prev => [...prev, rol.id])
    }
    setPostulando(null)
  }

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando proyecto...
    </div>
  )

  if (!proyecto) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif',gap:'1rem'}}>
      <div style={{fontSize:'2rem'}}>🔍</div>
      <div style={{color:'#fff',fontWeight:'700'}}>Proyecto no encontrado</div>
      <a href="/proyectos" style={{color:'#1D9E75',textDecoration:'none'}}>← Ver proyectos</a>
    </div>
  )

  const rolesAbiertos = roles.filter(r => r.estado === 'abierto')
  const rolesPrioritarios = roles.filter(r => r.es_prioritario && r.estado === 'abierto')

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/dashboard" style={{textDecoration:'none',display:'flex',alignItems:'center'}}><img src="/brand/isotipo.svg" alt="Escala" width="26" height="26" style={{display:"inline-block",verticalAlign:"middle",marginRight:"6px"}}/><span style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Esca<span style={{color:'#1D9E75'}}>la</span></span></a>
        <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Dashboard</a>
          <a href="/proyectos" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Proyectos</a>
          <button onClick={() => window.history.back()} style={{background:'none',border:'none',color:'#8FA3CC',fontSize:'0.82rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>← Volver</button>
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/registro?modo=login' }} style={{background:'rgba(216,90,48,0.1)',border:'1px solid rgba(216,90,48,0.25)',color:'#D85A30',fontSize:'0.78rem',fontWeight:'600',padding:'0.3rem 0.875rem',borderRadius:'6px',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Salir</button>
        </div>
      </nav>

      <main style={{maxWidth:'900px',margin:'0 auto',padding:'2rem 1.25rem'}}>

        {/* HERO DEL PROYECTO */}
        <div style={{background:'linear-gradient(135deg,rgba(29,158,117,0.12),rgba(83,74,183,0.08))',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'16px',padding:'2.5rem',marginBottom:'2rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'1rem',marginBottom:'1.5rem'}}>
            <div>
              <div style={{fontSize:'0.68rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.5rem'}}>
                Tipo {proyecto.tipo} — {proyecto.tipo === 'A' ? 'Empresa nueva' : 'Transformación'} · {proyecto.sector} · {proyecto.ciudad}
              </div>
              <div style={{fontSize:'clamp(1.8rem,4vw,2.5rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em',lineHeight:'1.1',marginBottom:'0.5rem'}}>
                {proyecto.nombre}
              </div>
              <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                <span style={{fontSize:'0.72rem',fontWeight:'700',padding:'0.2rem 0.75rem',borderRadius:'20px',background:'rgba(29,158,117,0.15)',color:'#1D9E75',border:'1px solid rgba(29,158,117,0.3)'}}>● {proyecto.estado}</span>
                <span style={{fontSize:'0.72rem',fontWeight:'700',padding:'0.2rem 0.75rem',borderRadius:'20px',background:'rgba(255,255,255,0.08)',color:'#8FA3CC'}}>{rolesAbiertos.length} roles abiertos</span>
              </div>
            </div>
          </div>

          <div style={{fontSize:'1rem',color:'#C8D4E8',lineHeight:'1.8',marginBottom:'1.5rem'}}>
            {proyecto.descripcion}
          </div>
        </div>

        {/* QUÉ ES Y QUÉ BUSCA */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem'}}>
            <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#1D9E75',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'0.875rem'}}>¿Qué es este proyecto?</div>
            <div style={{fontSize:'0.85rem',color:'#C8D4E8',lineHeight:'1.7'}}>
              Un proyecto Tipo {proyecto.tipo === 'A' ? 'A es una empresa nueva que se construye desde cero con un equipo de aportantes. Cada persona aporta lo que tiene — tiempo, conocimiento, servicios, capital o red — y recibe participación proporcional a su aporte real.' : 'B es una empresa existente que busca resolver una brecha específica con talento externo bajo el modelo de deuda diferida o equity.'}
            </div>
          </div>
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem'}}>
            <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#E8A020',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'0.875rem'}}>¿Cómo funciona tu compensación?</div>
            <div style={{fontSize:'0.85rem',color:'#C8D4E8',lineHeight:'1.7'}}>
              Tu trabajo queda registrado desde el primer día. Si cumples lo pactado, se paga — la forma depende de si el proyecto ya tiene recursos para esta etapa (cash o acciones) o está en Riesgo Compartido (acciones o deuda registrada como pasivo, condicionada a que el proyecto genere valor).
            </div>
          </div>
        </div>

        {/* HITOS COMPLETADOS */}
        {hitos.length > 0 && (
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem',marginBottom:'2rem'}}>
            <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#1D9E75',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'1rem'}}>Avance del proyecto — metas completadas</div>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              {hitos.map((h, i) => (
                <div key={h.id} style={{display:'flex',gap:'0.75rem',alignItems:'center'}}>
                  <div style={{width:'20px',height:'20px',borderRadius:'50%',background:'#1D9E75',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.65rem',color:'#fff',flexShrink:0}}>✓</div>
                  <div style={{fontSize:'0.82rem',color:'#C8D4E8'}}>{h.nombre}</div>
                  {h.fecha_completado && <div style={{fontSize:'0.68rem',color:'#6B7280',marginLeft:'auto'}}>{new Date(h.fecha_completado).toLocaleDateString('es-CO')}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROLES PRIORITARIOS */}
        {rolesPrioritarios.length > 0 && (
          <div style={{marginBottom:'2rem'}}>
            <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#E8A020',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'1rem'}}>🔥 Roles prioritarios — se necesitan ya</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1rem'}}>
              {rolesPrioritarios.map(rol => {
                const yaPostulado = misPostulaciones.includes(rol.id)
                return (
                  <div key={rol.id} style={{background:'rgba(232,160,32,0.06)',border:'1px solid rgba(232,160,32,0.3)',borderRadius:'12px',padding:'1.25rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem'}}>
                      <div>
                        <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff'}}>{rol.nombre}</div>
                        {rol.sub_especialidad && <div style={{fontSize:'0.72rem',color:'#E8A020',fontWeight:'600',marginTop:'2px'}}>{rol.sub_especialidad}</div>}
                      </div>
                      <span style={{fontSize:'0.62rem',fontWeight:'700',padding:'2px 8px',borderRadius:'10px',background:'rgba(232,160,32,0.2)',color:'#E8A020'}}>🔥 Prioritario</span>
                    </div>
                    {rol.descripcion && <div style={{fontSize:'0.78rem',color:'#8FA3CC',lineHeight:'1.5',marginBottom:'0.875rem'}}>{rol.descripcion}</div>}
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.875rem'}}>
                      <div style={{fontFamily:'monospace',fontSize:'0.85rem',fontWeight:'600',color:'#fff'}}>{rol.valor_mercado ? '$'+rol.valor_mercado.toLocaleString() : 'A negociar'}</div>
                      <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>{modalidadLabels[rol.modalidad] || rol.modalidad}</div>
                    </div>
                    {yaPostulado ? (
                      <div style={{textAlign:'center',fontSize:'0.78rem',color:'#1D9E75',fontWeight:'700',padding:'0.6rem',background:'rgba(29,158,117,0.1)',borderRadius:'6px'}}>✅ Ya te postulaste</div>
                    ) : (
                      <>
                        {usuario ? (
                          <button onClick={() => postularse(rol)} disabled={postulando===rol.id} style={{width:'100%',background:'#E8A020',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7rem',fontSize:'0.82rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                            {postulando===rol.id ? 'Enviando...' : 'Postularme a este rol →'}
                          </button>
                        ) : (
                          <a href="/registro" style={{display:'block',width:'100%',background:'#E8A020',color:'#fff',borderRadius:'8px',padding:'0.7rem',fontSize:'0.82rem',fontWeight:'700',textAlign:'center',textDecoration:'none',boxSizing:'border-box'}}>
                            Regístrate para postularte →
                          </a>
                        )}
                        {msgRol[rol.id] && <div style={{marginTop:'0.5rem',fontSize:'0.75rem',color:'#1D9E75',textAlign:'center'}}>{msgRol[rol.id]}</div>}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TODOS LOS ROLES */}
        <div style={{marginBottom:'2rem'}}>
          <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#8FA3CC',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'1rem'}}>Todos los roles disponibles</div>
          {roles.length === 0 ? (
            <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.12)',borderRadius:'12px',padding:'2.5rem',textAlign:'center',color:'#8FA3CC'}}>
              Sin roles publicados aún.
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'1rem'}}>
              {roles.map(rol => {
                const yaPostulado = misPostulaciones.includes(rol.id)
                return (
                  <div key={rol.id} style={{background:'rgba(255,255,255,0.04)',border: yaPostulado ? '1px solid rgba(29,158,117,0.3)' : '1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem'}}>
                    <div style={{marginBottom:'0.4rem'}}>
                      <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff'}}>{rol.nombre} {rol.es_prioritario?'🔥':''}</div>
                      {rol.sub_especialidad && <div style={{fontSize:'0.72rem',color:'#1D9E75',fontWeight:'600',marginTop:'2px'}}>{rol.sub_especialidad}</div>}
                    </div>
                    {rol.descripcion && <div style={{fontSize:'0.78rem',color:'#8FA3CC',lineHeight:'1.5',marginBottom:'0.875rem'}}>{rol.descripcion}</div>}
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.875rem'}}>
                      <div style={{fontFamily:'monospace',fontSize:'0.82rem',fontWeight:'600',color:'#fff'}}>{rol.valor_mercado ? '$'+rol.valor_mercado.toLocaleString() : 'A negociar'}</div>
                      <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>{modalidadLabels[rol.modalidad] || rol.modalidad}</div>
                    </div>
                    {rol.estado === 'abierto' ? (
                      yaPostulado ? (
                        <div style={{textAlign:'center',fontSize:'0.78rem',color:'#1D9E75',fontWeight:'700',padding:'0.6rem',background:'rgba(29,158,117,0.1)',borderRadius:'6px'}}>✅ Ya te postulaste</div>
                      ) : (
                        <>
                          {usuario ? (
                            <button onClick={() => postularse(rol)} disabled={postulando===rol.id} style={{width:'100%',background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7rem',fontSize:'0.82rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                              {postulando===rol.id ? 'Enviando...' : 'Postularme →'}
                            </button>
                          ) : (
                            <a href="/registro" style={{display:'block',width:'100%',background:'#1D9E75',color:'#fff',borderRadius:'8px',padding:'0.7rem',fontSize:'0.82rem',fontWeight:'700',textAlign:'center',textDecoration:'none',boxSizing:'border-box'}}>
                              Regístrate para postularte →
                            </a>
                          )}
                          {msgRol[rol.id] && <div style={{marginTop:'0.5rem',fontSize:'0.75rem',color:'#1D9E75',textAlign:'center'}}>{msgRol[rol.id]}</div>}
                        </>
                      )
                    ) : (
                      <div style={{textAlign:'center',fontSize:'0.78rem',color:'#1D9E75',fontWeight:'600'}}>✓ Cubierto</div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* BANNER REGISTRO PARA VISITANTES */}
        {!usuario && (
          <div style={{background:'linear-gradient(135deg,rgba(29,158,117,0.15),rgba(83,74,183,0.1))',border:'1px solid rgba(29,158,117,0.3)',borderRadius:'12px',padding:'1.5rem',textAlign:'center',marginBottom:'1.5rem'}}>
            <div style={{fontSize:'1.25rem',marginBottom:'0.5rem'}}>👋</div>
            <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',marginBottom:'0.4rem'}}>¿Quieres participar en este proyecto?</div>
            <div style={{fontSize:'0.82rem',color:'#8FA3CC',marginBottom:'1rem'}}>Crea tu cuenta gratis en menos de 2 minutos y postúlate al rol que más encaje contigo.</div>
            <a href="/registro" style={{display:'inline-block',background:'#1D9E75',color:'#fff',padding:'0.75rem 2rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.875rem',fontWeight:'700'}}>
              Crear cuenta y postularme →
            </a>
          </div>
        )}

        {/* CTA CONTACTO */}
        <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
          <div>
            <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>¿Tienes preguntas sobre el proyecto?</div>
            <div style={{fontSize:'0.78rem',color:'#8FA3CC'}}>Escríbenos directamente por WhatsApp antes de postularte.</div>
          </div>
          <a href={'https://wa.me/573005485019?text=' + encodeURIComponent('Hola, tengo preguntas sobre el proyecto ' + (proyecto?.nombre || ''))} style={{background:'#1D9E75',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.875rem',fontWeight:'700',whiteSpace:'nowrap'}}>
            📲 WhatsApp
          </a>
        </div>

      </main>
    </div>
  )
}
