'use client'
// /proyectos/[id]/workspace/capital
// Fundador: capital disponible en el proyecto, fondeos activos por item
// Angel: su inversion activa, estado, contrato, instrucciones de pago

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../../../lib/supabase'

const fmt = (n) => Math.round(parseFloat(n || 0)).toLocaleString('es-CO')

const ESTADO_COLOR = {
  propuesta: { color: '#6B7280', bg: 'rgba(107,114,128,0.12)', label: 'Propuesta enviada' },
  negociando: { color: '#E8A020', bg: 'rgba(232,160,32,0.12)', label: 'Negociando' },
  aceptado: { color: '#4A90D9', bg: 'rgba(74,144,217,0.12)', label: 'Aceptado — pendiente transferencia' },
  transferido: { color: '#E8A020', bg: 'rgba(232,160,32,0.12)', label: 'Transferido — pendiente verificacion' },
  verificado: { color: '#1D9E75', bg: 'rgba(29,158,117,0.12)', label: 'Verificado — capital acreditado' },
  rechazado: { color: '#E05555', bg: 'rgba(224,85,85,0.12)', label: 'Rechazado' },
}

export default function CapitalWorkspacePage() {
  const { id } = useParams()
  const [usuario, setUsuario] = useState(null)
  const [esFundador, setEsFundador] = useState(false)
  const [fondeos, setFondeos] = useState([])
  const [walletProyecto, setWalletProyecto] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(null)
  const [comprobante, setComprobante] = useState('')
  const [mostrarComprobante, setMostrarComprobante] = useState(null)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => { cargar() }, [id])

  async function cargar() {
    const { data: { user } } = await supabase.auth.getUser()
    setUsuario(user)
    const { data: proy } = await supabase.from('proyectos').select('fundador_id').eq('id', id).single()
    const esFund = proy?.fundador_id === user?.id
    setEsFundador(esFund)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setCargando(false); return }

    // Fondeos del proyecto
    const { data: fondeoData } = await supabase
      .from('presupuesto_fondeos')
      .select(`
        *, 
        presupuesto_items(id, nombre, categoria, valor_total),
        perfiles!inversionista_id(id, nombre, email, avatar_url)
      `)
      .eq('proyecto_id', id)
      .order('created_at', { ascending: false })

    setFondeos(fondeoData || [])

    // Wallet del proyecto
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('usuario_id', id)
      .eq('moneda', 'COP')
      .maybeSingle()

    setWalletProyecto(wallet)
    setCargando(false)
  }

  async function accion(fondeo_id, accionNombre, extra = {}) {
    setEnviando(fondeo_id)
    setMensaje('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/presupuesto/fondeo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ fondeo_id, accion: accionNombre, ...extra }),
      })
      const d = await res.json()
      if (!d.ok) throw new Error(d.error)
      setMostrarComprobante(null)
      setComprobante('')
      await cargar()
    } catch (err) {
      setMensaje('Error: ' + err.message)
    } finally {
      setEnviando(null)
    }
  }

  const s = {
    page: { minHeight: '100vh', background: '#0B1628', fontFamily: 'Inter,sans-serif', color: '#fff' },
    nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    wrap: { maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' },
    card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', marginBottom: '0.875rem' },
    btn: (color) => ({ background: color, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }),
    input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '0.6rem 0.875rem', color: '#fff', fontSize: '0.85rem', outline: 'none', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box', marginBottom: '0.75rem' },
  }

  if (cargando) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8FA3CC' }}>Cargando...</div>

  // Lo que el usuario actual ve
  const misFondeos = esFundador
    ? fondeos  // fundador ve todos
    : fondeos.filter(f => f.inversionista_id === usuario?.id)  // angel ve solo los suyos

  const totalAcreditado = walletProyecto ? parseFloat(walletProyecto.saldo_disponible || 0) : 0
  const totalComprometido = fondeos.filter(f => ['aceptado', 'transferido'].includes(f.estado)).reduce((s, f) => s + parseFloat(f.monto), 0)

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href={`/proyectos/${id}/workspace`} style={{ fontSize: '0.85rem', color: '#8FA3CC', textDecoration: 'none' }}>← Workspace</a>
        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff' }}>💼 Financiamiento recibido</div>
        <a href={`/proyectos/${id}/workspace/presupuesto`} style={{ fontSize: '0.78rem', color: '#4A90D9', textDecoration: 'none' }}>Ver presupuesto →</a>
      </nav>

      <div style={s.wrap}>

        {/* Wallet del proyecto */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '12px', padding: '1.1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1D9E75' }}>${fmt(totalAcreditado)}</div>
            <div style={{ fontSize: '0.7rem', color: '#8FA3CC', marginTop: '3px' }}>Capital disponible</div>
          </div>
          <div style={{ background: 'rgba(232,160,32,0.08)', border: '1px solid rgba(232,160,32,0.2)', borderRadius: '12px', padding: '1.1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#E8A020' }}>${fmt(totalComprometido)}</div>
            <div style={{ fontSize: '0.7rem', color: '#8FA3CC', marginTop: '3px' }}>En proceso de financiamiento</div>
          </div>
          <div style={{ background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.2)', borderRadius: '12px', padding: '1.1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#4A90D9' }}>{fondeos.filter(f => f.estado === 'verificado').length}</div>
            <div style={{ fontSize: '0.7rem', color: '#8FA3CC', marginTop: '3px' }}>Inversiones activas</div>
          </div>
        </div>

        {mensaje && (
          <div style={{ background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#E05555' }}>{mensaje}</div>
        )}

        {/* Lista de fondeos */}
        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', marginBottom: '1rem' }}>
          {esFundador ? `Inversiones recibidas (${fondeos.length})` : `Mis inversiones en este proyecto (${misFondeos.length})`}
        </div>

        {misFondeos.length === 0 ? (
          <div style={{ ...s.card, textAlign: 'center', padding: '2.5rem', color: '#6B7280' }}>
            {esFundador
              ? 'Aún no hay propuestas de inversión. Agrega items al presupuesto para que los inversionistas puedan financiarte.'
              : 'No tienes inversiones en este proyecto.'}
          </div>
        ) : (
          misFondeos.map(fondeo => {
            const est = ESTADO_COLOR[fondeo.estado] || ESTADO_COLOR.propuesta
            const esAngel = fondeo.inversionista_id === usuario?.id
            const terminos = fondeo.a_cambio_de === 'participacion'
              ? `${fondeo.pct_participacion}% participacion`
              : fondeo.a_cambio_de === 'deuda'
              ? `${fondeo.tasa_mensual}% mensual`
              : `${fondeo.pct_revenue}% revenue`

            return (
              <div key={fondeo.id} style={{ ...s.card, borderColor: est.bg.replace('0.12', '0.3') }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '2px' }}>
                      {fondeo.presupuesto_items?.nombre}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                      {esFundador ? `Ángel: ${fondeo.perfiles?.nombre}` : 'Tu inversión'} · {terminos}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>${fmt(fondeo.monto)}</div>
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', background: est.bg, color: est.color, padding: '2px 8px', borderRadius: '20px' }}>
                      {est.label}
                    </span>
                  </div>
                </div>

                {/* Instrucciones segun el estado */}
                {fondeo.estado === 'aceptado' && esAngel && (
                  <div style={{ background: 'rgba(74,144,217,0.06)', border: '1px solid rgba(74,144,217,0.2)', borderRadius: '8px', padding: '0.875rem 1rem', marginBottom: '0.875rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#4A90D9', marginBottom: '6px' }}>Transfiere el capital para activar la inversión</div>
                    <div style={{ fontSize: '0.75rem', color: '#8FA3CC', lineHeight: '1.6', marginBottom: '0.75rem' }}>
                      Transfiere <strong style={{ color: '#fff' }}>${fmt(fondeo.monto)} COP</strong> via BREB (Nequi, Daviplata, Bancolombia) a la cuenta de fondeo de Escala. Luego sube el número de comprobante o referencia de la transferencia.
                    </div>
                    {mostrarComprobante === fondeo.id ? (
                      <div>
                        <input style={s.input} placeholder="Número de comprobante o referencia de la transferencia" value={comprobante} onChange={e => setComprobante(e.target.value)} />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => accion(fondeo.id, 'confirmar_transferencia', { comprobante_url: comprobante })} disabled={enviando === fondeo.id || !comprobante} style={{ ...s.btn('#4A90D9'), opacity: !comprobante ? 0.5 : 1 }}>
                            {enviando === fondeo.id ? 'Enviando...' : 'Confirmar transferencia →'}
                          </button>
                          <button onClick={() => setMostrarComprobante(null)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', color: '#8FA3CC', borderRadius: '8px', padding: '0.5rem 0.875rem', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setMostrarComprobante(fondeo.id)} style={s.btn('#4A90D9')}>
                        Ya transferí — subir comprobante
                      </button>
                    )}
                  </div>
                )}

                {fondeo.estado === 'transferido' && esFundador && (
                  <div style={{ background: 'rgba(232,160,32,0.06)', border: '1px solid rgba(232,160,32,0.2)', borderRadius: '8px', padding: '0.875rem 1rem', marginBottom: '0.875rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#E8A020', marginBottom: '4px' }}>El inversionista reporta haber transferido ${fmt(fondeo.monto)}</div>
                    <div style={{ fontSize: '0.75rem', color: '#8FA3CC', marginBottom: '0.75rem' }}>
                      Comprobante: <strong style={{ color: '#fff' }}>{fondeo.comprobante_url || 'No especificado'}</strong>
                      <br />Verifica que el dinero llegó a la cuenta de Escala antes de confirmar.
                    </div>
                    <button onClick={() => accion(fondeo.id, 'verificar')} disabled={enviando === fondeo.id} style={s.btn('#1D9E75')}>
                      {enviando === fondeo.id ? 'Verificando...' : '✓ Confirmar recepción y acreditar capital'}
                    </button>
                  </div>
                )}

                {fondeo.estado === 'verificado' && (
                  <div style={{ background: 'rgba(29,158,117,0.06)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#1D9E75' }}>
                    ✅ Capital acreditado al proyecto · {fondeo.a_cambio_de === 'participacion' ? `El inversionista tiene ${fondeo.pct_participacion}% de participación registrada` : fondeo.a_cambio_de === 'deuda' ? `Deuda activa: ${fondeo.tasa_mensual}% mensual` : `Revenue share: ${fondeo.pct_revenue}% de ingresos`}
                    {fondeo.contrato_id && <span style={{ marginLeft: '8px', color: '#8FA3CC' }}>· Contrato generado</span>}
                  </div>
                )}

                {fondeo.estado === 'propuesta' && esFundador && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => accion(fondeo.id, 'aceptar')} disabled={enviando === fondeo.id} style={s.btn('#1D9E75')}>
                      {enviando === fondeo.id ? '...' : 'Aceptar propuesta'}
                    </button>
                    <button onClick={() => accion(fondeo.id, 'rechazar')} disabled={enviando === fondeo.id} style={{ ...s.btn('rgba(224,85,85,0.15)'), color: '#E05555', border: '1px solid rgba(224,85,85,0.3)' }}>
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}

        {/* Si es fundador y no hay fondeos, CTA al presupuesto */}
        {esFundador && fondeos.length === 0 && (
          <div style={{ marginTop: '1.5rem', background: 'rgba(74,144,217,0.06)', border: '1px solid rgba(74,144,217,0.2)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>No hay inversiones aún</div>
            <div style={{ fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '1rem' }}>
              Agrega los recursos que necesitas al presupuesto para que los inversionistas puedan financiarlos.
            </div>
            <a href={`/proyectos/${id}/workspace/presupuesto`} style={{ background: '#4A90D9', color: '#fff', padding: '0.6rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700' }}>
              Agregar lo que necesito →
            </a>
          </div>
        )}

      </div>
    </div>
  )
}
