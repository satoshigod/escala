'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const TIPOS = {
  venta: { label: 'Venta', color: '#1D9E75' },
  contrato: { label: 'Contrato', color: '#534AB7' },
  servicio: { label: 'Servicio', color: '#E8A020' },
  otro: { label: 'Otro', color: '#8FA3CC' },
}

export default function Ingresos() {
  const [usuario, setUsuario] = useState(null)
  const [proyectos, setProyectos] = useState([])
  const [proyectoSel, setProyectoSel] = useState(null)
  const [ingresos, setIngresos] = useState([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [puedeRegistrar, setPuedeRegistrar] = useState(false)
  const [form, setForm] = useState({ descripcion: '', valor: '', fecha: new Date().toISOString().split('T')[0], tipo: 'venta', comprobante: '' })

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)

      const res = await fetch('/api/proyectos')
      const data = await res.json()
      const todos = data.proyectos || []

      // Solo muestra proyectos donde el usuario es fundador o tiene rol aceptado
      const mios = todos.filter(p => p.fundador_id === user.id)
      setProyectos(mios)

      if (mios.length > 0) {
        setProyectoSel(mios[0].id)
        await cargarIngresos(mios[0].id, user.id, mios[0].fundador_id)
      }
      setCargando(false)
    }
    cargar()
  }, [])

  async function cargarIngresos(pid, uid, fundador_id) {
    const res = await fetch('/api/ingresos?proyecto_id=' + pid)
    const data = await res.json()
    setIngresos(data.ingresos || [])
    setTotal(data.total || 0)
    setPuedeRegistrar(uid === fundador_id)
  }

  async function cambiarProyecto(pid) {
    setProyectoSel(pid)
    const proy = proyectos.find(p => p.id === pid)
    await cargarIngresos(pid, usuario.id, proy?.fundador_id)
  }

  async function registrar() {
    if (!form.descripcion || !form.valor) { setMensaje('Completa descripción y valor'); return }
    setEnviando(true)
    setMensaje('')
    const res = await fetch('/api/ingresos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proyecto_id: proyectoSel, registrado_por: usuario.id, ...form, valor: Number(form.valor) })
    })
    const data = await res.json()
    if (data.error) {
      setMensaje('Error: ' + data.error)
    } else {
      setIngresos(prev => [data.ingreso, ...prev])
      setTotal(prev => prev + Number(form.valor))
      setForm({ descripcion: '', valor: '', fecha: new Date().toISOString().split('T')[0], tipo: 'venta', comprobante: '' })
      setMensaje('✓ Ingreso registrado')
      setTimeout(() => setMensaje(''), 3000)
    }
    setEnviando(false)
  }

  async function eliminar(id, valor) {
    if (!confirm('¿Eliminar este ingreso?')) return
    await fetch('/api/ingresos?id=' + id + '&usuario_id=' + usuario.id, { method: 'DELETE' })
    setIngresos(prev => prev.filter(i => i.id !== id))
    setTotal(prev => prev - Number(valor))
  }

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando ingresos...
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/dashboard" style={{textDecoration:'none',display:'flex',alignItems:'center'}}><img src="/brand/isotipo.svg" alt="Escala" width="26" height="26" style={{display:"inline-block",verticalAlign:"middle",marginRight:"6px"}}/><span style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Esca<span style={{color:'#1D9E75'}}>la</span></span></a>
        <div style={{display:'flex',gap:'1.5rem'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Dashboard</a>
          <a href="/aportes" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Aportes</a>
          <a href="/ingresos" style={{color:'#fff',fontSize:'0.82rem',fontWeight:'600',textDecoration:'none'}}>Ingresos</a>
        </div>
      </nav>

      <main style={{maxWidth:'900px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'2rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.4rem'}}>Finanzas del proyecto</div>
          <div style={{fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Ingresos</div>
          <div style={{fontSize:'0.85rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Ventas, contratos y negocios que el proyecto ha generado.</div>
        </div>

        {proyectos.length === 0 ? (
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.12)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
            <div style={{fontSize:'2rem',marginBottom:'1rem'}}>📊</div>
            <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.5rem'}}>Sin proyectos activos</div>
            <div style={{color:'#8FA3CC',fontSize:'0.85rem',marginBottom:'1.5rem'}}>Crea un proyecto para empezar a registrar sus ingresos.</div>
            <a href="/proyectos" style={{background:'#1D9E75',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.875rem',fontWeight:'700'}}>Crear proyecto →</a>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:'1.5rem',alignItems:'start'}}>

            {/* LISTA DE INGRESOS */}
            <div>
              {proyectos.length > 1 && (
                <select value={proyectoSel} onChange={e => cambiarProyecto(e.target.value)} style={{width:'100%',background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',fontFamily:'Inter,sans-serif',marginBottom:'1.25rem'}}>
                  {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              )}

              <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.25rem',marginBottom:'1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{fontSize:'0.78rem',color:'#8FA3CC'}}>Total ingresos registrados</div>
                <div style={{fontSize:'1.4rem',fontWeight:'900',color:'#1D9E75',fontFamily:'monospace'}}>${total.toLocaleString('es-CO')}</div>
              </div>

              {ingresos.length === 0 ? (
                <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'12px',padding:'2rem',textAlign:'center'}}>
                  <div style={{color:'#8FA3CC',fontSize:'0.85rem'}}>Sin ingresos registrados todavía. {puedeRegistrar ? 'Registra la primera venta o contrato.' : 'El fundador o gerente puede registrar ingresos aquí.'}</div>
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                  {ingresos.map(i => (
                    <div key={i.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'1rem',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem'}}>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.3rem'}}>
                          <span style={{fontSize:'0.65rem',fontWeight:'700',padding:'0.15rem 0.5rem',borderRadius:'12px',background:`${TIPOS[i.tipo]?.color}22`,color:TIPOS[i.tipo]?.color,textTransform:'uppercase',letterSpacing:'0.04em'}}>{TIPOS[i.tipo]?.label}</span>
                          {i.comprobante && <span style={{fontSize:'0.68rem',color:'#8FA3CC'}}>Ref: {i.comprobante}</span>}
                        </div>
                        <div style={{fontSize:'0.88rem',color:'#fff',fontWeight:'600',marginBottom:'0.2rem'}}>{i.descripcion}</div>
                        <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>{new Date(i.fecha).toLocaleDateString('es-CO', {day:'numeric',month:'long',year:'numeric'})} · Registrado por {i.perfiles?.nombre || 'usuario'}</div>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'0.5rem',flexShrink:0}}>
                        <div style={{fontSize:'1rem',fontWeight:'800',color:'#1D9E75',fontFamily:'monospace'}}>${Number(i.valor).toLocaleString('es-CO')}</div>
                        {puedeRegistrar && (
                          <button onClick={() => eliminar(i.id, i.valor)} style={{background:'none',border:'none',color:'#D85A30',fontSize:'0.7rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Eliminar</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FORMULARIO — solo visible para fundador/gerente */}
            {puedeRegistrar ? (
              <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'14px',padding:'1.5rem',position:'sticky',top:'1.5rem'}}>
                <div style={{fontSize:'0.82rem',fontWeight:'700',color:'#fff',marginBottom:'1.25rem'}}>Registrar ingreso</div>

                <label htmlFor="ing-desc" style={{display:'block',fontSize:'0.72rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.3rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Descripción *</label>
                <textarea id="ing-desc" value={form.descripcion} onChange={e => setForm(f=>({...f,descripcion:e.target.value}))} placeholder="Ej: Contrato con cliente X por desarrollo de app" rows={2} style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 0.875rem',color:'#fff',fontSize:'0.875rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif',resize:'vertical',marginBottom:'1rem'}} />

                <label htmlFor="ing-tipo" style={{display:'block',fontSize:'0.72rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.3rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Tipo *</label>
                <select id="ing-tipo" value={form.tipo} onChange={e => setForm(f=>({...f,tipo:e.target.value}))} style={{width:'100%',background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 0.875rem',color:'#fff',fontSize:'0.875rem',outline:'none',fontFamily:'Inter,sans-serif',marginBottom:'1rem'}}>
                  <option value="venta">Venta</option>
                  <option value="contrato">Contrato</option>
                  <option value="servicio">Servicio</option>
                  <option value="otro">Otro</option>
                </select>

                <label htmlFor="ing-valor" style={{display:'block',fontSize:'0.72rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.3rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Valor (COP) *</label>
                <input id="ing-valor" type="number" value={form.valor} onChange={e => setForm(f=>({...f,valor:e.target.value}))} placeholder="Ej: 5000000" style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 0.875rem',color:'#fff',fontSize:'0.875rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif',marginBottom:'1rem'}} />

                <label htmlFor="ing-fecha" style={{display:'block',fontSize:'0.72rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.3rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Fecha</label>
                <input id="ing-fecha" type="date" value={form.fecha} onChange={e => setForm(f=>({...f,fecha:e.target.value}))} style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 0.875rem',color:'#fff',fontSize:'0.875rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif',marginBottom:'1rem'}} />

                <label htmlFor="ing-comp" style={{display:'block',fontSize:'0.72rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.3rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Comprobante / referencia (opcional)</label>
                <input id="ing-comp" value={form.comprobante} onChange={e => setForm(f=>({...f,comprobante:e.target.value}))} placeholder="Ej: FAC-2026-001" style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 0.875rem',color:'#fff',fontSize:'0.875rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif',marginBottom:'1.25rem'}} />

                {mensaje && (
                  <div style={{fontSize:'0.8rem',color: mensaje.startsWith('✓') ? '#1D9E75' : '#D85A30',marginBottom:'0.875rem'}}>{mensaje}</div>
                )}

                <button onClick={registrar} disabled={enviando} style={{width:'100%',background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.75rem',fontSize:'0.875rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif',opacity: enviando ? 0.6 : 1}}>
                  {enviando ? 'Registrando...' : 'Registrar ingreso'}
                </button>
              </div>
            ) : (
              <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'12px',padding:'1.25rem',textAlign:'center'}}>
                <div style={{fontSize:'0.82rem',color:'#8FA3CC',lineHeight:'1.6'}}>Solo el fundador, gerente o administrador del proyecto puede registrar ingresos.</div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
