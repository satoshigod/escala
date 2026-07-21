import Link from 'next/link'
export const metadata = {
  title: 'Como crear una empresa en Colombia sin capital — Escala',
  description: 'Guia completa para crear tu empresa en Colombia sin dinero inicial. Modelo de participacion diferida: el equipo trabaja por acciones, los inversores financian por item.',
  keywords: ['como crear empresa colombia', 'crear empresa sin capital colombia', 'constituir empresa colombia', 'emprender colombia sin dinero', 'startup colombia guia'],
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
  paso: { display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.25rem' },
  num: { width: '32px', height: '32px', borderRadius: '50%', background: '#1D9E75', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700', flexShrink: 0 },
}
export default function Page() {
  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '1rem' }}>Guia · Colombia</div>
        <h1 style={s.h1}>Como crear una empresa en Colombia<br/>sin tener el capital.</h1>
        <p style={s.sub}>El modelo de participacion diferida permite que el equipo trabaje por acciones mientras los inversores aportan el capital que el negocio necesita. Escala lo hace posible.</p>
        <Link href="/registro" style={s.btn}>Empezar ahora →</Link>
        <Link href="/blog/como-constituir-una-empresa-sas-en-colombia" style={{ ...s.btn, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>Guia SAS Colombia</Link>
      </div>
      <div style={s.wrap}>
        <h2 style={s.h2}>El proceso paso a paso</h2>
        <div style={{ marginBottom: '4rem' }}>
          {[
            { n:'1', t:'Publica tu idea en Escala', d:'Describe tu proyecto, que busca hacer, en que sector y que tipo de personas necesitas. No necesitas plan de negocios ni capital.' },
            { n:'2', t:'Construye tu equipo', d:'Especialistas y cofundadores se postulan para trabajar por participacion diferida. Tu aceptas los que encajan con el proyecto.' },
            { n:'3', t:'Consigue el capital por item', d:'Para cada cosa que necesitas comprar (servidor, maquina, local), un inversionista lo financia a cambio de participacion o retorno.' },
            { n:'4', t:'Constituye la empresa cuando sea el momento', d:'Escala te guia en la constitucion como SAS en la Camara de Comercio cuando el proyecto lo requiera.' },
          ].map(p => (
            <div key={p.n} style={s.paso}>
              <div style={s.num}>{p.n}</div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.3rem' }}>{p.t}</div>
                <div style={{ fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6' }}>{p.d}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <Link href="/registro" style={s.btn}>Crear mi proyecto gratis →</Link>
        </div>
      </div>
    </div>
  )
}
