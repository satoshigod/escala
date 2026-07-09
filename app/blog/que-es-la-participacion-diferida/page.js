// app/blog/que-es-la-participacion-diferida/page.js
export const metadata = {
  title: 'Qué es la Participación Diferida y Cómo Funciona — Guía Completa',
  description: 'La participación diferida es el modelo que permite crear empresas sin capital inicial. Aprende cómo funciona, cómo se calcula y qué protege legalmente a fundadores y especialistas.',
  keywords: ['participacion diferida', 'equity startup colombia', 'que es equity startup', 'modelo participacion empresa', 'crear empresa sin salario colombia'],
  openGraph: { title: 'Qué es la Participación Diferida', description: 'El modelo que permite crear empresas sin capital inicial. Guía completa.', url: 'https://escala.network/blog/que-es-la-participacion-diferida', images: [{ url: 'https://escala.network/brand/og-default.png?v=3', width: 1200, height: 630 }] },
  alternates: { canonical: 'https://escala.network/blog/que-es-la-participacion-diferida' },
}
const s = {
  page: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter,sans-serif', color: '#fff' },
  nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  article: { maxWidth: '720px', margin: '0 auto', padding: '4rem 1.5rem' },
  h1: { fontSize: 'clamp(1.75rem,4vw,2.75rem)', fontWeight: '900', lineHeight: '1.15', letterSpacing: '-0.03em', color: '#fff', marginBottom: '1.5rem' },
  h2: { fontSize: '1.4rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em', margin: '2.5rem 0 1rem' },
  p: { fontSize: '1rem', color: '#C8D4E8', lineHeight: '1.85', marginBottom: '1.25rem' },
  highlight: { background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.2)', borderRadius: '12px', padding: '1.25rem 1.5rem', margin: '2rem 0', fontSize: '1rem', color: '#C8D4E8', lineHeight: '1.7' },
}
export default function QueEsParticipacionDiferidaPage() {
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
          <span style={{ fontSize: '0.65rem', fontWeight: '700', background: '#4A90D9', color: '#fff', padding: '3px 10px', borderRadius: '20px' }}>Modelo de negocio</span>
          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Julio 2026 · 6 min de lectura</span>
        </div>
        <h1 style={s.h1}>Qué es la participación diferida y cómo funciona en la práctica</h1>
        <div style={s.highlight}>
          <strong style={{ color: '#fff' }}>En resumen:</strong> La participación diferida es un acuerdo donde un especialista trabaja en una empresa a cambio de un porcentaje del proyecto — no de un salario. La compensación se activa cuando la empresa genera ingresos o alcanza un evento de liquidez.
        </div>
        <h2 style={s.h2}>El problema que resuelve</h2>
        <p style={s.p}>La mayoría de startups en etapa temprana tienen el mismo problema: necesitan un equipo completo para poder crecer, pero no tienen el capital para pagar ese equipo desde el primer día. Y el talento que necesitan — contadores, abogados, desarrolladores, diseñadores — tiene sus propias facturas que pagar.</p>
        <p style={s.p}>El modelo tradicional tiene dos opciones: o el fundador paga salarios (imposible sin capital) o los especialistas trabajan gratis esperando algo que tal vez nunca llega (insostenible para ellos). La participación diferida es la tercera opción.</p>
        <h2 style={s.h2}>¿Cómo funciona exactamente?</h2>
        <p style={s.p}>El fundador y el especialista acuerdan tres cosas: (1) qué va a hacer el especialista, (2) cuánto vale ese trabajo a precio de mercado, y (3) qué porcentaje del proyecto o qué compensación recibirá cuando la empresa empiece a generar dinero.</p>
        <p style={s.p}>Ese acuerdo queda documentado en un contrato de participación diferida. En Escala, ese contrato se genera automáticamente cuando un especialista es aceptado en un rol. El trabajo queda registrado en el workspace del proyecto — cada tarea completada es evidencia del aporte.</p>
        <h2 style={s.h2}>¿Cuándo se paga?</h2>
        <p style={s.p}>Eso depende del acuerdo entre las partes. Los "eventos de pago" más comunes en Escala son: cuando la empresa alcanza un nivel de ingresos definido, cuando levanta una ronda de inversión, o cuando hay una venta total o parcial de la empresa.</p>
        <p style={s.p}>También puede haber pagos parciales progresivos — por ejemplo, un porcentaje de los ingresos mensuales una vez que la empresa empieza a facturar, hasta completar la compensación acordada.</p>
        <h2 style={s.h2}>¿Es legal en Colombia y Latinoamérica?</h2>
        <p style={s.p}>Sí. La participación diferida no es un contrato laboral — es un acuerdo de participación en resultados. En Colombia, México, Chile y España es una modalidad contractual válida. No genera obligaciones de seguridad social ni prestaciones laborales, porque no es una relación de empleo.</p>
        <p style={s.p}>Lo importante es que el contrato esté bien redactado, defina claramente los términos y sea firmado por ambas partes. Escala genera ese contrato automáticamente para cada relación fundador-especialista.</p>
        <h2 style={s.h2}>¿Qué riesgos tiene para el especialista?</h2>
        <p style={s.p}>El principal riesgo es que la empresa no prospere y el especialista nunca reciba compensación. Por eso antes de postularse a un proyecto en Escala, el especialista puede ver el avance real del proyecto, el equipo que ya tiene, los hitos completados y el perfil del fundador. La transparencia del workspace reduce el riesgo de apostar por un proyecto sin tracción real.</p>
        <div style={{ margin: '2.5rem 0', textAlign: 'center' }}>
          <a href="/crear-empresa-sin-capital" style={{ background: '#1D9E75', color: '#fff', padding: '1rem 2.5rem', borderRadius: '10px', textDecoration: 'none', fontSize: '1rem', fontWeight: '700', display: 'inline-block' }}>Cómo crear empresa sin capital →</a>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem', marginTop: '2.5rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#8FA3CC', marginBottom: '1.25rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Más artículos</div>
          {[
            { href: '/blog/historia-de-escala', titulo: 'La historia de Escala: cómo construimos el sistema operativo para crear empresas' },
            { href: '/blog/como-crear-una-startup-sin-dinero', titulo: 'Cómo crear una startup sin dinero en Latinoamérica' },
          ].map(a => <a key={a.href} href={a.href} style={{ display: 'block', fontSize: '0.88rem', color: '#4A90D9', textDecoration: 'none', marginBottom: '0.5rem' }}>{a.titulo} →</a>)}
        </div>
      </article>
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>© 2026 Escala Network · <a href="/blog" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Blog</a> · <a href="/registro" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Registro</a></div>
      </footer>
    </div>
  )
}
