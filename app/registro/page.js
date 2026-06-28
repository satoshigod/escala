'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Registro() {
  const [modo, setModo] = useState('registro')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  async function registrarse() {
    setCargando(true)
    setMensaje('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } }
    })

    if (error) {
      setMensaje('Error: ' + error.message)
    } else {
      window.location.href = '/onboarding'
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

  const s = {
    wrap: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter, sans-serif', padding: '2rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    card: { width: '100%', maxWidth: '400px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2.5rem' },
    logo: { fontSize: '1.3rem', fontWeight: '900', color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.03em' },
    logoSpan: { color: '#1D9E75' },
    sub: { fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '2rem' },
    tabs: { display: 'flex', gap: '0', marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' },
    tab: act => ({ flex: 1, padding: '0.6rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', borderRadius: '6px', border: 'none', fontFamily: 'Inter, sans-serif', background: act ? '#1D9E75' : 'transparent', color: act ? '#fff' : '#8FA3CC', transition: 'all 0.2s' }),
    label: { display: 'block', fontSize: '0.72rem', fontWeight: '600', color: '#8FA3CC', marginBottom: '0.4rem', letterSpacing: '0.04em', textTransform: 'uppercase' },
    input: { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '1rem', fontFamily: 'Inter, sans-serif' },
    btn: { width: '100%', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.9rem', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'background 0.2s' },
    error: { background: 'rgba(216,90,48,0.1)', border: '1px solid rgba(216,90,48,0.3)', borderRadius: '8px', padding: '0.875rem', color: '#D85A30', fontSize: '0.82rem', marginTop: '1rem' },
    volver: { display: 'block', textAlign: 'center', color: '#8FA3CC', fontSize: '0.8rem', marginTop: '1.25rem', textDecoration: 'none' },
  }

  return (
    <main style={s.wrap}>
      <div style={s.card}>
        <div style={s.logo}>Esca<span style={s.logoSpan}>la</span></div>
        <div style={s.sub}>Plataforma de empresas colaborativas</div>

        <div style={s.tabs}>
          <button style={s.tab(modo === 'registro')} onClick={() => { setModo('registro'); setMensaje('') }}>Crear cuenta</button>
          <button style={s.tab(modo === 'login')} onClick={() => { setModo('login'); setMensaje('') }}>Iniciar sesión</button>
        </div>

        {modo === 'registro' && (
          <>
            <label style={s.label}>Nombre completo</label>
            <input style={s.input} type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre completo" />

            <label style={s.label}>Email</label>
            <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" />

            <label style={s.label}>Contraseña</label>
            <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />

            <button style={s.btn} onClick={registrarse} disabled={cargando}>
              {cargando ? 'Creando cuenta...' : 'Crear cuenta en Escala →'}
            </button>
          </>
        )}

        {modo === 'login' && (
          <>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" />

            <label style={s.label}>Contraseña</label>
            <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Tu contraseña" />

            <button style={s.btn} onClick={iniciarSesion} disabled={cargando}>
              {cargando ? 'Entrando...' : 'Iniciar sesión →'}
            </button>
          </>
        )}

        {mensaje && <div style={s.error}>{mensaje}</div>}
        <a href="/" style={s.volver}>← Volver al inicio</a>
      </div>
    </main>
  )
}
