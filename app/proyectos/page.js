'use client'

import { useState, useEffect } from 'react'
import NavApp from '@/components/NavApp'
import { supabase } from '../../lib/supabase'

// ── WIZARD LOCAL COMERCIAL ────────────────────────────────────────────────────
function WizardLocalComercial({ onCancelar, onPublicar }) {
  const [paso, setPaso] = useState(1)
  const [datos, setDatos] = useState({
    // Paso 1 — negocio
    nombre_negocio: '', tipo_negocio: '', ciudad: '',
    // Paso 2 — local
    direccion_local: '', propietario_nombre: '', propietario_telefono: '',
    propietario_correo: '', canon_mensual: '', meses_deposito: '2',
    necesita_adecuacion: false, presupuesto_adecuacion: '',
    // Paso 3 — costos fijos
    costo_arriendo: '', costo_servicios: '', costo_empleado: '', costo_otros: '',
    // Paso 4 — producto
    costo_producto: '', precio_venta: '',
    // Paso 5 — proyeccion ventas
    ventas_dia_flojo: '', ventas_dia_normal: '', ventas_dia_bueno: '',
    // Paso 6 — compromisos
    acepta_compromisos: false,
  })
  const [error, setError] = useState('')

  const set = (k, v) => setDatos(d => ({ ...d, [k]: v }))

  const totalFijosMes = () => {
    const arr = parseFloat(datos.costo_arriendo || 0)
    const srv = parseFloat(datos.costo_servicios || 0)
    const emp = parseFloat(datos.costo_empleado || 0)
    const otr = parseFloat(datos.costo_otros || 0)
    return arr + srv + emp + otr
  }
  const fijoDia = () => Math.round(totalFijosMes() / 30)

  const margenPct = () => {
    const c = parseFloat(datos.costo_producto || 0)
    const v = parseFloat(datos.precio_venta || 0)
    if (!v || v <= c) return 0
    return Math.round(((v - c) / v) * 100)
  }
  const margenUnit = () => {
    const c = parseFloat(datos.costo_producto || 0)
    const v = parseFloat(datos.precio_venta || 0)
    return Math.max(0, v - c)
  }

  const excedenteDia = (ventas) => {
    const v = parseFloat(ventas || 0)
    const costoProducto = v * (1 - margenPct() / 100)
    const fijos = fijoDia()
    return Math.round(v - costoProducto - fijos)
  }

  const capitalTotal = () => {
    const dep = parseFloat(datos.canon_mensual || 0) * parseInt(datos.meses_deposito || 2)
    const primer = parseFloat(datos.canon_mensual || 0)
    const adec = datos.necesita_adecuacion ? parseFloat(datos.presupuesto_adecuacion || 0) : 0
    return dep + primer + adec
  }

  const totalArriendosAnio = () => parseFloat(datos.canon_mensual || 0) * 12

  const s = {
    wrap: { maxWidth: '540px', margin: '0 auto' },
    pasos: { display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '1.5rem' },
    pill: (activo, done) => ({
      width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: '0.72rem', fontWeight: '700', flexShrink: 0,
      background: done ? '#1D9E75' : activo ? '#4A90D9' : 'rgba(255,255,255,0.1)',
      color: done || activo ? '#fff' : '#6B7280',
    }),
    linea: { flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' },
    titulo: { fontSize: '1.1rem', fontWeight: '800', color: '#fff', marginBottom: '0.4rem', letterSpacing: '-0.02em' },
    educativo: { background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.2)', borderRadius: '10px', padding: '0.875rem 1rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#93B8E8', lineHeight: '1.6' },
    advertencia: { background: 'rgba(232,160,32,0.08)', border: '1px solid rgba(232,160,32,0.2)', borderRadius: '10px', padding: '0.875rem 1rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#E8A020', lineHeight: '1.6' },
    label: { fontSize: '0.78rem', fontWeight: '700', color: '#C8D4E8', marginBottom: '0.4rem', display: 'block' },
    sublabel: { fontSize: '0.7rem', color: '#6B7280', marginBottom: '0.5rem', display: 'block', marginTop: '-0.25rem' },
    input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '0.6rem 0.875rem', color: '#fff', fontSize: '0.85rem', outline: 'none', fontFamily: 'Inter,sans-serif', marginBottom: '0.875rem', boxSizing: 'border-box' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
    calc: { background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '10px', padding: '0.875rem 1rem', marginBottom: '1rem' },
    calcRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#8FA3CC', padding: '3px 0' },
    calcTotal: { display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '700', color: '#1D9E75', padding: '6px 0', borderTop: '1px solid rgba(29,158,117,0.2)', marginTop: '4px' },
    obligatorio: { background: 'rgba(232,32,32,0.06)', border: '1px solid rgba(232,32,32,0.2)', borderRadius: '10px', padding: '0.875rem 1rem', marginBottom: '0.75rem' },
    obligatorioTitulo: { fontSize: '0.72rem', fontWeight: '700', color: '#E05555', marginBottom: '0.4rem' },
    obligatorioTexto: { fontSize: '0.8rem', color: '#C8D4E8', lineHeight: '1.6' },
    btnRow: { display: 'flex', gap: '0.75rem', marginTop: '1.5rem' },
    btnCancel: { background: 'none', border: '1px solid rgba(255,255,255,0.12)', color: '#8FA3CC', borderRadius: '8px', padding: '0.7rem 1.25rem', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif' },
    btn: { flex: 1, background: '#4A90D9', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.7rem 1.5rem', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter,sans-serif' },
    btnVerde: { flex: 1, background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.7rem 1.5rem', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter,sans-serif' },
  }

  const TIPOS_NEGOCIO = [
    { id: 'ropa', emoji: '👗', label: 'Ropa y moda' },
    { id: 'comida', emoji: '🍔', label: 'Comida' },
    { id: 'frutas', emoji: '🍎', label: 'Frutas y verduras' },
    { id: 'tienda', emoji: '🛒', label: 'Tienda / miscelánea' },
    { id: 'belleza', emoji: '💄', label: 'Belleza' },
    { id: 'calzado', emoji: '👟', label: 'Calzado' },
    { id: 'tecnologia', emoji: '📱', label: 'Tecnología' },
    { id: 'otro', emoji: '📦', label: 'Otro' },
  ]

  const fmt = (n) => Math.round(n).toLocaleString('es-CO')

  return (
    <div style={s.wrap}>

      {/* Barra de pasos */}
      <div style={s.pasos}>
        {[1,2,3,4,5,6].map((p, i) => (
          <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: p < 6 ? 1 : 'none' }}>
            <div style={s.pill(paso === p, paso > p)}>{paso > p ? '✓' : p}</div>
            {p < 6 && <div style={s.linea}></div>}
          </div>
        ))}
      </div>

      {/* ── PASO 1: Tu negocio ── */}
      {paso === 1 && (
        <div>
          <div style={s.titulo}>¿Qué negocio vas a montar?</div>
          <div style={s.educativo}>
            No importa si vendes ropa, comida, frutas o cualquier otra cosa. Lo importante es que tengas claro qué va a vender tu negocio — con eso calculamos si va a funcionar y cuánto necesitas.
          </div>

          <label style={s.label}>Nombre de tu negocio *</label>
          <input style={s.input} value={datos.nombre_negocio} onChange={e => set('nombre_negocio', e.target.value)} placeholder="Ej: Tienda Lupita, Frutería El Paraíso..." />

          <label style={s.label}>¿Qué vas a vender? *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.875rem' }}>
            {TIPOS_NEGOCIO.map(t => (
              <div key={t.id} onClick={() => set('tipo_negocio', t.id)} style={{ cursor: 'pointer', border: datos.tipo_negocio === t.id ? '2px solid #4A90D9' : '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.75rem 0.5rem', textAlign: 'center', background: datos.tipo_negocio === t.id ? 'rgba(74,144,217,0.12)' : 'rgba(255,255,255,0.03)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{t.emoji}</div>
                <div style={{ fontSize: '0.7rem', color: datos.tipo_negocio === t.id ? '#4A90D9' : '#8FA3CC', fontWeight: datos.tipo_negocio === t.id ? '700' : '400', lineHeight: '1.2' }}>{t.label}</div>
              </div>
            ))}
          </div>

          <label style={s.label}>Ciudad donde va a estar el negocio *</label>
          <input style={s.input} value={datos.ciudad} onChange={e => set('ciudad', e.target.value)} placeholder="Medellín, Bogotá, Cali..." />
        </div>
      )}

      {/* ── PASO 2: El local ── */}
      {paso === 2 && (
        <div>
          <div style={s.titulo}>El local que vas a arrendar</div>
          <div style={s.educativo}>
            Cuéntanos dónde está el local y quién es el propietario. Escala va a contactar al propietario para verificar que el local existe y que el precio que declaras es el correcto — esto protege tanto al operador como al inversionista.
          </div>

          <label style={s.label}>Dirección del local *</label>
          <span style={s.sublabel}>Dirección completa donde está el local</span>
          <input style={s.input} value={datos.direccion_local} onChange={e => set('direccion_local', e.target.value)} placeholder="Ej: Calle 50 # 43-20, Local 3, El Poblado" />

          <div style={s.row}>
            <div>
              <label style={s.label}>Nombre del propietario o arrendadora *</label>
              <input style={s.input} value={datos.propietario_nombre} onChange={e => set('propietario_nombre', e.target.value)} placeholder="Nombre completo" />
            </div>
            <div>
              <label style={s.label}>Teléfono del propietario *</label>
              <input style={s.input} value={datos.propietario_telefono} onChange={e => set('propietario_telefono', e.target.value)} placeholder="300 000 0000" />
            </div>
          </div>

          <label style={s.label}>Correo del propietario (si lo tienes)</label>
          <input style={s.input} value={datos.propietario_correo} onChange={e => set('propietario_correo', e.target.value)} placeholder="correo@ejemplo.com" />

          <div style={s.row}>
            <div>
              <label style={s.label}>Valor del arriendo mensual *</label>
              <span style={s.sublabel}>Lo que pagas cada mes al propietario</span>
              <input style={s.input} type="number" value={datos.canon_mensual} onChange={e => set('canon_mensual', e.target.value)} placeholder="1.200.000" />
            </div>
            <div>
              <label style={s.label}>Meses de depósito que piden *</label>
              <span style={s.sublabel}>Normalmente 1 o 2 meses</span>
              <select style={{ ...s.input }} value={datos.meses_deposito} onChange={e => set('meses_deposito', e.target.value)}>
                <option value="1">1 mes</option>
                <option value="2">2 meses</option>
                <option value="3">3 meses</option>
              </select>
            </div>
          </div>

          <label style={s.label}>¿El local necesita adecuaciones? *</label>
          <span style={s.sublabel}>Pintura, estanterías, instalaciones eléctricas, etc.</span>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.875rem' }}>
            {[{ v: false, label: 'No, está listo para usar' }, { v: true, label: 'Sí, necesita arreglos' }].map(op => (
              <div key={String(op.v)} onClick={() => set('necesita_adecuacion', op.v)} style={{ flex: 1, cursor: 'pointer', border: datos.necesita_adecuacion === op.v ? '2px solid #4A90D9' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center', background: datos.necesita_adecuacion === op.v ? 'rgba(74,144,217,0.1)' : 'rgba(255,255,255,0.03)', fontSize: '0.82rem', color: datos.necesita_adecuacion === op.v ? '#4A90D9' : '#8FA3CC', fontWeight: datos.necesita_adecuacion === op.v ? '700' : '400' }}>
                {op.label}
              </div>
            ))}
          </div>
          {datos.necesita_adecuacion && (
            <>
              <label style={s.label}>Presupuesto para las adecuaciones *</label>
              <input style={s.input} type="number" value={datos.presupuesto_adecuacion} onChange={e => set('presupuesto_adecuacion', e.target.value)} placeholder="800.000" />
            </>
          )}

          {/* Resumen capital */}
          {datos.canon_mensual && (
            <div style={s.calc}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#1D9E75', marginBottom: '0.5rem' }}>Escala va a financiar este capital:</div>
              <div style={s.calcRow}><span>Depósito ({datos.meses_deposito} mes{datos.meses_deposito > 1 ? 'es' : ''} × ${fmt(datos.canon_mensual)})</span><span>${fmt(parseFloat(datos.canon_mensual || 0) * parseInt(datos.meses_deposito))}</span></div>
              <div style={s.calcRow}><span>Primer mes de arriendo (incluido en el contrato)</span><span>${fmt(datos.canon_mensual)}</span></div>
              {datos.necesita_adecuacion && datos.presupuesto_adecuacion && <div style={s.calcRow}><span>Adecuaciones</span><span>${fmt(datos.presupuesto_adecuacion)}</span></div>}
              <div style={s.calcTotal}><span>Total capital a financiar</span><span>${fmt(capitalTotal())}</span></div>
            </div>
          )}
        </div>
      )}

      {/* ── PASO 3: Costos fijos ── */}
      {paso === 3 && (
        <div>
          <div style={s.titulo}>¿Cuánto te cuesta tener el negocio abierto cada mes?</div>
          <div style={s.advertencia}>
            <strong style={{ display: 'block', marginBottom: '4px' }}>¿Qué son los gastos fijos?</strong>
            Son los gastos que tienes que pagar SIN IMPORTAR si vendiste mucho o poco ese mes. El arriendo lo pagas aunque no hayas vendido nada. La luz también. Eso son gastos fijos.
          </div>

          <label style={s.label}>Arriendo mensual del local</label>
          <span style={s.sublabel}>Lo que le pagas al dueño del local cada mes (ya lo pusiste en el paso anterior)</span>
          <input style={{ ...s.input, background: 'rgba(255,255,255,0.03)', color: '#6B7280' }} value={datos.canon_mensual ? `$${fmt(datos.canon_mensual)}` : ''} disabled />

          <label style={s.label}>Servicios públicos *</label>
          <span style={s.sublabel}>Luz, agua, gas, internet — pon un estimado si no sabes exacto</span>
          <input style={s.input} type="number" value={datos.costo_servicios} onChange={e => set('costo_servicios', e.target.value)} placeholder="200.000" />

          <label style={s.label}>Empleado (si vas a tener uno)</label>
          <span style={s.sublabel}>Si vas a trabajar solo, pon $0</span>
          <input style={s.input} type="number" value={datos.costo_empleado} onChange={e => set('costo_empleado', e.target.value)} placeholder="0" />

          <label style={s.label}>Otros gastos fijos</label>
          <span style={s.sublabel}>Seguridad, publicidad fija, contaduría, etc. Si no tienes, pon $0</span>
          <input style={s.input} type="number" value={datos.costo_otros} onChange={e => set('costo_otros', e.target.value)} placeholder="0" />

          <div style={s.calc}>
            <div style={s.calcRow}><span>Arriendo</span><span>${fmt(datos.canon_mensual || 0)}</span></div>
            <div style={s.calcRow}><span>Servicios</span><span>${fmt(datos.costo_servicios || 0)}</span></div>
            <div style={s.calcRow}><span>Empleado</span><span>${fmt(datos.costo_empleado || 0)}</span></div>
            <div style={s.calcRow}><span>Otros</span><span>${fmt(datos.costo_otros || 0)}</span></div>
            <div style={s.calcTotal}><span>Total gastos fijos / mes</span><span>${fmt(totalFijosMes())}</span></div>
            <div style={{ ...s.calcTotal, borderTop: 'none', marginTop: 0, fontSize: '0.78rem' }}><span>= Por día (÷ 30)</span><span style={{ color: '#E8A020' }}>${fmt(fijoDia())} / día</span></div>
          </div>
          {fijoDia() > 0 && (
            <div style={{ fontSize: '0.78rem', color: '#8FA3CC', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.875rem' }}>
              Cada día que abras, necesitas vender al menos <strong style={{ color: '#fff' }}>${fmt(fijoDia())}</strong> solo para cubrir los gastos fijos — sin contar el costo de lo que vendes.
            </div>
          )}
        </div>
      )}

      {/* ── PASO 4: Producto y margen ── */}
      {paso === 4 && (
        <div>
          <div style={s.titulo}>¿Cuánto ganas por cada cosa que vendes?</div>
          <div style={s.educativo}>
            <strong style={{ display: 'block', marginBottom: '4px' }}>La ganancia es la diferencia entre lo que te cuesta y lo que cobras</strong>
            Si compras una blusa en $25.000 y la vendes en $60.000, tu ganancia es $35.000 por blusa. Con esa ganancia tienes que cubrir los gastos fijos y pagarle al inversionista.
          </div>

          <label style={s.label}>¿Cuánto te cuesta conseguir lo que vendes? *</label>
          <span style={s.sublabel}>El precio al que compras la mercancía o los ingredientes — por unidad o por lote</span>
          <input style={s.input} type="number" value={datos.costo_producto} onChange={e => set('costo_producto', e.target.value)} placeholder="25.000" />

          <label style={s.label}>¿A cuánto lo vendes? *</label>
          <span style={s.sublabel}>El precio que le cobras al cliente</span>
          <input style={s.input} type="number" value={datos.precio_venta} onChange={e => set('precio_venta', e.target.value)} placeholder="60.000" />

          {datos.costo_producto && datos.precio_venta && parseFloat(datos.precio_venta) > parseFloat(datos.costo_producto) && (
            <div style={s.calc}>
              <div style={s.calcRow}><span>Lo compras en</span><span>${fmt(datos.costo_producto)}</span></div>
              <div style={s.calcRow}><span>Lo vendes en</span><span>${fmt(datos.precio_venta)}</span></div>
              <div style={s.calcTotal}><span>Ganas por unidad</span><span>${fmt(margenUnit())}</span></div>
              <div style={{ ...s.calcTotal, borderTop: 'none', marginTop: 0 }}><span>Tu margen de ganancia</span><span style={{ color: margenPct() >= 40 ? '#1D9E75' : '#E8A020' }}>{margenPct()}%</span></div>
              {margenPct() < 30 && (
                <div style={{ fontSize: '0.75rem', color: '#E8A020', marginTop: '6px', padding: '6px 0', borderTop: '1px solid rgba(232,160,32,0.2)' }}>
                  Con un margen del {margenPct()}% puede ser difícil cubrir los gastos fijos y pagarle al inversionista. Revisa si puedes vender a un precio mayor o comprar más barato.
                </div>
              )}
            </div>
          )}
          {datos.precio_venta && datos.costo_producto && parseFloat(datos.precio_venta) <= parseFloat(datos.costo_producto) && (
            <div style={{ ...s.advertencia, borderColor: 'rgba(224,85,85,0.3)', background: 'rgba(224,85,85,0.06)', color: '#E05555' }}>
              El precio de venta debe ser mayor que el costo. Si vendes a $60.000 lo que te cuesta $60.000, no ganas nada.
            </div>
          )}
        </div>
      )}

      {/* ── PASO 5: Proyeccion ventas ── */}
      {paso === 5 && (
        <div>
          <div style={s.titulo}>¿Cuánto crees que puedes vender por día?</div>
          <div style={s.advertencia}>
            <strong style={{ display: 'block', marginBottom: '4px' }}>Importante: sé honesto</strong>
            Muchas personas ponen números muy altos porque quieren que el negocio suene bien. Pero si pones un número que no es real, el modelo no va a funcionar y vas a quedar mal con el inversionista. Pon lo que crees que realmente puedes vender en un día normal.
          </div>

          <label style={s.label}>Un día flojo *</label>
          <span style={s.sublabel}>Lunes por la mañana, día de lluvia, temporada baja</span>
          <input style={s.input} type="number" value={datos.ventas_dia_flojo} onChange={e => set('ventas_dia_flojo', e.target.value)} placeholder="80.000" />

          <label style={s.label}>Un día normal *</label>
          <span style={s.sublabel}>Un día típico de la semana</span>
          <input style={s.input} type="number" value={datos.ventas_dia_normal} onChange={e => set('ventas_dia_normal', e.target.value)} placeholder="180.000" />

          <label style={s.label}>Un día bueno *</label>
          <span style={s.sublabel}>Fin de semana, quincena, temporada alta</span>
          <input style={s.input} type="number" value={datos.ventas_dia_bueno} onChange={e => set('ventas_dia_bueno', e.target.value)} placeholder="350.000" />

          {datos.ventas_dia_normal && (
            <div style={s.calc}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#1D9E75', marginBottom: '8px' }}>Con estas ventas, en un día normal:</div>
              <div style={s.calcRow}><span>Ventas del día</span><span>${fmt(datos.ventas_dia_normal)}</span></div>
              <div style={s.calcRow}><span>- Costo del producto ({(100 - margenPct())}%)</span><span>-${fmt(parseFloat(datos.ventas_dia_normal) * (1 - margenPct() / 100))}</span></div>
              <div style={s.calcRow}><span>- Gastos fijos del día</span><span>-${fmt(fijoDia())}</span></div>
              <div style={s.calcTotal}>
                <span>Excedente al inversionista</span>
                <span style={{ color: excedenteDia(datos.ventas_dia_normal) > 0 ? '#1D9E75' : '#E05555' }}>
                  {excedenteDia(datos.ventas_dia_normal) > 0 ? `$${fmt(excedenteDia(datos.ventas_dia_normal))}` : 'Sin excedente'}
                </span>
              </div>
              {capitalTotal() > 0 && excedenteDia(datos.ventas_dia_normal) > 0 && (
                <div style={{ fontSize: '0.75rem', color: '#8FA3CC', marginTop: '6px', padding: '6px 0', borderTop: '1px solid rgba(29,158,117,0.2)' }}>
                  Tiempo estimado para pagar el capital: ~{Math.ceil(capitalTotal() / excedenteDia(datos.ventas_dia_normal))} días hábiles ({Math.ceil(capitalTotal() / excedenteDia(datos.ventas_dia_normal) / 26)} meses aprox.)
                </div>
              )}
              {excedenteDia(datos.ventas_dia_flojo) < 0 && datos.ventas_dia_flojo && (
                <div style={{ fontSize: '0.75rem', color: '#E8A020', marginTop: '6px', padding: '6px 0', borderTop: '1px solid rgba(232,160,32,0.2)' }}>
                  En un día flojo (${fmt(datos.ventas_dia_flojo)}) no hay excedente. Ese día no pagas al inversionista — el déficit se acumula para el día siguiente.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── PASO 6: Compromisos ── */}
      {paso === 6 && (
        <div>
          <div style={s.titulo}>Lee esto con cuidado — es un compromiso real</div>
          <div style={{ fontSize: '0.8rem', color: '#8FA3CC', marginBottom: '1.25rem', lineHeight: '1.6' }}>
            Estos son los compromisos que adquieres con el inversionista. Están escritos en lenguaje claro para que no haya malentendidos.
          </div>

          {/* DEUDA FORMAL */}
          {capitalTotal() > 0 && (
            <div style={{ background: 'rgba(74,144,217,0.08)', border: '2px solid rgba(74,144,217,0.3)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#4A90D9', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Documento de deuda</div>
              <div style={{ fontSize: '0.9rem', color: '#fff', lineHeight: '1.7', marginBottom: '0.875rem' }}>
                Al recibir el fondeo, <strong>adquieres una deuda formal</strong> con el inversionista por:
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.875rem 1rem', marginBottom: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#8FA3CC', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '4px', paddingBottom: '6px' }}>
                  <span>Depósito ({datos.meses_deposito} mes{parseInt(datos.meses_deposito) > 1 ? 'es' : ''})</span>
                  <span>${fmt(parseFloat(datos.canon_mensual || 0) * parseInt(datos.meses_deposito))}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#8FA3CC', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                  <span>Primer mes de arriendo (incluido en el contrato)</span>
                  <span>${fmt(datos.canon_mensual || 0)}</span>
                </div>
                {datos.necesita_adecuacion && datos.presupuesto_adecuacion && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#8FA3CC', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                    <span>Adecuaciones del local</span>
                    <span>${fmt(datos.presupuesto_adecuacion)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '700', color: '#fff', padding: '8px 0 3px' }}>
                  <span>Capital total de la deuda</span>
                  <span style={{ color: '#4A90D9' }}>${fmt(capitalTotal())}</span>
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#8FA3CC', lineHeight: '1.65' }}>
                Esta deuda genera <strong style={{ color: '#fff' }}>intereses diarios</strong> sobre el saldo pendiente a la tasa que se asigne según tu estudio de crédito (entre la usura convencional y la usura de plataformas digitales). La deuda queda registrada en Escala y en el contrato firmado entre las partes. Se extingue completamente cuando termines de pagar el capital más los intereses acumulados.
              </div>
            </div>
          )}

          <div style={s.obligatorio}>
            <div style={s.obligatorioTitulo}>🔒 Obligatorio — reporte diario de ventas</div>
            <div style={s.obligatorioTexto}>
              Cada noche, antes de cerrar, reportas en la app cuánto vendiste ese día — en efectivo y por BREB. Si un día no puedes reportar, tienes 24 horas para hacerlo. Si llevas 3 días sin reportar, el inversionista recibe una alerta automática.
            </div>
          </div>

          <div style={s.obligatorio}>
            <div style={s.obligatorioTitulo}>🔒 Obligatorio — pago diario del excedente</div>
            <div style={s.obligatorioTexto}>
              Con lo que reportas cada día, Escala calcula lo que le corresponde al inversionista: primero se pagan los intereses del día sobre el saldo pendiente de la deuda, y lo que sobre abona al capital. El pago lo haces vía BREB al número que te indique la plataforma.
            </div>
          </div>

          <div style={s.obligatorio}>
            <div style={s.obligatorioTitulo}>🔒 Obligatorio — mantener informado el tipo de negocio</div>
            <div style={s.obligatorioTexto}>
              Le dices a Escala qué negocio tienes. Si cambias de actividad, lo actualizas en la plataforma. No controlamos lo que vendes — solo necesitamos saber el tipo de negocio para ayudarte mejor.
            </div>
          </div>

          {/* Opcion de salida */}
          {totalArriendosAnio() > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.875rem 1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>Tu opción de salida anticipada</div>
              <div style={{ fontSize: '0.78rem', color: '#8FA3CC', lineHeight: '1.6', marginBottom: '0.75rem' }}>
                Si en algún momento quieres quedar libre de todos los compromisos, puedes pagar de una sola vez:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(224,85,85,0.06)', border: '1px solid rgba(224,85,85,0.2)', borderRadius: '8px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#E05555', fontWeight: '700', marginBottom: '4px' }}>Mientras pagas el capital</div>
                  <div style={{ fontSize: '0.72rem', color: '#C8D4E8', marginBottom: '4px' }}>Tasa pactada pendiente + 4% del total de arriendos del año</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>+ ${fmt(totalArriendosAnio() * 0.04)}</div>
                </div>
                <div style={{ background: 'rgba(232,160,32,0.06)', border: '1px solid rgba(232,160,32,0.2)', borderRadius: '8px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#E8A020', fontWeight: '700', marginBottom: '4px' }}>Durante la regalía</div>
                  <div style={{ fontSize: '0.72rem', color: '#C8D4E8', marginBottom: '4px' }}>Tasa pactada pendiente + 8% del total de arriendos del año</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>+ ${fmt(totalArriendosAnio() * 0.08)}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '0.5rem' }}>
                Total arriendos del año: ${fmt(totalArriendosAnio())} (12 meses × ${fmt(datos.canon_mensual)})
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.875rem', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', cursor: 'pointer', background: datos.acepta_compromisos ? 'rgba(29,158,117,0.08)' : 'rgba(255,255,255,0.03)' }} onClick={() => set('acepta_compromisos', !datos.acepta_compromisos)}>
            <div style={{ width: '20px', height: '20px', border: `2px solid ${datos.acepta_compromisos ? '#1D9E75' : 'rgba(255,255,255,0.3)'}`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', background: datos.acepta_compromisos ? '#1D9E75' : 'transparent' }}>
              {datos.acepta_compromisos && <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: '700' }}>✓</span>}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#fff', lineHeight: '1.5' }}>
              Entendí todo lo anterior. Acepto la deuda de <strong style={{ color: '#4A90D9' }}>${fmt(capitalTotal())}</strong> con el inversionista, los intereses diarios, el reporte diario de ventas y el pago del excedente vía BREB.
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && <div style={{ fontSize: '0.8rem', color: '#E05555', marginTop: '1rem', padding: '0.75rem', background: 'rgba(224,85,85,0.08)', borderRadius: '8px', border: '1px solid rgba(224,85,85,0.2)' }}>{error}</div>}

      {/* Botones */}
      <div style={s.btnRow}>
        <button style={s.btnCancel} onClick={() => {
          setError('')
          if (paso === 1) onCancelar()
          else setPaso(p => p - 1)
        }}>
          {paso === 1 ? 'Cancelar' : '← Atrás'}
        </button>
        {paso < 6 ? (
          <button style={s.btn} onClick={() => {
            setError('')
            if (paso === 1 && !datos.nombre_negocio.trim()) { setError('Escribe el nombre de tu negocio'); return }
            if (paso === 1 && !datos.tipo_negocio) { setError('Selecciona qué vas a vender'); return }
            if (paso === 1 && !datos.ciudad.trim()) { setError('Escribe la ciudad del negocio'); return }
            if (paso === 2 && !datos.direccion_local.trim()) { setError('Escribe la dirección del local'); return }
            if (paso === 2 && !datos.propietario_nombre.trim()) { setError('Escribe el nombre del propietario'); return }
            if (paso === 2 && !datos.propietario_telefono.trim()) { setError('Escribe el teléfono del propietario'); return }
            if (paso === 2 && !datos.canon_mensual) { setError('Escribe el valor del arriendo mensual'); return }
            if (paso === 3 && !datos.costo_servicios) { setError('Escribe el costo de servicios públicos'); return }
            if (paso === 4 && !datos.costo_producto) { setError('Escribe el costo de tu producto'); return }
            if (paso === 4 && !datos.precio_venta) { setError('Escribe el precio de venta'); return }
            if (paso === 4 && parseFloat(datos.precio_venta) <= parseFloat(datos.costo_producto)) { setError('El precio de venta debe ser mayor que el costo'); return }
            if (paso === 5 && !datos.ventas_dia_normal) { setError('Escribe cuánto vendes en un día normal'); return }
            setPaso(p => p + 1)
          }}>
            Siguiente →
          </button>
        ) : (
          <button style={{ ...s.btnVerde, opacity: datos.acepta_compromisos ? 1 : 0.5, cursor: datos.acepta_compromisos ? 'pointer' : 'not-allowed' }} onClick={() => {
            if (!datos.acepta_compromisos) { setError('Debes aceptar los compromisos para continuar'); return }
            onPublicar(datos)
          }}>
            Enviar a verificación →
          </button>
        )}
      </div>
    </div>
  )
}

// ── FIN WIZARD LOCAL COMERCIAL ────────────────────────────────────────────────

const sectores = ['Tecnología','Salud','Educación','Agro','Comercio','Servicios','Construcción','Alimentos','Moda','Otro']

const NIVELES_AVANCE = [
  { id: 'tengo_la_idea',      emoji: '💡', label: 'Tengo la idea',      desc: 'Sé qué quiero hacer pero aún no he empezado' },
  { id: 'ya_empece',          emoji: '🔧', label: 'Ya empecé',          desc: 'Tengo algo funcionando, aunque sea pequeño' },
  { id: 'tengo_clientes',     emoji: '🤝', label: 'Tengo clientes',     desc: 'Ya hay personas pagando o usando lo que ofrezco' },
  { id: 'necesito_crecer',    emoji: '📈', label: 'Necesito crecer',    desc: 'El negocio funciona pero me falta capital o equipo' },
  { id: 'quiero_transformar', emoji: '🔄', label: 'Quiero transformar', desc: 'Tengo una empresa y necesito cambiar algo' },
]

const MODALIDADES = [
  { id: 'remoto',     emoji: '🌐', label: 'Remoto' },
  { id: 'presencial', emoji: '📍', label: 'Presencial' },
  { id: 'hibrido',    emoji: '🔀', label: 'Híbrido' },
]

const ROLES_DISPONIBLES = [
  { id: 'Capitalista',    emoji: '💰' },
  { id: 'Cofundador',     emoji: '🤝' },
  { id: 'Desarrollador',  emoji: '💻' },
  { id: 'Diseñador',      emoji: '🎨' },
  { id: 'Contador',       emoji: '📊' },
  { id: 'Abogado',        emoji: '⚖️' },
  { id: 'Marketing',      emoji: '📣' },
  { id: 'Ventas',         emoji: '🎯' },
  { id: 'Otro',           emoji: '➕' },
]
const INDUSTRIAS_LIST = ['Restaurante','Retail','Servicios Profesionales','Tecnología','Comercio Electrónico']
const PAISES_LIST = [
  { nombre: 'Colombia', bandera: '🇨🇴' }, { nombre: 'México', bandera: '🇲🇽' },
  { nombre: 'Perú', bandera: '🇵🇪' }, { nombre: 'Chile', bandera: '🇨🇱' },
  { nombre: 'Argentina', bandera: '🇦🇷' }, { nombre: 'España', bandera: '🇪🇸' },
  { nombre: 'Estados Unidos', bandera: '🇺🇸' },
]

export default function Proyectos() {
  const [usuario, setUsuario] = useState(null)
  const [proyectos, setProyectos] = useState([])
  const [vista, setVista] = useState('lista')
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [eliminando, setEliminando] = useState(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState(null)
  const [proyectosConEquipo, setProyectosConEquipo] = useState({}) // { [id]: true/false }
  const [mensaje, setMensaje] = useState('')
  const [paisesDB, setPaisesDB] = useState([])
  const [nuevoPaisNombre, setNuevoPaisNombre] = useState('')
  const [mostrarNuevoPais, setMostrarNuevoPais] = useState(false)
  const [creandoPais, setCreandoPais] = useState(false)
  const [form, setForm] = useState({
    nombre: '', descripcion: '', tipo: 'A', sector: '', ciudad: '', industria: '', pais: '', estado_financiacion: 'riesgo_compartido', nivel_avance: '', modalidad_trabajo: '', roles_buscados: [], mostrar_guia: false, guia_que: '', guia_problema: '', guia_quien: '', paso: 1, escenario: ''
  })

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)
      const [pRes, paisRes] = await Promise.all([
        fetch('/api/proyectos'),
        fetch('/api/paises')
      ])
      const data = await pRes.json()
      const pData = await paisRes.json()
      const ps = data.proyectos || []
      setProyectos(ps)
      setPaisesDB(pData.paises || [])
      // Para cada proyecto del usuario, verificar si tiene postulaciones aceptadas
      if (user) {
        const miosIds = ps.filter(p => p.fundador_id === user.id).map(p => p.id)
        const checks = await Promise.all(miosIds.map(async pid => {
          try {
            const r = await fetch(`/api/proyectos/${pid}?check_equipo=1&fundador_id=${user.id}`)
            const d = await r.json()
            return [pid, d.tiene_equipo || false]
          } catch { return [pid, false] }
        }))
        setProyectosConEquipo(Object.fromEntries(checks))
      }
      setCargando(false)
    }
    cargar()
  }, [])

  function actualizar(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }))
  }

  function toggleRol(rol) {
    setForm(f => {
      const ya = f.roles_buscados.includes(rol)
      return { ...f, roles_buscados: ya ? f.roles_buscados.filter(r => r !== rol) : [...f.roles_buscados, rol] }
    })
  }

  function mejorarConIA() {
    setForm(f => ({ ...f, mostrar_guia: !f.mostrar_guia }))
  }

  function construirDescripcion() {
    const { guia_que, guia_problema, guia_quien } = form
    if (!guia_que && !guia_problema && !guia_quien) return
    const partes = []
    if (guia_que) partes.push(guia_que.trim())
    if (guia_problema) partes.push('Resuelve ' + guia_problema.trim().replace(/^resuelve\s+/i, ''))
    if (guia_quien) partes.push('Dirigido a ' + guia_quien.trim().replace(/^dirigido a\s+/i, ''))
    const descripcion = partes.join('. ') + '.'
    setForm(f => ({ ...f, descripcion, mostrar_guia: false, guia_que: '', guia_problema: '', guia_quien: '' }))
  }

  async function crearNuevoPais() {
    const nombre = nuevoPaisNombre.trim()
    if (!nombre) { alert('Escribe el nombre del país'); return }
    setCreandoPais(true)
    try {
      const res = await fetch('/api/paises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, bandera: '🌐', tipo_origen: 'fundador', creado_por: usuario?.id, creado_por_nombre: usuario?.user_metadata?.nombre || usuario?.email })
      })
      const data = await res.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setPaisesDB(prev => [...prev.filter(p => p.nombre !== data.pais.nombre), data.pais].sort((a,b) => a.nombre.localeCompare(b.nombre)))
        actualizar('pais', data.pais.nombre)
        setNuevoPaisNombre('')
        setMostrarNuevoPais(false)
      }
    } catch(e) {
      alert('Error de conexión: ' + e.message)
    }
    setCreandoPais(false)
  }

  async function eliminarProyecto(proyectoId) {
    setEliminando(proyectoId)
    try {
      const res = await fetch(`/api/proyectos/${proyectoId}?fundador_id=${usuario.id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.error) {
        if (data.codigo === 'tiene_aceptados') {
          alert('No puedes eliminar este proyecto — ya hay personas aceptadas en algún rol.')
        } else {
          alert('Error: ' + data.error)
        }
      } else {
        setProyectos(prev => prev.filter(p => p.id !== proyectoId))
      }
    } catch (e) {
      alert('Error de conexión: ' + e.message)
    }
    setEliminando(null)
    setConfirmarEliminar(null)
  }

  async function publicar() {
    if (!form.nombre.trim()) {
      setMensaje('El nombre del proyecto es obligatorio')
      return
    }
    if (!form.descripcion.trim()) {
      setMensaje('La descripción es obligatoria — explica qué hace tu proyecto')
      return
    }
    if (form.descripcion.trim().length < 80) {
      setMensaje('La descripción es muy corta. Explica qué hace el proyecto, qué problema resuelve y a quién va dirigido. Mínimo 80 caracteres.')
      return
    }
    if (!form.sector) {
      setMensaje('Selecciona el sector del proyecto')
      return
    }
    if (!form.pais) {
      setMensaje('El país es obligatorio — define dónde opera el proyecto')
      return
    }
    setEnviando(true)
    setMensaje('')

    const res = await fetch('/api/proyectos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, fundador_id: usuario.id, estado: 'activo' })
    })
    const data = await res.json()

    if (data.error) {
      setMensaje('Error: ' + data.error)
    } else {
      const pid = data.proyecto.id

      // Cargar tareas regulatorias por país automáticamente
      if (form.pais) {
        await fetch('/api/tareas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proyecto_id: pid, inicializar_pais: true, pais: form.pais, creado_por: usuario.id })
        })
        // Cargar costos predefinidos por país automáticamente
        await fetch('/api/costos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inicializar_pais: true, proyecto_id: pid, pais: form.pais, creado_por: usuario.id })
        })
      }

      // Cargar tareas comerciales por industria automáticamente
      if (form.industria) {
        await fetch('/api/tareas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proyecto_id: pid, inicializar_industria: true, industria: form.industria, creado_por: usuario.id })
        })
      }

      setProyectos(p => [data.proyecto, ...p])
      setVista('lista')
      setForm({ nombre: '', descripcion: '', tipo: 'A', sector: '', ciudad: '', industria: '', pais: '', estado_financiacion: 'riesgo_compartido', nivel_avance: '', modalidad_trabajo: '', roles_buscados: [], mostrar_guia: false, guia_que: '', guia_problema: '', guia_quien: '', escenario: '' })
    }
    setEnviando(false)
  }

  const s = {
    wrap: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter, sans-serif' },
    nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    logo: { fontSize: '1.1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em' },
    logoSpan: { color: '#1D9E75' },
    navLinks: { display: 'flex', gap: '1.5rem', alignItems: 'center' },
    navLink: { color: '#8FA3CC', fontSize: '0.82rem', textDecoration: 'none', cursor: 'pointer' },
    navLinkAct: { color: '#fff', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none' },
    main: { maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.25rem' },
    header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
    h1: { fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', marginBottom: '0.3rem' },
    sub: { fontSize: '0.85rem', color: '#8FA3CC' },
    btnNew: { background: '#1D9E75', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' },
    form: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '2rem' },
    formTitle: { fontSize: '1.1rem', fontWeight: '800', color: '#fff', marginBottom: '0.3rem' },
    formSub: { fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '2rem' },
    label: { display: 'block', fontSize: '0.72rem', fontWeight: '600', color: '#8FA3CC', marginBottom: '0.4rem', letterSpacing: '0.04em', textTransform: 'uppercase' },
    input: { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '1.25rem', fontFamily: 'Inter, sans-serif' },
    textarea: { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '1.25rem', fontFamily: 'Inter, sans-serif', resize: 'vertical', minHeight: '100px' },
    select: { width: '100%', background: '#1a2a4a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '1.25rem', fontFamily: 'Inter, sans-serif' },
    tipoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' },
    tipoCard: (act) => ({ background: act ? 'rgba(29,158,117,0.15)' : 'rgba(255,255,255,0.04)', border: act ? '2px solid #1D9E75' : '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '1rem', cursor: 'pointer' }),
    tipoLabel: { fontSize: '0.875rem', fontWeight: '700', color: '#fff', marginBottom: '0.2rem' },
    tipoDesc: { fontSize: '0.75rem', color: '#8FA3CC' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    btnRow: { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' },
    btn: { flex: 1, background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.875rem', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
    btnCancel: { background: 'transparent', color: '#8FA3CC', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.875rem 1.5rem', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
    error: { background: 'rgba(216,90,48,0.1)', border: '1px solid rgba(216,90,48,0.3)', borderRadius: '8px', padding: '0.875rem', color: '#D85A30', fontSize: '0.82rem', marginTop: '1rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '1.25rem' },
    card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.2s' },
    cardTop: { background: '#0A1530', padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' },
    cardTipo: { fontSize: '0.62rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '0.5rem' },
    cardNombre: { fontSize: '1rem', fontWeight: '800', color: '#fff', marginBottom: '0.2rem' },
    cardSector: { fontSize: '0.72rem', color: '#8FA3CC' },
    cardBody: { padding: '1.25rem' },
    cardDesc: { fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6', marginBottom: '1rem' },
    cardBadge: { display: 'inline-block', fontSize: '0.68rem', fontWeight: '700', padding: '0.2rem 0.75rem', borderRadius: '20px', background: 'rgba(29,158,117,0.15)', color: '#1D9E75', border: '1px solid rgba(29,158,117,0.3)' },
    empty: { background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '12px', padding: '3rem', textAlign: 'center' },
    emptyIcon: { fontSize: '2.5rem', marginBottom: '1rem' },
    emptyTitle: { fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' },
    emptyDesc: { fontSize: '0.85rem', color: '#8FA3CC', marginBottom: '1.5rem', lineHeight: '1.6' },
    loading: { minHeight: '100vh', background: '#0D1B3E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8FA3CC', fontFamily: 'Inter, sans-serif' },
  }

  if (cargando) return <div style={s.loading}>Cargando proyectos...</div>

  return (
    <div style={s.wrap}>
      <NavApp paginaActual="proyectos" />

      <main style={s.main}>
        {vista === 'lista' && (
          <>
            <div style={s.header}>
              <div>
                <h1 style={s.h1}>Proyectos en Escala</h1>
                <p style={s.sub}>{proyectos.length} proyecto{proyectos.length !== 1 ? 's' : ''} activo{proyectos.length !== 1 ? 's' : ''}</p>
              </div>
              <button style={s.btnNew} onClick={() => setVista('nuevo')}>+ Publicar proyecto</button>
            </div>

            {proyectos.length === 0 ? (
              <div style={s.empty}>
                <div style={s.emptyIcon}>🚀</div>
                <div style={s.emptyTitle}>Sé el primero en publicar</div>
                <div style={s.emptyDesc}>Aún no hay proyectos en Escala. Publica el tuyo y empieza a formar el equipo.</div>
                <button style={s.btnNew} onClick={() => setVista('nuevo')}>+ Publicar mi proyecto</button>
              </div>
            ) : (
              <div style={s.grid}>
                {proyectos.map(p => (
                  <div key={p.id} style={s.card}>
                    <div style={{...s.cardTop, cursor:'pointer'}} onClick={() => window.location.href="/proyectos/"+p.id}>
                      <div style={s.cardTipo}>Tipo {p.tipo} — {p.tipo === 'A' ? 'Creación' : 'Transformación'}</div>
                      <div style={s.cardNombre}>{p.nombre}</div>
                      <div style={s.cardSector}>{p.sector} · {p.ciudad}</div>
                    </div>
                    <div style={s.cardBody}>
                      <div style={s.cardDesc}>{p.descripcion}</div>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'0.5rem'}}>
                        <span style={s.cardBadge}>● {p.estado}</span>
                        {p.fundador_id === usuario?.id && !proyectosConEquipo[p.id] && (
                          confirmarEliminar === p.id ? (
                            <div style={{display:'flex',gap:'0.4rem',alignItems:'center'}}>
                              <span style={{fontSize:'0.72rem',color:'#E85A20'}}>¿Eliminar?</span>
                              <button onClick={e => { e.stopPropagation(); eliminarProyecto(p.id) }} disabled={eliminando===p.id} style={{background:'#E85A20',color:'#fff',border:'none',borderRadius:'6px',padding:'0.25rem 0.6rem',fontSize:'0.72rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                                {eliminando===p.id ? '...' : 'Sí, eliminar'}
                              </button>
                              <button onClick={e => { e.stopPropagation(); setConfirmarEliminar(null) }} style={{background:'rgba(255,255,255,0.08)',color:'#8FA3CC',border:'none',borderRadius:'6px',padding:'0.25rem 0.6rem',fontSize:'0.72rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button onClick={e => { e.stopPropagation(); setConfirmarEliminar(p.id) }} style={{background:'none',color:'#E85A20',border:'1px solid rgba(232,90,32,0.25)',borderRadius:'6px',padding:'0.25rem 0.6rem',fontSize:'0.72rem',cursor:'pointer',fontFamily:'Inter,sans-serif',opacity:'0.7'}}>
                              Eliminar
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {vista === 'nuevo' && (
          <div style={s.form}>

            {/* WIZARD LOCAL COMERCIAL — flujo separado y completo */}
            {form.escenario === 'local_comercial' ? (
              <WizardLocalComercial
                onCancelar={() => { actualizar('escenario', ''); setVista('nuevo') }}
                onPublicar={async (datosLocal) => {
                  try {
                    const { data: { session } } = await supabase.auth.getSession()
                    if (!session) { alert('Sesión expirada. Vuelve a iniciar sesión.'); return }
                    const res = await fetch('/api/local-comercial', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                      body: JSON.stringify(datosLocal),
                    })
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error || 'Error al guardar')
                    window.location.href = `/proyectos/local-en-verificacion?id=${data.proyecto_id}&capital=${data.capital_total}`
                  } catch (err) {
                    alert('Error: ' + err.message)
                  }
                }}
              />
            ) : (

            <>
            {/* Indicador de pasos */}
            <div style={{display:'flex',gap:'0.5rem',alignItems:'center',marginBottom:'1.25rem'}}>
              {[1,2].map(p => (
                <div key={p} style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                  <div style={{width:'28px',height:'28px',borderRadius:'50%',background:form.paso >= p ? '#1D9E75' : 'rgba(255,255,255,0.1)',color:form.paso >= p ? '#fff' : '#8FA3CC',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.78rem',fontWeight:'700'}}>{form.paso > p ? '✓' : p}</div>
                  <span style={{fontSize:'0.75rem',color:form.paso >= p ? '#fff' : '#6B7280',fontWeight:form.paso === p ? '700' : '400'}}>{p === 1 ? 'Lo básico' : 'El equipo'}</span>
                  {p < 2 && <div style={{width:'24px',height:'1px',background:'rgba(255,255,255,0.15)'}}></div>}
                </div>
              ))}
            </div>
            <div style={s.formTitle}>{form.paso === 1 ? 'Cuéntanos sobre tu proyecto' : '¿Qué perfiles necesitas?'}</div>
            <div style={s.formSub}>Define tu proyecto y lo que necesitas. Aparecerá en el directorio para que especialistas y capitalistas puedan postularse.</div>

            <label style={s.label} htmlFor="py-nombre">Nombre del proyecto *</label>
            <input id="py-nombre" style={s.input} value={form.nombre} onChange={e => actualizar('nombre', e.target.value)} placeholder="Ej: VetApp, Ekivibe, POS Restaurantes..." />

            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.4rem'}}>
              <label style={{...s.label,marginBottom:0}} htmlFor="py-descripcion">Descripción *</label>
              <button type="button" onClick={mejorarConIA} style={{background:'rgba(29,158,117,0.15)',border:'1px solid rgba(29,158,117,0.3)',borderRadius:'6px',padding:'0.3rem 0.7rem',fontSize:'0.72rem',fontWeight:'700',color:'#1D9E75',cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap'}}>
                {form.mostrar_guia ? '✕ Cerrar guía' : '✍️ Guía para escribir'}
              </button>
            </div>
            <textarea id="py-descripcion" style={s.textarea} value={form.descripcion} onChange={e => actualizar('descripcion', e.target.value)} placeholder="Ejemplo: VetApp es una plataforma para clínicas veterinarias en Colombia que automatiza la historia clínica de mascotas, recordatorios de vacunas y pagos. Resuelve el caos de los registros en papel que sufren el 80% de las clínicas pequeñas." rows={5} />
            <div style={{fontSize:'0.72rem',marginTop:'-1rem',marginBottom:'1.25rem',display:'flex',justifyContent:'space-between'}}>
              <span style={{color: form.descripcion.length < 80 ? '#E85A20' : '#1D9E75'}}>
                {form.descripcion.length < 80
                  ? `Muy corta — faltan ${80 - form.descripcion.length} caracteres mínimo`
                  : `✓ Buena longitud (${form.descripcion.length} caracteres)`}
              </span>
              <span style={{color:'#8FA3CC'}}>{form.descripcion.length} / 500</span>
            </div>

            {form.mostrar_guia && (
              <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.25rem',marginBottom:'1.25rem'}}>
                <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#1D9E75',marginBottom:'1rem'}}>Responde estas 3 preguntas y armamos la descripción por ti:</div>

                <label style={{...s.label}}>¿Qué hace exactamente tu proyecto?</label>
                <input style={{...s.input,marginBottom:'0.75rem'}} value={form.guia_que} onChange={e => actualizar('guia_que', e.target.value)} placeholder='Ej: Vendemos galletas naturales para caballos hechas con ingredientes colombianos' />

                <label style={{...s.label}}>¿Qué problema resuelve?</label>
                <input style={{...s.input,marginBottom:'0.75rem'}} value={form.guia_problema} onChange={e => actualizar('guia_problema', e.target.value)} placeholder='Ej: No hay snacks saludables para caballos en el mercado colombiano' />

                <label style={{...s.label}}>¿A quién va dirigido?</label>
                <input style={{...s.input,marginBottom:'1rem'}} value={form.guia_quien} onChange={e => actualizar('guia_quien', e.target.value)} placeholder='Ej: Dueños de caballos, criaderos y clubes ecuestres' />

                <button type="button" onClick={construirDescripcion} style={{background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.6rem 1.25rem',fontSize:'0.82rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                  Generar descripción →
                </button>
              </div>
            )}

            <label style={s.label}>¿Qué tipo de proyecto vas a publicar? *</label>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.75rem',marginBottom:'1.25rem'}}>
              {[
                {
                  id: 'startup',
                  icon: '💡',
                  titulo: 'Startup o empresa',
                  desc: 'Tienes una idea, un producto digital, un servicio o una empresa que quieres hacer crecer con un equipo.',
                  badge: 'Equity diferido',
                  badgeColor: '#1D9E75',
                },
                {
                  id: 'local_comercial',
                  icon: '🏪',
                  titulo: 'Negocio en un local',
                  desc: 'Quieres montar una tienda, restaurante, frutería, almacén de ropa u otro negocio de venta de productos y necesitas financiar el arriendo del local — deposito, mensualidades del contrato y adecuaciones.',
                  badge: 'Fondeo Escala',
                  badgeColor: '#4A90D9',
                  destacado: true,
                },
                {
                  id: 'otro',
                  icon: '📦',
                  titulo: 'Otro proyecto',
                  desc: 'Importación, compra de vehículo, maquinaria u otro tipo de proyecto que necesita capital específico.',
                  badge: 'Capital de trabajo',
                  badgeColor: '#E8A020',
                },
              ].map(op => (
                <div
                  key={op.id}
                  onClick={() => actualizar('escenario', op.id)}
                  style={{
                    cursor: 'pointer',
                    border: form.escenario === op.id
                      ? `2px solid ${op.badgeColor}`
                      : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '1rem',
                    background: form.escenario === op.id
                      ? `rgba(${op.id === 'startup' ? '29,158,117' : op.id === 'local_comercial' ? '74,144,217' : '232,160,32'},0.08)`
                      : 'rgba(255,255,255,0.03)',
                    transition: 'all 0.15s',
                    position: 'relative',
                  }}
                >
                  {op.destacado && (
                    <div style={{position:'absolute',top:'-10px',left:'50%',transform:'translateX(-50%)',background:op.badgeColor,color:'#fff',fontSize:'0.6rem',fontWeight:'700',padding:'2px 10px',borderRadius:'20px',whiteSpace:'nowrap'}}>NUEVO</div>
                  )}
                  <div style={{fontSize:'1.75rem',marginBottom:'0.5rem'}}>{op.icon}</div>
                  <div style={{fontSize:'0.88rem',fontWeight:'700',color:'#fff',marginBottom:'0.4rem'}}>{op.titulo}</div>
                  <div style={{fontSize:'0.75rem',color:'#8FA3CC',lineHeight:'1.5',marginBottom:'0.75rem'}}>{op.desc}</div>
                  <span style={{fontSize:'0.65rem',fontWeight:'700',background:`rgba(${op.id === 'startup' ? '29,158,117' : op.id === 'local_comercial' ? '74,144,217' : '232,160,32'},0.15)`,color:op.badgeColor,padding:'2px 8px',borderRadius:'20px'}}>{op.badge}</span>
                </div>
              ))}
            </div>

            {form.escenario === 'local_comercial' && (
              <div style={{background:'rgba(74,144,217,0.08)',border:'1px solid rgba(74,144,217,0.25)',borderRadius:'12px',padding:'1rem 1.25rem',marginBottom:'1.25rem'}}>
                <div style={{fontSize:'0.82rem',fontWeight:'700',color:'#4A90D9',marginBottom:'0.5rem'}}>🏪 Negocio en local — cómo funciona el fondeo</div>
                <div style={{fontSize:'0.78rem',color:'#8FA3CC',lineHeight:'1.6'}}>
                  Escala financia el depósito y los meses de arriendo del contrato. Cada mes de arriendo queda registrado como parte de tu deuda con el inversionista. Cada día que tengas ventas, pagas primero los intereses del día y luego abonas al capital. Cuando termines de pagar, el negocio es tuyo. El wizard te guía paso a paso — no necesitas saber de finanzas.
                </div>
                <div style={{marginTop:'0.75rem',fontSize:'0.75rem',color:'#4A90D9',fontWeight:'600'}}>
                  Este tipo de proyecto tiene un wizard especial en el siguiente paso →
                </div>
              </div>
            )}

            <label style={s.label}>Tipo de proyecto *</label>
            <div style={s.tipoGrid}>
              <div style={s.tipoCard(form.tipo === 'A')} onClick={() => actualizar('tipo', 'A')}>
                <div style={s.tipoLabel}>Tipo A — Creación</div>
                <div style={s.tipoDesc}>Empresa nueva que busca equipo y capital</div>
              </div>
              <div style={s.tipoCard(form.tipo === 'B')} onClick={() => actualizar('tipo', 'B')}>
                <div style={s.tipoLabel}>Tipo B — Transformación</div>
                <div style={s.tipoDesc}>Empresa existente con una brecha específica</div>
              </div>
            </div>

            <label style={s.label}>¿El proyecto tiene recursos para esta etapa inicial? *</label>
            <div style={s.tipoGrid}>
              <div style={s.tipoCard(form.estado_financiacion === 'con_recursos')} onClick={() => actualizar('estado_financiacion', 'con_recursos')}>
                <div style={s.tipoLabel}>Con Recursos para Etapa Inicial</div>
                <div style={s.tipoDesc}>Hay fondos reales para pagar en efectivo lo que se acuerde con cada especialista</div>
              </div>
              <div style={s.tipoCard(form.estado_financiacion === 'riesgo_compartido')} onClick={() => actualizar('estado_financiacion', 'riesgo_compartido')}>
                <div style={s.tipoLabel}>Riesgo Compartido</div>
                <div style={s.tipoDesc}>Todavía no hay fondos — el pago queda en acciones o como deuda de la empresa, condicionado a que el proyecto genere valor</div>
              </div>
            </div>

            <div style={s.row}>
              <div>
                <label style={s.label} htmlFor="py-sector">Sector *</label>
                <select id="py-sector" style={s.select} value={form.sector} onChange={e => actualizar('sector', e.target.value)}>
                  <option value="">Selecciona...</option>
                  {sectores.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label} htmlFor="py-ciudad">Ciudad</label>
                <input id="py-ciudad" style={s.input} value={form.ciudad} onChange={e => actualizar('ciudad', e.target.value)} placeholder="Medellín, Bogotá..." />
              </div>
            </div>

            <div style={s.row}>
              <div>
                <label style={s.label} htmlFor="py-pais">País del proyecto</label>
                <select id="py-pais" style={s.select} value={form.pais} onChange={e => { if(e.target.value==='__nuevo__'){setMostrarNuevoPais(true)}else{actualizar('pais',e.target.value);setMostrarNuevoPais(false)} }}>
                  <option value="">Selecciona país...</option>
                  {paisesDB.map(p => <option key={p.nombre} value={p.nombre}>{p.bandera||'🌐'} {p.nombre}</option>)}
                  <option value="__nuevo__">+ Mi país no está en la lista</option>
                </select>
                {mostrarNuevoPais && (
                  <div style={{display:'flex',gap:'0.5rem',marginTop:'-0.75rem',marginBottom:'0.75rem'}}>
                    <input type="text" value={nuevoPaisNombre} onChange={e=>setNuevoPaisNombre(e.target.value)} placeholder="Nombre del país (ej: Brasil)" style={{flex:1,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.5rem 0.875rem',color:'#fff',fontSize:'0.82rem',outline:'none',fontFamily:'Inter,sans-serif'}} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); crearNuevoPais(); } }} />
                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); crearNuevoPais(); }} disabled={creandoPais} style={{background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.5rem 1.25rem',fontSize:'0.78rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>{creandoPais?'Creando...':'Agregar país'}</button>
                  </div>
                )}
                {form.pais && form.pais!=='__nuevo__' && <div style={{fontSize:'0.7rem',color:'#1D9E75',marginTop:'-0.5rem',marginBottom:'0.875rem'}}>✓ Se cargarán las tareas regulatorias de {form.pais} al crear</div>}
              </div>
              <div>
                <label style={s.label} htmlFor="py-industria">Industria (opcional)</label>
                <select id="py-industria" style={s.select} value={form.industria} onChange={e => actualizar('industria', e.target.value)}>
                  <option value="">Selecciona industria...</option>
                  {INDUSTRIAS_LIST.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                {form.industria && <div style={{fontSize:'0.7rem',color:'#E8A020',marginTop:'-0.75rem',marginBottom:'0.875rem'}}>✓ Se cargarán las tareas comerciales de {form.industria} al crear</div>}
              </div>
            </div>

            {/* NIVEL DE AVANCE */}
            <label style={s.label}>¿En qué etapa está tu proyecto? *</label>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem',marginBottom:'1.25rem'}}>
              {NIVELES_AVANCE.map(n => (
                <div key={n.id}
                  onClick={() => actualizar('nivel_avance', n.id)}
                  style={{display:'flex',alignItems:'center',gap:'0.875rem',padding:'0.875rem 1rem',borderRadius:'10px',border:`1px solid ${form.nivel_avance === n.id ? '#1D9E75' : 'rgba(255,255,255,0.1)'}`,background:form.nivel_avance === n.id ? 'rgba(29,158,117,0.12)' : 'rgba(255,255,255,0.04)',cursor:'pointer',transition:'all 0.15s'}}>
                  <span style={{fontSize:'1.25rem'}}>{n.emoji}</span>
                  <div>
                    <div style={{fontSize:'0.88rem',fontWeight:'700',color:'#fff'}}>{n.label}</div>
                    <div style={{fontSize:'0.75rem',color:'#8FA3CC'}}>{n.desc}</div>
                  </div>
                  {form.nivel_avance === n.id && <span style={{marginLeft:'auto',color:'#1D9E75',fontSize:'1rem'}}>✓</span>}
                </div>
              ))}
            </div>

            {/* MODALIDAD */}
            <label style={s.label}>Modalidad de trabajo</label>
            <div style={{display:'flex',gap:'0.5rem',marginBottom:'1.25rem',flexWrap:'wrap'}}>
              {MODALIDADES.map(m => (
                <div key={m.id}
                  onClick={() => actualizar('modalidad_trabajo', form.modalidad_trabajo === m.id ? '' : m.id)}
                  style={{flex:1,minWidth:'90px',textAlign:'center',padding:'0.75rem 0.5rem',borderRadius:'10px',border:`1px solid ${form.modalidad_trabajo === m.id ? '#1D9E75' : 'rgba(255,255,255,0.1)'}`,background:form.modalidad_trabajo === m.id ? 'rgba(29,158,117,0.12)' : 'rgba(255,255,255,0.04)',cursor:'pointer',transition:'all 0.15s'}}>
                  <div style={{fontSize:'1.25rem',marginBottom:'0.25rem'}}>{m.emoji}</div>
                  <div style={{fontSize:'0.8rem',fontWeight:'600',color: form.modalidad_trabajo === m.id ? '#1D9E75' : '#fff'}}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* ROLES BUSCADOS */}
            <label style={s.label}>¿Qué perfiles necesitas? (elige los que apliquen)</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:'0.5rem',marginBottom:'1.5rem'}}>
              {ROLES_DISPONIBLES.map(r => {
                const sel = form.roles_buscados.includes(r.id)
                return (
                  <div key={r.id}
                    onClick={() => toggleRol(r.id)}
                    style={{display:'flex',alignItems:'center',gap:'0.4rem',padding:'0.5rem 0.875rem',borderRadius:'20px',border:`1px solid ${sel ? '#1D9E75' : 'rgba(255,255,255,0.12)'}`,background:sel ? 'rgba(29,158,117,0.15)' : 'rgba(255,255,255,0.04)',cursor:'pointer',fontSize:'0.82rem',fontWeight: sel ? '700' : '400',color: sel ? '#1D9E75' : '#C8D4E8',transition:'all 0.15s'}}>
                    <span>{r.emoji}</span> {r.id}
                    {sel && <span style={{fontSize:'0.75rem'}}>✓</span>}
                  </div>
                )
              })}
            </div>

            {mensaje && <div style={s.error}>{mensaje}</div>}

            <div style={s.btnRow}>
              <button style={s.btnCancel} onClick={() => {
                if (form.paso === 2) { actualizar('paso', 1); setMensaje('') }
                else { setVista('lista'); setMensaje('') }
              }}>
                {form.paso === 2 ? '← Atrás' : 'Cancelar'}
              </button>
              {form.paso === 1 ? (
                <button style={s.btn} onClick={() => {
                  if (!form.nombre.trim()) { setMensaje('El nombre del proyecto es obligatorio'); return }
                  if (!form.descripcion.trim() || form.descripcion.trim().length < 80) { setMensaje('La descripción debe tener al menos 80 caracteres'); return }
                  if (!form.sector) { setMensaje('Selecciona el sector del proyecto'); return }
                  setMensaje('')
                  actualizar('paso', 2)
                }}>
                  Siguiente: el equipo →
                </button>
              ) : (
                <button style={s.btn} onClick={publicar} disabled={enviando}>
                  {enviando ? 'Publicando...' : 'Publicar proyecto →'}
                </button>
              )}
            </div>
            </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
