'use client'
// app/wallet/pagos/solicitar/page.js — Solicitar un pago

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const s = {
  shell: { minHeight: '100vh', background: '#0A0F1E', fontFamily: 'Inter,sans-serif', color: '#fff', display: 'flex', flexDirection: 'column' },
  topbar: { background: '#0D1628', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  wordmarkMain: { fontSize: '15px', fontWeight: '500', color: '#fff' },
  wordmarkSep: { width: '1px', height: '14px', background: 'rgba(255,255,255,0.2)', margin: '0 10px' },
  wordmarkSub: { fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase' },
  backLink: { fontSize: '11px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' },
  main: { flex: 1, display: 'flex', justifyContent: 'center', padding: '32px 24px' },
  form: { width: '100%', maxWidth: '500px' },
  pageTitle: { fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '4px' },
  pageSub: { fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '28px' },
  fieldLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '13px', fontFamily: 'Inter,sans-serif', marginBottom: '14px', boxSizing: 'border-box', outline: 'none' },
  select: { width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '13px', fontFamily: 'Inter,sans-serif', marginBottom: '14px', boxSizing: 'border-box', outline: 'none' },
  amountWrap: { display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.06)', marginBottom: '14px' },
  amountPrefix: { padding: '10px 12px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)', borderRight: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 },
  amountInput: { flex: 1, padding: '10px 12px', fontSize: '15px', fontWeight: '500', border: 'none', background: 'transparent', color: '#fff', outline: 'none', fontFamily: 'Inter,sans-serif' },
  saldoInfo: { fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '14px', marginTop: '-10px' },
  btnGreen: { width: '100%', padding: '11px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginBottom: '8px' },
  btnOutline: { width: '100%', padding: '11px', background: 'transparent', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' },
  error: { background: 'rgba(226,75,74,0.12)', border: '1px solid rgba(226,75,74,0.25)', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#E27A7A', marginBottom: '14px' },
  success: { background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.25)', borderRadius: '10px', padding: '20px', textAlign: 'center', marginBottom: '14px' },
  alertBox: { background: 'rgba(232,160,32,0.1)', border: '1px solid rgba(232,160,32,0.2)', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px', fontSize: '12px', color: '#F0B429' },
}

const MONEDAS = ['COP', 'MXN', 'CLP', 'ARS', 'PEN', 'USD', 'EUR', 'USDT', 'USDC']

export default function SolicitarPagoPage() {
  const [form, setForm] = useState({ beneficiario_email: '', moneda: 'COP', monto: '', concepto: '', descripcion: '', proyecto_id: '' })
  const [wallets, setWallets] = useState([])
  const [walletSeleccionado, setWalletSeleccionado] = useState(null)
  const [proyectos, setProyectos] = useState([])
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)
  const [sqlPendiente, setSqlPendiente] = useState(false)

  useEffect(() => {
    async function cargar() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/registro?modo=login'; return }
      const token = session.access_token

      // Cargar wallets
      const resW = await fetch('/api/wallet', { headers: { 'Authorization': `Bearer ${token}` } })
      const dataW = await resW.json()
      if (dataW.error?.includes('relation') || dataW.error?.includes('does not exist')) {
        setSqlPendiente(true)
        return
      }
      setWallets(dataW.wallets || [])
      if (dataW.wallets?.length) setWalletSeleccionado(dataW.wallets[0])

      // Cargar proyectos propios
      const resP = await fetch('/api/proyectos', { headers: { 'Authorization': `Bearer ${token}` } })
      const dataP = await resP.json()
      setProyectos(dataP.proyectos || [])
    }
    cargar()
  }, [])

  function upd(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function enviar() {
    setError('')
    if (!form.beneficiario_email.trim()) { setError('Ingresa el correo del beneficiario'); return }
    if (!form.monto || parseFloat(form.monto) <= 0) { setError('Ingresa un monto válido'); return }
    if (!form.concepto.trim()) { setError('Ingresa el concepto del pago'); return }
    if (!walletSeleccionado) { setError('No tienes una billetera activa. Primero recárgala.'); return }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // Buscar el beneficiario por email
    const { data: beneficiario } = await supabase
      .from('perfiles')
      .select('id, nombre')
      .eq('email', form.beneficiario_email.trim().toLowerCase())
      .single()

    if (!beneficiario) { setError('No se encontró un usuario con ese correo en Escala'); return }

    setEnviando(true)
    try {
      const res = await fetch('/api/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({
          beneficiario_id: beneficiario.id,
          wallet_origen_id: walletSeleccionado.id,
          moneda: form.moneda,
          monto: parseFloat(form.monto),
          concepto: form.concepto,
          descripcion: form.descripcion,
          proyecto_id: form.proyecto_id || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error creando solicitud'); return }
      setExito(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setEnviando(false)
    }
  }

  const walletActivo = walletSeleccionado || wallets.find(w => w.moneda === form.moneda)

  if (exito) return (
    <div style={s.shell}>
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={s.wordmarkMain}>Esca<span style={{ color: '#1D9E75' }}>la</span></div>
          <div style={s.wordmarkSep}></div>
          <div style={s.wordmarkSub}>Finanzas</div>
        </div>
      </div>
      <div style={s.main}>
        <div style={s.form}>
          <div style={s.success}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>✅</div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#5DCAA5', marginBottom: '6px' }}>Solicitud enviada</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>El administrador revisará y aprobará el pago</div>
          </div>
          <a href="/wallet/pagos" style={{ ...s.btnGreen, display: 'block', textAlign: 'center', textDecoration: 'none' }}>Ver mis órdenes →</a>
          <a href="/wallet" style={{ ...s.btnOutline, display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '8px' }}>Volver al wallet</a>
        </div>
      </div>
    </div>
  )

  return (
    <div style={s.shell}>
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={s.wordmarkMain}>Esca<span style={{ color: '#1D9E75' }}>la</span></div>
          <div style={s.wordmarkSep}></div>
          <div style={s.wordmarkSub}>Finanzas</div>
        </div>
        <a href="/wallet/pagos" style={s.backLink}>← Mis órdenes</a>
      </div>

      <div style={s.main}>
        <div style={s.form}>
          <div style={s.pageTitle}>Solicitar pago</div>
          <div style={s.pageSub}>El administrador revisará y ejecutará el pago manualmente</div>

          {sqlPendiente && (
            <div style={s.alertBox}>
              ⚠️ El módulo financiero aún no está activo. Primero debes fondear tu wallet.
              <div style={{ marginTop: '8px' }}><a href="/wallet/fondear" style={{ color: '#F0B429' }}>Ir a recargar →</a></div>
            </div>
          )}

          {!sqlPendiente && (
            <>
              {error && <div style={s.error}>{error}</div>}

              <div style={s.fieldLabel}>Correo del beneficiario</div>
              <input style={s.input} type="email" placeholder="correo@ejemplo.com" value={form.beneficiario_email} onChange={e => upd('beneficiario_email', e.target.value)} />

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                <div>
                  <div style={s.fieldLabel}>Monto</div>
                  <div style={s.amountWrap}>
                    <div style={s.amountPrefix}>{form.moneda}</div>
                    <input style={s.amountInput} type="number" placeholder="0" value={form.monto} onChange={e => upd('monto', e.target.value)} />
                  </div>
                </div>
                <div>
                  <div style={s.fieldLabel}>Moneda</div>
                  <select style={s.select} value={form.moneda} onChange={e => { upd('moneda', e.target.value); setWalletSeleccionado(wallets.find(w => w.moneda === e.target.value) || null) }}>
                    {MONEDAS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {walletActivo && (
                <div style={s.saldoInfo}>
                  Saldo disponible: {walletActivo.moneda} {parseFloat(walletActivo.saldo_disponible || 0).toLocaleString('es-CO')}
                </div>
              )}

              <div style={s.fieldLabel}>Concepto</div>
              <input style={s.input} type="text" placeholder="Ej: Desarrollo módulo de pagos — Sprint 3" value={form.concepto} onChange={e => upd('concepto', e.target.value)} />

              <div style={s.fieldLabel}>Descripción (opcional)</div>
              <input style={{ ...s.input, marginBottom: '14px' }} type="text" placeholder="Detalles adicionales..." value={form.descripcion} onChange={e => upd('descripcion', e.target.value)} />

              {proyectos.length > 0 && (
                <>
                  <div style={s.fieldLabel}>Proyecto (opcional)</div>
                  <select style={s.select} value={form.proyecto_id} onChange={e => upd('proyecto_id', e.target.value)}>
                    <option value="">Sin proyecto específico</option>
                    {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </>
              )}

              <button style={s.btnGreen} onClick={enviar} disabled={enviando}>
                {enviando ? 'Enviando...' : 'Enviar solicitud →'}
              </button>
              <button style={s.btnOutline} onClick={() => window.location.href = '/wallet/pagos'}>Cancelar</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
