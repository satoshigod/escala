// app/contador-publico-colombia/page.js
// Keywords: "contador publico colombia", "trabajo contador colombia", "contador freelance colombia"

export const metadata = {
  title: 'Contador Público en Colombia — Trabaja por Participación en Startups',
  description: 'Eres contador público en Colombia y quieres diversificar tus ingresos. En Escala puedes ofrecer tus servicios contables a startups a cambio de participación diferida. Sin salario fijo, sin intermediarios.',
  keywords: ['contador publico colombia', 'trabajo contador colombia', 'contador freelance colombia', 'contador startups', 'servicios contables colombia', 'contador bogota', 'contador medellin'],
  openGraph: {
    title: 'Contador Público en Colombia — Trabaja con Startups en Escala',
    description: 'Ofrece tus servicios contables a startups colombianas a cambio de participación. Sin salario fijo, sin intermediarios.',
    url: 'https://escala.network/contador-publico-colombia',
    images: [{ url: 'https://escala.network/brand/og-default.png', width: 1200, height: 630 }],
  },
  alternates: { canonical: 'https://escala.network/contador-publico-colombia' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Contador Público en Colombia — Escala',
  description: 'Plataforma para contadores públicos que quieren trabajar con startups por participación',
  url: 'https://escala.network/contador-publico-colombia',
  about: { '@type': 'Occupation', name: 'Contador Público', occupationLocation: { '@type': 'Country', name: 'Colombia' } },
}

const s = {
  page: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter,sans-serif', color: '#fff' },
  nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: '1.1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', textDecoration: 'none' },
  hero: { maxWidth: '900px', margin: '0 auto', padding: '5rem 1.5rem 4rem' },
  tag: { display: 'inline-block', background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.3)', color: '#1D9E75', fontSize: '0.75rem', fontWeight: '700', padding: '0.3rem 0.875rem', borderRadius: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1.5rem' },
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

export default function ContadorPublicoColombiaPage() {
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
        <div style={s.tag}>🧾 Para Contadores</div>
        <h1 style={s.h1}>Eres contador público. Tus servicios valen más de lo que te pagan.</h1>
        <p style={s.sub}>
          En Escala puedes ofrecer servicios contables a startups colombianas a cambio de participación diferida.
          Trabajo real, impacto real, compensación que crece con la empresa — no un salario que no alcanza.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <a href="/registro" style={s.btnPrimary}>Unirme como Contador →</a>
          <a href="/buscar" style={s.btnSecondary}>Ver proyectos disponibles</a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.75rem', maxWidth: '700px' }}>
          {[['Constitución SAS', '🏢'], ['Contabilidad mensual', '📊'], ['DIAN y tributario', '📋'], ['Nómina', '👥'], ['Auditoría', '🔍']].map(([tarea, emoji]) => (
            <div key={tarea} style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)', fontSize: '0.8rem', color: '#8FA3CC' }}>
              {emoji} {tarea}
            </div>
          ))}
        </div>
      </section>

      <section style={s.section}>
        <h2 style={s.sectionTitle}>¿Cómo funciona para un contador en Escala?</h2>
        <div style={s.grid}>
          {[
            { icon: '📝', title: 'Crea tu perfil profesional', desc: 'Publica tu especialidad, experiencia, ciudades donde operas y qué tipos de empresa buscas apoyar. Incluye tu Tarjeta Profesional para generar más confianza.' },
            { icon: '🔍', title: 'Explora proyectos activos', desc: 'Ve los proyectos que buscan un contador. Filtra por sector, etapa y ciudad. Cada proyecto muestra qué tareas contables necesita.' },
            { icon: '📩', title: 'Postúlate al rol de Contador', desc: 'Envía tu postulación. El fundador revisa tu perfil y te acepta si encajas. El proceso es rápido — la mayoría de respuestas llegan en 48 horas.' },
            { icon: '✅', title: 'Trabaja y registra tus aportes', desc: 'Completa las tareas asignadas: NIT, libros contables, facturación electrónica, declaraciones. Cada tarea queda registrada como aporte tuyo al proyecto.' },
            { icon: '📄', title: 'Contrato automático', desc: 'Al ser aceptado, el sistema genera un contrato de participación diferida. Tu compensación queda documentada y protegida desde el primer día.' },
            { icon: '💰', title: 'Participación cuando genere ingresos', desc: 'Cuando la empresa empiece a generar ingresos, tu participación se convierte en pagos reales o en equity. Tú y el fundador definen la valoración juntos.' },
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
        <h2 style={s.sectionTitle}>Preguntas frecuentes — Contadores en Escala</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            ['¿Es legal trabajar por participación como contador en Colombia?', 'Sí. El contrato de participación diferida es una modalidad contractual válida en Colombia. No reemplaza tu ejercicio profesional independiente — es una forma de estructurar la compensación con el cliente.'],
            ['¿Qué tareas contables suelen pedir las startups?', 'Las más frecuentes son: obtención del NIT ante la DIAN, apertura de libros contables, configuración de facturación electrónica, definición del régimen tributario, apertura de cuenta bancaria empresarial y declaraciones de renta e IVA.'],
            ['¿Necesito tener Tarjeta Profesional para unirme?', 'No es obligatorio para crear perfil o postularte. Pero sí te recomendamos subirla — los proyectos más formales la exigen y sube tu Reputación Escala, que determina qué tan alto apareces en los resultados.'],
            ['¿Cómo sé que el proyecto es serio antes de aceptar?', 'Cada proyecto en Escala tiene un resumen del estado de avance, los roles que ya tiene cubiertos y el historial de actividad. Puedes hablar con el fundador antes de aceptar y revisar el contrato.'],
            ['¿Puedo trabajar en varios proyectos al mismo tiempo?', 'Sí. Muchos contadores en Escala tienen 2 o 3 proyectos activos simultáneamente, dependiendo de la carga de trabajo de cada uno. Tú defines tu disponibilidad en el perfil.'],
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
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>Tu próxima empresa cliente te está esperando</h2>
          <p style={{ color: '#8FA3CC', marginBottom: '2rem', lineHeight: '1.6' }}>Crea tu perfil de contador en Escala en menos de 5 minutos. Sin costo, sin intermediarios.</p>
          <a href="/registro" style={s.btnPrimary}>Crear perfil de Contador →</a>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>
          © 2026 Escala Network ·{' '}
          <a href="/abogado-startups-colombia" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Abogados</a> ·{' '}
          <a href="/startup-colombia" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Startups Colombia</a> ·{' '}
          <a href="/buscar-cofundador" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Cofundadores</a> ·{' '}
          <a href="/registro" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Registro</a>
        </div>
      </footer>
    </div>
  )
}
