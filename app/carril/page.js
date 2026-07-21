'use client'
import { useState, useEffect } from 'react'
import NavApp from '@/components/NavApp'
import { supabase } from '../../lib/supabase'

const FORMAS = {
  cash: { label: 'Cash', desc: 'Pago en efectivo, inmediato', color: '#1D9E75' },
  acciones: { label: 'Convertible en acciones', desc: 'Riesgo real de terminar en $0 si el proyecto no genera valor', color: '#534AB7' },
  pasivo: { label: 'Deuda como pasivo', desc: 'Riesgo real de terminar en $0 si el proyecto nunca genera ingresos', color: '#E8A020' },
}

export default function Carril() {
  const [usuario, setUsuario] = useState(null)
  const [postulaciones, setPostulaciones] = useState([])
  const [tareasPorProyecto, setTareasPorProyecto] = useState({})
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(null)
  const [eligiendoForma, setEligiendoForma] = useState({})
  const [valorInput, setValorInput] = useState({})

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)

      const postRes = await fetch('/api/postulaciones?fundador_id=' + user.id)
      const postData = await postRes.json()
      const aceptadas = (postData.postulaciones || []).filter(p => p.estado === 'aceptada')
      setPostulaciones(aceptadas)

      // Cargar tareas de cada proyecto involucrado, una vez por proyecto
      const proyectoIds = [...new Set(aceptadas.map(p => p.roles?.proyecto_id).filter(Boolean))]
      const tareasMap = {}
      await Promise.all(proyectoIds.map(async (pid) => {
        const res = await fetch('/api/tareas?proyecto_id=' + pid)
        const data = await res.json()
        tareasMap[pid] = data.tareas || []
      }))
      setTareasPorProyecto(tareasMap)

      setCargando(false)
    }
    cargar()
  }, [])

  function tareasDe(postulacion) {
    const pid = postulacion.roles?.proyecto_id
    const todas = tareasPorProyecto[pid] || []
    return todas.filter(t => t.asignado_a === postulacion.postulante_id)
  }

  async function marcarCumplio(postulacion, cumplio) {
    if (!cumplio && !confirm('¿Confirmas que ' + (postulacion.perfiles?.nombre || 'este especialista') + ' NO cumplió lo pactado?\n\nEsto significa que no recibe ningún pago por su aporte en este rol. No hay forma de deshacerlo desde aquí después de confirmar.')) return
    setGuardando(postulacion.id)
    if (!cumplio) {
      // No cumplió — se cierra sin pago, sin necesidad de elegir forma de pago
      const res = await fetch('/api/postulaciones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postulacion.id, cumplio: false, cumplio_confirmado_por: usuario.id })
      })
      const data = await res.json()
      setPostulaciones(ps => ps.map(p => p.id === postulacion.id ? data.postulacion : p))
      setGuardando(null)
    } else {
      // Cumplió — se abre el selector de forma de pago, todavía no se guarda
      setEligiendoForma(e => ({ ...e, [postulacion.id]: true }))
      setGuardando(null)
    }
  }

  async function confirmarFormaPago(postulacion, forma_pago) {
    const valor = Number(valorInput[postulacion.id] || 0)
    if (!valor) { alert('Ingresa el valor acordado antes de confirmar'); return }
    setGuardando(postulacion.id)
    const res = await fetch('/api/postulaciones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: postulacion.id,
        cumplio: true,
        cumplio_confirmado_por: usuario.id,
        forma_pago,
        valor,
        concepto: (postulacion.roles?.nombre || 'Rol') + ' — ' + (postulacion.roles?.proyectos?.nombre || ''),
      })
    })
    const data = await res.json()
    setPostulaciones(ps => ps.map(p => p.id === postulacion.id ? data.postulacion : p))
    setEligiendoForma(e => ({ ...e, [postulacion.id]: false }))
    setGuardando(null)
  }

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando...
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <NavApp paginaActual="carril" />

      <main style={{maxWidth:'900px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'2rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#E8A020',marginBottom:'0.4rem'}}>Modelo de compensación</div>
          <div style={{fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Pagar a mi equipo</div>
          <div style={{fontSize:'0.85rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Un solo filtro decide si hay pago: ¿cumplió lo pactado? Si sí, elige cómo se paga según el estado del proyecto.</div>
        </div>

        {postulaciones.length === 0 ? (
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.12)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
            <div style={{fontSize:'2rem',marginBottom:'1rem'}}>📋</div>
            <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.5rem'}}>Sin postulaciones aceptadas</div>
            <div style={{color:'#8FA3CC',fontSize:'0.85rem',marginBottom:'1.5rem'}}>Aquí confirmas si cada especialista de tus proyectos cumplió su trabajo y decides cómo pagarle.</div>
            <a href="/proyectos" style={{background:'#1D9E75',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.875rem',fontWeight:'700'}}>Ver proyectos →</a>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            {postulaciones.map(p => {
              const tareas = tareasDe(p)
              const verificadas = tareas.filter(t => t.estado === 'verificada').length
              const estadoFin = p.roles?.proyectos?.estado_financiacion || 'riesgo_compartido'
              const opciones = estadoFin === 'con_recursos' ? ['cash', 'acciones'] : ['acciones', 'pasivo']
              const yaResuelto = typeof p.cumplio === 'boolean'

              return (
                <div key={p.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'1rem',marginBottom:'1rem'}}>
                    <div>
                      <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>{p.perfiles?.nombre || 'Especialista'} — {p.roles?.nombre || 'Rol'}</div>
                      <div style={{fontSize:'0.75rem',color:'#8FA3CC'}}>{p.roles?.proyectos?.nombre || 'Proyecto'} · {tareas.length > 0 ? `${verificadas} de ${tareas.length} tareas verificadas` : 'Sin tareas registradas todavía'}</div>
                    </div>
                    <span style={{fontSize:'0.68rem',fontWeight:'700',padding:'0.25rem 0.75rem',borderRadius:'20px',textTransform:'uppercase',letterSpacing:'0.04em',background: estadoFin === 'con_recursos' ? 'rgba(29,158,117,0.15)' : 'rgba(232,160,32,0.15)', color: estadoFin === 'con_recursos' ? '#1D9E75' : '#E8A020'}}>
                      {estadoFin === 'con_recursos' ? 'Con Recursos' : 'Riesgo Compartido'}
                    </span>
                  </div>

                  {yaResuelto ? (
                    p.cumplio ? (
                      <div style={{padding:'0.875rem',borderRadius:'8px',background: `${FORMAS[p.forma_pago]?.color}1A`, border:`1px solid ${FORMAS[p.forma_pago]?.color}4D`}}>
                        <div style={{fontSize:'0.82rem',fontWeight:'700',color:'#fff'}}>✓ Cumplió — {FORMAS[p.forma_pago]?.label}</div>
                        <div style={{fontSize:'0.75rem',color:'#8FA3CC',marginTop:'0.2rem'}}>{FORMAS[p.forma_pago]?.desc}</div>
                      </div>
                    ) : (
                      <div style={{padding:'0.875rem',borderRadius:'8px',background:'rgba(216,90,48,0.1)',border:'1px solid rgba(216,90,48,0.3)'}}>
                        <div style={{fontSize:'0.82rem',fontWeight:'700',color:'#fff'}}>✗ No cumplió — sin pago</div>
                      </div>
                    )
                  ) : !eligiendoForma[p.id] ? (
                    <div style={{display:'flex',gap:'0.75rem'}}>
                      <button onClick={() => marcarCumplio(p, true)} disabled={guardando === p.id} style={{flex:1,background:'rgba(29,158,117,0.15)',border:'1px solid rgba(29,158,117,0.4)',color:'#1D9E75',fontWeight:'700',fontSize:'0.82rem',padding:'0.75rem',borderRadius:'8px',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>✓ Cumplió</button>
                      <button onClick={() => marcarCumplio(p, false)} disabled={guardando === p.id} style={{flex:1,background:'rgba(216,90,48,0.1)',border:'1px solid rgba(216,90,48,0.3)',color:'#D85A30',fontWeight:'700',fontSize:'0.82rem',padding:'0.75rem',borderRadius:'8px',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>✗ No cumplió</button>
                    </div>
                  ) : (
                    <div>
                      <div style={{fontSize:'0.72rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.5rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Valor acordado (COP)</div>
                      <input type="number" value={valorInput[p.id] || ''} onChange={e => setValorInput(v => ({ ...v, [p.id]: e.target.value }))} placeholder="Ej: 500000" style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.6rem 0.75rem',color:'#fff',fontSize:'0.85rem',marginBottom:'0.875rem',fontFamily:'Inter,sans-serif'}} />
                      <div style={{fontSize:'0.72rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.5rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Forma de pago</div>
                      <div style={{display:'grid',gridTemplateColumns:`repeat(${opciones.length},1fr)`,gap:'0.5rem'}}>
                        {opciones.map(op => (
                          <button key={op} onClick={() => confirmarFormaPago(p, op)} disabled={guardando === p.id} style={{background:`${FORMAS[op].color}1A`,border:`1px solid ${FORMAS[op].color}4D`,borderRadius:'8px',padding:'0.75rem',cursor:'pointer',fontFamily:'Inter,sans-serif',textAlign:'left'}}>
                            <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff'}}>{FORMAS[op].label}</div>
                            <div style={{fontSize:'0.68rem',color:'#8FA3CC',marginTop:'0.15rem'}}>{FORMAS[op].desc}</div>
                          </button>
                        ))}
                      </div>
                      <button onClick={() => setEligiendoForma(e => ({ ...e, [p.id]: false }))} style={{marginTop:'0.75rem',background:'none',border:'none',color:'#8FA3CC',fontSize:'0.75rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Cancelar</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'12px',padding:'1.25rem',marginTop:'2rem'}}>
          <div style={{fontSize:'0.75rem',fontWeight:'700',color:'#8FA3CC',marginBottom:'0.5rem',letterSpacing:'0.04em',textTransform:'uppercase'}}>Regla del modelo</div>
          <div style={{fontSize:'0.82rem',color:'#8FA3CC',lineHeight:'1.6'}}>No cumplió → no se paga nada. Cumplió y el proyecto tiene recursos → cash o acciones. Cumplió y el proyecto está en Riesgo Compartido → acciones o deuda como pasivo, con riesgo real de terminar en $0 hasta que el proyecto genere valor.</div>
        </div>
      </main>
    </div>
  )
}
