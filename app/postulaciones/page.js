'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Postulaciones() {
  const [usuario, setUsuario] = useState(null)
  const [ofertas, setOfertas] = useState([])
  const [misPostulaciones, setMisPostulaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [actualizando, setActualizando] = useState(null)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)
      const res = await fetch('/api/postulaciones?postulante_id=' + user.id)
      const data = await res.json()
      const todas = data.postulaciones || []
      setOfertas(todas.filter(p => p.origen === 'fundador'))
      setMisPostulaciones(todas.filter(p => p.origen !== 'fundador'))
      setCargando(false)
    }
    cargar()
  }, [])

  async function responderOferta(id, estado) {
    setActualizando(id)
    await fetch('/api/postulaciones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, estado })
    })
    setOfertas(o => o.map(x => x.id === id ? { ...x, estado } : x))
    setActualizando(null)
  }

  const estadoColor = { pendiente: '#E8A020', aceptada: '#1D9E75', rechazada: '#D85A30' }
  const estadoLabel = { pendiente: '⏳ Pendiente', aceptada: '✅ Aceptada', rechazada: '✗ Declinada' }

  function CardBase({ p, children }) {
    return (
      <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.5rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'0.75rem',marginBottom:'0.875rem'}}>
          <div>
            <div style={{fontSize:'1rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>{p.roles?.nombre || 'Rol'}</div>
            <div style={{fontSize:'0.78rem',color:'#8FA3CC'}}>{p.roles?.proyectos?.nombre || 'Proyecto'}</div>
          </div>
          <span style={{fontSize:'0.75rem',fontWeight:'700',padding:'0.3rem 0.875rem',borderRadius:'20px',background:`rgba(${p.estado==='aceptada'?'29,158,117':p.estado==='rechazada'?'216,90,48':'232,160,32'},0.15)`,color:estadoColor[p.estado],border:`1px solid rgba(${p.estado==='aceptada'?'29,158,117':p.estado==='rechazada'?'216,90,48':'232,160,32'},0.3)`}}>
            {estadoLabel[p.estado]}
          </span>
        </div>
        {p.mensaje && p.origen === 'fundador' && (
          <div style={{fontSize:'0.8rem',color:'#C8D4E8',background:'rgba(255,255,255,0.03)',borderLeft:'2px solid rgba(232,160,32,0.4)',borderRadius:'0 8px 8px 0',padding:'0.6rem 0.875rem',marginBottom:'0.875rem',lineHeight:'1.5'}}>
            "{p.mensaje}"
          </div>
        )}
        <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginBottom: children ? '0.875rem' : 0}}>
          {p.origen === 'fundador' ? 'Recibida' : 'Enviada'} el {new Date(p.created_at).toLocaleDateString('es-CO', {day:'numeric',month:'long',year:'numeric'})}
        </div>
        {children}
      </div>
    )
  }

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
          <a href="/proyectos" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Proyectos</a>
          <a href="/postulaciones" style={{color:'#fff',fontSize:'0.82rem',fontWeight:'600',textDecoration:'none'}}>Postulaciones</a>
        </div>
      </nav>

      <main style={{maxWidth:'800px',margin:'0 auto',padding:'2rem 1.25rem'}}>

        {/* OFERTAS RECIBIDAS — invitaciones directas de fundadores; aquí sí decides tú */}
        <div style={{marginBottom:'2.5rem'}}>
          <div style={{marginBottom:'1.25rem'}}>
            <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#E8A020',marginBottom:'0.4rem'}}>Te buscaron a ti</div>
            <div style={{fontSize:'clamp(1.2rem,2.5vw,1.6rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Ofertas recibidas</div>
            <div style={{fontSize:'0.82rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Fundadores que te invitaron directamente a un rol. Tú decides si aceptas.</div>
          </div>

          {ofertas.length === 0 ? (
            <div style={{background:'rgba(255,255,255,0.02)',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.75rem',textAlign:'center'}}>
              <div style={{color:'#8FA3CC',fontSize:'0.82rem'}}>Sin ofertas por ahora. Cuando un fundador te invite a su proyecto, aparecerá aquí.</div>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              {ofertas.map(p => (
                <CardBase key={p.id} p={p}>
                  {p.estado === 'pendiente' && (
                    <div style={{display:'flex',gap:'0.5rem'}}>
                      <button onClick={() => responderOferta(p.id, 'aceptada')} disabled={actualizando === p.id} style={{background:'rgba(29,158,117,0.15)',color:'#1D9E75',border:'1px solid rgba(29,158,117,0.3)',borderRadius:'6px',padding:'0.4rem 0.875rem',fontSize:'0.78rem',fontWeight:'600',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                        Aceptar oferta
                      </button>
                      <button onClick={() => responderOferta(p.id, 'rechazada')} disabled={actualizando === p.id} style={{background:'rgba(216,90,48,0.1)',color:'#D85A30',border:'1px solid rgba(216,90,48,0.25)',borderRadius:'6px',padding:'0.4rem 0.875rem',fontSize:'0.78rem',fontWeight:'600',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                        Declinar
                      </button>
                    </div>
                  )}
                </CardBase>
              ))}
            </div>
          )}
        </div>

        {/* MIS POSTULACIONES — las que tú enviaste; el fundador decide, tú solo consultas */}
        <div>
          <div style={{marginBottom:'1.25rem'}}>
            <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.4rem'}}>Tú aplicaste</div>
            <div style={{fontSize:'clamp(1.2rem,2.5vw,1.6rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Mis postulaciones</div>
            <div style={{fontSize:'0.82rem',color:'#8FA3CC',marginTop:'0.2rem'}}>{misPostulaciones.length} postulación{misPostulaciones.length !== 1 ? 'es' : ''} enviada{misPostulaciones.length !== 1 ? 's' : ''} — el fundador de cada proyecto decide.</div>
          </div>

          {misPostulaciones.length === 0 ? (
            <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.12)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
              <div style={{fontSize:'2rem',marginBottom:'1rem'}}>📋</div>
              <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.5rem'}}>Sin postulaciones todavía</div>
              <div style={{color:'#8FA3CC',fontSize:'0.85rem',marginBottom:'1.5rem'}}>Explora los proyectos activos y postúlate a los roles que te interesen.</div>
              <a href="/proyectos" style={{background:'#1D9E75',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.875rem',fontWeight:'700'}}>Ver proyectos →</a>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              {misPostulaciones.map(p => <CardBase key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
