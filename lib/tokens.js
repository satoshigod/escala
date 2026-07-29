// lib/tokens.js
//
// Design tokens de Escala: la fuente UNICA de verdad para los colores de marca (C0.9).
//
// El problema: los colores estan hardcodeados cientos de veces en estilos inline por
// todo el codigo (#8FA3CC ~1200 veces, #1D9E75 ~770, etc.). Cambiar la paleta hoy
// significa buscar y reemplazar en 116 archivos — inviable y propenso a errores.
//
// La solucion: nombrar cada color aqui una sola vez. El codigo nuevo importa de este
// modulo en vez de escribir el hex a mano, y el codigo viejo se migra progresivamente.
// Cuando se quiera cambiar la paleta, se cambia AQUI y punto.
//
// Uso:
//   import { COLOR, TONO, tono } from '@/lib/tokens'
//   <div style={{ color: COLOR.textoSecundario, background: TONO.verde.hex }}>
//   <div style={{ border: `1px solid ${tono('verde', 0.2)}` }}>  // rgba con alpha

'use strict'

// ---------------------------------------------------------------------------
// TONOS DE MARCA — cada uno con su hex y su rgb (para construir rgba con alpha).
// El nombre es semantico (que significa), no descriptivo (que color es), para que
// cambiar el color no obligue a renombrar.
// ---------------------------------------------------------------------------
const TONO = {
  verde:   { rgb: '29,158,117',  hex: '#1D9E75' }, // marca principal, exito
  naranja: { rgb: '232,160,32',  hex: '#E8A020' }, // finanzas, alerta suave, pendiente
  morado:  { rgb: '83,74,183',   hex: '#534AB7' }, // inversion, destacado
  lila:    { rgb: '175,169,236', hex: '#AFA9EC' }, // inversion clara, angel
  azul:    { rgb: '74,144,217',  hex: '#4A90D9' }, // local comercial, info
  rojo:    { rgb: '224,85,85',   hex: '#E05555' }, // error, destructivo
  neutro:  { rgb: '255,255,255', hex: '#C8D4E8' }, // superficie sin tono
}

// Construye un rgba(tono, alpha) — el patron mas repetido en el codigo para fondos
// y bordes tenues. tono('verde', 0.08) -> 'rgba(29,158,117,0.08)'.
function tono(nombre, alpha = 1) {
  const t = TONO[nombre] || TONO.neutro
  return alpha === 1 ? t.hex : `rgba(${t.rgb},${alpha})`
}

// ---------------------------------------------------------------------------
// COLORES SEMANTICOS — texto, superficies, bordes. Los valores fijos mas usados.
// ---------------------------------------------------------------------------
const COLOR = {
  // Texto
  textoPrimario:   '#fff',       // titulos, valores importantes
  textoSecundario: '#8FA3CC',    // el mas usado (~1200): subtitulos, descripciones
  textoTerciario:  '#6B7280',    // texto tenue, placeholders
  textoCuaternario:'#4B5563',    // aun mas tenue

  // Superficies (fondo, de mas claro a mas profundo)
  fondoPanel:      '#15234a',    // paneles, modales
  fondoPanelAlt:   '#1a2a4a',    // paneles alternos
  fondoProfundo:   '#0D1B3E',    // fondo de pagina
  fondoProfundoAlt:'#0B1628',    // fondo aun mas oscuro
  fondoNegro:      '#080F20',    // el mas oscuro

  // Bordes y superficies translucidas (sobre fondo oscuro)
  superficie:      'rgba(255,255,255,0.04)',  // card sin tono
  superficieHover: 'rgba(255,255,255,0.06)',
  borde:           'rgba(255,255,255,0.12)',
  bordeSutil:      'rgba(255,255,255,0.08)',

  // Tipografia
  fuente:          'Inter, sans-serif',
}

// ---------------------------------------------------------------------------
// Alias de compatibilidad: TONOS y COLORES eran los nombres previos en base.js.
// Se mantienen para no romper imports existentes mientras se migra.
// ---------------------------------------------------------------------------
const TONOS = TONO
const COLORES = COLOR

module.exports = { TONO, TONOS, COLOR, COLORES, tono }
