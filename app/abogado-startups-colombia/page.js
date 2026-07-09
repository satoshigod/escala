// app/abogado-startups-colombia/page.js
// Keywords: "abogado startups colombia", "abogado empresas colombia", "abogado freelance colombia"

export const metadata = {
  title: 'Abogado para Startups en Colombia — Trabaja por Participación',
  description: 'Eres abogado en Colombia y quieres trabajar con startups. En Escala puedes ofrecer servicios legales a fundadores a cambio de participación diferida. Constitución SAS, contratos, propiedad intelectual y más.',
  keywords: ['abogado startups colombia', 'abogado empresas colombia', 'abogado freelance colombia', 'servicios legales startups', 'abogado bogota', 'abogado medellin', 'constitucion sas colombia'],
  openGraph: {
    title: 'Abogado para Startups en Colombia — Escala',
    description: 'Ofrece servicios legales a startups colombianas a cambio de participación. Sin salario fijo.',
    url: 'https://escala.network/abogado-startups-colombia',
    images: [{ url: 'https://escala.network/brand/og-default.png', width: 1200, height: 630 }],
  },
  alternates: { canonical: 'https://escala.network/abogado-startups-colombia' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Abogado para Startups en Colombia — Escala',
  description: 'Plataforma para abogados que quieren trabajar con startups por participación',
  url: 'https://escala.network/abogado-startups-colombia',
}

const s = {
  page: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter,sans-serif', color: '#fff' },
  nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: '1.1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', textDecoration: 'none' },
  hero: { maxWidth: '900px', margin: '0 auto', padding: '5rem 1.5rem 4rem' },
  tag: { display: 'inline-block', background: 'rgba(175,169,236,0.1)', border: '1px solid rgba(175,169,236,0.3)', color: '#AFA9EC', fontSize: '0.75rem', fontWeight: '700', padding: '0.3rem 0.875rem', borderRadius: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1.5rem' },
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

export default function AbogadoStartupsColombiaPage() {
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
        <div style={s.tag}>⚖️ Para Abogados</div>
        <h1 style={s.h1}>Eres abogado. Las startups te necesitan y no pueden pagarte aún.</h1>
        <p style={s.sub}>
          En Escala puedes convertir tu expertise legal en participación real en empresas que están construyendo algo.
          Constitución SAS, contratos, propiedad intelectual — hay fundadores buscando exactamente lo que sabes hacer.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <a href="/registro" style={s.btnPrimary}>Unirme como Abogado →</a>
          <a href="/buscar" style={s.btnSecondary}>Ver proyectos disponibles</a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.75rem', maxWidth: '700px' }}>
          {[['Constitución SAS', '🏢'], ['Contratos equipo', '📄'], ['Propiedad intelectual', '💡'], ['Marca registrada', '™️'], ['Contratos comerciales', '🤝']].map(([tarea, emoji]) => (
            <div key={tarea} style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)', fontSize: '0.8rem', color: '#8FA3CC' }}>
              {emoji} {tarea}
            </div>
          ))}
        </div>
      </section>

      <section style={s.section}>
        <h2 style={s.sectionTitle}>Lo que hacen los abogados en Escala</h2>
        <div style={s.grid}>
          {[
            { icon: '🏢', title: 'Constitución de empresa', desc: 'Registro ante Cámara de Comercio, DIAN, apertura de libros y todo el proceso de formalización de una SAS en Colombia.' },
            { icon: '📝', title: 'Contratos de equipo', desc: 'Contratos de participación diferida, acuerdos de confidencialidad, pactos de socios y estructuras de equity para el equipo fundador.' },
            { icon: '💡', title: 'Propiedad intelectual', desc: 'Registro de marca ante la SIC, protección de software, acuerdos de cesión de derechos y contratos de licencia.' },
            { icon: '⚖️', title: 'Regulatorio y compliance', desc: 'Cumplimiento PTEE, habeas data, términos y condiciones, políticas de privacidad para plataformas digitales.' },
            { icon: '🤝', title: 'Contratos comerciales', desc: 'Contratos con clientes, proveedores, distribuidores e inversionistas. Due diligence legal para rondas de inversión.' },
            { icon: '📋', title: 'Estructuración societaria', desc: 'Valoración de la empresa, estructura accionaria, derechos de los socios y planificación para rondas de capital.' },
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
        <h2 style={s.sectionTitle}>Preguntas frecuentes — Abogados en Escala</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            ['¿Es ético trabajar por participación siendo abogado?', 'Sí. En Colombia el Código de Ética Profesional del Abogado permite honorarios basados en resultados y participaciones en empresas cliente, siempre que no generen conflicto de interés. Es una práctica común en el ecosistema de startups.'],
            ['¿Qué tareas legales piden primero las startups?', 'Lo más urgente suele ser la constitución SAS (registro ante Cámara de Comercio y DIAN), seguido de contratos de participación para el equipo, habeas data/política de privacidad y, si tienen producto digital, términos y condiciones.'],
            ['¿Puedo trabajar en proyectos de diferentes sectores?', 'Sí. Escala tiene proyectos en tecnología, salud, educación, fintech, retail y más. Puedes especializarte en un sector o diversificar según tu expertise.'],
            ['¿Cómo protejo mi trabajo si el proyecto no prospera?', 'El contrato de participación diferida que genera Escala documenta todo el aporte que hiciste. Si el proyecto no prospera, tienes el respaldo legal de tu trabajo registrado y acordado con el fundador.'],
          ].map(([q, a]) => (
            <div key={q} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 0' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>{q}</h3>
              <p style={{ fontSize: '0.83rem', color: '#8FA3CC', lineHeight: '1.7', margin: 0 }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ padding: '0 1.5rem 5rem', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(175,169,236,0.06)', border: '1px solid rgba(175,169,236,0.2)', borderRadius: '20px', padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>Tu próxima startup cliente te está esperando</h2>
          <p style={{ color: '#8FA3CC', marginBottom: '2rem', lineHeight: '1.6' }}>Crea tu perfil de abogado en Escala en menos de 5 minutos. Sin costo, sin intermediarios.</p>
          <a href="/registro" style={s.btnPrimary}>Crear perfil de Abogado →</a>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>
          © 2026 Escala Network ·{' '}
          <a href="/contador-publico-colombia" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Contadores</a> ·{' '}
          <a href="/startup-colombia" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Startups Colombia</a> ·{' '}
          <a href="/buscar-cofundador" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Cofundadores</a> ·{' '}
          <a href="/registro" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Registro</a>
        </div>
      </footer>
    </div>
  )
}
