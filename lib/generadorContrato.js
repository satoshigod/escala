// lib/generadorContrato.js
// Genera contratos de prestacion de servicios profesionales independientes
// Arquitectura: Contrato Marco + Anexo de Alcance + Instrumento de Deuda (solo Modalidad B)

export function generarContenidoContrato({ proyecto, profesional, fundador, rol, postulacion, pais_tareas }) {
  const fecha = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
  const esRiesgo = proyecto.estado_financiacion === 'riesgo_compartido'
  const valor = rol.valor_mercado || 0
  const sub = rol.sub_especialidad || ''
  const numeroContrato = `ESC-${Date.now().toString().slice(-8)}`
  const esContador = rol.nombre.toLowerCase().includes('contador') || rol.nombre.toLowerCase().includes('contable')

  return {
    fecha,
    numero_contrato: numeroContrato,
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
      clausulas: [
        {
          numero: '1',
          titulo: 'Objeto del contrato',
          contenido: `${profesional.nombre}, en adelante el Profesional, se obliga a prestar a ${fundador.nombre}, en adelante el Contratante, servicios profesionales independientes de ${rol.nombre}${sub ? ' con especialidad en ' + sub : ''}, en el marco del proyecto ${proyecto.nombre}. Los servicios comprenden la ejecucion de los entregables descritos en el Anexo 1 del presente contrato, de conformidad con los estandares propios de su profesion y las instrucciones generales del Contratante.`,
        },
        {
          numero: '2',
          titulo: 'Naturaleza del vinculo y autonomia del Profesional',
          contenido: `El presente contrato establece una relacion de prestacion de servicios profesionales independientes. No existe relacion laboral, subordinacion, exclusividad ni vinculo de dependencia de ningun tipo entre las partes. El Profesional actua con plena autonomia tecnica y administrativa, fija sus propios metodos de trabajo, horarios y herramientas, y puede prestar servicios a terceros de manera simultanea sin que ello constituya incumplimiento. El Profesional es responsable del pago de sus propios impuestos, contribuciones a seguridad social y demas obligaciones tributarias derivadas de su actividad independiente.`,
        },
        {
          numero: '3',
          titulo: 'Plazo',
          contenido: `El presente contrato inicia en la fecha de su firma y se extendera hasta la entrega y aceptacion de la totalidad de los entregables descritos en el Anexo 1, o hasta su terminacion anticipada conforme a lo establecido en la Clausula 9 del presente contrato. Las partes podran acordar prorrogas o modificaciones al alcance mediante comunicacion escrita, sin necesidad de otorgar un nuevo contrato.`,
        },
        {
          numero: '4',
          titulo: 'Valor y forma de pago',
          contenido: esRiesgo
            ? `El valor de referencia de mercado de los servicios objeto del presente contrato es de $${valor.toLocaleString('es-CO')} COP. En razon de la Modalidad B — Riesgo Compartido, no habra pago inmediato ni garantia de pago futuro. El valor quedara registrado como deuda economica diferida del proyecto ${proyecto.nombre}, sujeta a evento de pago segun lo establecido en el Anexo 2 del presente contrato. El Profesional declara haber comprendido y aceptado expresamente esta condicion antes de la firma.`
            : `El Contratante pagara al Profesional la suma de $${valor.toLocaleString('es-CO')} COP al verificarse la entrega completa y aceptacion de los entregables definidos en el Anexo 1. El pago se realizara dentro de los cinco (5) dias habiles siguientes a dicha verificacion. Al momento del pago, el Contratante podra proponer al Profesional la opcion de convertir el valor en participacion accionaria del proyecto; la decision final corresponde exclusivamente al Profesional y la valoracion sera negociada por las partes en ese momento.`,
        },
        {
          numero: '5',
          titulo: 'Obligaciones del Profesional',
          contenido: `El Profesional se obliga a: (i) ejecutar los servicios con la diligencia, cuidado y estandares tecnicos propios de su profesion; (ii) entregar los productos y resultados pactados en los tiempos acordados; (iii) comunicar oportunamente al Contratante cualquier circunstancia que pueda afectar la ejecucion del contrato; (iv) guardar confidencialidad sobre la informacion del proyecto; (v) transferir al Contratante la propiedad intelectual de los productos generados en ejecucion de este contrato; (vi) cumplir con sus obligaciones tributarias y de seguridad social como trabajador independiente.`,
        },
        {
          numero: '6',
          titulo: 'Obligaciones del Contratante',
          contenido: `El Contratante se obliga a: (i) suministrar oportunamente al Profesional la informacion, accesos y recursos necesarios para la ejecucion del objeto contractual; (ii) revisar y aprobar los entregables dentro de un plazo razonable, no superior a cinco (5) dias habiles desde su recepcion; (iii) comunicar con claridad cualquier ajuste o correccion requerida; (iv) cumplir con las condiciones de compensacion pactadas en el Anexo 1 y, si aplica, en el Anexo 2.`,
        },
        {
          numero: '7',
          titulo: 'Confidencialidad',
          contenido: `El Profesional se compromete a mantener la mas estricta confidencialidad sobre toda la informacion del proyecto ${proyecto.nombre} a la que tenga acceso en ejecucion del presente contrato, incluyendo datos tecnicos, comerciales, financieros, de clientes y estrategicos. Esta obligacion se mantiene durante la vigencia del contrato y por un periodo de dos (2) anos posteriores a su terminacion. El incumplimiento de esta clausula dara lugar a la responsabilidad civil correspondiente.`,
        },
        {
          numero: '8',
          titulo: 'Propiedad intelectual',
          contenido: `Todos los documentos, analisis, codigos, disenos, estructuras, plantillas, bases de datos y demas productos intelectuales generados por el Profesional en ejecucion del presente contrato son propiedad exclusiva del proyecto ${proyecto.nombre} y se entendera que quedan cedidos al Contratante desde el momento de su creacion, sin costo adicional. El Profesional renuncia expresamente a ejercer derechos morales sobre dichas obras en el contexto de su uso comercial por parte del proyecto.`,
        },
        {
          numero: '9',
          titulo: 'Conflicto de interes e independencia',
          contenido: `El Profesional declara no tener intereses economicos, personales o profesionales que comprometan su independencia en la prestacion de los servicios objeto de este contrato. ${esContador && sub.toLowerCase().includes('constitu') ? 'En particular, el Profesional — en su calidad de Contador — declara que en caso de recibir participacion accionaria como contraprestacion por sus servicios, no podra ejercer posteriormente funciones de revisoria fiscal, ni suscribir certificaciones de estados financieros ni dictamenes de auditoria respecto de la empresa constituida, en cumplimiento de las normas de independencia del Codigo de Etica de la IFAC adoptadas en Colombia.' : 'El Profesional se obliga a informar de inmediato al Contratante cualquier circunstancia sobreviniente que pudiera generar un conflicto de interes durante la ejecucion del contrato.'}`,
        },
        {
          numero: '10',
          titulo: 'Indemnidad laboral',
          contenido: `El Profesional manifiesta que los servicios objeto de este contrato los presta en calidad de trabajador independiente. En consecuencia, el Contratante no asume ninguna responsabilidad por concepto de salarios, prestaciones sociales, aportes a seguridad social, parafiscales, indemnizaciones laborales ni ningun otro beneficio propio de una relacion laboral. Si una autoridad competente llegare a determinar la existencia de una relacion laboral entre las partes, el Profesional se obliga a mantener indemne al Contratante de cualquier condena o pago derivado de dicha determinacion.`,
        },
        {
          numero: '11',
          titulo: 'Cesion del contrato',
          contenido: `Ninguna de las partes podra ceder los derechos y obligaciones del presente contrato a terceros sin el consentimiento previo y escrito de la otra parte. La cesion no autorizada se entendera como incumplimiento grave del contrato.`,
        },
        {
          numero: '12',
          titulo: 'Modificaciones',
          contenido: `Cualquier modificacion al presente contrato, incluyendo cambios en el alcance, valor, plazos o condiciones, debera constar por escrito y ser firmada por ambas partes. Las comunicaciones por correo electronico entre las direcciones registradas en el encabezado de este contrato tendran plena validez juridica para estos efectos.`,
        },
        {
          numero: '13',
          titulo: 'Terminacion anticipada',
          contenido: `Cualquiera de las partes podra dar por terminado el presente contrato con un aviso previo minimo de cinco (5) dias habiles comunicado por escrito. En caso de terminacion por incumplimiento grave del Profesional, el Contratante no tendra obligacion de compensar los entregables pendientes. En caso de terminacion unilateral sin causa justificada por parte del Contratante, se reconocera al Profesional el valor proporcional correspondiente a los entregables efectivamente completados y entregados hasta la fecha de terminacion.`,
        },
        {
          numero: '14',
          titulo: 'Ley aplicable y resolucion de disputas',
          contenido: `El presente contrato se rige e interpreta conforme a las leyes de ${proyecto.pais || 'Colombia'}. Cualquier controversia, diferencia o reclamacion derivada de este contrato o relacionada con el misma se resolvera en primera instancia mediante negociacion directa de buena fe entre las partes durante un periodo de quince (15) dias calendarios. Si no se logra acuerdo, la controversia se sometera a amigable composicion o arbitramento ante el Centro de Arbitraje y Conciliacion de la Camara de Comercio de ${proyecto.ciudad || 'Bogota'}, cuyo fallo sera definitivo y obligatorio para las partes.`,
        },
        {
          numero: '15',
          titulo: 'Integridad del acuerdo',
          contenido: `El presente contrato y sus Anexos constituyen el acuerdo completo entre las partes respecto del objeto aqui descrito, y reemplaza cualquier negociacion, oferta, propuesta o acuerdo verbal o escrito previo sobre la misma materia. No existe ninguna representacion, garantia o compromiso entre las partes que no este expresamente contenido en este documento.`,
        },
      ],
    },
    anexo_alcance: {
      titulo: 'Anexo 1 — Alcance del Servicio y Estructura de Compensacion',
      especialidad: rol.nombre,
      sub_especialidad: sub,
      valor_referencia: valor,
      modalidad_pago: esRiesgo ? 'Modalidad B — Riesgo Compartido' : 'Modalidad A — Con Recursos',
      entregables: pais_tareas || [],
      condiciones_pago: esRiesgo
        ? `El valor de referencia de $${valor.toLocaleString('es-CO')} COP queda registrado como deuda diferida del proyecto ${proyecto.nombre}. No existe pago inmediato ni garantia de pago futuro. Al ocurrir un evento de pago (cierre de ronda de financiacion, generacion sostenida de ingresos operacionales o venta total o parcial de la empresa), las partes negociaran de buena fe si la compensacion se realiza mediante: (i) pago en efectivo como deuda exigible del pasivo de la empresa, o (ii) conversion en participacion accionaria a la valoracion que acuerden las partes en ese momento. La decision sobre la modalidad de pago corresponde al Profesional, una vez iniciado el evento de pago. Si el proyecto se disuelve definitivamente sin haber generado un evento de pago, el Profesional acepta expresamente que este instrumento no es exigible y la deuda se extingue sin lugar a reclamacion.`
        : `El Contratante pagara al Profesional la suma de $${valor.toLocaleString('es-CO')} COP al verificarse la entrega completa de los entregables de este Anexo. Adicionalmente, el Contratante podra ofrecer al Profesional la opcion de convertir dicho valor en participacion accionaria del proyecto; la decision es exclusiva del Profesional y la valoracion sera negociada por las partes al momento del pago.`,
    },
    ...(esRiesgo ? {
      instrumento_deuda: {
        titulo: 'Anexo 2 — Instrumento de Reconocimiento de Valor Diferido',
        contenido: `${proyecto.nombre}, representado por ${fundador.nombre} en calidad de fundador y representante del proyecto, reconoce formalmente que ${profesional.nombre} ha prestado o se ha comprometido a prestar servicios profesionales de ${rol.nombre}${sub ? ' — ' + sub : ''} por un valor de mercado estimado de $${valor.toLocaleString('es-CO')} COP. Este valor queda registrado como deuda economica diferida del proyecto, sin fecha de vencimiento determinada, sin causacion de intereses y sin constituir titulo valor ni garantia real. El pago esta condicionado a la ocurrencia de un evento de pago tal como se define en el Anexo 1. Si el proyecto se disuelve sin haber generado valor liquido, el Profesional acepta que este instrumento se extingue sin lugar a reclamacion judicial o extrajudicial. La firma de este instrumento no implica compromiso de pago cierto por parte del Contratante ni de los demas miembros del equipo.`,
      },
    } : {}),
    advertencia_riesgo: esRiesgo
      ? `DECLARACION DE RIESGO — MODALIDAD B: ${profesional.nombre} declara haber leido, comprendido y aceptado voluntariamente que los servicios prestados en el marco de este contrato no tienen garantia de remuneracion. Existe un riesgo real, explicito y materialmente posible de recibir $0 como compensacion si el proyecto no alcanza un evento de pago. Esta declaracion es condicion esencial para la validez de este contrato en su Modalidad B.`
      : null,
  }
}

export function generarTextoPDF(contenido) {
  const { fecha, numero_contrato, modalidad, partes, proyecto, contrato_marco, anexo_alcance, instrumento_deuda, advertencia_riesgo } = contenido

  const linea = '─'.repeat(60)

  let texto = `CONTRATO DE PRESTACION DE SERVICIOS PROFESIONALES INDEPENDIENTES
Contrato No. ${numero_contrato}

${linea}
INFORMACION GENERAL
${linea}

Fecha de celebracion:  ${fecha}
Ciudad:                ${proyecto.ciudad || '—'}, ${proyecto.pais || '—'}
Modalidad:             ${modalidad === 'B' ? 'B — Riesgo Compartido (sin garantia de pago)' : 'A — Con Recursos (pago al cumplimiento)'}

${linea}
PARTES
${linea}

CONTRATANTE
Nombre:        ${partes.fundador.nombre}
Correo:        ${partes.fundador.email}
Calidad:       Fundador y representante del proyecto

PROFESIONAL
Nombre:        ${partes.profesional.nombre}
Correo:        ${partes.profesional.email}
Especialidad:  ${partes.profesional.especialidad}${partes.profesional.sub_especialidad ? ' — ' + partes.profesional.sub_especialidad : ''}

${linea}
PROYECTO
${linea}

Nombre:        ${proyecto.nombre}
Sector:        ${proyecto.sector || '—'}
Ciudad:        ${proyecto.ciudad || '—'}
Pais:          ${proyecto.pais || '—'}
${proyecto.descripcion ? 'Descripcion:   ' + proyecto.descripcion : ''}

${linea}
CONTRATO MARCO DE PRESTACION DE SERVICIOS PROFESIONALES INDEPENDIENTES
${linea}
`

  contrato_marco.clausulas.forEach(c => {
    texto += `
CLAUSULA ${c.numero} — ${c.titulo.toUpperCase()}
${c.contenido}
`
  })

  texto += `
${linea}
${anexo_alcance.titulo.toUpperCase()}
${linea}

Especialidad / Rol:    ${anexo_alcance.especialidad}${anexo_alcance.sub_especialidad ? ' — ' + anexo_alcance.sub_especialidad : ''}
Valor de referencia:   $${anexo_alcance.valor_referencia.toLocaleString('es-CO')} COP
Modalidad de pago:     ${anexo_alcance.modalidad_pago}

ENTREGABLES Y CRITERIOS DE ACEPTACION:
${(anexo_alcance.entregables || []).map((t, i) => `${i + 1}. ${t.nombre}${t.descripcion ? '\n   Descripcion: ' + t.descripcion : ''}${t.entregable ? '\n   Entregable: ' + t.entregable : ''}`).join('\n')}

CONDICIONES DE COMPENSACION:
${anexo_alcance.condiciones_pago}
`

  if (instrumento_deuda) {
    texto += `
${linea}
${instrumento_deuda.titulo.toUpperCase()}
${linea}

${instrumento_deuda.contenido}
`
  }

  if (advertencia_riesgo) {
    texto += `
${linea}
${advertencia_riesgo}
${linea}
`
  }

  texto += `
${linea}
FIRMAS Y ACEPTACION
${linea}

Las partes declaran haber leido en su totalidad el presente contrato y sus Anexos, haber comprendido su alcance y aceptarlo en todas sus partes.

CONTRATANTE

Nombre:  ${partes.fundador.nombre}
Firma:   _____________________________________________
Fecha:   _______________________________________________


PROFESIONAL

Nombre:  ${partes.profesional.nombre}
Firma:   _____________________________________________
Fecha:   _______________________________________________


${linea}
Contrato No. ${numero_contrato} | Generado por Escala (escala.network)
Escala actua unicamente como intermediario tecnologico. No es parte de este contrato,
no garantiza las obligaciones de ninguna de las partes y no es empleador del Profesional.
Este documento tiene validez legal en Colombia conforme a la Ley 527 de 1999 y el
Decreto 2364 de 2012 sobre firmas electronicas. Las partes acuerdan que la confirmacion
de firma en la plataforma Escala constituye una firma electronica valida y vinculante.
${linea}
`

  return texto
}
