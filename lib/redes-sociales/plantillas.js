// lib/redes-sociales/plantillas.js
//
// Plantillas de texto para cada tipo de evento.
// Edita aquí el copy sin tocar código de lógica.
//
// Cada plantilla tiene:
//   - textFb:  texto para Facebook (más largo, hasta 500 chars recomendado)
//   - textIg:  texto para Instagram (más corto, hasta 2200 chars pero idealmente < 300)
//   - hashtags: array de hashtags — se agregan al final de ambos textos
//   - auto:    true = publica sin aprobación manual | false = va a cola de aprobación
//   - activoFb: true/false para habilitar/deshabilitar por plataforma
//   - activoIg: true/false para habilitar/deshabilitar por plataforma
//
// Variables disponibles en los textos (se reemplazan automáticamente):
//   {{nombre}}       — nombre del proyecto, empresa, o profesional
//   {{ciudad}}       — ciudad
//   {{pais}}         — país
//   {{porcentaje}}   — porcentaje de avance (para hitos)
//   {{rol}}          — rol del profesional
//   {{sector}}       — sector/industria
//   {{url}}          — URL de Escala del elemento
//   {{fecha}}        — fecha formateada

const PLANTILLAS = {

  // ─── PROYECTOS ──────────────────────────────────────────────────────────────

  proyecto_publicado: {
    textFb: '🚀 Nuevo proyecto en Escala: {{nombre}}\n\nUn equipo está buscando especialistas para hacer realidad esta idea. Si tienes las habilidades, este puede ser tu próximo proyecto colaborativo.\n\n👉 {{url}}',
    textIg: '🚀 Nuevo proyecto en Escala\n\n{{nombre}}\n\nBuscamos especialistas para hacerlo realidad.\n\n🔗 escala.network',
    hashtags: ['#Escala', '#ProyectoNuevo', '#EmprendimientoColombiano', '#StartupColombia', '#EconomíaColaborativa'],
    auto: true,
    activoFb: true,
    activoIg: true,
  },

  proyecto_completado: {
    textFb: '🎉 ¡Proyecto completado en Escala!\n\n{{nombre}} llegó a su fin con éxito. Esto es lo que pasa cuando el talento correcto trabaja en equipo con una idea clara.\n\nFelicitaciones al equipo. 🙌\n\n👉 {{url}}',
    textIg: '🎉 Proyecto completado\n\n{{nombre}}\n\nEl equipo lo logró. Esto es Escala en acción. 💚',
    hashtags: ['#Escala', '#ProyectoCompletado', '#EmprendimientoColombia', '#ÉxitoColaborativo'],
    auto: true,
    activoFb: true,
    activoIg: true,
  },

  proyecto_hito_25: {
    textFb: '📊 {{nombre}} alcanzó el 25% de ejecución.\n\nCada paso cuenta. Este equipo va por buen camino. 💪\n\n👉 {{url}}',
    textIg: '📊 {{nombre}}\n\n25% ejecutado ✅\n\nVan por buen camino. 💪',
    hashtags: ['#Escala', '#Progreso', '#EmprendimientoColombia'],
    auto: true,
    activoFb: true,
    activoIg: false,
  },

  proyecto_hito_50: {
    textFb: '🔥 {{nombre}} lleva el 50% completado.\n\nLa mitad del camino recorrido. El equipo no para. 🚀\n\n👉 {{url}}',
    textIg: '🔥 {{nombre}}\n\n50% completado ✅\n\nLa mitad del camino. El equipo no para. 🚀',
    hashtags: ['#Escala', '#MitadDelCamino', '#EmprendimientoColombia'],
    auto: true,
    activoFb: true,
    activoIg: true,
  },

  proyecto_hito_75: {
    textFb: '⚡ {{nombre}} tiene el 75% listo.\n\nYa falta poco. Este equipo está demostrando que la colaboración funciona. 💚\n\n👉 {{url}}',
    textIg: '⚡ {{nombre}}\n\n75% listo ✅\n\nCasi en la meta. 💚',
    hashtags: ['#Escala', '#CasiListo', '#EmprendimientoColombia'],
    auto: true,
    activoFb: true,
    activoIg: true,
  },

  proyecto_hito_100: {
    textFb: '🏆 {{nombre}} completó el 100% de su plan de ejecución.\n\nDe idea a realidad. Esto es exactamente para lo que existe Escala. 🎉\n\n👉 {{url}}',
    textIg: '🏆 {{nombre}}\n\n100% completado 🎉\n\nDe idea a realidad. Esto es Escala.',
    hashtags: ['#Escala', '#100Porciento', '#EmprendimientoColombia', '#ÉxitoColaborativo'],
    auto: false, // requiere aprobación manual — es un hito importante
    activoFb: true,
    activoIg: true,
  },

  proyecto_primera_venta: {
    textFb: '💰 ¡Primera venta!\n\n{{nombre}} acaba de conseguir su primer cliente pagador. De idea a negocio real. Felicitaciones al equipo. 🎊\n\n👉 {{url}}',
    textIg: '💰 Primera venta conseguida\n\n{{nombre}} tiene su primer cliente. 🎊\n\nAsí empieza todo.',
    hashtags: ['#Escala', '#PrimeraVenta', '#EmprendimientoColombia', '#NegocioReal'],
    auto: false,
    activoFb: true,
    activoIg: true,
  },

  proyecto_financiado: {
    textFb: '🌱 {{nombre}} consiguió inversión.\n\nOtro proyecto de Escala da el salto. Los inversionistas están apostando por el talento colombiano. 🇨🇴\n\n👉 {{url}}',
    textIg: '🌱 {{nombre}} consiguió inversión 🎉\n\nEl talento colombiano sigue atrayendo capital. 🇨🇴',
    hashtags: ['#Escala', '#Inversión', '#StartupColombia', '#TalentoColombia'],
    auto: false,
    activoFb: true,
    activoIg: true,
  },

  // ─── EMPRESAS ────────────────────────────────────────────────────────────────

  empresa_creada: {
    textFb: '🏢 Nueva empresa creada mediante Escala: {{nombre}}\n\nUn equipo colaborativo convirtió una idea en una empresa real. Así funciona la economía del futuro. 💚\n\n👉 {{url}}',
    textIg: '🏢 Nueva empresa en Escala\n\n{{nombre}}\n\nDe idea a empresa real. 💚',
    hashtags: ['#Escala', '#NuevaEmpresa', '#EmprendimientoColombia', '#EconomíaColaborativa'],
    auto: false,
    activoFb: true,
    activoIg: true,
  },

  empresa_verificada: {
    textFb: '✅ {{nombre}} es ahora una empresa verificada en Escala.\n\nVerificación = confianza. La plataforma garantiza que este negocio es real y cumple con los estándares de Escala.\n\n👉 {{url}}',
    textIg: '✅ {{nombre}} verificada en Escala\n\nConfianza garantizada. 🔐',
    hashtags: ['#Escala', '#EmpresaVerificada', '#Confianza', '#EmprendimientoColombia'],
    auto: true,
    activoFb: true,
    activoIg: true,
  },

  empresa_inicia_operaciones: {
    textFb: '🚀 {{nombre}} inicia operaciones.\n\nOtra empresa nacida en Escala abre sus puertas. Bienvenidos al mercado. 🎊\n\n👉 {{url}}',
    textIg: '🚀 {{nombre}} abre sus puertas 🎊\n\nNacida en Escala. Bienvenida al mercado.',
    hashtags: ['#Escala', '#NuevaEmpresa', '#EmprendimientoColombia', '#AbresusPuertas'],
    auto: false,
    activoFb: true,
    activoIg: true,
  },

  empresa_nuevo_pais: {
    textFb: '🌎 {{nombre}} llega a {{pais}}.\n\nExpansión internacional de una empresa nacida en Escala. El talento colombiano no tiene fronteras. 🇨🇴\n\n👉 {{url}}',
    textIg: '🌎 {{nombre}} llega a {{pais}}\n\nExpansión internacional. 🇨🇴\n\nEl talento no tiene fronteras.',
    hashtags: ['#Escala', '#ExpansiónInternacional', '#Colombia', '#TalentoColombia'],
    auto: false,
    activoFb: true,
    activoIg: true,
  },

  // ─── PERFILES REQUERIDOS ─────────────────────────────────────────────────────

  perfil_requerido: {
    textFb: '🔍 Se busca: {{rol}}\n\nProyecto en Escala necesita un especialista. Si tienes experiencia en {{sector}} y quieres participar en la creación de una empresa colaborativa, esta es tu oportunidad.\n\n👉 {{url}}',
    textIg: '🔍 Se busca {{rol}}\n\nProyecto en Escala necesita tu expertise en {{sector}}.\n\n🔗 escala.network',
    hashtags: ['#Escala', '#OportunidadLaboral', '#EspecialistaBuscado', '#EmprendimientoColombia', '#TrabajoColaborativo'],
    auto: true,
    activoFb: true,
    activoIg: true,
  },

  perfil_cubierto: {
    textFb: '✅ Perfil cubierto: {{rol}} en {{nombre}}.\n\nEl equipo está completo. Cuando el talento correcto encuentra el proyecto correcto, pasan cosas. 💚',
    textIg: '✅ Perfil cubierto: {{rol}}\n\nEl equipo está completo en {{nombre}}. 💚',
    hashtags: ['#Escala', '#PerfilCubierto', '#EquipoCompleto', '#EmprendimientoColombia'],
    auto: true,
    activoFb: true,
    activoIg: false,
  },

  perfil_urgente: {
    textFb: '⚡ URGENTE: Se busca {{rol}}\n\nProyecto {{nombre}} necesita este perfil de inmediato. Si eres el especialista o conoces a alguien, comparte este post. 🙏\n\n👉 {{url}}',
    textIg: '⚡ URGENTE: Se busca {{rol}}\n\nProyecto {{nombre}} te necesita ya.\n\n🔗 escala.network',
    hashtags: ['#Escala', '#Urgente', '#OportunidadYa', '#EspecialistaBuscado', '#EmprendimientoColombia'],
    auto: false,
    activoFb: true,
    activoIg: true,
  },

}

// ─── Función de resolución de plantilla ──────────────────────────────────────

/**
 * Resuelve una plantilla reemplazando variables con datos reales.
 * @param {string} tipoEvento - clave del evento (ej: 'proyecto_publicado')
 * @param {object} datos - objeto con los valores a inyectar
 * @returns {{ textFb, textIg, auto, activoFb, activoIg }} o null si no existe
 */
export function resolverPlantilla(tipoEvento, datos = {}) {
  const plantilla = PLANTILLAS[tipoEvento]
  if (!plantilla) return null

  function reemplazar(texto) {
    return texto.replace(/\{\{(\w+)\}\}/g, (_, key) => datos[key] ?? `[${key}]`)
  }

  const hashtagsStr = plantilla.hashtags.join(' ')

  return {
    textFb: `${reemplazar(plantilla.textFb)}\n\n${hashtagsStr}`,
    textIg: `${reemplazar(plantilla.textIg)}\n\n${hashtagsStr}`,
    auto: plantilla.auto,
    activoFb: plantilla.activoFb,
    activoIg: plantilla.activoIg,
  }
}

export { PLANTILLAS }
