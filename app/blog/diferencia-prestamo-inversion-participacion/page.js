import Link from 'next/link'
export const metadata = {
  title: 'Diferencia entre prestamo, inversion y participacion — Escala Blog',
  description: 'Explicacion clara de las tres formas de conseguir capital para tu negocio: prestamo bancario, inversion angel y participacion diferida. Cual conviene segun tu caso.',
  keywords: ['diferencia prestamo inversion participacion', 'tipos de financiacion empresa', 'prestamo vs inversion startup', 'participacion diferida vs deuda', 'como financiar empresa colombia'],
}
const s = {
  page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff' },
  wrap: { maxWidth: '720px', margin: '0 auto', padding: '5rem 1.5rem' },
  h1: { fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '1rem', lineHeight: '1.2' },
  meta: { fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '2.5rem' },
  p: { fontSize: '1rem', color: '#C8D4E8', lineHeight: '1.8', marginBottom: '1.25rem' },
  h2: { fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: '2.5rem 0 1rem', letterSpacing: '-0.02em' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' },
  btn: { display: 'inline-block', background: '#1D9E75', color: '#fff', padding: '0.75rem 1.75rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', marginTop: '2rem' },
}
export default function Page() {
  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '0.75rem' }}>Blog · Educacion financiera</div>
        <h1 style={s.h1}>Prestamo, inversion o participacion: cual le conviene a tu negocio</h1>
        <div style={s.meta}>Escala · Julio 2026 · 5 min de lectura</div>
        <p style={s.p}>Cuando un emprendedor necesita capital, tiene tres opciones principales. Cada una tiene implicaciones diferentes para el negocio, el fundador y el que aporta el dinero.</p>
        {[
          { titulo: 'Prestamo bancario', color: '#E05555', puntos: ['Pagas cuotas fijas independientemente de si el negocio funciona o no', 'Requiere historial crediticio, garantias o codeudor', 'No cedes parte del negocio', 'El banco no se beneficia si el negocio crece'] },
          { titulo: 'Inversion angel (deuda o revenue share)', color: '#E8A020', puntos: ['El inversor pone capital a cambio de cuotas o % de ventas', 'No requiere historial bancario — se evalua el negocio', 'No cedes acciones del negocio en los modelos de deuda', 'Si el negocio no vende, el pago se reduce (revenue share)'] },
          { titulo: 'Participacion diferida (equity)', color: '#1D9E75', puntos: ['El inversor o el especialista recibe acciones del negocio', 'No hay deuda — si el negocio no funciona, nadie pierde efectivo', 'El inversor gana si el negocio crece o se vende', 'Cedes parte de la propiedad del negocio'] },
        ].map(m => (
          <div key={m.titulo} style={{ ...s.card, borderColor: m.color + '33' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: m.color, marginBottom: '0.75rem' }}>{m.titulo}</div>
            {m.puntos.map((p,i) => <div key={i} style={{ fontSize: '0.82rem', color: '#C8D4E8', lineHeight: '1.6', padding: '2px 0', display: 'flex', gap: '6px' }}><span style={{ color: m.color }}>·</span>{p}</div>)}
          </div>
        ))}
        <h2 style={s.h2}>Cual conviene segun tu caso</h2>
        <p style={s.p}>Si tienes ingresos estables y necesitas capital de corto plazo: prestamo o deuda con angel. Si estas construyendo algo nuevo y no quieres deuda: participacion diferida. Si tus ingresos son variables: revenue share.</p>
        <p style={s.p}>Escala ofrece los tres modelos para que el emprendedor y el inversionista elijan el que mas les conviene caso a caso.</p>
        <Link href="/registro" style={s.btn}>Crear mi proyecto en Escala →</Link>
      </div>
    </div>
  )
}
