// Genera PDF usando iframe oculto + window.print()
// No abre ventanas nuevas, no requiere librerias externas

export function descargarContratoPDF(texto, nombreArchivo) {
  if (typeof window === 'undefined') return

  const nombre = nombreArchivo.replace('.pdf', '')

  // Eliminar iframe previo si existe
  const previo = document.getElementById('escala-pdf-frame')
  if (previo) previo.remove()

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${nombre}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Georgia, serif; font-size: 10pt; color: #1a1a2e; }
  .header { background: #0B1628; color: white; padding: 14px 32px; display:flex; align-items:center; gap:6px; }
  .logo-e { color: #1D9E75; font-size:16pt; font-weight:bold; font-family:Arial,sans-serif; }
  .logo-la { color:white; font-size:16pt; font-weight:bold; font-family:Arial,sans-serif; }
  .logo-sub { color:#8FA3CC; font-size:7.5pt; margin-left:10px; font-family:Arial,sans-serif; }
  .content { padding: 24px 40px 60px; }
  p { margin-bottom:5pt; line-height:1.65; }
  .titulo { font-size:9.5pt; font-weight:bold; color:#1D9E75; margin-top:14pt; margin-bottom:3pt; font-family:Arial,sans-serif; }
  .footer-p { position:fixed; bottom:0; left:0; right:0; background:#f0f0f0; padding:5px 32px; font-size:7pt; color:#888; font-family:Arial,sans-serif; display:flex; justify-content:space-between; border-top:1px solid #ddd; }
  @page { margin: 0; }
</style>
</head>
<body>
<div class="header">
  <span class="logo-e">Esca</span><span class="logo-la">la</span>
  <span class="logo-sub">escala.network — Contrato de Prestacion de Servicios</span>
</div>
<div class="content">
${texto.split('\n').map(linea => {
  const t = linea.trim()
  if (t === '') return '<br style="display:block;margin:2pt 0">'
  const esTitulo = /^(CLAUSULA|ANEXO|PARTES|FIRMAS|PROYECTO|AVISO|CONTRATO DE)/.test(t) ||
    (t.length > 3 && t === t.toUpperCase() && /[A-Z]{3}/.test(t))
  if (esTitulo) return `<p class="titulo">${t.replace(/</g,'&lt;')}</p>`
  return `<p>${linea.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>`
}).join('\n')}
</div>
<div class="footer-p">
  <span>Escala actua unicamente como intermediario tecnologico y no es parte de este contrato.</span>
  <span>${nombre}</span>
</div>
</body>
</html>`

  // Crear iframe oculto
  const iframe = document.createElement('iframe')
  iframe.id = 'escala-pdf-frame'
  iframe.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;border:none;z-index:99999;background:white;'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument || iframe.contentWindow.document
  doc.open()
  doc.write(html)
  doc.close()

  // Barra de herramientas sobre el iframe
  const bar = document.createElement('div')
  bar.id = 'escala-pdf-bar'
  bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:100000;background:#0B1628;padding:10px 24px;display:flex;gap:12px;align-items:center;box-shadow:0 2px 10px rgba(0,0,0,0.5);'
  bar.innerHTML = `
    <span style="color:#1D9E75;font-weight:700;font-family:Arial;font-size:14px;">Esca<span style="color:white">la</span></span>
    <span style="color:#8FA3CC;font-size:12px;font-family:Arial;flex:1;">Selecciona "Guardar como PDF" al imprimir</span>
    <button onclick="window.print()" style="background:#1D9E75;color:white;border:none;padding:8px 20px;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;font-family:Arial;">Guardar PDF</button>
    <button id="cerrar-pdf-btn" style="background:rgba(255,255,255,0.1);color:#8FA3CC;border:1px solid rgba(255,255,255,0.2);padding:8px 16px;border-radius:6px;font-size:13px;cursor:pointer;font-family:Arial;">Cerrar</button>
  `
  document.body.appendChild(bar)

  document.getElementById('cerrar-pdf-btn').onclick = () => {
    iframe.remove()
    bar.remove()
  }
}
