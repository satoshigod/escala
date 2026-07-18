import Link from 'next/link'
export const metadata = {
  title: 'Financiar equipos para tu negocio — Escala',
  description: 'Consigue el capital para los equipos que necesita tu negocio. Tecnologia, maquinaria, vehiculos. Un inversionista los financia y tu pagas desde tus ingresos.',
  keywords: ['financiar equipos negocio', 'capital para equipos', 'como financiar equipos empresa', 'inversion equipos negocio colombia', 'financiacion activos empresa'],
}
const s = {
  page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff' },
  hero: { maxWidth: '860px', margin: '0 auto', padding: '5rem 1.5rem 3rem', textAlign: 'center' },
  h1: { fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '1.25rem', lineHeight: '1.15' },
  sub: { fontSize: '1.1rem', color: '#8FA3CC', lineHeight: '1.7', maxWidth: '600px', margin: '0 auto 2.5rem' },
  btn: { display: 'inline-block', background: '#4A90D9', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '1rem', fontWeight: '700' },
  wrap: { maxWidth: '860px', margin: '0 auto', padding: '0 1.5rem 5rem' },
  h2: { fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' },
}
export default function Page() {
  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4A90D9', marginBottom: '1rem' }}>Financiacion de equipos</div>
        <h1 style={s.h1}>Los equipos que tu negocio necesita,<br/>financiados por un inversionista real.</h1>
        <p style={s.sub}>No necesitas banco ni historial crediticio. Un angel de Escala financia el equipo especifico que necesitas — tu lo pagas desde los ingresos que ese equipo genera.</p>
        <Link href="/proyectos?escenario=otro" style={s.btn}>Agregar lo que necesito →</Link>
      </div>
      <div style={s.wrap}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem', marginBottom: '4rem' }}>
          {[
            { titulo: 'El angel financia el item especifico', desc: 'No invierte en el proyecto completo — invierte en el horno, el servidor o el vehiculo. Tu sabes exactamente que estas dando a cambio.' },
            { titulo: 'Tu defines los terminos', desc: 'Porcentaje de participacion, cuotas mensuales o porcentaje de ventas. Tu eliges el modelo que mejor funciona para tu negocio.' },
            { titulo: 'Sin banco, sin garante', desc: 'Escala no evalua historial crediticio. Evaluamos la viabilidad del negocio y el potencial del equipo que vas a comprar.' },
          ].map(c => (
            <div key={c.titulo} style={s.card}>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#4A90D9', marginBottom: '0.5rem' }}>{c.titulo}</div>
              <div style={{ fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6' }}>{c.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/proyectos?escenario=otro" style={s.btn}>Publicar lo que necesito gratis →</Link>
        </div>
      </div>
    </div>
  )
}
