'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Ingresos() {
  const [usuario, setUsuario] = useState(null)
  const [proyectos, setProyectos] = useState([])
  const [proyectoSel, setProyectoSel] = useState(null)
  const [ingresos, setIngresos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [vista, setVista] = useState('lista')
  const [enviando, setEnviando] = useState(false)
  const [form, setForm] = useState({
    descripcion: '',
    valor: '',
    fecha: new Date().toISOString().split('T')[0],
    fuente: ''
  })
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)

      const res = await fetch('/api/proyectos')
      const data = await res.json()
      const misproyectos = (data.proyectos || []).filter(p => p.fundador_id === user.id)
      setProyectos(misproyectos)

      if (misproyectos.length > 0) {
        setProyectoSel(misproyectos[0].id)
        await cargarIngresos(misproyectos[0].id)
      }
      setCargando(false)
    }
    cargar()
  }, [])

  async function cargarIngresos(pid) {
    const res = await fetch('/api/aportes?proyecto_id=' + pid)
    const data = await res.json()
    const ingresosData = (data.aportes || []).filter(a => a.tipo === 'capital' && a.valor > 0)
    setIngresos(ingresosData)
  }

  async function registrarIngreso() {
    if (!form.descripcion || !form.valor) {
      setMensaje('Completa descripción y valor')
      return
    }
    setEnviando(true)
    const res = await fetch('/api/aportes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proyecto_id: proyectoSel,
        aportante_id: usuario.id,
        tipo: 'capital',
        descripcion: form.descripcion + (form.fuente ? ' — Fuente: ' + form.fuente : ''),
        valor: parseInt(form.valor),
        fecha: form.fecha
      })
    })
    const data = await res.json()
    if (data.error) {
      setMensaje('Error: ' + data.error)
    } else {
      setIngresos(i => [data.aporte, ...i])
      setVista('lista')
      setForm({ descripcion: '', valor: '', fecha: new Date().toISOString().split('T')[0], fuente: '' })
    }
    setEnviando(false)
  }

  const totalIngresos = ingresos.reduce((s, i) => s + (i.valor || 0), 0)

  const calcularDistribucion = (total) => [
    { rol: 'Fundador', porcentaje: 40, valor: Math.round(total * 0.4), color: '#1D9E75' },
    { rol: 'Inversionista', porcentaje: 30, valor: Math.round(total * 0.3), color: '#E8A020' },
    { rol: 'Desarrollador', porcentaje: 20, valor: Math.round(total * 0.2), color: '#AFA9EC' },
    { rol: 'Especialistas', porcentaje: 10, valor: Math.round(total * 0.1), color: '#D85A30' },
  ]

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando...
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/dashboard" style={{textDecoration:'none'}}><div style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff'}}>Esca<span style={{color:'#1D9E75'}}>la</span></div></a>
        <div style={{display:'flex',gap:'1.5rem'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Dashboard</a>
          <a href="/aportes" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Aportes</a>
          <a href="/ingresos" style={{color:'#fff',fontSize:'0.82rem',fontWeight:'600',textDecoration:'none'}}>Ingresos</a>
        </div>
      </nav>

      <main style={{maxWidth:'900px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'2rem',flexWrap:'wrap',gap:'1rem'}}>
          <div>
            <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.4rem'}}>Fase de operación</div>
            <div style={{fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Ingresos del proyecto</div>
            <div style={{fontSize:'0.85rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Cuando la empresa empieza a facturar, los ingresos se distribuyen según los contratos firmados.</div>
          </div>
          {vista === 'lista' && proyectos.length > 0 && (
            <button onClick={() => setVista('nuevo')} style={{background:'#1D9E75',color:'#fff',border:'none',padding:'0.75rem 1.5rem',borderRadius:'8px',fontSize:'0.875rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
              + Registrar ingreso
            </button>
          )}
        </div>

        {proyectos.length === 0 ? (
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.12)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
            <div style={{fontSize:'2rem',marginBottom:'1rem'}}>💰</div>
            <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.5rem'}}>Solo el fundador puede registrar ingresos</div>
            <a href="/proyectos" style={{background:'#1D9E75',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.875rem',fontWeight:'700',display:'inline-block',marginTop:'1rem'}}>Publicar proyecto →</a>
          </div>
        ) : (
          <>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
              <div style={{background:'rgba(29,158,117,0.1)',border:'1px solid rgba(29,158,117,0.25)',borderRadius:'12px',padding:'1.25rem'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#1D9E75'}}>${totalIngresos.toLocaleString()}</div>
                <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Ingresos totales registrados</div>
              </div>
              <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.25rem'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#fff'}}>{ingresos.length}</div>
                <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Transacciones registradas</div>
              </div>
              <div style={{background:'rgba(232,160,32,0.1)',border:'1px solid rgba(232,160,32,0.25)',borderRadius:'12px',padding:'1.25rem'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#E8A020'}}>${Math.round(totalIngresos * 0.4).toLocaleString()}</div>
                <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Corresponde al fundador (40%)</div>
              </div>
            </div>

            {vista === 'nuevo' && (
              <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'14px',padding:'2rem',marginBottom:'2rem'}}>
                <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',marginBottom:'1.5rem'}}>Registrar nuevo ingreso</div>

                <label style={{display:'block',fontSize:'0.72rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.4rem',letterSpacing:'0.04em',textTransform:'uppercase'}}>Descripción *</label>
                <input value={form.descripcion} onChange={e => setForm(f=>({...f,descripcion:e.target.value}))} placeholder="Ej: Primera venta, Suscripción mensual cliente..." style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.75rem 1rem',color:'#fff',fontSize:'0.9rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif',marginBottom:'1rem'}} />

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
                  <div>
                    <label style={{display:'block',fontSize:'0.72rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.4rem',letterSpacing:'0.04em',textTransform:'uppercase'}}>Valor en pesos *</label>
                    <input type="number" value={form.valor} onChange={e => setForm(f=>({...f,valor:e.target.value}))} placeholder="Ej: 1500000" style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.75rem 1rem',color:'#fff',fontSize:'0.9rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif'}} />
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:'0.72rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.4rem',letterSpacing:'0.04em',textTransform:'uppercase'}}>Fecha</label>
                    <input type="date" value={form.fecha} onChange={e => setForm(f=>({...f,fecha:e.target.value}))} style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.75rem 1rem',color:'#fff',fontSize:'0.9rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif'}} />
                  </div>
                </div>

                <label style={{display:'block',fontSize:'0.72rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.4rem',letterSpacing:'0.04em',textTransform:'uppercase'}}>Fuente (opcional)</label>
                <input value={form.fuente} onChange={e => setForm(f=>({...f,fuente:e.target.value}))} placeholder="Ej: Cliente directo, App store, Referido..." style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.75rem 1rem',color:'#fff',fontSize:'0.9rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif',marginBottom:'1.5rem'}} />

                {form.valor && parseInt(form.valor) > 0 && (
                  <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'10px',padding:'1rem',marginBottom:'1.5rem'}}>
                    <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#1D9E75',marginBottom:'0.75rem'}}>Preview de distribución (referencial)</div>
                    {calcularDistribucion(parseInt(form.valor)).map(d => (
                      <div key={d.rol} style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem',padding:'0.3rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                        <span style={{color:'#8FA3CC'}}>{d.rol} ({d.porcentaje}%)</span>
                        <span style={{color:d.color,fontFamily:'monospace',fontWeight:'600'}}>${d.valor.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {mensaje && <div style={{background:'rgba(216,90,48,0.1)',border:'1px solid rgba(216,90,48,0.3)',borderRadius:'8px',padding:'0.875rem',color:'#D85A30',fontSize:'0.82rem',marginBottom:'1rem'}}>{mensaje}</div>}

                <div style={{display:'flex',gap:'0.75rem'}}>
                  <button onClick={() => {setVista('lista');setMensaje('')}} style={{background:'transparent',color:'#8FA3CC',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.875rem 1.5rem',fontSize:'0.875rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Cancelar</button>
                  <button onClick={registrarIngreso} disabled={enviando} style={{flex:1,background:enviando?'#0F6E56':'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.875rem',fontSize:'0.95rem',fontWeight:'700',cursor:enviando?'not-allowed':'pointer',fontFamily:'Inter,sans-serif'}}>
                    {enviando ? 'Registrando...' : 'Registrar ingreso →'}
                  </button>
                </div>
              </div>
            )}

            {ingresos.length === 0 && vista === 'lista' ? (
              <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.12)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
                <div style={{fontSize:'2rem',marginBottom:'1rem'}}>💰</div>
                <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.5rem'}}>Sin ingresos registrados</div>
                <div style={{color:'#8FA3CC',fontSize:'0.85rem',marginBottom:'1.5rem'}}>Cuando el proyecto empiece a facturar, registra los ingresos aquí para calcular la distribución.</div>
                <button onClick={() => setVista('nuevo')} style={{background:'#1D9E75',color:'#fff',border:'none',padding:'0.75rem 1.5rem',borderRadius:'8px',fontSize:'0.875rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>+ Registrar primer ingreso</button>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                {ingresos.map(i => (
                  <div key={i.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
                    <div>
                      <div style={{fontSize:'0.875rem',fontWeight:'600',color:'#fff',marginBottom:'0.2rem'}}>{i.descripcion}</div>
                      <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>{i.fecha}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontFamily:'monospace',fontSize:'1rem',fontWeight:'700',color:'#1D9E75'}}>${i.valor?.toLocaleString()}</div>
                      <div style={{fontSize:'0.68rem',color:'#8FA3CC',marginTop:'2px'}}>Fundador recibe: ${Math.round(i.valor*0.4).toLocaleString()}</div>
                    </div>
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
