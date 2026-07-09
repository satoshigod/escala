'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../../lib/supabase'

function getProyectoIdFromPath() {
  const parts = window.location.pathname.split('/').filter(Boolean)
  const idx = parts.indexOf('proyectos')
  return idx !== -1 ? parts[idx + 1] : null
}

function iconoTipo(tipo) {
  if (!tipo) return '📄'
  if (tipo.includes('pdf')) return '📕'
  if (tipo.includes('image')) return '🖼️'
  return '📄'
}

export default function Documentos() {
  const [usuario, setUsuario] = useState(null)
  const [proyecto, setProyecto] = useState(null)
  const [porCategoria, setPorCategoria] = useState({})
  const [cargando, setCargando] = useState(true)
  const [acceso, setAcceso] = useState(false)
  const [categoriaAbierta, setCategoriaAbierta] = useState(null)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)

      const pid = getProyectoIdFromPath()
      if (!pid || pid === 'undefined') { window.location.href = '/proyectos'; return }

      const [pRes, rolesRes, postRes] = await Promise.all([
        fetch('/api/proyectos/' + pid),
        fetch('/api/roles?proyecto_id=' + pid),
        fetch('/api/postulaciones?postulante_id=' + user.id + '&proyecto_id=' + pid)
      ])
      const pData = await pRes.json()
      const rolesData = await rolesRes.json()
      const postData = await postRes.json()

      const proy = pData.proyecto
      const roles = rolesData.roles || []
      const posts = postData.postulaciones || []
      const esFundador = proy?.fundador_id === user.id
      const aceptado = posts.find(p => p.estado === 'aceptada' && roles.some(r => r.id === p.rol_id))

      if (!esFundador && !aceptado) { setAcceso(false); setCargando(false); return }

      setAcceso(true)
      setProyecto(proy)

      const docRes = await fetch('/api/documentos?proyecto_id=' + pid)
      const docData = await docRes.json()
      setPorCategoria(docData.por_categoria || {})
      const categorias = Object.keys(docData.por_categoria || {})
      if (categorias.length > 0) setCategoriaAbierta(categorias[0])

      setCargando(false)
    }
    cargar()
  }, [])

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0B1628',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>Cargando documentación...</div>
  )

  if (!acceso) return (
    <div style={{minHeight:'100vh',background:'#0B1628',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif',gap:'1rem'}}>
      <div style={{fontSize:'2rem'}}>🔒</div>
      <div style={{color:'#fff',fontWeight:'700'}}>Acceso restringido</div>
      <a href="/proyectos" style={{color:'#1D9E75',textDecoration:'none'}}>Ver proyectos</a>
    </div>
  )

  const categorias = Object.keys(porCategoria)
  const totalDocs = categorias.reduce((s, c) => s + porCategoria[c].length, 0)

  return (
    <div style={{minHeight:'100vh',background:'#0B1628',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <a href={'/proyectos/'+proyecto?.id+'/workspace'} style={{color:'#8FA3CC',textDecoration:'none',fontSize:'0.82rem'}}>Workspace</a>
          <span style={{color:'rgba(255,255,255,0.2)'}}>·</span>
          <span style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff'}}>{proyecto?.nombre}</span>
          <span style={{fontSize:'0.75rem',color:'#8FA3CC'}}>Documentación</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <a href={'/proyectos/'+proyecto?.id+'/workspace/tareas'} style={{color:'#8FA3CC',fontSize:'0.78rem',textDecoration:'none'}}>Tareas</a>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.78rem',textDecoration:'none'}}>Dashboard</a>
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/registro?modo=login' }} style={{background:'rgba(216,90,48,0.1)',border:'1px solid rgba(216,90,48,0.25)',color:'#D85A30',fontSize:'0.75rem',fontWeight:'600',padding:'0.3rem 0.75rem',borderRadius:'6px',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Salir</button>
        </div>
      </nav>

      <main style={{maxWidth:'900px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'1.75rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#AFA9EC',marginBottom:'0.4rem'}}>Documentación</div>
          <div style={{fontSize:'clamp(1.3rem,3vw,1.75rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em',marginBottom:'0.3rem'}}>Documentos de la empresa</div>
          <div style={{fontSize:'0.82rem',color:'#8FA3CC'}}>{totalDocs} documento{totalDocs !== 1 ? 's' : ''} · organizados por categoría</div>
        </div>

        {categorias.length === 0 && (
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'2rem',textAlign:'center'}}>
            <div style={{fontSize:'1.75rem',marginBottom:'0.5rem'}}>📁</div>
            <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.3rem'}}>Todavía no hay documentos</div>
            <div style={{color:'#8FA3CC',fontSize:'0.82rem'}}>Cuando alguien adjunte un archivo en la conversación de una tarea (en la pestaña Tareas), va a aparecer aquí, organizado automáticamente.</div>
          </div>
        )}

        <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
          {categorias.map(cat => {
            const docs = porCategoria[cat]
            const abierta = categoriaAbierta === cat
            return (
              <div key={cat} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',overflow:'hidden'}}>
                <div onClick={() => setCategoriaAbierta(abierta ? null : cat)} style={{padding:'1rem 1.25rem',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontSize:'0.9rem',fontWeight:'700',color:'#fff'}}>{cat}</div>
                    <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'2px'}}>{docs.length} documento{docs.length !== 1 ? 's' : ''}</div>
                  </div>
                  <span style={{color:'#8FA3CC',fontSize:'0.75rem'}}>{abierta ? '▲' : '▼'}</span>
                </div>
                {abierta && (
                  <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'0.5rem 0.75rem',display:'flex',flexDirection:'column',gap:'0.4rem'}}>
                    {docs.map(d => (
                      <a key={d.id} href={d.url} target="_blank" rel="noreferrer" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'0.75rem',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:'8px',padding:'0.625rem 0.875rem',textDecoration:'none'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'0.6rem',minWidth:0}}>
                          <span style={{fontSize:'1.1rem',flexShrink:0}}>{iconoTipo(d.tipo)}</span>
                          <div style={{minWidth:0}}>
                            <div style={{fontSize:'0.8rem',fontWeight:'600',color:'#fff',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.nombre}</div>
                            <div style={{fontSize:'0.65rem',color:'#6B7280'}}>
                              {d.subido_perfil?.nombre ? 'Subido por ' + d.subido_perfil.nombre : 'Origen desconocido'}
                              {d.tarea?.nombre ? ' · Tarea: ' + d.tarea.nombre : ''}
                              {' · ' + new Date(d.created_at).toLocaleDateString('es-CO')}
                            </div>
                          </div>
                        </div>
                        <span style={{fontSize:'0.68rem',color:'#4A90D9',flexShrink:0}}>Abrir →</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
