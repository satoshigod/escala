// app/startup-colombia/page.js
// Keywords: "crear startup colombia", "emprendimiento colombia", "cofundador colombia"

export const metadata = {
  title: 'Crear Startup en Colombia — Encuentra Cofundadores y Equipo',
  description: 'La plataforma para crear startups en Colombia. Conecta con cofundadores, desarrolladores, diseñadores e inversionistas. Constituye tu empresa SAS y opera desde el primer día.',
  keywords: ['crear startup colombia', 'emprendimiento colombia', 'cofundador colombia', 'startup bogota', 'startup medellín', 'crear empresa colombia', 'angel investor colombia'],
  openGraph: {
    title: 'Crear Startup en Colombia — Escala',
    description: 'La plataforma para crear startups en Colombia. Cofundadores, especialistas e inversores en un solo lugar.',
    url: 'https://escala.network/startup-colombia',
    images: [{ url: 'https://escala.network/brand/og-default.png', width: 1200, height: 630 }],
  },
  alternates: { canonical: 'https://escala.network/startup-colombia' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Crear Startup en Colombia — Escala',
  description: 'Plataforma para crear startups en Colombia',
  url: 'https://escala.network/startup-colombia',
  about: { '@type': 'Place', name: 'Colombia', address: { '@type': 'PostalAddress', addressCountry: 'CO' } },
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

export default function StartupColombiaPage() {
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
        <div style={s.tag}>🇨🇴 Colombia</div>
        <h1 style={s.h1}>Crea tu startup en Colombia con el equipo correcto</h1>
        <p style={s.sub}>
          Escala es la plataforma para emprendedores colombianos. Publica tu idea,
          encuentra cofundadores en Bogotá, Medellín, Cali y todo el país, y constituye
          tu empresa SAS sin necesidad de capital inicial.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <a href="/registro" style={s.btnPrimary}>Publicar mi proyecto →</a>
          <a href="/directorio" style={s.btnSecondary}>Ver especialistas colombianos</a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0.75rem', maxWidth: '600px' }}>
          {[['Bogotá', '🏙️'], ['Medellín', '🌸'], ['Cali', '🎶'], ['Barranquilla', '🌊'], ['Todo Colombia', '🇨🇴']].map(([ciudad, emoji]) => (
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
            { icon: '🤝', title: 'Cofundadores en Colombia', desc: 'Accede a una red de emprendedores, desarrolladores, diseñadores y especialistas listos para unirse a tu proyecto.' },
            { icon: '📄', title: 'Constitución SAS incluida', desc: 'Escala tiene el workspace para gestionar la constitución de tu empresa SAS en Colombia con guía paso a paso.' },
            { icon: '💰', title: 'Sin capital inicial', desc: 'El modelo de participación diferida permite que tu equipo trabaje por equity, no por salario, mientras validan el negocio.' },
            { icon: '⚖️', title: 'Contratos legales', desc: 'Contratos automáticos adaptados al marco legal colombiano. Protege tu idea y tu equipo desde el día uno.' },
            { icon: '🌟', title: 'Ángeles inversionistas', desc: 'Conecta con ángeles inversionistas que financian metas específicas de tu startup a cambio de participación.' },
            { icon: '📊', title: 'Gestión completa', desc: 'Tareas, metas, aportes, ingresos y contratos en un solo lugar. Todo lo que necesita tu startup en un solo lugar.' },
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
        <h2 style={s.sectionTitle}>Preguntas frecuentes — Startups en Colombia</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            ['¿Cómo constituyo una empresa SAS en Colombia?', 'La SAS (Sociedad por Acciones Simplificada) es el tipo de empresa más usado por startups en Colombia. Se puede constituir por documento privado ante la DIAN y la Cámara de Comercio. Escala tiene el workspace de constitución para guiarte paso a paso.'],
            ['¿Puedo crear una startup en Colombia sin dinero?', 'Sí. El modelo de participación diferida de Escala permite que fundadores y especialistas trabajen por equity, evitando la necesidad de capital para pagar salarios en etapa temprana.'],
            ['¿Qué tipo de proyectos hay en Escala Colombia?', 'Tecnología, salud, educación, fintech, agro, comercio electrónico y más. Los proyectos son de todo el país — Bogotá, Medellín, Cali, Barranquilla y ciudades intermedias.'],
            ['¿Cómo funciona la inversión ángel en Colombia?', 'Los Inversionistas en Escala financian metas específicas de tu startup a cambio de un porcentaje del éxito del proyecto cuando genere ingresos. No es un préstamo, es una apuesta por tu equipo.'],
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
          <p style={{ color: '#8FA3CC', marginBottom: '2rem', lineHeight: '1.6' }}>Únete a los emprendedores colombianos que ya están construyendo en Escala.</p>
          <a href="/registro" style={s.btnPrimary}>Crear cuenta gratis →</a>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>
          © 2026 Escala Network ·{' '}
          <a href="/buscar-cofundador" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Buscar cofundador</a> ·{' '}
          <a href="/startup-mexico" style={{ color: '#8FA3CC', textDecoration: 'none' }}>México</a> ·{' '}
          <a href="/que-es-escala" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Qué es Escala</a> ·{' '}
          <a href="/registro" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Registro</a>
        </div>
      </footer>
    </div>
  )
}
