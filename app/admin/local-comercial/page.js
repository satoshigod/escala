'use client'
// /admin/local-comercial — Panel interno de Escala
// Lista proyectos de negocio en local por verificar + aprobar/rechazar + asignar tasa

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

const fmt = (n) => Math.round(parseFloat(n || 0)).toLocaleString('es-CO')

const USURA = {
  convencional: 26.26,  // % anual - actualizar segun Superfinanciera
  digital: 55.0,         // % anual plataformas digitales
}
const mensual = (anual) => (anual / 12).toFixed(2)

export default function AdminLocalComercialPage() {
  const [locales, setLocales] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('en_verificacion')
  const [seleccionado, setSeleccionado] = useState(null)
  const [tasa, setTasa] = useState('')
  const [motivo, setMotivo] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { cargar() }, [filtro])

  async function cargar() {
    setCargando(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch(`/api/admin/local-comercial?estado=${filtro}`, {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
    const d = await res.json()
    if (d.ok) setLocales(d.locales)
    else setError(d.error)
    setCargando(false)
  }

  async function ejecutarAccion(local_id, accion) {
    if (accion === 'aprobar' && !tasa) { setError('Debes asignar una tasa mensual'); return }
    if (accion === 'rechazar' && !motivo.trim()) { setError('Debes escribir el motivo del rechazo'); return }
    setProcesando(true)
    setError('')
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/admin/local-comercial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ local_id, accion, tasa_mensual: parseFloat(tasa), motivo_rechazo: motivo }),
    })
    const d = await res.json()
    if (d.ok) {
      setMensaje(d.mensaje)
      setSeleccionado(null)
      setTasa('')
      setMotivo('')
      await cargar()
    } else {
      setError(d.error)
    }
    setProcesando(false)
  }

  const s = {
    page: { minHeight: '100vh', background: '#0B1628', fontFamily: 'Inter,sans-serif', color: '#fff' },
    nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    wrap: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' },
    card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1rem' },
    label: { fontSize: '0.75rem', fontWeight: '700', color: '#8FA3CC', marginBottom: '4px', display: 'block' },
    input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '0.6rem 0.875rem', color: '#fff', fontSize: '0.85rem', outline: 'none', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box', marginBottom: '0.75rem' },
    btn: (color) => ({ background: color, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.25rem', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }),
  }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href="/dashboard" style={{ fontSize: '1rem', fontWeight: '900', color: '#fff', textDecoration: 'none', letterSpacing: '-0.03em' }}>Esca<span style={{ color: '#1D9E75' }}>la</span></a>
        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff' }}>Admin — Verificacion de Locales</div>
        <a href="/admin" style={{ fontSize: '0.78rem', color: '#8FA3CC', textDecoration: 'none' }}>← Admin</a>
      </nav>

      <div style={s.wrap}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>Verificacion de negocios en local comercial</h1>
          <p style={{ fontSize: '0.82rem', color: '#8FA3CC' }}>Revisa la informacion, contacta al propietario del local y asigna la tasa segun el estudio de credito del operador.</p>
        </div>

        {/* Referencia de tasas */}
        <div style={{ ...s.card, background: 'rgba(74,144,217,0.06)', borderColor: 'rgba(74,144,217,0.2)', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#4A90D9', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Referencia de tasas (Superfinanciera)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Usura convencional</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1D9E75' }}>{USURA.convencional}% EA</div>
              <div style={{ fontSize: '0.72rem', color: '#8FA3CC' }}>{mensual(USURA.convencional)}% mensual</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Usura plataformas digitales</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#E8A020' }}>{USURA.digital}% EA</div>
              <div style={{ fontSize: '0.72rem', color: '#8FA3CC' }}>{mensual(USURA.digital)}% mensual</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Rango permitido Escala</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>{mensual(USURA.convencional)}% – {mensual(USURA.digital)}% mensual</div>
              <div style={{ fontSize: '0.72rem', color: '#8FA3CC' }}>Segun perfil del operador</div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {['en_verificacion', 'aprobado', 'rechazado'].map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{ background: filtro === f ? '#1D9E75' : 'rgba(255,255,255,0.06)', border: '1px solid ' + (filtro === f ? '#1D9E75' : 'rgba(255,255,255,0.12)'), color: filtro === f ? '#fff' : '#8FA3CC', borderRadius: '20px', padding: '0.3rem 0.875rem', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
              {f === 'en_verificacion' ? 'Por verificar' : f === 'aprobado' ? 'Aprobados' : 'Rechazados'}
            </button>
          ))}
        </div>

        {mensaje && <div style={{ background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#1D9E75' }}>{mensaje}</div>}
        {error && <div style={{ background: 'rgba(224,85,85,0.1)', border: '1px solid rgba(224,85,85,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#E05555' }}>{error}</div>}

        {cargando ? (
          <div style={{ color: '#8FA3CC', textAlign: 'center', padding: '3rem' }}>Cargando...</div>
        ) : locales.length === 0 ? (
          <div style={{ ...s.card, textAlign: 'center', padding: '3rem', color: '#6B7280' }}>No hay proyectos en este estado</div>
        ) : (
          locales.map(local => (
            <div key={local.id} style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '2px' }}>{local.nombre_negocio}</div>
                  <div style={{ fontSize: '0.75rem', color: '#8FA3CC' }}>
                    {local.tipo_negocio} · {local.ciudad} · Operador: {local.proyectos?.perfiles?.nombre || 'Desconocido'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '2px' }}>
                    Enviado: {new Date(local.created_at).toLocaleDateString('es-CO')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a href={`/proyectos/${local.proyecto_id}/workspace`} target="_blank" style={{ background: 'rgba(74,144,217,0.15)', border: '1px solid rgba(74,144,217,0.3)', color: '#4A90D9', padding: '0.4rem 0.875rem', borderRadius: '6px', textDecoration: 'none', fontSize: '0.75rem', fontWeight: '600' }}>Ver workspace</a>
                  {filtro === 'en_verificacion' && (
                    <button onClick={() => setSeleccionado(seleccionado === local.id ? null : local.id)} style={{ background: seleccionado === local.id ? 'rgba(232,160,32,0.15)' : 'rgba(255,255,255,0.06)', border: '1px solid ' + (seleccionado === local.id ? 'rgba(232,160,32,0.3)' : 'rgba(255,255,255,0.12)'), color: seleccionado === local.id ? '#E8A020' : '#fff', padding: '0.4rem 0.875rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                      {seleccionado === local.id ? 'Cerrar' : 'Verificar'}
                    </button>
                  )}
                </div>
              </div>

              {/* Datos del local */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.875rem' }}>
                {[
                  ['Direccion', local.direccion_local],
                  ['Propietario', local.propietario_nombre],
                  ['Telefono propietario', local.propietario_telefono],
                  ['Canon mensual', `$${fmt(local.canon_mensual)}`],
                  ['Deposito', `${local.meses_deposito} meses = $${fmt(local.canon_mensual * local.meses_deposito)}`],
                  ['Capital total', `$${fmt(local.capital_total)}`],
                  ['Fijos/dia', `$${fmt(local.fijo_dia)}`],
                  ['Margen producto', `${local.margen_pct}%`],
                  ['Venta dia normal', `$${fmt(local.ventas_dia_normal)}`],
                  ['Excedente estimado/dia', `$${fmt(local.ventas_dia_normal * local.margen_pct / 100 - local.fijo_dia)}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                    <div style={{ fontSize: '0.65rem', color: '#6B7280', marginBottom: '2px' }}>{k}</div>
                    <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: '500' }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Checklist de verificacion */}
              {seleccionado === local.id && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1rem', marginTop: '0.875rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#fff', marginBottom: '0.875rem' }}>Checklist de verificacion</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1rem' }}>
                    {[
                      'Llame al propietario y confirme que el local existe y el canon es correcto',
                      'Confirme los meses de deposito requeridos',
                      'Revise que la proyeccion de ventas es coherente con el tipo de negocio',
                      'Verifique que el margen declarado es razonable para ese sector',
                      'El excedente diario es suficiente para cubrir la deuda en un tiempo razonable',
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.78rem', color: '#8FA3CC' }}>
                        <span style={{ color: '#1D9E75', flexShrink: 0 }}>☐</span> {item}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={s.label}>Tasa mensual a asignar (%)</label>
                      <div style={{ fontSize: '0.72rem', color: '#6B7280', marginBottom: '6px' }}>Entre {mensual(USURA.convencional)}% y {mensual(USURA.digital)}% mensual</div>
                      <input style={s.input} type="number" step="0.1" min={mensual(USURA.convencional)} max={mensual(USURA.digital)} value={tasa} onChange={e => setTasa(e.target.value)} placeholder={`Ej: ${mensual(USURA.convencional)}`} />
                      {tasa && (
                        <div style={{ fontSize: '0.72rem', color: '#4A90D9', marginBottom: '0.75rem' }}>
                          Intereses dia 1: ${fmt(parseFloat(local.capital_total) * parseFloat(tasa) / 100 / 30)}
                        </div>
                      )}
                      <button onClick={() => ejecutarAccion(local.id, 'aprobar')} disabled={procesando} style={{ ...s.btn('#1D9E75'), width: '100%' }}>
                        {procesando ? 'Procesando...' : `Aprobar con ${tasa || '?'}% mensual`}
                      </button>
                    </div>
                    <div>
                      <label style={s.label}>Motivo del rechazo</label>
                      <textarea style={{ ...s.input, height: '80px', resize: 'vertical' }} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ej: El propietario no confirmó el local. El local no existe en la dirección indicada..." />
                      <button onClick={() => ejecutarAccion(local.id, 'rechazar')} disabled={procesando} style={{ ...s.btn('#E05555'), width: '100%' }}>
                        {procesando ? 'Procesando...' : 'Rechazar y notificar al operador'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Estado si ya fue procesado */}
              {local.estado_verificacion === 'aprobado' && (
                <div style={{ background: 'rgba(29,158,117,0.08)', borderRadius: '8px', padding: '0.5rem 0.875rem', fontSize: '0.78rem', color: '#1D9E75' }}>
                  Aprobado · Tasa: {local.tasa_mensual}% mensual · {local.verificado_at ? new Date(local.verificado_at).toLocaleDateString('es-CO') : ''}
                </div>
              )}
              {local.estado_verificacion === 'rechazado' && (
                <div style={{ background: 'rgba(224,85,85,0.08)', borderRadius: '8px', padding: '0.5rem 0.875rem', fontSize: '0.78rem', color: '#E05555' }}>
                  Rechazado · {local.motivo_rechazo}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
