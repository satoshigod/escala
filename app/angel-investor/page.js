// app/angel-investor/page.js
export const metadata = {
  title: 'Ángel Investor en Latinoamérica — Invierte en Startups por Hitos',
  description: 'Invierte en startups latinoamericanas por hitos específicos. En Escala los Ángeles de Impulso financian momentos puntuales del proyecto a cambio de participación. Sin riesgo total, con impacto real.',
  keywords: ['angel investor colombia', 'angel investor latinoamerica', 'invertir en startups colombia', 'inversion angel startup', 'angel investor mexico', 'inversion temprana startup latam'],
  openGraph: { title: 'Ángel Investor en Latinoamérica — Escala', description: 'Invierte en startups por hitos específicos. Sin riesgo total, con impacto real.', url: 'https://escala.network/angel-investor', images: [{ url: 'https://escala.network/brand/og-default.png?v=3', width: 1200, height: 630 }] },
  alternates: { canonical: 'https://escala.network/angel-investor' },
}
const s = {
  page: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter,sans-serif', color: '#fff' },
  nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: '1.1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', textDecoration: 'none' },
  hero: { maxWidth: '900px', margin: '0 auto', padding: '5rem 1.5rem 4rem' },
  tag: { display: 'inline-block', background: 'rgba(232,160,32,0.1)', border: '1px solid rgba(232,160,32,0.3)', color: '#E8A020', fontSize: '0.75rem', fontWeight: '700', padding: '0.3rem 0.875rem', borderRadius: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1.5rem' },
  h1: { fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: '900', lineHeight: '1.1', letterSpacing: '-0.03em', marginBottom: '1.5rem', color: '#fff' },
  sub: { fontSize: '1.1rem', color: '#8FA3CC', lineHeight: '1.7', maxWidth: '600px', marginBottom: '2.5rem' },
  btn: { background: '#E8A020', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', display: 'inline-block' },
  btn2: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600', display: 'inline-block' },
  section: { maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 4rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem', marginBottom: '3rem' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem' },
}
export default function AngelInvestorPage() {
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href="/" style={s.logo}>Esca<span style={{ color: '#1D9E75' }}>la</span></a>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/buscar" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>Proyectos</a>
          <a href="/que-es-escala" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>Qué es Escala</a>
          <a href="/registro" style={{ background: '#E8A020', color: '#fff', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>Invertir ahora</a>
        </div>
      </nav>
      <section style={s.hero}>
        <div style={s.tag}>⚡ Ángel de Impulso</div>
        <h1 style={s.h1}>Invierte en startups latinoamericanas por hitos, no en ciegas.</h1>
        <p style={s.sub}>En Escala los Ángeles de Impulso financian momentos específicos de un proyecto — el NIT, el MVP, el primer cliente — a cambio de participación. No es una ronda formal. Es una apuesta quirúrgica por el equipo y el momento.</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/registro" style={s.btn}>Quiero ser Ángel de Impulso →</a>
          <a href="/buscar" style={s.btn2}>Ver proyectos activos</a>
        </div>
      </section>
      <section style={s.section}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '1.5rem' }}>¿Cómo funciona el Ángel de Impulso?</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
          {[
            { num: '01', titulo: 'Explora proyectos activos', desc: 'Ve el directorio de proyectos en Escala — cada uno tiene su equipo, hitos completados, avance real y el perfil del fundador. No hay pitch decks genéricos, hay trabajo documentado.' },
            { num: '02', titulo: 'Elige un hito específico para financiar', desc: 'Cada proyecto tiene hitos definidos — constitución legal, MVP, primera venta, primer empleado. Tú eliges cuál quieres financiar y cuánto estás dispuesto a poner.' },
            { num: '03', titulo: 'Acuerda la participación con el fundador', desc: 'El fundador propone un porcentaje de participación por el capital que aportas para ese hito. Todo queda documentado en la plataforma y respaldado por contrato.' },
            { num: '04', titulo: 'El hito se completa — tú lo verificas', desc: 'Cuando el fundador marca el hito como completado, tú lo verificas en la plataforma. Tu inversión se libera solo cuando hay resultado real.' },
            { num: '05', titulo: 'Tu participación crece con la empresa', desc: 'A medida que la empresa crece, tu participación se convierte en valor real — en ingresos distribuidos, en equity al levantar una ronda, o al vender la empresa.' },
          ].map(step => (
            <div key={step.num} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#E8A020', flexShrink: 0, minWidth: '2.5rem' }}>{step.num}</div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.3rem' }}>{step.titulo}</div>
                <div style={{ fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6' }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section style={s.section}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '1.5rem' }}>¿Por qué invertir en Escala?</h2>
        <div style={s.grid}>
          {[
            { icon: '🔍', title: 'Proyectos verificados', desc: 'No es un pitch. Son proyectos con equipo activo, tareas completadas y avance documentado. Inviertes viendo el trabajo real, no una presentación.' },
            { icon: '📋', title: 'Contratos automáticos', desc: 'Cada inversión genera un contrato de participación diferida claro, con los términos acordados entre tú y el fundador, respaldado legalmente.' },
            { icon: '🎯', title: 'Por hito, no en ciegas', desc: 'Financias momentos específicos. Si el hito no se completa, la conversación continúa. Si se completa, tu participación está asegurada.' },
            { icon: '🌎', title: 'Proyectos de 7 países', desc: 'Colombia, México, Chile, Argentina, Perú, Ecuador y España. Diversifica tu portafolio de inversión en etapa temprana en toda la región.' },
            { icon: '📊', title: 'Seguimiento en tiempo real', desc: 'Desde tu cuenta puedes ver el avance de los proyectos en los que invertiste — tareas, hitos, equipo, y métricas de crecimiento.' },
            { icon: '💰', title: 'Ticket mínimo accesible', desc: 'No necesitas grandes capitales para ser Ángel de Impulso. Los hitos varían en costo según el proyecto y el momento. Tú defines tu exposición.' },
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
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '1.5rem' }}>Preguntas frecuentes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            ['¿Cuál es el monto mínimo para ser Ángel de Impulso?', 'No hay un mínimo fijo — depende del hito que quieras financiar y del acuerdo con el fundador. Algunos hitos cuestan menos de $1,000 USD (constitución legal, por ejemplo); otros pueden ser más (desarrollo de MVP, expansión a otro país).'],
            ['¿Qué tipo de proyectos hay disponibles?', 'Tecnología, salud, educación, fintech, agro, e-commerce, servicios. Los proyectos son de Colombia, México, Chile, Argentina, Perú y España. Puedes filtrar por sector, país y etapa de avance.'],
            ['¿Cómo garantizo que el fundador va a cumplir?', 'El contrato de participación cubre los términos acordados. Además, en Escala el trabajo del equipo es público y verificable — ves exactamente qué se ha hecho antes de invertir. No hay promesas sin evidencia.'],
            ['¿Puedo recuperar mi inversión si el proyecto no funciona?', 'La participación diferida no es un préstamo — es una apuesta por el éxito del proyecto. Si el proyecto no prospera, no hay devolución. Por eso en Escala puedes ver el avance real antes de invertir, y elegir proyectos con tracción, no solo con buena idea.'],
          ].map(([q, a]) => (
            <div key={q} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 0' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>{q}</h3>
              <p style={{ fontSize: '0.83rem', color: '#8FA3CC', lineHeight: '1.7', margin: 0 }}>{a}</p>
            </div>
          ))}
        </div>
      </section>
      <div style={{ padding: '0 1.5rem 5rem', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(232,160,32,0.06)', border: '1px solid rgba(232,160,32,0.2)', borderRadius: '20px', padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>Tu próxima inversión ángel te está esperando</h2>
          <p style={{ color: '#8FA3CC', marginBottom: '2rem', lineHeight: '1.6' }}>Crea tu cuenta de Ángel de Impulso en Escala hoy. Sin costo de registro, sin cuotas.</p>
          <a href="/registro" style={s.btn}>Quiero ser Ángel de Impulso →</a>
        </div>
      </div>
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>
          © 2026 Escala Network ·{' '}
          <a href="/startup-colombia" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Colombia</a> ·{' '}
          <a href="/buscar" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Ver proyectos</a> ·{' '}
          <a href="/registro" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Registro</a>
        </div>
      </footer>
    </div>
  )
}
