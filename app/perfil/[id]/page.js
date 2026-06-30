'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function PerfilPublico() {
  const [perfil, setPerfil] = useState(null)
  const [postulaciones, setPostulaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [usuarioActual, setUsuarioActual] = useState(null)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro'; return }
      setUsuarioActual(user)

      const id = window.location.pathname.split('/').pop()

      const [pRes, postRes] = await Promise.all([
        fetch('/api/usuarios?id=' + id),
        fetch('/api/postulaciones?postulante_id=' + id)
      ])

      const pData = await pRes.json()
      const postData = await postRes.json()

      setPerfil(pData.usuario)
      setPostulaciones(postData.postulaciones || [])
      setCargando(false)
    }
    cargar()
  }, [])

  const rolLabels = {
    ideador: '💡 Ideador',
    capitalista: '💰 Capitalista',
    especialista: '🔧 Especialista',
    ejecutor: '⚙️ Ejecutor',
    angel: '🌟 Ángel de Impulso'
  }

  const aceptadas = postulaciones.filter(p => p.estado === 'aceptada').length
  const total = postulaciones.length
  const tasaExito = total > 0 ? Math.round((aceptadas / total) * 100) : 0

  const calcularScore = (perfil, postulaciones) => {
    if (!perfil) return 0
    let score = 0
    if (total > 0) score += Math.round((aceptadas / total) * 40)
    if (perfil.nombre) score += 10
    if (perfil.ciudad) score += 5
    if (perfil.especialidad) score += 10
    if (perfil.lo_que_aporto) score += 10
    if (perfil.lo_que_busco) score += 5
    if (perfil.whatsapp) score += 5
    if (aceptadas > 0) score += 15
    return Math.min(score, 100)
  }

  const score = calcularScore(perfil, postulaciones)
  const scoreColor = score >= 70 ? '#1D9E75' : score >= 40 ? '#E8A020' : '#D85A30'
  const esPropioPerfil = usuarioActual?.id === perfil?.id

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando perfil...
    </div>
  )

  if (!perfil) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif',gap:'1rem'}}>
      <div style={{fontSize:'2rem'}}>👤</div>
      <div style={{color:'#fff',fontWeight:'700'}}>Perfil no encontrado</div>
      <a href="/dashboard" style={{color:'#1D9E75',textDecoration:'none'}}>← Volver</a>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff'}}>Esca<span style={{color:'#1D9E75'}}>la</span></div>
        <div style={{display:'flex',gap:'1.5rem'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Dashboard</a>
          <button onClick={() => window.history.back()} style={{background:'none',border:'none',color:'#8FA3CC',fontSize:'0.82rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>← Volver</button>
        </div>
      </nav>

      <main style={{maxWidth:'800px',margin:'0 auto',padding:'2rem 1.25rem'}}>

        {/* HEADER DEL PERFIL */}
        <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'16px',padding:'2rem',marginBottom:'1.5rem',display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'1.5rem'}}>
          <div style={{flex:1}}>
            <div style={{display:'inline-block',fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.08em',textTransform:'uppercase',color:'#1D9E75',background:'rgba(29,158,117,0.12)',border:'1px solid rgba(29,158,117,0.25)',padding:'0.2rem 0.75rem',borderRadius:'20px',marginBottom:'0.875rem'}}>
              {rolLabels[perfil.rol_principal] || 'Miembro de Escala'}
            </div>
            <div style={{fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em',marginBottom:'0.3rem'}}>
              {perfil.nombre}
            </div>
            <div style={{fontSize:'0.85rem',color:'#8FA3CC',marginBottom:'1rem'}}>
              {perfil.ciudad && `📍 ${perfil.ciudad}`}
              {perfil.especialidad && ` · ${perfil.especialidad}`}
            </div>

            {perfil.lo_que_aporto && (
              <div style={{marginBottom:'0.875rem'}}>
                <div style={{fontSize:'0.68rem',fontWeight:'700',color:'#8FA3CC',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.3rem'}}>Lo que aporta</div>
                <div style={{fontSize:'0.875rem',color:'#C8D4E8',lineHeight:'1.6'}}>{perfil.lo_que_aporto}</div>
              </div>
            )}

            {perfil.lo_que_busco && (
              <div style={{marginBottom: (perfil.idiomas?.length || perfil.disponibilidad || perfil.reconocimientos?.length) ? '0.875rem' : 0}}>
                <div style={{fontSize:'0.68rem',fontWeight:'700',color:'#8FA3CC',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.3rem'}}>Lo que busca</div>
                <div style={{fontSize:'0.875rem',color:'#C8D4E8',lineHeight:'1.6'}}>{perfil.lo_que_busco}</div>
              </div>
            )}

            {(perfil.idiomas?.length > 0 || perfil.disponibilidad) && (
              <div style={{display:'flex',gap:'1.5rem',flexWrap:'wrap',marginBottom: perfil.reconocimientos?.length > 0 ? '0.875rem' : 0}}>
                {perfil.idiomas?.length > 0 && (
                  <div>
                    <div style={{fontSize:'0.68rem',fontWeight:'700',color:'#8FA3CC',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.3rem'}}>Idiomas</div>
                    <div style={{fontSize:'0.82rem',color:'#C8D4E8'}}>{perfil.idiomas.join(' · ')}</div>
                  </div>
                )}
                {perfil.disponibilidad && (
                  <div>
                    <div style={{fontSize:'0.68rem',fontWeight:'700',color:'#8FA3CC',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.3rem'}}>Disponibilidad</div>
                    <div style={{fontSize:'0.82rem',color:'#C8D4E8'}}>
                      {{tiempo_completo:'Tiempo completo',medio_tiempo:'Medio tiempo',pocas_horas:'Pocas horas',fines_semana:'Fines de semana'}[perfil.disponibilidad] || perfil.disponibilidad}
                    </div>
                  </div>
                )}
              </div>
            )}

            {perfil.reconocimientos?.length > 0 && (
              <div>
                <div style={{fontSize:'0.68rem',fontWeight:'700',color:'#8FA3CC',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.4rem'}}>Reconocimientos</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:'0.4rem'}}>
                  {perfil.reconocimientos.map((r,i) => (
                    <span key={i} style={{fontSize:'0.75rem',color:'#E8A020',background:'rgba(232,160,32,0.1)',border:'1px solid rgba(232,160,32,0.25)',borderRadius:'20px',padding:'0.25rem 0.75rem'}}>🏆 {r}</span>
                  ))}
                </div>
              </div>
            )}

            {esPropioPerfil && (
              <a href="/perfil/editar" style={{display:'inline-block',marginTop:'1.25rem',fontSize:'0.78rem',color:'#1D9E75',textDecoration:'none',fontWeight:'600'}}>✏️ Editar mi perfil →</a>
            )}
          </div>

          {/* SCORE CIRCULAR */}
          <div style={{textAlign:'center'}}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8"/>
              <circle cx="50" cy="50" r="42" fill="none" stroke={scoreColor} strokeWidth="8"
                strokeDasharray={`${(score/100) * 264} 264`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div style={{marginTop:'-60px',marginBottom:'40px'}}>
              <div style={{fontFamily:'monospace',fontSize:'1.5rem',fontWeight:'900',color:'#fff',lineHeight:'1'}}>{score}</div>
              <div style={{fontSize:'0.65rem',color:'#8FA3CC'}}>Score</div>
            </div>
          </div>
        </div>

        {/* MÉTRICAS */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#1D9E75'}}>{aceptadas}</div>
            <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Participaciones activas</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#E8A020'}}>{tasaExito}%</div>
            <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Tasa de aceptación</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#AFA9EC'}}>{perfil.proyectos_completados || 0}</div>
            <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Proyectos completados</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#fff'}}>{total}</div>
            <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Total postulaciones</div>
          </div>
          {perfil.metricas?.horasAportadas > 0 && (
            <div style={{background:'rgba(29,158,117,0.06)',border:'1px solid rgba(29,158,117,0.15)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
              <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#1D9E75'}}>${perfil.metricas.horasAportadas.toLocaleString()}</div>
              <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Valor en horas aportadas</div>
            </div>
          )}
          {perfil.metricas?.valorGenerado > 0 && (
            <div style={{background:'rgba(232,160,32,0.06)',border:'1px solid rgba(232,160,32,0.15)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
              <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#E8A020'}}>${perfil.metricas.valorGenerado.toLocaleString()}</div>
              <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Valor generado validado</div>
            </div>
          )}
        </div>

        {/* CONTACTO — solo visible para fundadores */}
        {perfil.whatsapp && !esPropioPerfil && (
          <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.5rem',marginBottom:'1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
            <div>
              <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>Contactar directamente</div>
              <div style={{fontSize:'0.78rem',color:'#8FA3CC'}}>Escríbele por WhatsApp para avanzar en la postulación</div>
            </div>
            <a
              href={'https://wa.me/' + perfil.whatsapp.replace(/\D/g,'') + '?text=' + encodeURIComponent('Hola ' + perfil.nombre + ', vi tu postulación en Escala y me gustaría hablar contigo.')}
              target="_blank"
              style={{background:'#1D9E75',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.875rem',fontWeight:'700',whiteSpace:'nowrap'}}
            >
              📲 WhatsApp
            </a>
          </div>
        )}

        {/* HISTORIAL DE POSTULACIONES */}
        {postulaciones.length > 0 && (
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem'}}>
            <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff',marginBottom:'1rem',paddingBottom:'0.75rem',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
              Historial en Escala
            </div>
            {postulaciones.slice(0,5).map(p => (
              <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.75rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)',flexWrap:'wrap',gap:'0.5rem'}}>
                <div>
                  <div style={{fontSize:'0.82rem',fontWeight:'600',color:'#fff'}}>{p.roles?.nombre || 'Rol'}</div>
                  <div style={{fontSize:'0.7rem',color:'#8FA3CC'}}>{new Date(p.created_at).toLocaleDateString('es-CO')}</div>
                </div>
                <span style={{fontSize:'0.7rem',fontWeight:'700',padding:'0.2rem 0.7rem',borderRadius:'20px',background: p.estado==='aceptada' ? 'rgba(29,158,117,0.15)' : p.estado==='rechazada' ? 'rgba(216,90,48,0.1)' : 'rgba(232,160,32,0.15)',color: p.estado==='aceptada' ? '#1D9E75' : p.estado==='rechazada' ? '#D85A30' : '#E8A020'}}>
                  {p.estado}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
