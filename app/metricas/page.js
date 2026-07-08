'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

function BarraMetrica({ valor, max, color = '#1D9E75', altura = 80 }) {
  const pct = max > 0 ? (valor / max) * 100 : 0
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.3rem'}}>
      <div style={{fontSize:'0.7rem',fontWeight:'700',color:'#fff'}}>{valor.toLocaleString()}</div>
      <div style={{width:'32px',height:altura+'px',background:'rgba(255,255,255,0.06)',borderRadius:'4px',overflow:'hidden',display:'flex',alignItems:'flex-end'}}>
        <div style={{width:'100%',height:pct+'%',background:color,borderRadius:'4px',transition:'height 0.6s ease'}}/>
      </div>
    </div>
  )
}

function GraficoDonut({ datos, size = 120 }) {
  const total = datos.reduce((s, d) => s + d.valor, 0)
  if (total === 0) return <div style={{width:size,height:size,borderRadius:'50%',background:'rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.7rem',color:'#8FA3CC'}}>Sin datos</div>
  const radio = size / 2 - 10
  const circunferencia = 2 * Math.PI * radio
  let offset = 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {datos.map((d, i) => {
        const pct = d.valor / total
        const largo = pct * circunferencia
        const elem = (
          <circle key={i} cx={size/2} cy={size/2} r={radio}
            fill="none" stroke={d.color} strokeWidth="18"
            strokeDasharray={`${largo} ${circunferencia - largo}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${size/2} ${size/2})`}
          />
        )
        offset += largo
        return elem
      })}
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="14" fontWeight="700">{total}</text>
      <text x={size/2} y={size/2+16} textAnchor="middle" dominantBaseline="middle" fill="#8FA3CC" fontSize="9">total</text>
    </svg>
  )
}

export default function Metricas() {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [proyectos, setProyectos] = useState([])
  const [postulaciones, setPostulaciones] = useState([])
  const [aportes, setAportes] = useState([])
  const [hitos, setHitos] = useState([])
  const [tareas, setTareas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)

      const res = await fetch('/api/dashboard?user_id=' + user.id)
      const data = await res.json()

      setPerfil(data.perfil)
      setProyectos(data.misProyectos || [])
      setPostulaciones(data.misPostulaciones || [])
      setAportes(data.misAportes || [])

      if (data.misProyectos?.length > 0) {
        const pid = data.misProyectos[0].id
        setProyectoSeleccionado(pid)

        const [hitosRes, tareasRes] = await Promise.all([
          supabase.from('hitos').select('*').eq('proyecto_id', pid),
          supabase.from('tareas').select('*').in('proyecto_id', data.misProyectos.map(p => p.id))
        ])
        setHitos(hitosRes.data || [])
        setTareas(tareasRes.data || [])
      }
      setCargando(false)
    }
    cargar()
  }, [])

  // Aportes por mes (últimos 6 meses)
  const aportesXMes = () => {
    const meses = []
    const hoy = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
      const mes = d.toLocaleString('es-CO', { month: 'short' })
      const año = d.getFullYear()
      const m = d.getMonth()
      const total = aportes
        .filter(a => { const f = new Date(a.fecha); return f.getMonth() === m && f.getFullYear() === año })
        .reduce((s, a) => s + (a.valor || 0), 0)
      meses.push({ mes, total })
    }
    return meses
  }

  // Aportes por tipo
  const aportesXTipo = () => {
    const tipos = {}
    const colores = { horas:'#1D9E75', capital:'#E8A020', entregable:'#AFA9EC', activo:'#5A9FE8', contacto:'#D85A30' }
    aportes.forEach(a => {
      if (!tipos[a.tipo]) tipos[a.tipo] = 0
      tipos[a.tipo] += a.valor || 0
    })
    return Object.entries(tipos).map(([tipo, valor]) => ({ tipo, valor, color: colores[tipo] || '#8FA3CC' }))
  }

  // Tareas por estado
  const tareasXEstado = () => {
    const estados = { pendiente: 0, en_progreso: 0, completada: 0, verificada: 0 }
    tareas.forEach(t => { if (estados[t.estado] !== undefined) estados[t.estado]++ })
    return estados
  }

  const mesData = aportesXMes()
  const maxAporte = Math.max(...mesData.map(m => m.total), 1)
  const tipoData = aportesXTipo()
  const estadosTareas = tareasXEstado()
  const totalHoras = aportes.filter(a => a.tipo === 'horas').reduce((s, a) => s + (a.valor || 0), 0)
  const totalValor = aportes.reduce((s, a) => s + (a.valor || 0), 0)
  const participaciones = postulaciones.filter(p => p.estado === 'aceptada').length

  if (errorMsg) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif'}}>
      <div style={{color:'#D85A30',fontSize:'0.9rem',textAlign:'center'}}>
        <div style={{fontSize:'2rem',marginBottom:'1rem'}}>⚠️</div>
        <div>{errorMsg}</div>
        <button onClick={() => window.location.reload()} style={{marginTop:'1rem',background:'rgba(255,255,255,0.1)',border:'none',color:'#fff',padding:'0.5rem 1rem',borderRadius:'6px',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Reintentar</button>
      </div>
    </div>
  )
  if (cargando) return <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>Cargando...</div>

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif',color:'#fff'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/dashboard" style={{textDecoration:'none',fontSize:'1.1rem',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Esca<span style={{color:'#1D9E75'}}>la</span></a>
        <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>← Dashboard</a>
      </nav>

      <main style={{maxWidth:'1100px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'2rem'}}>
          <div style={{fontSize:'1.5rem',fontWeight:'900',letterSpacing:'-0.03em',marginBottom:'0.3rem'}}>Métricas</div>
          <div style={{fontSize:'0.82rem',color:'#8FA3CC'}}>Tu actividad, aportes y participación en Escala.</div>
        </div>

        {/* TARJETAS RESUMEN */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'0.875rem',marginBottom:'2rem'}}>
          {[
            { label:'Escala Score', valor: perfil?.escala_score || 0, color:'#AFA9EC', icon:'⭐' },
            { label:'Participaciones activas', valor: participaciones, color:'#1D9E75', icon:'🤝' },
            { label:'Proyectos', valor: proyectos.length, color:'#E8A020', icon:'🚀' },
            { label:'Valor total aportado', valor: '$'+totalValor.toLocaleString(), color:'#fff', icon:'💰', esTexto: true },
          ].map((m, i) => (
            <div key={i} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.1rem'}}>
              <div style={{fontSize:'1.1rem',marginBottom:'0.4rem'}}>{m.icon}</div>
              <div style={{fontFamily:'monospace',fontSize: m.esTexto ? '1.1rem' : '1.5rem',fontWeight:'700',color:m.color,marginBottom:'0.2rem'}}>{m.valor}</div>
              <div style={{fontSize:'0.7rem',color:'#8FA3CC'}}>{m.label}</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.25rem',marginBottom:'1.25rem'}}>

          {/* APORTES POR MES */}
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'1.5rem'}}>
            <div style={{fontSize:'0.82rem',fontWeight:'700',color:'#fff',marginBottom:'1.5rem'}}>Aportes por mes (últimos 6 meses)</div>
            {aportes.length === 0 ? (
              <div style={{textAlign:'center',color:'#8FA3CC',fontSize:'0.78rem',padding:'2rem'}}>Sin aportes registrados todavía</div>
            ) : (
              <div style={{display:'flex',gap:'0.75rem',alignItems:'flex-end',justifyContent:'space-between'}}>
                {mesData.map((m, i) => (
                  <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.4rem',flex:1}}>
                    <BarraMetrica valor={m.total} max={maxAporte} color='#1D9E75' altura={100} />
                    <div style={{fontSize:'0.62rem',color:'#8FA3CC',textAlign:'center'}}>{m.mes}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DISTRIBUCIÓN POR TIPO */}
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'1.5rem'}}>
            <div style={{fontSize:'0.82rem',fontWeight:'700',color:'#fff',marginBottom:'1.5rem'}}>Distribución de aportes por tipo</div>
            <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
              <GraficoDonut datos={tipoData.map(t => ({valor:t.valor, color:t.color}))} size={130} />
              <div style={{flex:1,display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                {tipoData.length === 0 ? (
                  <div style={{fontSize:'0.75rem',color:'#8FA3CC'}}>Sin aportes registrados</div>
                ) : tipoData.map((t, i) => (
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'0.5rem'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
                      <div style={{width:'8px',height:'8px',borderRadius:'50%',background:t.color,flexShrink:0}}/>
                      <div style={{fontSize:'0.72rem',color:'#C8D4E8',textTransform:'capitalize'}}>{t.tipo}</div>
                    </div>
                    <div style={{fontSize:'0.72rem',fontFamily:'monospace',color:'#fff'}}>${t.valor.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.25rem',marginBottom:'1.25rem'}}>

          {/* ESTADO DE TAREAS */}
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'1.5rem'}}>
            <div style={{fontSize:'0.82rem',fontWeight:'700',color:'#fff',marginBottom:'1.25rem'}}>Estado de mis tareas</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
              {[
                { label:'Pendientes', valor: estadosTareas.pendiente, color:'#E8A020' },
                { label:'En progreso', valor: estadosTareas.en_progreso, color:'#AFA9EC' },
                { label:'Completadas', valor: estadosTareas.completada, color:'#1D9E75' },
                { label:'Verificadas', valor: estadosTareas.verificada, color:'#5A9FE8' },
              ].map((e, i) => (
                <div key={i} style={{background:'rgba(255,255,255,0.03)',borderRadius:'10px',padding:'0.875rem',textAlign:'center'}}>
                  <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:e.color}}>{e.valor}</div>
                  <div style={{fontSize:'0.68rem',color:'#8FA3CC',marginTop:'0.2rem'}}>{e.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* HITOS */}
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'1.5rem'}}>
            <div style={{fontSize:'0.82rem',fontWeight:'700',color:'#fff',marginBottom:'1.25rem'}}>Hitos de mis proyectos</div>
            {hitos.length === 0 ? (
              <div style={{textAlign:'center',color:'#8FA3CC',fontSize:'0.78rem',padding:'1.5rem'}}>Sin hitos registrados</div>
            ) : (
              <>
                <div style={{display:'flex',gap:'1.5rem',alignItems:'center',marginBottom:'1.25rem'}}>
                  <GraficoDonut datos={[
                    { valor: hitos.filter(h=>h.completado).length, color:'#1D9E75' },
                    { valor: hitos.filter(h=>!h.completado).length, color:'rgba(255,255,255,0.1)' },
                  ]} size={100} />
                  <div>
                    <div style={{fontSize:'0.75rem',color:'#1D9E75',marginBottom:'0.3rem'}}>✅ {hitos.filter(h=>h.completado).length} completados</div>
                    <div style={{fontSize:'0.75rem',color:'#E8A020'}}>⏳ {hitos.filter(h=>!h.completado).length} pendientes</div>
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'0.4rem',maxHeight:'120px',overflowY:'auto'}}>
                  {hitos.slice(0,5).map(h => (
                    <div key={h.id} style={{display:'flex',justifyContent:'space-between',fontSize:'0.72rem',padding:'0.3rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                      <span style={{color:'#C8D4E8'}}>{h.nombre}</span>
                      <span style={{color: h.completado ? '#1D9E75' : '#E8A020'}}>{h.completado ? '✅' : '⏳'}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* POSTULACIONES */}
        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'1.5rem'}}>
          <div style={{fontSize:'0.82rem',fontWeight:'700',color:'#fff',marginBottom:'1.25rem'}}>Historial de postulaciones</div>
          <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
            <GraficoDonut datos={[
              { valor: postulaciones.filter(p=>p.estado==='aceptada').length, color:'#1D9E75' },
              { valor: postulaciones.filter(p=>p.estado==='pendiente').length, color:'#E8A020' },
              { valor: postulaciones.filter(p=>p.estado==='rechazada').length, color:'#D85A30' },
            ]} size={110} />
            <div style={{flex:1,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.75rem'}}>
              {[
                { label:'Aceptadas', valor: postulaciones.filter(p=>p.estado==='aceptada').length, color:'#1D9E75' },
                { label:'Pendientes', valor: postulaciones.filter(p=>p.estado==='pendiente').length, color:'#E8A020' },
                { label:'Rechazadas', valor: postulaciones.filter(p=>p.estado==='rechazada').length, color:'#D85A30' },
              ].map((e,i) => (
                <div key={i} style={{textAlign:'center',padding:'0.75rem',background:'rgba(255,255,255,0.03)',borderRadius:'10px'}}>
                  <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:e.color}}>{e.valor}</div>
                  <div style={{fontSize:'0.68rem',color:'#8FA3CC',marginTop:'0.15rem'}}>{e.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
