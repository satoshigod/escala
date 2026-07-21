// app/como-financiar-local-comercial/page.js
export const metadata = {
  title: 'Cómo Financiar un Local Comercial en Colombia 2026 — Opciones Reales',
  description: 'Guia completa sobre como conseguir capital para financiar un local comercial en Colombia. Opciones reales: bancos, cooperativas, inversores y el modelo de fondeo Escala.',
  keywords: ['como financiar local comercial colombia', 'opciones financiamiento local comercial', 'conseguir capital local comercial', 'financiar negocio local colombia 2026'],
  openGraph: { title: 'Como Financiar un Local Comercial en Colombia — Guia 2026', description: 'Todas las opciones para conseguir capital para tu local. Cual conviene segun tu situacion.', url: 'https://escala.network/como-financiar-local-comercial', images: [{ url: 'https://escala.network/brand/og-default.png?v=3', width: 1200, height: 630 }] },
  alternates: { canonical: 'https://escala.network/como-financiar-local-comercial' },
}
const s = {
  page: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter,sans-serif', color: '#fff' },
  nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: '1.1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', textDecoration: 'none' },
  article: { maxWidth: '720px', margin: '0 auto', padding: '4rem 1.5rem' },
  h1: { fontSize: 'clamp(1.75rem,4vw,2.75rem)', fontWeight: '900', lineHeight: '1.15', letterSpacing: '-0.03em', color: '#fff', marginBottom: '1.5rem' },
  h2: { fontSize: '1.3rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em', margin: '2.5rem 0 1rem' },
  p: { fontSize: '1rem', color: '#C8D4E8', lineHeight: '1.85', marginBottom: '1.25rem' },
  btn: { background: '#1D9E75', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', display: 'inline-block' },
}
export default function ComoFinanciarLocalComercialPage() {
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href="/" style={s.logo}>Esca<span style={{ color: '#1D9E75' }}>la</span></a>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/blog" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>Blog</a>
          <a href="/registro" style={{ background: '#1D9E75', color: '#fff', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>Solicitar financiamiento</a>
        </div>
      </nav>
      <article style={s.article}>
        <div style={{ fontSize: '0.65rem', fontWeight: '700', background: '#1D9E75', color: '#fff', padding: '3px 10px', borderRadius: '20px', display: 'inline-block', marginBottom: '1.5rem' }}>Guia 2026</div>
        <h1 style={s.h1}>Como financiar un local comercial en Colombia — opciones reales</h1>
        <p style={s.p}>Tienes el negocio claro, tienes el local identificado y sabes lo que quieres hacer. El problema es el capital para el deposito, el primer arriendo y las adecuaciones. Esta es una guia honesta sobre las opciones reales que tienes en Colombia en 2026.</p>

        <h2 style={s.h2}>Opcion 1 — Banco o cooperativa</h2>
        <p style={s.p}>La opcion mas conocida pero la mas dificil de conseguir si no tienes historial crediticio formal. Los bancos piden declaracion de renta, extractos bancarios recientes, garante y generalmente exigen que el negocio lleve al menos un ano operando. Si eres un emprendedor que quiere abrir su primera tienda, esta opcion casi nunca funciona.</p>

        <h2 style={s.h2}>Opcion 2 — Familia o amigos</h2>
        <p style={s.p}>La mas rapida pero la mas delicada. Si tienes un familiar o amigo dispuesto a prestarte el capital, puede ser la opcion mas economica. El problema es que los acuerdos informales entre personas conocidas raramente tienen contratos claros, y cuando el negocio va mal o cuando hay diferencias sobre el pago, las relaciones se danan.</p>

        <h2 style={s.h2}>Opcion 3 — Fintechs de credito rapido</h2>
        <p style={s.p}>Empresas como Addi, Sempli o Bold Capital ofrecen creditos empresariales con menos requisitos que los bancos. La contra es que las tasas son altas (entre el 3% y el 5% mensual sobre el saldo) y el pago es en cuotas fijas independientemente de si el negocio vendio mucho o poco ese mes.</p>

        <h2 style={s.h2}>Opcion 4 — Modelo de financiamiento Escala</h2>
        <p style={s.p}>El modelo de Escala es diferente a todas las anteriores. Un inversionista de la red de Escala paga directamente al propietario del local — el deposito, el primer mes de arriendo y las adecuaciones necesarias. A cambio, tu te comprometes a reportar tus ventas diariamente y a pagar el excedente diario (ventas menos costos) hasta cubrir la deuda con los intereses.</p>
        <p style={s.p}>La diferencia clave es que el pago es variable segun las ventas. Si un dia vendes poco, pagas poco. Si vendes mucho, pagas mas y sales mas rapido de la deuda. Cuando terminas de pagar, el negocio es completamente tuyo.</p>

        <div style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '12px', padding: '1.25rem 1.5rem', margin: '2rem 0' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1D9E75', marginBottom: '0.5rem' }}>Cuando Escala es la mejor opcion</div>
          <div style={{ fontSize: '0.85rem', color: '#C8D4E8', lineHeight: '1.6' }}>
            Si no tienes historial crediticio, si es tu primer negocio formal, si quieres que el pago sea proporcional a tus ventas y si ya tienes identificado el local y el negocio que quieres montar — Escala esta disenado exactamente para ese caso.
          </div>
        </div>

        <div style={{ margin: '2.5rem 0', textAlign: 'center' }}>
          <a href="/registro" style={s.btn}>Solicitar financiamiento en Escala →</a>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2rem', marginTop: '2rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#8FA3CC', marginBottom: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Ver tambien</div>
          {[
            { href: '/financiar-negocio-local-colombia', titulo: 'Financiar un negocio en un local con Escala' },
            { href: '/capital-para-abrir-tienda', titulo: 'Capital para abrir tu tienda sin banco ni garante' },
            { href: '/blog/como-crear-una-startup-sin-dinero', titulo: 'Como crear una empresa sin capital inicial' },
          ].map(a => <a key={a.href} href={a.href} style={{ display: 'block', fontSize: '0.88rem', color: '#4A90D9', textDecoration: 'none', marginBottom: '0.5rem' }}>{a.titulo} →</a>)}
        </div>
      </article>
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>© 2026 Escala Network · <a href="/registro" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Registro</a></div>
      </footer>
    </div>
  )
}
