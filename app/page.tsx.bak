'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  async function registrarse() {
    setCargando(true)
    setMensaje('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre }
      }
    })

    if (error) {
      setMensaje('Error: ' + error.message)
    } else {
      setMensaje('✅ Registro exitoso. Revisa tu email para confirmar.')
    }

    setCargando(false)
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0D1B3E',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      padding: '2rem'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: '900',
          color: '#fff',
          marginBottom: '0.25rem',
          letterSpacing: '-0.03em'
        }}>
          Esca<span style={{color:'#1D9E75'}}>la</span>
        </div>
        <div style={{
          fontSize: '0.82rem',
          color: '#8FA3CC',
          marginBottom: '2rem'
        }}>
          Plataforma de empresas colaborativas
        </div>

        <div style={{marginBottom: '1rem'}}>
          <label style={{
            display: 'block',
            fontSize: '0.72rem',
            fontWeight: '600',
            color: '#8FA3CC',
            marginBottom: '0.4rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>Nombre completo</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Tu nombre"
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#fff',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{marginBottom: '1rem'}}>
          <label style={{
            display: 'block',
            fontSize: '0.72rem',
            fontWeight: '600',
            color: '#8FA3CC',
            marginBottom: '0.4rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#fff',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{marginBottom: '1.5rem'}}>
          <label style={{
            display: 'block',
            fontSize: '0.72rem',
            fontWeight: '600',
            color: '#8FA3CC',
            marginBottom: '0.4rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#fff',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          onClick={registrarse}
          disabled={cargando}
          style={{
            width: '100%',
            background: cargando ? '#0F6E56' : '#1D9E75',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.9rem',
            fontSize: '0.95rem',
            fontWeight: '700',
            cursor: cargando ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {cargando ? 'Registrando...' : 'Crear cuenta en Escala'}
        </button>

        {mensaje && (
          <div style={{
            marginTop: '1rem',
            padding: '0.875rem',
            borderRadius: '8px',
            fontSize: '0.82rem',
            background: mensaje.includes('✅')
              ? 'rgba(29,158,117,0.1)'
              : 'rgba(216,90,48,0.1)',
            border: mensaje.includes('✅')
              ? '1px solid rgba(29,158,117,0.3)'
              : '1px solid rgba(216,90,48,0.3)',
            color: mensaje.includes('✅') ? '#1D9E75' : '#D85A30'
          }}>
            {mensaje}
          </div>
        )}
      </div>
    </main>
  )
}
