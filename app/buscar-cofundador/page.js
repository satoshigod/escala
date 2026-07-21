// app/buscar-cofundador/page.js
// Landing page SEO: "buscar cofundador", "encontrar cofundador startup"
// Keyword principal: 800 búsquedas/mes, dificultad muy baja

export const metadata = {
  title: 'Buscar Cofundador para tu Startup — Encuentra tu Socio Ideal',
  description: 'Encuentra el cofundador ideal para tu startup en Latinoamérica. Conecta con cofundadores técnicos, comerciales y creativos que comparten tu visión. Gratis en Escala.',
  keywords: ['buscar cofundador', 'encontrar cofundador', 'cofundador startup', 'buscar socio de negocios', 'cofounder latina america', 'find cofounder'],
  openGraph: {
    title: 'Buscar Cofundador para tu Startup — Escala',
    description: 'Encuentra el cofundador ideal. Conecta con emprendedores que complementan tus habilidades.',
    url: 'https://escala.network/buscar-cofundador',
    images: [{ url: 'https://escala.network/brand/og-default.png', width: 1200, height: 630 }],
  },
  alternates: { canonical: 'https://escala.network/buscar-cofundador' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Buscar Cofundador — Escala',
  description: 'Plataforma para encontrar cofundadores para startups en Latinoamérica',
  url: 'https://escala.network/buscar-cofundador',
  mainEntity: {
    '@type': 'Service',
    name: 'Matching de Cofundadores',
    provider: { '@type': 'Organization', name: 'Escala', url: 'https://escala.network' },
    description: 'Conecta fundadores con cofundadores complementarios en Colombia, México, Chile y más',
    areaServed: ['Colombia', 'México', 'Chile', 'Argentina', 'Perú', 'Ecuador', 'España'],
  },
}

const s = {
  page: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter,sans-serif', color: '#fff' },
  nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: '1.1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', textDecoration: 'none' },
  hero: { maxWidth: '900px', margin: '0 auto', padding: '5rem 1.5rem 4rem' },
  tag: { display: 'inline-block', background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.3)', color: '#1D9E75', fontSize: '0.75rem', fontWeight: '700', padding: '0.3rem 0.875rem', borderRadius: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1.5rem' },
  h1: { fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: '900', lineHeight: '1.1', letterSpacing: '-0.03em', marginBottom: '1.5rem', color: '#fff' },
  sub: { fontSize: '1.1rem', color: '#8FA3CC', lineHeight: '1.7', maxWidth: '600px', marginBottom: '2.5rem' },
  btnRow: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '4rem' },
  btnPrimary: { background: '#1D9E75', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700' },
  btnSecondary: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600' },
  section: { maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 5rem' },
  sectionTitle: { fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '2rem', letterSpacing: '-0.02em' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem', marginBottom: '4rem' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem' },
  cardIcon: { fontSize: '2rem', marginBottom: '0.875rem' },
  cardTitle: { fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' },
  cardDesc: { fontSize: '0.85rem', color: '#8FA3CC', lineHeight: '1.6' },
  faqSection: { maxWidth: '700px', margin: '0 auto', padding: '0 1.5rem 5rem' },
  faqItem: { borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem 0' },
  faqQ: { fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' },
  faqA: { fontSize: '0.88rem', color: '#8FA3CC', lineHeight: '1.7' },
  cta: { background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '20px', padding: '3rem', textAlign: 'center', maxWidth: '700px', margin: '0 auto 5rem' },
  ctaTitle: { fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' },
  ctaSub: { fontSize: '0.95rem', color: '#8FA3CC', marginBottom: '2rem', lineHeight: '1.6' },
}

export default function BuscarCofundadorPage() {
  return (
    <div style={s.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav style={s.nav}>
        <a href="/" style={s.logo}>Esca<span style={{ color: '#1D9E75' }}>la</span></a>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/directorio" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>Directorio</a>
          <a href="/proyectos" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>Proyectos</a>
          <a href="/registro" style={{ background: '#1D9E75', color: '#fff', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>Comenzar gratis</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.tag}>Para fundadores</div>
        <h1 style={s.h1}>Encuentra tu cofundador ideal en Latinoamérica</h1>
        <p style={s.sub}>
          El cofundador correcto puede ser la diferencia entre una idea y una empresa real.
          En Escala conectas con emprendedores que complementan tus habilidades y comparten
          tu visión — sin necesidad de capital para empezar.
        </p>
        <div style={s.btnRow}>
          <a href="/registro" style={s.btnPrimary}>Publicar mi proyecto →</a>
          <a href="/directorio" style={s.btnSecondary}>Explorar perfiles</a>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', maxWidth: '500px' }}>
          {[['7', 'países activos'], ['100%', 'gratuito para empezar'], ['0', 'capital requerido']].map(([n, l]) => (
            <div key={l} style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1D9E75', fontFamily: 'monospace' }}>{n}</div>
              <div style={{ fontSize: '0.7rem', color: '#8FA3CC', marginTop: '0.25rem' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tipos de cofundador */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>¿Qué tipo de cofundador necesitas?</h2>
        <div style={s.grid}>
          {[
            { icon: '💻', title: 'Cofundador técnico (CTO)', desc: 'Desarrolladores, arquitectos de software y CTOs que pueden construir tu producto desde cero.' },
            { icon: '📈', title: 'Cofundador comercial', desc: 'Perfiles de ventas, marketing y growth que pueden conseguir tus primeros clientes y escalar.' },
            { icon: '🎨', title: 'Cofundador de diseño', desc: 'Diseñadores de producto y UX que construyen la experiencia que diferencia tu empresa.' },
            { icon: '⚖️', title: 'Cofundador legal', desc: 'Abogados especializados en startups que manejan la constitución, contratos y propiedad intelectual.' },
            { icon: '💰', title: 'Cofundador financiero', desc: 'CFOs y contadores que estructuran el modelo financiero y preparan la empresa para inversión.' },
            { icon: '🧭', title: 'Mentor estratégico', desc: 'Expertos con experiencia en tu industria que orientan sin ejecutar tareas operativas.' },
          ].map(item => (
            <div key={item.title} style={s.card}>
              <div style={s.cardIcon}>{item.icon}</div>
              <h3 style={s.cardTitle}>{item.title}</h3>
              <p style={s.cardDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Cómo encontrar tu cofundador en Escala</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
          {[
            ['1', 'Publica tu proyecto', 'Describe tu idea, el tipo de empresa que quieres crear y qué habilidades buscas en un cofundador.'],
            ['2', 'Especialistas te encuentran', 'Los perfiles del directorio pueden postularse a tu proyecto o tú puedes invitarlos directamente.'],
            ['3', 'Definen la participación', 'Negocian la participación diferida: el cofundador aporta trabajo hoy a cambio de equity cuando la empresa genere ingresos.'],
            ['4', 'Contrato automático', 'Escala genera el contrato legal automáticamente con 15 cláusulas adaptadas a cada país.'],
          ].map(([num, title, desc]) => (
            <div key={num} style={{ display: 'flex', gap: '1.25rem', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(29,158,117,0.2)', color: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', flexShrink: 0, fontSize: '0.85rem' }}>{num}</div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.3rem' }}>{title}</div>
                <div style={{ fontSize: '0.83rem', color: '#8FA3CC', lineHeight: '1.6' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={s.faqSection}>
        <h2 style={{ ...s.sectionTitle, textAlign: 'center' }}>Preguntas frecuentes</h2>
        {[
          ['¿Qué es un cofundador en Escala?', 'Un cofundador en Escala es alguien que se une a tu proyecto aportando tiempo, conocimiento o habilidades específicas a cambio de una participación diferida en la empresa — no un salario inmediato.'],
          ['¿Es gratis buscar cofundador en Escala?', 'Sí. Publicar tu proyecto, explorar el directorio y conectar con cofundadores potenciales es completamente gratuito. Escala cobra una comisión solo cuando se ejecutan pagos reales entre las partes.'],
          ['¿En qué países está disponible Escala?', 'Actualmente en Colombia, México, Chile, Argentina, Perú, Ecuador y España. El modelo de participación diferida aplica en todos los países.'],
          ['¿Cómo se define la participación del cofundador?', 'La participación se negocia directamente entre las partes. Escala no fija ni sugiere porcentajes — eso depende del rol, la dedicación y el aporte de cada cofundador. La valoración del equity se define en el momento en que la empresa genere ingresos.'],
          ['¿Qué pasa si el cofundador no cumple?', 'Escala registra tareas, metas y entregas verificables. El contrato generado incluye cláusulas de incumplimiento que protegen al fundador y al cofundador.'],
        ].map(([q, a]) => (
          <div key={q} style={s.faqItem}>
            <h3 style={s.faqQ}>{q}</h3>
            <p style={s.faqA}>{a}</p>
          </div>
        ))}
      </section>

      {/* CTA final */}
      <div style={{ padding: '0 1.5rem 5rem' }}>
        <div style={s.cta}>
          <h2 style={s.ctaTitle}>¿Listo para encontrar tu cofundador?</h2>
          <p style={s.ctaSub}>Publica tu proyecto hoy. Es gratis y tarda menos de 5 minutos.</p>
          <a href="/registro" style={{ ...s.btnPrimary, display: 'inline-block' }}>Crear cuenta gratis →</a>
        </div>
      </div>

      {/* Footer mínimo */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>
          © 2026 Escala Network ·{' '}
          <a href="/que-es-escala" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Qué es Escala</a> ·{' '}
          <a href="/directorio" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Directorio</a> ·{' '}
          <a href="/buscar" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Proyectos</a> ·{' '}
          <a href="/registro" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Registro</a>
        </div>
      </footer>
    </div>
  )
}
