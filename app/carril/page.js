'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const carriles = [
  {
    id: 'A',
    nombre: 'Carril A — Extraordinario',
    desc: 'El aporte fue excepcional. El especialista se convierte en socio accionista.',
    compensacion: 'Equity al precio de mercado completo',
    color: '#1D9E75',
    bg: 'rgba(29,158,117,0.1)',
    border: 'rgba(29,158,117,0.3)',
  },
  {
    id: 'B',
    nombre: 'Carril B — Normal',
    desc: 'El aporte cumplió lo esperado. Se paga el precio pactado más experiencia y red.',
    compensacion: '50% del precio de mercado',
    color: '#E8A020',
    bg: 'rgba(232,160,32,0.1)',
    border: 'rgba(232,160,32,0.3)',
  },
  {
    id: 'C',
    nombre: 'Carril C — Sale del proyecto',
    desc: 'El proyecto decide que el especialista no continúa como socio.',
    compensacion: 'Precio de mercado completo en efectivo',
    color: '#D85A30',
    bg: 'rgba(216,90,48,0.1)',
    border: 'rgba(216,90,48,0.3)',
  },
]

export default function Carril() {
  const [usuario, setUsuario] = useState(null)
  const [proyectos, setProyectos] = useState([])
  const [postulaciones, setPostulaciones] = useState([])
  const [seleccionados, setSeleccionados] = useState({})
  const [guardados, setGuardados] = useState({})
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(null)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro'; return }
      setUsuario(user)

      const [pRes, postRes] = await Promise.all([
        fetch('/api/proyectos'),
        fetch('/api/postulaciones?postulante_id=' + user.id)
      ])

      const pData = await pRes.json()
      const postData = await postRes.json()

      const misproyectos = (pData.proyectos || []).filter(p => p.fundador_id === user.id)
      setProyectos(misproyectos)

      const aceptadas = (postData.postulaciones || []).filter(p => p.estado === 'aceptada')
      setPostulaciones(aceptadas)

      setCargando(false)
    }
    cargar()
  }, [])

  async function guardarCarril(postulacion_id, carril) {
    setGuardando(postulacion_id)
    await fetch('/api/postulaciones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: postulacion_id, estado: 'aceptada', carril })
    })
    setGuardados(g => ({ ...g, [postulacion_id]: carril }))
    setGuardando(null)
  }

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando...
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff'}}>Esca<span style={{color:'#1D9E75'}}>la</span></div>
        <div style={{display:'flex',gap:'1.5rem'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Dashboard</a>
          <a href="/admin" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Panel fundador</a>
          <a href="/carril" style={{color:'#fff',fontSize:'0.82rem',fontWeight:'600',textDecoration:'none'}}>Definir carril</a>
        </div>
      </nav>

      <main style={{maxWidth:'900px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'2rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#E8A020',marginBottom:'0.4rem'}}>Modelo de compensación</div>
          <div style={{fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Definir carril de compensación</div>
          <div style={{fontSize:'0.85rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Cuando el capitalista llega, ejecutor y capitalista definen juntos el carril de cada especialista.</div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:'1rem',marginBottom:'2.5rem'}}>
          {carriles.map(c => (
            <div key={c.id} style={{background:c.bg,border:`1px solid ${c.border}`,borderRadius:'12px',padding:'1.25rem',position:'relative',overflow:'hidden'}}>
              <div style={{fontFamily:'monospace',fontSize:'3rem',fontWeight:'700',color:c.color,opacity:0.15,position:'absolute',top:0,right:'0.75rem',lineHeight:1}}>{c.id}</div>
              <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#fff',marginBottom:'0.3rem'}}>{c.nombre}</div>
              <div style={{fontSize:'0.75rem',color:'#8FA3CC',marginBottom:'0.5rem',lineHeight:'1.5'}}>{c.desc}</div>
              <div style={{fontSize:'0.72rem',fontWeight:'600',color:c.color}}>{c.compensacion}</div>
            </div>
          ))}
        </div>

        <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff',marginBottom:'1rem',paddingBottom:'0.75rem',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          Postulaciones aceptadas — definir carril
        </div>

        {postulaciones.length === 0 ? (
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.12)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
            <div style={{fontSize:'2rem',marginBottom:'1rem'}}>📋</div>
            <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.5rem'}}>Sin postulaciones aceptadas</div>
            <div style={{color:'#8FA3CC',fontSize:'0.85rem',marginBottom:'1.5rem'}}>Los carriles se definen cuando hay especialistas con postulaciones aceptadas en tus proyectos.</div>
            <a href="/proyectos" style={{background:'#1D9E75',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.875rem',fontWeight:'700'}}>Ver proyectos →</a>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            {postulaciones.map(p => (
              <div key={p.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'1rem',marginBottom:'1.25rem'}}>
                  <div>
                    <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>{p.roles?.nombre || 'Rol'}</div>
                    <div style={{fontSize:'0.75rem',color:'#8FA3CC'}}>Postulación aceptada · {new Date(p.created_at).toLocaleDateString('es-CO')}</div>
                  </div>
                  {guardados[p.id] && (
                    <span style={{fontSize:'0.78rem',fontWeight:'700',padding:'0.3rem 0.875rem',borderRadius:'20px',background: guardados[p.id]==='A' ? 'rgba(29,158,117,0.15)' : guardados[p.id]==='B' ? 'rgba(232,160,32,0.15)' : 'rgba(216,90,48,0.1)', color: guardados[p.id]==='A' ? '#1D9E75' : guardados[p.id]==='B' ? '#E8A020' : '#D85A30'}}>
                      ✓ Carril {guardados[p.id]} definido
                    </span>
                  )}
                </div>

                <div style={{fontSize:'0.72rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.75rem',letterSpacing:'0.04em',textTransform:'uppercase'}}>Seleccionar carril</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.5rem'}}>
                  {carriles.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSeleccionados(s => ({ ...s, [p.id]: c.id }))
                        guardarCarril(p.id, c.id)
                      }}
                      disabled={guardando === p.id}
                      style={{
                        background: seleccionados[p.id] === c.id || guardados[p.id] === c.id ? c.bg : 'rgba(255,255,255,0.04)',
                        border: seleccionados[p.id] === c.id || guardados[p.id] === c.id ? `2px solid ${c.color}` : '1px solid rgba(255,255,255,0.1)',
                        borderRadius:'8px',
                        padding:'0.75rem',
                        cursor:'pointer',
                        fontFamily:'Inter,sans-serif',
                        transition:'all 0.2s'
                      }}
                    >
                      <div style={{fontFamily:'monospace',fontSize:'1.1rem',fontWeight:'700',color:c.color,marginBottom:'0.2rem'}}>{c.id}</div>
                      <div style={{fontSize:'0.72rem',color:'#fff',fontWeight:'600'}}>{c.id === 'A' ? 'Extraordinario' : c.id === 'B' ? 'Normal' : 'Sale'}</div>
                    </button>
                  ))}
                </div>

                {seleccionados[p.id] && (
                  <div style={{marginTop:'0.875rem',padding:'0.75rem',borderRadius:'8px',background: carriles.find(c=>c.id===seleccionados[p.id])?.bg,border:`1px solid ${carriles.find(c=>c.id===seleccionados[p.id])?.border}`}}>
                    <div style={{fontSize:'0.78rem',color:'#fff',fontWeight:'600',marginBottom:'0.2rem'}}>{carriles.find(c=>c.id===seleccionados[p.id])?.nombre}</div>
                    <div style={{fontSize:'0.75rem',color:'#8FA3CC'}}>{carriles.find(c=>c.id===seleccionados[p.id])?.compensacion}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'12px',padding:'1.25rem',marginTop:'2rem'}}>
          <div style={{fontSize:'0.75rem',fontWeight:'700',color:'#8FA3CC',marginBottom:'0.5rem',letterSpacing:'0.04em',textTransform:'uppercase'}}>Regla del modelo</div>
          <div style={{fontSize:'0.82rem',color:'#8FA3CC',lineHeight:'1.6'}}>En ningún escenario el especialista pierde por haber tomado el riesgo. Carril A: equity completo. Carril B: 50% pactado + experiencia + red. Carril C: precio de mercado completo en efectivo.</div>
        </div>
      </main>
    </div>
  )
}
