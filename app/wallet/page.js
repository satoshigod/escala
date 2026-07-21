'use client'
// app/wallet/page.js — Mi Wallet
// Módulo financiero independiente — NO usa NavApp del dashboard general

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const MONEDA_SIMBOLO = { COP:'$', MXN:'$', CLP:'$', ARS:'$', PEN:'S/', USD:'US$', EUR:'€', USDT:'₮', USDC:'$' }
const MONEDA_PAIS = { COP:'🇨🇴', MXN:'🇲🇽', CLP:'🇨🇱', ARS:'🇦🇷', PEN:'🇵🇪', USD:'🇪🇨', EUR:'🇪🇸', USDT:'🌐', USDC:'🌐' }

function fmt(n, moneda='COP') {
  return `${MONEDA_SIMBOLO[moneda] || ''}${parseFloat(n || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

const s = {
  shell: { minHeight:'100vh', background:'#0A0F1E', fontFamily:'Inter,sans-serif', color:'#fff', display:'flex', flexDirection:'column' },
  topbar: { background:'#0D1628', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'0 24px', height:'52px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 },
  wordmark: { display:'flex', alignItems:'center', gap:'10px' },
  wordmarkMain: { fontSize:'15px', fontWeight:'500', color:'#fff', letterSpacing:'-0.01em' },
  wordmarkSep: { width:'1px', height:'14px', background:'rgba(255,255,255,0.2)' },
  wordmarkSub: { fontSize:'11px', color:'rgba(255,255,255,0.4)', letterSpacing:'0.06em', textTransform:'uppercase' },
  nav: { display:'flex', gap:'2px' },
  navItem: { padding:'6px 12px', borderRadius:'6px', fontSize:'12px', color:'rgba(255,255,255,0.45)', cursor:'pointer' },
  navActive: { padding:'6px 12px', borderRadius:'6px', fontSize:'12px', color:'#fff', fontWeight:'500', background:'rgba(255,255,255,0.08)', cursor:'pointer' },
  backLink: { fontSize:'11px', color:'rgba(255,255,255,0.3)', cursor:'pointer', textDecoration:'none', display:'flex', alignItems:'center', gap:'4px' },
  body: { display:'flex', flex:1 },
  sidebar: { width:'200px', flexShrink:0, background:'rgba(255,255,255,0.03)', borderRight:'1px solid rgba(255,255,255,0.06)', padding:'16px 0' },
  sideSection: { padding:'0 12px', marginBottom:'20px' },
  sideLabel: { fontSize:'10px', fontWeight:'600', color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.08em', padding:'0 8px', marginBottom:'4px' },
  sideItem: { display:'flex', alignItems:'center', gap:'8px', padding:'7px 8px', borderRadius:'6px', fontSize:'13px', color:'rgba(255,255,255,0.45)', cursor:'pointer', marginBottom:'1px' },
  sideActive: { display:'flex', alignItems:'center', gap:'8px', padding:'7px 8px', borderRadius:'6px', fontSize:'13px', color:'#fff', fontWeight:'500', background:'rgba(255,255,255,0.08)', cursor:'pointer', marginBottom:'1px' },
  sideBadge: { marginLeft:'auto', background:'rgba(29,158,117,0.25)', color:'#5DCAA5', fontSize:'10px', fontWeight:'600', padding:'1px 6px', borderRadius:'10px' },
  sideBadgeAmber: { marginLeft:'auto', background:'rgba(232,160,32,0.2)', color:'#F0B429', fontSize:'10px', fontWeight:'600', padding:'1px 6px', borderRadius:'10px' },
  main: { flex:1, padding:'24px', overflowY:'auto' },
  pageTitle: { fontSize:'18px', fontWeight:'600', color:'#fff', marginBottom:'20px' },
  grid2: { display:'grid', gridTemplateColumns:'1fr 300px', gap:'16px', marginBottom:'20px' },
  card: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'20px' },
  balLabel: { fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'8px' },
  balAmount: { fontSize:'34px', fontWeight:'500', color:'#fff', letterSpacing:'-0.02em', lineHeight:1, marginBottom:'4px' },
  balCurrency: { fontSize:'12px', color:'rgba(255,255,255,0.35)', marginBottom:'16px' },
  miniGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'16px' },
  miniItem: { background:'rgba(255,255,255,0.04)', borderRadius:'8px', padding:'10px' },
  miniLabel: { fontSize:'10px', color:'rgba(255,255,255,0.35)', marginBottom:'3px' },
  miniVal: { fontSize:'14px', fontWeight:'500', color:'#fff' },
  actRow: { display:'flex', gap:'8px' },
  btnGreen: { flex:1, padding:'9px', background:'#1D9E75', color:'#fff', border:'none', borderRadius:'8px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  btnOutline: { flex:1, padding:'9px', background:'transparent', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', fontSize:'12px', fontWeight:'500', cursor:'pointer' },
  ledgerTitle: { fontSize:'12px', fontWeight:'600', color:'rgba(255,255,255,0.6)', marginBottom:'12px' },
  ledgerRow: { display:'flex', alignItems:'center', gap:'8px', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.04)', fontSize:'11px' },
  ledgerDotCr: { width:'6px', height:'6px', borderRadius:'50%', background:'#1D9E75', flexShrink:0 },
  ledgerDotDb: { width:'6px', height:'6px', borderRadius:'50%', background:'#E24B4A', flexShrink:0 },
  ledgerDesc: { flex:1, color:'rgba(255,255,255,0.45)' },
  ledgerCr: { fontWeight:'600', fontFamily:'monospace', color:'#5DCAA5' },
  ledgerDb: { fontWeight:'600', fontFamily:'monospace', color:'#E27A7A' },
  movCard: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', overflow:'hidden' },
  movHeader: { padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' },
  movTitle: { fontSize:'13px', fontWeight:'600', color:'#fff' },
  movFilters: { display:'flex', gap:'4px' },
  movFilter: { padding:'3px 10px', borderRadius:'20px', fontSize:'11px', cursor:'pointer', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.4)', background:'transparent' },
  movFilterActive: { padding:'3px 10px', borderRadius:'20px', fontSize:'11px', cursor:'pointer', border:'1px solid rgba(29,158,117,0.4)', color:'#5DCAA5', background:'rgba(29,158,117,0.1)', fontWeight:'600' },
  movItem: { display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)' },
  movIcon: { width:'32px', height:'32px', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0 },
  movIconIn: { width:'32px', height:'32px', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0, background:'rgba(29,158,117,0.15)' },
  movIconOut: { width:'32px', height:'32px', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0, background:'rgba(226,75,74,0.15)' },
  movIconPend: { width:'32px', height:'32px', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0, background:'rgba(232,160,32,0.15)' },
  movInfo: { flex:1 },
  movName: { fontSize:'12px', fontWeight:'500', color:'#fff' },
  movSub: { fontSize:'11px', color:'rgba(255,255,255,0.35)', marginTop:'2px' },
  movRight: { textAlign:'right' },
  movAmtPos: { fontSize:'13px', fontWeight:'600', color:'#5DCAA5' },
  movAmtNeg: { fontSize:'13px', fontWeight:'600', color:'#E27A7A' },
  movAmtPend: { fontSize:'13px', fontWeight:'600', color:'#F0B429' },
  movDate: { fontSize:'10px', color:'rgba(255,255,255,0.3)', marginTop:'2px' },
  pill: { display:'inline-flex', alignItems:'center', fontSize:'10px', fontWeight:'500', padding:'2px 6px', borderRadius:'20px' },
  pillOk: { background:'rgba(29,158,117,0.2)', color:'#5DCAA5' },
  pillPend: { background:'rgba(232,160,32,0.2)', color:'#F0B429' },
  pillRev: { background:'rgba(24,95,165,0.2)', color:'#64A8E0' },
  emptyState: { padding:'40px 16px', textAlign:'center', color:'rgba(255,255,255,0.25)', fontSize:'13px' },
}

const NAV_LINKS = [
  { href:'/wallet', label:'Wallet', id:'wallet' },
  { href:'/wallet/fondear', label:'Fondear', id:'fondear' },
  { href:'/wallet/movimientos', label:'Historial', id:'historial' },
  { href:'/wallet/pagos/solicitar', label:'Pagos', id:'pagos' },
]

export default function WalletPage() {
  const [wallets, setWallets] = useState([])
  const [movimientos, setMovimientos] = useState([])
  const [walletActivo, setWalletActivo] = useState(null)
  const [filtroMov, setFiltroMov] = useState('todos')
  const [cargando, setCargando] = useState(true)
  const [ordenPendiente, setOrdenPendiente] = useState(0)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/registro?modo=login'; return }

      const token = session.access_token
      const headers = { 'Authorization': `Bearer ${token}` }

      const [resW, resM, resO] = await Promise.all([
        fetch('/api/wallet', { headers }),
        fetch('/api/wallet/movimientos?limit=10', { headers }),
        fetch('/api/pagos', { headers }),
      ])

      const [dataW, dataM, dataO] = await Promise.all([resW.json(), resM.json(), resO.json()])

      setWallets(dataW.wallets || [])
      setWalletActivo(dataW.wallets?.[0] || null)
      setMovimientos(dataM.movimientos || [])
      setOrdenPendiente((dataO.ordenes || []).filter(o => ['pendiente','en_revision','aprobada'].includes(o.estado)).length)
    } catch (e) {
      console.error(e)
    } finally {
      setCargando(false)
    }
  }

  function formatFecha(ts) {
    const d = new Date(ts)
    const hoy = new Date()
    const diff = hoy - d
    if (diff < 86400000) return d.toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' })
    if (diff < 172800000) return 'Ayer'
    return d.toLocaleDateString('es-CO', { day:'2-digit', month:'short' })
  }

  const movFiltrados = filtroMov === 'todos' ? movimientos
    : filtroMov === 'entradas' ? movimientos.filter(m => m.direccion === 'entrada')
    : movimientos.filter(m => m.direccion === 'salida')

  const walletPrincipal = walletActivo || wallets[0]

  if (cargando) return (
    <div style={{ ...s.shell, alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'rgba(255,255,255,0.3)', fontSize:'13px' }}>Cargando wallet...</div>
    </div>
  )

  return (
    <div style={s.shell}>
      {/* Topbar propio del módulo financiero */}
      <div style={s.topbar}>
        <div style={s.wordmark}>
          <div style={s.wordmarkMain}>Esca<span style={{ color:'#1D9E75' }}>la</span></div>
          <div style={s.wordmarkSep}></div>
          <div style={s.wordmarkSub}>Finanzas</div>
        </div>
        <div style={s.nav}>
          {NAV_LINKS.map(l => (
            <a key={l.id} href={l.href} style={l.id === 'wallet' ? s.navActive : s.navItem}>{l.label}</a>
          ))}
        </div>
        <a href="/dashboard" style={s.backLink}>← Volver a Escala</a>
      </div>

      <div style={s.body}>
        {/* Sidebar */}
        <div style={s.sidebar}>
          <div style={s.sideSection}>
            <div style={s.sideLabel}>Mi dinero</div>
            <a href="/wallet" style={s.sideActive}>💼 Wallet</a>
            <a href="/wallet/movimientos" style={s.sideItem}>📋 Movimientos</a>
            <a href="/wallet/fondear" style={{ ...s.sideItem }}>⬇️ Recargar</a>
          </div>
          <div style={s.sideSection}>
            <div style={s.sideLabel}>Pagos</div>
            <a href="/wallet/pagos/solicitar" style={s.sideItem}>📤 Solicitar pago</a>
            <a href="/wallet/pagos" style={s.sideItem}>
              📄 Mis órdenes
              {ordenPendiente > 0 && <span style={s.sideBadgeAmber}>{ordenPendiente}</span>}
            </a>
          </div>
          {/* Selector de monedas */}
          {wallets.length > 1 && (
            <div style={s.sideSection}>
              <div style={s.sideLabel}>Monedas</div>
              {wallets.map(w => (
                <div
                  key={w.id}
                  onClick={() => setWalletActivo(w)}
                  style={walletActivo?.id === w.id ? s.sideActive : s.sideItem}
                >
                  {MONEDA_PAIS[w.moneda]} {w.moneda}
                  <span style={s.sideBadge}>{fmt(w.saldo_disponible, w.moneda)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contenido principal */}
        <div style={s.main}>
          <div style={s.pageTitle}>Wallet</div>

          {wallets.length === 0 ? (
            <div style={s.card}>
              <div style={{ textAlign:'center', padding:'40px 0' }}>
                <div style={{ fontSize:'32px', marginBottom:'12px' }}>💼</div>
                <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.6)', marginBottom:'16px' }}>
                  Aún no tienes una billetera activa
                </div>
                <a href="/wallet/fondear" style={{ ...s.btnGreen, display:'inline-block', textDecoration:'none', padding:'10px 24px' }}>
                  Fondear para empezar
                </a>
              </div>
            </div>
          ) : (
            <div style={s.grid2}>
              {/* Card principal del wallet */}
              <div style={s.card}>
                <div style={s.balLabel}>
                  {walletPrincipal ? `${MONEDA_PAIS[walletPrincipal.moneda]} Wallet ${walletPrincipal.moneda}` : 'Saldo disponible'}
                </div>
                <div style={s.balAmount}>
                  {walletPrincipal ? fmt(walletPrincipal.saldo_disponible, walletPrincipal.moneda) : '$0'}
                </div>
                <div style={s.balCurrency}>
                  {walletPrincipal?.moneda} · Módulo financiero Escala
                </div>
                <div style={s.miniGrid}>
                  <div style={s.miniItem}>
                    <div style={s.miniLabel}>Comprometido</div>
                    <div style={s.miniVal}>{fmt(walletPrincipal?.saldo_comprometido || 0, walletPrincipal?.moneda)}</div>
                  </div>
                  <div style={s.miniItem}>
                    <div style={s.miniLabel}>Pendiente entrada</div>
                    <div style={s.miniVal}>{fmt(walletPrincipal?.saldo_pendiente || 0, walletPrincipal?.moneda)}</div>
                  </div>
                </div>
                <div style={s.actRow}>
                  <button style={s.btnGreen} onClick={() => window.location.href='/wallet/fondear'}>
                    ⬇️ Recargar
                  </button>
                  <button style={s.btnOutline} onClick={() => window.location.href='/wallet/pagos/solicitar'}>
                    📤 Solicitar pago
                  </button>
                </div>
              </div>

              {/* Mini ledger */}
              <div style={s.card}>
                <div style={s.ledgerTitle}>Últimas entradas del ledger</div>
                {movimientos.slice(0, 5).map(m => (
                  <div key={m.id} style={s.ledgerRow}>
                    <div style={m.direccion === 'entrada' ? s.ledgerDotCr : s.ledgerDotDb}></div>
                    <div style={s.ledgerDesc}>{m.descripcion?.substring(0, 30)}...</div>
                    <div style={m.direccion === 'entrada' ? s.ledgerCr : s.ledgerDb}>
                      {m.direccion === 'entrada' ? '+' : '-'}{fmt(m.monto, m.moneda)}
                    </div>
                  </div>
                ))}
                {movimientos.length === 0 && (
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)', textAlign:'center', padding:'20px 0' }}>
                    Aún no hay movimientos
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Movimientos recientes */}
          <div style={s.movCard}>
            <div style={s.movHeader}>
              <div style={s.movTitle}>Movimientos recientes</div>
              <div style={s.movFilters}>
                {['todos','entradas','salidas'].map(f => (
                  <button key={f} style={filtroMov === f ? s.movFilterActive : s.movFilter} onClick={() => setFiltroMov(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {movFiltrados.length === 0 ? (
              <div style={s.emptyState}>Sin movimientos{filtroMov !== 'todos' ? ` de ${filtroMov}` : ''}</div>
            ) : movFiltrados.map(m => (
              <div key={m.id} style={s.movItem}>
                <div style={m.direccion === 'entrada' ? s.movIconIn : m.referencia_tipo === 'fondeo' ? s.movIconPend : s.movIconOut}>
                  {m.direccion === 'entrada' ? '⬇️' : m.referencia_tipo === 'reversal' ? '↩️' : '📤'}
                </div>
                <div style={s.movInfo}>
                  <div style={s.movName}>{m.descripcion?.replace('Fondeo ','').replace('Pago ejecutado — ','')}</div>
                  <div style={s.movSub}>
                    {m.referencia_tipo} · {m.idempotency_key?.split('_').pop()?.substring(0, 8)}
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

            {movimientos.length >= 10 && (
              <div style={{ padding:'12px 16px', textAlign:'center' }}>
                <a href="/wallet/movimientos" style={{ fontSize:'12px', color:'#5DCAA5', textDecoration:'none' }}>
                  Ver historial completo →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
