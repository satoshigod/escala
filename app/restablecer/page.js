'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Restablecer() {
  // estado: verificando | listo | invalido | guardando | ok
  const [estado, setEstado] = useState('verificando')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    let activo = true

    // Al llegar desde el enlace de recuperacion, Supabase parsea el token de la URL
    // y dispara PASSWORD_RECOVERY. Tambien cubrimos el caso de sesion ya establecida
    // y el flujo PKCE (?code=) por robustez.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!activo) return
      if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN')) {
        setEstado('listo')
      }
    })

    supabase.auth.getSession().then(({ data }) => {
      if (activo && data.session) setEstado('listo')
    })

    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(code)
        .then(({ error }) => { if (activo && !error) setEstado('listo') })
        .catch(() => {})
    }

    // Si tras unos segundos no se establecio la sesion de recuperacion, el enlace no sirve
    const t = setTimeout(() => {
      setEstado(e => (e === 'verificando' ? 'invalido' : e))
    }, 4500)

    return () => { activo = false; sub.subscription.unsubscribe(); clearTimeout(t) }
  }, [])

  async function guardar() {
    if (password.length < 6) {
      setMensaje('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirmar) {
      setMensaje('Las contraseñas no coinciden.')
      return
    }
    setEstado('guardando')
    setMensaje('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setEstado('listo')
      setMensaje('Error: ' + error.message)
      return
    }
    setEstado('ok')
    setTimeout(() => { window.location.href = '/dashboard' }, 1800)
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
    muted: { fontSize: '0.82rem', color: '#8FA3CC', lineHeight: 1.6 },
    volver: { display: 'block', textAlign: 'center', color: '#8FA3CC', fontSize: '0.8rem', marginTop: '1.25rem', textDecoration: 'none' },
  }

  return (
    <main style={s.wrap}>
      <div style={s.card}>
        <a href="/" style={{ textDecoration: 'none' }}><div style={s.logo}>Esca<span style={s.logoSpan}>la</span></div></a>

        {estado === 'verificando' && (
          <>
            <div style={s.titulo}>Verificando enlace…</div>
            <div style={s.muted}>Un momento, estamos validando tu enlace de recuperación.</div>
          </>
        )}

        {estado === 'invalido' && (
          <>
            <div style={s.titulo}>Enlace inválido o expirado</div>
            <div style={s.muted}>Este enlace ya no sirve. Los enlaces de recuperación expiran por seguridad. Pide uno nuevo.</div>
            <a href="/recuperar" style={{ ...s.btn, display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '1.5rem' }}>Pedir un enlace nuevo</a>
          </>
        )}

        {(estado === 'listo' || estado === 'guardando') && (
          <>
            <div style={s.titulo}>Elige una nueva contraseña</div>
            <div style={s.sub}>Escribe tu nueva contraseña. La usarás para iniciar sesión de ahora en adelante.</div>

            <label style={s.label} htmlFor="new-pass">Nueva contraseña</label>
            <input
              id="new-pass"
              style={s.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />

            <label style={s.label} htmlFor="confirm-pass">Confirmar contraseña</label>
            <input
              id="confirm-pass"
              style={s.input}
              type="password"
              value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && estado === 'listo' && guardar()}
              placeholder="Repite la contraseña"
            />

            <button style={s.btn} onClick={guardar} disabled={estado === 'guardando'}>
              {estado === 'guardando' ? 'Guardando...' : 'Guardar contraseña →'}
            </button>

            {mensaje && <div style={s.error}>{mensaje}</div>}
          </>
        )}

        {estado === 'ok' && (
          <>
            <div style={s.titulo}>¡Contraseña actualizada!</div>
            <div style={s.info}>Tu contraseña quedó cambiada. Entrando a tu cuenta…</div>
          </>
        )}

        {estado !== 'ok' && <a href="/registro?modo=login" style={s.volver}>← Volver a iniciar sesión</a>}
      </div>
    </main>
  )
}
