// app/api/presupuesto/exportar/route.js
// GET — devuelve HTML imprimible del presupuesto para exportar como PDF
// El cliente abre /api/presupuesto/exportar?proyecto_id=X en nueva ventana y usa Ctrl+P

import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-admin'

const CATEGORIAS = {
  equipo: { label: 'Equipo', emoji: '👥' },
  equipos_activos: { label: 'Equipos y Activos', emoji: '🔧' },
  tecnologia: { label: 'Tecnologia', emoji: '💻' },
  capital_trabajo: { label: 'Capital de Trabajo', emoji: '📦' },
  marketing_ventas: { label: 'Marketing y Ventas', emoji: '📣' },
  legal_operacion: { label: 'Legal y Operacion', emoji: '⚖️' },
  otro: { label: 'Otros', emoji: '📋' },
}

const fmt = (n) => Math.round(parseFloat(n || 0)).toLocaleString('es-CO')

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const proyecto_id = searchParams.get('proyecto_id')
    if (!proyecto_id) return new Response('proyecto_id requerido', { status: 400 })

    // Obtener proyecto
    const { data: proyecto } = await supabase
      .from('proyectos')
      .select('nombre, ciudad, sector, created_at')
      .eq('id', proyecto_id)
      .single()

    // Obtener items con fondeos
    const { data: items } = await supabase
      .from('presupuesto_items')
      .select(`*, presupuesto_fondeos(monto, estado, a_cambio_de, pct_participacion, tasa_mensual, pct_revenue, perfiles!inversionista_id(nombre))`)
      .eq('proyecto_id', proyecto_id)
      .order('categoria')
      .order('prioridad')

    if (!items?.length) return new Response('Sin items en el presupuesto', { status: 404 })

    // Calcular resumen
    const total = items.reduce((s, i) => s + parseFloat(i.valor_total || 0), 0)
    const fondeado = items.reduce((s, i) => s + parseFloat(i.monto_fondeado || 0), 0)
    const capex = items.filter(i => i.tipo_gasto === 'capex').reduce((s, i) => s + parseFloat(i.valor_total || 0), 0)
    const opex = items.filter(i => i.tipo_gasto === 'opex').reduce((s, i) => s + parseFloat(i.valor_total || 0), 0)
    const pct = total > 0 ? Math.round((fondeado / total) * 100) : 0

    // Agrupar por categoria
    const porCategoria = {}
    for (const item of items) {
      if (!porCategoria[item.categoria]) porCategoria[item.categoria] = []
      porCategoria[item.categoria].push(item)
    }

    const fecha = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Presupuesto — ${proyecto?.nombre || 'Proyecto'}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; background: #fff; font-size: 11px; line-height: 1.5; }
  .page { max-width: 900px; margin: 0 auto; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #0D1B3E; }
  .logo { font-size: 22px; font-weight: 900; color: #0D1B3E; letter-spacing: -0.03em; }
  .logo span { color: #1D9E75; }
  .header-info { text-align: right; }
  .proyecto-nombre { font-size: 16px; font-weight: 800; color: #0D1B3E; }
  .proyecto-meta { font-size: 10px; color: #6B7280; margin-top: 3px; }
  .doc-titulo { font-size: 13px; font-weight: 700; color: #6B7280; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
  .resumen { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 32px; }
  .stat { background: #f8f9fa; border-radius: 8px; padding: 12px; text-align: center; }
  .stat-valor { font-size: 16px; font-weight: 800; color: #0D1B3E; }
  .stat-verde { color: #1D9E75; }
  .stat-azul { color: #4A90D9; }
  .stat-naranja { color: #E8A020; }
  .stat-label { font-size: 9px; color: #6B7280; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.04em; }
  .barra-wrap { margin-bottom: 32px; }
  .barra-label { font-size: 10px; color: #6B7280; margin-bottom: 5px; display: flex; justify-content: space-between; }
  .barra { height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
  .barra-fill { height: 100%; background: #1D9E75; border-radius: 4px; }
  .categoria { margin-bottom: 28px; }
  .cat-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
  .cat-titulo { font-size: 12px; font-weight: 800; color: #0D1B3E; text-transform: uppercase; letter-spacing: 0.05em; }
  .cat-total { margin-left: auto; font-size: 12px; font-weight: 700; color: #0D1B3E; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f1f5f9; text-align: left; padding: 7px 10px; font-size: 9px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.04em; }
  td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
  .item-nombre { font-weight: 600; color: #1a1a2e; }
  .item-desc { font-size: 10px; color: #6B7280; margin-top: 2px; }
  .badge { display: inline-block; font-size: 8px; font-weight: 700; padding: 1px 6px; border-radius: 10px; text-transform: uppercase; }
  .badge-capex { background: #dbeafe; color: #1d4ed8; }
  .badge-opex { background: #fef3c7; color: #92400e; }
  .badge-critica { background: #fee2e2; color: #991b1b; }
  .badge-alta { background: #fef3c7; color: #92400e; }
  .badge-media { background: #dbeafe; color: #1d4ed8; }
  .badge-baja { background: #f3f4f6; color: #6b7280; }
  .badge-fondeado { background: #d1fae5; color: #065f46; }
  .badge-parcial { background: #fef3c7; color: #92400e; }
  .badge-sin { background: #f3f4f6; color: #6b7280; }
  .badge-especie { background: #ede9fe; color: #5b21b6; }
  .monto { font-family: monospace; font-weight: 600; }
  .fondeo-row { background: #f0fdf4; font-size: 10px; color: #065f46; padding: 4px 10px 4px 20px; }
  .subtotal-row td { background: #f8f9fa; font-weight: 700; }
  .total-row { margin-top: 24px; background: #0D1B3E; color: #fff; border-radius: 8px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
  .total-label { font-size: 12px; font-weight: 700; }
  .total-valor { font-size: 18px; font-weight: 900; font-family: monospace; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 9px; color: #9ca3af; }
  @media print {
    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .page { padding: 20px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="page">

  <div class="no-print" style="background:#1D9E75;color:#fff;padding:10px 16px;border-radius:8px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;">
    <span style="font-weight:600;">Para guardar como PDF: usa Ctrl+P (o Cmd+P en Mac) → Guardar como PDF</span>
    <button onclick="window.print()" style="background:#fff;color:#1D9E75;border:none;border-radius:6px;padding:6px 16px;font-weight:700;cursor:pointer;">Imprimir / Guardar PDF</button>
  </div>

  <div class="header">
    <div class="logo">Esca<span>la</span></div>
    <div class="header-info">
      <div class="proyecto-nombre">${proyecto?.nombre || 'Proyecto'}</div>
      <div class="proyecto-meta">${proyecto?.sector || ''} ${proyecto?.ciudad ? '· ' + proyecto.ciudad : ''}</div>
      <div class="doc-titulo">Presupuesto e Inversión</div>
      <div class="proyecto-meta">${fecha}</div>
    </div>
  </div>

  <div class="resumen">
    <div class="stat"><div class="stat-valor">$${fmt(total)}</div><div class="stat-label">Total presupuesto</div></div>
    <div class="stat"><div class="stat-valor stat-verde">$${fmt(fondeado)}</div><div class="stat-label">Fondeado</div></div>
    <div class="stat"><div class="stat-valor">${pct}%</div><div class="stat-label">% Fondeado</div></div>
    <div class="stat"><div class="stat-valor stat-azul">$${fmt(capex)}</div><div class="stat-label">CAPEX</div></div>
    <div class="stat"><div class="stat-valor stat-naranja">$${fmt(opex)}</div><div class="stat-label">OPEX</div></div>
  </div>

  <div class="barra-wrap">
    <div class="barra-label"><span>Progreso de fondeo</span><span>${pct}% — $${fmt(fondeado)} de $${fmt(total)}</span></div>
    <div class="barra"><div class="barra-fill" style="width:${Math.min(pct,100)}%"></div></div>
  </div>

  ${Object.entries(porCategoria).map(([cat, catItems]) => {
    const catInfo = CATEGORIAS[cat] || { label: cat, emoji: '📋' }
    const catTotal = catItems.reduce((s, i) => s + parseFloat(i.valor_total || 0), 0)
    const catFondeado = catItems.reduce((s, i) => s + parseFloat(i.monto_fondeado || 0), 0)
    return `
    <div class="categoria">
      <div class="cat-header">
        <span>${catInfo.emoji}</span>
        <span class="cat-titulo">${catInfo.label}</span>
        <span class="cat-total">$${fmt(catTotal)} — Fondeado: $${fmt(catFondeado)}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:35%">Item</th>
            <th>Tipo</th>
            <th>Prioridad</th>
            <th style="text-align:right">Cantidad</th>
            <th style="text-align:right">Valor unit.</th>
            <th style="text-align:right">Total</th>
            <th style="text-align:right">Fondeado</th>
          </tr>
        </thead>
        <tbody>
          ${catItems.map(item => {
            const fondeos = item.presupuesto_fondeos || []
            const estadoBadge = item.es_aporte_especie ? 'especie' : item.estado_fondeo === 'fondeado' || item.estado_fondeo === 'verificado' ? 'fondeado' : item.estado_fondeo === 'parcialmente_fondeado' ? 'parcial' : 'sin'
            return `
            <tr>
              <td>
                <div class="item-nombre">${item.nombre}</div>
                ${item.descripcion ? `<div class="item-desc">${item.descripcion}</div>` : ''}
                ${item.es_aporte_especie ? '<span class="badge badge-especie">Aporte en especie</span>' : ''}
              </td>
              <td><span class="badge badge-${item.tipo_gasto || 'capex'}">${(item.tipo_gasto || 'capex').toUpperCase()}</span></td>
              <td><span class="badge badge-${item.prioridad || 'media'}">${item.prioridad || 'media'}</span></td>
              <td style="text-align:right" class="monto">${item.cantidad}</td>
              <td style="text-align:right" class="monto">$${fmt(item.valor_unitario)}</td>
              <td style="text-align:right" class="monto">$${fmt(item.valor_total)}</td>
              <td style="text-align:right"><span class="badge badge-${estadoBadge}">$${fmt(item.monto_fondeado)}</span></td>
            </tr>
            ${fondeos.filter(f => ['aceptado','transferido','verificado'].includes(f.estado)).map(f => `
            <tr class="fondeo-row">
              <td colspan="5">
                Inv: ${f.perfiles?.nombre || 'Inversionista'} —
                ${f.a_cambio_de === 'participacion' ? `${f.pct_participacion}% participacion` : f.a_cambio_de === 'deuda' ? `${f.tasa_mensual}% mensual` : `${f.pct_revenue}% revenue`}
                (${f.estado})
              </td>
              <td style="text-align:right" class="monto" colspan="2">$${fmt(f.monto)}</td>
            </tr>`).join('')}
          `}).join('')}
          <tr class="subtotal-row">
            <td colspan="5">Subtotal ${catInfo.label}</td>
            <td style="text-align:right" class="monto">$${fmt(catTotal)}</td>
            <td style="text-align:right" class="monto">$${fmt(catFondeado)}</td>
          </tr>
        </tbody>
      </table>
    </div>`
  }).join('')}

  <div class="total-row">
    <div class="total-label">TOTAL PRESUPUESTO</div>
    <div class="total-valor">$${fmt(total)} COP</div>
  </div>

  <div class="footer">
    <span>Generado por Escala Network — escala.network</span>
    <span>${fecha}</span>
  </div>

</div>
</body>
</html>`

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  } catch (err) {
    return new Response('Error: ' + err.message, { status: 500 })
  }
}
