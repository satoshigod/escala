import Link from 'next/link'
export const metadata = {
  title: 'Como escalar tu negocio sin pedir un prestamo bancario en Colombia — Escala Blog',
  description: 'Crecer sin deuda bancaria es posible. Te explicamos tres modelos que usan el excedente del negocio mismo para financiar el crecimiento, sin historial ni garantías.',
  keywords: ['escalar negocio sin prestamo Colombia','crecer negocio sin banco','financiar crecimiento sin credito','alternativas prestamo bancario Colombia','como crecer negocio informal Colombia'],
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
        <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '0.75rem' }}>Blog · Crecimiento</div>
        <h1 style={s.h1}>Como hacer crecer tu negocio sin pedir prestamo al banco</h1>
        <div style={s.meta}>Escala · Julio 2026 · 6 min de lectura</div>
        <p style={s.p}>La mayoría de negocios pequeños en Colombia están atrapados en el mismo ciclo: necesitan capital para crecer, van al banco, el banco los rechaza porque son informales o no tienen historial, y se quedan igual. Mientras tanto, hay oportunidades que se van.</p>
        <p style={s.p}>La alternativa no es resignarse ni endeudarse con un gota a gota. Hay modelos donde el crecimiento se financia con el excedente que genera el mismo negocio.</p>
        <h2 style={s.h2}>El principio fundamental</h2>
        <p style={s.p}>Si un activo — una máquina, un local, un equipo — genera más ingresos de lo que cuesta pagarlo, entonces se paga solo. El capital del ángel no es un préstamo que hay que pagar con dinero de otro lado: es una inversión que el mismo activo devuelve.</p>
        <h2 style={s.h2}>Tres modelos para diferentes tipos de negocio</h2>
        <p style={s.p}><strong style={{color:'#fff'}}>Si produces algo y necesitas más capacidad:</strong> el modelo de maquinaria. Un ángel compra el equipo, tú lo usas y pagas desde el excedente que genera. Aplica para confección, comida, belleza, carpintería, zapatería.</p>
        <p style={s.p}><strong style={{color:'#fff'}}>Si tienes un negocio de ventas y necesitas un local:</strong> el modelo de local comercial. Un ángel financia el arriendo, tú reportas ventas y pagas el excedente. Al terminar, el negocio es completamente tuyo.</p>
        <p style={s.p}><strong style={{color:'#fff'}}>Si tienes una empresa o proyecto y necesitas equipo humano:</strong> el modelo de participación diferida. Los especialistas trabajan por participación futura en lugar de salario inmediato. El costo del equipo se difiere hasta que el negocio genera.</p>
        <h2 style={s.h2}>La clave es el excedente real</h2>
        <p style={s.p}>Antes de buscar financiamiento, calcula el excedente que genera el activo que quieres: ingresos adicionales menos costos adicionales. Si ese número es positivo y mayor que el costo mensual de financiar el activo, el modelo funciona. Si no, el negocio no está listo para ese activo todavía.</p>
        <Link href="/que-es-escala" style={s.btn}>Como funciona Escala →</Link>
      </div>
    </div>
  )
}
