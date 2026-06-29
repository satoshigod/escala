'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [proyectos, setProyectos] = useState([])
  const [misAportes, setMisAportes] = useState([])
  const [misPostulaciones, setMisPostulaciones] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro'; return }
      setUsuario(user)

      const [perfilRes, proyRes, postRes] = await Promise.all([
        fetch('/api/usuarios?id=' + user.id),
        fetch('/api/proyectos'),
        fetch('/api/postulaciones?postulante_id=' + user.id)
      ])

      const perfilData = await perfilRes.json()
      const proyData = await proyRes.json()
      const postData = await postRes.json()

      setPerfil(perfilData.usuario)
      setProyectos(proyData.proyectos || [])
      setMisPostulaciones(postData.postulaciones || [])

      if (proyData.proyectos && proyData.proyectos.length > 0) {
        const aRes = await fetch('/api/aportes?proyecto_id=' + proyData.proyectos[0].id)
        const aData = await aRes.json()
        const mios = (aData.aportes || []).filter(a => a.aportante_id === user.id)
        setMisAportes(mios)
      }

      setCargando(false)
    }
    cargar()
  }, [])

  async function cerrarSesion() {
    await supabase.auth.signOut()
    window.location.href = '/registro'
  }

  const rolLabels = {
    ideador: '💡 Ideador', capitalista: '💰 Capitalista',
    especialista: '🔧 Especialista', ejecutor: '⚙️ Ejecutor', angel: '🌟 Ángel'
  }

  const totalAportes = misAportes.reduce((s, a) => s + (a.valor || 0), 0)
  const postPendientes = misPostulaciones.filter(p => p.estado === 'pendiente').length
  const postAceptadas = misPostulaciones.filter(p => p.estado === 'aceptada').length
  const misproyectos = proyectos.filter(p => p.fundador_id === usuario?.id)

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando...
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Esca<span style={{color:'#1D9E75'}}>la</span></div>
        <div style={{display:'flex',alignItems:'center',gap:'1.5rem'}}>
          <a href="/proyectos" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Proyectos</a>
          <a href="/aportes" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Aportes</a>
          <a href="/postulaciones" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Postulaciones</a>
          <a href="/admin" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Panel fundador</a>
          <button onClick={cerrarSesion} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.15)',color:'#8FA3CC',padding:'0.35rem 0.875rem',borderRadius:'6px',fontSize:'0.8rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Salir</button>
        </div>
      </nav>

      <main style={{maxWidth:'1000px',margin:'0 auto',padding:'2rem 1.25rem'}}>

        <div style={{marginBottom:'2rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.4rem'}}>Tu dashboard</div>
          <div style={{fontSize:'clamp(1.5rem,3vw,2rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em',marginBottom:'0.3rem'}}>
            Hola, {perfil?.nombre?.split(' ')[0] || 'bienvenido'} 👋
          </div>
          <div style={{fontSize:'0.875rem',color:'#8FA3CC'}}>
            {perfil?.rol_principal ? rolLabels[perfil.rol_principal] + ' · ' + (perfil?.ciudad || '') : 'Completa tu perfil para empezar'}
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'1rem',marginBottom:'2.5rem'}}>
          <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#fff',lineHeight:'1'}}>{perfil?.escala_score || 0}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Escala Score</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#1D9E75',lineHeight:'1'}}>${totalAportes.toLocaleString()}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Mis aportes totales</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#E8A020',lineHeight:'1'}}>{postPendientes}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Postulaciones pendientes</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#AFA9EC',lineHeight:'1'}}>{postAceptadas}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Postulaciones aceptadas</div>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'1.25rem',marginBottom:'2rem'}}>

          <a href="/proyectos" style={{textDecoration:'none',display:'block',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'14px',padding:'1.5rem',transition:'border-color 0.2s',cursor:'pointer'}} onMouseOver={e=>e.currentTarget.style.borderColor='rgba(29,158,117,0.4)'} onMouseOut={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}>
            <div style={{fontSize:'1.5rem',marginBottom:'0.75rem'}}>🚀</div>
            <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',marginBottom:'0.3rem'}}>Proyectos</div>
            <div style={{fontSize:'0.78rem',color:'#8FA3CC',marginBottom:'1rem',lineHeight:'1.5'}}>{proyectos.length} proyecto{proyectos.length!==1?'s':''} activo{proyectos.length!==1?'s':''} en Escala</div>
            <div style={{fontSize:'0.78rem',color:'#1D9E75',fontWeight:'600'}}>Ver proyectos →</div>
          </a>

          <a href="/aportes" style={{textDecoration:'none',display:'block',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'14px',padding:'1.5rem',transition:'border-color 0.2s'}} onMouseOver={e=>e.currentTarget.style.borderColor='rgba(29,158,117,0.4)'} onMouseOut={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}>
            <div style={{fontSize:'1.5rem',marginBottom:'0.75rem'}}>📊</div>
            <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',marginBottom:'0.3rem'}}>Mis aportes</div>
            <div style={{fontSize:'0.78rem',color:'#8FA3CC',marginBottom:'1rem',lineHeight:'1.5'}}>{misAportes.length} aporte{misAportes.length!==1?'s':''} registrado{misAportes.length!==1?'s':''} · ${totalAportes.toLocaleString()}</div>
            <div style={{fontSize:'0.78rem',color:'#1D9E75',fontWeight:'600'}}>Registrar aporte →</div>
          </a>

          <a href="/postulaciones" style={{textDecoration:'none',display:'block',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'14px',padding:'1.5rem',transition:'border-color 0.2s'}} onMouseOver={e=>e.currentTarget.style.borderColor='rgba(29,158,117,0.4)'} onMouseOut={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}>
            <div style={{fontSize:'1.5rem',marginBottom:'0.75rem'}}>📋</div>
            <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',marginBottom:'0.3rem'}}>Mis postulaciones</div>
            <div style={{fontSize:'0.78rem',color:'#8FA3CC',marginBottom:'1rem',lineHeight:'1.5'}}>{misPostulaciones.length} enviada{misPostulaciones.length!==1?'s':''} · {postAceptadas} aceptada{postAceptadas!==1?'s':''}</div>
            <div style={{fontSize:'0.78rem',color:'#1D9E75',fontWeight:'600'}}>Ver postulaciones →</div>
          </a>

          <a href="/hitos" style={{textDecoration:'none',display:'block',background:'rgba(29,158,117,0.06)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'14px',padding:'1.5rem',transition:'border-color 0.2s'}} onMouseOver={e=>e.currentTarget.style.borderColor='rgba(29,158,117,0.5)'} onMouseOut={e=>e.currentTarget.style.borderColor='rgba(29,158,117,0.2)'}>
            <div style={{fontSize:'1.5rem',marginBottom:'0.75rem'}}>🎯</div>
            <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',marginBottom:'0.3rem'}}>Hitos del proyecto</div>
            <div style={{fontSize:'0.78rem',color:'#8FA3CC',marginBottom:'1rem',lineHeight:'1.5'}}>Registra y marca los hitos del expediente</div>
            <div style={{fontSize:'0.78rem',color:'#1D9E75',fontWeight:'600'}}>Ver hitos →</div>
          </a>

          {misproyectos.length > 0 && (
            <a href="/admin" style={{textDecoration:'none',display:'block',background:'rgba(232,160,32,0.06)',border:'1px solid rgba(232,160,32,0.25)',borderRadius:'14px',padding:'1.5rem',transition:'border-color 0.2s'}} onMouseOver={e=>e.currentTarget.style.borderColor='rgba(232,160,32,0.5)'} onMouseOut={e=>e.currentTarget.style.borderColor='rgba(232,160,32,0.25)'}>
              <div style={{fontSize:'1.5rem',marginBottom:'0.75rem'}}>⚙️</div>
              <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',marginBottom:'0.3rem'}}>Panel fundador</div>
              <div style={{fontSize:'0.78rem',color:'#8FA3CC',marginBottom:'1rem',lineHeight:'1.5'}}>{misproyectos.length} proyecto{misproyectos.length!==1?'s':''} publicado{misproyectos.length!==1?'s':''}</div>
              <div style={{fontSize:'0.78rem',color:'#E8A020',fontWeight:'600'}}>Ver postulaciones recibidas →</div>
            </a>
          )}

        </div>

        {!perfil?.rol_principal && (
          <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
            <div>
              <div style={{fontSize:'0.9rem',fontWeight:'700',color:'#fff',marginBottom:'0.3rem'}}>Completa tu perfil</div>
              <div style={{fontSize:'0.8rem',color:'#8FA3CC'}}>Cuéntanos quién eres para aparecer en el directorio de Escala.</div>
            </div>
            <a href="/onboarding" style={{background:'#1D9E75',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.875rem',fontWeight:'700',whiteSpace:'nowrap'}}>Completar perfil →</a>
          </div>
        )}

        {perfil?.rol_principal && (
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem'}}>
            <div style={{fontSize:'0.82rem',fontWeight:'700',color:'#fff',marginBottom:'1rem',paddingBottom:'0.75rem',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>Tu perfil</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem'}}>
              <div><div style={{fontSize:'0.65rem',fontWeight:'700',color:'#8FA3CC',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.2rem'}}>Nombre</div><div style={{fontSize:'0.875rem',color:'#fff'}}>{perfil.nombre}</div></div>
              <div><div style={{fontSize:'0.65rem',fontWeight:'700',color:'#8FA3CC',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.2rem'}}>Ciudad</div><div style={{fontSize:'0.875rem',color:'#fff'}}>{perfil.ciudad || '—'}</div></div>
              <div><div style={{fontSize:'0.65rem',fontWeight:'700',color:'#8FA3CC',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.2rem'}}>Perfil</div><div style={{fontSize:'0.875rem',color:'#fff'}}>{rolLabels[perfil.rol_principal]}</div></div>
              <div><div style={{fontSize:'0.65rem',fontWeight:'700',color:'#8FA3CC',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.2rem'}}>Especialidad</div><div style={{fontSize:'0.875rem',color:'#fff'}}>{perfil.especialidad || '—'}</div></div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
