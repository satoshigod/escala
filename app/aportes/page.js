'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const tiposAporte = [
  { id: 'horas', label: '⏱️ Horas de trabajo', desc: 'Tiempo dedicado al proyecto' },
  { id: 'entregable', label: '📄 Entregable', desc: 'Documento, diseño, código, etc.' },
  { id: 'capital', label: '💵 Capital', desc: 'Dinero invertido en el proyecto' },
  { id: 'activo', label: '🏗️ Activo', desc: 'Equipo, espacio, herramientas' },
  { id: 'contacto', label: '🤝 Contacto', desc: 'Conexión o red de valor' },
]

export default function Aportes() {
  const [usuario, setUsuario] = useState(null)
  const [proyectos, setProyectos] = useState([])
  const [aportes, setAportes] = useState([])
  const [vista, setVista] = useState('lista')
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [form, setForm] = useState({
    proyecto_id: '',
    tipo: 'horas',
    descripcion: '',
    valor: '',
    fecha: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro'; return }
      setUsuario(user)

      const res = await fetch('/api/proyectos')
      const data = await res.json()
      setProyectos(data.proyectos || [])

      if (data.proyectos && data.proyectos.length > 0) {
        setForm(f => ({ ...f, proyecto_id: data.proyectos[0].id }))
        const aRes = await fetch('/api/aportes?proyecto_id=' + data.proyectos[0].id)
        const aData = await aRes.json()
        setAportes(aData.aportes || [])
      }
      setCargando(false)
    }
    cargar()
  }, [])

  async function cambiarProyecto(id) {
    setForm(f => ({ ...f, proyecto_id: id }))
    const res = await fetch('/api/aportes?proyecto_id=' + id)
    const data = await res.json()
    setAportes(data.aportes || [])
  }

  async function registrar() {
    if (!form.descripcion || !form.valor || !form.proyecto_id) {
      setMensaje('Completa todos los campos')
      return
    }
    setEnviando(true)
    setMensaje('')

    const res = await fetch('/api/aportes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, aportante_id: usuario.id, valor: parseInt(form.valor) })
    })
    const data = await res.json()

    if (data.error) {
      setMensaje('Error: ' + data.error)
    } else {
      setAportes(a => [data.aporte, ...a])
      setVista('lista')
      setForm(f => ({ ...f, descripcion: '', valor: '' }))
    }
    setEnviando(false)
  }

  const totalAportes = aportes.reduce((sum, a) => sum + (a.valor || 0), 0)
  const misAportes = aportes.filter(a => a.aportante_id === usuario?.id)
  const totalMios = misAportes.reduce((sum, a) => sum + (a.valor || 0), 0)

  const tipoLabel = { horas: '⏱️', entregable: '📄', capital: '💵', activo: '🏗️', contacto: '🤝' }

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando aportes...
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff'}}>Esca<span style={{color:'#1D9E75'}}>la</span></div>
        <div style={{display:'flex',gap:'1.5rem'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Dashboard</a>
          <a href="/hitos" style={{color:"#8FA3CC",fontSize:"0.82rem",textDecoration:"none"}}>Hitos</a><a href="/proyectos" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Proyectos</a>
          <a href="/aportes" style={{color:'#fff',fontSize:'0.82rem',fontWeight:'600',textDecoration:'none'}}>Aportes</a>
          <a href="/admin" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Panel fundador</a>
        </div>
      </nav>

      <main style={{maxWidth:'900px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'2rem',flexWrap:'wrap',gap:'1rem'}}>
          <div>
            <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.4rem'}}>Trazabilidad</div>
            <div style={{fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Registro de aportes</div>
            <div style={{fontSize:'0.85rem',color:'#8FA3CC',marginTop:'0.3rem'}}>{aportes.length} aporte{aportes.length !== 1 ? 's' : ''} registrado{aportes.length !== 1 ? 's' : ''}</div>
          </div>
          {vista === 'lista' && (
            <button onClick={() => setVista('nuevo')} style={{background:'#1D9E75',color:'#fff',border:'none',padding:'0.75rem 1.5rem',borderRadius:'8px',fontSize:'0.875rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap'}}>
              + Registrar aporte
            </button>
          )}
        </div>

        {proyectos.length > 1 && (
          <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginBottom:'1.5rem'}}>
            {proyectos.map(p => (
              <button key={p.id} onClick={() => cambiarProyecto(p.id)} style={{background: form.proyecto_id === p.id ? '#1D9E75' : 'rgba(255,255,255,0.05)', color: form.proyecto_id === p.id ? '#fff' : '#8FA3CC', border: form.proyecto_id === p.id ? 'none' : '1px solid rgba(255,255,255,0.12)', borderRadius:'8px', padding:'0.4rem 0.875rem', fontSize:'0.8rem', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif'}}>
                {p.nombre}
              </button>
            ))}
          </div>
        )}

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
          <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#fff',lineHeight:'1'}}>${totalMios.toLocaleString()}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Mis aportes totales</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#1D9E75',lineHeight:'1'}}>${totalAportes.toLocaleString()}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Total del proyecto</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#E8A020',lineHeight:'1'}}>{misAportes.length}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Mis aportes registrados</div>
          </div>
        </div>

        {vista === 'nuevo' && (
          <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'14px',padding:'2rem',marginBottom:'2rem'}}>
            <div style={{fontSize:'1rem',fontWeight:'700',color:'#fff',marginBottom:'0.3rem'}}>Registrar nuevo aporte</div>
            <div style={{fontSize:'0.82rem',color:'#8FA3CC',marginBottom:'1.75rem'}}>Cada aporte queda registrado con fecha y valor. El fundador lo valida.</div>

            <div style={{fontSize:'0.72rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.5rem',letterSpacing:'0.04em',textTransform:'uppercase'}}>Tipo de aporte</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:'0.5rem',marginBottom:'1.25rem'}}>
              {tiposAporte.map(t => (
                <div key={t.id} onClick={() => setForm(f => ({...f, tipo: t.id}))} style={{background: form.tipo === t.id ? 'rgba(29,158,117,0.15)' : 'rgba(255,255,255,0.04)', border: form.tipo === t.id ? '1px solid rgba(29,158,117,0.4)' : '1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'0.75rem', cursor:'pointer'}}>
                  <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#fff',marginBottom:'0.15rem'}}>{t.label}</div>
                  <div style={{fontSize:'0.7rem',color:'#8FA3CC'}}>{t.desc}</div>
                </div>
              ))}
            </div>

            <div style={{marginBottom:'1rem'}}>
              <label style={{display:'block',fontSize:'0.72rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.4rem',letterSpacing:'0.04em',textTransform:'uppercase'}}>Descripción *</label>
              <textarea value={form.descripcion} onChange={e => setForm(f=>({...f,descripcion:e.target.value}))} placeholder="¿Qué hiciste? Sé específico — esto queda en el expediente del proyecto." style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.75rem 1rem',color:'#fff',fontSize:'0.9rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif',resize:'vertical',minHeight:'80px',marginBottom:'0'}} />
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.5rem'}}>
              <div>
                <label style={{display:'block',fontSize:'0.72rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.4rem',letterSpacing:'0.04em',textTransform:'uppercase'}}>Valor en pesos *</label>
                <input type="number" value={form.valor} onChange={e => setForm(f=>({...f,valor:e.target.value}))} placeholder="Ej: 500000" style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.75rem 1rem',color:'#fff',fontSize:'0.9rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif'}} />
              </div>
              <div>
                <label style={{display:'block',fontSize:'0.72rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.4rem',letterSpacing:'0.04em',textTransform:'uppercase'}}>Fecha</label>
                <input type="date" value={form.fecha} onChange={e => setForm(f=>({...f,fecha:e.target.value}))} style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.75rem 1rem',color:'#fff',fontSize:'0.9rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif'}} />
              </div>
            </div>

            {mensaje && <div style={{background:'rgba(216,90,48,0.1)',border:'1px solid rgba(216,90,48,0.3)',borderRadius:'8px',padding:'0.875rem',color:'#D85A30',fontSize:'0.82rem',marginBottom:'1rem'}}>{mensaje}</div>}

            <div style={{display:'flex',gap:'0.75rem'}}>
              <button onClick={() => {setVista('lista');setMensaje('')}} style={{background:'transparent',color:'#8FA3CC',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.875rem 1.5rem',fontSize:'0.875rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Cancelar</button>
              <button onClick={registrar} disabled={enviando} style={{flex:1,background:enviando?'#0F6E56':'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.875rem',fontSize:'0.95rem',fontWeight:'700',cursor:enviando?'not-allowed':'pointer',fontFamily:'Inter,sans-serif'}}>
                {enviando ? 'Registrando...' : 'Registrar aporte →'}
              </button>
            </div>
          </div>
        )}

        {aportes.length === 0 ? (
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.12)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
            <div style={{fontSize:'2rem',marginBottom:'1rem'}}>📊</div>
            <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.5rem'}}>Sin aportes registrados</div>
            <div style={{color:'#8FA3CC',fontSize:'0.85rem',marginBottom:'1.5rem'}}>Registra tu primer aporte para que quede en el expediente del proyecto.</div>
            <button onClick={() => setVista('nuevo')} style={{background:'#1D9E75',color:'#fff',border:'none',padding:'0.75rem 1.5rem',borderRadius:'8px',fontSize:'0.875rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>+ Registrar aporte</button>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
            {aportes.map(a => (
              <div key={a.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'1rem 1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'0.75rem'}}>
                <div style={{display:'flex',gap:'1rem',alignItems:'flex-start'}}>
                  <div style={{fontSize:'1.25rem',marginTop:'2px'}}>{tipoLabel[a.tipo] || '📋'}</div>
                  <div>
                    <div style={{fontSize:'0.875rem',fontWeight:'600',color:'#fff',marginBottom:'0.2rem'}}>{a.descripcion}</div>
                    <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>{a.fecha} · {a.tipo} · {a.validado ? '✅ Validado' : '⏳ Pendiente validación'}</div>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontFamily:'monospace',fontSize:'0.95rem',fontWeight:'700',color:'#fff'}}>${a.valor?.toLocaleString()}</div>
                  <div style={{fontSize:'0.68rem',color:a.aportante_id === usuario?.id ? '#1D9E75' : '#8FA3CC',marginTop:'2px'}}>{a.aportante_id === usuario?.id ? 'Mi aporte' : 'Otro aportante'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
