// Genera PDF del contrato usando la API nativa del browser (window.print)
// No requiere librerías externas — funciona en cualquier browser moderno

export function descargarContratoPDF(texto, nombreArchivo) {
  if (typeof window === 'undefined') return

  const nombre = nombreArchivo.replace('.pdf', '')

  // Crear ventana de impresion con el contrato formateado
  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) {
    alert('El navegador bloqueo la ventana emergente. Habilita los popups para este sitio y vuelve a intentarlo.')
    return
  }

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${nombre}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', serif; font-size: 10pt; color: #1a1a2e; background: #fff; }
    .header { background: #0B1628; color: white; padding: 16px 32px; display: flex; align-items: center; gap: 8px; margin-bottom: 32px; }
    .logo-esca { color: #1D9E75; font-size: 18pt; font-weight: bold; font-family: Inter, sans-serif; }
    .logo-la { color: white; font-size: 18pt; font-weight: bold; font-family: Inter, sans-serif; }
    .logo-sub { color: #8FA3CC; font-size: 8pt; margin-left: 8px; font-family: Inter, sans-serif; }
    .content { padding: 0 48px 48px; max-width: 800px; margin: 0 auto; }
    p { margin-bottom: 6pt; line-height: 1.6; }
    .titulo { font-size: 11pt; font-weight: bold; color: #1D9E75; margin-top: 16pt; margin-bottom: 4pt; font-family: Inter, sans-serif; letter-spacing: 0.03em; }
    .separador { border: none; border-top: 1px solid #e0e0e0; margin: 12pt 0; }
    .footer { position: fixed; bottom: 0; left: 0; right: 0; background: #f5f5f5; padding: 6px 32px; font-size: 7pt; color: #888; font-family: Inter, sans-serif; border-top: 1px solid #e0e0e0; display: flex; justify-content: space-between; }
    @media print {
      .no-print { display: none !important; }
      body { font-size: 9pt; }
      .header { margin-bottom: 20px; }
    }
    .btn-bar { background: #0B1628; padding: 12px 32px; display: flex; gap: 12px; align-items: center; }
    .btn-print { background: #1D9E75; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: Inter, sans-serif; }
    .btn-close { background: transparent; color: #8FA3CC; border: 1px solid rgba(255,255,255,0.2); padding: 10px 24px; border-radius: 8px; font-size: 13px; cursor: pointer; font-family: Inter, sans-serif; }
    .hint { color: #8FA3CC; font-size: 11px; font-family: Inter, sans-serif; }
  </style>
</head>
<body>
  <div class="no-print btn-bar">
    <button class="btn-print" onclick="window.print()">Descargar / Imprimir PDF</button>
    <button class="btn-close" onclick="window.close()">Cerrar</button>
    <span class="hint">Al imprimir, selecciona "Guardar como PDF" en el destino de impresion</span>
  </div>
  <div class="header">
    <span class="logo-esca">Esca</span><span class="logo-la">la</span>
    <span class="logo-sub">escala.network — Plataforma de colaboracion con participacion diferida</span>
  </div>
  <div class="content">
    ${texto.split('\n').map(linea => {
      const t = linea.trim()
      if (t === '') return '<br>'
      const esTitulo = (
        /^(CLAUSULA|ANEXO|PARTES|FIRMAS|PROYECTO|AVISO|CONTRATO DE)/.test(t) ||
        (t.length > 3 && t === t.toUpperCase() && /[A-Z]{3}/.test(t))
      )
      if (esTitulo) return `<p class="titulo">${t}</p>`
      if (t.startsWith('---')) return '<hr class="separador">'
      return `<p>${linea.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>`
    }).join('\n')}
  </div>
  <div class="footer no-print">
    <span>Escala actua unicamente como intermediario tecnologico y no es parte de este contrato.</span>
    <span>${nombre}</span>
  </div>
</body>
</html>`

  win.document.write(html)
  win.document.close()
}
