'use client'
// app/qa-componentes/page.js
//
// Galería visual de los componentes base (C0.5). No es un test funcional como /qa
// (esos verifican datos contra Supabase); esto es verificación visual: renderiza
// cada componente en todas sus variantes para (1) confirmar de un vistazo que se ven
// bien y (2) servir de referencia viva cuando se migren más páginas a estos componentes.

import { useState } from 'react'
import { Card, Pill, EmptyState, Modal, TONOS } from '../../components/base'

export default function QAComponentes() {
  const [modalAbierto, setModalAbierto] = useState(false)
  const tonos = Object.keys(TONOS)

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B3E', color: '#fff', fontFamily: 'Inter, sans-serif', padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '0.5rem' }}>
          Componentes base <span style={{ color: '#1D9E75' }}>(C0.5)</span>
        </h1>
        <p style={{ color: '#8FA3CC', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
          Galería de los 4 componentes reutilizables. Reemplazan los patrones que antes se copiaban inline en 116 páginas.
        </p>

        {/* CARD */}
        <Seccion titulo="Card — superficie con tono">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {tonos.map(t => (
              <Card key={t} tono={t}>
                <div style={{ fontWeight: '700', marginBottom: '0.3rem', textTransform: 'capitalize' }}>{t}</div>
                <div style={{ color: '#8FA3CC', fontSize: '0.8rem' }}>Card con tono {t}</div>
              </Card>
            ))}
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Card tono="verde" href="/dashboard">
              <div style={{ fontWeight: '700' }}>Card clickeable (con href) →</div>
              <div style={{ color: '#8FA3CC', fontSize: '0.8rem' }}>Toda la tarjeta es un enlace</div>
            </Card>
          </div>
        </Seccion>

        {/* PILL */}
        <Seccion titulo="Pill — badge de estado">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1rem' }}>
            {tonos.map(t => (
              <Pill key={t} tono={t}>{t}</Pill>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {tonos.map(t => (
              <Pill key={t} tono={t} solido>{t} sólido</Pill>
            ))}
          </div>
        </Seccion>

        {/* EMPTY STATE */}
        <Seccion titulo="EmptyState — estado vacío">
          <Card tono="neutro">
            <EmptyState
              icon="📭"
              titulo="Aún no hay nada aquí"
              descripcion="Cuando haya actividad, aparecerá en esta sección. Este es el patrón de estado vacío."
              accion={<Pill tono="verde" solido>Acción opcional</Pill>}
            />
          </Card>
        </Seccion>

        {/* MODAL */}
        <Seccion titulo="Modal — overlay + panel">
          <button
            onClick={() => setModalAbierto(true)}
            style={{ background: '#1D9E75', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >
            Abrir modal
          </button>
          <Modal abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} titulo="Ejemplo de modal">
            <p style={{ color: '#C8D4E8', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Este es el contenido del modal. Cierra con la × de arriba, con la tecla Escape, o haciendo click fuera del panel.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setModalAbierto(false)}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#8FA3CC', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => setModalAbierto(false)}
                style={{ background: '#1D9E75', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
              >
                Confirmar
              </button>
            </div>
          </Modal>
        </Seccion>
      </div>
    </div>
  )
}

function Seccion({ titulo, children }) {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#8FA3CC', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {titulo}
      </h2>
      {children}
    </div>
  )
}
