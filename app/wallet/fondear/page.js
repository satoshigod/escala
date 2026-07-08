'use client'
// app/wallet/fondear/page.js — Fondear wallet
// Flujo en 3 pasos: método → monto → instrucciones

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const s = {
  shell: { minHeight:'100vh', background:'#0A0F1E', fontFamily:'Inter,sans-serif', color:'#fff', display:'flex', flexDirection:'column' },
  topbar: { background:'#0D1628', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'0 24px', height:'52px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 },
  wordmark: { display:'flex', alignItems:'center', gap:'10px' },
  wordmarkMain: { fontSize:'15px', fontWeight:'500', color:'#fff' },
  wordmarkSep: { width:'1px', height:'14px', background:'rgba(255,255,255,0.2)' },
  wordmarkSub: { fontSize:'11px', color:'rgba(255,255,255,0.4)', letterSpacing:'0.06em', textTransform:'uppercase' },
  backLink: { fontSize:'11px', color:'rgba(255,255,255,0.3)', cursor:'pointer', textDecoration:'none' },
  main: { flex:1, display:'flex', justifyContent:'center', padding:'32px 24px' },
  form: { width:'100%', maxWidth:'520px' },
  pageTitle: { fontSize:'18px', fontWeight:'600', color:'#fff', marginBottom:'4px' },
  pageSub: { fontSize:'13px', color:'rgba(255,255,255,0.4)', marginBottom:'24px' },
  stepIndicator: { display:'flex', alignItems:'center', gap:0, marginBottom:'28px' },
  stepItem: { display:'flex', alignItems:'center', gap:'6px' },
  stepNum: { width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'600' },
  stepNumActive: { background:'#1D9E75', color:'#fff' },
  stepNumDone: { background:'rgba(29,158,117,0.25)', color:'#5DCAA5' },
  stepNumInactive: { background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.3)', border:'1px solid rgba(255,255,255,0.1)' },
  stepName: { fontSize:'11px', color:'rgba(255,255,255,0.35)' },
  stepNameActive: { fontSize:'11px', color:'#fff', fontWeight:'500' },
  stepDivider: { flex:1, height:'1px', background:'rgba(255,255,255,0.08)', margin:'0 10px' },
  methodGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'20px' },
  methodCard: { border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'16px', cursor:'pointer', background:'rgba(255,255,255,0.03)' },
  methodCardSel: { border:'1.5px solid #1D9E75', borderRadius:'10px', padding:'16px', cursor:'pointer', background:'rgba(29,158,117,0.08)' },
  methodIcon: { fontSize:'24px', marginBottom:'8px' },
  methodName: { fontSize:'13px', fontWeight:'600', color:'#fff', marginBottom:'2px' },
  methodDesc: { fontSize:'11px', color:'rgba(255,255,255,0.35)' },
  fieldLabel: { fontSize:'12px', color:'rgba(255,255,255,0.5)', marginBottom:'6px' },
  amountWrap: { display:'flex', alignItems:'center', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', overflow:'hidden', background:'rgba(255,255,255,0.04)', marginBottom:'20px' },
  amountPrefix: { padding:'11px 14px', fontSize:'13px', color:'rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.04)', borderRight:'1px solid rgba(255,255,255,0.08)' },
  amountInput: { flex:1, padding:'11px 14px', fontSize:'16px', fontWeight:'500', border:'none', background:'transparent', color:'#fff', outline:'none', fontFamily:'Inter,sans-serif' },
  instrBox: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'16px', marginBottom:'16px' },
  instrTitle: { fontSize:'12px', fontWeight:'600', color:'rgba(255,255,255,0.7)', marginBottom:'12px' },
  instrRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px', gap:'12px' },
  instrKey: { fontSize:'11px', color:'rgba(255,255,255,0.35)' },
  instrVal: { fontSize:'11px', color:'#fff', fontFamily:'monospace', textAlign:'right', display:'flex', alignItems:'center', gap:'6px' },
  instrValGreen: { fontSize:'11px', color:'#5DCAA5', fontFamily:'monospace', fontWeight:'700', textAlign:'right', display:'flex', alignItems:'center', gap:'6px' },
  copyBtn: { fontSize:'10px', color:'#5DCAA5', cursor:'pointer', background:'rgba(29,158,117,0.15)', border:'none', padding:'2px 6px', borderRadius:'4px' },
  countdown: { background:'rgba(232,160,32,0.1)', border:'1px solid rgba(232,160,32,0.2)', borderRadius:'8px', padding:'10px 14px', display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' },
  countdownText: { fontSize:'12px', color:'#F0B429', flex:1 },
  countdownTime: { fontSize:'15px', fontWeight:'600', color:'#F0B429', fontFamily:'monospace' },
  nota: { fontSize:'11px', color:'rgba(255,255,255,0.3)', lineHeight:'1.6', marginBottom:'16px' },
  btnGreen: { width:'100%', padding:'11px', background:'#1D9E75', color:'#fff', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'600', cursor:'pointer', marginBottom:'8px' },
  btnOutline: { width:'100%', padding:'11px', background:'transparent', color:'rgba(255,255,255,0.5)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px', fontSize:'13px', cursor:'pointer' },
  error: { background:'rgba(226,75,74,0.15)', border:'1px solid rgba(226,75,74,0.3)', borderRadius:'8px', padding:'10px 14px', fontSize:'12px', color:'#E27A7A', marginBottom:'12px' },
  success: { background:'rgba(29,158,117,0.15)', border:'1px solid rgba(29,158,117,0.3)', borderRadius:'8px', padding:'16px', borderRadius:'10px', marginBottom:'16px', textAlign:'center' },
}

const METODOS = [
  { id:'breb', nombre:'BRE-B', desc:'Transferencia bancaria Colombia', icon:'🏦', moneda:'COP' },
  { id:'binance_usdt', nombre:'Binance USDT', desc:'Stablecoin TRC-20 (TRON)', icon:'₮', moneda:'USDT' },
  { id:'binance_usdc', nombre:'Binance USDC', desc:'Stablecoin ERC-20 (Ethereum)', icon:'💲', moneda:'USDC' },
]

export default function FondearPage() {
  const [paso, setPaso] = useState(1)
  const [metodo, setMetodo] = useState(null)
  const [monto, setMonto] = useState('')
  const [instrucciones, setInstrucciones] = useState(null)
  const [fondeo, setFondeo] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(null)

  // Temporizador
  useEffect(() => {
    if (!fondeo?.expires_at) return
    const interval = setInterval(() => {
      const diff = new Date(fondeo.expires_at) - new Date()
      if (diff <= 0) { setCountdown('Expirado'); clearInterval(interval); return }
      const mins = Math.floor(diff / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setCountdown(`${mins}:${secs.toString().padStart(2,'0')}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [fondeo])

  async function iniciarFondeo() {
    setError('')
    if (!metodo) { setError('Selecciona un método de pago'); return }
    if (!monto || parseFloat(monto.replace(/\./g,'')) <= 0) { setError('Ingresa un monto válido'); return }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/registro?modo=login'; return }

    setCargando(true)
    try {
      const montoNum = parseFloat(monto.replace(/\./g,''))
      const proveedor = metodo.id.startsWith('binance') ? 'binance' : 'breb'
      const monedaM = metodo.moneda

      const res = await fetch('/api/fondeos', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${session.access_token}` },
        body: JSON.stringify({ proveedor, moneda: monedaM, monto: montoNum }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error iniciando fondeo'); return }

      setFondeo(data.fondeo)
      setInstrucciones(data.instrucciones)
      setPaso(3)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  function copiar(texto) {
    navigator.clipboard?.writeText(texto).catch(() => {})
  }

  const montoNum = parseFloat(monto.replace(/\./g,'')) || 0

  return (
    <div style={s.shell}>
      <div style={s.topbar}>
        <div style={s.wordmark}>
          <div style={s.wordmarkMain}>Esca<span style={{ color:'#1D9E75' }}>la</span></div>
          <div style={s.wordmarkSep}></div>
          <div style={s.wordmarkSub}>Finanzas</div>
        </div>
        <a href="/wallet" style={s.backLink}>← Volver al wallet</a>
      </div>

      <div style={s.main}>
        <div style={s.form}>
          <div style={s.pageTitle}>Fondear wallet</div>
          <div style={s.pageSub}>Elige el método y el monto para acreditar fondos</div>

          {/* Steps */}
          <div style={s.stepIndicator}>
            {[['Método', 1], ['Monto', 2], ['Instrucciones', 3]].map(([label, n], i) => (
              <>
                <div key={n} style={s.stepItem}>
                  <div style={{ ...s.stepNum, ...(paso > n ? s.stepNumDone : paso === n ? s.stepNumActive : s.stepNumInactive) }}>
                    {paso > n ? '✓' : n}
                  </div>
                  <span style={paso >= n ? s.stepNameActive : s.stepName}>{label}</span>
                </div>
                {i < 2 && <div style={s.stepDivider}></div>}
              </>
            ))}
          </div>

          {error && <div style={s.error}>{error}</div>}

          {/* Paso 1: Método */}
          {paso === 1 && (
            <>
              <div style={s.fieldLabel}>Método de pago</div>
              <div style={s.methodGrid}>
                {METODOS.map(m => (
                  <div key={m.id} style={metodo?.id === m.id ? s.methodCardSel : s.methodCard} onClick={() => setMetodo(m)}>
                    <div style={s.methodIcon}>{m.icon}</div>
                    <div style={s.methodName}>{m.nombre}</div>
                    <div style={s.methodDesc}>{m.desc}</div>
                  </div>
                ))}
              </div>
              <button style={s.btnGreen} onClick={() => { if (!metodo) { setError('Selecciona un método'); return }; setError(''); setPaso(2) }}>
                Continuar →
              </button>
              <button style={s.btnOutline} onClick={() => window.location.href='/wallet'}>Cancelar</button>
            </>
          )}

          {/* Paso 2: Monto */}
          {paso === 2 && (
            <>
              <div style={s.fieldLabel}>Monto a fondear en {metodo?.moneda}</div>
              <div style={s.amountWrap}>
                <div style={s.amountPrefix}>{metodo?.moneda} {metodo?.moneda === 'COP' ? '$' : metodo?.moneda === 'EUR' ? '€' : '$'}</div>
                <input
                  style={s.amountInput}
                  type="text"
                  value={monto}
                  placeholder="0"
                  onChange={e => setMonto(e.target.value.replace(/[^0-9.]/g,''))}
                />
              </div>
              <div style={{ display:'flex', gap:'6px', marginBottom:'20px' }}>
                {[100000, 500000, 1000000, 5000000].map(v => (
                  <button key={v} onClick={() => setMonto(v.toString())} style={{ ...s.btnOutline, width:'auto', padding:'5px 10px', fontSize:'11px', flex:1 }}>
                    {(v/1000).toFixed(0)}K
                  </button>
                ))}
              </div>
              <button style={s.btnGreen} onClick={iniciarFondeo} disabled={cargando}>
                {cargando ? 'Generando instrucciones...' : 'Ver instrucciones →'}
              </button>
              <button style={s.btnOutline} onClick={() => setPaso(1)}>← Atrás</button>
            </>
          )}

          {/* Paso 3: Instrucciones */}
          {paso === 3 && instrucciones && (
            <>
              <div style={{ ...s.success }}>
                <div style={{ fontSize:'20px', marginBottom:'6px' }}>✅</div>
                <div style={{ fontSize:'13px', fontWeight:'600', color:'#5DCAA5' }}>Instrucciones generadas</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'4px' }}>
                  Realiza la transferencia exactamente como se indica
                </div>
              </div>

              {instrucciones.referencia && (
                <div style={s.countdown}>
                  <span>⏱</span>
                  <div style={s.countdownText}>Esta referencia expira en</div>
                  <div style={s.countdownTime}>{countdown || '...'}</div>
                </div>
              )}

              <div style={s.instrBox}>
                <div style={s.instrTitle}>
                  {metodo?.id === 'breb' ? '🏦 Instrucciones de transferencia bancaria' : '₮ Instrucciones de transferencia crypto'}
                </div>
                {Object.entries(instrucciones).filter(([k]) => k !== 'nota').map(([k, v]) => (
                  <div key={k} style={s.instrRow}>
                    <div style={s.instrKey}>{k.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
                    <div style={k === 'referencia' || k === 'memo' ? s.instrValGreen : s.instrVal}>
                      {String(v)}
                      <button style={s.copyBtn} onClick={() => copiar(String(v))}>Copiar</button>
                    </div>
                  </div>
                ))}
              </div>

              {instrucciones.nota && (
                <div style={s.nota}>⚠️ {instrucciones.nota}</div>
              )}

              <button style={s.btnGreen} onClick={() => window.location.href='/wallet'}>
                Ya realicé la transferencia ✓
              </button>
              <button style={s.btnOutline} onClick={() => { setPaso(2); setFondeo(null); setInstrucciones(null) }}>
                Cambiar monto
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
