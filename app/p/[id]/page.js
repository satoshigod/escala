'use client'
import { useState, useEffect } from 'react'

const modalidadLabels = {
  equity: 'Equity', deuda_diferida: 'Deuda diferida', success_fee: 'Success Fee',
  hibrido: 'Hibrido', regalias: 'Regalias', bonos_hitos: 'Bonos por hitos',
  nueva_unidad: 'Nueva unidad', convertible: 'Deuda convertible'
}

export default function ProyectoPublico() {
  const [proyecto, setProyecto] = useState(null)
  const [roles, setRoles] = useState([])
  const [hitos, setHitos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const pid = window.location.pathname.split('/').pop()
      const [r1, r2, r3] = await Promise.all([
        fetch('/api/proyectos/' + pid),
        fetch('/api/roles?proyecto_id=' + pid),
        fetch('/api/hitos?proyecto_id=' + pid)
      ])
      const d1 = await r1.json()
      const d2 = await r2.json()
      const d3 = await r3.json()
      setProyecto(d1.proyecto || null)
      setRoles(d2.roles || [])
      setHitos((d3.hitos || []).filter(h => h.completado))
      setCargando(false)
    }
    cargar()
  }, [])

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>Cargando...</div>
  )

  if (!proyecto) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif',gap:'1rem'}}>
      <div style={{color:'#fff',fontWeight:'700'}}>Proyecto no encontrado</div>
      <a href="/proyectos" style={{color:'#1D9E75',textDecoration:'none'}}>Ver proyectos</a>
    </div>
  )

  const rolesAbiertos = roles.filter(r => r.estado === 'abierto')

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff'}}>Esca<span style={{color:'#1D9E75'}}>la</span></div>
        <div style={{display:'flex',gap:'1rem'}}>
          <a href="/registro" style={{background:'rgba(255,255,255,0.08)',color:'#fff',padding:'0.4rem 1rem',borderRadius:'6px',textDecoration:'none',fontSize:'0.82rem',fontWeight:'600'}}>Registrarme</a>
          <a href="/registro" style={{background:'#1D9E75',color:'#fff',padding:'0.4rem 1rem',borderRadius:'6px',textDecoration:'none',fontSize:'0.82rem',fontWeight:'700'}}>Iniciar sesion</a>
        </div>
      </nav>

      <main style={{maxWidth:'900px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{background:'linear-gradient(135deg,rgba(29,158,117,0.12),rgba(83,74,183,0.08))',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'16px',padding:'2.5rem',marginBottom:'2rem'}}>
          <div style={{fontSize:'0.68rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.5rem'}}>
            Tipo {proyecto.tipo} — {proyecto.tipo==='A'?'Empresa nueva':'Transformacion'} · {proyecto.sector} · {proyecto.ciudad}
          </div>
          <div style={{fontSize:'clamp(1.8rem,4vw,2.5rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em',lineHeight:'1.1',marginBottom:'0.75rem'}}>{proyecto.nombre}</div>
          <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginBottom:'1.5rem'}}>
            <span style={{fontSize:'0.72rem',fontWeight:'700',padding:'0.2rem 0.75rem',borderRadius:'20px',background:'rgba(29,158,117,0.15)',color:'#1D9E75',border:'1px solid rgba(29,158,117,0.3)'}}>● {proyecto.estado}</span>
            <span style={{fontSize:'0.72rem',fontWeight:'700',padding:'0.2rem 0.75rem',borderRadius:'20px',background:'rgba(255,255,255,0.08)',color:'#8FA3CC'}}>{rolesAbiertos.length} roles abiertos</span>
          </div>
          <div style={{fontSize:'1rem',color:'#C8D4E8',lineHeight:'1.8',marginBottom:'2rem'}}>{proyecto.descripcion}</div>

          <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'10px',padding:'1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
            <div>
              <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>¿Te interesa este proyecto?</div>
              <div style={{fontSize:'0.78rem',color:'#8FA3CC'}}>Crea tu cuenta en Escala y postulate a uno de los roles disponibles.</div>
            </div>
            <a href="/registro" style={{background:'#1D9E75',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.875rem',fontWeight:'700',whiteSpace:'nowrap'}}>Postularme →</a>
          </div>
        </div>

        {hitos.length > 0 && (
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem',marginBottom:'2rem'}}>
            <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#1D9E75',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'1rem'}}>Avance del proyecto</div>
            {hitos.map(h => (
              <div key={h.id} style={{display:'flex',gap:'0.75rem',alignItems:'center',padding:'0.5rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <div style={{width:'18px',height:'18px',borderRadius:'50%',background:'#1D9E75',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.6rem',color:'#fff',flexShrink:0}}>✓</div>
                <div style={{fontSize:'0.82rem',color:'#C8D4E8'}}>{h.nombre}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{marginBottom:'2rem'}}>
          <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#8FA3CC',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'1rem'}}>Roles disponibles</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'1rem'}}>
            {rolesAbiertos.map(rol => (
              <div key={rol.id} style={{background: rol.es_prioritario ? 'rgba(232,160,32,0.06)' : 'rgba(255,255,255,0.04)',border: rol.es_prioritario ? '1px solid rgba(232,160,32,0.3)' : '1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem'}}>
                <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',marginBottom:'0.4rem'}}>{rol.nombre} {rol.es_prioritario?'🔥':''}</div>
                {rol.descripcion && <div style={{fontSize:'0.78rem',color:'#8FA3CC',lineHeight:'1.5',marginBottom:'0.875rem'}}>{rol.descripcion}</div>}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.875rem'}}>
                  <div style={{fontFamily:'monospace',fontSize:'0.82rem',fontWeight:'600',color:'#fff'}}>{rol.valor_mercado ? '$'+rol.valor_mercado.toLocaleString() : 'A negociar'}</div>
                  <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>{modalidadLabels[rol.modalidad]||rol.modalidad}</div>
                </div>
                <a href="/registro" style={{display:'block',textAlign:'center',background:'#1D9E75',color:'#fff',borderRadius:'8px',padding:'0.6rem',fontSize:'0.82rem',fontWeight:'700',textDecoration:'none'}}>
                  Registrarme para postularme →
                </a>
              </div>
            ))}
          </div>
        </div>

        <div style={{textAlign:'center',padding:'2rem',borderTop:'1px solid rgba(255,255,255,0.08)'}}>
          <div style={{fontSize:'0.82rem',color:'#8FA3CC',marginBottom:'1rem'}}>
            Powered by <strong style={{color:'#fff'}}>Escala</strong> — El sistema operativo para empresas colaborativas en Latinoamerica
          </div>
          <a href="/registro" style={{fontSize:'0.82rem',color:'#1D9E75',textDecoration:'none',fontWeight:'600'}}>Crear mi cuenta en Escala →</a>
        </div>
      </main>
    </div>
  )
}
