// app/blog/como-crear-una-startup-sin-dinero/page.js
export const metadata = {
  title: 'Cómo Crear una Startup Sin Dinero en Latinoamérica — Guía Real',
  description: 'El modelo de participación diferida, cómo conseguir un equipo que trabaje por equity, qué errores evitar y casos reales de startups que empezaron sin capital en Colombia y Chile.',
  keywords: ['crear startup sin dinero', 'startup sin capital latinoamerica', 'emprender sin capital colombia', 'equity startup colombia', 'como crear empresa sin dinero'],
  openGraph: { title: 'Cómo Crear una Startup Sin Dinero', description: 'El modelo real para emprender sin capital en Latinoamérica.', url: 'https://escala.network/blog/como-crear-una-startup-sin-dinero', images: [{ url: 'https://escala.network/brand/og-default.png?v=3', width: 1200, height: 630 }] },
  alternates: { canonical: 'https://escala.network/blog/como-crear-una-startup-sin-dinero' },
}
const s = {
  page: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter,sans-serif', color: '#fff' },
  nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  article: { maxWidth: '720px', margin: '0 auto', padding: '4rem 1.5rem' },
  h1: { fontSize: 'clamp(1.75rem,4vw,2.75rem)', fontWeight: '900', lineHeight: '1.15', letterSpacing: '-0.03em', color: '#fff', marginBottom: '1.5rem' },
  h2: { fontSize: '1.4rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em', margin: '2.5rem 0 1rem' },
  p: { fontSize: '1rem', color: '#C8D4E8', lineHeight: '1.85', marginBottom: '1.25rem' },
}
export default function ComoCrearStartupSinDineroPage() {
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href="/" style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', textDecoration: 'none' }}>Esca<span style={{ color: '#1D9E75' }}>la</span></a>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/blog" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>← Blog</a>
          <a href="/registro" style={{ background: '#1D9E75', color: '#fff', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>Crear cuenta</a>
        </div>
      </nav>
      <article style={s.article}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: '700', background: '#E8A020', color: '#412402', padding: '3px 10px', borderRadius: '20px' }}>Emprendimiento</span>
          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Julio 2026 · 7 min de lectura</span>
        </div>
        <h1 style={s.h1}>Cómo crear una startup sin dinero en Latinoamérica</h1>
        <p style={s.p}>La pregunta más frecuente que recibimos en Escala es: "¿Cómo armo un equipo si no tengo para pagarles?" La respuesta no es simple, pero tampoco es un misterio. Miles de empresas en el mundo arrancaron exactamente así — con talento comprometido y sin capital para salarios.</p>
        <h2 style={s.h2}>El error más común: pensar que necesitas dinero primero</h2>
        <p style={s.p}>La mayoría de emprendedores piensan en una secuencia lineal: consigo capital → con ese capital pago el equipo → el equipo construye el producto → el producto genera ingresos. El problema es que llegar al primer paso es difícil sin tracción, y la tracción requiere un equipo.</p>
        <p style={s.p}>El modelo de participación diferida invierte esa secuencia: el equipo trabaja primero por participación futura → juntos construyen el producto → el producto genera ingresos → los ingresos pagan los aportes del equipo.</p>
        <h2 style={s.h2}>Qué funciona y qué no</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1.5rem 0' }}>
          {[
            { ok: true, item: 'Ser transparente sobre el modelo desde el primer día. Nunca prometer salario cuando en realidad es participación.' },
            { ok: true, item: 'Documentar todo. Cada tarea, cada hora, cada acuerdo — en papel y en la plataforma.' },
            { ok: true, item: 'Elegir a personas que entiendan el riesgo y lo acepten conscientemente.' },
            { ok: true, item: 'Definir desde el principio qué es el "evento de pago" — cuándo y cómo se convierte la participación en dinero real.' },
            { ok: false, item: 'Asumir que el entusiasmo inicial es suficiente sin un contrato claro.' },
            { ok: false, item: 'Ofrecer porcentajes irreales (el 50% del proyecto a cada uno de los cinco miembros del equipo).' },
            { ok: false, item: 'No tener claridad sobre quién decide qué en la empresa.' },
            { ok: false, item: 'Esperar que el equipo trabaje indefinidamente sin resultados visibles.' },
          ].map(({ ok, item }) => (
            <div key={item} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.9rem', color: ok ? '#C8D4E8' : '#8FA3CC' }}>
              <span style={{ color: ok ? '#1D9E75' : '#E05555', flexShrink: 0, fontWeight: '700', fontSize: '1rem' }}>{ok ? '✓' : '✕'}</span>
              {item}
            </div>
          ))}
        </div>
        <h2 style={s.h2}>Los roles que puedes conseguir sin pagar salario</h2>
        <p style={s.p}>No todos los roles tienen la misma disposición a trabajar por participación. En Escala, los perfiles que más frecuentemente aceptan este modelo en etapa temprana son:</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0.75rem', margin: '1rem 0 1.5rem' }}>
          {[
            { rol: 'Desarrollador Full-Stack', nivel: 'Alta disposición', color: '#1D9E75' },
            { rol: 'Diseñador UX/UI', nivel: 'Alta disposición', color: '#1D9E75' },
            { rol: 'Contador', nivel: 'Media disposición', color: '#E8A020' },
            { rol: 'Abogado', nivel: 'Media disposición', color: '#E8A020' },
            { rol: 'Community Manager', nivel: 'Alta disposición', color: '#1D9E75' },
            { rol: 'Gerente de Proyecto', nivel: 'Alta disposición', color: '#1D9E75' },
          ].map(item => (
            <div key={item.rol} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.875rem 1rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', marginBottom: '0.25rem' }}>{item.rol}</div>
              <div style={{ fontSize: '0.72rem', color: item.color, fontWeight: '600' }}>{item.nivel}</div>
            </div>
          ))}
        </div>
        <h2 style={s.h2}>El papel de Escala en este proceso</h2>
        <p style={s.p}>Escala resuelve el problema de coordinación y confianza que hace difícil este modelo. Sin una plataforma, el fundador tiene que encontrar a los especialistas por sus propios medios, negociar sin referencia de mercado, redactar contratos costosos y hacer seguimiento manual del trabajo de cada persona.</p>
        <p style={s.p}>En Escala, el fundador publica el proyecto, los especialistas se postulan, el contrato se genera automáticamente y el trabajo queda documentado en el workspace. El especialista puede ver el avance real del proyecto antes de comprometerse, y el fundador puede ver el historial y el Score del especialista antes de aceptarlo.</p>
        <div style={{ margin: '2.5rem 0', textAlign: 'center' }}>
          <a href="/registro" style={{ background: '#1D9E75', color: '#fff', padding: '1rem 2.5rem', borderRadius: '10px', textDecoration: 'none', fontSize: '1rem', fontWeight: '700', display: 'inline-block' }}>Publicar mi proyecto en Escala →</a>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem', marginTop: '2.5rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#8FA3CC', marginBottom: '1.25rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Más artículos</div>
          {[
            { href: '/blog/que-es-la-participacion-diferida', titulo: 'Qué es la participación diferida y cómo funciona' },
            { href: '/blog/historia-de-escala', titulo: 'La historia de Escala' },
            { href: '/crear-empresa-sin-capital', titulo: 'Ver cómo crear empresa sin capital en Escala →' },
          ].map(a => <a key={a.href} href={a.href} style={{ display: 'block', fontSize: '0.88rem', color: '#4A90D9', textDecoration: 'none', marginBottom: '0.5rem' }}>{a.titulo} →</a>)}
        </div>
      </article>
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>© 2026 Escala Network · <a href="/blog" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Blog</a> · <a href="/registro" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Registro</a></div>
      </footer>
    </div>
  )
}
