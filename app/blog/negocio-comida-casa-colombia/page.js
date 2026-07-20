import Link from 'next/link'
export const metadata = {
  title: 'Como montar un negocio de comida desde casa en Colombia y crecer sin banco — Escala Blog',
  description: 'Empanadas, arepas, tamales, pandebono. Si ya vendes comida desde tu casa y quieres producir más, te explicamos cómo conseguir la freidora o el horno sin crédito.',
  keywords: ['negocio comida desde casa Colombia','como vender empanadas negocio','freidora industrial sin credito Colombia','financiar negocio comida Medellin','como crecer negocio comida sin banco'],
}
const s = {
  page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff' },
  wrap: { maxWidth: '720px', margin: '0 auto', padding: '5rem 1.5rem' },
  h1: { fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '1rem', lineHeight: '1.2' },
  meta: { fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '2.5rem' },
  p: { fontSize: '1rem', color: '#C8D4E8', lineHeight: '1.8', marginBottom: '1.25rem' },
  h2: { fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: '2.5rem 0 1rem', letterSpacing: '-0.02em' },
  callout: { background: 'rgba(232,160,32,0.06)', border: '1px solid rgba(232,160,32,0.2)', borderRadius: '12px', padding: '1.25rem 1.5rem', margin: '2rem 0' },
  btn: { display: 'inline-block', background: '#E8A020', color: '#fff', padding: '0.75rem 1.75rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', marginTop: '2rem' },
}
export default function Page() {
  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#E8A020', marginBottom: '0.75rem' }}>Blog · Negocios de comida</div>
        <h1 style={s.h1}>Como crecer tu negocio de comida desde casa sin pedir un prestamo</h1>
        <div style={s.meta}>Escala · Julio 2026 · 5 min de lectura</div>
        <p style={s.p}>En Colombia hay miles de mujeres que venden empanadas, arepas, tamales, pandebonos o fritanga desde su casa o en la cuadra del barrio. Ya tienen clientes. Ya saben cocinar. El problema es que con lo que tienen no pueden producir más.</p>
        <p style={s.p}>Una freidora casera hace 20 empanadas a la vez. Una freidora industrial hace 100. La diferencia entre las dos es la diferencia entre $120.000 y $600.000 por jornada.</p>
        <h2 style={s.h2}>Por que el negocio de comida es ideal para este modelo</h2>
        <p style={s.p}>Los negocios de comida tienen algo único: venden todos los días. No hay que esperar a fin de mes para saber si el negocio funciona. Una freidora genera ingresos desde el primer día que la usas. Eso hace que el modelo de pago desde el excedente sea especialmente efectivo — no estás apostando a que el negocio funcione, ya funciona.</p>
        <div style={s.callout}>
          <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#E8A020', marginBottom: '0.75rem' }}>El caso de Patricia en Belén</div>
          <p style={{ ...s.p, marginBottom: '0.5rem' }}>Patricia vende 80 empanadas al día a $1.500 cada una. Con su freidora vieja no puede hacer más. Una freidora industrial de 20 litros le permite hacer 250 por día. El equipo cuesta $3.200.000.</p>
          <p style={{ ...s.p, marginBottom: '0.5rem' }}>Con la freidora nueva: 250 × $1.500 = $375.000 por día. En 26 días hábiles: $9.750.000 al mes. Su ingreso adicional real (descontando costos) es aproximadamente $7.600.000 por mes.</p>
          <p style={{ ...s.p, marginBottom: 0 }}>Si el 80% de ese excedente va al ángel: $6.080.000 de abono mensual. La freidora está paga en menos de 2 meses.</p>
        </div>
        <h2 style={s.h2}>Que equipos se financian para negocios de comida</h2>
        <p style={s.p}>Freidoras industriales, hornos panaderos, amasadoras industriales, estufas industriales de 4 o 6 puestos, neveras comerciales, licuadoras industriales, marmitas de cocción y vitrinas refrigeradas. El criterio es que el equipo genere ingresos desde el primer día.</p>
        <Link href="/equipos-negocio-comida-medellin" style={s.btn}>Ver programa de equipos →</Link>
      </div>
    </div>
  )
}
