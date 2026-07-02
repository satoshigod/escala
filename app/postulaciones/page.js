'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Postulaciones() {
  const [usuario, setUsuario] = useState(null)
  const [postulaciones, setPostulaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [actualizando, setActualizando] = useState(null)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)
      const res = await fetch('/api/postulaciones?postulante_id=' + user.id)
      const data = await res.json()
      setPostulaciones(data.postulaciones || [])
      setCargando(false)
    }
    cargar()
  }, [])

  async function cambiarEstado(id, estado) {
    setActualizando(id)
    await fetch('/api/postulaciones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, estado })
    })
    setPostulaciones(p => p.map(x => x.id === id ? { ...x, estado } : x))
    setActualizando(null)
  }

  const estadoColor = { pendiente: '#E8A020', aceptada: '#1D9E75', rechazada: '#D85A30' }
  const estadoLabel = { pendiente: '⏳ Pendiente', aceptada: '✅ Aceptada', rechazada: '✗ Rechazada' }

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando postulaciones...
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/dashboard" style={{textDecoration:'none'}}><div style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff'}}>Esca<span style={{color:'#1D9E75'}}>la</span></div></a>
        <div style={{display:'flex',gap:'1.5rem'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Dashboard</a>
          <a href="/hitos" style={{color:"#8FA3CC",fontSize:"0.82rem",textDecoration:"none"}}>Hitos</a><a href="/proyectos" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Proyectos</a>
          <a href="/postulaciones" style={{color:'#fff',fontSize:'0.82rem',fontWeight:'600',textDecoration:'none'}}>Postulaciones</a>
        </div>
      </nav>

      <main style={{maxWidth:'800px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'2rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.4rem'}}>Tu actividad</div>
          <div style={{fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Mis postulaciones</div>
          <div style={{fontSize:'0.85rem',color:'#8FA3CC',marginTop:'0.3rem'}}>{postulaciones.length} postulación{postulaciones.length !== 1 ? 'es' : ''} enviada{postulaciones.length !== 1 ? 's' : ''}</div>
        </div>

        {postulaciones.length === 0 ? (
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.12)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
            <div style={{fontSize:'2rem',marginBottom:'1rem'}}>📋</div>
            <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.5rem'}}>Sin postulaciones todavía</div>
            <div style={{color:'#8FA3CC',fontSize:'0.85rem',marginBottom:'1.5rem'}}>Explora los proyectos activos y postúlate a los roles que te interesen.</div>
            <a href="/hitos" style={{color:"#8FA3CC",fontSize:"0.82rem",textDecoration:"none"}}>Hitos</a><a href="/proyectos" style={{background:'#1D9E75',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.875rem',fontWeight:'700'}}>Ver proyectos →</a>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            {postulaciones.map(p => (
              <div key={p.id} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.5rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'0.75rem',marginBottom:'0.875rem'}}>
                  <div>
                    <div style={{fontSize:'1rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>{p.roles?.nombre || 'Rol'}</div>
                    <div style={{fontSize:'0.78rem',color:'#8FA3CC'}}>Proyecto ID: {p.roles?.proyecto_id?.substring(0,8)}...</div>
                  </div>
                  <span style={{fontSize:'0.75rem',fontWeight:'700',padding:'0.3rem 0.875rem',borderRadius:'20px',background:`rgba(${p.estado==='aceptada'?'29,158,117':p.estado==='rechazada'?'216,90,48':'232,160,32'},0.15)`,color:estadoColor[p.estado],border:`1px solid rgba(${p.estado==='aceptada'?'29,158,117':p.estado==='rechazada'?'216,90,48':'232,160,32'},0.3)`}}>
                    {estadoLabel[p.estado]}
                  </span>
                </div>
                <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginBottom:'0.875rem'}}>
                  Enviada el {new Date(p.created_at).toLocaleDateString('es-CO', {day:'numeric',month:'long',year:'numeric'})}
                </div>
                {p.estado === 'pendiente' && (
                  <div style={{display:'flex',gap:'0.5rem'}}>
                    <button onClick={() => cambiarEstado(p.id, 'aceptada')} disabled={actualizando === p.id} style={{background:'rgba(29,158,117,0.15)',color:'#1D9E75',border:'1px solid rgba(29,158,117,0.3)',borderRadius:'6px',padding:'0.4rem 0.875rem',fontSize:'0.78rem',fontWeight:'600',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                      Aceptar
                    </button>
                    <button onClick={() => cambiarEstado(p.id, 'rechazada')} disabled={actualizando === p.id} style={{background:'rgba(216,90,48,0.1)',color:'#D85A30',border:'1px solid rgba(216,90,48,0.25)',borderRadius:'6px',padding:'0.4rem 0.875rem',fontSize:'0.78rem',fontWeight:'600',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                      Declinar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
