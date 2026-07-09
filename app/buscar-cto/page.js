// app/buscar-cto/page.js
export const metadata = {
  title: 'Buscar CTO para tu Startup — Cofundador Técnico en Latinoamérica',
  description: 'Encuentra un CTO o cofundador técnico para tu startup en Colombia, México y Chile. En Escala los desarrolladores senior se unen como socios técnicos a cambio de participación diferida.',
  keywords: ['buscar cto startup', 'cto colombia', 'cofundador tecnico startup', 'buscar socio tecnico', 'cto mexico', 'desarrollador senior startup', 'socio tecnico latinoamerica'],
  openGraph: { title: 'Buscar CTO para tu Startup — Escala', description: 'Encuentra un cofundador técnico que se una por participación, no por salario.', url: 'https://escala.network/buscar-cto', images: [{ url: 'https://escala.network/brand/og-default.png?v=3', width: 1200, height: 630 }] },
  alternates: { canonical: 'https://escala.network/buscar-cto' },
}
const s = {
  page: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter,sans-serif', color: '#fff' },
  nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: '1.1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', textDecoration: 'none' },
  hero: { maxWidth: '900px', margin: '0 auto', padding: '5rem 1.5rem 4rem' },
  tag: { display: 'inline-block', background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.3)', color: '#4A90D9', fontSize: '0.75rem', fontWeight: '700', padding: '0.3rem 0.875rem', borderRadius: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1.5rem' },
  h1: { fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: '900', lineHeight: '1.1', letterSpacing: '-0.03em', marginBottom: '1.5rem', color: '#fff' },
  sub: { fontSize: '1.1rem', color: '#8FA3CC', lineHeight: '1.7', maxWidth: '600px', marginBottom: '2.5rem' },
  btn: { background: '#1D9E75', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', display: 'inline-block' },
  btn2: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600', display: 'inline-block' },
  section: { maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 4rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem', marginBottom: '3rem' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem' },
}
export default function BuscarCTOPage() {
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href="/" style={s.logo}>Esca<span style={{ color: '#1D9E75' }}>la</span></a>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/buscar-cofundador" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>Cofundadores</a>
          <a href="/directorio" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>Directorio</a>
          <a href="/registro" style={{ background: '#1D9E75', color: '#fff', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>Comenzar gratis</a>
        </div>
      </nav>
      <section style={s.hero}>
        <div style={s.tag}>💻 Cofundador Técnico / CTO</div>
        <h1 style={s.h1}>Busca un CTO para tu startup. Que se una como socio, no como empleado.</h1>
        <p style={s.sub}>Si tienes la idea y el negocio pero necesitas a alguien que construya el producto, Escala conecta fundadores con desarrolladores senior dispuestos a ser socios técnicos a cambio de participación diferida. No un freelancer. Un cofundador.</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/registro" style={s.btn}>Buscar mi CTO →</a>
          <a href="/directorio" style={s.btn2}>Ver desarrolladores disponibles</a>
        </div>
      </section>
      <section style={s.section}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '1.5rem' }}>CTO vs. Desarrollador freelance: la diferencia</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '3rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>Desarrollador freelance</div>
            {['Cobra por hora o proyecto', 'No tiene skin in the game', 'Sale cuando termina el contrato', 'Ejecuta lo que le pides', 'Sin compromiso con el éxito'].map(item => (
              <div key={item} style={{ fontSize: '0.82rem', color: '#8FA3CC', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#E05555' }}>✕</span> {item}
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(29,158,117,0.06)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '14px', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#1D9E75', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>CTO / Cofundador técnico</div>
            {['Trabaja por participación diferida', 'Tiene equity — gana si la empresa gana', 'Comprometido a largo plazo', 'Co-decide la arquitectura y el producto', 'Alineado con el éxito del proyecto'].map(item => (
              <div key={item} style={{ fontSize: '0.82rem', color: '#C8D4E8', padding: '0.4rem 0', borderBottom: '1px solid rgba(29,158,117,0.1)', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#1D9E75' }}>✓</span> {item}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={s.section}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '1.5rem' }}>Preguntas frecuentes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            ['¿Qué porcentaje de participación le doy a un CTO?', 'Depende del stage y de cuánto construye. Un CTO que entra desde cero en una startup sin producto puede recibir entre 10% y 30%. Uno que entra cuando ya hay tracción, entre 3% y 15%. No hay regla fija — se negocia en Escala con transparencia total.'],
            ['¿Cómo encuentro al CTO correcto en Escala?', 'Publica tu proyecto y el rol de Desarrollador Full-Stack (o CTO) con una descripción clara del producto que necesitas construir. Los desarrolladores que encajen se postulan. Revisas su perfil, su Escala Score y su historial de proyectos antes de aceptar a alguien.'],
            ['¿El CTO puede rechazar tareas o cambiar el stack tecnológico?', 'Sí. Un cofundador técnico tiene voz en las decisiones técnicas — eso es parte del trato. Si quieres solo ejecución sin criterio, un freelancer es lo que necesitas. Si quieres a alguien que co-construya el producto, necesitas un CTO.'],
            ['¿Qué pasa si el CTO se va antes de tiempo?', 'El contrato de participación en Escala puede incluir cláusulas de vesting — la participación se gana progresivamente según el tiempo y los hitos completados. Si el CTO se va antes, solo se lleva la parte que ganó, no la totalidad.'],
          ].map(([q, a]) => (
            <div key={q} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 0' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>{q}</h3>
              <p style={{ fontSize: '0.83rem', color: '#8FA3CC', lineHeight: '1.7', margin: 0 }}>{a}</p>
            </div>
          ))}
        </div>
      </section>
      <div style={{ padding: '0 1.5rem 5rem', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '20px', padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>Tu CTO te está esperando en Escala</h2>
          <p style={{ color: '#8FA3CC', marginBottom: '2rem', lineHeight: '1.6' }}>Publica tu proyecto y el rol técnico que necesitas. El CTO correcto llega solo.</p>
          <a href="/registro" style={s.btn}>Publicar mi proyecto →</a>
        </div>
      </div>
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>
          © 2026 Escala Network ·{' '}
          <a href="/buscar-cofundador" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Buscar cofundador</a> ·{' '}
          <a href="/desarrollador-startup-colombia" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Desarrolladores</a> ·{' '}
          <a href="/registro" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Registro</a>
        </div>
      </footer>
    </div>
  )
}
