// app/capital-para-abrir-tienda/page.js
export const metadata = {
  title: 'Capital para Abrir una Tienda en Colombia — Sin Banco ni Garante',
  description: 'Consigue el capital para abrir tu tienda, almacen o restaurante en Colombia. Escala financia el local y recupera desde tus ventas diarias. Sin requisitos bancarios.',
  keywords: ['capital para abrir tienda colombia', 'como abrir una tienda sin dinero', 'prestamo para abrir tienda', 'financiamiento tienda colombia', 'como conseguir plata para negocio'],
  openGraph: { title: 'Capital para Abrir tu Tienda — Escala', description: 'Abre tu tienda sin banco ni garante. Pagas desde las ventas del negocio.', url: 'https://escala.network/capital-para-abrir-tienda', images: [{ url: 'https://escala.network/brand/og-default.png?v=3', width: 1200, height: 630 }] },
  alternates: { canonical: 'https://escala.network/capital-para-abrir-tienda' },
}
const s = {
  page: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter,sans-serif', color: '#fff' },
  nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: '1.1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', textDecoration: 'none' },
  hero: { maxWidth: '900px', margin: '0 auto', padding: '5rem 1.5rem 4rem' },
  tag: { display: 'inline-block', background: 'rgba(74,144,217,0.1)', border: '1px solid rgba(74,144,217,0.3)', color: '#4A90D9', fontSize: '0.75rem', fontWeight: '700', padding: '0.3rem 0.875rem', borderRadius: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1.5rem' },
  h1: { fontSize: 'clamp(2rem,5vw,3.25rem)', fontWeight: '900', lineHeight: '1.1', letterSpacing: '-0.03em', marginBottom: '1.5rem', color: '#fff' },
  sub: { fontSize: '1.1rem', color: '#8FA3CC', lineHeight: '1.7', maxWidth: '620px', marginBottom: '2.5rem' },
  btn: { background: '#1D9E75', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', display: 'inline-block' },
  section: { maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 4rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem', marginBottom: '3rem' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem' },
}
export default function CapitalParaAbrirTiendaPage() {
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href="/" style={s.logo}>Esca<span style={{ color: '#1D9E75' }}>la</span></a>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/financiar-negocio-local-colombia" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>Fondeo local</a>
          <a href="/registro" style={{ background: '#1D9E75', color: '#fff', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>Comenzar</a>
        </div>
      </nav>
      <section style={s.hero}>
        <div style={s.tag}>💰 Capital para tu tienda</div>
        <h1 style={s.h1}>Quieres abrir tu tienda pero no tienes para el deposito ni el primer mes.</h1>
        <p style={s.sub}>El problema mas comun de los emprendedores en Colombia no es la idea — es el capital inicial. Escala lo resuelve: un inversionista financia tu local y tu pagas desde lo que vendes cada dia.</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/registro" style={s.btn}>Quiero capital para mi tienda →</a>
        </div>
      </section>
      <section style={s.section}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '1.5rem' }}>La diferencia con un banco</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '3rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>Banco o cooperativa</div>
            {['Piden historial crediticio', 'Necesitas declaracion de renta', 'Requieren garante o codeudor', 'Cuotas fijas sin importar si vendes', 'Pueden embargarte si no pagas', 'Tramites de semanas o meses'].map(item => (
              <div key={item} style={{ fontSize: '0.82rem', color: '#8FA3CC', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#E05555' }}>✕</span> {item}
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(29,158,117,0.06)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '14px', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#1D9E75', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>Escala</div>
            {['Evaluan la viabilidad del negocio', 'Sin declaracion de renta', 'Sin garante ni codeudor', 'Pagas segun lo que vendes cada dia', 'Puedes salir anticipadamente', 'Respuesta en 24-48 horas habiles'].map(item => (
              <div key={item} style={{ fontSize: '0.82rem', color: '#C8D4E8', padding: '0.4rem 0', borderBottom: '1px solid rgba(29,158,117,0.1)', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#1D9E75' }}>✓</span> {item}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={s.section}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '1.5rem' }}>Como funciona el pago diario</h2>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#6B7280', marginBottom: '1rem' }}>Ejemplo — tienda de ropa, dia normal</div>
          {[
            ['Ventas del dia', '$180.000', '#fff'],
            ['- Costo de la mercancia (42%)', '-$75.600', '#E05555'],
            ['- Gastos fijos del dia (arriendo + servicios / 30)', '-$46.667', '#E05555'],
            ['= Excedente', '$57.733', '#1D9E75'],
            ['- Intereses del dia sobre la deuda', '-$4.400', '#E8A020'],
            ['= Abono al capital (BREB al inversionista)', '$53.333', '#4A90D9'],
          ].map(([label, value, color]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#8FA3CC' }}>{label}</span>
              <span style={{ fontWeight: '600', color }}>{value}</span>
            </div>
          ))}
          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.875rem' }}>
            El dia que no hay excedente (ventas bajas), no pagas. El deficit se acumula para el dia siguiente.
          </div>
        </div>
      </section>
      <div style={{ padding: '0 1.5rem 5rem', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '20px', padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>Abre tu tienda con el capital que necesitas</h2>
          <p style={{ color: '#8FA3CC', marginBottom: '2rem', lineHeight: '1.6' }}>Crea tu cuenta en Escala y empieza el proceso hoy.</p>
          <a href="/registro" style={s.btn}>Empezar ahora →</a>
        </div>
      </div>
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>
          © 2026 Escala Network ·{' '}
          <a href="/financiar-negocio-local-colombia" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Fondeo local</a> ·{' '}
          <a href="/como-financiar-local-comercial" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Como financiar local</a> ·{' '}
          <a href="/registro" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Registro</a>
        </div>
      </footer>
    </div>
  )
}
