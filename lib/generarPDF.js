// Genera y descarga un PDF del contrato en el browser
// Requiere: npm install jspdf

export async function descargarContratoPDF(texto, nombreArchivo) {
  // Import dinamico para que solo cargue en el cliente
  const { jsPDF } = await import('jspdf')

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const margin = 20
  const pageW = doc.internal.pageSize.getWidth() - margin * 2
  const lineH = 5.5
  let y = margin

  // Header
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
  doc.text('escala.network', 50, 12)

  y = 28

  const lineas = texto.split('\n')
  for (const linea of lineas) {
    const trimmed = linea.trim()

    if (trimmed === '') { y += 2; continue }

    const esTitulo = (
      /^(CLAUSULA|ANEXO|PARTES|FIRMAS|PROYECTO|AVISO|CONTRATO)/.test(trimmed) ||
      (trimmed.length > 3 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed))
    )

    if (esTitulo) {
      y += 2
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
        doc.setFillColor(11, 22, 40)
        doc.rect(0, 0, 210, 12, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(29, 158, 117)
        doc.text('Escala', 20, 9)
        y = 20
      }
      doc.text(l, margin, y)
      y += esTitulo ? lineH + 0.5 : lineH
    }
  }

  // Footer
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFillColor(245, 245, 245)
    doc.rect(0, 285, 210, 12, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(120, 120, 120)
    doc.text('Escala actua unicamente como intermediario tecnologico y no es parte de este contrato.', margin, 291)
    doc.text(`Pag. ${i} de ${totalPages}`, 190, 291, { align: 'right' })
  }

  doc.save(nombreArchivo)
}
