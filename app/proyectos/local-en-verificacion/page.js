'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import NavApp from '@/components/NavApp'

function Contenido() {
  const params = useSearchParams()
  const proyectoId = params.get('id')
  const capital = params.get('capital')

  const fmt = (n) => parseFloat(n || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })

  return (
    <div style={{ minHeight: '100vh', background: '#0B1628', fontFamily: 'Inter,sans-serif', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>

      {/* Icono de estado */}
      <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(74,144,217,0.15)', border: '2px solid rgba(74,144,217,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1.5rem' }}>
        🔍
      </div>

      <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
        Tu solicitud está en revisión
      </h1>

      <p style={{ fontSize: '0.95rem', color: '#8FA3CC', textAlign: 'center', lineHeight: '1.7', maxWidth: '480px', marginBottom: '2rem' }}>
        Recibimos la información de tu negocio. Escala va a contactar al propietario del local para verificar que todo está correcto antes de publicar tu proyecto a los inversionistas.
      </p>

      {/* Qué pasa ahora */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '1.5rem', maxWidth: '480px', width: '100%', marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#8FA3CC', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1rem' }}>Qué pasa ahora</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { num: '1', titulo: 'Verificamos el local', desc: 'Llamamos al propietario para confirmar la dirección, el valor del arriendo y los meses de depósito.', estado: 'activo', color: '#4A90D9' },
            { num: '2', titulo: 'Revisamos tu proyección', desc: 'Un asesor de Escala revisa si los números que pusiste son coherentes con el tipo de negocio.', estado: 'pendiente', color: '#6B7280' },
            { num: '3', titulo: 'Publicamos a inversionistas', desc: `Tu proyecto aparece para los Inversionistas con el capital requerido${capital ? `: $${fmt(capital)}` : ''}.`, estado: 'pendiente', color: '#6B7280' },
            { num: '4', titulo: 'Un ángel financia el proyecto', desc: 'Cuando un inversionista acepta, el capital llega al propietario del local y tu negocio arranca.', estado: 'pendiente', color: '#6B7280' },
          ].map(paso => (
            <div key={paso.num} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: paso.estado === 'activo' ? 'rgba(74,144,217,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${paso.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: '700', color: paso.color, flexShrink: 0 }}>{paso.num}</div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: paso.estado === 'activo' ? '#fff' : '#6B7280', marginBottom: '0.2rem' }}>{paso.titulo}</div>
                <div style={{ fontSize: '0.78rem', color: paso.estado === 'activo' ? '#8FA3CC' : '#4B5563', lineHeight: '1.5' }}>{paso.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: '0.8rem', color: '#6B7280', textAlign: 'center', marginBottom: '1.5rem' }}>
        El proceso de verificación toma entre 24 y 48 horas hábiles. Te notificamos por la plataforma cuando esté listo.
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="/dashboard" style={{ background: '#1D9E75', color: '#fff', padding: '0.75rem 1.75rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '700' }}>
          Ir al dashboard →
        </a>
        {proyectoId && (
          <a href={`/proyectos/${proyectoId}/workspace`} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.75rem 1.75rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.9rem' }}>
            Ver mi proyecto
          </a>
        )}
      </div>
    </div>
  )
}

export default function LocalEnVerificacionPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0B1628' }} />}>
      <Contenido />
    </Suspense>
  )
}
