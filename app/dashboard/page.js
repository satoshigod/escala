'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [misProyectos, setMisProyectos] = useState([])
  const [misPostulaciones, setMisPostulaciones] = useState([])
  const [misAportes, setMisAportes] = useState([])
  const [todosProyectos, setTodosProyectos] = useState([])
  const [postulacionesRecibidas, setPostulacionesRecibidas] = useState([])
  const [notificaciones, setNotificaciones] = useState([])
  const [tab, setTab] = useState('especialista')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro'; return }
      setUsuario(user)

      const [pRes, proyRes, postRes] = await Promise.all([
        fetch('/api/usuarios?id=' + user.id),
        fetch('/api/proyectos'),
        fetch('/api/postulaciones?postulante_id=' + user.id)
      ])

      const pData = await pRes.json()
      const proyData = await proyRes.json()
      const postData = await postRes.json()

      const perfilData = pData.usuario
      const todos = proyData.proyectos || []
      const mios = todos.filter(p => p.fundador_id === user.id)
      const postulaciones = postData.postulaciones || []

      setPerfil(perfilData)
      setTodosProyectos(todos)
      setMisProyectos(mios)
      setMisPostulaciones(postulaciones)

      // Notificaciones
      const notifs = []
      postulaciones.forEach(p => {
        if (p.estado === 'aceptada') notifs.push({ tipo: 'aceptado', texto: 'Te aceptaron en el rol de ' + (p.roles?.nombre || 'un rol'), proyecto: p.roles?.proyecto_id, fecha: p.updated_at || p.created_at, color: '#1D9E75', icon: '✅' })
        if (p.estado === 'rechazada') notifs.push({ tipo: 'rechazado', texto: 'No quedaste seleccionado para ' + (p.roles?.nombre || 'un rol'), fecha: p.updated_at || p.created_at, color: '#D85A30', icon: '✗' })
      })

      if (mios.length > 0) {
        const aRes = await fetch('/api/aportes?proyecto_id=' + mios[0].id)
        const aData = await aRes.json()
        setMisAportes((aData.aportes || []).filter(a => a.aportante_id === user.id))

        const rolesRes = await fetch('/api/roles?proyecto_id=' + mios[0].id)
        const rolesData = await rolesRes.json()
        const roles = rolesData.roles || []
        const todasPost = []
        await Promise.all(roles.map(async rol => {
          const r = await fetch('/api/postulaciones?rol_id=' + rol.id)
          const d = await r.json()
          if (d.postulaciones) {
            d.postulaciones.forEach(p => {
              todasPost.push({...p, rol_nombre: rol.nombre})
              if (p.estado === 'pendiente') notifs.push({ tipo: 'nueva_postulacion', texto: (p.perfiles?.nombre || 'Alguien') + ' se postuló al rol de ' + rol.nombre, postulante_id: p.postulante_id, fecha: p.created_at, color: '#E8A020', icon: '📬' })
            })
          }
        }))
        setPostulacionesRecibidas(todasPost)
      }

      setNotificaciones(notifs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)))
      setCargando(false)
    }
    cargar()
  }, [])

  async function cerrarSesion() {
    await supabase.auth.signOut()
    window.location.href = '/registro'
  }

  const esFundador = misProyectos.length > 0
  const totalAportes = misAportes.reduce((s, a) => s + (a.valor || 0), 0)
  const postAceptadas = misPostulaciones.filter(p => p.estado === 'aceptada').length
  const recibidas_pendientes = postulacionesRecibidas.filter(p => p.estado === 'pendiente').length
  const notifs_nuevas = notificaciones.length

  const tabConfig = [
    { id: 'especialista', label: 'Como especialista', icon: '🔧', badge: postAceptadas > 0 ? postAceptadas : null, color: '#AFA9EC' },
    { id: 'fundador', label: 'Como fundador', icon: '⚙️', badge: recibidas_pendientes > 0 ? recibidas_pendientes : null, color: '#E8A020' },
    { id: 'notificaciones', label: 'Notificaciones', icon: '🔔', badge: notifs_nuevas > 0 ? notifs_nuevas : null, color: '#1D9E75' },
  ]

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando...
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Esca<span style={{color:'#1D9E75'}}>la</span></div>
        <div style={{display:'flex',alignItems:'center',gap:'1.25rem'}}>
          <a href="/proyectos" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Proyectos</a>
          <a href="/score" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Mi Score</a>
          <button onClick={cerrarSesion} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.15)',color:'#8FA3CC',padding:'0.3rem 0.75rem',borderRadius:'6px',fontSize:'0.8rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Salir</button>
        </div>
      </nav>

      <main style={{maxWidth:'1000px',margin:'0 auto',padding:'2rem 1.25rem'}}>

        {/* HEADER */}
        <div style={{marginBottom:'2rem'}}>
          <div style={{fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em',marginBottom:'0.4rem'}}>
            Hola, {perfil?.nombre?.split(' ')[0] || 'bienvenido'} 👋
          </div>
          <div style={{fontSize:'0.85rem',color:'#8FA3CC'}}>{perfil?.especialidad || perfil?.rol_principal || 'Miembro de Escala'} · {perfil?.ciudad || ''}</div>
        </div>

        {/* TABS */}
        <div style={{display:'flex',gap:'0',marginBottom:'2rem',background:'rgba(255,255,255,0.04)',borderRadius:'12px',padding:'4px',border:'1px solid rgba(255,255,255,0.08)'}}>
          {tabConfig.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{flex:1,background: tab===t.id ? 'rgba(255,255,255,0.1)' : 'transparent',border:'none',borderRadius:'8px',padding:'0.75rem 0.5rem',cursor:'pointer',fontFamily:'Inter,sans-serif',transition:'all 0.2s',position:'relative'}}>
              <div style={{fontSize:'1rem',marginBottom:'0.2rem'}}>{t.icon}</div>
              <div style={{fontSize:'0.72rem',fontWeight: tab===t.id ? '700' : '400',color: tab===t.id ? '#fff' : '#8FA3CC',lineHeight:'1.3'}}>{t.label}</div>
              {t.badge && (
                <div style={{position:'absolute',top:'6px',right:'calc(50% - 20px)',background:t.color,color:'#fff',fontSize:'0.6rem',fontWeight:'700',padding:'1px 5px',borderRadius:'10px',minWidth:'16px',textAlign:'center'}}>{t.badge}</div>
              )}
            </button>
          ))}
        </div>

        {/* TAB: ESPECIALISTA */}
        {tab === 'especialista' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
              <div style={{background:'rgba(83,74,183,0.08)',border:'1px solid rgba(83,74,183,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#AFA9EC'}}>{misPostulaciones.length}</div>
                <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Postulaciones enviadas</div>
              </div>
              <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#1D9E75'}}>{postAceptadas}</div>
                <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Aceptadas</div>
              </div>
              <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#fff'}}>${totalAportes.toLocaleString()}</div>
                <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Aportes totales</div>
              </div>
              <a href="/score" style={{textDecoration:'none',background:'rgba(175,169,236,0.08)',border:'1px solid rgba(175,169,236,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center',display:'block'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#AFA9EC'}}>{perfil?.escala_score || 0}</div>
                <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Escala Score</div>
              </a>
            </div>

            <div style={{fontSize:'0.8rem',fontWeight:'700',color:'#fff',marginBottom:'1rem',paddingBottom:'0.5rem',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>Mis postulaciones</div>

            {misPostulaciones.length === 0 ? (
              <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'12px',padding:'2.5rem',textAlign:'center'}}>
                <div style={{fontSize:'2rem',marginBottom:'0.75rem'}}>🚀</div>
                <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.4rem'}}>Aún no te has postulado a ningún rol</div>
                <div style={{color:'#8FA3CC',fontSize:'0.82rem',marginBottom:'1.25rem'}}>Explora los proyectos activos y postúlate a los roles que encajan contigo.</div>
                <a href="/proyectos" style={{background:'#AFA9EC',color:'#0D1B3E',padding:'0.65rem 1.5rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.82rem',fontWeight:'800',display:'inline-block'}}>Explorar proyectos →</a>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'0.75rem',marginBottom:'1.5rem'}}>
                {misPostulaciones.map(p => (
                  <div key={p.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'1.1rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'0.75rem'}}>
                    <div>
                      <div style={{fontSize:'0.875rem',fontWeight:'600',color:'#fff',marginBottom:'0.15rem'}}>{p.roles?.nombre || 'Rol'}</div>
                      <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>{new Date(p.created_at).toLocaleDateString('es-CO')}</div>
                    </div>
                    <span style={{fontSize:'0.72rem',fontWeight:'700',padding:'0.25rem 0.75rem',borderRadius:'20px',background:p.estado==='aceptada'?'rgba(29,158,117,0.15)':p.estado==='rechazada'?'rgba(216,90,48,0.1)':'rgba(232,160,32,0.12)',color:p.estado==='aceptada'?'#1D9E75':p.estado==='rechazada'?'#D85A30':'#E8A020'}}>
                      {p.estado==='aceptada'?'✅ Aceptada':p.estado==='rechazada'?'✗ No seleccionado':'⏳ Pendiente'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div style={{fontSize:'0.8rem',fontWeight:'700',color:'#fff',marginBottom:'1rem',paddingBottom:'0.5rem',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>Proyectos disponibles</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'1rem'}}>
              {todosProyectos.map(p => (
                <a key={p.id} href={'/proyectos/'+p.id} style={{textDecoration:'none',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem',display:'block'}} onMouseOver={e=>e.currentTarget.style.borderColor='rgba(29,158,117,0.4)'} onMouseOut={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}>
                  <div style={{fontSize:'0.62rem',fontWeight:'700',color:'#1D9E75',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'0.35rem'}}>Tipo {p.tipo}</div>
                  <div style={{fontSize:'0.9rem',fontWeight:'700',color:'#fff',marginBottom:'0.25rem'}}>{p.nombre}</div>
                  <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginBottom:'0.75rem'}}>{p.sector} · {p.ciudad}</div>
                  <div style={{fontSize:'0.72rem',color:'#1D9E75',fontWeight:'600'}}>Ver roles →</div>
                </a>
              ))}
              <a href="/proyectos" style={{textDecoration:'none',background:'rgba(255,255,255,0.02)',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.25rem',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',minHeight:'110px'}}>
                <div style={{fontSize:'1.5rem',marginBottom:'0.4rem'}}>+</div>
                <div style={{fontSize:'0.75rem',color:'#8FA3CC',fontWeight:'600'}}>Ver todos los proyectos</div>
              </a>
            </div>

            <div style={{display:'flex',gap:'0.75rem',marginTop:'1.5rem',flexWrap:'wrap'}}>
              <a href="/aportes" style={{fontSize:'0.78rem',fontWeight:'600',color:'#1D9E75',background:'rgba(29,158,117,0.1)',padding:'0.5rem 1rem',borderRadius:'8px',textDecoration:'none'}}>📊 Mis aportes</a>
              <a href="/carril" style={{fontSize:'0.78rem',fontWeight:'600',color:'#AFA9EC',background:'rgba(83,74,183,0.1)',padding:'0.5rem 1rem',borderRadius:'8px',textDecoration:'none'}}>🛤️ Mi carril</a>
              <a href="/score" style={{fontSize:'0.78rem',fontWeight:'600',color:'#AFA9EC',background:'rgba(83,74,183,0.1)',padding:'0.5rem 1rem',borderRadius:'8px',textDecoration:'none'}}>⭐ Mi Score</a>
            </div>
          </div>
        )}

        {/* TAB: FUNDADOR */}
        {tab === 'fundador' && (
          <div>
            {!esFundador ? (
              <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(232,160,32,0.2)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
                <div style={{fontSize:'2rem',marginBottom:'0.75rem'}}>⚙️</div>
                <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.4rem'}}>Aún no has publicado ningún proyecto</div>
                <div style={{color:'#8FA3CC',fontSize:'0.82rem',marginBottom:'1.25rem'}}>Cuando publiques un proyecto en Escala, aquí verás las postulaciones que recibes, los hitos, los aportes del equipo y el estado general del proyecto.</div>
                <a href="/proyectos" style={{background:'#E8A020',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.875rem',fontWeight:'700',display:'inline-block'}}>+ Publicar mi primer proyecto</a>
              </div>
            ) : (
              <div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
                  <div style={{background:'rgba(232,160,32,0.08)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                    <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#E8A020'}}>{postulacionesRecibidas.length}</div>
                    <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Postulaciones recibidas</div>
                  </div>
                  <div style={{background:'rgba(216,90,48,0.08)',border:'1px solid rgba(216,90,48,0.15)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                    <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#D85A30'}}>{recibidas_pendientes}</div>
                    <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Pendientes de revisión</div>
                  </div>
                  <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                    <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#1D9E75'}}>{postulacionesRecibidas.filter(p=>p.estado==='aceptada').length}</div>
                    <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Roles cubiertos</div>
                  </div>
                  <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                    <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#fff'}}>{misProyectos.length}</div>
                    <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Mis proyectos</div>
                  </div>
                </div>

                <div style={{fontSize:'0.8rem',fontWeight:'700',color:'#fff',marginBottom:'1rem',paddingBottom:'0.5rem',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>Mis proyectos</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
                  {misProyectos.map(p => (
                    <div key={p.id} style={{background:'rgba(232,160,32,0.06)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'14px',padding:'1.5rem'}}>
                      <div style={{fontSize:'0.65rem',fontWeight:'700',color:'#E8A020',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'0.4rem'}}>Tipo {p.tipo} · {p.estado}</div>
                      <div style={{fontSize:'1rem',fontWeight:'800',color:'#fff',marginBottom:'0.25rem'}}>{p.nombre}</div>
                      <div style={{fontSize:'0.75rem',color:'#8FA3CC',marginBottom:'1rem'}}>{p.sector} · {p.ciudad}</div>
                      <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                        <a href={'/proyectos/'+p.id} style={{fontSize:'0.72rem',fontWeight:'600',color:'#fff',background:'rgba(255,255,255,0.1)',padding:'0.35rem 0.75rem',borderRadius:'6px',textDecoration:'none'}}>Ver proyecto</a>
                        <a href="/hitos" style={{fontSize:'0.72rem',fontWeight:'600',color:'#E8A020',background:'rgba(232,160,32,0.1)',padding:'0.35rem 0.75rem',borderRadius:'6px',textDecoration:'none'}}>Hitos</a>
                        <a href="/ingresos" style={{fontSize:'0.72rem',fontWeight:'600',color:'#1D9E75',background:'rgba(29,158,117,0.1)',padding:'0.35rem 0.75rem',borderRadius:'6px',textDecoration:'none'}}>Ingresos</a>
                        <a href="/aportes" style={{fontSize:'0.72rem',fontWeight:'600',color:'#AFA9EC',background:'rgba(83,74,183,0.1)',padding:'0.35rem 0.75rem',borderRadius:'6px',textDecoration:'none'}}>Aportes</a>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{fontSize:'0.8rem',fontWeight:'700',color:'#fff',marginBottom:'1rem',paddingBottom:'0.5rem',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                  Últimas postulaciones recibidas
                </div>
                {postulacionesRecibidas.length === 0 ? (
                  <div style={{color:'#8FA3CC',fontSize:'0.85rem',textAlign:'center',padding:'2rem'}}>Aún no has recibido postulaciones.</div>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:'0.75rem',marginBottom:'1.5rem'}}>
                    {postulacionesRecibidas.slice(0,5).map(p => (
                      <div key={p.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'1.1rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'0.75rem'}}>
                        <div>
                          <a href={'/perfil/'+p.postulante_id} style={{fontSize:'0.9rem',fontWeight:'700',color:'#1D9E75',textDecoration:'none',display:'block',marginBottom:'0.15rem'}}>{p.perfiles?.nombre || 'Usuario'} →</a>
                          <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>{p.rol_nombre} · {p.perfiles?.ciudad || ''} · {p.perfiles?.especialidad || ''}</div>
                          <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.1rem'}}>{new Date(p.created_at).toLocaleDateString('es-CO')}</div>
                        </div>
                        <span style={{fontSize:'0.72rem',fontWeight:'700',padding:'0.25rem 0.75rem',borderRadius:'20px',background:p.estado==='aceptada'?'rgba(29,158,117,0.15)':p.estado==='rechazada'?'rgba(216,90,48,0.1)':'rgba(232,160,32,0.12)',color:p.estado==='aceptada'?'#1D9E75':p.estado==='rechazada'?'#D85A30':'#E8A020'}}>
                          {p.estado==='aceptada'?'✅ Aceptada':p.estado==='rechazada'?'✗ Rechazada':'⏳ Pendiente'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
                  <a href="/admin" style={{fontSize:'0.78rem',fontWeight:'600',color:'#E8A020',background:'rgba(232,160,32,0.1)',padding:'0.5rem 1rem',borderRadius:'8px',textDecoration:'none'}}>📬 Panel completo de postulaciones</a>
                  <a href="/carril" style={{fontSize:'0.78rem',fontWeight:'600',color:'#AFA9EC',background:'rgba(83,74,183,0.1)',padding:'0.5rem 1rem',borderRadius:'8px',textDecoration:'none'}}>🛤️ Definir carriles</a>
                  <a href="/hitos" style={{fontSize:'0.78rem',fontWeight:'600',color:'#E8A020',background:'rgba(232,160,32,0.1)',padding:'0.5rem 1rem',borderRadius:'8px',textDecoration:'none'}}>🎯 Hitos</a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: NOTIFICACIONES */}
        {tab === 'notificaciones' && (
          <div>
            {notificaciones.length === 0 ? (
              <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
                <div style={{fontSize:'2rem',marginBottom:'0.75rem'}}>🔔</div>
                <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.4rem'}}>Sin notificaciones por ahora</div>
                <div style={{color:'#8FA3CC',fontSize:'0.82rem'}}>Aquí verás cuando te acepten en un rol, cuando alguien se postule a tu proyecto, o cuando haya actividad importante.</div>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                {notificaciones.map((n, i) => (
                  <div key={i} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem',display:'flex',gap:'1rem',alignItems:'flex-start'}}>
                    <div style={{width:'36px',height:'36px',borderRadius:'50%',background:`rgba(${n.color==='#1D9E75'?'29,158,117':n.color==='#E8A020'?'232,160,32':'216,90,48'},0.15)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',flexShrink:0}}>
                      {n.icon}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'0.875rem',color:'#fff',marginBottom:'0.25rem',lineHeight:'1.5'}}>{n.texto}</div>
                      <div style={{fontSize:'0.7rem',color:'#8FA3CC'}}>{new Date(n.fecha).toLocaleDateString('es-CO', {day:'numeric',month:'long',year:'numeric'})}</div>
                      {n.tipo === 'nueva_postulacion' && n.postulante_id && (
                        <a href={'/perfil/'+n.postulante_id} style={{display:'inline-block',marginTop:'0.5rem',fontSize:'0.75rem',color:'#1D9E75',textDecoration:'none',fontWeight:'600'}}>Ver perfil del postulante →</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}
