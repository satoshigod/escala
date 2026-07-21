'use client'
// app/wallet/pagos/page.js — Mis órdenes de pago

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const ESTADOS = {
  pendiente:   { color: '#F0B429', bg: 'rgba(232,160,32,0.15)',  label: 'Pendiente' },
  en_revision: { color: '#64A8E0', bg: 'rgba(24,95,165,0.15)',   label: 'En revisión' },
  aprobada:    { color: '#9B93F7', bg: 'rgba(83,74,183,0.15)',   label: 'Aprobada' },
  rechazada:   { color: '#E27A7A', bg: 'rgba(226,75,74,0.15)',   label: 'Rechazada' },
  cancelada:   { color: '#888',    bg: 'rgba(255,255,255,0.06)', label: 'Cancelada' },
  pagada:      { color: '#5DCAA5', bg: 'rgba(29,158,117,0.15)',  label: 'Pagada' },
  reversada:   { color: '#888',    bg: 'rgba(255,255,255,0.06)', label: 'Reversada' },
}

function fmt(n, moneda = 'COP') {
  return `${moneda} ${parseFloat(n || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

const s = {
  shell: { minHeight: '100vh', background: '#0A0F1E', fontFamily: 'Inter,sans-serif', color: '#fff', display: 'flex', flexDirection: 'column' },
  topbar: { background: '#0D1628', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  wordmarkMain: { fontSize: '15px', fontWeight: '500', color: '#fff' },
  wordmarkSep: { width: '1px', height: '14px', background: 'rgba(255,255,255,0.2)', margin: '0 10px' },
  wordmarkSub: { fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase' },
  navItem: { padding: '6px 12px', borderRadius: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' },
  navActive: { padding: '6px 12px', borderRadius: '6px', fontSize: '12px', color: '#fff', fontWeight: '500', background: 'rgba(255,255,255,0.08)', textDecoration: 'none' },
  body: { display: 'flex', flex: 1 },
  sidebar: { width: '200px', background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '16px 0' },
  sideSection: { padding: '0 12px', marginBottom: '20px' },
  sideLabel: { fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px', marginBottom: '4px' },
  sideItem: { display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 8px', borderRadius: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginBottom: '1px', textDecoration: 'none' },
  sideActive: { display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 8px', borderRadius: '6px', fontSize: '13px', color: '#fff', fontWeight: '500', background: 'rgba(255,255,255,0.08)', marginBottom: '1px', textDecoration: 'none' },
  main: { flex: 1, padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  pageTitle: { fontSize: '18px', fontWeight: '600', color: '#fff' },
  btnNew: { padding: '8px 16px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', textDecoration: 'none' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' },
  row: { display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' },
  rowIcon: { width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 },
  rowInfo: { flex: 1, minWidth: 0 },
  rowTitle: { fontSize: '13px', fontWeight: '500', color: '#fff', marginBottom: '2px' },
  rowSub: { fontSize: '11px', color: 'rgba(255,255,255,0.35)' },
  rowRight: { textAlign: 'right', flexShrink: 0 },
  rowAmount: { fontSize: '14px', fontWeight: '600', color: '#fff' },
  rowDate: { fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' },
  pill: { display: 'inline-flex', fontSize: '10px', fontWeight: '600', padding: '2px 7px', borderRadius: '20px', marginTop: '3px' },
  empty: { padding: '60px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '13px' },
  alertBox: { background: 'rgba(232,160,32,0.1)', border: '1px solid rgba(232,160,32,0.2)', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px', fontSize: '12px', color: '#F0B429' },
}

export default function PagosPage() {
  const [ordenes, setOrdenes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [sqlPendiente, setSqlPendiente] = useState(false)

  useEffect(() => {
    async function cargar() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/registro?modo=login'; return }
      try {
        const res = await fetch('/api/pagos', { headers: { 'Authorization': `Bearer ${session.access_token}` } })
        const data = await res.json()
        if (data.error?.includes('relation') || data.error?.includes('does not exist')) {
          setSqlPendiente(true)
        } else {
          setOrdenes(data.ordenes || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  return (
    <div style={s.shell}>
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={s.wordmarkMain}>Esca<span style={{ color: '#1D9E75' }}>la</span></div>
          <div style={s.wordmarkSep}></div>
          <div style={s.wordmarkSub}>Finanzas</div>
        </div>
        <div style={{ display: 'flex', gap: '2px' }}>
          <a href="/wallet" style={s.navItem}>Wallet</a>
          <a href="/wallet/fondear" style={s.navItem}>Recargar</a>
          <a href="/wallet/movimientos" style={s.navItem}>Historial</a>
          <a href="/wallet/pagos" style={s.navActive}>Pagos</a>
        </div>
        <a href="/dashboard" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>← Volver a Escala</a>
      </div>

      <div style={s.body}>
        <div style={s.sidebar}>
          <div style={s.sideSection}>
            <div style={s.sideLabel}>Mi dinero</div>
            <a href="/wallet" style={s.sideItem}>💼 Wallet</a>
            <a href="/wallet/movimientos" style={s.sideItem}>📋 Movimientos</a>
            <a href="/wallet/fondear" style={s.sideItem}>⬇️ Recargar</a>
          </div>
          <div style={s.sideSection}>
            <div style={s.sideLabel}>Pagos</div>
            <a href="/wallet/pagos/solicitar" style={s.sideItem}>📤 Solicitar pago</a>
            <a href="/wallet/pagos" style={s.sideActive}>📄 Mis órdenes</a>
          </div>
        </div>

        <div style={s.main}>
          <div style={s.header}>
            <div style={s.pageTitle}>Mis órdenes de pago</div>
            <a href="/wallet/pagos/solicitar" style={s.btnNew}>+ Solicitar pago</a>
          </div>

          {sqlPendiente && (
            <div style={s.alertBox}>
              ⚠️ El módulo financiero aún no está activo. El administrador debe correr el SQL de configuración.
            </div>
          )}

          <div style={s.card}>
            {cargando ? (
              <div style={s.empty}>Cargando...</div>
            ) : sqlPendiente || ordenes.length === 0 ? (
              <div style={s.empty}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>📄</div>
                {sqlPendiente ? 'Módulo financiero pendiente de activación' : 'Sin órdenes de pago aún'}
                {!sqlPendiente && <div style={{ marginTop: '10px' }}><a href="/wallet/pagos/solicitar" style={{ color: '#5DCAA5', fontSize: '12px' }}>Crear primera solicitud →</a></div>}
              </div>
            ) : ordenes.map(o => {
              const est = ESTADOS[o.estado] || ESTADOS.pendiente
              return (
                <div key={o.id} style={s.row}>
                  <div style={s.rowIcon}>📤</div>
                  <div style={s.rowInfo}>
                    <div style={s.rowTitle}>{o.concepto}</div>
                    <div style={s.rowSub}>
                      {o.proyectos?.nombre || 'Sin proyecto'} · {o.perfiles?.nombre || 'Beneficiario'}
                    </div>
                    <span style={{ ...s.pill, background: est.bg, color: est.color }}>{est.label}</span>
                  </div>
                  <div style={s.rowRight}>
                    <div style={s.rowAmount}>{fmt(o.monto, o.moneda)}</div>
                    <div style={s.rowDate}>{new Date(o.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
