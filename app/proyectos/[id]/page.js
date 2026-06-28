'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

const modalidadLabels = {
  equity: 'Equity', deuda_diferida: 'Deuda diferida', success_fee: 'Success Fee',
  hibrido: 'Híbrido', regalias: 'Regalías', bonos_hitos: 'Bonos por hitos',
  nueva_unidad: 'Nueva unidad', convertible: 'Deuda convertible'
}

export default function ProyectoDetalle({ params }) {
  const [usuario, setUsuario] = useState(null)
  const [proyecto, setProyecto] = useState(null)
  const [roles, setRoles] = useState([])
  const [cargando, setCargando] = useState(true)
  const [postulando, setPostulando] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [msgRol, setMsgRol] = useState({})

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro'; return }
      setUsuario(user)

      const [proyRes, rolesRes] = await Promise.all([
        fetch('/api/proyectos'),
        fetch(`/api/roles?proyecto_id=${params.id}`)
      ])

      const proyData = await proyRes.json()
      const rolesData = await rolesRes.json()

      const proy = proyData.proyectos?.find(p => p.id === params.id)
      setProyecto(proy || null)
      setRoles(rolesData.roles || [])
      setCargando(false)
    }
    cargar()
  }, [params.id])

  async function postularse(rol) {
    setPostulando(rol.id)
    setMsgRol({})

    const res = await fetch('/api/postulaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rol_id: rol.id,
        postulante_id: usuario.id,
        mensaje: `Me postulo al rol de ${rol.nombre}`
      })
    })
    const data = await res.json()

    if (data.error) {
      setMsgRol({ [rol.id]: 'Ya te postulaste a este rol' })
    } else {
      setMsgRol({ [rol.id]: '✅ Postulación enviada' })
    }
    setPostulando(null)
  }

  const s = {
    wrap: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter, sans-serif' },
    nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    logo: { fontSize: '1.1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em' },
    logoSpan: { color: '#1D9E75' },
    navLinks: { display: 'flex', gap: '1.5rem', alignItems: 'center' },
    navLink: { color: '#8FA3CC', fontSize: '0.82rem', textDecoration: 'none' },
    main: { maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.25rem' },
    back: { color: '#8FA3CC', fontSize: '0.82rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' },
    hero: { background: '#0A1530', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '2rem', marginBottom: '2rem' },
    tipo: { fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '0.75rem' },
    nombre: { fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', marginBottom: '0.5rem' },
    meta: { fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '1.25rem' },
    desc: { fontSize: '0.9rem', color: '#C8D4E8', lineHeight: '1.7', marginBottom: '1.5rem' },
    badgeRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
    badge: (color) => ({ display: 'inline-block', fontSize: '0.72rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '20px', background: color === 'green' ? 'rgba(29,158,117,0.15)' : 'rgba(232,160,32,0.15)', color: color === 'green' ? '#1D9E75' : '#E8A020', border: `1px solid ${color === 'green' ? 'rgba(29,158,117,0.3)' : 'rgba(232,160,32,0.3)'}` }),
    secTitle: { fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)' },
    rolesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem', marginBottom: '2rem' },
    rolCard: (prior) => ({ background: prior ? 'rgba(232,160,32,0.06)' : 'rgba(255,255,255,0.04)', border: prior ? '1px solid rgba(232,160,32,0.3)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.25rem' }),
    rolTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' },
    rolNombre: { fontSize: '0.95rem', fontWeight: '700', color: '#fff' },
    priorBadge: { fontSize: '0.62rem', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', background: 'rgba(232,160,32,0.2)', color: '#E8A020' },
    rolDesc: { fontSize: '0.78rem', color: '#8FA3CC', lineHeight: '1.5', marginBottom: '0.875rem' },
    rolMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' },
    rolValor: { fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', fontWeight: '600', color: '#fff' },
    rolModal: { fontSize: '0.72rem', color: '#8FA3CC' },
    btnPost: (act) => ({ width: '100%', background: act ? '#0F6E56' : '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.7rem', fontSize: '0.82rem', fontWeight: '700', cursor: act ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', transition: 'background 0.2s' }),
    msgRol: (ok) => ({ marginTop: '0.5rem', fontSize: '0.75rem', color: ok ? '#1D9E75' : '#D85A30', textAlign: 'center' }),
    empty: { background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '12px', padding: '2.5rem', textAlign: 'center', color: '#8FA3CC', fontSize: '0.875rem' },
    loading: { minHeight: '100vh', background: '#0D1B3E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8FA3CC', fontFamily: 'Inter, sans-serif' },
    notFound: { minHeight: '100vh', background: '#0D1B3E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#8FA3CC', fontFamily: 'Inter, sans-serif', gap: '1rem' },
  }

  if (cargando) return <div style={s.loading}>Cargando proyecto...</div>
  if (!proyecto) return (
    <div style={s.notFound}>
      <div style={{ fontSize: '2rem' }}>🔍</div>
      <div style={{ color: '#fff', fontWeight: '700' }}>Proyecto no encontrado</div>
      <a href="/proyectos" style={{ color: '#1D9E75', textDecoration: 'none' }}>← Ver todos los proyectos</a>
    </div>
  )

  const rolesAbiertos = roles.filter(r => r.estado === 'abierto')
  const rolesCubiertos = roles.filter(r => r.estado === 'cubierto')

  return (
    <div style={s.wrap}>
      <nav style={s.nav}>
        <div style={s.logo}>Esca<span style={s.logoSpan}>la</span></div>
        <div style={s.navLinks}>
          <a href="/dashboard" style={s.navLink}>Dashboard</a>
          <a href="/proyectos" style={s.navLink}>Proyectos</a>
          <a href="/registro" style={s.navLink}>Salir</a>
        </div>
      </nav>

      <main style={s.main}>
        <a href="/proyectos" style={s.back}>← Volver a proyectos</a>

        <div style={s.hero}>
          <div style={s.tipo}>Tipo {proyecto.tipo} — {proyecto.tipo === 'A' ? 'Creación' : 'Transformación'}</div>
          <div style={s.nombre}>{proyecto.nombre}</div>
          <div style={s.meta}>{proyecto.sector} · {proyecto.ciudad} · {proyecto.estado}</div>
          <div style={s.desc}>{proyecto.descripcion}</div>
          <div style={s.badgeRow}>
            <span style={s.badge('green')}>{rolesAbiertos.length} roles abiertos</span>
            {rolesCubiertos.length > 0 && <span style={s.badge('amber')}>{rolesCubiertos.length} roles cubiertos</span>}
          </div>
        </div>

        <div style={s.secTitle}>Roles disponibles</div>

        {roles.length === 0 ? (
          <div style={s.empty}>Este proyecto aún no tiene roles publicados.</div>
        ) : (
          <div style={s.rolesGrid}>
            {roles.map(rol => (
              <div key={rol.id} style={s.rolCard(rol.es_prioritario)}>
                <div style={s.rolTop}>
                  <div style={s.rolNombre}>{rol.nombre}</div>
                  {rol.es_prioritario && <span style={s.priorBadge}>🔥 Prioritario</span>}
                </div>
                {rol.descripcion && <div style={s.rolDesc}>{rol.descripcion}</div>}
                <div style={s.rolMeta}>
                  <div style={s.rolValor}>{rol.valor_mercado ? `$${rol.valor_mercado.toLocaleString()}` : 'A negociar'}</div>
                  <div style={s.rolModal}>{modalidadLabels[rol.modalidad] || rol.modalidad}</div>
                </div>
                {rol.estado === 'abierto' ? (
                  <>
                    <button
                      style={s.btnPost(postulando === rol.id)}
                      onClick={() => postularse(rol)}
                      disabled={postulando === rol.id}
                    >
                      {postulando === rol.id ? 'Enviando...' : 'Postularme a este rol →'}
                    </button>
                    {msgRol[rol.id] && (
                      <div style={s.msgRol(msgRol[rol.id].includes('✅'))}>{msgRol[rol.id]}</div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#1D9E75', fontWeight: '600', padding: '0.5rem' }}>✓ Rol cubierto</div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
