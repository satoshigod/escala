'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Calendario() {
  const [usuario, setUsuario] = useState(null)
  const [tareas, setTareas] = useState([])
  const [hitos, setHitos] = useState([])
  const [proyectos, setProyectos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mesActual, setMesActual] = useState(new Date())
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)
  const [asignandoFecha, setAsignandoFecha] = useState(null)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)

      const [proyRes, hitosRes] = await Promise.all([
        fetch('/api/proyectos'),
        fetch('/api/hitos?all=1').catch(() => ({ json: () => ({ hitos: [] }) }))
      ])

      const proyData = await proyRes.json()
      const todos = proyData.proyectos || []
      setProyectos(todos)

      const misIds = todos.filter(p => p.fundador_id === user.id).map(p => p.id)

      // Tareas asignadas a mí con fecha_limite
      const { data: tareasData } = await supabase
        .from('tareas')
        .select('*, proyectos:proyecto_id ( nombre )')
        .eq('asignado_a', user.id)
        .neq('estado', 'completada')

      setTareas(tareasData || [])

      // Hitos de mis proyectos
      if (misIds.length > 0) {
        const { data: hitosData } = await supabase
          .from('hitos')
          .select('*, proyectos:proyecto_id ( nombre )')
          .in('proyecto_id', misIds)
        setHitos(hitosData || [])
      }

      setCargando(false)
    }
    cargar()
  }, [])

  async function guardarFechaLimite(tareaId, fecha) {
    const res = await fetch('/api/tareas', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tareaId, fecha_limite: fecha || null })
    })
    const data = await res.json()
    if (data.error) {
      setMensaje('Error: ' + data.error)
    } else {
      setTareas(prev => prev.map(t => t.id === tareaId ? { ...t, fecha_limite: fecha } : t))
      setAsignandoFecha(null)
      setMensaje('✓ Fecha guardada')
      setTimeout(() => setMensaje(''), 2000)
    }
  }

  // Helpers de calendario
  const año = mesActual.getFullYear()
  const mes = mesActual.getMonth()
  const primerDia = new Date(año, mes, 1).getDay()
  const diasEnMes = new Date(año, mes + 1, 0).getDate()
  const hoy = new Date()

  const nombresMes = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const diasSemana = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

  function eventosDel(dia) {
    const fechaStr = `${año}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`
    const tareasDelDia = tareas.filter(t => t.fecha_limite === fechaStr)
    const hitosDelDia = hitos.filter(h => h.fecha_limite === fechaStr)
    return { tareas: tareasDelDia, hitos: hitosDelDia }
  }

  const tareasSinFecha = tareas.filter(t => !t.fecha_limite)

  const eventosSeleccionados = diaSeleccionado ? eventosDel(diaSeleccionado) : null

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando...
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif',color:'#fff'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/dashboard" style={{textDecoration:'none',fontSize:'1.1rem',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Esca<span style={{color:'#1D9E75'}}>la</span></a>
        <div style={{display:'flex',gap:'1.25rem',alignItems:'center'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Dashboard</a>
          <a href="/hitos" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Hitos</a>
        </div>
      </nav>

      <main style={{maxWidth:'1100px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'1.75rem'}}>
          <div style={{fontSize:'1.5rem',fontWeight:'900',letterSpacing:'-0.03em',marginBottom:'0.3rem'}}>Calendario</div>
          <div style={{fontSize:'0.82rem',color:'#8FA3CC'}}>Tareas e hitos organizados por fecha.</div>
        </div>

        {mensaje && (
          <div style={{background: mensaje.startsWith('✓') ? 'rgba(29,158,117,0.1)' : 'rgba(216,90,48,0.1)', border: '1px solid', borderColor: mensaje.startsWith('✓') ? 'rgba(29,158,117,0.3)' : 'rgba(216,90,48,0.3)', borderRadius:'8px', padding:'0.75rem 1rem', color: mensaje.startsWith('✓') ? '#1D9E75' : '#D85A30', fontSize:'0.82rem', marginBottom:'1rem'}}>
            {mensaje}
          </div>
        )}

        <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:'1.5rem',alignItems:'start'}}>

          {/* CALENDARIO MENSUAL */}
          <div>
            <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',overflow:'hidden'}}>
              {/* Header del mes */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1rem 1.25rem',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                <button onClick={() => setMesActual(new Date(año, mes-1))} style={{background:'none',border:'none',color:'#8FA3CC',cursor:'pointer',fontSize:'1.1rem',padding:'0.25rem 0.5rem'}}>‹</button>
                <div style={{fontWeight:'700',fontSize:'1rem',color:'#fff'}}>{nombresMes[mes]} {año}</div>
                <button onClick={() => setMesActual(new Date(año, mes+1))} style={{background:'none',border:'none',color:'#8FA3CC',cursor:'pointer',fontSize:'1.1rem',padding:'0.25rem 0.5rem'}}>›</button>
              </div>

              {/* Días de la semana */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',padding:'0.5rem 0.75rem 0'}}>
                {diasSemana.map(d => (
                  <div key={d} style={{textAlign:'center',fontSize:'0.65rem',fontWeight:'600',color:'#8FA3CC',padding:'0.4rem 0'}}>{d}</div>
                ))}
              </div>

              {/* Grid de días */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'2px',padding:'0.25rem 0.75rem 0.75rem'}}>
                {Array.from({length: primerDia}).map((_,i) => <div key={'e'+i}/>)}
                {Array.from({length: diasEnMes}).map((_,i) => {
                  const dia = i + 1
                  const { tareas: t, hitos: h } = eventosDel(dia)
                  const total = t.length + h.length
                  const esHoy = hoy.getDate()===dia && hoy.getMonth()===mes && hoy.getFullYear()===año
                  const seleccionado = diaSeleccionado === dia
                  return (
                    <div key={dia} onClick={() => setDiaSeleccionado(seleccionado ? null : dia)} style={{
                      minHeight:'52px', padding:'0.3rem 0.25rem', borderRadius:'8px', cursor:'pointer', textAlign:'center',
                      background: seleccionado ? 'rgba(29,158,117,0.15)' : esHoy ? 'rgba(255,255,255,0.07)' : 'transparent',
                      border: seleccionado ? '1px solid rgba(29,158,117,0.4)' : esHoy ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                      position:'relative'
                    }}>
                      <div style={{fontSize:'0.75rem',fontWeight: esHoy ? '700' : '400',color: esHoy ? '#1D9E75' : seleccionado ? '#fff' : '#C8D4E8',marginBottom:'0.2rem'}}>{dia}</div>
                      {total > 0 && (
                        <div style={{display:'flex',justifyContent:'center',gap:'2px',flexWrap:'wrap'}}>
                          {t.slice(0,2).map((_,idx) => <div key={idx} style={{width:'5px',height:'5px',borderRadius:'50%',background:'#AFA9EC'}}/>)}
                          {h.slice(0,2).map((_,idx) => <div key={idx} style={{width:'5px',height:'5px',borderRadius:'50%',background:'#E8A020'}}/>)}
                          {total > 4 && <div style={{fontSize:'0.55rem',color:'#8FA3CC'}}>+{total-4}</div>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Leyenda */}
            <div style={{display:'flex',gap:'1.25rem',marginTop:'0.875rem',paddingLeft:'0.25rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.72rem',color:'#8FA3CC'}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#AFA9EC'}}></div>Tareas
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.72rem',color:'#8FA3CC'}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#E8A020'}}></div>Hitos
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.72rem',color:'#8FA3CC'}}>
                <div style={{width:'12px',height:'12px',borderRadius:'50%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)'}}></div>Hoy
              </div>
            </div>

            {/* Detalle del día seleccionado */}
            {diaSeleccionado && eventosSeleccionados && (eventosSeleccionados.tareas.length > 0 || eventosSeleccionados.hitos.length > 0) && (
              <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.25rem',marginTop:'1rem'}}>
                <div style={{fontSize:'0.82rem',fontWeight:'700',color:'#1D9E75',marginBottom:'0.875rem'}}>
                  {diaSeleccionado} de {nombresMes[mes]}
                </div>
                {eventosSeleccionados.tareas.map(t => (
                  <div key={t.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.6rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <div>
                      <div style={{fontSize:'0.82rem',color:'#fff',marginBottom:'0.1rem'}}>{t.nombre}</div>
                      <div style={{fontSize:'0.68rem',color:'#AFA9EC'}}>{t.proyectos?.nombre} · {t.categoria}</div>
                    </div>
                    <span style={{fontSize:'0.65rem',padding:'0.2rem 0.5rem',borderRadius:'10px',background:'rgba(83,74,183,0.15)',color:'#AFA9EC'}}>Tarea</span>
                  </div>
                ))}
                {eventosSeleccionados.hitos.map(h => (
                  <div key={h.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.6rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <div>
                      <div style={{fontSize:'0.82rem',color:'#fff',marginBottom:'0.1rem'}}>{h.nombre}</div>
                      <div style={{fontSize:'0.68rem',color:'#E8A020'}}>{h.proyectos?.nombre}</div>
                    </div>
                    <span style={{fontSize:'0.65rem',padding:'0.2rem 0.5rem',borderRadius:'10px',background:'rgba(232,160,32,0.15)',color:'#E8A020'}}>Hito</span>
                  </div>
                ))}
              </div>
            )}

            {diaSeleccionado && eventosSeleccionados && eventosSeleccionados.tareas.length === 0 && eventosSeleccionados.hitos.length === 0 && (
              <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem',marginTop:'1rem',textAlign:'center',fontSize:'0.78rem',color:'#8FA3CC'}}>
                Sin eventos el {diaSeleccionado} de {nombresMes[mes]}
              </div>
            )}
          </div>

          {/* SIDEBAR: tareas sin fecha + próximos eventos */}
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>

            {/* Próximos eventos */}
            <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.1rem'}}>
              <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'0.875rem'}}>Próximos 7 días</div>
              {(() => {
                const eventos = []
                for (let i = 0; i < 7; i++) {
                  const d = new Date()
                  d.setDate(d.getDate() + i)
                  const fechaStr = d.toISOString().split('T')[0]
                  const label = i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : d.toLocaleDateString('es-CO', {weekday:'short', day:'numeric'})
                  tareas.filter(t => t.fecha_limite === fechaStr).forEach(t => eventos.push({ label, tipo:'tarea', texto: t.nombre, proyecto: t.proyectos?.nombre }))
                  hitos.filter(h => h.fecha_limite === fechaStr).forEach(h => eventos.push({ label, tipo:'hito', texto: h.nombre, proyecto: h.proyectos?.nombre }))
                }
                if (eventos.length === 0) return <div style={{fontSize:'0.75rem',color:'#8FA3CC',textAlign:'center',padding:'0.5rem'}}>Sin eventos en los próximos 7 días</div>
                return eventos.map((ev, i) => (
                  <div key={i} style={{padding:'0.5rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)',display:'flex',gap:'0.5rem',alignItems:'flex-start'}}>
                    <div style={{fontSize:'0.62rem',fontWeight:'700',color: ev.tipo==='hito' ? '#E8A020' : '#AFA9EC',minWidth:'40px',paddingTop:'1px'}}>{ev.label}</div>
                    <div>
                      <div style={{fontSize:'0.75rem',color:'#fff'}}>{ev.texto}</div>
                      <div style={{fontSize:'0.65rem',color:'#8FA3CC'}}>{ev.proyecto}</div>
                    </div>
                  </div>
                ))
              })()}
            </div>

            {/* Tareas sin fecha */}
            <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.1rem'}}>
              <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'0.25rem'}}>Sin fecha asignada</div>
              <div style={{fontSize:'0.68rem',color:'#8FA3CC',marginBottom:'0.875rem'}}>{tareasSinFecha.length} tareas pendientes · clic para asignar fecha</div>
              {tareasSinFecha.length === 0 ? (
                <div style={{fontSize:'0.75rem',color:'#1D9E75',textAlign:'center',padding:'0.5rem'}}>✓ Todas las tareas tienen fecha</div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:'0.4rem'}}>
                  {tareasSinFecha.slice(0,6).map(t => (
                    <div key={t.id}>
                      <div onClick={() => setAsignandoFecha(asignandoFecha===t.id ? null : t.id)} style={{padding:'0.6rem 0.75rem',background:'rgba(255,255,255,0.03)',borderRadius:'8px',cursor:'pointer',border:'1px solid rgba(255,255,255,0.06)'}}>
                        <div style={{fontSize:'0.75rem',color:'#fff',marginBottom:'0.1rem'}}>{t.nombre}</div>
                        <div style={{fontSize:'0.62rem',color:'#8FA3CC'}}>{t.proyectos?.nombre} · clic para asignar fecha →</div>
                      </div>
                      {asignandoFecha === t.id && (
                        <div style={{padding:'0.5rem 0.75rem 0.6rem',background:'rgba(83,74,183,0.08)',border:'1px solid rgba(83,74,183,0.2)',borderRadius:'0 0 8px 8px',marginTop:'-4px',display:'flex',gap:'0.4rem',alignItems:'center'}}>
                          <input type="date" style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'6px',padding:'0.3rem 0.5rem',color:'#fff',fontSize:'0.75rem',outline:'none',flex:1}} onChange={e => e.target.value && guardarFechaLimite(t.id, e.target.value)} />
                          <button onClick={() => setAsignandoFecha(null)} style={{background:'none',border:'none',color:'#8FA3CC',cursor:'pointer',fontSize:'0.75rem'}}>✕</button>
                        </div>
                      )}
                    </div>
                  ))}
                  {tareasSinFecha.length > 6 && (
                    <div style={{fontSize:'0.68rem',color:'#8FA3CC',textAlign:'center',paddingTop:'0.25rem'}}>+{tareasSinFecha.length-6} más</div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
