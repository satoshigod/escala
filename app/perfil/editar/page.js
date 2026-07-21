'use client'
import { useState, useEffect } from 'react'
import NavApp from '@/components/NavApp'
import { supabase } from '../../../lib/supabase'

const IDIOMAS_DISPONIBLES = ['Español', 'Inglés', 'Portugués', 'Francés', 'Alemán', 'Italiano', 'Mandarín', 'Otro']
const DISPONIBILIDAD_OPCIONES = [
  { id: 'tiempo_completo', label: 'Tiempo completo', desc: '+30 horas/semana' },
  { id: 'medio_tiempo', label: 'Medio tiempo', desc: '15-30 horas/semana' },
  { id: 'pocas_horas', label: 'Pocas horas', desc: 'menos de 15 horas/semana' },
  { id: 'fines_semana', label: 'Solo fines de semana', desc: 'disponibilidad limitada' },
]

function CertDocumentos({ usuario, perfil, setPerfil }) {
  const [subiendo, setSubiendo] = useState({ tarjeta: false, jcc: false })
  const [mensaje, setMensaje] = useState('')

  async function subirDoc(campo, file) {
    if (!file) return
    const key = campo === 'cert_tarjeta_profesional_url' ? 'tarjeta' : 'jcc'
    setSubiendo(s => ({ ...s, [key]: true }))
    setMensaje('')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('carpeta', 'certificaciones')
      const resUp = await fetch('/api/upload', { method: 'POST', body: form })
      const dataUp = await resUp.json()
      if (dataUp.error) { setMensaje('Error al subir: ' + dataUp.error); return }

      const resPatch = await fetch('/api/usuarios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: usuario.id, [campo]: dataUp.url })
      })
      const dataPatch = await resPatch.json()
      if (dataPatch.error) { setMensaje('Error al guardar: ' + dataPatch.error); return }
      setPerfil(dataPatch.usuario)
      setMensaje('✓ Documento guardado. Tu Score se ha actualizado.')
      setTimeout(() => setMensaje(''), 4000)
    } finally {
      setSubiendo(s => ({ ...s, [key]: false }))
    }
  }

  const docs = [
    {
      campo: 'cert_tarjeta_profesional_url',
      key: 'tarjeta',
      emoji: '🪪',
      titulo: 'Tarjeta Profesional de Contador Público',
      desc: 'Sube una copia legible (anverso y reverso en un solo PDF o imagen). Acredita que estás habilitado como contador público.',
      badge: 'cert_tarjeta_profesional',
      urlActual: perfil?.cert_tarjeta_profesional_url,
    },
    {
      campo: 'cert_jcc_url',
      key: 'jcc',
      emoji: '📋',
      titulo: 'Certificado de Vigencia JCC',
      desc: 'Certificado de Vigencia de Inscripción y Antecedentes Disciplinarios expedido por la Junta Central de Contadores. Muchas empresas piden uno reciente (últimos 30–90 días).',
      badge: 'cert_jcc',
      urlActual: perfil?.cert_jcc_url,
    },
  ]

  return (
    <div style={{background:'rgba(74,144,217,0.06)',border:'1px solid rgba(74,144,217,0.2)',borderRadius:'14px',padding:'1.75rem',marginBottom:'1.25rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:'0.6rem',marginBottom:'0.3rem'}}>
        <span style={{fontSize:'1rem'}}>🏅</span>
        <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff'}}>Documentos profesionales — Contador (Colombia)</div>
      </div>
      <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginBottom:'1.25rem',lineHeight:'1.6'}}>
        Subir estos documentos sube tu Reputación Escala y le da más confianza a los fundadores. Son opcionales, pero los proyectos más formales los suelen pedir.
      </div>
      {mensaje && <div style={{fontSize:'0.75rem',fontWeight:'600',color:'#1D9E75',marginBottom:'1rem'}}>{mensaje}</div>}
      <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        {docs.map(d => (
          <div key={d.campo} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'10px',padding:'1rem 1.125rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem',flexWrap:'wrap'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.4rem',marginBottom:'0.3rem'}}>
                  <span>{d.emoji}</span>
                  <span style={{fontSize:'0.8rem',fontWeight:'700',color:'#fff'}}>{d.titulo}</span>
                  {d.urlActual && <span style={{fontSize:'0.62rem',fontWeight:'700',color:'#1D9E75',background:'rgba(29,158,117,0.12)',padding:'1px 6px',borderRadius:'10px'}}>✓ Subido</span>}
                </div>
                <div style={{fontSize:'0.7rem',color:'#8FA3CC',lineHeight:'1.5'}}>{d.desc}</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'0.4rem',alignItems:'flex-end',flexShrink:0}}>
                <label style={{background:'rgba(74,144,217,0.15)',border:'1px solid rgba(74,144,217,0.3)',color:'#4A90D9',borderRadius:'8px',padding:'0.4rem 0.875rem',fontSize:'0.72rem',fontWeight:'700',cursor:'pointer',whiteSpace:'nowrap'}}>
                  {subiendo[d.key] ? 'Subiendo...' : d.urlActual ? 'Reemplazar' : 'Subir documento'}
                  <input type="file" accept="image/*,application/pdf" style={{display:'none'}} disabled={subiendo[d.key]} onChange={e=>subirDoc(d.campo, e.target.files?.[0])} />
                </label>
                {d.urlActual && (
                  <a href={d.urlActual} target="_blank" rel="noreferrer" style={{fontSize:'0.65rem',color:'#8FA3CC',textDecoration:'underline'}}>Ver documento →</a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function EditarPerfil() {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [nuevoReconocimiento, setNuevoReconocimiento] = useState('')
  const [prefs, setPrefs] = useState({
    email_activo: true,
    push_activo: true,
    categorias_email_desactivadas: [],
    categorias_push_desactivadas: [],
  })
  const [guardandoPrefs, setGuardandoPrefs] = useState(false)

  const [form, setForm] = useState({
    nombre: '', ciudad: '', whatsapp: '', especialidad: '',
    lo_que_aporto: '', lo_que_busco: '',
    idiomas: [], disponibilidad: '', reconocimientos: []
  })

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)

      const res = await fetch('/api/usuarios?id=' + user.id)
      const data = await res.json()
      setPerfil(data.usuario)
      setForm({
        nombre: data.usuario?.nombre || '',
        ciudad: data.usuario?.ciudad || '',
        whatsapp: data.usuario?.whatsapp || '',
        especialidad: data.usuario?.especialidad || '',
        lo_que_aporto: data.usuario?.lo_que_aporto || '',
        lo_que_busco: data.usuario?.lo_que_busco || '',
        idiomas: data.usuario?.idiomas || ['Español'],
        disponibilidad: data.usuario?.disponibilidad || '',
        reconocimientos: data.usuario?.reconocimientos || [],
      })
      // Cargar preferencias de notificación
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const prefRes = await fetch('/api/notificaciones/preferencias', {
          headers: { authorization: 'Bearer ' + session.access_token }
        })
        const prefData = await prefRes.json()
        if (prefData.preferencias) setPrefs(prefData.preferencias)
      }
      setCargando(false)
    }
    cargar()
  }, [])

  function actualizar(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }))
  }

  function toggleIdioma(idioma) {
    setForm(f => ({
      ...f,
      idiomas: f.idiomas.includes(idioma) ? f.idiomas.filter(i => i !== idioma) : [...f.idiomas, idioma]
    }))
  }

  function agregarReconocimiento() {
    if (!nuevoReconocimiento.trim()) return
    setForm(f => ({ ...f, reconocimientos: [...f.reconocimientos, nuevoReconocimiento.trim()] }))
    setNuevoReconocimiento('')
  }

  function quitarReconocimiento(i) {
    setForm(f => ({ ...f, reconocimientos: f.reconocimientos.filter((_, idx) => idx !== i) }))
  }

  async function guardarPrefs(nuevoPrefs) {
    setGuardandoPrefs(true)
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/notificaciones/preferencias', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + session.access_token },
      body: JSON.stringify(nuevoPrefs)
    })
    setPrefs(nuevoPrefs)
    setGuardandoPrefs(false)
  }

  function toggleCategoria(canal, categoria) {
    const key = canal === 'email' ? 'categorias_email_desactivadas' : 'categorias_push_desactivadas'
    const actual = prefs[key] || []
    const nuevo = actual.includes(categoria)
      ? actual.filter(c => c !== categoria)
      : [...actual, categoria]
    const nuevasPrefs = { ...prefs, [key]: nuevo }
    guardarPrefs(nuevasPrefs)
  }

  function toggleGlobal(canal, valor) {
    const key = canal === 'email' ? 'email_activo' : 'push_activo'
    guardarPrefs({ ...prefs, [key]: valor })
  }

  async function guardar() {
    setGuardando(true)
    setMensaje('')
    const res = await fetch('/api/usuarios', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: usuario.id, ...form })
    })
    const data = await res.json()
    if (data.error) {
      setMensaje('Error: ' + data.error)
    } else {
      setMensaje('✓ Perfil actualizado correctamente')
      setTimeout(() => setMensaje(''), 3000)
    }
    setGuardando(false)
  }

  const s = {
    input: { width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', padding:'0.75rem 1rem', color:'#fff', fontSize:'0.875rem', outline:'none', boxSizing:'border-box', fontFamily:'Inter,sans-serif' },
    label: { display:'block', fontSize:'0.72rem', fontWeight:'600', color:'#8FA3CC', marginBottom:'0.4rem', letterSpacing:'0.04em', textTransform:'uppercase' },
  }

  if (cargando) return <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>Cargando...</div>

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif',color:'#fff'}}>
      <NavApp paginaActual="perfil-editar" />

      <main style={{maxWidth:'640px',margin:'0 auto',padding:'2rem 1.25rem 4rem'}}>
        <div style={{marginBottom:'2rem'}}>
          <div style={{fontSize:'1.5rem',fontWeight:'900',letterSpacing:'-0.03em',marginBottom:'0.3rem'}}>Editar mi perfil</div>
          <div style={{fontSize:'0.85rem',color:'#8FA3CC'}}>Esta información aparece en tu perfil público de Escala.</div>
        </div>

        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'1.75rem',marginBottom:'1.25rem'}}>
          <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'1.25rem'}}>Datos básicos</div>

          <label style={s.label} htmlFor="pe-nombre">Nombre completo</label>
          <input id="pe-nombre" style={{...s.input,marginBottom:'1rem'}} value={form.nombre} onChange={e=>actualizar('nombre',e.target.value)} />

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
            <div>
              <label style={s.label} htmlFor="pe-ciudad">Ciudad</label>
              <input id="pe-ciudad" style={s.input} value={form.ciudad} onChange={e=>actualizar('ciudad',e.target.value)} placeholder="Medellín, Bogotá..." />
            </div>
            <div>
              <label style={s.label} htmlFor="pe-whatsapp">WhatsApp</label>
              <input id="pe-whatsapp" style={s.input} value={form.whatsapp} onChange={e=>actualizar('whatsapp',e.target.value)} placeholder="+57 300 123 4567" />
            </div>
          </div>

          <label style={s.label} htmlFor="pe-especialidad">Especialidad o profesión</label>
          <input id="pe-especialidad" style={s.input} value={form.especialidad} onChange={e=>actualizar('especialidad',e.target.value)} placeholder="Ej: Abogado, Diseñador, Gerente de Proyecto..." />
        </div>

        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'1.75rem',marginBottom:'1.25rem'}}>
          <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'1.25rem'}}>Idiomas</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:'0.5rem'}}>
            {IDIOMAS_DISPONIBLES.map(idioma => (
              <button key={idioma} type="button" onClick={()=>toggleIdioma(idioma)} style={{
                background: form.idiomas.includes(idioma) ? 'rgba(29,158,117,0.15)' : 'rgba(255,255,255,0.05)',
                border: form.idiomas.includes(idioma) ? '1px solid rgba(29,158,117,0.4)' : '1px solid rgba(255,255,255,0.1)',
                color: form.idiomas.includes(idioma) ? '#1D9E75' : '#8FA3CC',
                borderRadius:'20px', padding:'0.4rem 0.95rem', fontSize:'0.78rem', cursor:'pointer', fontFamily:'Inter,sans-serif', fontWeight: form.idiomas.includes(idioma) ? '700' : '400'
              }}>
                {form.idiomas.includes(idioma) ? '✓ ' : ''}{idioma}
              </button>
            ))}
          </div>
        </div>

        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'1.75rem',marginBottom:'1.25rem'}}>
          <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'1.25rem'}}>Disponibilidad</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.6rem'}}>
            {DISPONIBILIDAD_OPCIONES.map(op => (
              <button key={op.id} type="button" onClick={()=>actualizar('disponibilidad',op.id)} style={{
                textAlign:'left', background: form.disponibilidad===op.id ? 'rgba(83,74,183,0.12)' : 'rgba(255,255,255,0.04)',
                border: form.disponibilidad===op.id ? '1px solid rgba(83,74,183,0.4)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius:'10px', padding:'0.875rem', cursor:'pointer', fontFamily:'Inter,sans-serif'
              }}>
                <div style={{fontSize:'0.82rem',fontWeight:'700',color: form.disponibilidad===op.id ? '#AFA9EC' : '#fff',marginBottom:'0.2rem'}}>{op.label}</div>
                <div style={{fontSize:'0.7rem',color:'#8FA3CC'}}>{op.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'1.75rem',marginBottom:'1.25rem'}}>
          <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'0.5rem'}}>Reconocimientos</div>
          <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginBottom:'1.25rem'}}>Certificaciones, logros o reconocimientos relevantes — uno por uno.</div>

          {form.reconocimientos.length > 0 && (
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem',marginBottom:'1rem'}}>
              {form.reconocimientos.map((r,i) => (
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(232,160,32,0.08)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'8px',padding:'0.6rem 0.875rem'}}>
                  <span style={{fontSize:'0.8rem',color:'#fff'}}>🏆 {r}</span>
                  <button type="button" onClick={()=>quitarReconocimiento(i)} style={{background:'none',border:'none',color:'#D85A30',cursor:'pointer',fontSize:'0.85rem'}}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div style={{display:'flex',gap:'0.5rem'}}>
            <input style={s.input} value={nuevoReconocimiento} onChange={e=>setNuevoReconocimiento(e.target.value)} placeholder="Ej: Certificación PMP, Mejor proyecto 2025..." onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),agregarReconocimiento())} />
            <button type="button" onClick={agregarReconocimiento} style={{background:'#E8A020',color:'#fff',border:'none',borderRadius:'8px',padding:'0.6rem 1.25rem',fontSize:'0.78rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap'}}>+ Agregar</button>
          </div>
        </div>

        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'1.75rem',marginBottom:'1.25rem'}}>
          <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'0.25rem'}}>Sobre ti</div>
          <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginBottom:'1.25rem'}}>Cuéntale a los fundadores qué aportas y qué buscas en Escala.</div>
          <label style={s.label} htmlFor="pe-aporto">¿Qué tienes para aportar?</label>
          <textarea id="pe-aporto" style={{...s.input,marginBottom:'1rem',minHeight:'70px',resize:'vertical'}} value={form.lo_que_aporto} onChange={e=>actualizar('lo_que_aporto',e.target.value)} />
          <label style={s.label} htmlFor="pe-busco">¿Qué buscas en Escala?</label>
          <textarea id="pe-busco" style={{...s.input,minHeight:'70px',resize:'vertical'}} value={form.lo_que_busco} onChange={e=>actualizar('lo_que_busco',e.target.value)} />
        </div>

        {/* SECCIÓN DOCUMENTOS PROFESIONALES — Contador Colombia */}
        {(perfil?.especialidad?.toLowerCase().includes('contad') || perfil?.rol_principal === 'especialista') && (
          <CertDocumentos usuario={usuario} perfil={perfil} setPerfil={setPerfil} />
        )}
        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem',marginBottom:'1.5rem'}}>
          <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'0.25rem'}}>Notificaciones</div>
          <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginBottom:'1rem'}}>Elige qué notificaciones quieres recibir por email ✉️ y push 🔔. Los cambios se guardan al instante.</div>

          {/* Toggles globales */}
          <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem'}}>
            <button onClick={()=>toggleGlobal('email',!prefs.email_activo)} style={{fontSize:'0.72rem',fontWeight:'700',padding:'0.3rem 0.8rem',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.1)',cursor:'pointer',fontFamily:'Inter,sans-serif',background:prefs.email_activo ? 'rgba(29,158,117,0.15)' : 'rgba(255,255,255,0.05)',color:prefs.email_activo ? '#1D9E75' : '#8FA3CC'}}>
              ✉️ Email global: {prefs.email_activo ? 'activo' : 'desactivado'}
            </button>
            <button onClick={()=>toggleGlobal('push',!prefs.push_activo)} style={{fontSize:'0.72rem',fontWeight:'700',padding:'0.3rem 0.8rem',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.1)',cursor:'pointer',fontFamily:'Inter,sans-serif',background:prefs.push_activo ? 'rgba(29,158,117,0.15)' : 'rgba(255,255,255,0.05)',color:prefs.push_activo ? '#1D9E75' : '#8FA3CC'}}>
              🔔 Push global: {prefs.push_activo ? 'activo' : 'desactivado'}
            </button>
          </div>

          {/* Por categoría */}
          <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginBottom:'0.5rem'}}>Por categoría (cuando el global está activo):</div>
          
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',padding:'0.75rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)',gap:'1rem'}}>
                <div>
                  <div style={{fontSize:'0.82rem',fontWeight:'600',color:'#fff',marginBottom:'0.1rem'}}>Postulaciones</div>
                  <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>Cuando te aceptan, rechazan o llega una nueva postulación a tu proyecto</div>
                </div>
                <div style={{display:'flex',gap:'0.5rem',flexShrink:0}}>
                  <button onClick={()=>toggleCategoria('email','postulaciones')} style={{fontSize:'0.65rem',fontWeight:'700',padding:'0.2rem 0.6rem',borderRadius:'20px',border:'none',cursor:'pointer',fontFamily:'Inter,sans-serif',background:(prefs.categorias_email_desactivadas||[]).includes('postulaciones') ? 'rgba(255,255,255,0.08)' : 'rgba(29,158,117,0.2)',color:(prefs.categorias_email_desactivadas||[]).includes('postulaciones') ? '#8FA3CC' : '#1D9E75'}}>
                    ✉️ {(prefs.categorias_email_desactivadas||[]).includes('postulaciones') ? 'off' : 'on'}
                  </button>
                  <button onClick={()=>toggleCategoria('push','postulaciones')} style={{fontSize:'0.65rem',fontWeight:'700',padding:'0.2rem 0.6rem',borderRadius:'20px',border:'none',cursor:'pointer',fontFamily:'Inter,sans-serif',background:(prefs.categorias_push_desactivadas||[]).includes('postulaciones') ? 'rgba(255,255,255,0.08)' : 'rgba(29,158,117,0.2)',color:(prefs.categorias_push_desactivadas||[]).includes('postulaciones') ? '#8FA3CC' : '#1D9E75'}}>
                    🔔 {(prefs.categorias_push_desactivadas||[]).includes('postulaciones') ? 'off' : 'on'}
                  </button>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',padding:'0.75rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)',gap:'1rem'}}>
                <div>
                  <div style={{fontSize:'0.82rem',fontWeight:'600',color:'#fff',marginBottom:'0.1rem'}}>Tareas</div>
                  <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>Cuando te asignan, completan o verifican una tarea</div>
                </div>
                <div style={{display:'flex',gap:'0.5rem',flexShrink:0}}>
                  <button onClick={()=>toggleCategoria('email','tareas')} style={{fontSize:'0.65rem',fontWeight:'700',padding:'0.2rem 0.6rem',borderRadius:'20px',border:'none',cursor:'pointer',fontFamily:'Inter,sans-serif',background:(prefs.categorias_email_desactivadas||[]).includes('tareas') ? 'rgba(255,255,255,0.08)' : 'rgba(29,158,117,0.2)',color:(prefs.categorias_email_desactivadas||[]).includes('tareas') ? '#8FA3CC' : '#1D9E75'}}>
                    ✉️ {(prefs.categorias_email_desactivadas||[]).includes('tareas') ? 'off' : 'on'}
                  </button>
                  <button onClick={()=>toggleCategoria('push','tareas')} style={{fontSize:'0.65rem',fontWeight:'700',padding:'0.2rem 0.6rem',borderRadius:'20px',border:'none',cursor:'pointer',fontFamily:'Inter,sans-serif',background:(prefs.categorias_push_desactivadas||[]).includes('tareas') ? 'rgba(255,255,255,0.08)' : 'rgba(29,158,117,0.2)',color:(prefs.categorias_push_desactivadas||[]).includes('tareas') ? '#8FA3CC' : '#1D9E75'}}>
                    🔔 {(prefs.categorias_push_desactivadas||[]).includes('tareas') ? 'off' : 'on'}
                  </button>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',padding:'0.75rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)',gap:'1rem'}}>
                <div>
                  <div style={{fontSize:'0.82rem',fontWeight:'600',color:'#fff',marginBottom:'0.1rem'}}>Metas</div>
                  <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>Cuando se completa una meta en tus proyectos</div>
                </div>
                <div style={{display:'flex',gap:'0.5rem',flexShrink:0}}>
                  <button onClick={()=>toggleCategoria('email','hitos')} style={{fontSize:'0.65rem',fontWeight:'700',padding:'0.2rem 0.6rem',borderRadius:'20px',border:'none',cursor:'pointer',fontFamily:'Inter,sans-serif',background:(prefs.categorias_email_desactivadas||[]).includes('hitos') ? 'rgba(255,255,255,0.08)' : 'rgba(29,158,117,0.2)',color:(prefs.categorias_email_desactivadas||[]).includes('hitos') ? '#8FA3CC' : '#1D9E75'}}>
                    ✉️ {(prefs.categorias_email_desactivadas||[]).includes('hitos') ? 'off' : 'on'}
                  </button>
                  <button onClick={()=>toggleCategoria('push','hitos')} style={{fontSize:'0.65rem',fontWeight:'700',padding:'0.2rem 0.6rem',borderRadius:'20px',border:'none',cursor:'pointer',fontFamily:'Inter,sans-serif',background:(prefs.categorias_push_desactivadas||[]).includes('hitos') ? 'rgba(255,255,255,0.08)' : 'rgba(29,158,117,0.2)',color:(prefs.categorias_push_desactivadas||[]).includes('hitos') ? '#8FA3CC' : '#1D9E75'}}>
                    🔔 {(prefs.categorias_push_desactivadas||[]).includes('hitos') ? 'off' : 'on'}
                  </button>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',padding:'0.75rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)',gap:'1rem'}}>
                <div>
                  <div style={{fontSize:'0.82rem',fontWeight:'600',color:'#fff',marginBottom:'0.1rem'}}>Aportes</div>
                  <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>Cuando se registra o verifica un aporte</div>
                </div>
                <div style={{display:'flex',gap:'0.5rem',flexShrink:0}}>
                  <button onClick={()=>toggleCategoria('email','aportes')} style={{fontSize:'0.65rem',fontWeight:'700',padding:'0.2rem 0.6rem',borderRadius:'20px',border:'none',cursor:'pointer',fontFamily:'Inter,sans-serif',background:(prefs.categorias_email_desactivadas||[]).includes('aportes') ? 'rgba(255,255,255,0.08)' : 'rgba(29,158,117,0.2)',color:(prefs.categorias_email_desactivadas||[]).includes('aportes') ? '#8FA3CC' : '#1D9E75'}}>
                    ✉️ {(prefs.categorias_email_desactivadas||[]).includes('aportes') ? 'off' : 'on'}
                  </button>
                  <button onClick={()=>toggleCategoria('push','aportes')} style={{fontSize:'0.65rem',fontWeight:'700',padding:'0.2rem 0.6rem',borderRadius:'20px',border:'none',cursor:'pointer',fontFamily:'Inter,sans-serif',background:(prefs.categorias_push_desactivadas||[]).includes('aportes') ? 'rgba(255,255,255,0.08)' : 'rgba(29,158,117,0.2)',color:(prefs.categorias_push_desactivadas||[]).includes('aportes') ? '#8FA3CC' : '#1D9E75'}}>
                    🔔 {(prefs.categorias_push_desactivadas||[]).includes('aportes') ? 'off' : 'on'}
                  </button>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',padding:'0.75rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)',gap:'1rem'}}>
                <div>
                  <div style={{fontSize:'0.82rem',fontWeight:'600',color:'#fff',marginBottom:'0.1rem'}}>Proyectos</div>
                  <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>Actividad general de tus proyectos</div>
                </div>
                <div style={{display:'flex',gap:'0.5rem',flexShrink:0}}>
                  <button onClick={()=>toggleCategoria('email','proyectos')} style={{fontSize:'0.65rem',fontWeight:'700',padding:'0.2rem 0.6rem',borderRadius:'20px',border:'none',cursor:'pointer',fontFamily:'Inter,sans-serif',background:(prefs.categorias_email_desactivadas||[]).includes('proyectos') ? 'rgba(255,255,255,0.08)' : 'rgba(29,158,117,0.2)',color:(prefs.categorias_email_desactivadas||[]).includes('proyectos') ? '#8FA3CC' : '#1D9E75'}}>
                    ✉️ {(prefs.categorias_email_desactivadas||[]).includes('proyectos') ? 'off' : 'on'}
                  </button>
                  <button onClick={()=>toggleCategoria('push','proyectos')} style={{fontSize:'0.65rem',fontWeight:'700',padding:'0.2rem 0.6rem',borderRadius:'20px',border:'none',cursor:'pointer',fontFamily:'Inter,sans-serif',background:(prefs.categorias_push_desactivadas||[]).includes('proyectos') ? 'rgba(255,255,255,0.08)' : 'rgba(29,158,117,0.2)',color:(prefs.categorias_push_desactivadas||[]).includes('proyectos') ? '#8FA3CC' : '#1D9E75'}}>
                    🔔 {(prefs.categorias_push_desactivadas||[]).includes('proyectos') ? 'off' : 'on'}
                  </button>
                </div>
              </div>
          {guardandoPrefs && <div style={{fontSize:'0.7rem',color:'#1D9E75',marginTop:'0.5rem'}}>Guardando...</div>}
        </div>

        {mensaje && (
          <div style={{background: mensaje.startsWith('✓') ? 'rgba(29,158,117,0.1)' : 'rgba(216,90,48,0.1)', border: mensaje.startsWith('✓') ? '1px solid rgba(29,158,117,0.3)' : '1px solid rgba(216,90,48,0.3)', borderRadius:'8px', padding:'0.875rem', color: mensaje.startsWith('✓') ? '#1D9E75' : '#D85A30', fontSize:'0.82rem', marginBottom:'1rem', textAlign:'center'}}>
            {mensaje}
          </div>
        )}

        <button onClick={guardar} disabled={guardando} style={{width:'100%',background: guardando ? '#0F6E56' : '#1D9E75',color:'#fff',border:'none',borderRadius:'10px',padding:'1rem',fontSize:'0.95rem',fontWeight:'700',cursor: guardando ? 'not-allowed' : 'pointer',fontFamily:'Inter,sans-serif'}}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </main>
    </div>
  )
}
