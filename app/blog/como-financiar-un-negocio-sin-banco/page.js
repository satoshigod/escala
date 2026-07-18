import Link from 'next/link'
export const metadata = {
  title: 'Como financiar un negocio sin banco en Colombia — Escala Blog',
  description: 'Las opciones reales para conseguir capital para tu negocio sin ir al banco: participacion diferida, inversores angel, crowdfunding y el modelo Escala.',
  keywords: ['financiar negocio sin banco colombia', 'capital para negocio sin credito', 'como conseguir dinero para negocio', 'alternativas al credito bancario colombia'],
}
const s = {
  page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff' },
  wrap: { maxWidth: '720px', margin: '0 auto', padding: '5rem 1.5rem' },
  h1: { fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '1rem', lineHeight: '1.2' },
  meta: { fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '2.5rem' },
  p: { fontSize: '1rem', color: '#C8D4E8', lineHeight: '1.8', marginBottom: '1.25rem' },
  h2: { fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: '2.5rem 0 1rem', letterSpacing: '-0.02em' },
  btn: { display: 'inline-block', background: '#1D9E75', color: '#fff', padding: '0.75rem 1.75rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', marginTop: '2rem' },
}
export default function Page() {
  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '0.75rem' }}>Blog · Financiacion</div>
        <h1 style={s.h1}>Como financiar un negocio sin banco en Colombia</h1>
        <div style={s.meta}>Escala · Julio 2026 · 5 min de lectura</div>

        <p style={s.p}>El banco no es la unica opcion para conseguir capital. En Colombia, miles de emprendedores financian sus negocios sin credito bancario usando modelos alternativos que cada vez son mas accesibles.</p>

        <h2 style={s.h2}>1. Participacion diferida — el equipo trabaja por acciones</h2>
        <p style={s.p}>En este modelo, los especialistas (contadores, abogados, desarrolladores, diseñadores) trabajan para tu empresa a cambio de un porcentaje del negocio en vez de un salario inmediato. Tu no pagas nomina — pagas con acciones cuando el negocio genere valor.</p>
        <p style={s.p}>Es el modelo que usa Escala. El equipo asume el riesgo contigo y se beneficia si el negocio crece.</p>

        <h2 style={s.h2}>2. Inversores angel — capital por item</h2>
        <p style={s.p}>Un angel inversionista no necesariamente pone capital en el negocio completo. Puede financiar un activo especifico: el horno de tu panaderia, el servidor de tu startup, la primera orden de inventario de tu tienda.</p>
        <p style={s.p}>A cambio recibe participacion en el negocio, cuotas mensuales o un porcentaje de tus ventas hasta recuperar lo invertido. Escala conecta emprendedores con este tipo de inversores.</p>

        <h2 style={s.h2}>3. Crowdfunding — muchos ponen poco</h2>
        <p style={s.p}>Plataformas como Indiegogo o Kickstarter permiten que muchas personas pongan pequeñas cantidades para financiar un proyecto. Funciona mejor para productos que ya tienen una audiencia.</p>

        <h2 style={s.h2}>4. Fondos de emprendimiento publicos</h2>
        <p style={s.p}>El gobierno colombiano tiene programas como iNNpulsa, Fondo Emprender y convocatorias de Minciencias que ofrecen capital semilla no reembolsable para emprendedores. El proceso es largo pero el capital es gratuito.</p>

        <h2 style={s.h2}>5. Financiar por ventas anticipadas</h2>
        <p style={s.p}>Vender antes de producir es una de las formas mas sanas de financiar un negocio. Ofreces descuentos a cambio de pago anticipado y usas ese capital para producir. Valida el mercado y financia al mismo tiempo.</p>

        <h2 style={s.h2}>El modelo de Escala</h2>
        <p style={s.p}>Escala combina los primeros dos modelos: el equipo trabaja por participacion diferida y los inversores financian cada activo especifico que el negocio necesita. Es la forma mas eficiente de construir una empresa en Colombia sin capital propio.</p>

        <Link href="/registro" style={s.btn}>Crear mi proyecto en Escala →</Link>
      </div>
    </div>
  )
}
