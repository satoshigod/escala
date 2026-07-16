'use client'
// components/NavApp.js
//
// Nav compartido para todas las páginas autenticadas de Escala.
// Reemplaza los ~28 navs copiados en cada página.
//
// Uso:
//   import NavApp from '@/components/NavApp'
//   <NavApp paginaActual="proyectos" />
//
// Props:
//   paginaActual — string opcional, resalta el link activo en el nav

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const LINKS = [
  { href: '/proyectos', label: 'Proyectos' },
  { href: '/directorio-inversion', label: '💰 Invertir' },
  { href: '/postulaciones', label: 'Postulaciones' },
  { href: '/score', label: 'Mi Score' },
]

export default function NavApp({ paginaActual }) {
  const [notifCount, setNotifCount] = useState(0)
  const [esAdmin, setEsAdmin] = useState(false)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Notificaciones no leídas
      const { count } = await supabase
        .from('notificaciones')
        .select('id', { count: 'exact', head: true })
        .eq('usuario_id', user.id)
        .eq('leido', false)
      setNotifCount(count || 0)

      // Es admin
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('es_admin')
        .eq('id', user.id)
        .single()
      setEsAdmin(!!perfil?.es_admin)
    }
    cargar()
  }, [])

  async function cerrarSesion() {
    await supabase.auth.signOut()
    window.location.href = '/registro?modo=login'
  }

  return (
    <nav style={{
      background: 'rgba(255,255,255,0.04)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '0 1.5rem',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <a href="/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em' }}>
            Esca<span style={{ color: '#1D9E75' }}>la</span>
          </div>
        </a>
      </div>

      {/* Links centrales */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {LINKS.map(link => (
          <a
            key={link.href}
            href={link.href}
            style={{
              color: paginaActual === link.href.replace('/', '') ? '#fff' : '#8FA3CC',
              fontSize: '0.82rem',
              textDecoration: 'none',
              fontWeight: paginaActual === link.href.replace('/', '') ? '600' : '400',
            }}
          >
            {link.label}
          </a>
        ))}

        {/* Dashboard */}
        <a href="/dashboard" style={{ color: '#8FA3CC', fontSize: '0.82rem', textDecoration: 'none' }}>
          Dashboard
        </a>

        {/* Admin */}
        {esAdmin && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <a href="/admin-escala" style={{ color: '#8FA3CC', fontSize: '0.82rem', textDecoration: 'none' }}>
              Admin
            </a>
            <a href="/admin/finanzas" style={{ color: '#E8A020', fontSize: '0.78rem', textDecoration: 'none', fontWeight: '600' }}>
              Finanzas
            </a>
          </div>
        )}

        {/* Notificaciones */}
        <a href="/dashboard" style={{ position: 'relative', textDecoration: 'none', fontSize: '1.05rem' }}>
          🔔
          {notifCount > 0 && (
            <span style={{
              position: 'absolute', top: '-4px', right: '-6px',
              background: '#1D9E75', color: '#fff',
              fontSize: '0.6rem', fontWeight: '700',
              padding: '1px 4px', borderRadius: '8px',
              minWidth: '14px', textAlign: 'center',
            }}>
              {notifCount}
            </span>
          )}
        </a>

        {/* Salir */}
        <button
          onClick={cerrarSesion}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#8FA3CC',
            padding: '0.3rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            fontFamily: 'Inter,sans-serif',
          }}
        >
          Salir
        </button>
      </div>
    </nav>
  )
}
