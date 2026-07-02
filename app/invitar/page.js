'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Invitar() {
  const [usuario, setUsuario] = useState(null)
  const [proyectos, setProyectos] = useState([])
  const [roles, setRoles] = useState([])
  const [proyectoSel, setProyectoSel] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [form, setForm] = useState({ email: '', nombre: '', rol_id: '', mensaje: '' })
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState(null)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)
      const res = await fetch('/api/proyectos')
      const data = await res.json()
      const mios = (data.proyectos || []).filter(p => p.fundador_id === user.id)
      setProyectos(mios)
      if (mios.length > 0) {
        setProyectoSel(mios[0].id)
        const rRes = await fetch('/api/roles?proyecto_id=' + mios[0].id)
        const rData = await rRes.json()
        setRoles(rData.roles || [])
      }
      setCargando(false)
    }
    cargar()
  }, [])

  async function cambiarProyecto(pid) {
    setProyectoSel(pid)
    const res = await fetch('/api/roles?proyecto_id=' + pid)
    const data = await res.json()
    setRoles(data.roles || [])
    setForm(f => ({ ...f, rol_id: '' }))
  }

  async function enviarInvitacion() {
    if (!form.email || !form.nombre) return
    setEnviando(true)
    setResultado(null)

    const proyecto = proyectos.find(p => p.id === proyectoSel)
    const rol = roles.find(r => r.id === form.rol_id)

    const res = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'invitacion',
        destinatario: form.email,
        datos: {
          nombre_invitado: form.nombre,
          proyecto_nombre: proyecto?.nombre || 'Escala',
          rol_nombre: rol?.nombre || 'un rol',
          mensaje_personal: form.mensaje,
          proyecto_url: 'https://escala.network/proyectos/' + proyectoSel,
          registro_url: 'https://escala.network/registro'
        }
      })
    })
    const data = await res.json()

    if (data.ok) {
      setResultado({ ok: true, msg: 'Invitación enviada a ' + form.email })
      setForm(f => ({ ...f, email: '', nombre: '', mensaje: '' }))
    } else {
      setResultado({ ok: false, msg: 'Error al enviar. Intenta de nuevo.' })
    }
    setEnviando(false)
  }

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>Cargando...</div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/dashboard" style={{textDecoration:'none'}}><div style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff'}}>Esca<span style={{color:'#1D9E75'}}>la</span></div></a>
        <div style={{display:'flex',gap:'1.5rem'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Dashboard</a>
          <a href="/admin" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Panel fundador</a>
          <a href="/invitar" style={{color:'#fff',fontSize:'0.82rem',fontWeight:'600',textDecoration:'none'}}>Invitar</a>
        </div>
      </nav>

      <main style={{maxWidth:'680px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'2rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#E8A020',marginBottom:'0.4rem'}}>Reclutamiento directo</div>
          <div style={{fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em',marginBottom:'0.3rem'}}>Invitar a alguien al equipo</div>
          <div style={{fontSize:'0.85rem',color:'#8FA3CC'}}>Envía una invitación personalizada por email para que se postule a un rol específico.</div>
        </div>

        {proyectos.length === 0 ? (
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.12)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
            <div style={{fontSize:'2rem',marginBottom:'1rem'}}>🚀</div>
            <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.5rem'}}>Primero publica un proyecto</div>
            <a href="/proyectos" style={{background:'#1D9E75',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.875rem',fontWeight:'700',display:'inline-block',marginTop:'1rem'}}>Publicar proyecto →</a>
          </div>
        ) : (
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'14px',padding:'2rem'}}>
            {proyectos.length > 1 && (
              <div style={{marginBottom:'1.25rem'}}>
                <label style={{display:'block',fontSize:'0.72rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.4rem',letterSpacing:'0.04em',textTransform:'uppercase'}}>Proyecto</label>
                <select value={proyectoSel} onChange={e=>cambiarProyecto(e.target.value)} style={{width:'100%',background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.75rem 1rem',color:'#fff',fontSize:'0.9rem',outline:'none',fontFamily:'Inter,sans-serif',boxSizing:'border-box'}}>
                  {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
            )}

            <div style={{marginBottom:'1.25rem'}}>
              <label style={{display:'block',fontSize:'0.72rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.4rem',letterSpacing:'0.04em',textTransform:'uppercase'}}>Rol al que invitas (opcional)</label>
              <select value={form.rol_id} onChange={e=>setForm(f=>({...f,rol_id:e.target.value}))} style={{width:'100%',background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.75rem 1rem',color:'#fff',fontSize:'0.9rem',outline:'none',fontFamily:'Inter,sans-serif',boxSizing:'border-box'}}>
                <option value="">Sin rol específico</option>
                {roles.filter(r=>r.estado==='abierto').map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.25rem'}}>
              <div>
                <label style={{display:'block',fontSize:'0.72rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.4rem',letterSpacing:'0.04em',textTransform:'uppercase'}}>Nombre *</label>
                <input value={form.nombre} onChange={e=>setForm(f=>({...f,nombre:e.target.value}))} placeholder="Nombre de la persona" style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.75rem 1rem',color:'#fff',fontSize:'0.9rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif'}}/>
              </div>
              <div>
                <label style={{display:'block',fontSize:'0.72rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.4rem',letterSpacing:'0.04em',textTransform:'uppercase'}}>Email *</label>
                <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="correo@ejemplo.com" style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.75rem 1rem',color:'#fff',fontSize:'0.9rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif'}}/>
              </div>
            </div>

            <div style={{marginBottom:'1.5rem'}}>
              <label style={{display:'block',fontSize:'0.72rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.4rem',letterSpacing:'0.04em',textTransform:'uppercase'}}>Mensaje personal (opcional)</label>
              <textarea value={form.mensaje} onChange={e=>setForm(f=>({...f,mensaje:e.target.value}))} placeholder="Por qué crees que encaja en el proyecto..." rows={3} style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.75rem 1rem',color:'#fff',fontSize:'0.9rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif',resize:'vertical'}}/>
            </div>

            {resultado && (
              <div style={{background: resultado.ok ? 'rgba(29,158,117,0.1)' : 'rgba(216,90,48,0.1)', border: `1px solid ${resultado.ok ? 'rgba(29,158,117,0.3)' : 'rgba(216,90,48,0.3)'}`, borderRadius:'8px', padding:'0.875rem', color: resultado.ok ? '#1D9E75' : '#D85A30', fontSize:'0.82rem', marginBottom:'1rem'}}>
                {resultado.msg}
              </div>
            )}

            <button onClick={enviarInvitacion} disabled={enviando||!form.email||!form.nombre} style={{width:'100%',background: form.email&&form.nombre ? '#1D9E75' : 'rgba(255,255,255,0.08)',color:'#fff',border:'none',borderRadius:'8px',padding:'0.875rem',fontSize:'0.95rem',fontWeight:'700',cursor: form.email&&form.nombre ? 'pointer' : 'not-allowed',fontFamily:'Inter,sans-serif'}}>
              {enviando ? 'Enviando invitacion...' : 'Enviar invitacion →'}
            </button>
          </div>
        )}

        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'12px',padding:'1.25rem',marginTop:'1.5rem'}}>
          <div style={{fontSize:'0.75rem',fontWeight:'700',color:'#8FA3CC',marginBottom:'0.5rem',letterSpacing:'0.04em',textTransform:'uppercase'}}>También puedes compartir el link del proyecto</div>
          {proyectoSel && (
            <div style={{display:'flex',gap:'0.75rem',alignItems:'center',flexWrap:'wrap'}}>
              <code style={{fontSize:'0.78rem',color:'#1D9E75',background:'rgba(29,158,117,0.08)',padding:'0.4rem 0.75rem',borderRadius:'6px',flex:1,wordBreak:'break-all'}}>
                {'escala.network/p/' + proyectoSel}
              </code>
              <button onClick={() => navigator.clipboard.writeText('https://escala.network/p/' + proyectoSel)} style={{background:'rgba(255,255,255,0.08)',color:'#fff',border:'none',borderRadius:'6px',padding:'0.4rem 0.875rem',fontSize:'0.75rem',cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap'}}>
                Copiar link
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
