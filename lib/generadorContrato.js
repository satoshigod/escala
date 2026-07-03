// lib/generadorContrato.js
// Genera el contenido estructurado del contrato según la arquitectura jurídica definida.
// El contrato tiene: Contrato Marco + Anexo de Alcance + Instrumento de Deuda (solo B)

export function generarContenidoContrato({ proyecto, profesional, fundador, rol, postulacion, pais_tareas }) {
  const fecha = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
  const esRiesgo = proyecto.estado_financiacion === 'riesgo_compartido'
  const valor = rol.valor_mercado || 0
  const sub = rol.sub_especialidad || ''

  return {
    fecha,
    modalidad: esRiesgo ? 'B' : 'A',
    partes: {
      fundador: {
        nombre: fundador.nombre,
        email: fundador.email,
        rol: 'Fundador / Contratante',
      },
      profesional: {
        nombre: profesional.nombre,
        email: profesional.email,
        especialidad: rol.nombre,
        sub_especialidad: sub,
      },
    },
    proyecto: {
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion,
      ciudad: proyecto.ciudad,
      pais: proyecto.pais,
      sector: proyecto.sector,
    },
    contrato_marco: {
      titulo: 'Contrato Marco de Prestación de Servicios Profesionales Independientes',
      clausulas: [
        {
          numero: '1',
          titulo: 'Naturaleza del vínculo',
          contenido: `El presente contrato establece una relación de prestación de servicios profesionales independientes entre las partes. No existe relación laboral, subordinación, exclusividad ni vínculo de dependencia de ningún tipo. ${profesional.nombre} presta sus servicios de manera autónoma, fija sus propios métodos de trabajo y puede prestar servicios a terceros de manera simultánea.`,
        },
        {
          numero: '2',
          titulo: 'Confidencialidad',
          contenido: `${profesional.nombre} se compromete a mantener la más estricta confidencialidad sobre toda la información del proyecto ${proyecto.nombre} a la que tenga acceso en ejecución del presente contrato, durante su vigencia y por un período de dos (2) años posteriores a su terminación. El incumplimiento de esta obligación dará lugar a las sanciones pactadas en la cláusula de incumplimiento.`,
        },
        {
          numero: '3',
          titulo: 'Propiedad intelectual',
          contenido: `Todos los documentos, análisis, estructuras, plantillas y demás productos intelectuales generados por ${profesional.nombre} en ejecución del presente contrato son propiedad del proyecto ${proyecto.nombre} y quedarán en poder del Contratante al momento de la entrega del entregable final.`,
        },
        {
          numero: '4',
          titulo: 'Conflicto de interés',
          contenido: `${profesional.nombre} declara no tener intereses que comprometan su independencia profesional en relación con el proyecto ${proyecto.nombre}. ${sub === 'Constitución de empresas' && rol.nombre.toLowerCase().includes('contador') ? 'En particular, el Profesional declara que en caso de recibir participación accionaria como contraprestación, no podrá posteriormente ejercer funciones de revisoría fiscal ni certificar estados financieros de la empresa constituida, por conflicto de interés bajo los estándares NIIF adoptados en Colombia.' : ''}`,
        },
        {
          numero: '5',
          titulo: 'Ley aplicable y resolución de disputas',
          contenido: `El presente contrato se rige por las leyes de ${proyecto.pais || 'Colombia'}. Cualquier controversia se resolverá mediante amigable composición o arbitramento ante el Centro de Arbitraje y Conciliación de la Cámara de Comercio de ${proyecto.ciudad || 'Bogotá'}, antes de acudir a la justicia ordinaria.`,
        },
        {
          numero: '6',
          titulo: 'Terminación anticipada',
          contenido: `Cualquiera de las partes podrá terminar el presente contrato con un aviso previo de cinco (5) días hábiles. Si la terminación ocurre por incumplimiento del Profesional, el Contratante no tendrá obligación de pago por los entregables no completados. Si ocurre por voluntad del Contratante sin causa justificada, se reconocerá el valor proporcional de los entregables completados a la fecha.`,
        },
      ],
    },
    anexo_alcance: {
      titulo: 'Anexo 1 — Alcance del Servicio y Estructura de Compensación',
      especialidad: rol.nombre,
      sub_especialidad: sub,
      valor_referencia: valor,
      modalidad_pago: esRiesgo ? 'Modalidad B — Riesgo Compartido' : 'Modalidad A — Con Recursos',
      entregables: pais_tareas || [],
      condiciones_pago: esRiesgo
        ? `El valor de referencia de $${valor.toLocaleString('es-CO')} COP queda registrado como deuda diferida de ${proyecto.nombre}. No hay pago inmediato. Al ocurrir un evento de pago (fondeo, ingresos del proyecto o venta de la empresa), las partes acordarán si la compensación se realiza mediante (i) deuda formal como pasivo de la empresa, pagadera cuando haya liquidez, o (ii) conversión en participación accionaria a la valoración que negocien las partes en ese momento. El Profesional acepta expresamente el riesgo de recibir $0 si el proyecto no genera valor.`
        : `El Contratante pagará al Profesional la suma de $${valor.toLocaleString('es-CO')} COP al verificarse la entrega completa de los entregables definidos en este Anexo. Al momento del pago, el Contratante propondrá al Profesional si desea recibir el pago en efectivo o convertirlo en participación accionaria. La decisión final corresponde exclusivamente al Profesional. Si elige acciones, la valoración de la empresa será negociada por las partes en ese momento y no podrá resultar en un valor inferior al acordado en este contrato.`,
    },
    ...(esRiesgo ? {
      instrumento_deuda: {
        titulo: 'Anexo 2 — Instrumento de Reconocimiento de Valor Diferido',
        contenido: `${proyecto.nombre}, representado por ${fundador.nombre}, reconoce que ${profesional.nombre} prestó servicios de ${rol.nombre}${sub ? ' — ' + sub : ''} por un valor de mercado de $${valor.toLocaleString('es-CO')} COP. Este valor queda registrado como deuda económica diferida de la empresa. El pago está condicionado a que el proyecto genere valor (fondeo, ingresos o evento de liquidez). Si el proyecto se disuelve sin haber generado valor, ${profesional.nombre} acepta expresamente que este instrumento no es exigible y el valor se extingue. Este instrumento no constituye un título valor ni una garantía real.`,
      },
    } : {}),
    advertencia_riesgo: esRiesgo
      ? `AVISO IMPORTANTE: Este contrato corresponde a la Modalidad B (Riesgo Compartido). ${profesional.nombre} acepta prestar sus servicios sin garantía de pago. Existe un riesgo real y explícito de recibir $0 si el proyecto no genera valor. Al firmar este contrato, el Profesional declara haber leído y comprendido esta condición.`
      : null,
  }
}

export function generarTextoPDF(contenido) {
  const { fecha, modalidad, partes, proyecto, contrato_marco, anexo_alcance, instrumento_deuda, advertencia_riesgo } = contenido

  let texto = `
CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES INDEPENDIENTES
${contrato_marco.titulo}

Fecha: ${fecha}
Modalidad: ${modalidad === 'B' ? 'B — Riesgo Compartido' : 'A — Con Recursos'}

PARTES
Contratante: ${partes.fundador.nombre} (${partes.fundador.email})
Profesional: ${partes.profesional.nombre} (${partes.profesional.email})
Especialidad: ${partes.profesional.especialidad}${partes.profesional.sub_especialidad ? ' — ' + partes.profesional.sub_especialidad : ''}

PROYECTO
Nombre: ${proyecto.nombre}
País: ${proyecto.pais || '—'}
Ciudad: ${proyecto.ciudad || '—'}
Sector: ${proyecto.sector || '—'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTRATO MARCO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

  contrato_marco.clausulas.forEach(c => {
    texto += `\nCLÁUSULA ${c.numero} — ${c.titulo}\n${c.contenido}\n`
  })

  texto += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${anexo_alcance.titulo.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Especialidad / Rol: ${anexo_alcance.especialidad}${anexo_alcance.sub_especialidad ? ' — ' + anexo_alcance.sub_especialidad : ''}
Valor de referencia: $${anexo_alcance.valor_referencia.toLocaleString('es-CO')} COP
Modalidad de pago: ${anexo_alcance.modalidad_pago}

ENTREGABLES Y TAREAS:
${(anexo_alcance.entregables || []).map((t, i) => `${i + 1}. ${t.nombre}${t.entregable ? ' → Entregable: ' + t.entregable : ''}`).join('\n')}

CONDICIONES DE PAGO:
${anexo_alcance.condiciones_pago}
`

  if (instrumento_deuda) {
    texto += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${instrumento_deuda.titulo.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${instrumento_deuda.contenido}
`
  }

  if (advertencia_riesgo) {
    texto += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${advertencia_riesgo}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
  }

  texto += `
FIRMAS

Contratante: ${partes.fundador.nombre}
Firma: _______________________________  Fecha: _______________

Profesional: ${partes.profesional.nombre}
Firma: _______________________________  Fecha: _______________

Este contrato fue generado por la plataforma Escala (escala.network).
Escala actúa únicamente como intermediario tecnológico y no es parte de este contrato,
no es garante de las obligaciones de ninguna de las partes, y no es empleador del Profesional.
`

  return texto
}
