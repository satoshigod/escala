// app/desarrollador-startup-colombia/page.js
// Keywords: "desarrollador freelance colombia", "desarrollador startup colombia", "programador freelance colombia"

export const metadata = {
  title: 'Desarrollador para Startups en Colombia — Trabaja por Participación',
  description: 'Eres desarrollador en Colombia y quieres trabajar en startups reales. En Escala puedes ofrecer tu trabajo técnico a cambio de participación diferida. Full-stack, backend, frontend, mobile — todos los perfiles.',
  keywords: ['desarrollador freelance colombia', 'desarrollador startup colombia', 'programador freelance colombia', 'trabajo desarrollador colombia', 'full stack colombia', 'desarrollador bogota', 'desarrollador medellin'],
  openGraph: {
    title: 'Desarrollador para Startups en Colombia — Escala',
    description: 'Trabaja en startups reales a cambio de participación. Sin salario fijo, con impacto real.',
    url: 'https://escala.network/desarrollador-startup-colombia',
    images: [{ url: 'https://escala.network/brand/og-default.png?v=3', width: 1200, height: 630 }],
  },
  alternates: { canonical: 'https://escala.network/desarrollador-startup-colombia' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Desarrollador para Startups en Colombia — Escala',
  url: 'https://escala.network/desarrollador-startup-colombia',
}

const s = {
  page: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter,sans-serif', color: '#fff' },
  nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: '1.1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', textDecoration: 'none' },
  hero: { maxWidth: '900px', margin: '0 auto', padding: '5rem 1.5rem 4rem' },
  tag: { display: 'inline-block', background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.3)', color: '#4A90D9', fontSize: '0.75rem', fontWeight: '700', padding: '0.3rem 0.875rem', borderRadius: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1.5rem' },
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

export default function DesarrolladorStartupColombiaPage() {
  return (
    <div style={s.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav style={s.nav}>
        <a href="/" style={s.logo}>Esca<span style={{ color: '#1D9E75' }}>la</span></a>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/directorio" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>Directorio</a>
          <a href="/buscar" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>Proyectos</a>
          <a href="/registro" style={{ background: '#1D9E75', color: '#fff', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>Comenzar gratis</a>
        </div>
      </nav>

      <section style={s.hero}>
        <div style={s.tag}>💻 Para Desarrolladores</div>
        <h1 style={s.h1}>Eres desarrollador. Tus horas valen más que un salario fijo.</h1>
        <p style={s.sub}>En Escala puedes ofrecer tu trabajo técnico a startups colombianas a cambio de participación diferida. Construyes el producto, quedas como parte del proyecto. Cuando la empresa crece, tú creces con ella.</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <a href="/registro" style={s.btnPrimary}>Unirme como Desarrollador →</a>
          <a href="/buscar" style={s.btnSecondary}>Ver proyectos disponibles</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0.75rem', maxWidth: '700px' }}>
          {[['Full-Stack', '🔧'], ['Backend', '⚙️'], ['Frontend', '🎨'], ['Mobile', '📱'], ['DevOps', '☁️']].map(([rol, emoji]) => (
            <div key={rol} style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)', fontSize: '0.8rem', color: '#8FA3CC' }}>
              {emoji} {rol}
            </div>
          ))}
        </div>
      </section>

      <section style={s.section}>
        <h2 style={s.sectionTitle}>Lo que construyen los desarrolladores en Escala</h2>
        <div style={s.grid}>
          {[
            { icon: '🚀', title: 'MVPs y productos digitales', desc: 'La mayoría de proyectos necesitan un MVP funcional. Tú lo construyes, queda registrado como tu aporte y defines la arquitectura desde el inicio.' },
            { icon: '🔌', title: 'APIs e integraciones', desc: 'Backend, APIs REST/GraphQL, integraciones con pagos, autenticación, notificaciones — todo lo técnico que el fundador necesita para operar.' },
            { icon: '📱', title: 'Apps móviles', desc: 'iOS, Android o React Native. Muchos fundadores necesitan una app antes de conseguir tracción. Tú la construyes, ellos consiguen usuarios.' },
            { icon: '☁️', title: 'Infraestructura y DevOps', desc: 'Configuración de servidores, CI/CD, bases de datos, seguridad. Si sabes montar y mantener infraestructura, eso tiene valor en cualquier startup.' },
            { icon: '🛒', title: 'E-commerce y plataformas', desc: 'Tiendas online, marketplaces, plataformas de servicios. El comercio digital sigue creciendo y los fundadores siempre necesitan quién lo construya.' },
            { icon: '🤖', title: 'IA y automatizaciones', desc: 'Integración de modelos de lenguaje, chatbots, automatización de procesos. Los proyectos más innovadores buscan desarrolladores con este perfil.' },
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
        <h2 style={s.sectionTitle}>Preguntas frecuentes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            ['¿Cómo funciona la participación para un desarrollador?', 'Cada hora o tarea que aportas queda registrada en el workspace del proyecto. Tú y el fundador acuerdan un porcentaje de participación o un valor de mercado por tus aportes. Cuando la empresa genere ingresos o levante inversión, esa participación se convierte en compensación real.'],
            ['¿Qué tecnologías usan los proyectos en Escala?', 'Varía según el proyecto — hay startups con Next.js, React Native, Django, Node, Laravel, Flutter y más. Al postularte ves exactamente qué stack usa el proyecto y qué necesitan construir.'],
            ['¿Puedo trabajar en un proyecto de otro país?', 'Sí. Escala es una plataforma latinoamericana. Puedes ser desarrollador en Medellín y trabajar en un proyecto de Chile o México — el trabajo es remoto y el workspace es digital.'],
            ['¿Cuántas horas debo aportar por semana?', 'Tú lo defines con el fundador al entrar. Algunos proyectos necesitan 5 horas semanales para mantener un MVP; otros necesitan más. Todo queda acordado en el contrato de participación antes de empezar.'],
            ['¿Qué pasa con la propiedad del código que construyo?', 'El contrato de participación diferida de Escala cubre la cesión de derechos del código al proyecto. A cambio, recibes tu participación acordada. Es un acuerdo estándar en el ecosistema de startups.'],
          ].map(([q, a]) => (
            <div key={q} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 0' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>{q}</h3>
              <p style={{ fontSize: '0.83rem', color: '#8FA3CC', lineHeight: '1.7', margin: 0 }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ padding: '0 1.5rem 5rem', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(74,144,217,0.06)', border: '1px solid rgba(74,144,217,0.2)', borderRadius: '20px', padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>Tu próxima startup te está esperando</h2>
          <p style={{ color: '#8FA3CC', marginBottom: '2rem', lineHeight: '1.6' }}>Crea tu perfil de desarrollador en Escala en menos de 5 minutos. Sin costo, sin intermediarios.</p>
          <a href="/registro" style={s.btnPrimary}>Crear perfil de Desarrollador →</a>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>
          © 2026 Escala Network ·{' '}
          <a href="/contador-publico-colombia" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Contadores</a> ·{' '}
          <a href="/abogado-startups-colombia" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Abogados</a> ·{' '}
          <a href="/startup-colombia" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Startups Colombia</a> ·{' '}
          <a href="/registro" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Registro</a>
        </div>
      </footer>
    </div>
  )
}
