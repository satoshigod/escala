'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const COLOR_RGB = {
  '#1D9E75': '29,158,117',
  '#E8A020': '232,160,32',
  '#D85A30': '216,90,48',
  '#534AB7': '83,74,183',
  '#8FA3CC': '143,163,204',
}

export default function Dashboard() {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [misProyectos, setMisProyectos] = useState([])
  const [misPostulaciones, setMisPostulaciones] = useState([])
  const [misAportes, setMisAportes] = useState([])
  const [totalIngresos, setTotalIngresos] = useState(0)
  const [todosProyectos, setTodosProyectos] = useState([])
  const [postulacionesRecibidas, setPostulacionesRecibidas] = useState([])
  const [notificaciones, setNotificaciones] = useState([])
  const [vista, setVista] = useState('resumen')
  const [actualizando, setActualizando] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [toastNuevo, setToastNuevo] = useState(null)
  const [conectadoRealtime, setConectadoRealtime] = useState(false)
  const [bandeja, setBandeja] = useState([])
  const [contadores, setContadores] = useState({})
  const [misImpulsos, setMisImpulsos] = useState([])
  const [cargaEquipo, setCargaEquipo] = useState([])
  const [proyectosGestionados, setProyectosGestionados] = useState([])
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0)
  const [pushActivo, setPushActivo] = useState(false)
  const [bannerCorreoVisible, setBannerCorreoVisible] = useState(true)
  const [reenviando, setReenviando] = useState(false)
  const [reenviado, setReenviado] = useState(false)
  const [proyectosFinalizados, setProyectosFinalizados] = useState([])
  const [vistaSugerida, setVistaSugerida] = useState('especialista')

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)

      const res = await fetch('/api/dashboard?user_id=' + user.id)
      const data = await res.json()

      if (data.error) {
        console.error('Error cargando dashboard:', data.error)
        setCargando(false)
        return
      }

      setPerfil(data.perfil)
      setTodosProyectos(data.todosProyectos || [])
      setMisProyectos(data.misProyectos || [])
      setMisPostulaciones(data.misPostulaciones || [])
      setMisAportes(data.misAportes || [])
      setPostulacionesRecibidas(data.postulacionesRecibidas || [])
      setNotificaciones(data.notificaciones || [])
      setBandeja(data.bandeja || [])
      setContadores(data.contadores || {})
      setMisImpulsos(data.misImpulsos || [])
      setCargaEquipo(data.cargaEquipo || [])
      setProyectosGestionados(data.proyectosGestionados || [])
      setMensajesNoLeidos(data.mensajesNoLeidos || 0)

      // Cargar total de ingresos del primer proyecto del fundador
      const primerProyecto = (data.misProyectos || [])[0]
      if (primerProyecto) {
        fetch('/api/ingresos?proyecto_id=' + primerProyecto.id)
          .then(r => r.json())
          .then(d => setTotalIngresos(d.total || 0))
          .catch(() => {})
      }
      setProyectosFinalizados(data.proyectosFinalizados || [])
      setVistaSugerida(data.vistaSugerida || 'especialista')
      setVista(data.vistaSugerida || 'resumen')
      setCargando(false)
    }
    cargar()
  }, [])

  // Realtime — escucha nuevas notificaciones de cualquier tipo (tareas, hitos, aportes,
  // postulaciones, proyectos, etc.) mientras el dashboard está abierto
  useEffect(() => {
    if (!usuario) return

    const canal = supabase
      .channel('notificaciones-realtime-' + usuario.id)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notificaciones', filter: 'destinatario_id=eq.' + usuario.id },
        (payload) => {
          const n = payload.new
          const nuevaNotif = {
            id: n.id,
            tipo: n.tipo,
            texto: n.mensaje,
            postulante_id: n.datos?.postulante_id || null,
            fecha: n.created_at,
            color: n.color || '#8FA3CC',
            icon: n.icon || '🔔',
            link: n.link || null,
            leido: false,
          }

          setNotificaciones(prev => [nuevaNotif, ...prev])
          setToastNuevo(nuevaNotif)
          setTimeout(() => setToastNuevo(null), 6000)
        }
      )
      .subscribe((status) => { setConectadoRealtime(status === 'SUBSCRIBED') })

    return () => { supabase.removeChannel(canal) }
  }, [usuario])

  // Push — revisa si este navegador ya tiene una suscripción activa, para reflejarlo en el botón
  useEffect(() => {
    if (!usuario || typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').then(reg =>
      reg.pushManager.getSubscription().then(sub => setPushActivo(!!sub))
    ).catch(() => {})
  }, [usuario])

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
  }

  async function activarPush() {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      const permiso = await Notification.requestPermission()
      if (permiso !== 'granted') return

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuario.id, subscription: sub.toJSON() })
      })
      setPushActivo(true)
    } catch (e) {
      console.error('Error activando push:', e)
    }
  }

  async function marcarLeida(n) {
    if (n.id && !n.leido) {
      setNotificaciones(prev => prev.map(x => x.id === n.id ? { ...x, leido: true } : x))
      fetch('/api/notificaciones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: n.id })
      }).catch(() => {})
    }
    if (n.link) window.location.href = n.link
  }

  async function marcarTodasLeidas() {
    setNotificaciones(prev => prev.map(x => ({ ...x, leido: true })))
    await fetch('/api/notificaciones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: usuario.id, marcar_todas: true })
    }).catch(() => {})
  }

  async function reenviarVerificacion() {
    if (!perfil) return
    setReenviando(true)
    await fetch('/api/verificar-correo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: perfil.id, email: perfil.email, nombre: perfil.nombre })
    }).catch(() => {})
    setReenviando(false)
    setReenviado(true)
    setTimeout(() => setReenviado(false), 5000)
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    window.location.href = '/registro?modo=login'
  }

  async function cambiarEstado(id, estado) {
    setActualizando(id)
    await fetch('/api/postulaciones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, estado })
    })
    setPostulacionesRecibidas(prev => prev.map(p => p.id === id ? {...p, estado} : p))
    setActualizando(null)
  }

  const esFundador = misProyectos.length > 0
  const totalAportes = misAportes.reduce((s, a) => s + (a.valor || 0), 0)
  const postAceptadas = misPostulaciones.filter(p => p.estado === 'aceptada').length
  const recibidasPendientes = postulacionesRecibidas.filter(p => p.estado === 'pendiente').length

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando...
    </div>
  )

  const acciones = [
    { icon: '🚀', label: 'Crear proyecto', href: '/proyectos' },
    { icon: '🔍', label: 'Buscar especialista', href: '/directorio' },
    { icon: '💰', label: 'Registrar aporte', href: '/aportes' },
    { icon: '📈', label: 'Registrar ingreso', href: '/ingresos' },
    { icon: '🎯', label: 'Crear hito', href: '/hitos' },
    { icon: '✉️', label: 'Invitar especialista', href: '/invitar' },
    { icon: '🌟', label: 'Ángel de Impulso', href: '/angel' },
    ...(perfil?.es_admin ? [{ icon: '🛠️', label: 'Admin Escala', href: '/admin-escala' }] : []),
  ]

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      {toastNuevo && (
        <div onClick={() => { setVista('notificaciones'); setToastNuevo(null) }} style={{
          position:'fixed', top:'20px', right:'20px', zIndex:1000,
          background:'#15234a', border:'1px solid rgba(232,160,32,0.4)', borderRadius:'12px',
          padding:'1rem 1.25rem', maxWidth:'340px', boxShadow:'0 8px 30px rgba(0,0,0,0.4)',
          cursor:'pointer', display:'flex', gap:'0.75rem', alignItems:'flex-start',
          animation:'slideIn 0.3s ease-out'
        }}>
          <div style={{fontSize:'1.4rem',flexShrink:0}}>{toastNuevo.icon}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:'0.68rem',fontWeight:'700',color:'#E8A020',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:'0.25rem'}}>Nueva notificación</div>
            <div style={{fontSize:'0.82rem',color:'#fff',lineHeight:'1.4'}}>{toastNuevo.texto}</div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setToastNuevo(null) }} style={{background:'none',border:'none',color:'#8FA3CC',cursor:'pointer',fontSize:'1rem',flexShrink:0,padding:0}}>✕</button>
        </div>
      )}
      <style>{`@keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

      {/* ZONA 1 — HEADER: identidad, switcher de vista, perfil */}
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'1.5rem'}}>
          <a href="/dashboard" style={{textDecoration:'none'}}><div style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Esca<span style={{color:'#1D9E75'}}>la</span></div></a>
          {conectadoRealtime && (
            <div title="Notificaciones en tiempo real activas" style={{width:'7px',height:'7px',borderRadius:'50%',background:'#1D9E75',boxShadow:'0 0 6px rgba(29,158,117,0.6)'}}></div>
          )}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'1.25rem'}}>
          <a href="/proyectos" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Proyectos</a>
          <a href="/score" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Mi Score</a>
          <button onClick={() => setVista(vista==='notificaciones'?'resumen':'notificaciones')} style={{background:'transparent',border:'none',color:'#8FA3CC',cursor:'pointer',fontSize:'1.05rem',position:'relative',padding:0}}>
            🔔
            {(notificaciones.filter(n=>!n.leido).length + mensajesNoLeidos) > 0 && <span style={{position:'absolute',top:'-4px',right:'-6px',background:'#1D9E75',color:'#fff',fontSize:'0.6rem',fontWeight:'700',padding:'1px 4px',borderRadius:'8px',minWidth:'14px',textAlign:'center'}}>{notificaciones.filter(n=>!n.leido).length + mensajesNoLeidos}</span>}
          </button>
          <button onClick={cerrarSesion} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.15)',color:'#8FA3CC',padding:'0.3rem 0.75rem',borderRadius:'6px',fontSize:'0.8rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Salir</button>
        </div>
      </nav>

      <main style={{maxWidth:'1180px',margin:'0 auto',padding:'1.75rem 1.25rem'}}>

        {perfil && perfil.correo_verificado === false && bannerCorreoVisible && (
          <div style={{background:'rgba(232,160,32,0.08)',border:'1px solid rgba(232,160,32,0.25)',borderRadius:'10px',padding:'0.875rem 1.25rem',marginBottom:'1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.75rem'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
              <span style={{fontSize:'1.1rem',flexShrink:0}}>✉️</span>
              <div>
                <div style={{color:'#fff',fontSize:'0.82rem',fontWeight:'700'}}>Confirma tu correo</div>
                <div style={{color:'#C8D4E8',fontSize:'0.76rem'}}>Te enviamos un enlace a {perfil.email}. Revisa spam si no lo ves.</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
              <button onClick={reenviarVerificacion} disabled={reenviando} style={{background:'rgba(232,160,32,0.15)',border:'1px solid rgba(232,160,32,0.4)',color:'#E8A020',fontSize:'0.76rem',fontWeight:'600',padding:'0.35rem 0.75rem',borderRadius:'6px',cursor: reenviando ? 'default' : 'pointer',fontFamily:'Inter,sans-serif'}}>
                {reenviando ? 'Enviando...' : reenviado ? '✓ Enviado' : 'Reenviar'}
              </button>
              <button onClick={() => setBannerCorreoVisible(false)} title="Ocultar por ahora" style={{background:'none',border:'none',color:'#8FA3CC',cursor:'pointer',fontSize:'0.9rem',padding:0}}>✕</button>
            </div>
          </div>
        )}

        <div style={{marginBottom:'1.5rem'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.75rem'}}>
            <div>
              <div style={{fontSize:'clamp(1.3rem,3vw,1.8rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em',marginBottom:'0.25rem'}}>
                Hola, {perfil?.nombre?.split(' ')[0] || 'bienvenido'} 👋
              </div>
              <div style={{fontSize:'0.82rem',color:'#8FA3CC'}}>{perfil?.especialidad || perfil?.rol_principal || 'Miembro de Escala'} · {perfil?.ciudad || ''}</div>
            </div>
            {(vistaSugerida === 'gerente' || vistaSugerida === 'angel' || vistaSugerida === 'mentor' || vistaSugerida === 'empresa') && (
              <div style={{display:'flex',gap:'0.3rem',background:'rgba(255,255,255,0.04)',borderRadius:'9px',padding:'3px',border:'1px solid rgba(255,255,255,0.08)'}}>
                {[
                  { id: vistaSugerida, label: vistaSugerida === 'gerente' ? '👥 Gerente' : vistaSugerida === 'angel' ? '🌟 Ángel' : vistaSugerida === 'mentor' ? '🧭 Mentor' : '🏢 Empresa' },
                  { id: 'resumen', label: '📋 General' },
                ].map(v => (
                  <button key={v.id} onClick={() => setVista(v.id)} style={{background: vista===v.id ? 'rgba(255,255,255,0.1)' : 'transparent',border:'none',borderRadius:'7px',padding:'0.45rem 0.875rem',cursor:'pointer',fontFamily:'Inter,sans-serif',fontSize:'0.76rem',fontWeight: vista===v.id?'700':'400',color: vista===v.id?'#fff':'#8FA3CC'}}>
                    {v.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>


        {vista === 'notificaciones' ? (
          <div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem',flexWrap:'wrap',gap:'0.5rem'}}>
              <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff'}}>Notificaciones</div>
              <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                {!pushActivo && (
                  <button onClick={activarPush} style={{background:'none',border:'1px solid rgba(29,158,117,0.35)',color:'#1D9E75',fontSize:'0.74rem',cursor:'pointer',padding:'0.3rem 0.7rem',borderRadius:'6px',fontFamily:'Inter,sans-serif'}}>🔔 Activar notificaciones push</button>
                )}
                {notificaciones.some(n=>!n.leido) && (
                  <button onClick={marcarTodasLeidas} style={{background:'none',border:'none',color:'#8FA3CC',fontSize:'0.78rem',cursor:'pointer'}}>Marcar todas como leídas</button>
                )}
                <button onClick={() => setVista('resumen')} style={{background:'none',border:'none',color:'#8FA3CC',fontSize:'0.78rem',cursor:'pointer'}}>← Volver al resumen</button>
              </div>
            </div>
            {notificaciones.length === 0 ? (
              <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
                <div style={{fontSize:'2rem',marginBottom:'0.75rem'}}>🔔</div>
                <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.4rem'}}>Sin notificaciones por ahora</div>
                <div style={{color:'#8FA3CC',fontSize:'0.82rem'}}>Aquí verás cuando te acepten en un rol, cuando alguien se postule a tu proyecto, o cuando haya actividad importante.</div>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                {notificaciones.map((n, i) => (
                  <div key={n.id || i} onClick={() => marcarLeida(n)} style={{background: n.leido===false ? 'rgba(29,158,117,0.05)' : 'rgba(255,255,255,0.04)',border: n.leido===false ? '1px solid rgba(29,158,117,0.25)' : '1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem',display:'flex',gap:'1rem',alignItems:'flex-start',cursor: (n.id || n.link) ? 'pointer' : 'default'}}>
                    <div style={{width:'36px',height:'36px',borderRadius:'50%',background:`rgba(${COLOR_RGB[n.color] || '143,163,204'},0.15)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',flexShrink:0}}>
                      {n.icon}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'0.875rem',color:'#fff',marginBottom:'0.25rem',lineHeight:'1.5'}}>{n.texto}</div>
                      <div style={{fontSize:'0.7rem',color:'#8FA3CC'}}>{new Date(n.fecha).toLocaleDateString('es-CO', {day:'numeric',month:'long',year:'numeric'})}</div>
                      {n.tipo === 'nueva_postulacion' && n.postulante_id ? (
                        <a href={'/perfil/'+n.postulante_id} onClick={(e)=>e.stopPropagation()} style={{display:'inline-block',marginTop:'0.5rem',fontSize:'0.75rem',color:'#1D9E75',textDecoration:'none',fontWeight:'600'}}>Ver perfil del postulante →</a>
                      ) : n.link ? (
                        <span style={{display:'inline-block',marginTop:'0.5rem',fontSize:'0.75rem',color:'#1D9E75',fontWeight:'600'}}>Ver →</span>
                      ) : null}
                    </div>
                    {n.leido===false && <div title="Sin leer" style={{width:'8px',height:'8px',borderRadius:'50%',background:'#1D9E75',flexShrink:0,marginTop:'0.3rem'}}></div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : vista === 'gerente' ? (
          <div>
            <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',marginBottom:'1.25rem'}}>Vista de Gerente de Proyecto</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'0.875rem',marginBottom:'1.75rem'}}>
              <div style={{background:'rgba(83,74,183,0.08)',border:'1px solid rgba(83,74,183,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#AFA9EC'}}>{cargaEquipo.length}</div>
                <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Personas en el equipo</div>
              </div>
              <div style={{background:'rgba(232,160,32,0.08)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#E8A020'}}>{cargaEquipo.reduce((s,p)=>s+p.pendientes,0)}</div>
                <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Tareas pendientes del equipo</div>
              </div>
              <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#1D9E75'}}>{cargaEquipo.reduce((s,p)=>s+p.completadas,0)}</div>
                <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Tareas completadas</div>
              </div>
            </div>

            <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'0.875rem'}}>Carga de trabajo por persona</div>
            {cargaEquipo.length === 0 ? (
              <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'12px',padding:'2rem',textAlign:'center',color:'#8FA3CC',fontSize:'0.82rem'}}>
                Sin tareas asignadas en tu equipo todavía.
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'0.5rem',marginBottom:'1.75rem'}}>
                {cargaEquipo.map((p,i) => (
                  <div key={i} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'1rem 1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'0.75rem'}}>
                    <div>
                      <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#fff'}}>{p.nombre}</div>
                      <div style={{fontSize:'0.7rem',color:'#8FA3CC'}}>{p.proyecto}</div>
                    </div>
                    <div style={{display:'flex',gap:'0.75rem'}}>
                      <div style={{textAlign:'center'}}>
                        <div style={{fontFamily:'monospace',fontSize:'1rem',fontWeight:'700',color: p.pendientes > 3 ? '#D85A30' : '#E8A020'}}>{p.pendientes}</div>
                        <div style={{fontSize:'0.62rem',color:'#8FA3CC'}}>pendientes</div>
                      </div>
                      <div style={{textAlign:'center'}}>
                        <div style={{fontFamily:'monospace',fontSize:'1rem',fontWeight:'700',color:'#1D9E75'}}>{p.completadas}</div>
                        <div style={{fontSize:'0.62rem',color:'#8FA3CC'}}>completadas</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'0.875rem'}}>Tus proyectos gestionados</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'0.875rem'}}>
              {proyectosGestionados.map(p => (
                <a key={p.id} href={'/proyectos/'+p.id+'/workspace'} style={{textDecoration:'none',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.1rem',display:'block'}}>
                  <div style={{fontSize:'0.9rem',fontWeight:'800',color:'#fff',marginBottom:'0.2rem'}}>{p.nombre}</div>
                  <div style={{fontSize:'0.72rem',color:'#1D9E75',fontWeight:'600'}}>Ir al workspace →</div>
                </a>
              ))}
            </div>
          </div>
        ) : vista === 'mentor' ? (
          <div>
            <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',marginBottom:'1.25rem'}}>Vista de Mentor</div>
            <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'1.5rem',marginBottom:'1.5rem'}}>
              <div style={{fontSize:'0.82rem',color:'#C8D4E8',lineHeight:'1.7',marginBottom:'1rem'}}>
                Como Mentor en Escala, compartes experiencia estratégica — comercial, financiera, tecnológica o de red — sin ejecutar tareas operativas. Tu rol es orientar al fundador en decisiones clave.
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
                <a href="/buscar" style={{textDecoration:'none',background:'rgba(175,169,236,0.08)',border:'1px solid rgba(175,169,236,0.2)',borderRadius:'10px',padding:'1rem',display:'block'}}>
                  <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#AFA9EC',marginBottom:'0.25rem'}}>Explorar proyectos</div>
                  <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>Encuentra fundadores que necesiten tu experiencia</div>
                </a>
                <a href="/directorio" style={{textDecoration:'none',background:'rgba(175,169,236,0.08)',border:'1px solid rgba(175,169,236,0.2)',borderRadius:'10px',padding:'1rem',display:'block'}}>
                  <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#AFA9EC',marginBottom:'0.25rem'}}>Red de Escala</div>
                  <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>Conoce a los especialistas y fundadores activos</div>
                </a>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'0.875rem',marginBottom:'1.5rem'}}>
              <div style={{background:'rgba(83,74,183,0.08)',border:'1px solid rgba(83,74,183,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#AFA9EC'}}>{misPostulaciones.length}</div>
                <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Proyectos que acompañas</div>
              </div>
              <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#1D9E75'}}>{perfil?.escala_score || 0}</div>
                <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Escala Score</div>
              </div>
            </div>
            {bandeja.length > 0 && (
              <div>
                <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'0.75rem'}}>Pendientes</div>
                <div style={{display:'flex',flexDirection:'column',gap:'0.4rem'}}>
                  {bandeja.slice(0,4).map((item,i) => (
                    <a key={i} href={item.href} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'0.75rem',background:'rgba(83,74,183,0.06)',border:'1px solid rgba(83,74,183,0.2)',borderRadius:'9px',padding:'0.7rem 1rem',textDecoration:'none'}}>
                      <div style={{fontSize:'0.8rem',color:'#fff'}}>{item.texto}</div>
                      <div style={{fontSize:'0.72rem',color:'#AFA9EC',flexShrink:0}}>→</div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : vista === 'empresa' ? (
          <div>
            <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',marginBottom:'1.25rem'}}>Vista de Empresa</div>
            <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'1.5rem',marginBottom:'1.5rem'}}>
              <div style={{fontSize:'0.82rem',color:'#C8D4E8',lineHeight:'1.7',marginBottom:'1rem'}}>
                Como Empresa en Escala puedes actuar en múltiples roles: fundar proyectos, ejecutar servicios, financiar hitos como Ángel de Impulso, o aportar mentoría estratégica.
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'0.6rem'}}>
                {[
                  { icon:'🚀', label:'Fundar proyecto', href:'/proyectos' },
                  { icon:'🔧', label:'Ser ejecutora', href:'/buscar' },
                  { icon:'🌟', label:'Financiar hito', href:'/buscar' },
                  { icon:'🧭', label:'Ser mentora', href:'/directorio' },
                ].map((a,i) => (
                  <a key={i} href={a.href} style={{textDecoration:'none',background:'rgba(232,160,32,0.06)',border:'1px solid rgba(232,160,32,0.15)',borderRadius:'10px',padding:'0.875rem',display:'block',textAlign:'center'}}>
                    <div style={{fontSize:'1.3rem',marginBottom:'0.35rem'}}>{a.icon}</div>
                    <div style={{fontSize:'0.74rem',fontWeight:'600',color:'#E8A020'}}>{a.label}</div>
                  </a>
                ))}
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'0.875rem'}}>
              <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#fff'}}>{misProyectos.length}</div>
                <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Proyectos fundados</div>
              </div>
              <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#1D9E75'}}>{misPostulaciones.filter(p=>p.estado==='aceptada').length}</div>
                <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Roles activos</div>
              </div>
              <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#fff'}}>${totalAportes.toLocaleString()}</div>
                <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Aportes totales</div>
              </div>
            </div>
          </div>
        ) : vista === 'angel' ? (
          <div>
            <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',marginBottom:'1.25rem'}}>Vista de Ángel de Impulso</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'0.875rem',marginBottom:'1.75rem'}}>
              <div style={{background:'rgba(175,169,236,0.08)',border:'1px solid rgba(175,169,236,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#AFA9EC'}}>{misImpulsos.length}</div>
                <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Hitos financiados</div>
              </div>
              <div style={{background:'rgba(232,160,32,0.08)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#E8A020'}}>{misImpulsos.filter(i=>!i.hitos?.completado).length}</div>
                <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Hitos pendientes</div>
              </div>
              <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#1D9E75'}}>${misImpulsos.reduce((s,i)=>s+(i.monto||0),0).toLocaleString()}</div>
                <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Total invertido</div>
              </div>
            </div>

            <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'0.875rem'}}>Tus impulsos</div>
            {misImpulsos.length === 0 ? (
              <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(175,169,236,0.2)',borderRadius:'12px',padding:'2.5rem',textAlign:'center'}}>
                <div style={{fontSize:'2rem',marginBottom:'0.75rem'}}>🌟</div>
                <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.4rem'}}>Aún no has financiado ningún hito</div>
                <div style={{color:'#8FA3CC',fontSize:'0.82rem',marginBottom:'1.25rem'}}>Explora proyectos y financia hitos puntuales sin invertir en toda la empresa.</div>
                <a href="/buscar" style={{background:'#AFA9EC',color:'#0D1B3E',padding:'0.65rem 1.5rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.82rem',fontWeight:'800',display:'inline-block'}}>Explorar proyectos →</a>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'0.6rem'}}>
                {misImpulsos.map(i => (
                  <div key={i.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'1.1rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'0.75rem'}}>
                    <div>
                      <div style={{fontSize:'0.62rem',fontWeight:'700',color:'#AFA9EC',letterSpacing:'0.05em',textTransform:'uppercase',marginBottom:'0.25rem'}}>{i.proyectos?.nombre || 'Proyecto'}</div>
                      <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#fff'}}>{i.hitos?.nombre || i.descripcion || 'Hito'}</div>
                      <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.15rem'}}>${(i.monto||0).toLocaleString()}</div>
                    </div>
                    <span style={{fontSize:'0.7rem',fontWeight:'700',padding:'0.25rem 0.75rem',borderRadius:'20px',background: i.hitos?.completado ? 'rgba(29,158,117,0.15)' : 'rgba(232,160,32,0.12)',color: i.hitos?.completado ? '#1D9E75' : '#E8A020'}}>
                      {i.hitos?.completado ? '✅ Completado' : '⏳ En progreso'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
        <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:'1.5rem',alignItems:'start'}}>

          {/* COLUMNA PRINCIPAL */}
          <div>
            {/* ZONA 2 — BANDEJA DE TRABAJO + ACCIONES RÁPIDAS, lado a lado */}
            <div style={{display:'grid',gridTemplateColumns:'1.6fr 1fr',gap:'1rem',marginBottom:'1.75rem',alignItems:'start'}}>
              <div>
                <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'0.75rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                  <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#AFA9EC',display:'inline-block'}}></span>
                  Bandeja de trabajo
                  {bandeja.length > 0 && <span style={{fontSize:'0.65rem',fontWeight:'600',color:'#AFA9EC',background:'rgba(83,74,183,0.15)',padding:'0.1rem 0.45rem',borderRadius:'10px'}}>{bandeja.length}</span>}
                </div>
                {bandeja.length === 0 ? (
                  <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'10px',padding:'1.5rem',textAlign:'center',fontSize:'0.78rem',color:'#8FA3CC'}}>
                    Nada pendiente por ahora — vas al día.
                  </div>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:'0.4rem'}}>
                    {bandeja.slice(0,5).map((item,i) => (
                      <a key={i} href={item.href} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'0.75rem',background:'rgba(83,74,183,0.06)',border:'1px solid rgba(83,74,183,0.2)',borderRadius:'9px',padding:'0.7rem 1rem',textDecoration:'none'}}>
                        <div style={{fontSize:'0.8rem',color:'#fff',lineHeight:'1.35'}}>{item.texto}</div>
                        <div style={{fontSize:'0.72rem',color:'#AFA9EC',flexShrink:0}}>→</div>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'0.75rem'}}>Acciones rápidas</div>
                <div style={{display:'flex',flexDirection:'column',gap:'0.4rem'}}>
                  {acciones.slice(0,8).map((a,i) => (
                    <a key={i} href={a.href} style={{display:'flex',alignItems:'center',gap:'0.5rem',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'9px',padding:'0.6rem 0.875rem',textDecoration:'none',fontSize:'0.78rem',color:'#fff'}}>
                      <span>{a.icon}</span>{a.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* ZONA 3 — MIS PROYECTOS como tarjetas accionables */}
            <div style={{marginBottom:'1.75rem'}}>
              <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'0.875rem'}}>Mis proyectos</div>
              {misProyectos.length === 0 ? (
                <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(232,160,32,0.2)',borderRadius:'12px',padding:'2rem',textAlign:'center'}}>
                  <div style={{fontSize:'1.5rem',marginBottom:'0.5rem'}}>⚙️</div>
                  <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.3rem',fontSize:'0.9rem'}}>Aún no has publicado ningún proyecto</div>
                  <div style={{color:'#8FA3CC',fontSize:'0.78rem',marginBottom:'1rem'}}>Publica tu primer proyecto y arma equipo sin necesidad de capital.</div>
                  <a href="/proyectos" style={{background:'#E8A020',color:'#fff',padding:'0.6rem 1.25rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.8rem',fontWeight:'700',display:'inline-block'}}>+ Publicar mi primer proyecto</a>
                </div>
              ) : (
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'0.875rem'}}>
                  {misProyectos.map(p => {
                    const tareasDelProyecto = bandeja.filter(b => b.href?.includes(p.id) && b.tipo === 'tarea_pendiente').length
                    return (
                      <div key={p.id} style={{background:'rgba(232,160,32,0.06)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'12px',padding:'1.1rem'}}>
                        <div style={{fontSize:'0.62rem',fontWeight:'700',color:'#E8A020',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.3rem'}}>Tipo {p.tipo} · {p.estado}</div>
                        <div style={{fontSize:'0.92rem',fontWeight:'800',color:'#fff',marginBottom:'0.2rem'}}>{p.nombre}</div>
                        <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginBottom:'0.75rem'}}>{p.sector} · {p.ciudad}</div>
                        {tareasDelProyecto > 0 && (
                          <div style={{fontSize:'0.7rem',color:'#AFA9EC',marginBottom:'0.75rem'}}>⚠ {tareasDelProyecto} tarea{tareasDelProyecto!==1?'s':''} pendiente{tareasDelProyecto!==1?'s':''}</div>
                        )}
                        <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                          <a href={'/proyectos/'+p.id+'/workspace'} style={{fontSize:'0.7rem',fontWeight:'700',color:'#fff',background:'#1D9E75',padding:'0.3rem 0.7rem',borderRadius:'6px',textDecoration:'none'}}>Workspace</a>
                          <a href="/hitos" style={{fontSize:'0.7rem',fontWeight:'600',color:'#E8A020',background:'rgba(232,160,32,0.1)',padding:'0.3rem 0.6rem',borderRadius:'6px',textDecoration:'none'}}>Hitos</a>
                          <a href="/aportes" style={{fontSize:'0.7rem',fontWeight:'600',color:'#AFA9EC',background:'rgba(83,74,183,0.1)',padding:'0.3rem 0.6rem',borderRadius:'6px',textDecoration:'none'}}>Aportes</a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Postulaciones recibidas (solo si es fundador) */}
            {esFundador && postulacionesRecibidas.length > 0 && (
              <div style={{marginBottom:'1.75rem'}}>
                <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'0.875rem'}}>Últimas postulaciones recibidas</div>
                <div style={{display:'flex',flexDirection:'column',gap:'0.6rem'}}>
                  {postulacionesRecibidas.slice(0,4).map(p => (
                    <div key={p.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'1rem'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'0.6rem',marginBottom: p.estado==='pendiente' ? '0.6rem' : 0}}>
                        <div>
                          <div style={{fontSize:'0.62rem',fontWeight:'700',color:'#E8A020',letterSpacing:'0.05em',textTransform:'uppercase',marginBottom:'0.25rem'}}>{p.proyecto_nombre} · {p.rol_nombre}</div>
                          <a href={'/perfil/'+p.postulante_id} style={{fontSize:'0.85rem',fontWeight:'700',color:'#1D9E75',textDecoration:'none',display:'block'}}>{p.perfiles?.nombre || 'Usuario'} →</a>
                        </div>
                        <span style={{fontSize:'0.68rem',fontWeight:'700',padding:'0.2rem 0.65rem',borderRadius:'20px',background:p.estado==='aceptada'?'rgba(29,158,117,0.15)':p.estado==='rechazada'?'rgba(216,90,48,0.1)':'rgba(232,160,32,0.12)',color:p.estado==='aceptada'?'#1D9E75':p.estado==='rechazada'?'#D85A30':'#E8A020'}}>
                          {p.estado==='aceptada'?'✅ Aceptada':p.estado==='rechazada'?'✗ Rechazada':'⏳ Pendiente'}
                        </span>
                      </div>
                      {p.estado === 'pendiente' && (
                        <div style={{display:'flex',gap:'0.4rem'}}>
                          <button onClick={() => cambiarEstado(p.id,'aceptada')} disabled={actualizando===p.id} style={{background:'rgba(29,158,117,0.15)',color:'#1D9E75',border:'1px solid rgba(29,158,117,0.3)',borderRadius:'6px',padding:'0.35rem 0.875rem',fontSize:'0.74rem',fontWeight:'600',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                            {actualizando===p.id ? '...' : '✅ Aceptar'}
                          </button>
                          <button onClick={() => cambiarEstado(p.id,'rechazada')} disabled={actualizando===p.id} style={{background:'rgba(216,90,48,0.08)',color:'#D85A30',border:'1px solid rgba(216,90,48,0.25)',borderRadius:'6px',padding:'0.35rem 0.875rem',fontSize:'0.74rem',fontWeight:'600',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <a href="/admin" style={{display:'inline-block',marginTop:'0.6rem',fontSize:'0.74rem',color:'#E8A020',fontWeight:'600',textDecoration:'none'}}>Ver panel completo →</a>
              </div>
            )}

            {/* Proyectos disponibles para postularse */}
            <div>
              <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'0.875rem'}}>Proyectos disponibles</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'0.75rem'}}>
                {todosProyectos.filter(p => p.fundador_id !== usuario?.id).slice(0,3).map(p => (
                  <a key={p.id} href={'/proyectos/'+p.id} style={{textDecoration:'none',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'1rem',display:'block'}}>
                    <div style={{fontSize:'0.6rem',fontWeight:'700',color:'#1D9E75',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.3rem'}}>Tipo {p.tipo}</div>
                    <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>{p.nombre}</div>
                    <div style={{fontSize:'0.7rem',color:'#8FA3CC'}}>{p.sector} · {p.ciudad}</div>
                  </a>
                ))}
                <a href="/buscar" style={{textDecoration:'none',background:'rgba(255,255,255,0.02)',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'10px',padding:'1rem',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',minHeight:'90px'}}>
                  <div style={{fontSize:'1.25rem',marginBottom:'0.3rem'}}>+</div>
                  <div style={{fontSize:'0.72rem',color:'#8FA3CC',fontWeight:'600'}}>Ver todos</div>
                </a>
              </div>
            </div>
          </div>

          {/* ZONA 4 — SIDEBAR: indicadores compactos */}
          <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
            <a href="/postulaciones" style={{textDecoration:'none',background:'rgba(83,74,183,0.08)',border:'1px solid rgba(83,74,183,0.2)',borderRadius:'12px',padding:'1rem',display:'block'}}>
              <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#AFA9EC'}}>{misPostulaciones.length}</div>
              <div style={{fontSize:'0.68rem',color:'#8FA3CC',marginTop:'0.15rem'}}>Postulaciones enviadas →</div>
            </a>
            <a href="/postulaciones" style={{textDecoration:'none',background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1rem',display:'block'}}>
              <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#1D9E75'}}>{postAceptadas}</div>
              <div style={{fontSize:'0.68rem',color:'#8FA3CC',marginTop:'0.15rem'}}>Roles aceptados →</div>
            </a>
            <a href="/aportes" style={{textDecoration:'none',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1rem',display:'block'}}>
              <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#fff'}}>${totalAportes.toLocaleString()}</div>
              <div style={{fontSize:'0.68rem',color:'#8FA3CC',marginTop:'0.15rem'}}>Aportes totales →</div>
            </a>
            <a href="/score" style={{textDecoration:'none',background:'rgba(175,169,236,0.08)',border:'1px solid rgba(175,169,236,0.2)',borderRadius:'12px',padding:'1rem',display:'block'}}>
              <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#AFA9EC'}}>{perfil?.escala_score || 0}</div>
              <div style={{fontSize:'0.68rem',color:'#8FA3CC',marginTop:'0.15rem'}}>Escala Score →</div>
            </a>
            {esFundador && (
              <a href="/admin" style={{textDecoration:'none',background:'rgba(232,160,32,0.08)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'12px',padding:'1rem',display:'block'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#E8A020'}}>{recibidasPendientes}</div>
                <div style={{fontSize:'0.68rem',color:'#8FA3CC',marginTop:'0.15rem'}}>Postulaciones por revisar →</div>
              </a>
            )}
            {esFundador && (
              <a href="/ingresos" style={{textDecoration:'none',background:'rgba(29,158,117,0.05)',border:'1px solid rgba(29,158,117,0.15)',borderRadius:'12px',padding:'1rem',display:'block'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#1D9E75'}}>${totalIngresos.toLocaleString()}</div>
                <div style={{fontSize:'0.68rem',color:'#8FA3CC',marginTop:'0.15rem'}}>Ingresos del proyecto →</div>
              </a>
            )}
            {mensajesNoLeidos > 0 && (
              <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1rem',cursor:'pointer'}} onClick={() => misProyectos.length > 0 && (window.location.href='/proyectos/'+misProyectos[0].id+'/workspace/chat')}>
                <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#1D9E75'}}>{mensajesNoLeidos}</div>
                <div style={{fontSize:'0.68rem',color:'#8FA3CC',marginTop:'0.15rem'}}>Mensajes sin leer →</div>
              </div>
            )}
            {proyectosFinalizados.length > 0 && (
              <a href="/proyectos" style={{textDecoration:'none',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1rem',display:'block'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#fff'}}>{proyectosFinalizados.length}</div>
                <div style={{fontSize:'0.68rem',color:'#8FA3CC',marginTop:'0.15rem'}}>Proyectos finalizados →</div>
              </a>
            )}

            <div style={{borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:'0.875rem',marginTop:'0.25rem'}}>
              <div style={{fontSize:'0.7rem',fontWeight:'700',color:'#fff',marginBottom:'0.6rem'}}>Más accesos</div>
              <div style={{display:'flex',flexDirection:'column',gap:'0.3rem'}}>
                <a href="/perfil/editar" style={{fontSize:'0.74rem',color:'#8FA3CC',textDecoration:'none',padding:'0.3rem 0'}}>✏️ Editar mi perfil</a>
                <a href="/calendario" style={{fontSize:'0.74rem',color:'#8FA3CC',textDecoration:'none',padding:'0.3rem 0'}}>📅 Calendario</a>
                <a href="/metricas" style={{fontSize:'0.74rem',color:'#8FA3CC',textDecoration:'none',padding:'0.3rem 0'}}>📊 Métricas</a>
                <a href="/carril" style={{fontSize:'0.74rem',color:'#8FA3CC',textDecoration:'none',padding:'0.3rem 0'}}>🛤️ Cumplimiento y pago</a>
                <a href="/postulaciones" style={{fontSize:'0.74rem',color:'#8FA3CC',textDecoration:'none',padding:'0.3rem 0'}}>📋 Postulaciones</a>
                {misProyectos.length > 0 && <a href={'/p/'+misProyectos[0].id} target="_blank" style={{fontSize:'0.74rem',color:'#8FA3CC',textDecoration:'none',padding:'0.3rem 0'}}>🔗 Link público</a>}
              </div>
            </div>
          </div>

        </div>
        )}
      </main>
    </div>
  )
}
