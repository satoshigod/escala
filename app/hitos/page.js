'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Hitos() {
  const [usuario, setUsuario] = useState(null)
  const [proyectos, setProyectos] = useState([])
  const [hitos, setHitos] = useState([])
  const [proyectoSel, setProyectoSel] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [actualizando, setActualizando] = useState(null)
  const [vista, setVista] = useState('lista')
  const [form, setForm] = useState({ nombre: '', descripcion: '' })
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro'; return }
      setUsuario(user)

      const res = await fetch('/api/proyectos')
      const data = await res.json()
      const misproyectos = (data.proyectos || []).filter(p => p.fundador_id === user.id)
      setProyectos(misproyectos)

      if (misproyectos.length > 0) {
        setProyectoSel(misproyectos[0].id)
        await cargarHitos(misproyectos[0].id)
      }
      setCargando(false)
    }
    cargar()
  }, [])

  async function cargarHitos(pid) {
    const res = await fetch('/api/hitos?proyecto_id=' + pid)
    const data = await res.json()
    setHitos(data.hitos || [])
  }

  async function crearHito() {
    if (!form.nombre) { setMensaje('El nombre es requerido'); return }
    setEnviando(true)
    const res = await fetch('/api/hitos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proyecto_id: proyectoSel, nombre: form.nombre, descripcion: form.descripcion })
    })
    const data = await res.json()
    if (data.error) {
      setMensaje('Error: ' + data.error)
    } else {
      setHitos(h => [...h, data.hito])
      setVista('lista')
      setForm({ nombre: '', descripcion: '' })
    }
    setEnviando(false)
  }

  async function completarHito(hito) {
    setActualizando(hito.id)
    const res = await fetch('/api/hitos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: hito.id, completado: !hito.completado })
    })
    const data = await res.json()
    if (!data.error) {
      setHitos(h => h.map(x => x.id === hito.id ? data.hito : x))
    }
    setActualizando(null)
  }

  const completados = hitos.filter(h => h.completado).length
  const pendientes = hitos.filter(h => !h.completado).length

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando hitos...
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/dashboard" style={{textDecoration:'none'}}><div style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff'}}>Esca<span style={{color:'#1D9E75'}}>la</span></div></a>
        <div style={{display:'flex',gap:'1.5rem'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Dashboard</a>
          <a href="/hitos" style={{color:"#8FA3CC",fontSize:"0.82rem",textDecoration:"none"}}>Hitos</a><a href="/proyectos" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Proyectos</a>
          <a href="/hitos" style={{color:'#fff',fontSize:'0.82rem',fontWeight:'600',textDecoration:'none'}}>Hitos</a>
          <a href="/admin" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Panel fundador</a>
        </div>
      </nav>

      <main style={{maxWidth:'800px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'2rem',flexWrap:'wrap',gap:'1rem'}}>
          <div>
            <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.4rem'}}>Expediente del proyecto</div>
            <div style={{fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Hitos del proyecto</div>
            <div style={{fontSize:'0.85rem',color:'#8FA3CC',marginTop:'0.3rem'}}>{completados} completado{completados!==1?'s':''} · {pendientes} pendiente{pendientes!==1?'s':''}</div>
          </div>
          {vista === 'lista' && proyectos.length > 0 && (
            <button onClick={() => setVista('nuevo')} style={{background:'#1D9E75',color:'#fff',border:'none',padding:'0.75rem 1.5rem',borderRadius:'8px',fontSize:'0.875rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
              + Nuevo hito
            </button>
          )}
        </div>

        {proyectos.length > 1 && (
          <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginBottom:'1.5rem'}}>
            {proyectos.map(p => (
              <button key={p.id} onClick={() => { setProyectoSel(p.id); cargarHitos(p.id) }} style={{background: proyectoSel === p.id ? '#1D9E75' : 'rgba(255,255,255,0.05)', color: proyectoSel === p.id ? '#fff' : '#8FA3CC', border: proyectoSel === p.id ? 'none' : '1px solid rgba(255,255,255,0.12)', borderRadius:'8px', padding:'0.4rem 0.875rem', fontSize:'0.8rem', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif'}}>
                {p.nombre}
              </button>
            ))}
          </div>
        )}

        {proyectos.length === 0 ? (
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.12)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
            <div style={{fontSize:'2rem',marginBottom:'1rem'}}>🎯</div>
            <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.5rem'}}>No tienes proyectos publicados</div>
            <div style={{color:'#8FA3CC',fontSize:'0.85rem',marginBottom:'1.5rem'}}>Solo el fundador puede crear hitos.</div>
            <a href="/hitos" style={{color:"#8FA3CC",fontSize:"0.82rem",textDecoration:"none"}}>Hitos</a><a href="/proyectos" style={{background:'#1D9E75',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.875rem',fontWeight:'700'}}>Publicar proyecto →</a>
          </div>
        ) : (
          <>
            {vista === 'nuevo' && (
              <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'14px',padding:'1.75rem',marginBottom:'1.5rem'}}>
                <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',marginBottom:'1.5rem'}}>Crear nuevo hito</div>

                <label style={{display:'block',fontSize:'0.72rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.4rem',letterSpacing:'0.04em',textTransform:'uppercase'}}>Nombre del hito *</label>
                <input value={form.nombre} onChange={e => setForm(f=>({...f,nombre:e.target.value}))} placeholder="Ej: Constitución SAS, Primera venta, MVP lanzado..." style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.75rem 1rem',color:'#fff',fontSize:'0.9rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif',marginBottom:'1rem'}} />

                <label style={{display:'block',fontSize:'0.72rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.4rem',letterSpacing:'0.04em',textTransform:'uppercase'}}>Descripción (opcional)</label>
                <textarea value={form.descripcion} onChange={e => setForm(f=>({...f,descripcion:e.target.value}))} placeholder="¿Qué implica este hito? ¿Cómo se verifica?" style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.75rem 1rem',color:'#fff',fontSize:'0.9rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif',resize:'vertical',minHeight:'80px',marginBottom:'1.5rem'}} />

                {mensaje && <div style={{background:'rgba(216,90,48,0.1)',border:'1px solid rgba(216,90,48,0.3)',borderRadius:'8px',padding:'0.875rem',color:'#D85A30',fontSize:'0.82rem',marginBottom:'1rem'}}>{mensaje}</div>}

                <div style={{display:'flex',gap:'0.75rem'}}>
                  <button onClick={() => {setVista('lista');setMensaje('')}} style={{background:'transparent',color:'#8FA3CC',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.75rem 1.25rem',fontSize:'0.875rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Cancelar</button>
                  <button onClick={crearHito} disabled={enviando} style={{flex:1,background:enviando?'#0F6E56':'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.875rem',fontSize:'0.95rem',fontWeight:'700',cursor:enviando?'not-allowed':'pointer',fontFamily:'Inter,sans-serif'}}>
                    {enviando ? 'Creando...' : 'Crear hito →'}
                  </button>
                </div>
              </div>
            )}

            {hitos.length === 0 && vista === 'lista' ? (
              <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.12)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
                <div style={{fontSize:'2rem',marginBottom:'1rem'}}>🎯</div>
                <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.5rem'}}>Sin hitos todavía</div>
                <div style={{color:'#8FA3CC',fontSize:'0.85rem',marginBottom:'1.5rem'}}>Los hitos marcan el avance del proyecto. Crea el primero.</div>
                <button onClick={() => setVista('nuevo')} style={{background:'#1D9E75',color:'#fff',border:'none',padding:'0.75rem 1.5rem',borderRadius:'8px',fontSize:'0.875rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>+ Crear primer hito</button>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                {hitos.map((h, i) => (
                  <div key={h.id} style={{background: h.completado ? 'rgba(29,158,117,0.08)' : 'rgba(255,255,255,0.04)', border: h.completado ? '1px solid rgba(29,158,117,0.25)' : '1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
                    <div style={{display:'flex',gap:'1rem',alignItems:'flex-start'}}>
                      <div style={{width:'28px',height:'28px',borderRadius:'50%',background: h.completado ? '#1D9E75' : 'rgba(255,255,255,0.08)',border: h.completado ? 'none' : '2px solid rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.75rem',flexShrink:0,marginTop:'2px'}}>
                        {h.completado ? '✓' : (i+1)}
                      </div>
                      <div>
                        <div style={{fontSize:'0.9rem',fontWeight:'700',color: h.completado ? '#1D9E75' : '#fff',marginBottom:'0.2rem', textDecoration: h.completado ? 'line-through' : 'none'}}>{h.nombre}</div>
                        {h.descripcion && <div style={{fontSize:'0.75rem',color:'#8FA3CC',lineHeight:'1.5'}}>{h.descripcion}</div>}
                        {h.completado && h.fecha_completado && (
                          <div style={{fontSize:'0.7rem',color:'#1D9E75',marginTop:'0.2rem'}}>✓ Completado el {new Date(h.fecha_completado).toLocaleDateString('es-CO')}</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => completarHito(h)}
                      disabled={actualizando === h.id}
                      style={{background: h.completado ? 'rgba(255,255,255,0.05)' : 'rgba(29,158,117,0.15)', color: h.completado ? '#8FA3CC' : '#1D9E75', border: h.completado ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(29,158,117,0.3)', borderRadius:'6px', padding:'0.4rem 0.875rem', fontSize:'0.78rem', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif', whiteSpace:'nowrap'}}
                    >
                      {actualizando === h.id ? '...' : h.completado ? 'Marcar pendiente' : '✓ Completar'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
