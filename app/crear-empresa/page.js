// app/crear-empresa/page.js
// Keywords: "crear empresa", "cómo crear una empresa", "crear startup sin capital"

export const metadata = {
  title: 'Crear Empresa — Cómo Crear tu Startup sin Capital Inicial',
  description: 'Aprende cómo crear una empresa real desde cero. Encuentra cofundadores, forma tu equipo con participación diferida y constituye tu empresa. Gratis en Escala.',
  keywords: ['crear empresa', 'cómo crear una empresa', 'crear startup', 'crear empresa sin capital', 'crear empresa online', 'plataforma para emprendedores'],
  openGraph: {
    title: 'Crear Empresa — Escala',
    description: 'La plataforma para crear empresas reales sin capital inicial. Cofundadores, equipo y contratos en un solo lugar.',
    url: 'https://escala.network/crear-empresa',
    images: [{ url: 'https://escala.network/brand/og-default.png', width: 1200, height: 630 }],
  },
  alternates: { canonical: 'https://escala.network/crear-empresa' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Cómo crear una empresa con Escala',
  description: 'Guía paso a paso para crear una empresa usando Escala — la plataforma de participación diferida para emprendedores.',
  step: [
    { '@type': 'HowToStep', name: 'Publicar tu idea', text: 'Describe tu proyecto en Escala: qué problema resuelve, a quién va dirigido y qué perfiles necesitas.' },
    { '@type': 'HowToStep', name: 'Encontrar cofundadores', text: 'El directorio te conecta con especialistas que pueden unirse a tu proyecto por participación diferida.' },
    { '@type': 'HowToStep', name: 'Definir la participación', text: 'Negocia el porcentaje de cada cofundador según su rol y dedicación. Escala genera el contrato automáticamente.' },
    { '@type': 'HowToStep', name: 'Ejecutar y constituir', text: 'Gestiona tareas, metas y pagos desde Escala. Cuando la empresa esté lista, el workspace de constitución te guía.' },
  ],
}

const s = {
  page: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter,sans-serif', color: '#fff' },
  nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: '1.1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', textDecoration: 'none' },
  hero: { maxWidth: '900px', margin: '0 auto', padding: '5rem 1.5rem 4rem' },
  tag: { display: 'inline-block', background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.3)', color: '#1D9E75', fontSize: '0.75rem', fontWeight: '700', padding: '0.3rem 0.875rem', borderRadius: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1.5rem' },
  h1: { fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: '900', lineHeight: '1.1', letterSpacing: '-0.03em', marginBottom: '1.5rem', color: '#fff' },
  sub: { fontSize: '1.1rem', color: '#8FA3CC', lineHeight: '1.7', maxWidth: '600px', marginBottom: '2.5rem' },
  btnPrimary: { background: '#1D9E75', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', display: 'inline-block' },
  section: { maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 4rem' },
  sectionTitle: { fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.02em' },
}

export default function CrearEmpresaPage() {
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
        <div style={s.tag}>Para emprendedores</div>
        <h1 style={s.h1}>Cómo crear una empresa real sin capital inicial</h1>
        <p style={s.sub}>
          Escala es la plataforma que permite crear empresas reales conectando fundadores
          con cofundadores, especialistas e inversores que aportan tiempo y conocimiento
          a cambio de participación diferida — no de un salario.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
          <a href="/registro" style={s.btnPrimary}>Publicar mi proyecto →</a>
          <a href="/que-es-escala" style={{ ...s.btnPrimary, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}>Cómo funciona</a>
        </div>
      </section>

      {/* 4 pasos HowTo */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>4 pasos para crear tu empresa en Escala</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '680px' }}>
          {[
            { n: '1', icon: '💡', title: 'Publica tu idea', desc: 'Describe tu proyecto: qué problema resuelve, a quién va dirigido, el sector y los perfiles que necesitas. Es gratis y tarda menos de 5 minutos.' },
            { n: '2', icon: '🤝', title: 'Encuentra tu equipo', desc: 'El directorio de Escala conecta tu proyecto con cofundadores y especialistas disponibles en Colombia, México, Chile y más países.' },
            { n: '3', icon: '📄', title: 'Define la participación', desc: 'Negocia el porcentaje de cada cofundador según su rol. Escala genera el contrato legal automáticamente con 15 cláusulas adaptadas a tu país.' },
            { n: '4', icon: '🚀', title: 'Ejecuta y constituye', desc: 'Gestiona tareas, metas y pagos desde Escala. El workspace de constitución te guía paso a paso para registrar tu empresa formalmente.' },
          ].map(step => (
            <div key={step.n} style={{ display: 'flex', gap: '1.25rem', padding: '1.5rem', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.3)', color: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', flexShrink: 0, fontSize: '1.1rem' }}>{step.n}</div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '0.4rem' }}>{step.icon} {step.title}</div>
                <div style={{ fontSize: '0.85rem', color: '#8FA3CC', lineHeight: '1.7' }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Diferenciadores */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>¿Por qué Escala es diferente?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem' }}>
          {[
            { title: 'No es un empleo', desc: 'Los especialistas no son empleados — son cofundadores o colaboradores con participación. Sin nómina, sin riesgo laboral en etapas tempranas.' },
            { title: 'No es una agencia', desc: 'Escala no ejecuta proyectos por ti. Te conecta con las personas correctas y te da la infraestructura para que tu equipo opere.' },
            { title: 'No es un fondo', desc: 'Escala no invierte dinero en tu startup. Te conecta con personas que invierten tiempo, conocimiento o capital propio a cambio de participación.' },
            { title: 'Es tu sistema operativo', desc: 'Contratos, tareas, metas, pagos, constitución y equipo en un solo lugar. Todo lo que necesita una empresa en etapa temprana.' },
          ].map(item => (
            <div key={item.title} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1D9E75', marginBottom: '0.5rem' }}>{item.title}</h3>
              <p style={{ fontSize: '0.83rem', color: '#8FA3CC', lineHeight: '1.6', margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Links a países */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Disponible en 7 países</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0.75rem', maxWidth: '700px' }}>
          {[
            { flag: '🇨🇴', name: 'Colombia', href: '/startup-colombia' },
            { flag: '🇲🇽', name: 'México', href: '/startup-mexico' },
            { flag: '🇨🇱', name: 'Chile', href: '/buscar' },
            { flag: '🇦🇷', name: 'Argentina', href: '/buscar' },
            { flag: '🇵🇪', name: 'Perú', href: '/buscar' },
            { flag: '🇪🇨', name: 'Ecuador', href: '/buscar' },
            { flag: '🇪🇸', name: 'España', href: '/buscar' },
          ].map(p => (
            <a key={p.name} href={p.href} style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none', display: 'block' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{p.flag}</div>
              <div style={{ fontSize: '0.8rem', color: '#8FA3CC', fontWeight: '600' }}>{p.name}</div>
            </a>
          ))}
        </div>
      </section>

      <div style={{ padding: '0 1.5rem 5rem', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '20px', padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>Empieza a crear tu empresa hoy</h2>
          <p style={{ color: '#8FA3CC', marginBottom: '2rem', lineHeight: '1.6' }}>Es gratis. No necesitas capital para publicar tu proyecto y conectar con tu equipo.</p>
          <a href="/registro" style={s.btnPrimary}>Crear cuenta gratis →</a>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>
          © 2026 Escala Network ·{' '}
          <a href="/buscar-cofundador" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Buscar cofundador</a> ·{' '}
          <a href="/startup-colombia" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Colombia</a> ·{' '}
          <a href="/startup-mexico" style={{ color: '#8FA3CC', textDecoration: 'none' }}>México</a> ·{' '}
          <a href="/que-es-escala" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Qué es Escala</a>
        </div>
      </footer>
    </div>
  )
}
