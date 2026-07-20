import Link from 'next/link'
export const metadata = {
  title: 'Crear startup en España sin capital — Escala',
  description: 'La plataforma donde encuentras lo que necesitas para crear o hacer crecer tu empresa en España — talento, capital y especialistas en un solo lugar.',
  keywords: ['startup España', 'crear empresa España sin capital', 'emprendimiento España', 'financiacion startups España', 'inversores angel España'],
}
const s = {
  page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff' },
  hero: { maxWidth: '860px', margin: '0 auto', padding: '5rem 1.5rem 3rem', textAlign: 'center' },
  h1: { fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '1.25rem', lineHeight: '1.15' },
  sub: { fontSize: '1.1rem', color: '#8FA3CC', lineHeight: '1.7', maxWidth: '600px', margin: '0 auto 2.5rem' },
  btn: { display: 'inline-block', background: '#1D9E75', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '1rem', fontWeight: '700', marginRight: '1rem' },
  wrap: { maxWidth: '860px', margin: '0 auto', padding: '0 1.5rem 5rem' },
  h2: { fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' },
}
export default function Page() {
  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '1rem' }}>Escala · España</div>
        <h1 style={s.h1}>Crea tu startup en España<br/>sin necesitar capital propio.</h1>
        <p style={s.sub}>El equipo trabaja por participacion diferida. Los inversores aportan capital por cada item especifico. Tu te enfocas en construir el producto.</p>
        <Link href="/registro" style={s.btn}>Crear proyecto gratis →</Link>
        <Link href="/que-es-escala" style={{ ...s.btn, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>Como funciona</Link>
      </div>
      <div style={s.wrap}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem', marginBottom: '4rem' }}>
          {[
            { titulo: 'Sin capital inicial', desc: 'Publica tu proyecto en Escala. El equipo se postula para trabajar por participacion. No necesitas pagar nomina desde el inicio.' },
            { titulo: 'Inversores por item', desc: 'Cuando necesitas un servidor, maquinaria o capital de trabajo, los angeles financian ese item especifico a cambio de participacion o retorno.' },
            { titulo: 'Empresa real en España', desc: 'Escala te guia en la constitucion de tu empresa como SL u otro tipo societario segun tus necesidades.' },
          ].map(c => (
            <div key={c.titulo} style={s.card}>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1D9E75', marginBottom: '0.5rem' }}>{c.titulo}</div>
              <div style={{ fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6' }}>{c.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ ...s.h2, textAlign: 'center' }}>Tu empresa en España empieza hoy</h2>
          <p style={{ color: '#8FA3CC', marginBottom: '2rem' }}>Miles de emprendedores en Latinoamerica ya estan construyendo con Escala.</p>
          <Link href="/registro" style={s.btn}>Empezar gratis →</Link>
        </div>
      </div>
    </div>
  )
}
