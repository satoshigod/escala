'use client'

// /admin/seguimiento — a quién escribirle hoy por WhatsApp, con el mensaje listo.
// Entrada: dashboard → acciones de admin → "Seguimiento por WhatsApp".

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

const COLOR_GRUPO = {
  solicitudes: '#AFA9EC',
  postulaciones: '#E8A020',
  fundadores: '#1D9E75',
  sin_roles: '#E8A020',
  inversionistas: '#4A90D9',
  sin_rol: '#8FA3CC',
}

export default function SeguimientoAdmin() {
  const [cargando, setCargando] = useState(true)
  const [grupos, setGrupos] = useState([])
  const [err, setErr] = useState('')
  const [contactados, setContactados] = useState({})

  useEffect(() => {
    async function cargar() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/registro?modo=login'; return }
      try {
        const r = await fetch('/api/admin/seguimiento', { headers: { Authorization: 'Bearer ' + session.access_token } })
        const d = await r.json()
        if (d.error) setErr(d.error)
        else setGrupos(d.grupos || [])
      } catch (e) { setErr(e.message) }
      setCargando(false)
    }
    cargar()
  }, [])

  const total = grupos.reduce((s, g) => s + g.items.length, 0)
  const marcar = (clave) => setContactados(c => ({ ...c, [clave]: true }))

  const s = {
    page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff', padding: '0 0 4rem' },
    wrap: { maxWidth: '900px', margin: '0 auto', padding: '2rem 1.25rem' },
    item: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.9rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' },
    btn: (bg, color) => ({ background: bg, color, borderRadius: '8px', padding: '0.45rem 0.9rem', fontSize: '0.78rem', fontWeight: '700', textDecoration: 'none', whiteSpace: 'nowrap', border: 'none' }),
  }

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <a href="/dashboard" style={{ fontSize: '0.78rem', color: '#8FA3CC', textDecoration: 'none' }}>← Dashboard</a>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.02em', margin: '0.75rem 0 0.35rem' }}>Seguimiento por WhatsApp</h1>
        <p style={{ fontSize: '0.85rem', color: '#8FA3CC', margin: '0 0 1.75rem', lineHeight: 1.6 }}>
          Quién se registró y no avanzó, con el mensaje listo. Casi nadie vuelve solo después del primer día: un mensaje a tiempo es lo que más mueve.
        </p>

        {cargando ? (
          <div style={{ color: '#8FA3CC', padding: '2rem 0' }}>Cargando...</div>
        ) : err ? (
          <div style={{ color: '#D85A30', padding: '2rem 0' }}>{err}</div>
        ) : total === 0 ? (
          <div style={{ color: '#1D9E75', padding: '2rem 0' }}>Nada pendiente. ✓</div>
        ) : (
          grupos.filter(g => g.items.length > 0).map(g => (
            <div key={g.id} style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLOR_GRUPO[g.id] || '#8FA3CC', display: 'inline-block' }}></span>
                <span style={{ fontSize: '0.95rem', fontWeight: '800' }}>{g.titulo}</span>
                <span style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>{g.items.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {g.items.map(it => {
                  const clave = g.id + ':' + it.id
                  return (
                    <div key={clave} style={{ ...s.item, opacity: contactados[clave] ? 0.5 : 1 }}>
                      <div style={{ minWidth: 0, flex: '1 1 260px' }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: '700' }}>
                          <a href={it.href} style={{ color: '#fff', textDecoration: 'none' }}>{it.nombre}</a>
                          <span style={{ fontSize: '0.72rem', fontWeight: '400', color: '#8FA3CC', marginLeft: '0.5rem' }}>hace {it.dias} {it.dias === 1 ? 'día' : 'días'}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#C8D4E8', marginTop: '0.2rem' }}>{it.detalle}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {it.whatsapp_url && (
                          <a href={it.whatsapp_url} target="_blank" rel="noopener noreferrer" onClick={() => marcar(clave)} style={s.btn('#1D9E75', '#fff')}>WhatsApp</a>
                        )}
                        {it.email_url && (
                          <a href={it.email_url} onClick={() => marcar(clave)} style={s.btn('rgba(255,255,255,0.08)', '#C8D4E8')}>Correo</a>
                        )}
                        {!it.whatsapp_url && !it.email_url && (
                          <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>Sin contacto</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
