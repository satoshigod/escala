'use client'

import { useState } from 'react'

export default function Recuperar() {
  const [email, setEmail] = useState('')
  const [cargando, setCargando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [mensaje, setMensaje] = useState('')

  async function enviar() {
    if (!email.includes('@')) {
      setMensaje('Escribe un correo valido.')
      return
    }
    setCargando(true)
    setMensaje('')
    try {
      const res = await fetch('/api/recuperar-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      setEnviado(true)
      setMensaje(data.mensaje || 'Si existe una cuenta con ese correo, te enviamos un enlace.')
    } catch {
      // Aun ante error de red mostramos el mensaje neutro (no bloqueamos al usuario)
      setEnviado(true)
      setMensaje('Si existe una cuenta con ese correo, te enviamos un enlace para restablecer tu contrasena.')
    }
    setCargando(false)
  }

  const s = {
    wrap: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter, sans-serif', padding: '2rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    card: { width: '100%', maxWidth: '400px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2.5rem' },
    logo: { fontSize: '1.3rem', fontWeight: '900', color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.03em' },
    logoSpan: { color: '#1D9E75' },
    titulo: { fontSize: '1.05rem', fontWeight: '800', color: '#fff', marginTop: '1.5rem', marginBottom: '0.4rem' },
    sub: { fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '1.75rem', lineHeight: 1.5 },
    label: { display: 'block', fontSize: '0.72rem', fontWeight: '600', color: '#8FA3CC', marginBottom: '0.4rem', letterSpacing: '0.04em', textTransform: 'uppercase' },
    input: { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '1rem', fontFamily: 'Inter, sans-serif' },
    btn: { width: '100%', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.9rem', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
    info: { background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.3)', borderRadius: '8px', padding: '0.875rem', color: '#1D9E75', fontSize: '0.82rem', marginTop: '1rem', lineHeight: 1.5 },
    error: { background: 'rgba(216,90,48,0.1)', border: '1px solid rgba(216,90,48,0.3)', borderRadius: '8px', padding: '0.875rem', color: '#D85A30', fontSize: '0.82rem', marginTop: '1rem' },
    volver: { display: 'block', textAlign: 'center', color: '#8FA3CC', fontSize: '0.8rem', marginTop: '1.25rem', textDecoration: 'none' },
  }

  return (
    <main style={s.wrap}>
      <div style={s.card}>
        <a href="/" style={{ textDecoration: 'none' }}><div style={s.logo}>Esca<span style={s.logoSpan}>la</span></div></a>

        {!enviado ? (
          <>
            <div style={s.titulo}>¿Olvidaste tu contraseña?</div>
            <div style={s.sub}>Escribe el correo de tu cuenta y te enviamos un enlace para elegir una nueva contraseña.</div>

            <label style={s.label} htmlFor="rec-email">Email</label>
            <input
              id="rec-email"
              style={s.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !cargando && enviar()}
              placeholder="tu@email.com"
            />

            <button style={s.btn} onClick={enviar} disabled={cargando}>
              {cargando ? 'Enviando...' : 'Enviar enlace →'}
            </button>

            {mensaje && <div style={s.error}>{mensaje}</div>}
          </>
        ) : (
          <>
            <div style={s.titulo}>Revisa tu correo</div>
            <div style={s.info}>{mensaje}</div>
            <div style={{ ...s.sub, marginTop: '1rem', marginBottom: 0 }}>Si no lo ves en unos minutos, revisa la carpeta de spam.</div>
          </>
        )}

        <a href="/registro?modo=login" style={s.volver}>← Volver a iniciar sesión</a>
      </div>
    </main>
  )
}
