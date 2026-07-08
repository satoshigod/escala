// app/startup-mexico/page.js
// Keywords: "crear startup mexico", "emprendimiento mexico", "cofundador mexico"

export const metadata = {
  title: 'Crear Startup en México — Encuentra Cofundadores y Equipo',
  description: 'La plataforma para crear startups en México. Conecta con cofundadores, desarrolladores y especialistas. Constituye tu empresa y opera desde CDMX, Monterrey, Guadalajara y más.',
  keywords: ['crear startup mexico', 'emprendimiento mexico', 'cofundador mexico', 'startup cdmx', 'startup monterrey', 'crear empresa mexico', 'angel investor mexico'],
  openGraph: {
    title: 'Crear Startup en México — Escala',
    description: 'La plataforma para crear startups en México. Cofundadores, especialistas e inversores en un solo lugar.',
    url: 'https://escala.network/startup-mexico',
    images: [{ url: 'https://escala.network/brand/og-default.png', width: 1200, height: 630 }],
  },
  alternates: { canonical: 'https://escala.network/startup-mexico' },
}

const s = {
  page: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter,sans-serif', color: '#fff' },
  nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: '1.1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', textDecoration: 'none' },
  hero: { maxWidth: '900px', margin: '0 auto', padding: '5rem 1.5rem 4rem' },
  tag: { display: 'inline-block', background: 'rgba(0,104,56,0.15)', border: '1px solid rgba(0,104,56,0.4)', color: '#4CAF80', fontSize: '0.75rem', fontWeight: '700', padding: '0.3rem 0.875rem', borderRadius: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1.5rem' },
  h1: { fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: '900', lineHeight: '1.1', letterSpacing: '-0.03em', marginBottom: '1.5rem', color: '#fff' },
  sub: { fontSize: '1.1rem', color: '#8FA3CC', lineHeight: '1.7', maxWidth: '600px', marginBottom: '2.5rem' },
  btnPrimary: { background: '#1D9E75', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', display: 'inline-block' },
  btnSecondary: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600', display: 'inline-block' },
  section: { maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 4rem' },
  sectionTitle: { fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.02em' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem' },
  cardIcon: { fontSize: '1.75rem', marginBottom: '0.75rem' },
  cardTitle: { fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.4rem' },
  cardDesc: { fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6' },
}

export default function StartupMexicoPage() {
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
        <div style={s.tag}>🇲🇽 México</div>
        <h1 style={s.h1}>Crea tu startup en México con el equipo correcto</h1>
        <p style={s.sub}>
          Escala conecta a emprendedores mexicanos con cofundadores, especialistas
          e inversionistas. Desde CDMX, Monterrey, Guadalajara y todo México — sin
          necesidad de capital inicial para arrancar.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <a href="/registro" style={s.btnPrimary}>Publicar mi proyecto →</a>
          <a href="/directorio" style={s.btnSecondary}>Ver especialistas mexicanos</a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0.75rem', maxWidth: '600px' }}>
          {['CDMX', 'Monterrey', 'Guadalajara', 'Puebla', 'Todo México'].map(ciudad => (
            <div key={ciudad} style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)', fontSize: '0.8rem', color: '#8FA3CC' }}>
              🇲🇽 {ciudad}
            </div>
          ))}
        </div>
      </section>

      <section style={s.section}>
        <h2 style={s.sectionTitle}>Lo que Escala ofrece a los emprendedores mexicanos</h2>
        <div style={s.grid}>
          {[
            { icon: '🤝', title: 'Red de cofundadores en México', desc: 'Encuentra emprendedores y especialistas mexicanos que complementan tus habilidades y comparten tu visión.' },
            { icon: '💸', title: 'Sin capital para empezar', desc: 'Trabaja con tu equipo por participación diferida. No necesitas pagar salarios para tener un equipo comprometido.' },
            { icon: '📄', title: 'Constitución empresarial', desc: 'Workspace para gestionar los pasos de constitución de tu empresa en México, con guía específica para SAPI y otras formas.' },
            { icon: '🌟', title: 'Ángeles inversionistas', desc: 'Accede a inversionistas ángel que financian hitos puntuales de tu startup a cambio de participación en los resultados.' },
            { icon: '⚖️', title: 'Contratos automáticos', desc: 'Contratos legales generados automáticamente, adaptados al marco legal mexicano para proteger a todas las partes.' },
            { icon: '📊', title: 'Operación completa', desc: 'Gestión de tareas, hitos, pagos y contratos en un solo lugar. Todo lo que necesita tu startup para operar.' },
          ].map(item => (
            <div key={item.title} style={s.card}>
              <div style={s.cardIcon}>{item.icon}</div>
              <h3 style={s.cardTitle}>{item.title}</h3>
              <p style={s.cardDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={s.section}>
        <h2 style={s.sectionTitle}>Preguntas frecuentes — Startups en México</h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            ['¿Qué tipo de empresa conviene para una startup en México?', 'La SAPI (Sociedad Anónima Promotora de Inversión) es la forma más común para startups que buscan inversión en México. Para etapas muy tempranas, muchos emprendedores empiezan con una SAS o una empresa más sencilla.'],
            ['¿Cómo funciona la participación diferida en México?', 'Los cofundadores y especialistas aportan trabajo a cambio de un porcentaje del éxito del proyecto. La valoración del equity se define cuando la empresa empieza a generar ingresos, no antes.'],
            ['¿Hay inversionistas ángel para startups mexicanas en Escala?', 'Sí. Los Ángeles de Impulso de Escala pueden financiar hitos específicos de tu startup. No son fondos VC — son personas que apuestan por proyectos concretos a cambio de participación.'],
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
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>¿Tienes una idea? Empieza hoy en México</h2>
          <p style={{ color: '#8FA3CC', marginBottom: '2rem', lineHeight: '1.6' }}>Únete a los emprendedores mexicanos que ya están construyendo en Escala.</p>
          <a href="/registro" style={s.btnPrimary}>Crear cuenta gratis →</a>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>
          © 2026 Escala Network ·{' '}
          <a href="/startup-colombia" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Colombia</a> ·{' '}
          <a href="/buscar-cofundador" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Buscar cofundador</a> ·{' '}
          <a href="/que-es-escala" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Qué es Escala</a> ·{' '}
          <a href="/registro" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Registro</a>
        </div>
      </footer>
    </div>
  )
}
