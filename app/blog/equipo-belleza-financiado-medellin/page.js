import Link from 'next/link'
export const metadata = {
  title: 'Como conseguir equipo para tu salon de belleza en Medellin sin banco — Escala Blog',
  description: 'Silla hidráulica, secadora, cabina de ozono. Si tienes clientas pero te falta el equipo, hay una forma de conseguirlo sin crédito ni codeudor en Medellín.',
  keywords: ['equipo salon belleza Medellin sin banco','silla hidraulica Medellin sin credito','como financiar peluqueria Medellin','equipo estetica sin prestamo Colombia','salon belleza sin capital Medellin'],
}
const s = {
  page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff' },
  wrap: { maxWidth: '720px', margin: '0 auto', padding: '5rem 1.5rem' },
  h1: { fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '1rem', lineHeight: '1.2' },
  meta: { fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '2.5rem' },
  p: { fontSize: '1rem', color: '#C8D4E8', lineHeight: '1.8', marginBottom: '1.25rem' },
  h2: { fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: '2.5rem 0 1rem', letterSpacing: '-0.02em' },
  precios: { background: 'rgba(217,70,239,0.06)', border: '1px solid rgba(217,70,239,0.2)', borderRadius: '12px', padding: '1.25rem 1.5rem', margin: '2rem 0' },
  btn: { display: 'inline-block', background: '#D946EF', color: '#fff', padding: '0.75rem 1.75rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', marginTop: '2rem' },
}
export default function Page() {
  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D946EF', marginBottom: '0.75rem' }}>Blog · Belleza · Medellín</div>
        <h1 style={s.h1}>Como conseguir el equipo para tu salon de belleza en Medellin sin ir al banco</h1>
        <div style={s.meta}>Escala · Julio 2026 · 5 min de lectura</div>
        <p style={s.p}>Medellín tiene miles de estilistas, peluqueras y esteticistas que trabajan desde casa o en pequeños salones del barrio. La mayoría tiene clientas fijas, años de experiencia y el conocimiento para ofrecer servicios premium. El problema es el equipo.</p>
        <p style={s.p}>Sin silla hidráulica profesional no puedes atender bien un corte largo. Sin secadora de casco no puedes hacer tratamientos de hidratación. Sin cabina de ozono no puedes ofrecer tratamientos capilares que cobran el doble que un servicio básico.</p>
        <h2 style={s.h2}>Cuanto cuestan los equipos principales</h2>
        <div style={s.precios}>
          {[
            ['Silla hidráulica profesional', '$800.000 — $2.000.000'],
            ['Secadora de casco', '$1.200.000 — $2.500.000'],
            ['Horno UV/LED para uñas', '$400.000 — $1.200.000'],
            ['Plancha de vapor profesional', '$600.000 — $1.500.000'],
            ['Cabina de ozono capilar', '$3.000.000 — $8.000.000'],
            ['Camilla eléctrica para tratamientos', '$2.500.000 — $6.000.000'],
          ].map(([eq, precio]) => (
            <div key={eq} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.88rem' }}>
              <span style={{ color: '#C8D4E8' }}>{eq}</span>
              <span style={{ color: '#D946EF', fontWeight: '700', flexShrink: 0, marginLeft: '1rem' }}>{precio}</span>
            </div>
          ))}
        </div>
        <h2 style={s.h2}>La forma de conseguirlos sin banco</h2>
        <p style={s.p}>Un ángel inversionista compra el equipo que necesitas. Tú lo usas desde el primer día y cada mes del excedente adicional que genera el equipo — lo que ganas con él menos lo que ganarías sin él — un porcentaje acordado va al ángel. Cuando el ángel recupera el total, el equipo es tuyo.</p>
        <p style={s.p}>No se evalúa historial crediticio. No se pide codeudor. No hay cuota fija. Lo que se evalúa es que tengas clientas reales y que el equipo genere ingresos adicionales verificables.</p>
        <h2 style={s.h2}>El programa activo en Medellin</h2>
        <p style={s.p}>Escala tiene un programa activo para estilistas y esteticistas de Medellín y el Valle de Aburrá. Se seleccionan las mejores candidatas entre quienes aplican. El criterio es tener clientas reales, saber usar el equipo y poder reportar ingresos mensualmente.</p>
        <Link href="/equipos-salon-belleza-medellin" style={s.btn}>Aplicar al programa →</Link>
      </div>
    </div>
  )
}
