'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Metricas() {
  const [usuario, setUsuario] = useState(null)
  const [proyectos, setProyectos] = useState([])
  const [postulaciones, setPostulaciones] = useState([])
  const [aportes, setAportes] = useState([])
  const [hitos, setHitos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro'; return }
      setUsuario(user)

      const res = await fetch('/api/proyectos')
      const data = await res.json()
      const mios = (data.proyectos || []).filter(p => p.fundador_id === user.id)
      setProyectos(mios)

      if (mios.length > 0) {
        const pid = mios[0].id
        const [rolesRes, hitosRes, aportesRes] = await Promise.all([
          fetch('/api/roles?proyecto_id=' + pid),
          fetch('/api/hitos?proyecto_id=' + pid),
          fetch('/api/aportes?proyecto_id=' + pid)
        ])
        const rolesData = await rolesRes.json()
        const hitosData = await hitosRes.json()
        const aportesData = await aportesRes.json()
        const roles = rolesData.roles || []

        const todasPost = []
        await Promise.all(roles.map(async rol => {
          const r = await fetch('/api/postulaciones?rol_id=' + rol.id)
          const d = await r.json()
          if (d.postulaciones) todasPost.push(...d.postulaciones.map(p => ({...p, rol_nombre: rol.nombre})))
        }))

        setPostulaciones(todasPost)
        setHitos(hitosData.hitos || [])
        setAportes(aportesData.aportes || [])
      }
      setCargando(false)
    }
    cargar()
  }, [])

  const aceptadas = postulaciones.filter(p => p.estado === 'aceptada').length
  const pendientes = postulaciones.filter(p => p.estado === 'pendiente').length
  const rechazadas = postulaciones.filter(p => p.estado === 'rechazada').length
  const tasaConversion = postulaciones.length > 0 ? Math.round((aceptadas/postulaciones.length)*100) : 0
  const hitosComp = hitos.filter(h => h.completado).length
  const totalAportes = aportes.reduce((s,a) => s+(a.valor||0), 0)

  const postPorRol = postulaciones.reduce((acc, p) => {
    acc[p.rol_nombre] = (acc[p.rol_nombre] || 0) + 1
    return acc
  }, {})

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>Cargando metricas...</div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff'}}>Esca<span style={{color:'#1D9E75'}}>la</span></div>
        <div style={{display:'flex',gap:'1.5rem'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Dashboard</a>
          <a href="/admin" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Panel fundador</a>
          <a href="/metricas" style={{color:'#fff',fontSize:'0.82rem',fontWeight:'600',textDecoration:'none'}}>Metricas</a>
        </div>
      </nav>

      <main style={{maxWidth:'1000px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'2rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#E8A020',marginBottom:'0.4rem'}}>Panel del fundador</div>
          <div style={{fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em',marginBottom:'0.3rem'}}>Metricas del proyecto</div>
          <div style={{fontSize:'0.85rem',color:'#8FA3CC'}}>{proyectos[0]?.nombre || 'Tu proyecto'} — {proyectos[0]?.estado}</div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
          {[
            { label: 'Total postulaciones', val: postulaciones.length, color: '#fff', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
            { label: 'Pendientes', val: pendientes, color: '#E8A020', bg: 'rgba(232,160,32,0.08)', border: 'rgba(232,160,32,0.2)' },
            { label: 'Aceptadas', val: aceptadas, color: '#1D9E75', bg: 'rgba(29,158,117,0.08)', border: 'rgba(29,158,117,0.2)' },
            { label: 'Rechazadas', val: rechazadas, color: '#D85A30', bg: 'rgba(216,90,48,0.08)', border: 'rgba(216,90,48,0.15)' },
            { label: 'Tasa de aceptacion', val: tasaConversion+'%', color: '#AFA9EC', bg: 'rgba(175,169,236,0.08)', border: 'rgba(175,169,236,0.2)' },
            { label: 'Hitos completados', val: hitosComp+'/'+hitos.length, color: '#1D9E75', bg: 'rgba(29,158,117,0.08)', border: 'rgba(29,158,117,0.2)' },
            { label: 'Total aportado', val: '$'+totalAportes.toLocaleString(), color: '#1D9E75', bg: 'rgba(29,158,117,0.08)', border: 'rgba(29,158,117,0.2)' },
            { label: 'Miembros del equipo', val: aceptadas+1, color: '#fff', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
          ].map(m => (
            <div key={m.label} style={{background:m.bg,border:'1px solid '+m.border,borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
              <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:m.color,lineHeight:'1'}}>{m.val}</div>
              <div style={{fontSize:'0.68rem',color:'#8FA3CC',marginTop:'0.3rem'}}>{m.label}</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'1.5rem',marginBottom:'2rem'}}>
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem'}}>
            <div style={{fontSize:'0.8rem',fontWeight:'700',color:'#fff',marginBottom:'1rem'}}>Postulaciones por rol</div>
            {Object.keys(postPorRol).length === 0 ? (
              <div style={{color:'#8FA3CC',fontSize:'0.82rem'}}>Sin postulaciones todavia</div>
            ) : Object.entries(postPorRol).sort((a,b)=>b[1]-a[1]).map(([rol, count]) => (
              <div key={rol} style={{marginBottom:'0.75rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem',marginBottom:'4px'}}>
                  <span style={{color:'#fff'}}>{rol}</span>
                  <span style={{color:'#1D9E75',fontFamily:'monospace',fontWeight:'600'}}>{count}</span>
                </div>
                <div style={{height:'6px',background:'rgba(255,255,255,0.08)',borderRadius:'3px',overflow:'hidden'}}>
                  <div style={{height:'100%',width:Math.round((count/postulaciones.length)*100)+'%',background:'#1D9E75',borderRadius:'3px'}}></div>
                </div>
              </div>
            ))}
          </div>

          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem'}}>
            <div style={{fontSize:'0.8rem',fontWeight:'700',color:'#fff',marginBottom:'1rem'}}>Estado del embudo</div>
            {[
              { label: 'Postulaciones recibidas', val: postulaciones.length, color: '#8FA3CC', pct: 100 },
              { label: 'Revisadas (no pendientes)', val: aceptadas+rechazadas, color: '#E8A020', pct: postulaciones.length>0?Math.round(((aceptadas+rechazadas)/postulaciones.length)*100):0 },
              { label: 'Aceptadas al equipo', val: aceptadas, color: '#1D9E75', pct: postulaciones.length>0?Math.round((aceptadas/postulaciones.length)*100):0 },
            ].map(e => (
              <div key={e.label} style={{marginBottom:'0.875rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem',marginBottom:'4px'}}>
                  <span style={{color:'#8FA3CC'}}>{e.label}</span>
                  <span style={{color:e.color,fontFamily:'monospace',fontWeight:'600'}}>{e.val} ({e.pct}%)</span>
                </div>
                <div style={{height:'8px',background:'rgba(255,255,255,0.08)',borderRadius:'4px',overflow:'hidden'}}>
                  <div style={{height:'100%',width:e.pct+'%',background:e.color,borderRadius:'4px'}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
          <a href="/admin" style={{fontSize:'0.78rem',fontWeight:'600',color:'#E8A020',background:'rgba(232,160,32,0.1)',padding:'0.5rem 1rem',borderRadius:'8px',textDecoration:'none'}}>📬 Ver postulaciones</a>
          <a href="/hitos" style={{fontSize:'0.78rem',fontWeight:'600',color:'#1D9E75',background:'rgba(29,158,117,0.1)',padding:'0.5rem 1rem',borderRadius:'8px',textDecoration:'none'}}>🎯 Ver hitos</a>
          <a href="/invitar" style={{fontSize:'0.78rem',fontWeight:'600',color:'#AFA9EC',background:'rgba(175,169,236,0.1)',padding:'0.5rem 1rem',borderRadius:'8px',textDecoration:'none'}}>✉️ Invitar especialistas</a>
          <a href="/directorio" style={{fontSize:'0.78rem',fontWeight:'600',color:'#8FA3CC',background:'rgba(255,255,255,0.06)',padding:'0.5rem 1rem',borderRadius:'8px',textDecoration:'none'}}>👥 Ver directorio</a>
        </div>
      </main>
    </div>
  )
}
