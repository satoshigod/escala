import Link from 'next/link'
export const metadata = {
  title: 'Como abrir un salon de belleza o peluqueria sin capital en Colombia — Escala Blog',
  description: 'Tienes las clientas pero te falta el equipo. Silla hidráulica, secadora de casco, cabina de ozono. Te explicamos cómo conseguirlos sin banco ni codeudor.',
  keywords: ['abrir salon belleza sin capital','como financiar peluqueria Colombia','silla hidraulica sin credito','equipo peluqueria sin banco','como montar salon belleza Medellin'],
}
const s = {
  page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff' },
  wrap: { maxWidth: '720px', margin: '0 auto', padding: '5rem 1.5rem' },
  h1: { fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '1rem', lineHeight: '1.2' },
  meta: { fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '2.5rem' },
  p: { fontSize: '1rem', color: '#C8D4E8', lineHeight: '1.8', marginBottom: '1.25rem' },
  h2: { fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: '2.5rem 0 1rem', letterSpacing: '-0.02em' },
  callout: { background: 'rgba(217,70,239,0.06)', border: '1px solid rgba(217,70,239,0.2)', borderRadius: '12px', padding: '1.25rem 1.5rem', margin: '2rem 0' },
  btn: { display: 'inline-block', background: '#D946EF', color: '#fff', padding: '0.75rem 1.75rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', marginTop: '2rem' },
}
export default function Page() {
  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D946EF', marginBottom: '0.75rem' }}>Blog · Belleza y estética</div>
        <h1 style={s.h1}>Como abrir o mejorar tu salon de belleza sin tener el capital para el equipo</h1>
        <div style={s.meta}>Escala · Julio 2026 · 5 min de lectura</div>
        <p style={s.p}>Miles de estilistas en Colombia hacen cabello, uñas o tratamientos desde su casa o en un pequeño espacio, con clientas fijas y años de experiencia. El problema no es la demanda — es que con el equipo que tienen no pueden crecer ni cobrar por servicios que generan más.</p>
        <p style={s.p}>Una silla hidráulica profesional cuesta entre $800.000 y $2.000.000. Una secadora de casco $1.500.000. Una cabina de ozono hasta $8.000.000. El banco no financia eso si trabajas informal.</p>
        <h2 style={s.h2}>El problema real</h2>
        <p style={s.p}>Sin secadora de casco no puedes hacer tratamientos de hidratación que cobran $60.000 por sesión. Sin silla hidráulica profesional no puedes atender cortes que cobran $35.000 con la comodidad que exigen. Sin cabina de ozono no puedes ofrecer tratamientos capilares premium que cobran $120.000.</p>
        <p style={s.p}>Es decir, el equipo no es un lujo — es lo que determina qué servicios puedes ofrecer y cuánto puedes cobrar.</p>
        <h2 style={s.h2}>Como funciona el financiamiento desde el excedente</h2>
        <p style={s.p}>Un ángel inversionista compra el equipo que necesitas. Tú lo usas desde el primer día. Del excedente adicional que genera el equipo nuevo — la diferencia entre lo que ganas con él y lo que ganabas sin él — un porcentaje va al ángel como abono mensual.</p>
        <div style={s.callout}>
          <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#D946EF', marginBottom: '0.75rem' }}>Ejemplo: Sandra en Medellín</div>
          <p style={{ ...s.p, marginBottom: '0.5rem' }}>Sandra tiene 25 clientas fijas para cabello pero sin secadora de casco no puede hacer tratamientos de hidratación. La secadora cuesta $2.800.000.</p>
          <p style={{ ...s.p, marginBottom: '0.5rem' }}>Con la secadora puede ofrecer 3 hidrataciones adicionales por semana a $60.000 cada una: $720.000 más por mes. Si el 80% de ese excedente va al ángel, abona $576.000 por mes y paga el equipo en menos de 5 meses.</p>
        </div>
        <h2 style={s.h2}>Que equipos se financian</h2>
        <p style={s.p}>Sillas hidráulicas profesionales, secadoras de casco, hornos UV y LED para uñas, planchas de vapor, cabinas de ozono, lámparas de fotones, vaporizadores faciales y camillas eléctricas. El criterio es que el equipo genere ingresos desde el primer día de uso.</p>
        <Link href="/equipos-salon-belleza-medellin" style={s.btn}>Ver programa de equipos →</Link>
      </div>
    </div>
  )
}
