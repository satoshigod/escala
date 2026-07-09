// app/crear-empresa-sin-capital/page.js
// Keywords: "crear empresa sin capital", "emprender sin dinero", "startup sin inversion"

export const metadata = {
  title: 'Crear Empresa Sin Capital — El Modelo de Participación Diferida',
  description: 'Aprende cómo crear una empresa real sin necesitar capital para pagar al equipo. El modelo de participación diferida permite que especialistas trabajen por equity mientras tu empresa crece.',
  keywords: ['crear empresa sin capital', 'emprender sin dinero', 'startup sin inversion', 'participacion diferida', 'equity startup', 'crear empresa sin dinero latin america'],
  openGraph: {
    title: 'Crear Empresa Sin Capital — Escala',
    description: 'Crea tu empresa sin capital inicial. El equipo trabaja por participación, no por salario.',
    url: 'https://escala.network/crear-empresa-sin-capital',
    images: [{ url: 'https://escala.network/brand/og-default.png', width: 1200, height: 630 }],
  },
  alternates: { canonical: 'https://escala.network/crear-empresa-sin-capital' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Crear Empresa Sin Capital — Escala',
  description: 'Plataforma para crear empresas sin capital inicial usando participación diferida',
  url: 'https://escala.network/crear-empresa-sin-capital',
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

export default function CrearEmpresaSinCapitalPage() {
  return (
    <div style={s.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav style={s.nav}>
        <a href="/" style={s.logo}>Esca<span style={{ color: '#1D9E75' }}>la</span></a>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/que-es-escala" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>Qué es Escala</a>
          <a href="/buscar" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>Proyectos</a>
          <a href="/registro" style={{ background: '#1D9E75', color: '#fff', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>Comenzar gratis</a>
        </div>
      </nav>

      <section style={s.hero}>
        <div style={s.tag}>💡 Modelo de Participación Diferida</div>
        <h1 style={s.h1}>Crea tu empresa sin capital. El equipo trabaja por participación, no por salario.</h1>
        <p style={s.sub}>
          La falta de capital no debería ser lo que detenga una buena idea. En Escala, los especialistas
          — contadores, abogados, desarrolladores, diseñadores — trabajan por participación diferida.
          Cuando la empresa genere ingresos, todos ganan.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <a href="/registro" style={s.btnPrimary}>Publicar mi proyecto →</a>
          <a href="/que-es-escala" style={s.btnSecondary}>¿Cómo funciona Escala?</a>
        </div>
      </section>

      <section style={s.section}>
        <h2 style={s.sectionTitle}>¿Cómo se crea una empresa sin capital?</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '3rem' }}>
          {[
            { num: '01', titulo: 'Publica tu proyecto', desc: 'Describe tu idea, el sector, el país donde vas a operar y qué roles necesitas para arrancar. Tu proyecto aparece en el directorio de Escala.' },
            { num: '02', titulo: 'Publica los roles que necesitas', desc: 'Contador, Abogado, Desarrollador, Diseñador, Community Manager. Cada rol tiene tareas específicas asignadas automáticamente según el país y la industria.' },
            { num: '03', titulo: 'Especialistas se postulan', desc: 'Los especialistas revisan tu proyecto, ven las tareas del rol y se postulan si encajan. Tú revisas sus perfiles y aceptas a quien te convenza.' },
            { num: '04', titulo: 'El equipo trabaja por participación', desc: 'No hay salarios. Cada tarea completada queda registrada como aporte. Cuando la empresa genere ingresos, la participación se convierte en pagos reales o en equity.' },
            { num: '05', titulo: 'Todo queda documentado', desc: 'Contratos automáticos, registro de aportes, historial de tareas. Todo legal, todo transparente, desde el primer día.' },
          ].map(step => (
            <div key={step.num} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1D9E75', flexShrink: 0, minWidth: '2.5rem' }}>{step.num}</div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.3rem' }}>{step.titulo}</div>
                <div style={{ fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6' }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={s.section}>
        <h2 style={s.sectionTitle}>Especialistas que puedes conseguir sin pagar salario</h2>
        <div style={s.grid}>
          {[
            { icon: '🧾', title: 'Contador Público', desc: 'NIT, libros contables, facturación electrónica, declaraciones. Todo lo que necesitas para operar legalmente.' },
            { icon: '⚖️', title: 'Abogado', desc: 'Constitución de empresa, contratos de equipo, propiedad intelectual, términos y condiciones.' },
            { icon: '💻', title: 'Desarrollador Full-Stack', desc: 'Construye tu producto digital — app, plataforma, MVP — sin necesidad de contratarlo a precio de mercado.' },
            { icon: '🎨', title: 'Diseñador UX/UI', desc: 'Identidad visual, prototipo, interfaz de usuario. El producto visual que necesitas para lanzar.' },
            { icon: '📣', title: 'Community Manager', desc: 'Redes sociales, contenido, comunidad de primeros usuarios. La voz de tu marca desde el día uno.' },
            { icon: '💼', title: 'Gerente de Proyecto', desc: 'Alguien que organiza el equipo, gestiona los hitos y mantiene el proyecto en movimiento.' },
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
            ['¿Es legal trabajar por participación en lugar de salario?', 'Sí. El contrato de participación diferida es una modalidad contractual válida en Colombia, México, Chile, España y la mayoría de países de Latinoamérica. No es un contrato laboral — es un acuerdo de participación en los resultados del proyecto.'],
            ['¿Qué pasa si la empresa nunca genera ingresos?', 'Si la empresa no prospera, el especialista no recibe compensación económica directa. Por eso en Escala los especialistas revisan muy bien el proyecto antes de postularse, y los fundadores deben mantener el proyecto activo y documentado.'],
            ['¿Cuándo y cómo se convierte la participación en dinero?', 'Tú y el especialista definen un "evento de pago" — cuando la empresa alcance X ingresos, cuando levante una ronda, o cuando se venda. En ese momento, la participación acumulada se convierte en el porcentaje acordado del valor del proyecto.'],
            ['¿Cómo sé que el especialista realmente va a trabajar?', 'El workspace de Escala tiene un sistema de tareas verificadas. El fundador verifica cada tarea completada. Si un especialista deja de trabajar, queda registrado en el historial y puede ser reemplazado sin perder lo avanzado.'],
            ['¿Puedo tener un equipo de 5 o 10 personas sin pagar nada?', 'Sí, muchos proyectos en Escala tienen equipos de 4 a 8 especialistas trabajando simultáneamente por participación. La clave es que el proyecto tenga visión clara, tareas definidas y un fundador activo.'],
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
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>Empieza sin capital. Termina con una empresa real.</h2>
          <p style={{ color: '#8FA3CC', marginBottom: '2rem', lineHeight: '1.6' }}>Publica tu proyecto en Escala hoy. Es gratis, y tu primer equipo puede estar activo en menos de una semana.</p>
          <a href="/registro" style={s.btnPrimary}>Crear mi proyecto gratis →</a>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>
          © 2026 Escala Network ·{' '}
          <a href="/startup-colombia" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Colombia</a> ·{' '}
          <a href="/startup-mexico" style={{ color: '#8FA3CC', textDecoration: 'none' }}>México</a> ·{' '}
          <a href="/startup-chile" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Chile</a> ·{' '}
          <a href="/que-es-escala" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Qué es Escala</a> ·{' '}
          <a href="/registro" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Registro</a>
        </div>
      </footer>
    </div>
  )
}
