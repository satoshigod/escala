'use client'
// /proyectos/[id]/workspace/reparto
// El fundador registra un ingreso y calcula el reparto automatico
// Cada participante ve su parte

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../../../lib/supabase'

const fmt = (n) => Math.round(parseFloat(n || 0)).toLocaleString('es-CO')

const TIPO_COLOR = {
  revenue_share: { color: '#E8A020', bg: 'rgba(232,160,32,0.1)', label: 'Revenue share' },
  deuda: { color: '#4A90D9', bg: 'rgba(74,144,217,0.1)', label: 'Cuota deuda' },
  participacion: { color: '#AFA9EC', bg: 'rgba(175,169,236,0.1)', label: 'Participacion equity' },
  fundador: { color: '#1D9E75', bg: 'rgba(29,158,117,0.1)', label: 'Fundador' },
}

export default function RepartoPage() {
  const { id } = useParams()
  const [usuario, setUsuario] = useState(null)
  const [esFundador, setEsFundador] = useState(false)
  const [repartos, setRepartos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [calculando, setCalculando] = useState(false)
  const [resultadoCalculo, setResultadoCalculo] = useState(null)
  const [form, setForm] = useState({ monto_total: '', descripcion: '' })
  const [error, setError] = useState('')

  useEffect(() => { cargar() }, [id])

  async function cargar() {
    const { data: { user } } = await supabase.auth.getUser()
    setUsuario(user)
    const { data: proy } = await supabase.from('proyectos').select('fundador_id').eq('id', id).single()
    setEsFundador(proy?.fundador_id === user?.id)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setCargando(false); return }

    const res = await fetch(`/api/reparto?proyecto_id=${id}`, {
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
    const d = await res.json()
    if (d.ok) setRepartos(d.repartos || [])
    setCargando(false)
  }

  async function calcularReparto() {
    if (!form.monto_total || parseFloat(form.monto_total) <= 0) {
      setError('Ingresa el monto del ingreso')
      return
    }
    setCalculando(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/reparto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ proyecto_id: id, ...form }),
      })
      const d = await res.json()
      if (!d.ok) throw new Error(d.error)
      setResultadoCalculo(d)
      setMostrarForm(false)
      await cargar()
    } catch (err) { setError('Error: ' + err.message) }
    finally { setCalculando(false) }
  }

  async function marcarPagado(linea_id) {
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/reparto', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ linea_id }),
    })
    await cargar()
  }

  const s = {
    page: { minHeight: '100vh', background: '#0B1628', fontFamily: 'Inter,sans-serif', color: '#fff' },
    nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    wrap: { maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' },
    card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', marginBottom: '0.875rem' },
    input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '0.6rem 0.875rem', color: '#fff', fontSize: '0.85rem', outline: 'none', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box', marginBottom: '0.75rem' },
    btn: (c) => ({ background: c, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }),
    label: { fontSize: '0.75rem', fontWeight: '700', color: '#8FA3CC', display: 'block', marginBottom: '4px' },
  }

  if (cargando) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8FA3CC' }}>Cargando...</div>

  // Lo que el usuario actual tiene que cobrar
  const misPendientes = repartos.flatMap(r =>
    (r.reparto_lineas || []).filter(l => l.beneficiario_id === usuario?.id && l.estado === 'pendiente' && l.monto > 0)
  )
  const totalPendiente = misPendientes.reduce((s, l) => s + parseFloat(l.monto), 0)

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href={`/proyectos/${id}/workspace`} style={{ fontSize: '0.85rem', color: '#8FA3CC', textDecoration: 'none' }}>Workspace</a>
        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff' }}>Reparto economico</div>
        {esFundador && (
          <button onClick={() => setMostrarForm(true)} style={s.btn('#1D9E75')}>
            + Registrar ingreso
          </button>
        )}
      </nav>

      <div style={s.wrap}>

        {/* Lo que tengo pendiente de cobrar */}
        {!esFundador && totalPendiente > 0 && (
          <div style={{ background: 'rgba(29,158,117,0.06)', border: '1px solid rgba(29,158,117,0.25)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#1D9E75' }}>Tienes ${fmt(totalPendiente)} pendientes de cobro</div>
              <div style={{ fontSize: '0.75rem', color: '#8FA3CC' }}>El fundador debe confirmar el pago para cada linea.</div>
            </div>
          </div>
        )}

        {/* Resultado del ultimo calculo */}
        {resultadoCalculo && (
          <div style={{ background: 'rgba(29,158,117,0.06)', border: '1px solid rgba(29,158,117,0.25)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#1D9E75', marginBottom: '0.75rem' }}>Reparto calculado</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>${fmt(resultadoCalculo.resumen.total)}</div>
                <div style={{ fontSize: '0.65rem', color: '#6B7280' }}>Ingreso total</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#E8A020' }}>${fmt(resultadoCalculo.resumen.comprometido)}</div>
                <div style={{ fontSize: '0.65rem', color: '#6B7280' }}>Comprometido</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#1D9E75' }}>${fmt(resultadoCalculo.resumen.para_fundador)}</div>
                <div style={{ fontSize: '0.65rem', color: '#6B7280' }}>Para el fundador</div>
              </div>
            </div>
            <button onClick={() => setResultadoCalculo(null)} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Cerrar</button>
          </div>
        )}

        {/* Historial de repartos */}
        {repartos.length === 0 ? (
          <div style={{ ...s.card, textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>💸</div>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>No hay repartos registrados</div>
            <div style={{ fontSize: '0.78rem', color: '#8FA3CC', marginBottom: esFundador ? '1.25rem' : 0 }}>
              {esFundador
                ? 'Cuando el proyecto reciba ingresos, registra el monto y el sistema calculara automaticamente cuanto le corresponde a cada participante.'
                : 'Cuando el fundador registre el primer ingreso, veras aqui tu parte.'}
            </div>
            {esFundador && (
              <button onClick={() => setMostrarForm(true)} style={s.btn('#1D9E75')}>
                Registrar primer ingreso
              </button>
            )}
          </div>
        ) : (
          repartos.map(reparto => {
            const misLineas = (reparto.reparto_lineas || []).filter(l => l.beneficiario_id === usuario?.id)
            const todasLineas = reparto.reparto_lineas || []
            const mostrarTodas = esFundador

            return (
              <div key={reparto.id} style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '2px' }}>{reparto.descripcion}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{new Date(reparto.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>${fmt(reparto.monto_total)}</div>
                    <div style={{ fontSize: '0.65rem', color: '#6B7280' }}>ingreso total</div>
                  </div>
                </div>

                {/* Lineas de reparto */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(mostrarTodas ? todasLineas : misLineas).map(linea => {
                    const tipo = TIPO_COLOR[linea.tipo] || TIPO_COLOR.fundador
                    return (
                      <div key={linea.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0.875rem', background: tipo.bg, borderRadius: '8px', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: '700', color: tipo.color, background: 'rgba(0,0,0,0.15)', padding: '1px 6px', borderRadius: '10px' }}>{tipo.label}</span>
                            {esFundador && linea.perfiles?.nombre && (
                              <span style={{ fontSize: '0.72rem', color: '#fff', fontWeight: '500' }}>{linea.perfiles.nombre}</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#8FA3CC' }}>{linea.concepto}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: linea.monto > 0 ? '#fff' : '#6B7280' }}>
                              {linea.monto > 0 ? `$${fmt(linea.monto)}` : 'Equity'}
                            </div>
                            {linea.monto > 0 && (
                              <div style={{ fontSize: '0.65rem', color: linea.estado === 'pagado' ? '#1D9E75' : '#E8A020' }}>
                                {linea.estado === 'pagado' ? '✓ Pagado' : 'Pendiente'}
                              </div>
                            )}
                          </div>
                          {esFundador && linea.monto > 0 && linea.estado === 'pendiente' && linea.tipo !== 'fundador' && (
                            <button onClick={() => marcarPagado(linea.id)} style={{ ...s.btn('rgba(29,158,117,0.2)'), color: '#1D9E75', border: '1px solid rgba(29,158,117,0.3)', fontSize: '0.72rem', padding: '0.3rem 0.75rem' }}>
                              Marcar pagado
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Si el usuario no es fundador y no tiene lineas */}
                {!mostrarTodas && misLineas.length === 0 && (
                  <div style={{ fontSize: '0.78rem', color: '#6B7280', textAlign: 'center', padding: '0.75rem' }}>
                    No tienes una linea de reparto en este ingreso.
                  </div>
                )}
              </div>
            )
          })
        )}

        {/* Modal registrar ingreso */}
        {mostrarForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <div style={{ background: '#0F1E3A', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '480px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>Registrar ingreso y calcular reparto</div>
                <button onClick={() => { setMostrarForm(false); setError('') }} style={{ background: 'none', border: 'none', color: '#8FA3CC', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ background: 'rgba(74,144,217,0.06)', border: '1px solid rgba(74,144,217,0.15)', borderRadius: '8px', padding: '0.875rem', marginBottom: '1rem', fontSize: '0.78rem', color: '#8FA3CC', lineHeight: '1.6' }}>
                El sistema calculara automaticamente cuanto le corresponde a cada participante segun los contratos y fondeos activos del proyecto.
              </div>

              <label style={s.label}>Monto del ingreso (COP) *</label>
              <input style={s.input} type="number" value={form.monto_total} onChange={e => setForm(f => ({ ...f, monto_total: e.target.value }))} placeholder="5.000.000" />

              <label style={s.label}>Descripcion del ingreso *</label>
              <input style={s.input} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Primera venta, pago cliente X, etc." />

              {error && <div style={{ fontSize: '0.8rem', color: '#E05555', marginBottom: '0.75rem', padding: '0.625rem', background: 'rgba(224,85,85,0.08)', borderRadius: '8px' }}>{error}</div>}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={calcularReparto} disabled={calculando} style={{ ...s.btn('#1D9E75'), flex: 1, opacity: calculando ? 0.7 : 1 }}>
                  {calculando ? 'Calculando...' : 'Calcular reparto'}
                </button>
                <button onClick={() => { setMostrarForm(false); setError('') }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#8FA3CC', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
