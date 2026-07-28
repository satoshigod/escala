'use client'
// components/base.js
//
// Componentes base reutilizables de Escala (C0.5).
//
// Problema que resuelve: hasta ahora había 2 componentes para 116 páginas; todo lo
// demás (tarjetas, badges, modales, estados vacíos) estaba copiado inline en cada
// página, con el resultado de que llegaron a convivir dos diseños distintos de
// tarjeta de proyecto en el mismo dashboard. Estos 4 componentes son los 4 patrones
// más repetidos, extraídos del diseño real ya existente (NavApp, dashboard, proyectos).
//
// El objeto TONOS centraliza la paleta de marca. Hoy los colores están hardcodeados
// cientos de veces en estilos inline; este objeto es el primer paso hacia los design
// tokens de C0.9 — cuando se haga C0.9, TONOS es el único lugar que se toca.
//
// Uso:
//   import { Card, Pill, EmptyState, Modal, TONOS } from '@/components/base'
//
//   <Card tono="verde">contenido</Card>
//   <Pill tono="verde">Activo</Pill>
//   <EmptyState icon="📭" titulo="Aún no hay proyectos" descripcion="Publica el tuyo." />
//   <Modal abierto={x} onCerrar={() => setX(false)} titulo="Confirmar">contenido</Modal>

import { useEffect } from 'react'

// ---------------------------------------------------------------------------
// Paleta de marca — fuente única de verdad para color (semilla de C0.9)
// ---------------------------------------------------------------------------
export const TONOS = {
  verde:   { rgb: '29,158,117',  hex: '#1D9E75' }, // marca principal
  naranja: { rgb: '232,160,32',  hex: '#E8A020' }, // finanzas / alerta suave
  morado:  { rgb: '83,74,183',   hex: '#534AB7' }, // inversión / destacado
  azul:    { rgb: '74,144,217',  hex: '#4A90D9' }, // local comercial / info
  rojo:    { rgb: '224,85,85',   hex: '#E05555' }, // error / destructivo
  neutro:  { rgb: '255,255,255', hex: '#C8D4E8' }, // superficie sin tono
}

export const COLORES = {
  textoPrimario:   '#fff',
  textoSecundario: '#8FA3CC',
  textoTerciario:  '#6B7280',
  fondoPanel:      '#15234a',
  fondoProfundo:   '#0D1B3E',
  borde:           'rgba(255,255,255,0.12)',
  bordeSutil:      'rgba(255,255,255,0.08)',
  fuente:          'Inter, sans-serif',
}

function tono(nombre) {
  return TONOS[nombre] || TONOS.neutro
}

// ---------------------------------------------------------------------------
// Card — superficie con tono. Reemplaza el patrón repetido:
//   background: rgba(color,0.05) · border: 1px solid rgba(color,0.15) · radius 12
// ---------------------------------------------------------------------------
export function Card({
  tono: nombreTono = 'neutro',
  padding = '1.1rem',
  onClick,
  href,
  style = {},
  children,
}) {
  const t = tono(nombreTono)
  const esNeutro = nombreTono === 'neutro'

  const estilo = {
    background: esNeutro ? 'rgba(255,255,255,0.04)' : `rgba(${t.rgb},0.06)`,
    border: `1px solid ${esNeutro ? 'rgba(255,255,255,0.08)' : `rgba(${t.rgb},0.18)`}`,
    borderRadius: '12px',
    padding,
    ...(onClick || href ? { cursor: 'pointer', transition: 'all 0.15s' } : {}),
    ...style,
  }

  if (href) {
    return (
      <a href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div style={estilo}>{children}</div>
      </a>
    )
  }

  return (
    <div style={estilo} onClick={onClick}>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pill — badge de estado. Reemplaza el patrón:
//   fontSize 0.68 · weight 700 · padding 0.2/0.75 · radius 20 · fondo+borde+texto del tono
// ---------------------------------------------------------------------------
export function Pill({ tono: nombreTono = 'verde', solido = false, style = {}, children }) {
  const t = tono(nombreTono)

  const estilo = solido
    ? {
        background: t.hex,
        color: '#fff',
        border: '1px solid transparent',
      }
    : {
        background: `rgba(${t.rgb},0.15)`,
        color: t.hex,
        border: `1px solid rgba(${t.rgb},0.3)`,
      }

  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '0.68rem',
        fontWeight: '700',
        padding: '0.2rem 0.75rem',
        borderRadius: '20px',
        whiteSpace: 'nowrap',
        ...estilo,
        ...style,
      }}
    >
      {children}
    </span>
  )
}

// ---------------------------------------------------------------------------
// EmptyState — estado vacío. Reemplaza el patrón:
//   ícono grande + título blanco bold + descripción #8FA3CC, centrado
// ---------------------------------------------------------------------------
export function EmptyState({ icon = '📭', titulo, descripcion, accion, style = {} }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '2.5rem 1.5rem',
        ...style,
      }}
    >
      {icon && <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>{icon}</div>}
      {titulo && (
        <div style={{ color: '#fff', fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
          {titulo}
        </div>
      )}
      {descripcion && (
        <div style={{ color: '#8FA3CC', fontSize: '0.85rem', lineHeight: '1.5', maxWidth: '380px', margin: '0 auto' }}>
          {descripcion}
        </div>
      )}
      {accion && <div style={{ marginTop: '1.1rem' }}>{accion}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Modal — overlay + panel. Reemplaza el patrón de modal copiado (overlay oscuro,
// panel #15234a con borde). Cierra con Escape y con click en el overlay.
// ---------------------------------------------------------------------------
export function Modal({ abierto, onCerrar, titulo, ancho = '480px', style = {}, children }) {
  useEffect(() => {
    if (!abierto) return
    function onKey(e) {
      if (e.key === 'Escape' && onCerrar) onCerrar()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div
      onClick={onCerrar}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5,10,25,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#15234a',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '14px',
          padding: '1.5rem',
          width: '100%',
          maxWidth: ancho,
          maxHeight: '85vh',
          overflowY: 'auto',
          fontFamily: 'Inter, sans-serif',
          ...style,
        }}
      >
        {titulo && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.1rem',
            }}
          >
            <div style={{ color: '#fff', fontWeight: '800', fontSize: '1.05rem' }}>{titulo}</div>
            <button
              onClick={onCerrar}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8FA3CC',
                fontSize: '1.3rem',
                cursor: 'pointer',
                lineHeight: 1,
                padding: '0 0.25rem',
              }}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
