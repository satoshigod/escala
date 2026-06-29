'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function ProyectoDetalle() {
  const [proyecto, setProyecto] = useState(null)
  const [roles, setRoles] = useState([])
  const [cargando, setCargando] = useState(true)
  const [usuario, setUsuario] = useState(null)
  const [msgRol, setMsgRol] = useState({})
  const [postulando, setPostulando] = useState(null)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro'; return }
      setUsuario(user)
      const pid = window.location.pathname.split('/').pop()
      const [r1, r2] = await Promise.all([
        fetch('/api/proyectos/' + pid),
        fetch('/api/roles?proyecto_id=' + pid)
      ])
      const d1 = await r1.json()
      const d2 = await r2.json()
      setProyecto(d1.proyecto || null)
      setRoles(d2.roles || [])
      setCargando(false)
    }
    cargar()
  }, [])

  async function postularse(rol) {
    setPostulando(rol.id)
    const res = await fetch('/api/postulaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rol_id: rol.id,
        postulante_id: usuario.id,
        mensaje: 'Me postulo al rol de ' + rol.nombre
      })
    })
    const data = await res.json()
    setMsgRol({ [rol.id]: data.error ? 'Ya te postulaste' : '✅ Enviado' })
    setPostulando(null)
  }

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando...
    </div>
  )

  if (!proyecto) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif',gap:'1rem'}}>
      <div style={{fontSize:'2rem'}}>🔍</div>
      <div style={{color:'#fff',fontWeight:'700'}}>Proyecto no encontrado</div>
      <a href="/proyectos" style={{color:'#1D9E75',textDecoration:'none'}}>← Ver proyectos</a>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff'}}>
          Esca<span style={{color:'#1D9E75'}}>la</span>
        </div>
        <div style={{display:'flex',gap:'1.5rem'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Dashboard</a>
          <a href="/proyectos" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Proyectos</a>
        </div>
      </nav>

      <main style={{maxWidth:'1000px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <a href="/proyectos" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none',display:'inline-block',marginBottom:'1.5rem'}}>
          ← Volver
        </a>

        <div style={{background:'#0A1530',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'2rem',marginBottom:'2rem'}}>
          <div style={{fontSize:'0.68rem',fontWeight:'700',color:'#1D9E75',marginBottom:'0.75rem',letterSpacing:'0.08em',textTransform:'uppercase'}}>
            Tipo {proyecto.tipo} — {proyecto.tipo === 'A' ? 'Creación' : 'Transformación'}
          </div>
          <div style={{fontSize:'clamp(1.5rem,4vw,2.2rem)',fontWeight:'900',color:'#fff',marginBottom:'0.5rem'}}>
            {proyecto.nombre}
          </div>
          <div style={{fontSize:'0.82rem',color:'#8FA3CC',marginBottom:'1.25rem'}}>
            {proyecto.sector} · {proyecto.ciudad} · {proyecto.estado}
          </div>
          <div style={{fontSize:'0.9rem',color:'#C8D4E8',lineHeight:'1.7'}}>
            {proyecto.descripcion}
          </div>
        </div>

        <div style={{fontSize:'1rem',fontWeight:'700',color:'#fff',marginBottom:'1rem',paddingBottom:'0.75rem',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          Roles disponibles
        </div>

        {roles.length === 0 ? (
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.12)',borderRadius:'12px',padding:'2.5rem',textAlign:'center',color:'#8FA3CC'}}>
            Sin roles publicados aún.
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1rem'}}>
            {roles.map(rol => (
              <div key={rol.id} style={{
                background:'rgba(255,255,255,0.04)',
                border: rol.es_prioritario ? '1px solid rgba(232,160,32,0.3)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius:'12px',
                padding:'1.25rem'
              }}>
                <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',marginBottom:'0.5rem'}}>
                  {rol.nombre} {rol.es_prioritario ? '🔥' : ''}
                </div>
                {rol.descripcion && (
                  <div style={{fontSize:'0.78rem',color:'#8FA3CC',lineHeight:'1.5',marginBottom:'0.875rem'}}>
                    {rol.descripcion}
                  </div>
                )}
                <div style={{fontFamily:'monospace',fontSize:'0.82rem',color:'#fff',marginBottom:'0.25rem'}}>
                  {rol.valor_mercado ? '$' + rol.valor_mercado.toLocaleString() : 'A negociar'}
                </div>
                <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginBottom:'0.875rem'}}>
                  {rol.modalidad}
                </div>
                {rol.estado === 'abierto' ? (
                  <div>
                    <button
                      onClick={() => postularse(rol)}
                      disabled={postulando === rol.id}
                      style={{width:'100%',background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7rem',fontSize:'0.82rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}
                    >
                      {postulando === rol.id ? 'Enviando...' : 'Postularme →'}
                    </button>
                    {msgRol[rol.id] && (
                      <div style={{marginTop:'0.5rem',fontSize:'0.75rem',color: msgRol[rol.id].includes('✅') ? '#1D9E75' : '#D85A30',textAlign:'center'}}>
                        {msgRol[rol.id]}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{textAlign:'center',fontSize:'0.78rem',color:'#1D9E75',fontWeight:'600'}}>
                    ✓ Cubierto
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
