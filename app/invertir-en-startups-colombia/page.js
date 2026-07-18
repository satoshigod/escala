import Link from 'next/link'
export const metadata = {
  title: 'Invertir en startups colombianas — Escala',
  description: 'Invierte en startups y negocios reales en Colombia desde $500.000 COP. Financia equipos, maquinaria o capital de trabajo a cambio de participacion, cuotas o revenue share.',
  keywords: ['invertir en startups colombia', 'angel investor colombia', 'como invertir en startups', 'inversion startups colombia', 'financiar emprendimientos colombia'],
}
const s = {
  page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff' },
  hero: { maxWidth: '860px', margin: '0 auto', padding: '5rem 1.5rem 3rem', textAlign: 'center' },
  h1: { fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '1.25rem', lineHeight: '1.15' },
  sub: { fontSize: '1.1rem', color: '#8FA3CC', lineHeight: '1.7', maxWidth: '600px', margin: '0 auto 2.5rem' },
  btn: { display: 'inline-block', background: '#4A90D9', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '1rem', fontWeight: '700', marginRight: '1rem' },
  wrap: { maxWidth: '860px', margin: '0 auto', padding: '0 1.5rem 5rem' },
  h2: { fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' },
}
export default function Page() {
  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4A90D9', marginBottom: '1rem' }}>Angel Investor · Colombia</div>
        <h1 style={s.h1}>Invierte en negocios reales<br/>desde $500.000 COP.</h1>
        <p style={s.sub}>No inviertes en el proyecto completo — inviertes en el horno, el servidor o el local que ese negocio necesita. Tu defines a cambio de que y cuanto.</p>
        <Link href="/registro" style={s.btn}>Crear cuenta de inversor →</Link>
        <Link href="/directorio-inversion" style={{ ...s.btn, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>Ver oportunidades</Link>
      </div>
      <div style={s.wrap}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem', marginBottom: '4rem' }}>
          {[
            { titulo: 'Inviertes por item, no por proyecto', desc: 'Ves exactamente que estas financiando: una maquina, un empleado, tecnologia. No es una caja negra.' },
            { titulo: 'Tu defines los terminos', desc: 'Participacion en el negocio, cuotas mensuales con tasa, o porcentaje de ventas. Tu eliges segun tu perfil de riesgo.' },
            { titulo: 'Desde montos pequeños', desc: 'No necesitas ser un fondo de capital riesgo. Puedes invertir desde $500.000 COP en un item especifico.' },
            { titulo: 'Panel de seguimiento', desc: 'Ves el estado de tu inversion en tiempo real. Cuando el negocio reporta ventas, ves cuanto te corresponde.' },
          ].map(c => (
            <div key={c.titulo} style={s.card}>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#4A90D9', marginBottom: '0.5rem' }}>{c.titulo}</div>
              <div style={{ fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6' }}>{c.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <Link href="/directorio-inversion" style={s.btn}>Ver negocios que buscan inversion →</Link>
        </div>
      </div>
    </div>
  )
}
