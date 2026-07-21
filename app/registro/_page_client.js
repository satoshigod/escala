'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Registro() {
  const [modo, setModo] = useState('registro')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [intent, setIntent] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('modo') === 'login') setModo('login')
    const i = params.get('intent')
    if (i) setIntent(i)
  }, [])

  // Mensaje contextual segun lo que la persona eligio en la home
  const intentInfo = {
    capital:   { icon: '💰', titulo: 'Necesitas capital para crecer',      texto: 'Crea tu cuenta y publica lo que tu negocio necesita. Los inversionistas de Escala podrán financiarlo.' },
    talento:   { icon: '🤝', titulo: 'Necesitas contratar talento',        texto: 'Crea tu cuenta y encuentra al diseñador, contador, desarrollador o especialista que buscas — trabajan por participación.' },
    crear:     { icon: '💡', titulo: 'Quieres empezar tu empresa',         texto: 'Crea tu cuenta y arma tu equipo sin pagar salarios por adelantado. Cada quien gana participación.' },
    proyectos: { icon: '🎯', titulo: 'Quieres conseguir proyectos',        texto: 'Crea tu cuenta, muestra lo que sabes hacer y postúlate a proyectos reales. Ganas participación por tu trabajo.' },
    resolver:  { icon: '🧩', titulo: 'Tienes un problema que resolver',     texto: 'Crea tu cuenta y encuentra al especialista o la solución que necesitas para tu negocio o empresa.' },
  }
  const info = intent && intentInfo[intent]

  async function registrarse() {
    setCargando(true)
    setMensaje('')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } }
    })
    if (error) {
      setMensaje('Error: ' + error.message)
    } else if (data.session && data.user) {
      fetch('/api/verificar-correo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: data.user.id, email, nombre })
      }).catch(() => {})
      window.location.href = intent ? `/onboarding?intent=${intent}` : '/onboarding'
    } else {
      window.location.href = intent ? `/onboarding?intent=${intent}` : '/onboarding'
    }
    setCargando(false)
  }

  async function iniciarSesion() {
    setCargando(true)
    setMensaje('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMensaje('Error: ' + error.message)
    } else {
      window.location.href = '/dashboard'
    }
    setCargando(false)
  }

  function cambiarModo(nuevoModo) {
    setMensaje('')
    setModo(nuevoModo)
  }

  const s = {
    wrap: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter, sans-serif', padding: '2rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    card: { width: '100%', maxWidth: '400px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2.5rem' },
    logo: { fontSize: '1.3rem', fontWeight: '900', color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.03em' },
    logoSpan: { color: '#1D9E75' },
    sub: { fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '2rem' },
    tabs: { display: 'flex', gap: '0', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' },
    tab: (act) => ({ flex: 1, padding: '0.6rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', borderRadius: '6px', border: 'none', fontFamily: 'Inter, sans-serif', background: act ? '#1D9E75' : 'transparent', color: act ? '#fff' : '#8FA3CC', transition: 'all 0.18s ease' }),
    label: { display: 'block', fontSize: '0.72rem', fontWeight: '600', color: '#8FA3CC', marginBottom: '0.4rem', letterSpacing: '0.04em', textTransform: 'uppercase' },
    input: { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '1rem', fontFamily: 'Inter, sans-serif' },
    // Campo nombre con altura animada: visible en registro, colapsado en login
    nombreWrap: (vis) => ({ overflow: 'hidden', maxHeight: vis ? '90px' : '0px', opacity: vis ? 1 : 0, transition: 'max-height 0.25s ease, opacity 0.2s ease', marginBottom: vis ? '0' : '-1rem' }),
    btn: { width: '100%', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.9rem', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'background 0.2s' },
    error: { background: 'rgba(216,90,48,0.1)', border: '1px solid rgba(216,90,48,0.3)', borderRadius: '8px', padding: '0.875rem', color: '#D85A30', fontSize: '0.82rem', marginTop: '1rem' },
    info: { background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.3)', borderRadius: '8px', padding: '0.875rem', color: '#1D9E75', fontSize: '0.82rem', marginTop: '1rem' },
    volver: { display: 'block', textAlign: 'center', color: '#8FA3CC', fontSize: '0.8rem', marginTop: '1.25rem', textDecoration: 'none' },
  }

  const esRegistro = modo === 'registro'

  return (
    <main style={s.wrap}>
      <div style={s.card}>
        <a href="/" style={{ textDecoration: 'none' }}><div style={s.logo}>Esca<span style={s.logoSpan}>la</span></div></a>
        <div style={s.sub}>La plataforma para tu negocio o empresa</div>

        <a href="/que-es-escala" style={{ display: 'block', fontSize: '0.78rem', color: '#1D9E75', textDecoration: 'none', marginBottom: '1.5rem', marginTop: '-1rem' }}>¿Primera vez? Entiende cómo funciona en 2 minutos →</a>

        {/* Banner contextual segun la necesidad elegida en la home */}
        {info && esRegistro && (
          <div style={{ background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.3)', borderRadius: '10px', padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{info.icon}</span>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff', marginBottom: '0.2rem' }}>{info.titulo}</div>
              <div style={{ fontSize: '0.75rem', color: '#8FA3CC', lineHeight: 1.5 }}>{info.texto}</div>
            </div>
          </div>
        )}

        {/* Tabs sin salto — usan el mismo formulario */}
        <div style={s.tabs}>
          <button style={s.tab(esRegistro)} onClick={() => cambiarModo('registro')}>Crear cuenta</button>
          <button style={s.tab(!esRegistro)} onClick={() => cambiarModo('login')}>Iniciar sesión</button>
        </div>

        {/* Campo nombre — animado, no aparece/desaparece bruscamente */}
        <div style={s.nombreWrap(esRegistro)}>
          <label style={s.label} htmlFor="reg-nombre">Nombre completo</label>
          <input
            id="reg-nombre"
            style={s.input}
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Tu nombre completo"
            tabIndex={esRegistro ? 0 : -1}
          />
        </div>

        {/* Email y password — siempre presentes, sin salto */}
        <label style={s.label} htmlFor="auth-email">Email</label>
        <input
          id="auth-email"
          style={s.input}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="tu@email.com"
        />

        <label style={s.label} htmlFor="auth-password">Contraseña</label>
        <input
          id="auth-password"
          style={s.input}
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !cargando && (esRegistro ? registrarse() : iniciarSesion())}
          placeholder={esRegistro ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
        />

        <button style={s.btn} onClick={esRegistro ? registrarse : iniciarSesion} disabled={cargando}>
          {cargando
            ? (esRegistro ? 'Creando cuenta...' : 'Entrando...')
            : (esRegistro ? 'Crear cuenta en Escala →' : 'Iniciar sesión →')}
        </button>

        {!esRegistro && (
          <a href="/recuperar" style={{ display: 'block', textAlign: 'center', color: '#8FA3CC', fontSize: '0.8rem', marginTop: '1rem', textDecoration: 'none' }}>¿Olvidaste tu contraseña?</a>
        )}

        {mensaje && <div style={mensaje.startsWith('Error:') ? s.error : s.info}>{mensaje}</div>}
        <a href="/" style={s.volver}>← Volver al inicio</a>
      </div>
    </main>
  )
}

