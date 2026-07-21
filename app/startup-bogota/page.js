// app/startup-bogota/page.js
export const metadata = {
  title: 'Crear Startup en Bogotá — Cofundadores y Equipo en la Capital',
  description: 'La plataforma para emprendedores en Bogotá. Encuentra cofundadores, desarrolladores, abogados y contadores en la capital colombiana. Crea tu empresa SAS sin capital inicial.',
  keywords: ['startup bogota', 'emprendimiento bogota', 'cofundador bogota', 'crear empresa bogota', 'startup colombia capital', 'desarrollador bogota', 'abogado bogota startup'],
  openGraph: { title: 'Crear Startup en Bogotá — Escala', description: 'Plataforma de emprendimiento en Bogotá. Cofundadores y especialistas en un solo lugar.', url: 'https://escala.network/startup-bogota', images: [{ url: 'https://escala.network/brand/og-default.png?v=3', width: 1200, height: 630 }] },
  alternates: { canonical: 'https://escala.network/startup-bogota' },
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
export default function StartupBogotaPage() {
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href="/" style={s.logo}>Esca<span style={{ color: '#1D9E75' }}>la</span></a>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/buscar-cofundador" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>Cofundadores</a>
          <a href="/directorio" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>Especialistas</a>
          <a href="/registro" style={{ background: '#1D9E75', color: '#fff', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>Comenzar gratis</a>
        </div>
      </nav>
      <section style={s.hero}>
        <div style={s.tag}>🏙️ Bogotá</div>
        <h1 style={s.h1}>Crea tu startup en Bogotá con el equipo correcto</h1>
        <p style={s.sub}>Bogotá es el hub de emprendimiento más grande de Colombia. En Escala conectas con cofundadores, desarrolladores, abogados y contadores en la capital — y puedes armar tu equipo sin capital inicial para pagarles.</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/registro" style={s.btn}>Publicar mi proyecto →</a>
          <a href="/directorio" style={s.btn2}>Ver especialistas en Bogotá</a>
        </div>
      </section>
      <section style={s.section}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '1.5rem' }}>El ecosistema de Bogotá en Escala</h2>
        <div style={s.grid}>
          {[
            { icon: '🤝', title: 'Cofundadores bogotanos', desc: 'Red de emprendedores, técnicos y especialistas en Bogotá listos para unirse a proyectos reales con visión de largo plazo.' },
            { icon: '⚖️', title: 'Abogados especializados', desc: 'Constitución SAS ante Cámara de Comercio de Bogotá, contratos de participación, marca y propiedad intelectual.' },
            { icon: '🧾', title: 'Contadores con NIT DIAN', desc: 'Obtención de NIT, régimen tributario, facturación electrónica y contabilidad para startups bogotanas.' },
            { icon: '💻', title: 'Desarrolladores tech', desc: 'Full-stack, mobile y de IA con experiencia en proyectos de Bogotá. Muchos con experiencia en empresas como Rappi, Platzi y Bancolombia.' },
            { icon: '🎨', title: 'Diseñadores UX/UI', desc: 'Identidad visual y producto para que tu startup se vea profesional desde el día uno en el mercado capitalino.' },
            { icon: '📈', title: 'Gerentes de proyecto', desc: 'Coordinación del equipo, gestión de metas y seguimiento al avance. Para que tu startup no se quede en el papel.' },
          ].map(item => (
            <div key={item.title} style={s.card}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{item.icon}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.4rem' }}>{item.title}</div>
              <div style={{ fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>
      <section style={s.section}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '1.5rem' }}>Preguntas frecuentes — Startups en Bogotá</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            ['¿Dónde se constituye una empresa SAS en Bogotá?', 'Las SAS en Bogotá se constituyen ante la Cámara de Comercio de Bogotá (CCB). El proceso incluye el registro mercantil, la matrícula y la obtención del NIT ante la DIAN. Escala tiene el workspace de constitución para guiarte paso a paso con un abogado de la plataforma.'],
            ['¿Hay incubadoras o aceleradoras en Bogotá con las que Escala trabaje?', 'Escala es complementario a ecosistemas como Bogotá es Startups, iNNpulsa, Endeavor y Ruta N. Puedes estar en una aceleradora y usar Escala para armar y gestionar tu equipo de especialistas al mismo tiempo.'],
            ['¿Puedo tener especialistas en otras ciudades aunque mi startup esté en Bogotá?', 'Sí. El workspace de Escala es 100% digital. Puedes tener tu contador en Medellín, tu abogado en Barranquilla y tu desarrollador en Cali — todo coordinado desde la plataforma.'],
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
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>¿Tienes una idea en Bogotá? Empieza hoy</h2>
          <a href="/registro" style={s.btn}>Crear cuenta gratis →</a>
        </div>
      </div>
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>
          © 2026 Escala Network ·{' '}
          <a href="/startup-medellin" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Medellín</a> ·{' '}
          <a href="/startup-colombia" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Colombia</a> ·{' '}
          <a href="/registro" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Registro</a>
        </div>
      </footer>
    </div>
  )
}
