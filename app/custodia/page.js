'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const ADMIN_IDS = ['a57b6849-1388-4186-8880-2ec31dd31af5']

const ESTADOS = {
  pendiente_pago: { label: 'Pendiente de pago', color: '#E8A020' },
  pago_reportado: { label: 'Pago reportado — Escala verificando', color: '#4A90D9' },
  en_custodia:    { label: 'En custodia de Escala', color: '#AFA9EC' },
  pago_emitido:   { label: 'Escala pagó — por confirmar', color: '#4A90D9' },
  completado:     { label: 'Completado', color: '#1D9E75' },
  cancelado:      { label: 'Cancelado', color: '#8FA3CC' },
}

const fmt = v => '$' + Math.round(v || 0).toLocaleString('es-CO')

export default function Custodia() {
  const [usuario, setUsuario] = useState(null)
  const [esAdmin, setEsAdmin] = useState(false)
  const [porPagar, setPorPagar] = useState([])
  const [porRecibir, setPorRecibir] = useState([])
  const [colaAdmin, setColaAdmin] = useState([])
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(null)

  async function auth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/registro?modo=login'; return null }
    return session
  }

  async function cargar() {
    const session = await auth()
    if (!session) return
    setUsuario(session.user)
    const admin = ADMIN_IDS.includes(session.user.id)
    setEsAdmin(admin)
    const headers = { Authorization: 'Bearer ' + session.access_token }
    try {
      const reqs = [
        fetch('/api/custodia?rol=pagador', { headers }).then(r => r.json()),
        fetch('/api/custodia?rol=receptor', { headers }).then(r => r.json()),
      ]
      if (admin) reqs.push(fetch('/api/custodia?rol=admin', { headers }).then(r => r.json()))
      const [pag, rec, adm] = await Promise.all(reqs)
      setPorPagar((pag.ordenes || []).filter(o => o.estado !== 'completado' && o.estado !== 'cancelado'))
      setPorRecibir((rec.ordenes || []).filter(o => o.estado !== 'completado' && o.estado !== 'cancelado'))
      if (admin && adm) setColaAdmin((adm.ordenes || []).filter(o => o.estado === 'pago_reportado' || o.estado === 'en_custodia'))
    } catch (e) { /* noop */ }
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  async function accion(orden_id, accion, pideRef) {
    let referencia = null
    if (pideRef) {
      referencia = window.prompt('Referencia de la transferencia BREB (opcional):') || ''
    }
    setProcesando(orden_id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/custodia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
        body: JSON.stringify({ accion, orden_id, referencia }),
      })
      const data = await res.json()
      if (data.error) { alert('No se pudo completar la acción: ' + data.error); setProcesando(null); return }
      await cargar()
    } catch (e) { alert('Error: ' + e.message) }
    setProcesando(null)
  }

  const s = {
    page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff', padding: '0 0 4rem' },
    wrap: { maxWidth: '760px', margin: '0 auto', padding: '2rem 1.25rem' },
    h1: { fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '0.25rem' },
    sub: { fontSize: '0.85rem', color: '#8FA3CC', marginBottom: '2rem', lineHeight: 1.6 },
    seccion: { fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8FA3CC', margin: '1.5rem 0 0.75rem' },
    card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem 1.1rem', marginBottom: '0.75rem' },
    monto: { fontSize: '1.15rem', fontWeight: '800' },
    concepto: { fontSize: '0.85rem', color: '#C8D4E8', marginTop: '0.15rem' },
    badge: (c) => ({ display: 'inline-block', fontSize: '0.68rem', fontWeight: '700', color: c, background: c + '18', border: '1px solid ' + c + '40', borderRadius: '999px', padding: '0.15rem 0.6rem', marginTop: '0.5rem' }),
    btn: { background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.55rem 1.1rem', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter,sans-serif', marginTop: '0.75rem' },
    btnAdmin: { background: '#4A90D9' },
    vacio: { color: '#6B7280', fontSize: '0.82rem', padding: '0.5rem 0' },
  }

  if (cargando) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8FA3CC' }}>Cargando…</div>

  const Card = ({ o, boton }) => (
    <div style={s.card}>
      <div style={s.monto}>{fmt(o.monto)} <span style={{ fontSize: '0.7rem', color: '#8FA3CC', fontWeight: '600' }}>{o.moneda}</span></div>
      <div style={s.concepto}>{o.concepto}</div>
      <div style={s.badge(ESTADOS[o.estado]?.color || '#8FA3CC')}>{ESTADOS[o.estado]?.label || o.estado}</div>
      {boton}
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={{ marginBottom: '1.5rem' }}>
          <a href="/wallet" style={{ fontSize: '0.8rem', color: '#8FA3CC', textDecoration: 'none' }}>← Wallet</a>
        </div>
        <div style={s.h1}>Custodia y pagos</div>
        <div style={s.sub}>Escala custodia y transfiere cada pago. Un pago se cierra cuando el que recibe lo confirma — no antes.</div>

        {/* POR PAGAR */}
        <div style={s.seccion}>Tienes que pagar a Escala</div>
        {porPagar.length === 0 ? <div style={s.vacio}>No tienes pagos pendientes.</div> : porPagar.map(o => (
          <Card key={o.id} o={o} boton={
            o.estado === 'pendiente_pago' ? (
              <button style={s.btn} disabled={procesando === o.id} onClick={() => accion(o.id, 'reportar_pago', true)}>
                {procesando === o.id ? 'Procesando…' : 'Ya pagué a Escala'}
              </button>
            ) : null
          } />
        ))}

        {/* POR RECIBIR */}
        <div style={s.seccion}>Escala te va a pagar</div>
        {porRecibir.length === 0 ? <div style={s.vacio}>No tienes pagos por recibir.</div> : porRecibir.map(o => (
          <Card key={o.id} o={o} boton={
            o.estado === 'pago_emitido' ? (
              <button style={s.btn} disabled={procesando === o.id} onClick={() => accion(o.id, 'confirmar_recibido', false)}>
                {procesando === o.id ? 'Procesando…' : 'Confirmar que recibí'}
              </button>
            ) : null
          } />
        ))}

        {/* ADMIN */}
        {esAdmin && (
          <>
            <div style={s.seccion}>Admin — cola de custodia</div>
            {colaAdmin.length === 0 ? <div style={s.vacio}>Nada pendiente de verificar.</div> : colaAdmin.map(o => (
              <Card key={o.id} o={o} boton={
                o.estado === 'pago_reportado' ? (
                  <button style={{ ...s.btn, ...s.btnAdmin }} disabled={procesando === o.id} onClick={() => accion(o.id, 'confirmar_recepcion', false)}>
                    {procesando === o.id ? 'Procesando…' : 'Confirmar que Escala recibió'}
                  </button>
                ) : o.estado === 'en_custodia' ? (
                  <button style={{ ...s.btn, ...s.btnAdmin }} disabled={procesando === o.id} onClick={() => accion(o.id, 'emitir_pago', true)}>
                    {procesando === o.id ? 'Procesando…' : 'Marcar que Escala pagó al receptor'}
                  </button>
                ) : null
              } />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
