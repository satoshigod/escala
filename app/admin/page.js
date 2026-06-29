'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Admin() {
  const [usuario, setUsuario] = useState(null)
  const [proyectos, setProyectos] = useState([])
  const [postulaciones, setPostulaciones] = useState({})
  const [cargando, setCargando] = useState(true)
  const [actualizando, setActualizando] = useState(null)
  const [proyectoSel, setProyectoSel] = useState(null)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro'; return }
      setUsuario(user)

      const res = await fetch('/api/proyectos')
      const data = await res.json()
      const misproyectos = (data.proyectos || []).filter(p => p.fundador_id === user.id)
      setProyectos(misproyectos)

      if (misproyectos.length > 0) {
        setProyectoSel(misproyectos[0].id)
        await cargarPostulaciones(misproyectos[0].id)
      }
      setCargando(false)
    }
    cargar()
  }, [])

  async function cargarPostulaciones(proyecto_id) {
    const roles_res = await fetch('/api/roles?proyecto_id=' + proyecto_id)
    const roles_data = await roles_res.json()
    const roles = roles_data.roles || []

    const posts = {}
    await Promise.all(roles.map(async rol => {
      const res = await fetch('/api/postulaciones?rol_id=' + rol.id)
      const data = await res.json()
      if (data.postulaciones && data.postulaciones.length > 0) {
        posts[rol.nombre] = data.postulaciones
      }
    }))
    setPostulaciones(posts)
  }

  async function cambiarEstado(id, estado, rol_nombre) {
    setActualizando(id)
    await fetch('/api/postulaciones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, estado })
    })
    setPostulaciones(prev => ({
      ...prev,
      [rol_nombre]: prev[rol_nombre].map(p => p.id === id ? { ...p, estado } : p)
    }))
    setActualizando(null)
  }

  async function seleccionarProyecto(id) {
    setProyectoSel(id)
    setPostulaciones({})
    await cargarPostulaciones(id)
  }

  const estadoColor = { pendiente: '#E8A020', aceptada: '#1D9E75', rechazada: '#D85A30' }
  const estadoLabel = { pendiente: '⏳ Pendiente', aceptada: '✅ Aceptada', rechazada: '✗ Rechazada' }

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando panel...
    </div>
  )

  const totalPost = Object.values(postulaciones).reduce((a, b) => a + b.length, 0)
  const pendientes = Object.values(postulaciones).flat().filter(p => p.estado === 'pendiente').length

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff'}}>Esca<span style={{color:'#1D9E75'}}>la</span></div>
        <div style={{display:'flex',gap:'1.5rem'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Dashboard</a>
          <a href="/hitos" style={{color:"#8FA3CC",fontSize:"0.82rem",textDecoration:"none"}}>Hitos</a><a href="/proyectos" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Proyectos</a>
          <a href="/postulaciones" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Mis postulaciones</a>
          <a href="/admin" style={{color:'#fff',fontSize:'0.82rem',fontWeight:'600',textDecoration:'none'}}>Panel fundador</a>
        </div>
      </nav>

      <main style={{maxWidth:'1000px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'2rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#E8A020',marginBottom:'0.4rem'}}>Panel del fundador</div>
          <div style={{fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Postulaciones recibidas</div>
          <div style={{fontSize:'0.85rem',color:'#8FA3CC',marginTop:'0.3rem'}}>{totalPost} postulación{totalPost !== 1 ? 'es' : ''} · {pendientes} pendiente{pendientes !== 1 ? 's' : ''}</div>
        </div>

        {proyectos.length === 0 ? (
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.12)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
            <div style={{fontSize:'2rem',marginBottom:'1rem'}}>🚀</div>
            <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.5rem'}}>No tienes proyectos publicados</div>
            <div style={{color:'#8FA3CC',fontSize:'0.85rem',marginBottom:'1.5rem'}}>Publica tu primer proyecto para empezar a recibir postulaciones.</div>
            <a href="/hitos" style={{color:"#8FA3CC",fontSize:"0.82rem",textDecoration:"none"}}>Hitos</a><a href="/proyectos" style={{background:'#1D9E75',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.875rem',fontWeight:'700'}}>Publicar proyecto →</a>
          </div>
        ) : (
          <>
            {proyectos.length > 1 && (
              <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap',marginBottom:'1.5rem'}}>
                {proyectos.map(p => (
                  <button key={p.id} onClick={() => seleccionarProyecto(p.id)} style={{background: proyectoSel === p.id ? '#1D9E75' : 'rgba(255,255,255,0.05)', color: proyectoSel === p.id ? '#fff' : '#8FA3CC', border: proyectoSel === p.id ? 'none' : '1px solid rgba(255,255,255,0.12)', borderRadius:'8px', padding:'0.5rem 1rem', fontSize:'0.82rem', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif'}}>
                    {p.nombre}
                  </button>
                ))}
              </div>
            )}

            {Object.keys(postulaciones).length === 0 ? (
              <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.12)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
                <div style={{fontSize:'2rem',marginBottom:'1rem'}}>📭</div>
                <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.5rem'}}>Sin postulaciones todavía</div>
                <div style={{color:'#8FA3CC',fontSize:'0.85rem'}}>Comparte el link de tu proyecto para recibir postulaciones.</div>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'2rem'}}>
                {Object.entries(postulaciones).map(([rol, posts]) => (
                  <div key={rol}>
                    <div style={{fontSize:'0.9rem',fontWeight:'700',color:'#fff',marginBottom:'0.875rem',paddingBottom:'0.75rem',borderBottom:'1px solid rgba(255,255,255,0.08)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span>{rol}</span>
                      <span style={{fontSize:'0.72rem',color:'#8FA3CC',fontWeight:'400'}}>{posts.length} postulación{posts.length !== 1 ? 'es' : ''}</span>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                      {posts.map(p => (
                        <div key={p.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
                          <div>
                            <div style={{fontSize:'0.9rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>{p.perfiles?.nombre || 'Usuario'}</div>
                            <div style={{fontSize:'0.75rem',color:'#8FA3CC'}}>{p.perfiles?.ciudad || ''} · {p.perfiles?.rol_principal || ''}</div>
                            <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Score: {p.perfiles?.escala_score || 0} · {new Date(p.created_at).toLocaleDateString('es-CO')}</div>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:'0.75rem',flexWrap:'wrap'}}>
                            <span style={{fontSize:'0.75rem',fontWeight:'700',padding:'0.3rem 0.875rem',borderRadius:'20px',background:`rgba(${p.estado==='aceptada'?'29,158,117':p.estado==='rechazada'?'216,90,48':'232,160,32'},0.15)`,color:estadoColor[p.estado]}}>
                              {estadoLabel[p.estado]}
                            </span>
                            {p.estado === 'pendiente' && (
                              <>
                                <button onClick={() => cambiarEstado(p.id, 'aceptada', rol)} disabled={actualizando === p.id} style={{background:'rgba(29,158,117,0.15)',color:'#1D9E75',border:'1px solid rgba(29,158,117,0.3)',borderRadius:'6px',padding:'0.4rem 0.875rem',fontSize:'0.78rem',fontWeight:'600',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                                  Aceptar
                                </button>
                                <button onClick={() => cambiarEstado(p.id, 'rechazada', rol)} disabled={actualizando === p.id} style={{background:'rgba(216,90,48,0.1)',color:'#D85A30',border:'1px solid rgba(216,90,48,0.25)',borderRadius:'6px',padding:'0.4rem 0.875rem',fontSize:'0.78rem',fontWeight:'600',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                                  Rechazar
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
