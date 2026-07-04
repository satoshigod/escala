// Genera y descarga un PDF del contrato en el browser
// Usa jsPDF via script tag dinamico para compatibilidad con Next.js

export async function descargarContratoPDF(texto, nombreArchivo) {
  return new Promise((resolve, reject) => {
    // Si jsPDF ya esta cargado, usarlo directamente
    if (window.jspdf?.jsPDF) {
      generarYDescargar(window.jspdf.jsPDF, texto, nombreArchivo)
      resolve()
      return
    }

    // Cargar jsPDF via script tag
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    script.onload = () => {
      generarYDescargar(window.jspdf.jsPDF, texto, nombreArchivo)
      resolve()
    }
    script.onerror = () => {
      // Fallback: descargar como txt si jsPDF falla
      const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nombreArchivo.replace('.pdf', '.txt')
      a.click()
      URL.revokeObjectURL(url)
      resolve()
    }
    document.head.appendChild(script)
  })
}

function generarYDescargar(jsPDF, texto, nombreArchivo) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const margin = 20
  const pageW = doc.internal.pageSize.getWidth() - margin * 2
  const lineH = 5.5
  let y = margin

  // Header con logo de texto
  doc.setFillColor(11, 22, 40)
  doc.rect(0, 0, 210, 18, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(29, 158, 117)
  doc.text('Esca', 20, 12)
  doc.setTextColor(255, 255, 255)
  doc.text('la', 34, 12)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(180, 180, 180)
  doc.text('escala.network — Plataforma de colaboracion con participacion diferida', 50, 12)

  y = 28

  // Contenido del contrato
  const lineas = texto.split('\n')
  for (const linea of lineas) {
    const trimmed = linea.trim()

    // Detectar titulos: lineas en mayusculas o que empiezan con CLAUSULA/ANEXO/PARTES/FIRMAS
    const esTitulo = (
      /^(CLAUSULA|ANEXO|PARTES|FIRMAS|PROYECTO|AVISO|CONTRATO)/.test(trimmed) ||
      (trimmed.length > 3 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed))
    )

    const esSeparador = trimmed === '' || trimmed === '---'

    if (esSeparador) {
      y += 3
      continue
    }

    if (esTitulo) {
      y += 3
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(29, 158, 117)
    } else {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(40, 40, 40)
    }

    const wrapped = doc.splitTextToSize(linea, pageW)
    for (const l of wrapped) {
      if (y > 275) {
        doc.addPage()
        y = margin

        // Header en paginas siguientes
        doc.setFillColor(11, 22, 40)
        doc.rect(0, 0, 210, 12, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(29, 158, 117)
        doc.text('Escala', 20, 9)
        doc.setTextColor(180, 180, 180)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.text('Contrato de Prestacion de Servicios', 45, 9)
        y = 20
      }

      doc.text(l, margin, y)
      y += esTitulo ? lineH + 0.5 : lineH
    }
  }

  // Footer en ultima pagina
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFillColor(245, 245, 245)
    doc.rect(0, 285, 210, 12, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(120, 120, 120)
    doc.text('Escala actua unicamente como intermediario tecnologico y no es parte de este contrato.', margin, 291)
    doc.text(`Pagina ${i} de ${totalPages}`, 190, 291, { align: 'right' })
  }

  doc.save(nombreArchivo)
}
