// app/startup-santiago/page.js
export const metadata = {
  title: 'Crear Startup en Santiago de Chile — Cofundadores y Equipo',
  description: 'La plataforma para emprendedores en Santiago. Encuentra cofundadores, desarrolladores y especialistas en la capital chilena. Crea tu empresa sin capital inicial para el equipo.',
  keywords: ['startup santiago', 'emprendimiento santiago', 'cofundador santiago', 'crear empresa santiago', 'startup chile capital', 'desarrollador santiago', 'start-up chile'],
  openGraph: { title: 'Crear Startup en Santiago — Escala', description: 'Emprendimiento en Santiago de Chile. Cofundadores y especialistas en un solo lugar.', url: 'https://escala.network/startup-santiago', images: [{ url: 'https://escala.network/brand/og-default.png?v=3', width: 1200, height: 630 }] },
  alternates: { canonical: 'https://escala.network/startup-santiago' },
}
const s = {
  page: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter,sans-serif', color: '#fff' },
  nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: '1.1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', textDecoration: 'none' },
  hero: { maxWidth: '900px', margin: '0 auto', padding: '5rem 1.5rem 4rem' },
  tag: { display: 'inline-block', background: 'rgba(255,196,0,0.1)', border: '1px solid rgba(255,196,0,0.3)', color: '#FFC400', fontSize: '0.75rem', fontWeight: '700', padding: '0.3rem 0.875rem', borderRadius: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1.5rem' },
  h1: { fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: '900', lineHeight: '1.1', letterSpacing: '-0.03em', marginBottom: '1.5rem', color: '#fff' },
  sub: { fontSize: '1.1rem', color: '#8FA3CC', lineHeight: '1.7', maxWidth: '600px', marginBottom: '2.5rem' },
  btn: { background: '#1D9E75', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', display: 'inline-block' },
  btn2: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600', display: 'inline-block' },
  section: { maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 4rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem', marginBottom: '3rem' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem' },
}
export default function StartupSantiagoPage() {
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href="/" style={s.logo}>Esca<span style={{ color: '#1D9E75' }}>la</span></a>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/buscar-cofundador" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>Cofundadores</a>
          <a href="/startup-chile" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>Chile</a>
          <a href="/registro" style={{ background: '#1D9E75', color: '#fff', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>Comenzar gratis</a>
        </div>
      </nav>
      <section style={s.hero}>
        <div style={s.tag}>🇨🇱 Santiago de Chile</div>
        <h1 style={s.h1}>Crea tu startup en Santiago con el equipo correcto</h1>
        <p style={s.sub}>Santiago concentra el 70% del ecosistema de startups chileno — Start-Up Chile, CORFO, Endeavor, decenas de VCs. En Escala puedes armar el equipo que necesitas para aprovechar ese ecosistema sin capital inicial.</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/registro" style={s.btn}>Publicar mi proyecto →</a>
          <a href="/startup-chile" style={s.btn2}>Ver más sobre Chile →</a>
        </div>
      </section>
      <section style={s.section}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '1.5rem' }}>Santiago: el ecosistema más maduro de Sudamérica</h2>
        <div style={s.grid}>
          {[
            { icon: '🚀', title: 'Start-Up Chile', desc: 'El programa de CORFO que ha impulsado más de 1,800 startups de 85 países. Santiago es la puerta de entrada a ese ecosistema.' },
            { icon: '💰', title: 'Capital activo', desc: 'Santiago tiene fondos como Manutara Ventures, Fen Ventures y Austral Capital — más activos que cualquier otra capital de la región.' },
            { icon: '🌐', title: 'Hub regional', desc: 'Zona horaria compatible con toda América del Sur y del Norte. Empresas que escalan desde Santiago llegan más fácil a toda la región.' },
            { icon: '📚', title: 'Talento de primer nivel', desc: 'PUC, Universidad de Chile, Adolfo Ibáñez y UAI generan egresados de ingeniería, derecho y negocios que buscan proyectos con impacto.' },
            { icon: '🏢', title: 'Infraestructura tech', desc: 'Santiago tiene los mejores índices de conectividad, infraestructura digital y acceso a servicios cloud de Sudamérica.' },
            { icon: '🤝', title: 'Comunidad emprendedora', desc: 'Meetups, aceleradoras, coworkings y eventos de networking hacen de Santiago una ciudad donde construir red es fácil.' },
          ].map(item => (
            <div key={item.title} style={s.card}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{item.icon}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.4rem' }}>{item.title}</div>
              <div style={{ fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>
      <div style={{ padding: '0 1.5rem 5rem', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '20px', padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>¿Tienes una idea en Santiago? Empieza hoy</h2>
          <a href="/registro" style={s.btn}>Crear cuenta gratis →</a>
        </div>
      </div>
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>
          © 2026 Escala Network ·{' '}
          <a href="/startup-chile" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Chile</a> ·{' '}
          <a href="/startup-colombia" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Colombia</a> ·{' '}
          <a href="/registro" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Registro</a>
        </div>
      </footer>
    </div>
  )
}
