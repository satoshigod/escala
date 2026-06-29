'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminEscala() {
  const [usuario, setUsuario] = useState(null)
  const [proyectos, setProyectos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [postulaciones, setPostulaciones] = useState([])
  const [aportes, setAportes] = useState([])
  const [tab, setTab] = useState('proyectos')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro'; return }
      setUsuario(user)

      const [pRes, uRes, postRes] = await Promise.all([
        fetch('/api/proyectos'),
        fetch('/api/usuarios?id=' + user.id),
        fetch('/api/postulaciones?postulante_id=' + user.id)
      ])

      const pData = await pRes.json()
      const postData = await postRes.json()

      setProyectos(pData.proyectos || [])
      setPostulaciones(postData.postulaciones || [])
      setCargando(false)
    }
    cargar()
  }, [])

  const totalValorProyectos = proyectos.reduce((s, p) => s + (p.capital_necesario || 0), 0)

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando panel...
    </div>
  )

  const tabs = ['proyectos', 'postulaciones', 'metricas']
  const tabLabel = { proyectos: '🚀 Proyectos', postulaciones: '📋 Postulaciones', metricas: '📊 Métricas' }

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff'}}>Esca<span style={{color:'#1D9E75'}}>la</span> <span style={{fontSize:'0.7rem',color:'#E8A020',fontWeight:'700',letterSpacing:'0.08em'}}>ADMIN</span></div>
        <div style={{display:'flex',gap:'1.5rem'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Dashboard</a>
          <a href="/desarrollo" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Desarrollo</a>
          <a href="/admin-escala" style={{color:'#fff',fontSize:'0.82rem',fontWeight:'600',textDecoration:'none'}}>Admin</a>
        </div>
      </nav>

      <main style={{maxWidth:'1000px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'2rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#E8A020',marginBottom:'0.4rem'}}>Panel interno</div>
          <div style={{fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Administración Escala</div>
          <div style={{fontSize:'0.85rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Vista interna del estado de la plataforma</div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
          <div style={{background:'rgba(29,158,117,0.1)',border:'1px solid rgba(29,158,117,0.25)',borderRadius:'12px',padding:'1.1rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#1D9E75'}}>{proyectos.length}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Proyectos activos</div>
          </div>
          <div style={{background:'rgba(232,160,32,0.1)',border:'1px solid rgba(232,160,32,0.25)',borderRadius:'12px',padding:'1.1rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#E8A020'}}>{postulaciones.length}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Postulaciones totales</div>
          </div>
          <div style={{background:'rgba(83,74,183,0.1)',border:'1px solid rgba(83,74,183,0.25)',borderRadius:'12px',padding:'1.1rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#AFA9EC'}}>{postulaciones.filter(p=>p.estado==='aceptada').length}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Postulaciones aceptadas</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.1rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#fff'}}>Fase 0</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Estado plataforma</div>
          </div>
        </div>

        <div style={{display:'flex',gap:'0.5rem',marginBottom:'1.5rem',borderBottom:'1px solid rgba(255,255,255,0.08)',paddingBottom:'0'}}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{background:'none',border:'none',borderBottom: tab===t ? '2px solid #1D9E75' : '2px solid transparent',color: tab===t ? '#fff' : '#8FA3CC',padding:'0.5rem 1rem',fontSize:'0.85rem',fontWeight: tab===t ? '600' : '400',cursor:'pointer',fontFamily:'Inter,sans-serif',marginBottom:'-1px',transition:'all 0.2s'}}>
              {tabLabel[t]}
            </button>
          ))}
        </div>

        {tab === 'proyectos' && (
          <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
            {proyectos.length === 0 ? (
              <div style={{color:'#8FA3CC',textAlign:'center',padding:'3rem'}}>Sin proyectos publicados</div>
            ) : proyectos.map(p => (
              <div key={p.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
                <div>
                  <div style={{fontSize:'0.9rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>{p.nombre}</div>
                  <div style={{fontSize:'0.75rem',color:'#8FA3CC'}}>{p.sector} · {p.ciudad} · Tipo {p.tipo}</div>
                  <div style={{fontSize:'0.7rem',color:'#6B7280',marginTop:'0.2rem'}}>ID: {p.id.substring(0,16)}...</div>
                </div>
                <div style={{display:'flex',gap:'0.75rem',alignItems:'center'}}>
                  <span style={{fontSize:'0.72rem',fontWeight:'700',padding:'0.25rem 0.75rem',borderRadius:'20px',background: p.estado==='activo' ? 'rgba(29,158,117,0.15)' : 'rgba(255,255,255,0.06)',color: p.estado==='activo' ? '#1D9E75' : '#8FA3CC'}}>
                    {p.estado}
                  </span>
                  <a href={'/proyectos/' + p.id} style={{fontSize:'0.78rem',color:'#1D9E75',textDecoration:'none',fontWeight:'600'}}>Ver →</a>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'postulaciones' && (
          <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
            {postulaciones.length === 0 ? (
              <div style={{color:'#8FA3CC',textAlign:'center',padding:'3rem'}}>Sin postulaciones</div>
            ) : postulaciones.map(p => (
              <div key={p.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
                <div>
                  <div style={{fontSize:'0.9rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>{p.roles?.nombre || 'Rol'}</div>
                  <div style={{fontSize:'0.75rem',color:'#8FA3CC'}}>{new Date(p.created_at).toLocaleDateString('es-CO')}</div>
                </div>
                <span style={{fontSize:'0.72rem',fontWeight:'700',padding:'0.25rem 0.75rem',borderRadius:'20px',background: p.estado==='aceptada' ? 'rgba(29,158,117,0.15)' : p.estado==='rechazada' ? 'rgba(216,90,48,0.1)' : 'rgba(232,160,32,0.15)',color: p.estado==='aceptada' ? '#1D9E75' : p.estado==='rechazada' ? '#D85A30' : '#E8A020'}}>
                  {p.estado}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === 'metricas' && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'1rem'}}>
            <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem'}}>
              <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#fff',marginBottom:'1rem'}}>Estado del desarrollo</div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem'}}>
                <span style={{fontSize:'0.78rem',color:'#8FA3CC'}}>Completado</span>
                <span style={{fontSize:'0.78rem',fontFamily:'monospace',color:'#1D9E75'}}>44.9%</span>
              </div>
              <div style={{height:'6px',background:'rgba(255,255,255,0.08)',borderRadius:'3px',overflow:'hidden',marginBottom:'1rem'}}>
                <div style={{height:'100%',width:'44.9%',background:'#1D9E75',borderRadius:'3px'}}></div>
              </div>
              <a href="/desarrollo" style={{fontSize:'0.78rem',color:'#1D9E75',textDecoration:'none',fontWeight:'600'}}>Ver plan completo →</a>
            </div>

            <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem'}}>
              <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#fff',marginBottom:'1rem'}}>Recursos del equipo</div>
              <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem'}}>
                  <span style={{color:'#8FA3CC'}}>Roles cubiertos</span>
                  <span style={{color:'#fff',fontFamily:'monospace'}}>1 / 11</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem'}}>
                  <span style={{color:'#8FA3CC'}}>Capital inicial</span>
                  <span style={{color:'#E8A020',fontFamily:'monospace'}}>$1.470.000</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem'}}>
                  <span style={{color:'#8FA3CC'}}>Deuda diferida mes 1</span>
                  <span style={{color:'#AFA9EC',fontFamily:'monospace'}}>$5.645.000</span>
                </div>
              </div>
              <a href="/proyecto-escala.html" style={{display:'inline-block',marginTop:'1rem',fontSize:'0.78rem',color:'#1D9E75',textDecoration:'none',fontWeight:'600'}}>Ver proyecto piloto →</a>
            </div>

            <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem'}}>
              <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#fff',marginBottom:'1rem'}}>Links rápidos</div>
              <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                {[
                  { label: 'Sitio de presentación', url: '/index.html' },
                  { label: 'Plan de desarrollo', url: '/desarrollo' },
                  { label: 'Proyecto piloto', url: '/proyecto-escala.html' },
                  { label: 'Ángel de Impulso', url: '/impulso.html' },
                  { label: 'Panel fundador', url: '/admin' },
                ].map(l => (
                  <a key={l.url} href={l.url} style={{fontSize:'0.78rem',color:'#8FA3CC',textDecoration:'none',display:'flex',justifyContent:'space-between',padding:'0.35rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <span>{l.label}</span><span style={{color:'#1D9E75'}}>→</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
