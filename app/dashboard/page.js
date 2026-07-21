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

function WalletWidgetSidebar() {
  const [activo, setActivo] = useState(true)
  const [walletData, setWalletData] = useState(null)
  const [moneda, setMoneda] = useState('COP')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      fetch('/api/wallet', { headers: { 'Authorization': `Bearer ${session.access_token}` } })
        .then(r => r.json())
        .then(d => {
          if (d.error || !d.wallets?.length) { setActivo(false); return }
          const w = d.wallets[0]
          setMoneda(w.moneda)
          setWalletData(w)
        })
        .catch(() => setActivo(false))
    })
  }, [])

  if (!activo) return null

  const fmt = (v) => parseFloat(v || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })

  return (
    <div style={{background:'rgba(29,158,117,0.05)',border:'1px solid rgba(29,158,117,0.15)',borderRadius:'12px',padding:'0.875rem'}}>
      <div style={{fontSize:'0.65rem',fontWeight:'700',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.625rem'}}>Wallet</div>
      {walletData ? (
        <>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0',marginBottom:'0.75rem',background:'rgba(255,255,255,0.04)',borderRadius:'8px',overflow:'hidden',border:'1px solid rgba(255,255,255,0.06)'}}>
            <div style={{padding:'0.5rem 0.625rem',textAlign:'center'}}>
              <div style={{fontSize:'0.62rem',color:'#6B7280',marginBottom:'2px'}}>Disponible</div>
              <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#1D9E75',fontFamily:'monospace'}}>{fmt(walletData.saldo_disponible)}</div>
            </div>
            <div style={{padding:'0.5rem 0.625rem',textAlign:'center',borderLeft:'1px solid rgba(255,255,255,0.06)',borderRight:'1px solid rgba(255,255,255,0.06)'}}>
              <div style={{fontSize:'0.62rem',color:'#6B7280',marginBottom:'2px'}}>Comprometido</div>
              <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#E8A020',fontFamily:'monospace'}}>{fmt(walletData.saldo_comprometido)}</div>
            </div>
            <div style={{padding:'0.5rem 0.625rem',textAlign:'center'}}>
              <div style={{fontSize:'0.62rem',color:'#6B7280',marginBottom:'2px'}}>Pendiente</div>
              <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#AFA9EC',fontFamily:'monospace'}}>{fmt(walletData.saldo_pendiente)}</div>
            </div>
          </div>
          <div style={{fontSize:'0.62rem',color:'#4B5563',marginBottom:'0.625rem',textAlign:'center'}}>{moneda}</div>
        </>
      ) : (
        <div style={{fontSize:'0.82rem',color:'#8FA3CC',marginBottom:'0.75rem'}}>Cargando...</div>
      )}
      <div style={{display:'flex',gap:'0.4rem'}}>
        <a href="/wallet/fondear" style={{flex:1,padding:'0.4rem',background:'rgba(29,158,117,0.15)',color:'#1D9E75',borderRadius:'6px',fontSize:'0.72rem',fontWeight:'600',textDecoration:'none',textAlign:'center'}}>Fondear</a>
        <a href="/wallet" style={{flex:1,padding:'0.4rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',color:'#8FA3CC',borderRadius:'6px',fontSize:'0.72rem',textDecoration:'none',textAlign:'center'}}>Ver →</a>
      </div>
    </div>
  )
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
  const [notifPanelAbierto, setNotifPanelAbierto] = useState(false)
  const [tourInicioPaso, setTourInicioPaso] = useState(null) // null = inactivo

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
      if (primerProyectoFundado) {
        fetch('/api/ingresos?proyecto_id=' + primerProyectoFundado.id)
          .then(r => r.json())
          .then(d => setTotalIngresos(d.total || 0))
          .catch(() => {})
      }
      setProyectosFinalizados(data.proyectosFinalizados || [])
      setVistaSugerida(data.vistaSugerida || 'especialista')
      setVista(data.vistaSugerida || 'resumen')

      // Tour de primeros pasos — solo primera vez que entra al dashboard
      const rolPrincipal = data.perfil?.rol_principal || 'especialista'
      const tourKey = 'escala_tour_inicio_' + user.id
      if (!localStorage.getItem(tourKey)) {
        setTourInicioPaso(0)
      }

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
  const primerProyectoFundado = misProyectos.find(p => p.estado === 'activo') || misProyectos[0] || null
  const totalAportes = misAportes.reduce((s, a) => s + (a.valor || 0), 0)
  const postulacionActiva = misPostulaciones.find(p =>
    p.estado === 'aceptada' &&
    p.roles?.proyecto_id &&
    !misProyectos.some(mp => mp.id === p.roles?.proyecto_id)
  )
  const proyectoActivo = postulacionActiva ? todosProyectos.find(p => p.id === postulacionActiva.roles.proyecto_id) : null
  const rolActivo = postulacionActiva?.roles?.nombre || null
  const postAceptadas = misPostulaciones.filter(p => p.estado === 'aceptada').length
  const recibidasPendientes = postulacionesRecibidas.filter(p => p.estado === 'pendiente').length

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando...
    </div>
  )

  const acciones = [
    ...(primerProyectoFundado ? [{ icon: '🧩', label: 'Publicar rol', href: '/proyectos/'+primerProyectoFundado.id+'/workspace?tab=roles' }] : []),
    { icon: '🚀', label: 'Crear proyecto', href: '/proyectos' },
    { icon: '🔍', label: 'Buscar especialista', href: '/directorio' },
    { icon: '💰', label: 'Registrar aporte', href: '/aportes' },
    { icon: '📈', label: 'Registrar ingreso', href: '/ingresos' },
    { icon: '🎯', label: 'Crear meta financiable', href: '/hitos' },
    { icon: '✉️', label: 'Invitar especialista', href: '/invitar' },
    { icon: '🌟', label: 'Invertir en proyectos', href: '/angel' },
    ...(perfil?.es_admin ? [{ icon: '🛠️', label: 'Admin Escala', href: '/admin-escala' }] : []),
  ]

  // ── TOUR DE PRIMEROS PASOS ────────────────────────────────────────────
  const esFundadorTour = misProyectos.length > 0 || ['ideador','capitalista','empresa'].includes(perfil?.rol_principal)

  const TOUR_INICIO_PASOS = esFundadorTour ? [
    {
      titulo: '👋 Hola, ' + (perfil?.nombre?.split(' ')[0] || 'bienvenido') + '!',
      texto: 'Bienvenido a Escala. Eres fundador — aquí puedes crear tu proyecto, armar un equipo y hacer crecer tu empresa sin necesitar capital inicial para contratar.',
      accion: 'Siguiente →',
    },
    {
      titulo: '🚀 Crea tu primer proyecto',
      texto: 'El primer paso es publicar tu proyecto. Cuéntale al mundo qué estás construyendo, en qué industria y qué necesitas. Aparecerás en el directorio de proyectos.',
      accion: 'Crear proyecto →',
      href: '/proyectos',
    },
    {
      titulo: '🧩 Publica roles para tu equipo',
      texto: 'Desde el workspace de tu proyecto, publica los roles que necesitas — un abogado, un contador, un desarrollador. Los especialistas se postulan y tú eliges a quién aceptar.',
      accion: 'Siguiente →',
    },
    {
      titulo: '🔍 Busca especialistas en el directorio',
      texto: 'También puedes ir al directorio, filtrar por especialidad, revisar el Escala Score de cada persona y contactarla directamente para invitarla a tu proyecto.',
      accion: 'Ver directorio →',
      href: '/directorio',
    },
    {
      titulo: '✅ ¡Todo listo!',
      texto: 'Ya sabes cómo funciona. Empieza publicando tu proyecto — el equipo viene solo cuando el proyecto está visible.',
      accion: 'Ir a crear proyecto →',
      href: '/proyectos',
      esFinal: true,
    },
  ] : [
    {
      titulo: '👋 Hola, ' + (perfil?.nombre?.split(' ')[0] || 'bienvenido') + '!',
      texto: 'Bienvenido a Escala. Eres especialista — aquí puedes convertir tu conocimiento y tiempo en participación real en empresas que están construyendo algo.',
      accion: 'Siguiente →',
    },
    {
      titulo: '👤 Primero, completa tu perfil',
      texto: 'Antes de buscar, asegúrate de tener tu perfil completo — especialidad, ciudad y qué puedes aportar. Los fundadores lo revisan antes de aceptarte. Un perfil vacío = postulación ignorada.',
      accion: 'Completar mi perfil →',
      href: '/perfil/editar',
    },
    {
      titulo: '🏗️ ¿Qué son los proyectos en Escala?',
      texto: 'Los proyectos son empresas en construcción. Cada proyecto tiene un fundador que necesita armar un equipo — abogados, contadores, diseñadores, desarrolladores — sin tener que pagarles de entrada. Tu compensación es participación futura.',
      accion: 'Siguiente →',
    },
    {
      titulo: '🧩 Los proyectos publican roles abiertos',
      texto: 'Cada proyecto tiene roles disponibles: "Contador · Constitución de empresas", "Desarrollador Full-Stack", etc. Tú buscas el rol que encaje con tu especialidad y te postulas. El fundador decide si te acepta.',
      accion: 'Ver proyectos disponibles →',
      href: '/buscar',
    },
    {
      titulo: '✅ ¡Ya sabes cómo funciona!',
      texto: 'El flujo es simple: buscás proyectos → encontrás uno con un rol para vos → te postulás → si te aceptan, entrás al workspace y empezás a trabajar. Tu tiempo queda registrado como aporte.',
      accion: 'Buscar proyectos ahora →',
      href: '/buscar',
      esFinal: true,
    },
  ]

  function cerrarTourInicio() {
    localStorage.setItem('escala_tour_inicio_' + usuario?.id, '1')
    setTourInicioPaso(null)
  }

  function avanzarTourInicio() {
    const paso = TOUR_INICIO_PASOS[tourInicioPaso]
    if (paso?.href) {
      cerrarTourInicio()
      window.location.href = paso.href
      return
    }
    if (tourInicioPaso >= TOUR_INICIO_PASOS.length - 1) {
      cerrarTourInicio()
      return
    }
    setTourInicioPaso(p => p + 1)
  }

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>

      {/* TOUR PRIMEROS PASOS */}
      {tourInicioPaso !== null && TOUR_INICIO_PASOS[tourInicioPaso] && (
        <>
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:2000,backdropFilter:'blur(3px)'}} onClick={cerrarTourInicio}></div>
          <div style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:2001,background:'#15234a',border:'1px solid rgba(29,158,117,0.35)',borderRadius:'18px',padding:'2rem',maxWidth:'440px',width:'calc(100vw - 2rem)',boxShadow:'0 24px 64px rgba(0,0,0,0.7)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
              <span style={{fontSize:'0.65rem',fontWeight:'700',letterSpacing:'0.08em',textTransform:'uppercase',color:'#1D9E75'}}>
                Paso {tourInicioPaso + 1} de {TOUR_INICIO_PASOS.length}
              </span>
              <button onClick={cerrarTourInicio} style={{background:'none',border:'none',color:'#8FA3CC',cursor:'pointer',fontSize:'1rem',padding:0,lineHeight:1}}>✕</button>
            </div>
            <div style={{height:'3px',background:'rgba(255,255,255,0.08)',borderRadius:'2px',marginBottom:'1.5rem',overflow:'hidden'}}>
              <div style={{height:'100%',width:((tourInicioPaso+1)/TOUR_INICIO_PASOS.length*100)+'%',background: TOUR_INICIO_PASOS[tourInicioPaso].esFinal ? '#1D9E75' : '#4A90D9',borderRadius:'2px',transition:'width 0.35s ease'}}></div>
            </div>
            <div style={{fontSize:'1.15rem',fontWeight:'800',color:'#fff',marginBottom:'0.75rem',lineHeight:'1.3'}}>
              {TOUR_INICIO_PASOS[tourInicioPaso].titulo}
            </div>
            <div style={{fontSize:'0.875rem',color:'#C8D4E8',lineHeight:'1.75',marginBottom:'1.75rem'}}>
              {TOUR_INICIO_PASOS[tourInicioPaso].texto}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <button onClick={cerrarTourInicio} style={{background:'none',border:'none',color:'#8FA3CC',fontSize:'0.78rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                Saltar
              </button>
              <button onClick={avanzarTourInicio} style={{background: TOUR_INICIO_PASOS[tourInicioPaso].esFinal ? '#1D9E75' : '#4A90D9',color:'#fff',border:'none',borderRadius:'10px',padding:'0.7rem 1.5rem',fontSize:'0.875rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif',transition:'background 0.2s'}}>
                {TOUR_INICIO_PASOS[tourInicioPaso].accion}
              </button>
            </div>
          </div>
        </>
      )}

      {toastNuevo && (
        <div onClick={() => { setNotifPanelAbierto(true); setToastNuevo(null) }} style={{
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
          <a href="/directorio-inversion" style={{color:'#4A90D9',fontSize:'0.82rem',textDecoration:'none',fontWeight:'600'}}>💰 Invertir</a>
          <a href="/score" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Mi Score</a>
          <div style={{position:'relative'}}>
            <button onClick={() => setNotifPanelAbierto(v => !v)} style={{background: notifPanelAbierto ? 'rgba(255,255,255,0.08)' : 'transparent',border:'none',borderRadius:'8px',color:'#8FA3CC',cursor:'pointer',fontSize:'1.05rem',position:'relative',padding:'0.35rem'}}>
              🔔
              {(notificaciones.filter(n=>!n.leido).length + mensajesNoLeidos) > 0 && <span style={{position:'absolute',top:'-2px',right:'-2px',background:'#1D9E75',color:'#fff',fontSize:'0.6rem',fontWeight:'700',padding:'1px 4px',borderRadius:'8px',minWidth:'14px',textAlign:'center'}}>{notificaciones.filter(n=>!n.leido).length + mensajesNoLeidos}</span>}
            </button>

            {notifPanelAbierto && (
              <>
                <div onClick={() => setNotifPanelAbierto(false)} style={{position:'fixed',inset:0,zIndex:998}}></div>
                <div style={{position:'absolute',top:'calc(100% + 10px)',right:0,width:'360px',maxWidth:'calc(100vw - 2rem)',maxHeight:'480px',background:'#15234a',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'14px',boxShadow:'0 12px 40px rgba(0,0,0,0.5)',zIndex:999,display:'flex',flexDirection:'column',overflow:'hidden'}}>
                  <div style={{padding:'0.875rem 1rem',borderBottom:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
                    <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#fff'}}>Notificaciones</div>
                    <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                      {notificaciones.some(n=>!n.leido) && (
                        <button onClick={marcarTodasLeidas} style={{background:'none',border:'none',color:'#8FA3CC',fontSize:'0.7rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Marcar leídas</button>
                      )}
                      <button onClick={() => setNotifPanelAbierto(false)} style={{background:'none',border:'none',color:'#8FA3CC',cursor:'pointer',fontSize:'0.9rem',padding:0}}>✕</button>
                    </div>
                  </div>

                  {!pushActivo && (
                    <div style={{padding:'0.6rem 1rem',borderBottom:'1px solid rgba(255,255,255,0.06)',flexShrink:0}}>
                      <button onClick={activarPush} style={{background:'none',border:'1px solid rgba(29,158,117,0.35)',color:'#1D9E75',fontSize:'0.7rem',cursor:'pointer',padding:'0.3rem 0.6rem',borderRadius:'6px',fontFamily:'Inter,sans-serif',width:'100%'}}>🔔 Activar notificaciones push</button>
                    </div>
                  )}

                  <div style={{overflowY:'auto',flex:1}}>
                    {notificaciones.length === 0 ? (
                      <div style={{padding:'2.5rem 1.5rem',textAlign:'center'}}>
                        <div style={{fontSize:'1.6rem',marginBottom:'0.5rem'}}>🔔</div>
                        <div style={{color:'#fff',fontWeight:'700',fontSize:'0.82rem',marginBottom:'0.3rem'}}>Sin notificaciones por ahora</div>
                        <div style={{color:'#8FA3CC',fontSize:'0.72rem'}}>Aquí verás cuando te acepten en un rol, cuando alguien se postule a tu proyecto, o cuando haya actividad importante.</div>
                      </div>
                    ) : (
                      notificaciones.map((n, i) => (
                        <div key={n.id || i} onClick={() => marcarLeida(n)} style={{background: n.leido===false ? 'rgba(29,158,117,0.06)' : 'transparent',borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'0.75rem 1rem',display:'flex',gap:'0.75rem',alignItems:'flex-start',cursor: (n.id || n.link) ? 'pointer' : 'default'}}>
                          <div style={{width:'28px',height:'28px',borderRadius:'50%',background:`rgba(${COLOR_RGB[n.color] || '143,163,204'},0.15)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem',flexShrink:0}}>
                            {n.icon}
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:'0.78rem',color:'#fff',marginBottom:'0.2rem',lineHeight:'1.4'}}>{n.texto}</div>
                            <div style={{fontSize:'0.65rem',color:'#8FA3CC'}}>{new Date(n.fecha).toLocaleDateString('es-CO', {day:'numeric',month:'short'})}</div>
                            {n.tipo === 'nueva_postulacion' && n.postulante_id ? (
                              <a href={'/perfil/'+n.postulante_id} onClick={(e)=>e.stopPropagation()} style={{display:'inline-block',marginTop:'0.3rem',fontSize:'0.68rem',color:'#1D9E75',textDecoration:'none',fontWeight:'600'}}>Ver perfil →</a>
                            ) : n.link ? (
                              <span style={{display:'inline-block',marginTop:'0.3rem',fontSize:'0.68rem',color:'#1D9E75',fontWeight:'600'}}>Ver →</span>
                            ) : null}
                          </div>
                          {n.leido===false && <div title="Sin leer" style={{width:'7px',height:'7px',borderRadius:'50%',background:'#1D9E75',flexShrink:0,marginTop:'0.3rem'}}></div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
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

        {contadores.tareas_por_verificar > 0 && (
          <a href={bandeja.find(b => b.tipo === 'tarea_por_verificar')?.href || '/proyectos'} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem',background:'rgba(232,160,32,0.08)',border:'1px solid rgba(232,160,32,0.3)',borderRadius:'12px',padding:'1rem 1.25rem',marginBottom:'1.5rem',textDecoration:'none'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
              <span style={{width:'10px',height:'10px',borderRadius:'50%',background:'#E8A020',flexShrink:0,animation:'pulseBanner 1.5s infinite'}}></span>
              <div>
                <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#fff'}}>
                  {contadores.tareas_por_verificar === 1 ? 'Hay 1 tarea completada esperando tu verificación' : `Hay ${contadores.tareas_por_verificar} tareas completadas esperando tu verificación`}
                </div>
                <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'2px'}}>Revísalas en el workspace del proyecto — puedes conversar y pedir documentos antes de aprobar.</div>
              </div>
            </div>
            <div style={{fontSize:'0.8rem',fontWeight:'700',color:'#E8A020',flexShrink:0}}>Revisar →</div>
          </a>
        )}
        <style>{`@keyframes pulseBanner { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }`}</style>


        {vista === 'gerente' ? (
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
                Como empresa en Escala puedes hacer varias cosas: crear tus propios proyectos, trabajar en proyectos de otros, invertir en negocios con potencial, o aportar tu experiencia como mentor.
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'0.6rem'}}>
                {[
                  { icon:'🚀', label:'Crear mi proyecto', href:'/proyectos' },
                  { icon:'🔧', label:'Trabajar en proyectos', href:'/buscar' },
                  { icon:'🌟', label:'Invertir en proyectos', href:'/buscar' },
                  { icon:'🧭', label:'Dar mentoría', href:'/directorio' },
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
            <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',marginBottom:'1.25rem'}}>Vista de Inversionista
              <a href="/angel" style={{marginLeft:'0.875rem',fontSize:'0.72rem',fontWeight:'600',color:'#AFA9EC',background:'rgba(175,169,236,0.12)',padding:'0.25rem 0.75rem',borderRadius:'20px',textDecoration:'none',border:'1px solid rgba(175,169,236,0.2)'}}>
                Ver panel completo →
              </a>
            </div>

            {/* CTA al directorio de inversión */}
            <div style={{background:'rgba(74,144,217,0.06)',border:'1px solid rgba(74,144,217,0.25)',borderRadius:'12px',padding:'1rem 1.25rem',marginBottom:'1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.75rem'}}>
              <div>
                <div style={{fontSize:'0.88rem',fontWeight:'700',color:'#4A90D9',marginBottom:'3px'}}>💰 Oportunidades de inversión disponibles</div>
                <div style={{fontSize:'0.75rem',color:'#8FA3CC'}}>Proyectos activos que necesitan capital para equipos, tecnología, nómina y más. Fondea por item a cambio de participación, deuda o revenue share.</div>
              </div>
              <a href="/directorio-inversion" style={{background:'#4A90D9',color:'#fff',padding:'0.5rem 1.25rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.82rem',fontWeight:'700',whiteSpace:'nowrap'}}>
                Ver oportunidades →
              </a>
            </div>

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
                <div style={{color:'#8FA3CC',fontSize:'0.82rem',marginBottom:'1.25rem'}}>Explora proyectos y financia metas concretas (un logo, un dominio, una campaña) sin invertir en toda la empresa.</div>
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
            {/* ZONA 2 — BANDEJA DE TRABAJO: ancho completo, eje del dashboard */}
            <div style={{marginBottom:'1.5rem'}}>
              <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'0.75rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#AFA9EC',display:'inline-block'}}></span>
                Bandeja de trabajo
                {bandeja.length > 0 && <span style={{fontSize:'0.65rem',fontWeight:'600',color:'#AFA9EC',background:'rgba(83,74,183,0.15)',padding:'0.1rem 0.45rem',borderRadius:'10px'}}>{bandeja.length}</span>}
                {bandeja.length > 5 && <a href="/hitos" style={{fontSize:'0.7rem',color:'#8FA3CC',marginLeft:'auto',textDecoration:'none'}}>Ver todas →</a>}
              </div>
              {bandeja.length === 0 ? (
                <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'10px',padding:'1.25rem',textAlign:'center',fontSize:'0.78rem',color:'#8FA3CC'}}>
                  Nada pendiente por ahora — vas al día.
                </div>
              ) : (
                <div style={{display:bandeja.length >= 4 ? 'grid' : 'flex', gridTemplateColumns:bandeja.length >= 4 ? 'repeat(auto-fill,minmax(280px,1fr))' : undefined, flexDirection:bandeja.length < 4 ? 'column' : undefined, gap:'0.4rem'}}>
                  {bandeja.slice(0,6).map((item,i) => (
                    <a key={i} href={item.href} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'0.75rem',background:'rgba(83,74,183,0.06)',border:'1px solid rgba(83,74,183,0.2)',borderRadius:'9px',padding:'0.7rem 1rem',textDecoration:'none'}}>
                      <div style={{fontSize:'0.8rem',color:'#fff',lineHeight:'1.35'}}>{item.texto}</div>
                      <div style={{fontSize:'0.72rem',color:'#AFA9EC',flexShrink:0}}>→</div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* ZONA 3 — MIS PROYECTOS como tarjetas accionables */}
            <div style={{marginBottom:'1.75rem'}}>
              <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'0.875rem'}}>Mis proyectos</div>
              {misProyectos.length === 0 ? (
                <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'12px',padding:'2rem',textAlign:'center'}}>
                  {misPostulaciones.length === 0 ? (
                    <>
                      <div style={{fontSize:'1.5rem',marginBottom:'0.5rem'}}>🚀</div>
                      <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.3rem',fontSize:'0.9rem'}}>¿Tienes una idea? Publícala</div>
                      <div style={{color:'#8FA3CC',fontSize:'0.78rem',marginBottom:'1rem'}}>Arma equipo sin necesidad de capital inicial.</div>
                      <a href="/proyectos" style={{background:'#E8A020',color:'#fff',padding:'0.6rem 1.25rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.8rem',fontWeight:'700',display:'inline-block',marginRight:'0.5rem'}}>+ Crear proyecto</a>
                      <a href="/buscar" style={{background:'rgba(255,255,255,0.08)',color:'#8FA3CC',padding:'0.6rem 1rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.78rem',display:'inline-block'}}>Explorar proyectos</a>
                    </>
                  ) : (
                    <>
                      <div style={{fontSize:'1.5rem',marginBottom:'0.5rem'}}>🔍</div>
                      <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.3rem',fontSize:'0.9rem'}}>Encuentra tu próximo proyecto</div>
                      <div style={{color:'#8FA3CC',fontSize:'0.78rem',marginBottom:'1rem'}}>Postúlate a proyectos que necesiten tu especialidad.</div>
                      <a href="/buscar" style={{background:'#534AB7',color:'#fff',padding:'0.6rem 1.25rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.8rem',fontWeight:'700',display:'inline-block'}}>Explorar proyectos →</a>
                    </>
                  )}
                </div>
              ) : misProyectos.length > 3 ? (
                /* Lista compacta para 4+ proyectos */
                <div style={{display:'flex',flexDirection:'column',gap:'0.4rem'}}>
                  {misProyectos.map(p => {
                    const tareasDelProyecto = bandeja.filter(b => b.href?.includes(p.id) && b.tipo === 'tarea_pendiente').length
                    return (
                      <div key={p.id} style={{background:'rgba(232,160,32,0.04)',border:'1px solid rgba(232,160,32,0.15)',borderRadius:'10px',padding:'0.75rem 1rem',display:'flex',alignItems:'center',gap:'1rem',justifyContent:'space-between'}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:'0.62rem',fontWeight:'700',color:'#E8A020',letterSpacing:'0.05em',textTransform:'uppercase',marginBottom:'0.15rem'}}>Tipo {p.tipo} · {p.estado}</div>
                          <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#fff',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.nombre}</div>
                          {tareasDelProyecto > 0 && <div style={{fontSize:'0.68rem',color:'#AFA9EC',marginTop:'0.1rem'}}>⚠ {tareasDelProyecto} pendiente{tareasDelProyecto!==1?'s':''}</div>}
                        </div>
                        <div style={{display:'flex',gap:'0.4rem',flexShrink:0}}>
                          <a href={'/proyectos/'+p.id+'/workspace'} style={{fontSize:'0.7rem',fontWeight:'700',color:'#fff',background:'#1D9E75',padding:'0.3rem 0.875rem',borderRadius:'6px',textDecoration:'none'}}>Workspace</a>
                          <div style={{position:'relative',display:'inline-block'}} title={'Publicar rol · Hitos · Aportes'}>
                            <a href={'/proyectos/'+p.id+'/workspace'} style={{fontSize:'0.7rem',color:'#8FA3CC',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',padding:'0.3rem 0.6rem',borderRadius:'6px',textDecoration:'none'}}>···</a>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* Tarjetas contextuales por tipo de proyecto */
                <div style={{display:'flex',flexDirection:'column',gap:'0.875rem'}}>
                  {misProyectos.map(p => {
                    const items = p._presupuesto_items || []
                    const local = p._local || null
                    const tareasDelProyecto = bandeja.filter(b => b.href?.includes(p.id) && b.tipo === 'tarea_pendiente').length

                    // Detectar qué tiene el proyecto
                    const tieneLocal = p.escenario === 'local_comercial' && local
                    const tieneEquipos = items.filter(i => i.categoria === 'equipos_activos').length > 0
                    const tieneEquipo = items.filter(i => i.categoria === 'equipo').length > 0
                    const tieneTech = items.filter(i => i.categoria === 'tecnologia').length > 0
                    const tieneOtros = items.filter(i => !['equipos_activos','equipo','tecnologia'].includes(i.categoria)).length > 0
                    const esSimple = !tieneLocal && items.length > 0
                    const esGenerico = !tieneLocal && items.length === 0

                    const fmt = (n) => Math.round(parseFloat(n||0)).toLocaleString('es-CO')
                    const pctPagado = local ? Math.round((parseFloat(local.capital_pagado||0)/parseFloat(local.capital_total||1))*100) : 0
                    const semaforoColor = local ? (pctPagado > 60 ? '#1D9E75' : pctPagado > 30 ? '#E8A020' : '#4A90D9') : '#6B7280'

                    return (
                      <div key={p.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',overflow:'hidden'}}>

                        {/* Header del proyecto */}
                        <div style={{padding:'0.875rem 1rem',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <div>
                            <div style={{fontSize:'0.92rem',fontWeight:'800',color:'#fff'}}>{p.nombre}</div>
                            <div style={{fontSize:'0.7rem',color:'#6B7280'}}>{p.sector} · {p.ciudad} · {p.estado === 'borrador' ? <span style={{color:'#E8A020',fontWeight:'600'}}>Borrador — no publicado</span> : p.estado}</div>
                          </div>
                          <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                            {tareasDelProyecto > 0 && <span style={{fontSize:'0.65rem',fontWeight:'700',background:'rgba(175,169,236,0.15)',color:'#AFA9EC',padding:'2px 7px',borderRadius:'10px'}}>⚠ {tareasDelProyecto} tareas</span>}
                            <details style={{position:'relative'}}>
                              <summary style={{cursor:'pointer',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'6px',padding:'0.3rem 0.6rem',fontSize:'0.82rem',color:'#8FA3CC',listStyle:'none',userSelect:'none'}}>···</summary>
                              <div style={{position:'absolute',right:0,top:'calc(100% + 4px)',background:'#15234a',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'8px',minWidth:'160px',zIndex:10,overflow:'hidden'}}>
                                <a href={'/proyectos/'+p.id+'/workspace'} style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.6rem 0.875rem',textDecoration:'none',fontSize:'0.78rem',color:'#C8D4E8',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>🖥️ Workspace</a>
                                {p.escenario === 'local_comercial'
                                  ? <a href={'/proyectos/'+p.id+'/workspace/local'} style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.6rem 0.875rem',textDecoration:'none',fontSize:'0.78rem',color:'#C8D4E8',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>📊 Ventas de hoy</a>
                                  : <a href={'/proyectos/'+p.id+'/workspace/presupuesto'} style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.6rem 0.875rem',textDecoration:'none',fontSize:'0.78rem',color:'#C8D4E8',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>🔧 Maquinas y activos</a>
                                }
                                <a href={'/proyectos/'+p.id+'/workspace?tab=roles'} style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.6rem 0.875rem',textDecoration:'none',fontSize:'0.78rem',color:'#C8D4E8',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>🧩 Publicar rol</a>
                                <a href={'/proyectos/'+p.id+'/workspace/reparto'} style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.6rem 0.875rem',textDecoration:'none',fontSize:'0.78rem',color:'#C8D4E8'}}>💸 Reparto</a>
                              </div>
                            </details>
                          </div>
                        </div>

                        {/* PROYECTO DE EQUIPOS SIN ITEMS — CTA para empezar */}
                        {!tieneLocal && esGenerico && p.escenario === 'otro' && (
                          <div style={{padding:'0.875rem 1rem',background:'rgba(74,144,217,0.04)',borderTop:'1px solid rgba(74,144,217,0.12)'}}>
                            <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#4A90D9',marginBottom:'0.375rem'}}>🔧 Agrega lo que necesitas comprar</div>
                            <div style={{fontSize:'0.75rem',color:'#8FA3CC',lineHeight:'1.5',marginBottom:'0.625rem'}}>Todavia no has agregado ningun equipo o maquina. Ese es el primer paso para conseguir el capital.</div>
                            <a href={'/proyectos/'+p.id+'/workspace/presupuesto'} style={{display:'block',textAlign:'center',background:'#4A90D9',color:'#fff',borderRadius:'8px',padding:'0.45rem',fontSize:'0.78rem',fontWeight:'700',textDecoration:'none'}}>
                              Agregar lo que necesito →
                            </a>
                          </div>
                        )}

                        {/* BLOQUE LOCAL COMERCIAL */}
                        {tieneLocal && (
                          <div style={{padding:'0.875rem 1rem',borderBottom:esSimple?'1px solid rgba(255,255,255,0.06)':'none'}}>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.625rem'}}>
                              <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#E8A020',textTransform:'uppercase',letterSpacing:'0.05em'}}>📍 Local comercial</div>
                              <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:semaforoColor}}></div>
                                <span style={{fontSize:'0.7rem',color:semaforoColor,fontWeight:'600'}}>{local.fase_actual === 'libre' ? 'Libre' : local.fase_actual === 'regalia' ? 'Regalía' : 'Repago'}</span>
                              </div>
                            </div>
                            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.5rem',marginBottom:'0.75rem'}}>
                              <div style={{textAlign:'center'}}>
                                <div style={{fontSize:'0.88rem',fontWeight:'700',color:'#1D9E75'}}>${fmt(local.capital_pagado)}</div>
                                <div style={{fontSize:'0.62rem',color:'#6B7280'}}>pagado</div>
                              </div>
                              <div style={{textAlign:'center'}}>
                                <div style={{fontSize:'0.88rem',fontWeight:'700',color:'#E8A020'}}>${fmt(parseFloat(local.capital_total||0)-parseFloat(local.capital_pagado||0))}</div>
                                <div style={{fontSize:'0.62rem',color:'#6B7280'}}>pendiente</div>
                              </div>
                              <div style={{textAlign:'center'}}>
                                <div style={{fontSize:'0.88rem',fontWeight:'700',color:'#fff'}}>{pctPagado}%</div>
                                <div style={{fontSize:'0.62rem',color:'#6B7280'}}>completado</div>
                              </div>
                            </div>
                            <div style={{height:'4px',background:'rgba(255,255,255,0.06)',borderRadius:'2px',overflow:'hidden',marginBottom:'0.75rem'}}>
                              <div style={{height:'100%',width:pctPagado+'%',background:semaforoColor,borderRadius:'2px',transition:'width 0.5s'}}></div>
                            </div>
                            <a href={'/proyectos/'+p.id+'/workspace/local'} style={{display:'block',textAlign:'center',background:'#E8A020',color:'#fff',borderRadius:'8px',padding:'0.45rem',fontSize:'0.78rem',fontWeight:'700',textDecoration:'none'}}>
                              Reportar ventas hoy →
                            </a>
                          </div>
                        )}

                        {/* BLOQUE EQUIPOS Y ACTIVOS */}
                        {tieneEquipos && (
                          <div style={{padding:'0.875rem 1rem',borderBottom:(tieneEquipo||tieneTech||tieneOtros)?'1px solid rgba(255,255,255,0.06)':'none'}}>
                            <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#4A90D9',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'0.625rem'}}>🔧 Equipos y maquinaria</div>
                            {items.filter(i=>i.categoria==='equipos_activos').slice(0,2).map(item => {
                              const faltante = parseFloat(item.valor_total||0) - parseFloat(item.monto_fondeado||0)
                              const pct = item.valor_total > 0 ? Math.round((parseFloat(item.monto_fondeado||0)/parseFloat(item.valor_total))*100) : 0
                              return (
                                <div key={item.id} style={{marginBottom:'0.625rem'}}>
                                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem',marginBottom:'3px'}}>
                                    <span style={{color:'#C8D4E8',fontWeight:'600'}}>{item.nombre}</span>
                                    <span style={{color:'#fff',fontWeight:'700'}}>${fmt(faltante)} <span style={{color:'#6B7280',fontWeight:'400'}}>falta</span></span>
                                  </div>
                                  <div style={{height:'3px',background:'rgba(255,255,255,0.06)',borderRadius:'2px',overflow:'hidden'}}>
                                    <div style={{height:'100%',width:pct+'%',background:'#4A90D9',borderRadius:'2px'}}></div>
                                  </div>
                                </div>
                              )
                            })}
                            {items.filter(i=>i.categoria==='equipos_activos').length > 2 && (
                              <div style={{fontSize:'0.7rem',color:'#6B7280',marginBottom:'0.5rem'}}>+{items.filter(i=>i.categoria==='equipos_activos').length-2} items más</div>
                            )}
                            <a href={'/proyectos/'+p.id+'/workspace/presupuesto'} style={{display:'block',textAlign:'center',background:'#4A90D9',color:'#fff',borderRadius:'8px',padding:'0.45rem',fontSize:'0.78rem',fontWeight:'700',textDecoration:'none'}}>
                              Buscar inversionista →
                            </a>
                          </div>
                        )}

                        {/* BLOQUE EQUIPO (personas) */}
                        {tieneEquipo && (
                          <div style={{padding:'0.875rem 1rem',borderBottom:(tieneTech||tieneOtros)?'1px solid rgba(255,255,255,0.06)':'none'}}>
                            <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#1D9E75',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'0.625rem'}}>👥 Equipo y personas</div>
                            {items.filter(i=>i.categoria==='equipo').slice(0,2).map(item => {
                              const faltante = parseFloat(item.valor_total||0) - parseFloat(item.monto_fondeado||0)
                              return (
                                <div key={item.id} style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem',marginBottom:'4px'}}>
                                  <span style={{color:'#C8D4E8'}}>{item.nombre}</span>
                                  <span style={{color:'#1D9E75',fontWeight:'600'}}>${fmt(faltante)}</span>
                                </div>
                              )
                            })}
                            <a href={'/proyectos/'+p.id+'/workspace/presupuesto'} style={{display:'block',textAlign:'center',background:'rgba(29,158,117,0.15)',color:'#1D9E75',border:'1px solid rgba(29,158,117,0.3)',borderRadius:'8px',padding:'0.45rem',fontSize:'0.78rem',fontWeight:'700',textDecoration:'none',marginTop:'0.5rem'}}>
                              Ver necesidades de equipo →
                            </a>
                          </div>
                        )}

                        {/* BLOQUE TECNOLOGÍA */}
                        {tieneTech && (
                          <div style={{padding:'0.875rem 1rem',borderBottom:tieneOtros?'1px solid rgba(255,255,255,0.06)':'none'}}>
                            <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#AFA9EC',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'0.625rem'}}>💻 Tecnología</div>
                            {items.filter(i=>i.categoria==='tecnologia').slice(0,2).map(item => {
                              const faltante = parseFloat(item.valor_total||0) - parseFloat(item.monto_fondeado||0)
                              return (
                                <div key={item.id} style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem',marginBottom:'4px'}}>
                                  <span style={{color:'#C8D4E8'}}>{item.nombre}</span>
                                  <span style={{color:'#AFA9EC',fontWeight:'600'}}>${fmt(faltante)}</span>
                                </div>
                              )
                            })}
                            <a href={'/proyectos/'+p.id+'/workspace/presupuesto'} style={{display:'block',textAlign:'center',background:'rgba(175,169,236,0.12)',color:'#AFA9EC',border:'1px solid rgba(175,169,236,0.25)',borderRadius:'8px',padding:'0.45rem',fontSize:'0.78rem',fontWeight:'700',textDecoration:'none',marginTop:'0.625rem'}}>
                              Fondear tecnología →
                            </a>
                          </div>
                        )}

                        {/* BLOQUE OTROS */}
                        {tieneOtros && (
                          <div style={{padding:'0.875rem 1rem'}}>
                            <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'0.625rem'}}>📋 Otros recursos</div>
                            {items.filter(i=>!['equipos_activos','equipo','tecnologia'].includes(i.categoria)).slice(0,2).map(item => {
                              const faltante = parseFloat(item.valor_total||0) - parseFloat(item.monto_fondeado||0)
                              return (
                                <div key={item.id} style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem',marginBottom:'4px'}}>
                                  <span style={{color:'#C8D4E8'}}>{item.nombre}</span>
                                  <span style={{color:'#6B7280',fontWeight:'600'}}>${fmt(faltante)}</span>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {/* Total capital requerido si hay items */}
                        {items.length > 0 && (
                          <div style={{padding:'0.5rem 1rem',borderTop:'1px solid rgba(255,255,255,0.04)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <span style={{fontSize:'0.7rem',color:'#6B7280'}}>Total por fondear</span>
                            <span style={{fontSize:'0.82rem',fontWeight:'700',color:'#fff'}}>${fmt(items.reduce((s,i)=>s+(parseFloat(i.valor_total||0)-parseFloat(i.monto_fondeado||0)),0))}</span>
                          </div>
                        )}
                        {esGenerico && (
                          <div style={{padding:'0.875rem 1rem'}}>
                            <div style={{fontSize:'0.75rem',color:'#6B7280',marginBottom:'0.625rem'}}>Define qué necesitas para que los ángeles puedan fondearte.</div>
                            <a href={'/proyectos/'+p.id+'/workspace/presupuesto'} style={{display:'block',textAlign:'center',background:'rgba(74,144,217,0.12)',color:'#4A90D9',border:'1px solid rgba(74,144,217,0.25)',borderRadius:'8px',padding:'0.45rem',fontSize:'0.78rem',fontWeight:'700',textDecoration:'none'}}>
                              Agregar al presupuesto →
                            </a>
                          </div>
                        )}

                        {/* NECESITO MAS — local y equipos */}
                        {(p.escenario === 'local_comercial' || p.escenario === 'otro') && (
                          <div style={{padding:'0.75rem 1rem',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                            <div style={{fontSize:'0.65rem',fontWeight:'700',color:'#AFA9EC',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'0.5rem'}}>Necesito mas</div>
                            <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                              <a href={'/proyectos/'+p.id+'/workspace?tab=necesito_mas'} style={{fontSize:'0.7rem',fontWeight:'600',color:'#1D9E75',background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'20px',padding:'3px 9px',textDecoration:'none',whiteSpace:'nowrap'}}>
                                👤 Empleado
                              </a>
                              {p.escenario === 'local_comercial' && (
                                <a href={'/proyectos/'+p.id+'/workspace?tab=necesito_mas'} style={{fontSize:'0.7rem',fontWeight:'600',color:'#E8A020',background:'rgba(232,160,32,0.08)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'20px',padding:'3px 9px',textDecoration:'none',whiteSpace:'nowrap'}}>
                                  🔧 Equipo
                                </a>
                              )}
                              {p.escenario === 'otro' && (
                                <a href={'/proyectos/'+p.id+'/workspace?tab=necesito_mas'} style={{fontSize:'0.7rem',fontWeight:'600',color:'#4A90D9',background:'rgba(74,144,217,0.08)',border:'1px solid rgba(74,144,217,0.2)',borderRadius:'20px',padding:'3px 9px',textDecoration:'none',whiteSpace:'nowrap'}}>
                                  🏪 Local
                                </a>
                              )}
                              <a href={'/proyectos/'+p.id+'/workspace?tab=necesito_mas'} style={{fontSize:'0.7rem',fontWeight:'600',color:'#AFA9EC',background:'rgba(175,169,236,0.08)',border:'1px solid rgba(175,169,236,0.2)',borderRadius:'20px',padding:'3px 9px',textDecoration:'none',whiteSpace:'nowrap'}}>
                                📦 Capital
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Workspace completo siempre visible */}
                        <div style={{padding:'0.625rem 1rem',borderTop:'1px solid rgba(255,255,255,0.04)',display:'flex',justifyContent:'center'}}>
                          <a href={'/proyectos/'+p.id+'/workspace'} style={{fontSize:'0.72rem',color:'#6B7280',textDecoration:'none'}}>
                            Ver workspace completo →
                          </a>
                        </div>

                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Postulaciones recibidas (solo si es fundador) */}
            {proyectoActivo && (
              <div style={{marginBottom:'1.75rem',background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.18)',borderRadius:'14px',padding:'1rem'}}>
                <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#1D9E75',marginBottom:'0.5rem'}}>Proyecto activo</div>
                <div style={{fontSize:'1rem',fontWeight:'800',color:'#fff',marginBottom:'0.25rem'}}>{proyectoActivo.nombre}</div>
                <div style={{fontSize:'0.78rem',color:'#8FA3CC',marginBottom:'0.85rem'}}>{rolActivo ? 'Rol aceptado: ' + rolActivo : 'Tienes un rol aceptado en este proyecto.'}</div>
                <a href={'/proyectos/'+proyectoActivo.id+'/workspace'} style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',background:'#1D9E75',padding:'0.65rem 0.95rem',borderRadius:'10px',textDecoration:'none',display:'inline-block'}}>Ir al workspace</a>
              </div>
            )}

            {/* Proyectos disponibles — para especialistas sube aquí (posición prioritaria) */}
            {!esFundador && todosProyectos.filter(p => p.fundador_id !== usuario?.id).length > 0 && (
              <div style={{marginBottom:'1.75rem'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.875rem'}}>
                  <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff'}}>Proyectos disponibles</div>
                  <a href="/buscar" style={{fontSize:'0.72rem',color:'#1D9E75',textDecoration:'none',fontWeight:'600'}}>Ver todos →</a>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'0.625rem'}}>
                  {todosProyectos.filter(p => p.fundador_id !== usuario?.id).slice(0,4).map(p => {
                    const rolesBuscados = p.roles_buscados || []
                    const especialidadUsuario = (perfil?.especialidad || '').toLowerCase()
                    const hayMatch = rolesBuscados.some(r => (r || '').toLowerCase().includes(especialidadUsuario.split(' ')[0]) || especialidadUsuario.includes((r || '').toLowerCase().split(' ')[0]))
                    return (
                      <a key={p.id} href={'/proyectos/'+p.id} style={{textDecoration:'none',background: hayMatch ? 'rgba(29,158,117,0.05)' : 'rgba(255,255,255,0.03)',border: hayMatch ? '1px solid rgba(29,158,117,0.2)' : '1px solid rgba(255,255,255,0.07)',borderRadius:'10px',padding:'0.875rem 1rem',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem'}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.25rem',flexWrap:'wrap'}}>
                            {hayMatch && <span style={{fontSize:'0.6rem',fontWeight:'700',color:'#1D9E75',background:'rgba(29,158,117,0.12)',padding:'1px 6px',borderRadius:'10px'}}>✓ Encaja con tu perfil</span>}
                            <span style={{fontSize:'0.6rem',color:'#8FA3CC'}}>{p.pais || p.ciudad || 'Sin ubicación'}</span>
                          </div>
                          <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.nombre}</div>
                          <div style={{fontSize:'0.7rem',color:'#8FA3CC'}}>{p.sector}{p.industria ? ' · ' + p.industria : ''}</div>
                        </div>
                        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'0.3rem',flexShrink:0}}>
                          <span style={{fontSize:'0.68rem',fontWeight:'700',color:'#E8A020',background:'rgba(232,160,32,0.1)',border:'1px solid rgba(232,160,32,0.2)',padding:'0.2rem 0.6rem',borderRadius:'20px'}}>Ver roles</span>
                        </div>
                      </a>
                    )
                  })}
                </div>
                <div style={{marginTop:'0.875rem',background:'rgba(83,74,183,0.06)',border:'1px dashed rgba(83,74,183,0.2)',borderRadius:'10px',padding:'0.75rem 1rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontSize:'0.78rem',color:'#8FA3CC'}}>¿No encontrás lo que buscás? Usa el buscador avanzado.</div>
                  <a href="/buscar" style={{fontSize:'0.75rem',fontWeight:'700',color:'#AFA9EC',textDecoration:'none',whiteSpace:'nowrap'}}>Buscar →</a>
                </div>
              </div>
            )}
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
                <a href="/mis-contratos" style={{display:'inline-block',marginTop:'0.6rem',fontSize:'0.74rem',color:'#E8A020',fontWeight:'600',textDecoration:'none'}}>Ver panel completo →</a>
              </div>
            )}

            {/* Proyectos disponibles — al fondo para fundadores, arriba para especialistas */}
            {esFundador && todosProyectos.filter(p => p.fundador_id !== usuario?.id).length > 0 && (
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
            )}
          </div>

          {/* ZONA 4 — SIDEBAR: accionables → score → wallet → informativos */}
          <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>

            {/* Accionables — requieren atención hoy */}
            {(mensajesNoLeidos > 0 || recibidasPendientes > 0 || contadores.tareas_por_verificar > 0) && (
              <div style={{background:'rgba(232,160,32,0.06)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'12px',padding:'0.875rem',display:'flex',flexDirection:'column',gap:'0.4rem'}}>
                <div style={{fontSize:'0.65rem',fontWeight:'700',color:'#E8A020',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.25rem'}}>Para hacer ahora</div>
                {contadores.tareas_por_verificar > 0 && (
                  <a href={bandeja.find(b => b.tipo === 'tarea_por_verificar')?.href || '/proyectos'} style={{display:'flex',alignItems:'center',gap:'0.6rem',textDecoration:'none',padding:'0.4rem 0.5rem',borderRadius:'6px',background:'rgba(232,160,32,0.08)'}}>
                    <span style={{fontSize:'0.8rem'}}>✅</span>
                    <div style={{flex:1,fontSize:'0.78rem',color:'#fff'}}>{contadores.tareas_por_verificar} tarea{contadores.tareas_por_verificar > 1 ? 's' : ''} por verificar</div>
                    <span style={{fontSize:'0.75rem',color:'#E8A020',fontWeight:'700'}}>→</span>
                  </a>
                )}
                {mensajesNoLeidos > 0 && primerProyectoFundado && (
                  <a href={'/proyectos/'+primerProyectoFundado.id+'/workspace/chat'} style={{display:'flex',alignItems:'center',gap:'0.6rem',textDecoration:'none',padding:'0.4rem 0.5rem',borderRadius:'6px',background:'rgba(232,160,32,0.08)'}}>
                    <span style={{fontSize:'0.8rem'}}>💬</span>
                    <div style={{flex:1,fontSize:'0.78rem',color:'#fff'}}>{mensajesNoLeidos} mensaje{mensajesNoLeidos > 1 ? 's' : ''} sin leer</div>
                    <span style={{fontSize:'0.75rem',color:'#E8A020',fontWeight:'700'}}>{mensajesNoLeidos}</span>
                  </a>
                )}
                {recibidasPendientes > 0 && (
                  <a href="/mis-contratos" style={{display:'flex',alignItems:'center',gap:'0.6rem',textDecoration:'none',padding:'0.4rem 0.5rem',borderRadius:'6px',background:'rgba(232,160,32,0.08)'}}>
                    <span style={{fontSize:'0.8rem'}}>👤</span>
                    <div style={{flex:1,fontSize:'0.78rem',color:'#fff'}}>{recibidasPendientes} postulación{recibidasPendientes > 1 ? 'es' : ''} pendiente{recibidasPendientes > 1 ? 's' : ''}</div>
                    <span style={{fontSize:'0.75rem',color:'#E8A020',fontWeight:'700'}}>{recibidasPendientes}</span>
                  </a>
                )}
              </div>
            )}

            {/* Score — activo reputacional, mayor prominencia */}
            <a href="/score" style={{textDecoration:'none',background:'rgba(175,169,236,0.08)',border:'1px solid rgba(175,169,236,0.25)',borderRadius:'12px',padding:'1rem',display:'block'}}>
              <div style={{fontSize:'0.65rem',fontWeight:'700',color:'#AFA9EC',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.3rem'}}>Escala Score</div>
              <div style={{fontFamily:'monospace',fontSize:'1.8rem',fontWeight:'700',color:'#AFA9EC',lineHeight:1}}>{perfil?.escala_score || 0}</div>
              <div style={{fontSize:'0.68rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Tu reputación verificable →</div>
            </a>

            {/* Wallet — acceso rápido al módulo financiero */}
            <WalletWidgetSidebar />

            {/* Informativos — contexto, no urgencia */}
            <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'0.875rem',display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              <div style={{fontSize:'0.68rem',fontWeight:'700',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.25rem'}}>Métricas</div>
              <a href="/postulaciones" style={{display:'flex',justifyContent:'space-between',alignItems:'center',textDecoration:'none'}}>
                <div style={{fontSize:'0.75rem',color:'#8FA3CC'}}>Postulaciones enviadas</div>
                <div style={{fontFamily:'monospace',fontSize:'0.95rem',fontWeight:'700',color:'#AFA9EC'}}>{misPostulaciones.length}</div>
              </a>
              <a href="/postulaciones" style={{display:'flex',justifyContent:'space-between',alignItems:'center',textDecoration:'none'}}>
                <div style={{fontSize:'0.75rem',color:'#8FA3CC'}}>Roles aceptados</div>
                <div style={{fontFamily:'monospace',fontSize:'0.95rem',fontWeight:'700',color:'#1D9E75'}}>{postAceptadas}</div>
              </a>
              <a href="/aportes" style={{display:'flex',justifyContent:'space-between',alignItems:'center',textDecoration:'none'}}>
                <div style={{fontSize:'0.75rem',color:'#8FA3CC'}}>Aportes totales</div>
                <div style={{fontFamily:'monospace',fontSize:'0.95rem',fontWeight:'700',color:'#fff'}}>${totalAportes.toLocaleString()}</div>
              </a>
              {esFundador && (
                <a href="/ingresos" style={{display:'flex',justifyContent:'space-between',alignItems:'center',textDecoration:'none'}}>
                  <div style={{fontSize:'0.75rem',color:'#8FA3CC'}}>Ingresos del proyecto</div>
                  <div style={{fontFamily:'monospace',fontSize:'0.95rem',fontWeight:'700',color:'#1D9E75'}}>${totalIngresos.toLocaleString()}</div>
                </a>
              )}
              {proyectosFinalizados.length > 0 && (
                <a href="/proyectos" style={{display:'flex',justifyContent:'space-between',alignItems:'center',textDecoration:'none'}}>
                  <div style={{fontSize:'0.75rem',color:'#8FA3CC'}}>Proyectos finalizados</div>
                  <div style={{fontFamily:'monospace',fontSize:'0.95rem',fontWeight:'700',color:'#fff'}}>{proyectosFinalizados.length}</div>
                </a>
              )}
            </div>

            {/* Acciones rápidas — 2 niveles */}
            <div style={{borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:'0.875rem'}}>
              <div style={{fontSize:'0.68rem',fontWeight:'700',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.6rem'}}>Acciones</div>
              {/* Primarias */}
              <div style={{display:'flex',flexDirection:'column',gap:'0.35rem',marginBottom:'0.5rem'}}>
                <a href="/proyectos" style={{display:'flex',alignItems:'center',gap:'0.5rem',background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'8px',padding:'0.55rem 0.875rem',textDecoration:'none',fontSize:'0.78rem',color:'#fff',fontWeight:'600'}}>
                  🚀 Crear proyecto
                </a>
                <a href="/directorio" style={{display:'flex',alignItems:'center',gap:'0.5rem',background:'rgba(83,74,183,0.08)',border:'1px solid rgba(83,74,183,0.2)',borderRadius:'8px',padding:'0.55rem 0.875rem',textDecoration:'none',fontSize:'0.78rem',color:'#fff',fontWeight:'600'}}>
                  🔍 Buscar especialista
                </a>
                <a href="/carril" style={{display:'flex',alignItems:'center',gap:'0.5rem',background:'rgba(232,160,32,0.08)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'8px',padding:'0.55rem 0.875rem',textDecoration:'none',fontSize:'0.78rem',color:'#E8A020',fontWeight:'600'}}>
                  ⚡ Cumplimiento y pago
                </a>
              </div>
              {/* Secundarias */}
              <div style={{display:'flex',flexDirection:'column',gap:'0.25rem'}}>
                {acciones.filter(a => !['Crear proyecto','Buscar especialista'].includes(a.label)).map((a,i) => (
                  <a key={i} href={a.href} style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.3rem 0',textDecoration:'none',fontSize:'0.74rem',color:'#8FA3CC'}}>
                    <span>{a.icon}</span>{a.label}
                  </a>
                ))}
                <a href="/perfil/editar" style={{fontSize:'0.74rem',color:'#8FA3CC',textDecoration:'none',padding:'0.3rem 0'}}>✏️ Editar mi perfil</a>
                <a href="/calendario" style={{fontSize:'0.74rem',color:'#8FA3CC',textDecoration:'none',padding:'0.3rem 0'}}>📅 Calendario</a>
                <a href="/metricas" style={{fontSize:'0.74rem',color:'#8FA3CC',textDecoration:'none',padding:'0.3rem 0'}}>📊 Métricas</a>
                <a href="/postulaciones" style={{fontSize:'0.74rem',color:'#8FA3CC',textDecoration:'none',padding:'0.3rem 0'}}>📋 Postulaciones</a>
                {primerProyectoFundado && <a href={'/p/'+primerProyectoFundado.id} target="_blank" style={{fontSize:'0.74rem',color:'#8FA3CC',textDecoration:'none',padding:'0.3rem 0'}}>🔗 Link público</a>}
              </div>
            </div>
          </div>

        </div>
        )}
      </main>
    </div>
  )
}
