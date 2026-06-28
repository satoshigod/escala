'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [proyectos, setProyectos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro'; return }
      setUsuario(user)

      const [perfilRes, proyectosRes] = await Promise.all([
        fetch(`/api/usuarios?id=${user.id}`),
        fetch('/api/proyectos')
      ])

      const perfilData = await perfilRes.json()
      const proyectosData = await proyectosRes.json()

      setPerfil(perfilData.usuario)
      setProyectos(proyectosData.proyectos || [])
      setCargando(false)
    }
    cargar()
  }, [])

  async function cerrarSesion() {
    await supabase.auth.signOut()
    window.location.href = '/registro'
  }

  const s = {
    wrap: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter, sans-serif' },
    nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    logo: { fontSize: '1.1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em' },
    logoSpan: { color: '#1D9E75' },
    navRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
    navName: { fontSize: '0.82rem', color: '#8FA3CC' },
    btnSalir: { background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#8FA3CC', padding: '0.4rem 0.875rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
    main: { maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.25rem' },
    bienvenida: { marginBottom: '2rem' },
    ey: { fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1D9E75', display: 'block', marginBottom: '0.4rem' },
    h1: { fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', marginBottom: '0.4rem' },
    sub: { fontSize: '0.875rem', color: '#8FA3CC', lineHeight: '1.6' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '1rem', marginBottom: '2rem' },
    statCard: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.25rem' },
    statVal: { fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', fontWeight: '700', color: '#fff', lineHeight: '1' },
    statLabel: { fontSize: '0.72rem', color: '#8FA3CC', marginTop: '0.3rem' },
    section: { marginBottom: '2rem' },
    sectionTitle: { fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)' },
    perfilCard: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    perfilItem: { marginBottom: '0.75rem' },
    perfilLabel: { fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8FA3CC', marginBottom: '0.2rem' },
    perfilVal: { fontSize: '0.875rem', color: '#fff' },
    badge: { display: 'inline-block', fontSize: '0.72rem', fontWeight: '700', padding: '0.2rem 0.75rem', borderRadius: '20px', background: 'rgba(29,158,117,0.15)', color: '#1D9E75', border: '1px solid rgba(29,158,117,0.3)' },
    btnPrimary: { display: 'inline-block', background: '#1D9E75', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '700', textDecoration: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
    btnSec: { display: 'inline-block', background: 'transparent', color: '#8FA3CC', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)', marginLeft: '0.75rem' },
    empty: { background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '12px', padding: '2.5rem', textAlign: 'center' },
    emptyIcon: { fontSize: '2rem', marginBottom: '0.75rem' },
    emptyTitle: { fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.4rem' },
    emptyDesc: { fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '1.25rem', lineHeight: '1.6' },
    loading: { minHeight: '100vh', background: '#0D1B3E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8FA3CC', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' },
  }

  if (cargando) return <div style={s.loading}>Cargando tu dashboard...</div>

  const rolLabels = {
    ideador: '💡 Ideador',
    capitalista: '💰 Capitalista',
    especialista: '🔧 Especialista',
    ejecutor: '⚙️ Ejecutor',
    angel: '🌟 Ángel de Impulso'
  }

  return (
    <div style={s.wrap}>
      <nav style={s.nav}>
        <div style={s.logo}>Esca<span style={s.logoSpan}>la</span></div>
        <div style={s.navRight}>
          <span style={s.navName}>{perfil?.nombre || usuario?.email}</span>
          <button style={s.btnSalir} onClick={cerrarSesion}>Salir</button>
        </div>
      </nav>

      <main style={s.main}>
        <div style={s.bienvenida}>
          <span style={s.ey}>Tu dashboard</span>
          <h1 style={s.h1}>Hola, {perfil?.nombre?.split(' ')[0] || 'bienvenido'} 👋</h1>
          <p style={s.sub}>
            {perfil?.rol_principal
              ? `Estás registrado como ${rolLabels[perfil.rol_principal]} en ${perfil?.ciudad || 'Escala'}.`
              : 'Completa tu perfil para aparecer en el directorio de Escala.'}
          </p>
        </div>

        <div style={s.grid}>
          <div style={s.statCard}>
            <div style={s.statVal}>{perfil?.escala_score || 0}</div>
            <div style={s.statLabel}>Escala Score</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statVal}>{perfil?.proyectos_completados || 0}</div>
            <div style={s.statLabel}>Proyectos completados</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statVal}>{proyectos.length}</div>
            <div style={s.statLabel}>Proyectos activos en Escala</div>
          </div>
          <div style={s.statCard}>
            <div style={{ color: '#1D9E75', ...s.statVal }}>Fase 0</div>
            <div style={s.statLabel}>Estado de la plataforma</div>
          </div>
        </div>

        <div style={s.section}>
          <div style={s.sectionTitle}>Tu perfil</div>
          {perfil?.rol_principal ? (
            <div style={s.perfilCard}>
              <div>
                <div style={s.perfilItem}>
                  <div style={s.perfilLabel}>Nombre</div>
                  <div style={s.perfilVal}>{perfil.nombre}</div>
                </div>
                <div style={s.perfilItem}>
                  <div style={s.perfilLabel}>Ciudad</div>
                  <div style={s.perfilVal}>{perfil.ciudad || '—'}</div>
                </div>
                <div style={s.perfilItem}>
                  <div style={s.perfilLabel}>WhatsApp</div>
                  <div style={s.perfilVal}>{perfil.whatsapp || '—'}</div>
                </div>
              </div>
              <div>
                <div style={s.perfilItem}>
                  <div style={s.perfilLabel}>Perfil</div>
                  <span style={s.badge}>{rolLabels[perfil.rol_principal]}</span>
                </div>
                <div style={s.perfilItem}>
                  <div style={s.perfilLabel}>Especialidad</div>
                  <div style={s.perfilVal}>{perfil.especialidad || '—'}</div>
                </div>
                <div style={s.perfilItem}>
                  <div style={s.perfilLabel}>Lo que aporto</div>
                  <div style={s.perfilVal}>{perfil.lo_que_aporto || '—'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={s.empty}>
              <div style={s.emptyIcon}>👤</div>
              <div style={s.emptyTitle}>Completa tu perfil</div>
              <div style={s.emptyDesc}>Dinos quién eres y qué tienes para aportar para aparecer en el directorio de Escala.</div>
              <a href="/onboarding" style={s.btnPrimary}>Completar perfil →</a>
            </div>
          )}
        </div>

        <div style={s.section}>
          <div style={s.sectionTitle}>Proyectos activos en Escala</div>
          {proyectos.length > 0 ? (
            <div>próximamente</div>
          ) : (
            <div style={s.empty}>
              <div style={s.emptyIcon}>🚀</div>
              <div style={s.emptyTitle}>Aún no hay proyectos publicados</div>
              <div style={s.emptyDesc}>Escala está en Fase 0. Los primeros proyectos se publicarán pronto. Mientras tanto puedes explorar el proyecto piloto.</div>
              <a href="/proyecto-escala.html" style={s.btnPrimary}>Ver proyecto piloto →</a>
              <a href="/proyectos.html" style={s.btnSec}>Ver proyectos →</a>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
