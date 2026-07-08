'use client'
// app/admin/financiero/page.js — Panel financiero del administrador

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const ESTADOS_COLOR = {
  pendiente: { bg:'rgba(232,160,32,0.15)', color:'#F0B429' },
  en_revision: { bg:'rgba(24,95,165,0.15)', color:'#64A8E0' },
  aprobada: { bg:'rgba(83,74,183,0.15)', color:'#9B93F7' },
  rechazada: { bg:'rgba(226,75,74,0.15)', color:'#E27A7A' },
  pagada: { bg:'rgba(29,158,117,0.15)', color:'#5DCAA5' },
  reversada: { bg:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.4)' },
}

function fmt(n, moneda='COP') {
  return `${moneda} ${parseFloat(n||0).toLocaleString('es-CO',{minimumFractionDigits:0,maximumFractionDigits:2})}`
}

function Pill({ estado }) {
  const c = ESTADOS_COLOR[estado] || { bg:'rgba(255,255,255,0.08)', color:'#fff' }
  return (
    <span style={{ background:c.bg, color:c.color, fontSize:'10px', fontWeight:'600', padding:'3px 8px', borderRadius:'20px' }}>
      {estado.replace('_',' ')}
    </span>
  )
}

const s = {
  shell: { minHeight:'100vh', background:'#0A0F1E', fontFamily:'Inter,sans-serif', color:'#fff' },
  topbar: { background:'#0D1628', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'0 24px', height:'52px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  wordmark: { display:'flex', alignItems:'center', gap:'10px' },
  wordmarkMain: { fontSize:'15px', fontWeight:'500', color:'#fff' },
  wordmarkSep: { width:'1px', height:'14px', background:'rgba(255,255,255,0.2)' },
  wordmarkSub: { fontSize:'11px', color:'rgba(255,255,255,0.4)', letterSpacing:'0.06em', textTransform:'uppercase' },
  nav: { display:'flex', gap:'2px' },
  navItem: { padding:'6px 12px', borderRadius:'6px', fontSize:'12px', color:'rgba(255,255,255,0.45)', cursor:'pointer', textDecoration:'none' },
  navActive: { padding:'6px 12px', borderRadius:'6px', fontSize:'12px', color:'#fff', fontWeight:'500', background:'rgba(255,255,255,0.08)', cursor:'pointer', textDecoration:'none' },
  main: { padding:'24px' },
  pageTitle: { fontSize:'18px', fontWeight:'600', color:'#fff', marginBottom:'20px' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' },
  statCard: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'10px', padding:'14px' },
  statLabel: { fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'6px' },
  statVal: { fontSize:'20px', fontWeight:'600', color:'#fff', lineHeight:1 },
  statValGreen: { fontSize:'20px', fontWeight:'600', color:'#5DCAA5', lineHeight:1 },
  statValAmber: { fontSize:'20px', fontWeight:'600', color:'#F0B429', lineHeight:1 },
  filterBar: { display:'flex', gap:'8px', marginBottom:'14px', flexWrap:'wrap' },
  filterSel: { padding:'6px 12px', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'6px', fontSize:'12px', color:'rgba(255,255,255,0.6)', background:'rgba(255,255,255,0.04)', cursor:'pointer', fontFamily:'Inter,sans-serif' },
  table: { width:'100%', borderCollapse:'collapse', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', overflow:'hidden' },
  th: { textAlign:'left', fontSize:'10px', fontWeight:'600', color:'rgba(255,255,255,0.3)', padding:'10px 12px', borderBottom:'1px solid rgba(255,255,255,0.06)', textTransform:'uppercase', letterSpacing:'0.05em' },
  td: { fontSize:'12px', color:'rgba(255,255,255,0.8)', padding:'12px', borderBottom:'1px solid rgba(255,255,255,0.04)', verticalAlign:'middle' },
  tdMono: { fontSize:'11px', color:'rgba(255,255,255,0.45)', padding:'12px', borderBottom:'1px solid rgba(255,255,255,0.04)', fontFamily:'monospace', verticalAlign:'middle' },
  actBtn: { padding:'4px 10px', borderRadius:'5px', fontSize:'11px', fontWeight:'600', cursor:'pointer', border:'none', marginRight:'4px' },
  actBtnAp: { padding:'4px 10px', borderRadius:'5px', fontSize:'11px', fontWeight:'600', cursor:'pointer', border:'none', marginRight:'4px', background:'rgba(29,158,117,0.2)', color:'#5DCAA5' },
  actBtnRe: { padding:'4px 10px', borderRadius:'5px', fontSize:'11px', fontWeight:'600', cursor:'pointer', border:'none', marginRight:'4px', background:'rgba(226,75,74,0.2)', color:'#E27A7A' },
  actBtnEx: { padding:'4px 10px', borderRadius:'5px', fontSize:'11px', fontWeight:'600', cursor:'pointer', border:'none', marginRight:'4px', background:'rgba(83,74,183,0.2)', color:'#9B93F7' },
  actBtnVer: { padding:'4px 10px', borderRadius:'5px', fontSize:'11px', fontWeight:'600', cursor:'pointer', border:'none', marginRight:'4px', background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.5)' },
  modal: { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 },
  modalBox: { background:'#1A2035', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'12px', padding:'24px', width:'440px', maxWidth:'90vw' },
  modalTitle: { fontSize:'15px', fontWeight:'600', color:'#fff', marginBottom:'16px' },
  modalInput: { width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px', color:'#fff', fontSize:'13px', fontFamily:'Inter,sans-serif', marginBottom:'10px', boxSizing:'border-box' },
  modalBtnGr: { width:'100%', padding:'10px', background:'#1D9E75', color:'#fff', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'600', cursor:'pointer', marginBottom:'8px' },
  modalBtnOut: { width:'100%', padding:'10px', background:'transparent', color:'rgba(255,255,255,0.45)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', fontSize:'13px', cursor:'pointer' },
  error: { background:'rgba(226,75,74,0.15)', border:'1px solid rgba(226,75,74,0.3)', borderRadius:'8px', padding:'10px', fontSize:'12px', color:'#E27A7A', marginBottom:'10px' },
}

export default function AdminFinancieroPage() {
  const [ordenes, setOrdenes] = useState([])
  const [resumen, setResumen] = useState({})
  const [filtroEstado, setFiltroEstado] = useState('')
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(null) // { orden, accion }
  const [modalData, setModalData] = useState({ razon:'', comprobante_url:'', numero_referencia:'', observaciones:'' })
  const [procesando, setProcesando] = useState(false)
  const [modalError, setModalError] = useState('')

  useEffect(() => { cargar() }, [filtroEstado])

  async function cargar() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/registro?modo=login'; return }
    setCargando(true)
    try {
      const params = filtroEstado ? `?estado=${filtroEstado}` : ''
      const res = await fetch(`/api/admin/financiero${params}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      const data = await res.json()
      if (!res.ok) { window.location.href = '/dashboard'; return }
      setOrdenes(data.ordenes || [])
      setResumen(data.resumen || {})
    } finally {
      setCargando(false)
    }
  }

  async function ejecutarAccion() {
    setModalError('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    setProcesando(true)
    try {
      const res = await fetch('/api/admin/financiero', {
        method: 'PATCH',
        headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${session.access_token}` },
        body: JSON.stringify({ orden_id: modal.orden.id, accion: modal.accion, ...modalData }),
      })
      const data = await res.json()
      if (!res.ok) { setModalError(data.error || 'Error'); return }
      setModal(null)
      setModalData({ razon:'', comprobante_url:'', numero_referencia:'', observaciones:'' })
      cargar()
    } catch (e) {
      setModalError(e.message)
    } finally {
      setProcesando(false)
    }
  }

  function abrirModal(orden, accion) {
    setModalData({ razon:'', comprobante_url:'', numero_referencia:'', observaciones:'' })
    setModalError('')
    setModal({ orden, accion })
  }

  return (
    <div style={s.shell}>
      <div style={s.topbar}>
        <div style={s.wordmark}>
          <div style={s.wordmarkMain}>Esca<span style={{ color:'#1D9E75' }}>la</span></div>
          <div style={s.wordmarkSep}></div>
          <div style={s.wordmarkSub}>Admin · Finanzas</div>
        </div>
        <div style={s.nav}>
          <a href="/admin/financiero" style={s.navActive}>Órdenes</a>
          <a href="/admin-escala" style={s.navItem}>← Admin Escala</a>
        </div>
        <a href="/dashboard" style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>← Dashboard</a>
      </div>

      <div style={s.main}>
        <div style={s.pageTitle}>Panel Financiero</div>

        {/* KPIs */}
        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <div style={s.statLabel}>Total pagado (USD)</div>
            <div style={s.statValGreen}>US${parseFloat(resumen.total_pagado_usd||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>Órdenes pendientes</div>
            <div style={s.statValAmber}>{resumen.pendientes || 0}</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>En revisión</div>
            <div style={s.statVal}>{resumen.en_revision || 0}</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>Aprobadas (listas)</div>
            <div style={{ ...s.statVal, color:'#9B93F7' }}>{resumen.aprobadas || 0}</div>
          </div>
        </div>

        {/* Filtros */}
        <div style={s.filterBar}>
          {['','pendiente','en_revision','aprobada','rechazada','pagada','reversada'].map(e => (
            <button key={e} style={{ ...s.filterSel, ...(filtroEstado===e ? { borderColor:'#1D9E75', color:'#5DCAA5' } : {}) }} onClick={() => setFiltroEstado(e)}>
              {e || 'Todos'}
            </button>
          ))}
        </div>

        {/* Tabla */}
        {cargando ? (
          <div style={{ textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.3)' }}>Cargando...</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Referencia</th>
                <th style={s.th}>Solicitante</th>
                <th style={s.th}>Proyecto</th>
                <th style={s.th}>Monto</th>
                <th style={s.th}>Estado</th>
                <th style={s.th}>Fecha</th>
                <th style={s.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.length === 0 && (
                <tr><td colSpan={7} style={{ ...s.td, textAlign:'center', color:'rgba(255,255,255,0.25)', padding:'32px' }}>Sin órdenes{filtroEstado ? ` en estado "${filtroEstado}"` : ''}</td></tr>
              )}
              {ordenes.map(o => (
                <tr key={o.id}>
                  <td style={s.tdMono}>OP-{o.id.substring(0,8).toUpperCase()}</td>
                  <td style={s.td}>{o.solicitante?.nombre || '—'}</td>
                  <td style={s.td}>{o.proyectos?.nombre || '—'}</td>
                  <td style={{ ...s.td, fontWeight:'600' }}>{fmt(o.monto, o.moneda)}</td>
                  <td style={s.td}><Pill estado={o.estado} /></td>
                  <td style={{ ...s.td, color:'rgba(255,255,255,0.35)', fontSize:'11px' }}>
                    {new Date(o.created_at).toLocaleDateString('es-CO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}
                  </td>
                  <td style={s.td}>
                    {(o.estado === 'pendiente' || o.estado === 'en_revision') && (
                      <>
                        <button style={s.actBtnAp} onClick={() => abrirModal(o,'aprobar')}>Aprobar</button>
                        <button style={s.actBtnRe} onClick={() => abrirModal(o,'rechazar')}>Rechazar</button>
                      </>
                    )}
                    {o.estado === 'aprobada' && (
                      <button style={s.actBtnEx} onClick={() => abrirModal(o,'ejecutar')}>Ejecutar</button>
                    )}
                    {o.estado === 'pagada' && (
                      <button style={s.actBtnRe} onClick={() => abrirModal(o,'reversar')}>Reversar</button>
                    )}
                    <button style={s.actBtnVer} onClick={() => abrirModal(o,'ver')}>Ver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de acción */}
      {modal && modal.accion !== 'ver' && (
        <div style={s.modal} onClick={() => setModal(null)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <div style={s.modalTitle}>
              {modal.accion === 'aprobar' ? '✅ Aprobar orden' :
               modal.accion === 'rechazar' ? '❌ Rechazar orden' :
               modal.accion === 'ejecutar' ? '💸 Ejecutar pago' : '↩️ Reversar pago'}
            </div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginBottom:'14px' }}>
              {fmt(modal.orden.monto, modal.orden.moneda)} · {modal.orden.solicitante?.nombre} · {modal.orden.proyectos?.nombre || 'Sin proyecto'}
            </div>

            {modalError && <div style={s.error}>{modalError}</div>}

            {modal.accion === 'rechazar' && (
              <textarea
                style={{ ...s.modalInput, height:'80px', resize:'vertical' }}
                placeholder="Motivo del rechazo (obligatorio)..."
                value={modalData.razon}
                onChange={e => setModalData(p => ({...p, razon:e.target.value}))}
              />
            )}
            {modal.accion === 'ejecutar' && (
              <>
                <input style={s.modalInput} placeholder="Número de referencia de la transferencia" value={modalData.numero_referencia} onChange={e => setModalData(p => ({...p, numero_referencia:e.target.value}))} />
                <input style={s.modalInput} placeholder="URL del comprobante (opcional)" value={modalData.comprobante_url} onChange={e => setModalData(p => ({...p, comprobante_url:e.target.value}))} />
              </>
            )}
            <textarea
              style={{ ...s.modalInput, height:'60px', resize:'vertical' }}
              placeholder="Observaciones (opcional)..."
              value={modalData.observaciones}
              onChange={e => setModalData(p => ({...p, observaciones:e.target.value}))}
            />

            <button style={s.modalBtnGr} onClick={ejecutarAccion} disabled={procesando}>
              {procesando ? 'Procesando...' : `Confirmar ${modal.accion}`}
            </button>
            <button style={s.modalBtnOut} onClick={() => setModal(null)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}
