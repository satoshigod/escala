import Link from 'next/link'
export const metadata = {
  title: 'Como trabajar desde casa con confeccion en Colombia y ganar bien — Escala Blog',
  description: 'Miles de confeccionistas trabajan desde casa en Colombia como talleres satélite. Te explicamos cómo funciona, cuánto se puede ganar y cómo crecer sin salir del barrio.',
  keywords: ['trabajar desde casa confeccion Colombia','taller satelite confeccion Medellin','como ganar dinero costura desde casa','confeccion trabajo en casa Colombia','maquila confeccion Medellin'],
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
        <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '0.75rem' }}>Blog · Confección</div>
        <h1 style={s.h1}>Trabajar desde casa haciendo confeccion en Colombia: como funciona y cuanto se puede ganar</h1>
        <div style={s.meta}>Escala · Julio 2026 · 6 min de lectura</div>
        <p style={s.p}>En Medellín, Bogotá, Cali y otras ciudades de Colombia hay decenas de miles de personas que trabajan desde casa haciendo confección — ropa interior, vestidos de baño, pijamas, uniformes, ropa casual. Se llaman talleres satélite y son una parte fundamental de la cadena de producción textil del país.</p>
        <p style={s.p}>Es un trabajo real, con ingresos reales. Pero también tiene límites claros que muchas confeccionistas quieren superar.</p>
        <h2 style={s.h2}>Como funciona el taller satelite</h2>
        <p style={s.p}>Un taller satélite recibe trabajo de maquila de talleres grandes, marcas o intermediarios. El cliente entrega la tela cortada y los insumos, y el satélite entrega la prenda terminada. El pago es por unidad o por docena.</p>
        <p style={s.p}>El ingreso depende directamente de la capacidad de producción — cuántas máquinas tienes, cuántas horas trabajas y qué tan eficiente eres. Una confeccionista con plana y overlock puede producir entre 80 y 150 unidades por día según el producto.</p>
        <h2 style={s.h2}>Cuanto se gana</h2>
        <p style={s.p}>El pago por unidad varía mucho según el producto y el cliente. Para ropa interior básica puede ser entre $800 y $1.500 por unidad. Para vestidos de baño, entre $2.000 y $4.000. Para ropa más elaborada, más. Una confeccionista que produce 100 unidades por día de ropa interior a $1.200 cada una gana $120.000 por día — cerca de $3.000.000 por mes en 25 días.</p>
        <p style={s.p}>Con una máquina adicional puede subir a 180 o 200 unidades por día. La diferencia entre $3.000.000 y $5.000.000 al mes es una sola máquina.</p>
        <h2 style={s.h2}>El limite y como superarlo</h2>
        <p style={s.p}>El límite de un taller satélite es la capacidad de producción. Y el límite de la capacidad de producción es la cantidad y tipo de máquinas. Agregar una máquina nueva sin tener el capital es el reto que enfrentan la mayoría.</p>
        <p style={s.p}>El modelo de Escala para confeccionistas permite conseguir la máquina sin banco ni historial crediticio, pagándola desde el excedente que genera. Sin cuota fija. Sin codeudor.</p>
        <Link href="/maquinaria-confeccion-medellin" style={s.btn}>Ver programa de maquinaria →</Link>
      </div>
    </div>
  )
}
