'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const roles = [
  { id: 'ideador',      icon: '💡', label: 'Ideador / Fundador',  desc: 'Tengo una idea de negocio',              ejemplo: 'Publicas tu proyecto y armas equipo sin necesidad de tener dinero para contratar' },
  { id: 'especialista', icon: '🔧', label: 'Especialista',         desc: 'Tengo conocimiento profesional',          ejemplo: 'Abogado, contador, diseñador, programador — tu tiempo se convierte en participación futura' },
  { id: 'ejecutor',     icon: '⚙️', label: 'Ejecutor / Gerente',  desc: 'Sé construir y operar empresas',          ejemplo: 'Coordinas al equipo, ejecutas el día a día y haces que el proyecto avance' },
  { id: 'capitalista',  icon: '💰', label: 'Capitalista',          desc: 'Tengo capital para invertir',             ejemplo: 'Aportas dinero a un proyecto y tu inversión queda registrada como participación' },
  { id: 'angel',        icon: '🌟', label: 'Ángel de Impulso',    desc: 'Quiero financiar una meta',                ejemplo: 'Pagas algo puntual (un registro de marca, un MVP) sin financiar toda la empresa' },
  { id: 'mentor',       icon: '🧭', label: 'Mentor',               desc: 'Quiero aportar experiencia estratégica', ejemplo: 'Orientas a los fundadores en comercial, finanzas o tecnología sin ejecutar tareas operativas' },
  { id: 'empresa',      icon: '🏢', label: 'Empresa',              desc: 'Represento una empresa',                  ejemplo: 'Puedes actuar como fundadora, ejecutora, prestadora de servicios, ángel o mentora según el proyecto' },
]

export default function Onboarding() {
  const [paso, setPaso] = useState(1)
  const [usuario, setUsuario] = useState(null)
  const [form, setForm] = useState({
    nombre: '',
    ciudad: '',
    pais: '',
    whatsapp: '',
    rol_principal: '',
    especialidad: '',
    lo_que_aporto: '',
    lo_que_busco: '',
  })
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [paisesDB, setPaisesDB] = useState([])
  const [nuevoPaisNombre, setNuevoPaisNombre] = useState('')
  const [mostrarNuevoPais, setMostrarNuevoPais] = useState(false)
  const [creandoPais, setCreandoPais] = useState(false)
  const [especialidadesDB, setEspecialidadesDB] = useState([])
  const [nuevaEspecialidadNombre, setNuevaEspecialidadNombre] = useState('')
  const [mostrarNuevaEspecialidad, setMostrarNuevaEspecialidad] = useState(false)
  const [creandoEspecialidad, setCreandoEspecialidad] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { window.location.href = '/'; return }
      setUsuario(data.user)
      setForm(f => ({ ...f, nombre: data.user.user_metadata?.nombre || '' }))
    })
    fetch('/api/paises').then(r => r.json()).then(d => setPaisesDB(d.paises || []))
    fetch('/api/especialidades?aprobado=true').then(r => r.json()).then(d => setEspecialidadesDB(d.especialidades || []))

    // Si viene de /bienvenida con un rol preseleccionado, lo aplica y salta al paso 2
    const params = new URLSearchParams(window.location.search)
    const rolParam = params.get('rol')
    if (rolParam) {
      setForm(f => ({ ...f, rol_principal: rolParam }))
      setPaso(2)
    }
  }, [])

  function actualizar(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }))
  }

  async function crearNuevaEspecialidad() {
    const nombre = nuevaEspecialidadNombre.trim()
    if (!nombre) { alert('Escribe el nombre de la especialidad'); return }
    setCreandoEspecialidad(true)
    try {
      const res = await fetch('/api/especialidades', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, categoria: 'General', creado_por: usuario?.id })
      })
      const data = await res.json()
      if (data.error) { alert('Error: ' + data.error) }
      else {
        setEspecialidadesDB(prev => [...prev.filter(e => e.nombre !== data.especialidad.nombre), data.especialidad].sort((a,b) => a.nombre.localeCompare(b.nombre)))
        actualizar('especialidad', data.especialidad.nombre)
        setNuevaEspecialidadNombre('')
        setMostrarNuevaEspecialidad(false)
      }
    } catch(e) {
      alert('Error de conexión: ' + e.message)
    }
    setCreandoEspecialidad(false)
  }

  async function crearNuevoPais() {
    if (!nuevoPaisNombre.trim()) return
    setCreandoPais(true)
    const res = await fetch('/api/paises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nuevoPaisNombre.trim(), bandera: '🌐', tipo_origen: 'especialista', creado_por: usuario?.id, creado_por_nombre: usuario?.user_metadata?.nombre || usuario?.email })
    })
    const data = await res.json()
    if (!data.error) {
      setPaisesDB(prev => [...prev.filter(p => p.nombre !== data.pais.nombre), data.pais].sort((a,b) => a.nombre.localeCompare(b.nombre)))
      actualizar('pais', data.pais.nombre)
      setNuevoPaisNombre('')
      setMostrarNuevoPais(false)
    }
    setCreandoPais(false)
  }

  async function guardar() {
    setCargando(true)
    setMensaje('')

    const res = await fetch('/api/usuarios', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: usuario.id, ...form })
    })

    const data = await res.json()

    if (data.error) {
      setMensaje('Error: ' + data.error)
      setCargando(false)
      return
    }

    window.location.href = '/dashboard'
  }

  const s = {
    wrap: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter, sans-serif', padding: '2rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    card: { width: '100%', maxWidth: '520px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2.5rem' },
    logo: { fontSize: '1.1rem', fontWeight: '900', color: '#fff', marginBottom: '0.25rem' },
    logoSpan: { color: '#1D9E75' },
    paso: { fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8FA3CC', marginBottom: '1.5rem' },
    titulo: { fontSize: '1.4rem', fontWeight: '800', color: '#fff', marginBottom: '0.4rem', letterSpacing: '-0.02em' },
    subtitulo: { fontSize: '0.85rem', color: '#8FA3CC', marginBottom: '2rem', lineHeight: '1.6' },
    label: { display: 'block', fontSize: '0.72rem', fontWeight: '600', color: '#8FA3CC', marginBottom: '0.4rem', letterSpacing: '0.04em', textTransform: 'uppercase' },
    input: { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '1rem', fontFamily: 'Inter, sans-serif' },
    textarea: { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '1rem', fontFamily: 'Inter, sans-serif', resize: 'vertical', minHeight: '80px' },
    btn: { width: '100%', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.9rem', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
    btnSec: { width: '100%', background: 'transparent', color: '#8FA3CC', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginBottom: '0.75rem' },
    rolGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' },
    rolCard: activo => ({ background: activo ? 'rgba(29,158,117,0.15)' : 'rgba(255,255,255,0.04)', border: activo ? '2px solid #1D9E75' : '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '1rem', cursor: 'pointer', transition: 'all 0.2s' }),
    rolIcon: { fontSize: '1.4rem', marginBottom: '0.4rem' },
    rolLabel: { fontSize: '0.85rem', fontWeight: '700', color: '#fff', marginBottom: '0.2rem' },
    rolDesc: { fontSize: '0.72rem', color: '#8FA3CC' },
    progBar: { height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginBottom: '2rem', overflow: 'hidden' },
    progFill: { height: '100%', background: '#1D9E75', borderRadius: '2px', transition: 'width 0.4s ease', width: paso === 1 ? '33%' : paso === 2 ? '66%' : '100%' },
    error: { background: 'rgba(216,90,48,0.1)', border: '1px solid rgba(216,90,48,0.3)', borderRadius: '8px', padding: '0.875rem', color: '#D85A30', fontSize: '0.82rem', marginTop: '1rem' },
  }

  return (
    <main style={s.wrap}>
      <div style={s.card}>
        <a href="/" style={{textDecoration:'none'}}><div style={s.logo}>Esca<span style={s.logoSpan}>la</span></div></a>

        <div style={s.progBar}><div style={s.progFill}></div></div>

        {paso === 1 && (
          <>
            <div style={s.paso}>Paso 1 de 3 — Datos básicos</div>
            <div style={s.titulo}>Cuéntanos quién eres</div>
            <div style={s.subtitulo}>Esta información aparece en tu perfil público de Escala.</div>

            <label style={s.label} htmlFor="ob-nombre">Nombre completo</label>
            <input id="ob-nombre" style={s.input} value={form.nombre} onChange={e => actualizar('nombre', e.target.value)} placeholder="Tu nombre completo" />

            <label style={s.label} htmlFor="ob-ciudad">Ciudad</label>
            <input id="ob-ciudad" style={s.input} value={form.ciudad} onChange={e => actualizar('ciudad', e.target.value)} placeholder="Medellín, Bogotá, Cali..." />

            <label style={s.label} htmlFor="ob-pais">País de jurisdicción</label>
            <select id="ob-pais" style={{...s.input, background:'#1a2a4a'}} value={form.pais} onChange={e => { if(e.target.value==='__nuevo__'){setMostrarNuevoPais(true)}else{actualizar('pais',e.target.value);setMostrarNuevoPais(false)} }}>
              <option value="">Selecciona tu país...</option>
              {paisesDB.map(p => <option key={p.nombre} value={p.nombre}>{p.bandera||'🌐'} {p.nombre}</option>)}
              <option value="__nuevo__">+ Mi país no está en la lista</option>
            </select>
            {mostrarNuevoPais && (
              <div style={{display:'flex',gap:'0.5rem',marginBottom:'1rem'}}>
                <input value={nuevoPaisNombre} onChange={e=>setNuevoPaisNombre(e.target.value)} placeholder="Nombre de tu país (ej: Uruguay)" style={{flex:1,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.5rem 0.875rem',color:'#fff',fontSize:'0.85rem',outline:'none',fontFamily:'Inter,sans-serif'}} onKeyDown={e=>e.key==='Enter'&&crearNuevoPais()} />
                <button onClick={crearNuevoPais} disabled={creandoPais||!nuevoPaisNombre.trim()} style={{background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.5rem 1rem',fontSize:'0.82rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>{creandoPais?'...':'Agregar'}</button>
              </div>
            )}
            <label style={s.label} htmlFor="ob-whatsapp">WhatsApp</label>
            <input id="ob-whatsapp" style={s.input} value={form.whatsapp} onChange={e => actualizar('whatsapp', e.target.value)} placeholder="+57 300 123 4567" />

            <button style={s.btn} onClick={() => form.nombre && form.ciudad ? setPaso(2) : setMensaje('Completa nombre y ciudad')}>
              Continuar →
            </button>
            {mensaje && <div style={s.error}>{mensaje}</div>}
          </>
        )}

        {paso === 2 && (
          <>
            <div style={s.paso}>Paso 2 de 3 — Tu perfil</div>
            <div style={s.titulo}>¿Desde dónde llegas?</div>
            <div style={s.subtitulo}>Selecciona el perfil que mejor describe lo que tienes para aportar.</div>

            <div style={s.rolGrid}>
              {roles.map(r => (
                <div key={r.id} style={s.rolCard(form.rol_principal === r.id)} onClick={() => actualizar('rol_principal', r.id)}>
                  <div style={s.rolIcon}>{r.icon}</div>
                  <div style={s.rolLabel}>{r.label}</div>
                  <div style={s.rolDesc}>{r.desc}</div>
                  {form.rol_principal === r.id && (
                    <div style={{fontSize:'0.7rem',color:'#1D9E75',marginTop:'0.5rem',lineHeight:'1.4',paddingTop:'0.5rem',borderTop:'1px solid rgba(29,158,117,0.2)'}}>
                      {r.ejemplo}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <label style={s.label} htmlFor="ob-especialidad">Tu especialidad o profesión</label>
            <select id="ob-especialidad" style={{...s.input, background:'#1a2a4a'}} value={form.especialidad} onChange={e => { if(e.target.value==='__nueva__'){setMostrarNuevaEspecialidad(true)}else{actualizar('especialidad',e.target.value);setMostrarNuevaEspecialidad(false)} }}>
              <option value="">Selecciona tu especialidad...</option>
              {especialidadesDB.map(esp => <option key={esp.nombre} value={esp.nombre}>{esp.nombre}</option>)}
              <option value="__nueva__">+ Mi especialidad no está en la lista</option>
            </select>
            {mostrarNuevaEspecialidad && (
              <div style={{display:'flex',gap:'0.5rem',marginBottom:'1rem'}}>
                <input type="text" value={nuevaEspecialidadNombre} onChange={e=>setNuevaEspecialidadNombre(e.target.value)} placeholder="Ej: Especialista en marcas" style={{flex:1,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.5rem 0.875rem',color:'#fff',fontSize:'0.85rem',outline:'none',fontFamily:'Inter,sans-serif'}} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); crearNuevaEspecialidad(); } }} />
                <button type="button" onClick={(e)=>{e.preventDefault();crearNuevaEspecialidad();}} disabled={creandoEspecialidad} style={{background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.5rem 1rem',fontSize:'0.82rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>{creandoEspecialidad?'...':'Agregar'}</button>
              </div>
            )}

            <button style={s.btnSec} onClick={() => setPaso(1)}>← Volver</button>
            <button style={s.btn} onClick={() => form.rol_principal ? setPaso(3) : setMensaje('Selecciona tu perfil')}>
              Continuar →
            </button>
            {mensaje && <div style={s.error}>{mensaje}</div>}
          </>
        )}

        {paso === 3 && (
          <>
            <div style={s.paso}>Paso 3 de 3 — Tu aporte</div>
            <div style={s.titulo}>¿Qué tienes y qué buscas?</div>
            <div style={s.subtitulo}>Esto nos ayuda a conectarte con los proyectos correctos.</div>

            <label style={s.label} htmlFor="ob-aporto">¿Qué tienes para aportar?</label>
            <textarea id="ob-aporto" style={s.textarea} value={form.lo_que_aporto} onChange={e => actualizar('lo_que_aporto', e.target.value)} placeholder="Ej: 10 años de experiencia en derecho comercial, contactos en el sector financiero..." />

            <label style={s.label} htmlFor="ob-busco">¿Qué buscas en Escala?</label>
            <textarea id="ob-busco" style={s.textarea} value={form.lo_que_busco} onChange={e => actualizar('lo_que_busco', e.target.value)} placeholder="Ej: Un proyecto con potencial donde mi conocimiento se convierta en participación..." />

            <button style={s.btnSec} onClick={() => setPaso(2)}>← Volver</button>
            <button style={{ ...s.btn, background: cargando ? '#0F6E56' : '#1D9E75' }} onClick={guardar} disabled={cargando}>
              {cargando ? 'Guardando...' : 'Completar mi perfil →'}
            </button>
            {mensaje && <div style={s.error}>{mensaje}</div>}
          </>
        )}
      </div>
    </main>
  )
}
