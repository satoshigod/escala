'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Score() {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [postulaciones, setPostulaciones] = useState([])
  const [aportes, setAportes] = useState([])
  const [tareasVerificadas, setTareasVerificadas] = useState(0)
  const [aportesValidados, setAportesValidados] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [calificando, setCalificando] = useState(null)
  const [califs, setCalifs] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [verExplicacion, setVerExplicacion] = useState(false)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)

      const [pRes, postRes, tareasRes, aportesRes] = await Promise.all([
        fetch('/api/usuarios?id=' + user.id),
        fetch('/api/postulaciones?postulante_id=' + user.id),
        supabase.from('tareas').select('id', { count: 'exact', head: true }).eq('asignado_a', user.id).eq('estado', 'verificada'),
        supabase.from('aportes').select('id', { count: 'exact', head: true }).eq('aportante_id', user.id).eq('validado', true),
      ])

      const pData = await pRes.json()
      const postData = await postRes.json()

      setPerfil(pData.usuario)
      setPostulaciones(postData.postulaciones || [])
      setTareasVerificadas(tareasRes.count || 0)
      setAportesValidados(aportesRes.count || 0)
      setCargando(false)
    }
    cargar()
  }, [])

  const score = perfil?.escala_score || 0
  const aceptadas = postulaciones.filter(p => p.estado === 'aceptada').length
  const pendientes = postulaciones.filter(p => p.estado === 'pendiente').length

  const scoreColor = score >= 70 ? '#1D9E75' : score >= 40 ? '#E8A020' : '#D85A30'
  const scoreLabel = score >= 70 ? 'Excelente' : score >= 40 ? 'En desarrollo' : 'Iniciando'
  const pctGauge = Math.min(score, 100)

  // Refleja exactamente la fórmula real de calcular_escala_score() en la base de datos:
  // (tareas_verificadas × 10) + (aportes_validados × 15) + (postulaciones_aceptadas × 20)
  const dimensiones = [
    { label: 'Tareas verificadas', puntos: tareasVerificadas * 10, detalle: tareasVerificadas + ' × 10 pts', color: '#1D9E75' },
    { label: 'Aportes validados', puntos: aportesValidados * 15, detalle: aportesValidados + ' × 15 pts', color: '#E8A020' },
    { label: 'Postulaciones aceptadas', puntos: aceptadas * 20, detalle: aceptadas + ' × 20 pts', color: '#AFA9EC' },
  ]
  const maxDimension = Math.max(...dimensiones.map(d => d.puntos), 1)

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Calculando score...
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/dashboard" style={{textDecoration:'none'}}><div style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff'}}>Esca<span style={{color:'#1D9E75'}}>la</span></div></a>
        <div style={{display:'flex',gap:'1.5rem'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Dashboard</a>
          <a href="/score" style={{color:'#fff',fontSize:'0.82rem',fontWeight:'600',textDecoration:'none'}}>Mi Score</a>
          <a href="/proyectos" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Proyectos</a>
        </div>
      </nav>

      <main style={{maxWidth:'800px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'2rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.4rem'}}>Reputación verificable</div>
          <div style={{fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Tu Escala Score</div>
          <div style={{fontSize:'0.85rem',color:'#8FA3CC',marginTop:'0.3rem'}}>No lo que dices que sabes hacer — lo que hiciste, verificado por quienes trabajaron contigo.</div>
        </div>

        <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'16px',padding:'2rem',marginBottom:'2rem',textAlign:'center'}}>
          <div style={{position:'relative',display:'inline-block',marginBottom:'1rem'}}>
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12"/>
              <circle cx="80" cy="80" r="70" fill="none" stroke={scoreColor} strokeWidth="12"
                strokeDasharray={`${(pctGauge/100) * 440} 440`}
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
                style={{transition:'stroke-dasharray 1s ease'}}
              />
            </svg>
            <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',textAlign:'center'}}>
              <div style={{fontFamily:'monospace',fontSize:'2.5rem',fontWeight:'900',color:'#fff',lineHeight:'1'}}>{score}</div>
              <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'2px'}}>/100</div>
            </div>
          </div>
          <div style={{fontSize:'1rem',fontWeight:'700',color:scoreColor,marginBottom:'0.5rem'}}>{scoreLabel}</div>
          <div style={{fontSize:'0.82rem',color:'#8FA3CC'}}>
            {perfil?.nombre} · {perfil?.ciudad} · {perfil?.rol_principal}
          </div>

          <button onClick={() => setVerExplicacion(v => !v)} style={{marginTop:'1rem',background:'none',border:'none',color:'#1D9E75',fontSize:'0.78rem',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:'600'}}>
            {verExplicacion ? '▲ Ocultar' : '¿Cómo sube este número? ▼'}
          </button>

          {verExplicacion && (
            <div style={{marginTop:'1rem',textAlign:'left',background:'rgba(255,255,255,0.03)',borderRadius:'10px',padding:'1.25rem',fontSize:'0.78rem',color:'#C8D4E8',lineHeight:'1.7'}}>
              <div style={{marginBottom:'0.5rem'}}><strong style={{color:'#1D9E75'}}>+20 pts</strong> — cuando te aceptan en un rol</div>
              <div style={{marginBottom:'0.5rem'}}><strong style={{color:'#1D9E75'}}>+15 pts</strong> — por cada aporte que el fundador valida</div>
              <div style={{marginBottom:'0.5rem'}}><strong style={{color:'#1D9E75'}}>+10 pts</strong> — por cada tarea que verifican como completada</div>
              <div style={{color:'#8FA3CC',marginTop:'0.75rem'}}>No es lo que dices saber hacer en tu perfil — es lo que realmente hiciste y otros confirmaron.</div>
            </div>
          )}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#1D9E75'}}>{aceptadas}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Postulaciones aceptadas</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#E8A020'}}>{pendientes}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Postulaciones pendientes</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#AFA9EC'}}>{perfil?.proyectos_completados || 0}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Proyectos completados</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#fff'}}>{postulaciones.length}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Total postulaciones</div>
          </div>
        </div>

        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem',marginBottom:'2rem'}}>
          <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff',marginBottom:'1.25rem'}}>Cómo se calcula tu score</div>
          {dimensiones.map(d => (
            <div key={d.label} style={{marginBottom:'1rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem',marginBottom:'4px'}}>
                <span style={{color:'#8FA3CC'}}>{d.label} <span style={{color:'#6B7280'}}>({d.detalle})</span></span>
                <span style={{color:'#fff',fontFamily:'monospace'}}>{d.puntos} pts</span>
              </div>
              <div style={{height:'6px',background:'rgba(255,255,255,0.08)',borderRadius:'3px',overflow:'hidden'}}>
                <div style={{height:'100%',width:(d.puntos/maxDimension*100)+'%',background:d.color,borderRadius:'3px',transition:'width 0.8s ease'}}></div>
              </div>
            </div>
          ))}
        </div>

        {perfil && (!perfil.especialidad || !perfil.lo_que_aporto || !perfil.lo_que_busco) && (
          <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem',marginBottom:'2rem'}}>
            <div>
              <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>Mejora tu score</div>
              <div style={{fontSize:'0.78rem',color:'#8FA3CC'}}>Completa tu perfil para subir puntos inmediatamente.</div>
            </div>
            <a href="/onboarding" style={{background:'#1D9E75',color:'#fff',padding:'0.6rem 1.25rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.82rem',fontWeight:'700',whiteSpace:'nowrap'}}>Completar perfil →</a>
          </div>
        )}

        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'12px',padding:'1.25rem'}}>
          <div style={{fontSize:'0.75rem',fontWeight:'700',color:'#8FA3CC',marginBottom:'0.75rem',letterSpacing:'0.04em',textTransform:'uppercase'}}>¿Cómo sube el score?</div>
          {[
            { accion: 'Completar perfil (nombre, ciudad, especialidad)', puntos: '+30 pts' },
            { accion: 'Postulaciones aceptadas por fundadores', puntos: '+40 pts' },
            { accion: 'Proyectos completados exitosamente', puntos: '+20 pts' },
            { accion: 'Tasa de cumplimiento de aportes', puntos: '+10 pts' },
          ].map(i => (
            <div key={i.accion} style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem',padding:'0.5rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
              <span style={{color:'#8FA3CC'}}>{i.accion}</span>
              <span style={{color:'#1D9E75',fontFamily:'monospace',fontWeight:'600'}}>{i.puntos}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
