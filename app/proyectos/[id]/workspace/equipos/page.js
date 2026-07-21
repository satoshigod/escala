'use client'
// Reporte mensual de ventas para proyectos de equipos con leasing
// Mismo modelo waterfall que el local: del excedente mensual, % acordado va al angel

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../../../lib/supabase'

const fmt = (n) => Math.round(parseFloat(n || 0)).toLocaleString('es-CO')
const fmtK = (n) => {
  const v = parseFloat(n || 0)
  if (v >= 1000000) return '$' + (v / 1000000).toFixed(1) + 'M'
  if (v >= 1000) return '$' + (v / 1000).toFixed(0) + 'K'
  return '$' + fmt(v)
}

export default function ReporteEquiposPage() {
  const { id } = useParams()
  const [contrato, setContrato] = useState(null)
  const [reportes, setReportes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState(null)
  const [yaReportoEsteMes, setYaReportoEsteMes] = useState(false)

  const [form, setForm] = useState({
    ingresos_mes: '',
    costos_directos: '',
    gastos_fijos: '',
    nota: '',
  })

  useEffect(() => { cargar() }, [id])

  async function cargar() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setCargando(false); return }

    // Cargar contrato de leasing activo del proyecto
    const { data: contratos } = await supabase
      .from('contratos_leasing')
      .select('*')
      .eq('proyecto_id', id)
      .eq('estado', 'activo')
      .maybeSingle()
    setContrato(contratos)

    // Cargar reportes anteriores
    const { data: reps } = await supabase
      .from('reportes_leasing')
      .select('*')
      .eq('proyecto_id', id)
      .order('fecha_mes', { ascending: false })
      .limit(12)
    setReportes(reps || [])

    // Verificar si ya reportó este mes
    const mesActual = new Date().toISOString().slice(0, 7) // YYYY-MM
    const yaReporto = (reps || []).some(r => r.fecha_mes?.startsWith(mesActual))
    setYaReportoEsteMes(yaReporto)

    setCargando(false)
  }

  const ingresosN = parseFloat(form.ingresos_mes || 0)
  const costosN = parseFloat(form.costos_directos || 0)
  const gastosN = parseFloat(form.gastos_fijos || 0)
  const excedente = ingresosN - costosN - gastosN
  const pctAngel = parseFloat(contrato?.pct_excedente || 60)
  const abonoAngel = excedente > 0 ? Math.round(excedente * pctAngel / 100) : 0
  const teMeda = excedente > 0 ? excedente - abonoAngel : excedente
  const capitalPendiente = parseFloat(contrato?.capital_pendiente || 0)
  const capitalAbonado = parseFloat(contrato?.capital_abonado || 0)
  const pctRecuperado = contrato?.valor_equipo > 0
    ? Math.min(100, Math.round(capitalAbonado / parseFloat(contrato.valor_equipo) * 100))
    : 0
  const mesesRestantes = abonoAngel > 0 ? Math.ceil(capitalPendiente / abonoAngel) : null

  const colorExcedente = excedente <= 0 ? '#E05555' : excedente < gastosN * 0.3 ? '#E8A020' : '#1D9E75'

  async function reportar() {
    if (ingresosN <= 0) { setError('Ingresa los ingresos del mes'); return }
    setEnviando(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/contratos-leasing/reporte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          proyecto_id: id,
          contrato_id: contrato?.id,
          ingresos_mes: ingresosN,
          costos_directos: costosN,
          gastos_fijos: gastosN,
          excedente,
          abono_angel: abonoAngel,
          pct_excedente: pctAngel,
          nota: form.nota,
          fecha_mes: new Date().toISOString().slice(0, 7),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResultado(data)
      setForm({ ingresos_mes: '', costos_directos: '', gastos_fijos: '', nota: '' })
      await cargar()
    } catch (err) { setError(err.message) }
    finally { setEnviando(false) }
  }

  const s = {
    page: { minHeight: '100vh', background: '#0B1628', fontFamily: 'Inter,sans-serif', color: '#fff', padding: '0 0 4rem' },
    nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    wrap: { maxWidth: '680px', margin: '0 auto', padding: '2rem 1.5rem' },
    card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem' },
    label: { fontSize: '0.78rem', fontWeight: '700', color: '#C8D4E8', marginBottom: '0.4rem', display: 'block' },
    sublabel: { fontSize: '0.7rem', color: '#6B7280', marginBottom: '0.5rem', display: 'block', marginTop: '-0.2rem' },
    input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '0.7rem 0.875rem', color: '#fff', fontSize: '0.9rem', outline: 'none', fontFamily: 'Inter,sans-serif', marginBottom: '0.875rem', boxSizing: 'border-box' },
    btn: { width: '100%', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.875rem', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter,sans-serif' },
  }

  const mesActual = new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })

  if (cargando) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8FA3CC' }}>Cargando...</div>

  if (!contrato) return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href={'/proyectos/' + id + '/workspace'} style={{ fontSize: '0.85rem', color: '#8FA3CC', textDecoration: 'none' }}>← Workspace</a>
        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff' }}>Reporte mensual</div>
        <div />
      </nav>
      <div style={{ ...s.wrap, textAlign: 'center', paddingTop: '4rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📄</div>
        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>No tienes un contrato de leasing activo</div>
        <div style={{ fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '1.5rem' }}>
          Primero firma el contrato de leasing con tu angel inversionista.
        </div>
        <a href={'/proyectos/' + id + '/workspace/leasing'} style={{ background: '#AFA9EC', color: '#2D2866', borderRadius: '10px', padding: '0.75rem 1.5rem', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '700' }}>
          Ir al contrato de leasing →
        </a>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href={'/proyectos/' + id + '/workspace'} style={{ fontSize: '0.85rem', color: '#8FA3CC', textDecoration: 'none' }}>← Workspace</a>
        <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff' }}>🔧 {contrato.tipo_equipo} {contrato.marca}</div>
        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Reporte mensual</div>
      </nav>

      <div style={s.wrap}>

        {/* Estado del leasing */}
        <div style={{ ...s.card, borderColor: 'rgba(175,169,236,0.3)', background: 'rgba(175,169,236,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: '700', color: '#AFA9EC', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                Pagando al angel — {pctRecuperado}% recuperado
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.03em' }}>
                ${fmt(capitalPendiente)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#8FA3CC', marginTop: '2px' }}>capital pendiente de pagar</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>Contrato</div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#AFA9EC' }}>#{contrato.numero_contrato}</div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '6px', height: '8px', overflow: 'hidden', marginBottom: '0.875rem' }}>
            <div style={{ width: pctRecuperado + '%', height: '100%', background: '#AFA9EC', borderRadius: '6px', transition: 'width 0.5s ease' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem' }}>
            {[
              { l: 'Abonado', v: fmtK(capitalAbonado), c: '#1D9E75' },
              { l: 'Pendiente', v: fmtK(capitalPendiente), c: '#E8A020' },
              { l: '% equipo', v: pctAngel + '% del excedente', c: '#AFA9EC' },
            ].map(k => (
              <div key={k.l} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.625rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: k.c }}>{k.v}</div>
                <div style={{ fontSize: '0.62rem', color: '#6B7280', textTransform: 'uppercase', marginTop: '2px' }}>{k.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Resultado del reporte anterior */}
        {resultado && (
          <div style={{ ...s.card, borderColor: 'rgba(29,158,117,0.3)', background: 'rgba(29,158,117,0.06)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1D9E75', marginBottom: '0.75rem' }}>✅ Reporte registrado</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem' }}>
              <div><span style={{ color: '#6B7280' }}>Excedente del mes: </span><strong style={{ color: '#fff' }}>${fmt(resultado.excedente)}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Abono al inversionista: </span><strong style={{ color: '#AFA9EC' }}>${fmt(resultado.abono_angel)}</strong></div>
              <div><span style={{ color: '#6B7280' }}>Pendiente ahora: </span><strong style={{ color: '#E8A020' }}>${fmt(resultado.capital_pendiente_nuevo)}</strong></div>
              {resultado.meses_restantes && <div><span style={{ color: '#6B7280' }}>Meses estimados: </span><strong style={{ color: '#fff' }}>~{resultado.meses_restantes}</strong></div>}
            </div>
          </div>
        )}

        {/* Formulario de reporte */}
        {!yaReportoEsteMes ? (
          <div style={s.card}>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff', marginBottom: '0.25rem' }}>
              Reporte de {mesActual}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#8FA3CC', marginBottom: '1.25rem' }}>
              Ingresa los numeros reales de este mes. El sistema calcula el abono al angel automaticamente.
            </div>

            <label style={s.label}>¿Cuanto vendiste este mes? *</label>
            <span style={s.sublabel}>Total de ingresos del mes — lo que entro a tu bolsillo</span>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#8FA3CC', fontSize: '0.85rem' }}>$</span>
              <input style={{ ...s.input, paddingLeft: '1.75rem' }} type="number" value={form.ingresos_mes} onChange={e => setForm(f => ({ ...f, ingresos_mes: e.target.value }))} placeholder="2000000" />
            </div>

            <label style={s.label}>Costos directos del mes</label>
            <span style={s.sublabel}>Materiales, insumos, lo que gastas para producir</span>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#8FA3CC', fontSize: '0.85rem' }}>$</span>
              <input style={{ ...s.input, paddingLeft: '1.75rem' }} type="number" value={form.costos_directos} onChange={e => setForm(f => ({ ...f, costos_directos: e.target.value }))} placeholder="600000" />
            </div>

            <label style={s.label}>Gastos fijos del mes</label>
            <span style={s.sublabel}>Arriendo del espacio, servicios, otros gastos fijos</span>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#8FA3CC', fontSize: '0.85rem' }}>$</span>
              <input style={{ ...s.input, paddingLeft: '1.75rem' }} type="number" value={form.gastos_fijos} onChange={e => setForm(f => ({ ...f, gastos_fijos: e.target.value }))} placeholder="200000" />
            </div>

            {/* Calculadora en tiempo real */}
            {ingresosN > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#8FA3CC', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Calculo del mes</div>
                {[
                  { l: 'Ingresos', v: '$' + fmt(ingresosN), c: '#fff' },
                  { l: '- Costos directos', v: '-$' + fmt(costosN), c: '#8FA3CC' },
                  { l: '- Gastos fijos', v: '-$' + fmt(gastosN), c: '#8FA3CC' },
                  { l: '= Excedente', v: '$' + fmt(excedente), c: colorExcedente, bold: true },
                ].map(r => (
                  <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: '#6B7280' }}>{r.l}</span>
                    <span style={{ color: r.c, fontWeight: r.bold ? '700' : '400' }}>{r.v}</span>
                  </div>
                ))}
                {excedente > 0 ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '6px 0 3px', marginTop: '4px' }}>
                      <span style={{ color: '#AFA9EC' }}>→ Abono al angel ({pctAngel}%)</span>
                      <span style={{ color: '#AFA9EC', fontWeight: '700' }}>${fmt(abonoAngel)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '3px 0' }}>
                      <span style={{ color: '#1D9E75' }}>→ Para ti ({100 - pctAngel}%)</span>
                      <span style={{ color: '#1D9E75', fontWeight: '700' }}>${fmt(teMeda)}</span>
                    </div>
                    {mesesRestantes && (
                      <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '0.5rem', padding: '6px', background: 'rgba(175,169,236,0.06)', borderRadius: '6px' }}>
                        Si produces igual todos los meses, la maquina sera tuya en <strong style={{ color: '#AFA9EC' }}>~{mesesRestantes} meses</strong>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: '#E05555', marginTop: '0.5rem', padding: '6px', background: 'rgba(224,85,85,0.06)', borderRadius: '6px' }}>
                    Este mes el excedente es cero o negativo — no hay abono al angel. Reportalo igual para mantener el registro.
                  </div>
                )}
              </div>
            )}

            <label style={s.label}>Nota del mes (opcional)</label>
            <textarea
              style={{ ...s.input, minHeight: '70px', resize: 'vertical' }}
              value={form.nota}
              onChange={e => setForm(f => ({ ...f, nota: e.target.value }))}
              placeholder="Algo que quieras contarle al angel sobre este mes..."
            />

            {error && <div style={{ background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.2)', borderRadius: '8px', padding: '0.75rem', color: '#E05555', fontSize: '0.82rem', marginBottom: '0.875rem' }}>{error}</div>}

            <button style={{ ...s.btn, opacity: enviando ? 0.7 : 1 }} onClick={reportar} disabled={enviando}>
              {enviando ? 'Registrando...' : 'Registrar reporte de ' + mesActual + ' →'}
            </button>
          </div>
        ) : (
          <div style={{ ...s.card, textAlign: 'center', borderColor: 'rgba(29,158,117,0.2)', background: 'rgba(29,158,117,0.04)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#1D9E75', marginBottom: '0.25rem' }}>Ya reportaste este mes</div>
            <div style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>El proximo reporte es el ultimo dia de {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString('es-CO', { month: 'long' })}</div>
          </div>
        )}

        {/* Historial */}
        {reportes.length > 0 && (
          <div style={s.card}>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff', marginBottom: '1rem' }}>Historial de reportes</div>
            {reportes.map((r, i) => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: i < reportes.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#fff' }}>
                    {new Date(r.fecha_mes + '-01').toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                    Ingresos: ${fmt(r.ingresos_mes)} · Excedente: ${fmt(r.excedente)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#AFA9EC' }}>${fmt(r.abono_angel)}</div>
                  <div style={{ fontSize: '0.65rem', color: '#6B7280' }}>abono angel</div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
