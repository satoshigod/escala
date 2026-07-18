import Link from 'next/link'
export const metadata = {
  title: 'Financiar maquinaria para tu negocio en Colombia — Escala',
  description: 'Consigue el capital para comprar la maquinaria que necesita tu negocio. Un inversionista compra el equipo y tú lo pagas desde tus ingresos. Sin banco, sin garante.',
  keywords: ['financiar maquinaria colombia', 'credito para maquinaria', 'como comprar maquinaria sin dinero', 'financiacion equipos negocio colombia', 'inversionista maquinaria colombia'],
}
const s = {
  page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff' },
  hero: { maxWidth: '860px', margin: '0 auto', padding: '5rem 1.5rem 3rem', textAlign: 'center' },
  h1: { fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '1.25rem', lineHeight: '1.15' },
  sub: { fontSize: '1.1rem', color: '#8FA3CC', lineHeight: '1.7', maxWidth: '600px', margin: '0 auto 2.5rem' },
  btn: { display: 'inline-block', background: '#4A90D9', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '1rem', fontWeight: '700', marginRight: '1rem' },
  wrap: { maxWidth: '860px', margin: '0 auto', padding: '0 1.5rem 5rem' },
  h2: { fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' },
  paso: { display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.25rem' },
  num: { width: '32px', height: '32px', borderRadius: '50%', background: '#4A90D9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700', flexShrink: 0 },
}
export default function Page() {
  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4A90D9', marginBottom: '1rem' }}>Financiacion de maquinaria · Colombia</div>
        <h1 style={s.h1}>Necesitas una maquina.<br/>Nosotros conseguimos quien la pague.</h1>
        <p style={s.sub}>Un inversionista de Escala compra el equipo que necesitas. Tu lo pagas desde los ingresos de tu negocio — sin banco, sin historial crediticio, sin garante.</p>
        <Link href="/proyectos?escenario=otro" style={s.btn}>Agregar mi maquina →</Link>
        <Link href="/directorio-inversion" style={{ ...s.btn, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>Ver directorio</Link>
      </div>
      <div style={s.wrap}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '4rem' }}>
          {[
            { emoji: '🔧', titulo: 'Maquinaria industrial', desc: 'Hornos, tornos, cortadoras, compresoras, equipos de produccion.' },
            { emoji: '❄️', titulo: 'Equipos de frio', desc: 'Neveras industriales, cuartos frios, congeladores para restaurantes y tiendas.' },
            { emoji: '🚚', titulo: 'Vehiculos de trabajo', desc: 'Camiones, furgones, motos de carga, camionetas para distribucion.' },
            { emoji: '💻', titulo: 'Tecnologia', desc: 'Servidores, computadores, equipos de diseno, maquinas de impresion.' },
            { emoji: '🏭', titulo: 'Equipos de manufactura', desc: 'Maquinas de coser, equipos de panaderia, maquinaria agricola.' },
            { emoji: '📦', titulo: 'Otros activos', desc: 'Cualquier equipo que tu negocio necesite para operar y generar ingresos.' },
          ].map(e => (
            <div key={e.titulo} style={s.card}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{e.emoji}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff', marginBottom: '0.4rem' }}>{e.titulo}</div>
              <div style={{ fontSize: '0.8rem', color: '#8FA3CC', lineHeight: '1.5' }}>{e.desc}</div>
            </div>
          ))}
        </div>
        <h2 style={s.h2}>Como funciona</h2>
        <div style={{ marginBottom: '4rem' }}>
          {[
            { n: '1', t: 'Describes lo que necesitas', d: 'Nombre del equipo, precio aproximado y para que lo vas a usar. Toma 5 minutos.' },
            { n: '2', t: 'Lo publicas en el directorio', d: 'Los angeles de inversion ven tu necesidad. Tu defines a cambio de que: porcentaje del negocio, cuotas mensuales o parte de tus ventas.' },
            { n: '3', t: 'Un angel lo financia', d: 'El inversionista compra el equipo o transfiere el capital. Escala verifica la operacion.' },
            { n: '4', t: 'Tu pagas desde tus ingresos', d: 'Cada mes pagas al inversionista segun lo que acordaron. Sin banco, sin garante, sin historial de credito.' },
          ].map(p => (
            <div key={p.n} style={s.paso}>
              <div style={s.num}>{p.n}</div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.3rem' }}>{p.t}</div>
                <div style={{ fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6' }}>{p.d}</div>
              </div>
            </div>
          ))}
        </div>
        <h2 style={s.h2}>Preguntas frecuentes</h2>
        {[
          { p: '¿Necesito historial crediticio?', r: 'No. Escala no evalua tu historial bancario. Evaluamos la viabilidad del negocio y la maquina que necesitas.' },
          { p: '¿Que tipo de equipos financia Escala?', r: 'Cualquier activo que genere ingresos: maquinaria industrial, vehiculos, tecnologia, equipos de frio, equipos de produccion.' },
          { p: '¿Cuanto se puede financiar?', r: 'No hay un minimo ni maximo fijo. Depende del inversionista y de los ingresos proyectados de tu negocio.' },
          { p: '¿El inversionista se queda con mi maquina?', r: 'Depende del modelo que acuerdes. Puede ser que el inversionista sea propietario hasta que pagues todo, o puede ser una inversion por participacion en el negocio.' },
        ].map(faq => (
          <div key={faq.p} style={{ ...s.card, marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>{faq.p}</div>
            <div style={{ fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6' }}>{faq.r}</div>
          </div>
        ))}
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <h2 style={{ ...s.h2, textAlign: 'center' }}>¿Tienes la maquina en mente?</h2>
          <p style={{ color: '#8FA3CC', marginBottom: '2rem' }}>Publicala en el directorio y empieza a recibir propuestas de inversionistas.</p>
          <Link href="/proyectos?escenario=otro" style={s.btn}>Agregar mi maquina gratis →</Link>
        </div>
      </div>
    </div>
  )
}
