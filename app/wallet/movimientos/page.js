'use client'
// app/wallet/movimientos/page.js — Historial completo de movimientos

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const MONEDA_SIMBOLO = { COP:'$', MXN:'$', CLP:'$', ARS:'$', PEN:'S/', USD:'US$', EUR:'€', USDT:'₮', USDC:'$' }

function fmt(n, moneda = 'COP') {
  return `${MONEDA_SIMBOLO[moneda] || ''}${parseFloat(n || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function formatFecha(ts) {
  return new Date(ts).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const s = {
  shell: { minHeight: '100vh', background: '#0A0F1E', fontFamily: 'Inter,sans-serif', color: '#fff', display: 'flex', flexDirection: 'column' },
  topbar: { background: '#0D1628', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  wordmark: { display: 'flex', alignItems: 'center', gap: '10px' },
  wordmarkMain: { fontSize: '15px', fontWeight: '500', color: '#fff' },
  wordmarkSep: { width: '1px', height: '14px', background: 'rgba(255,255,255,0.2)' },
  wordmarkSub: { fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase' },
  nav: { display: 'flex', gap: '2px' },
  navItem: { padding: '6px 12px', borderRadius: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', textDecoration: 'none' },
  navActive: { padding: '6px 12px', borderRadius: '6px', fontSize: '12px', color: '#fff', fontWeight: '500', background: 'rgba(255,255,255,0.08)', cursor: 'pointer', textDecoration: 'none' },
  backLink: { fontSize: '11px', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', textDecoration: 'none' },
  body: { display: 'flex', flex: 1 },
  sidebar: { width: '200px', flexShrink: 0, background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '16px 0' },
  sideSection: { padding: '0 12px', marginBottom: '20px' },
  sideLabel: { fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px', marginBottom: '4px' },
  sideItem: { display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 8px', borderRadius: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', marginBottom: '1px', textDecoration: 'none' },
  sideActive: { display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 8px', borderRadius: '6px', fontSize: '13px', color: '#fff', fontWeight: '500', background: 'rgba(255,255,255,0.08)', cursor: 'pointer', marginBottom: '1px', textDecoration: 'none' },
  main: { flex: 1, padding: '24px', overflowY: 'auto' },
  pageTitle: { fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '4px' },
  pageSub: { fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginBottom: '20px' },
  filterBar: { display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' },
  filterBtn: { padding: '5px 12px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', background: 'transparent', fontFamily: 'Inter,sans-serif' },
  filterBtnActive: { padding: '5px 12px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer', border: '1px solid rgba(29,158,117,0.4)', color: '#5DCAA5', background: 'rgba(29,158,117,0.1)', fontWeight: '600', fontFamily: 'Inter,sans-serif' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' },
  movItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' },
  movIcon: { width: '36px', height: '36px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 },
  movInfo: { flex: 1, minWidth: 0 },
  movName: { fontSize: '13px', fontWeight: '500', color: '#fff', marginBottom: '2px' },
  movSub: { fontSize: '11px', color: 'rgba(255,255,255,0.35)' },
  movRight: { textAlign: 'right', flexShrink: 0 },
  movAmtPos: { fontSize: '14px', fontWeight: '600', color: '#5DCAA5' },
  movAmtNeg: { fontSize: '14px', fontWeight: '600', color: '#E27A7A' },
  movDate: { fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' },
  emptyState: { padding: '60px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '13px' },
  pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' },
  paginBtn: { padding: '5px 14px', borderRadius: '6px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', background: 'transparent', cursor: 'pointer', fontFamily: 'Inter,sans-serif' },
  paginInfo: { fontSize: '11px', color: 'rgba(255,255,255,0.3)' },
  alertBox: { background: 'rgba(232,160,32,0.1)', border: '1px solid rgba(232,160,32,0.2)', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px', fontSize: '12px', color: '#F0B429' },
}

const LIMIT = 20

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [filtro, setFiltro] = useState('todos')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [sqlPendiente, setSqlPendiente] = useState(false)

  useEffect(() => {
    cargar()
  }, [filtro, offset])

  async function cargar() {
    setCargando(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/registro?modo=login'; return }

      const params = new URLSearchParams({
        limit: LIMIT,
        offset,
        ...(filtro !== 'todos' ? { tipo: filtro } : {}),
      })

      const res = await fetch(`/api/wallet/movimientos?${params}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      const data = await res.json()

      if (!res.ok) {
        // Si el error menciona la tabla, el SQL no se ha corrido
        if (data.error?.includes('relation') || data.error?.includes('does not exist')) {
          setSqlPendiente(true)
        } else {
          setError(data.error || 'Error cargando movimientos')
        }
        return
      }

      setMovimientos(data.movimientos || [])
      setTotal(data.total || 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  const paginas = Math.ceil(total / LIMIT)
  const paginaActual = Math.floor(offset / LIMIT) + 1

  return (
    <div style={s.shell}>
      <div style={s.topbar}>
        <div style={s.wordmark}>
          <div style={s.wordmarkMain}>Esca<span style={{ color: '#1D9E75' }}>la</span></div>
          <div style={s.wordmarkSep}></div>
          <div style={s.wordmarkSub}>Finanzas</div>
        </div>
        <div style={s.nav}>
          <a href="/wallet" style={s.navItem}>Wallet</a>
          <a href="/wallet/fondear" style={s.navItem}>Recargar</a>
          <a href="/wallet/movimientos" style={s.navActive}>Historial</a>
          <a href="/wallet/pagos/solicitar" style={s.navItem}>Pagos</a>
        </div>
        <a href="/dashboard" style={s.backLink}>← Volver a Escala</a>
      </div>

      <div style={s.body}>
        <div style={s.sidebar}>
          <div style={s.sideSection}>
            <div style={s.sideLabel}>Mi dinero</div>
            <a href="/wallet" style={s.sideItem}>💼 Wallet</a>
            <a href="/wallet/movimientos" style={s.sideActive}>📋 Movimientos</a>
            <a href="/wallet/fondear" style={s.sideItem}>⬇️ Recargar</a>
          </div>
          <div style={s.sideSection}>
            <div style={s.sideLabel}>Pagos</div>
            <a href="/wallet/pagos/solicitar" style={s.sideItem}>📤 Solicitar pago</a>
            <a href="/wallet/pagos" style={s.sideItem}>📄 Mis órdenes</a>
          </div>
        </div>

        <div style={s.main}>
          <div style={s.pageTitle}>Historial de movimientos</div>
          <div style={s.pageSub}>{total > 0 ? `${total} movimientos en total` : 'Todos los débitos y créditos de tu wallet'}</div>

          {sqlPendiente && (
            <div style={s.alertBox}>
              ⚠️ El módulo financiero aún no está activo. El administrador de Escala debe correr el SQL de configuración para habilitar wallets y movimientos.
            </div>
          )}

          {error && (
            <div style={{ ...s.alertBox, background: 'rgba(226,75,74,0.1)', borderColor: 'rgba(226,75,74,0.2)', color: '#E27A7A' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Filtros */}
          <div style={s.filterBar}>
            {[['todos', 'Todos'], ['entrada', '⬇️ Entradas'], ['salida', '📤 Salidas']].map(([id, label]) => (
              <button key={id} style={filtro === id ? s.filterBtnActive : s.filterBtn} onClick={() => { setFiltro(id); setOffset(0) }}>
                {label}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
              {cargando ? 'Cargando...' : `${total} resultado${total !== 1 ? 's' : ''}`}
            </span>
          </div>

          <div style={s.card}>
            {cargando ? (
              <div style={s.emptyState}>Cargando...</div>
            ) : sqlPendiente || movimientos.length === 0 ? (
              <div style={s.emptyState}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>📋</div>
                {sqlPendiente ? 'Módulo financiero pendiente de activación' : 'Aún no hay movimientos'}
                {!sqlPendiente && filtro !== 'todos' && (
                  <div style={{ marginTop: '8px' }}>
                    <button style={s.filterBtn} onClick={() => setFiltro('todos')}>Ver todos</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {movimientos.map(m => (
                  <div key={m.id} style={s.movItem}>
                    <div style={{ ...s.movIcon, background: m.direccion === 'entrada' ? 'rgba(29,158,117,0.15)' : 'rgba(226,75,74,0.15)' }}>
                      {m.referencia_tipo === 'fondeo' ? '⬇️' : m.referencia_tipo === 'reversal' ? '↩️' : '📤'}
                    </div>
                    <div style={s.movInfo}>
                      <div style={s.movName}>{m.descripcion}</div>
                      <div style={s.movSub}>
                        {m.referencia_tipo} · {m.moneda} · Ref: {m.idempotency_key?.replace(/_db$|_cr$/, '')?.substring(0, 20)}
                      </div>
                    </div>
                    <div style={s.movRight}>
                      <div style={m.direccion === 'entrada' ? s.movAmtPos : s.movAmtNeg}>
                        {m.direccion === 'entrada' ? '+' : '-'}{fmt(m.monto, m.moneda)}
                      </div>
                      <div style={s.movDate}>{formatFecha(m.created_at)}</div>
                    </div>
                  </div>
                ))}

                {paginas > 1 && (
                  <div style={s.pagination}>
                    <button style={s.paginBtn} onClick={() => setOffset(Math.max(0, offset - LIMIT))} disabled={offset === 0}>
                      ← Anterior
                    </button>
                    <span style={s.paginInfo}>Página {paginaActual} de {paginas}</span>
                    <button style={s.paginBtn} onClick={() => setOffset(offset + LIMIT)} disabled={paginaActual >= paginas}>
                      Siguiente →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
