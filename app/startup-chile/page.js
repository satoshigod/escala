// app/startup-chile/page.js
// Keywords: "crear startup chile", "emprendimiento chile", "cofundador chile", "startup santiago"

export const metadata = {
  title: 'Crear Startup en Chile — Encuentra Cofundadores y Equipo',
  description: 'La plataforma para crear startups en Chile. Conecta con cofundadores, desarrolladores, diseñadores y especialistas en Santiago, Valparaíso y todo el país. Opera sin capital inicial.',
  keywords: ['crear startup chile', 'emprendimiento chile', 'cofundador chile', 'startup santiago', 'crear empresa chile', 'cofundador santiago', 'angel investor chile'],
  openGraph: {
    title: 'Crear Startup en Chile — Escala',
    description: 'La plataforma para crear startups en Chile. Cofundadores, especialistas e inversores en un solo lugar.',
    url: 'https://escala.network/startup-chile',
    images: [{ url: 'https://escala.network/brand/og-default.png', width: 1200, height: 630 }],
  },
  alternates: { canonical: 'https://escala.network/startup-chile' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Crear Startup en Chile — Escala',
  description: 'Plataforma para crear startups en Chile',
  url: 'https://escala.network/startup-chile',
  about: { '@type': 'Place', name: 'Chile', address: { '@type': 'PostalAddress', addressCountry: 'CL' } },
}

const s = {
  page: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter,sans-serif', color: '#fff' },
  nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: '1.1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', textDecoration: 'none' },
  hero: { maxWidth: '900px', margin: '0 auto', padding: '5rem 1.5rem 4rem' },
  tag: { display: 'inline-block', background: 'rgba(255,196,0,0.1)', border: '1px solid rgba(255,196,0,0.3)', color: '#FFC400', fontSize: '0.75rem', fontWeight: '700', padding: '0.3rem 0.875rem', borderRadius: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1.5rem' },
  h1: { fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: '900', lineHeight: '1.1', letterSpacing: '-0.03em', marginBottom: '1.5rem', color: '#fff' },
  sub: { fontSize: '1.1rem', color: '#8FA3CC', lineHeight: '1.7', maxWidth: '600px', marginBottom: '2.5rem' },
  btnPrimary: { background: '#1D9E75', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', display: 'inline-block' },
  btnSecondary: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600', display: 'inline-block' },
  section: { maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 4rem' },
  sectionTitle: { fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.02em' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem', marginBottom: '3rem' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem' },
  cardIcon: { fontSize: '1.75rem', marginBottom: '0.75rem' },
  cardTitle: { fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.4rem' },
  cardDesc: { fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6' },
}

export default function StartupChilePage() {
  return (
    <div style={s.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav style={s.nav}>
        <a href="/" style={s.logo}>Esca<span style={{ color: '#1D9E75' }}>la</span></a>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/buscar-cofundador" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>Cofundadores</a>
          <a href="/directorio" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>Especialistas</a>
          <a href="/registro" style={{ background: '#1D9E75', color: '#fff', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>Comenzar gratis</a>
        </div>
      </nav>

      <section style={s.hero}>
        <div style={s.tag}>🇨🇱 Chile</div>
        <h1 style={s.h1}>Crea tu startup en Chile con el equipo correcto</h1>
        <p style={s.sub}>
          Escala es la plataforma para emprendedores chilenos. Publica tu idea, encuentra cofundadores
          en Santiago, Valparaíso, Concepción y todo el país, y construye tu empresa sin necesidad
          de capital inicial para contratar.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <a href="/registro" style={s.btnPrimary}>Publicar mi proyecto →</a>
          <a href="/directorio" style={s.btnSecondary}>Ver especialistas chilenos</a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0.75rem', maxWidth: '600px' }}>
          {[['Santiago', '🏙️'], ['Valparaíso', '⛵'], ['Concepción', '🌲'], ['Antofagasta', '🌵'], ['Todo Chile', '🇨🇱']].map(([ciudad, emoji]) => (
            <div key={ciudad} style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)', fontSize: '0.8rem', color: '#8FA3CC' }}>
              {emoji} {ciudad}
            </div>
          ))}
        </div>
      </section>

      <section style={s.section}>
        <h2 style={s.sectionTitle}>¿Por qué crear tu startup en Escala?</h2>
        <div style={s.grid}>
          {[
            { icon: '🤝', title: 'Cofundadores en Chile', desc: 'Accede a una red de emprendedores, desarrolladores, diseñadores y especialistas listos para unirse a tu proyecto desde cualquier ciudad de Chile.' },
            { icon: '💰', title: 'Sin capital inicial', desc: 'El modelo de participación diferida permite que tu equipo trabaje por equity, no por salario, mientras validan el negocio y llegan los primeros ingresos.' },
            { icon: '📄', title: 'Contratos automáticos', desc: 'Contratos de participación adaptados al marco legal. Protege tu idea y tu equipo desde el primer día sin necesitar a un abogado desde el inicio.' },
            { icon: '✅', title: 'Gestión de tareas y metas', desc: 'Workspace completo para gestionar las tareas de cada miembro, registrar aportes y hacer seguimiento al avance del proyecto.' },
            { icon: '🌟', title: 'Inversión ángel', desc: 'Conecta con Ángeles de Impulso que financian metas específicas de tu startup a cambio de participación, sin necesidad de levantar una ronda formal.' },
            { icon: '🌎', title: 'Red latinoamericana', desc: 'Escala opera en Chile, Colombia, México, Argentina, Perú, España y más. Tu proyecto puede atraer talento y capital de toda la región.' },
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
        <h2 style={s.sectionTitle}>Preguntas frecuentes — Startups en Chile</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            ['¿Cómo constituyo una empresa en Chile?', 'Las startups en Chile se suelen constituir como SpA (Sociedad por Acciones) o SRL. El proceso incluye registro ante el Registro de Comercio y el SII. Escala tiene el workspace de constitución para guiarte paso a paso con un abogado de la plataforma.'],
            ['¿Puedo crear una startup en Chile sin dinero?', 'Sí. El modelo de participación diferida de Escala permite que el equipo trabaje por equity, sin necesidad de capital para pagar salarios en etapa temprana. El dinero llega cuando la empresa empiece a generar ingresos.'],
            ['¿Qué ecosistema de startups tiene Chile?', 'Chile tiene uno de los ecosistemas de emprendimiento más activos de Latinoamérica, con programas como Start-Up Chile, CORFO y una comunidad activa en Santiago. Escala conecta a emprendedores de todo ese ecosistema.'],
            ['¿Puedo trabajar con cofundadores en otro país?', 'Sí. Escala es una plataforma latinoamericana. Puedes tener un cofundador en Colombia, un desarrollador en Argentina y tú en Santiago — todo coordinado desde el workspace del proyecto.'],
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
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>¿Tienes una idea? Empieza hoy</h2>
          <p style={{ color: '#8FA3CC', marginBottom: '2rem', lineHeight: '1.6' }}>Únete a los emprendedores chilenos que ya están construyendo en Escala.</p>
          <a href="/registro" style={s.btnPrimary}>Crear cuenta gratis →</a>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>
          © 2026 Escala Network ·{' '}
          <a href="/startup-colombia" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Colombia</a> ·{' '}
          <a href="/startup-mexico" style={{ color: '#8FA3CC', textDecoration: 'none' }}>México</a> ·{' '}
          <a href="/buscar-cofundador" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Buscar cofundador</a> ·{' '}
          <a href="/registro" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Registro</a>
        </div>
      </footer>
    </div>
  )
}
