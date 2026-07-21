// app/financiar-negocio-local-colombia/page.js
export const metadata = {
  title: 'Financiar un Negocio en Local Comercial en Colombia — Escala',
  description: 'Consigue el capital para el deposito y los meses de arriendo de tu local comercial. Escala financia el arriendo y recupera el capital desde los ingresos diarios de tu negocio. Sin banco, sin garante.',
  keywords: ['financiar negocio local comercial colombia', 'capital para local comercial', 'como financiar un local', 'prestamo para abrir negocio colombia', 'fondeo negocio local medellin bogota'],
  openGraph: { title: 'Financiar Negocio en Local Comercial — Escala', description: 'Capital para deposito, arriendo y adecuaciones. Pagas desde los ingresos del negocio.', url: 'https://escala.network/financiar-negocio-local-colombia', images: [{ url: 'https://escala.network/brand/og-default.png?v=3', width: 1200, height: 630 }] },
  alternates: { canonical: 'https://escala.network/financiar-negocio-local-colombia' },
}

const s = {
  page: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter,sans-serif', color: '#fff' },
  nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: '1.1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', textDecoration: 'none' },
  hero: { maxWidth: '900px', margin: '0 auto', padding: '5rem 1.5rem 4rem' },
  tag: { display: 'inline-block', background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.3)', color: '#1D9E75', fontSize: '0.75rem', fontWeight: '700', padding: '0.3rem 0.875rem', borderRadius: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1.5rem' },
  h1: { fontSize: 'clamp(2rem,5vw,3.25rem)', fontWeight: '900', lineHeight: '1.1', letterSpacing: '-0.03em', marginBottom: '1.5rem', color: '#fff' },
  sub: { fontSize: '1.1rem', color: '#8FA3CC', lineHeight: '1.7', maxWidth: '620px', marginBottom: '2.5rem' },
  btn: { background: '#1D9E75', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', display: 'inline-block' },
  btn2: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600', display: 'inline-block' },
  section: { maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 4rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem', marginBottom: '3rem' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem' },
}

const fmt = (n) => n.toLocaleString('es-CO')

export default function FinanciarNegocioLocalPage() {
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href="/" style={s.logo}>Esca<span style={{ color: '#1D9E75' }}>la</span></a>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/como-funciona" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>Cómo funciona</a>
          <a href="/registro" style={{ background: '#1D9E75', color: '#fff', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>Solicitar financiamiento</a>
        </div>
      </nav>

      <section style={s.hero}>
        <div style={s.tag}>🏪 Financiamiento para locales comerciales</div>
        <h1 style={s.h1}>Tienes el negocio claro y el local visto. Solo te falta quien financie el arriendo.</h1>
        <p style={s.sub}>Escala financia el depósito, el los meses de arriendo del contrato y las adecuaciones de tu local. No necesitas banco, no necesitas garante. Pagas desde los ingresos diarios de tu negocio — cuando vendes, pagas.</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <a href="/registro" style={s.btn}>Solicitar fondeo para el arriendo de mi local →</a>
          <a href="#como-funciona" style={s.btn2}>Ver cómo funciona</a>
        </div>

        {/* Ejemplo de capital */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.75rem', maxWidth: '720px' }}>
          {[
            { label: 'Depósito (2 meses)', valor: '$2.400.000', sub: 'Arriendo $1.200.000/mes' },
            { label: 'Primer mes arriendo', valor: '$1.200.000', sub: 'Para empezar a operar' },
            { label: 'Adecuaciones', valor: '$800.000', sub: 'Pintura, estantes, etc.' },
            { label: 'Total financiado', valor: '$4.400.000', sub: 'Ejemplo real', highlight: true },
          ].map(item => (
            <div key={item.label} style={{ background: item.highlight ? 'rgba(29,158,117,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${item.highlight ? 'rgba(29,158,117,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', padding: '0.875rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: '#8FA3CC', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: item.highlight ? '#1D9E75' : '#fff' }}>{item.valor}</div>
              <div style={{ fontSize: '0.68rem', color: '#6B7280', marginTop: '2px' }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={s.section} id="como-funciona">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Como funciona el fondeo de Escala</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            { num: '01', titulo: 'Cuéntanos sobre tu negocio y el local', desc: 'Llegas a la plataforma con el local que ya tienes visto. Nos das los datos del propietario, el valor del arriendo y nos cuentas qué vas a vender y cuánto esperas vender por día.' },
            { num: '02', titulo: 'Escala verifica el local y te asigna una tasa', desc: 'Llamamos al propietario para confirmar la información. Revisamos que los números de tu negocio sean reales. Te asignamos una tasa entre la usura convencional y la usura de plataformas digitales según tu perfil.' },
            { num: '03', titulo: 'Un inversionista financia tu local', desc: 'Tu proyecto aparece en nuestra red de Inversionistas. Cuando uno acepta, el capital va directo al propietario del local. Tú firmas el contrato de arrendamiento y abres tu negocio.' },
            { num: '04', titulo: 'Reportas tus ventas cada día', desc: 'Cada noche antes de cerrar, reportas en la app cuánto vendiste — en efectivo y por BREB. Escala calcula cuánto le corresponde al inversionista ese día y te dice cuánto transferir.' },
            { num: '05', titulo: 'Cuando pagas la deuda, el negocio es tuyo', desc: 'Una vez que el inversionista recupera su capital más los intereses, entras a la fase de participacion (un pequeño porcentaje de tus ventas por unos meses más). Después de eso, el negocio es completamente tuyo.' },
          ].map(paso => (
            <div key={paso.num} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', padding: '1.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1D9E75', flexShrink: 0, minWidth: '2.5rem' }}>{paso.num}</div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.3rem' }}>{paso.titulo}</div>
                <div style={{ fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6' }}>{paso.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={s.section}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '1.5rem' }}>Qué tipo de negocios financia Escala</h2>
        <div style={s.grid}>
          {[
            { emoji: '👗', tipo: 'Almacén de ropa', desc: 'Ropa, accesorios, calzado, moda urbana. Alta rotación, buen margen.' },
            { emoji: '🍔', tipo: 'Restaurante o comida', desc: 'Comida rapida, corrientazo, cafe, heladeria. Ingresos diarios predecibles.' },
            { emoji: '🍎', tipo: 'Frutería o tienda', desc: 'Frutas, verduras, abarrotes, miscelanea. Negocio de flujo diario constante.' },
            { emoji: '💄', tipo: 'Belleza y cuidado', desc: 'Productos de belleza, peluqueria, estetica. Clientes recurrentes.' },
            { emoji: '📱', tipo: 'Tecnologia y accesorios', desc: 'Accesorios para celular, cargadores, audio, etc. Margen alto.' },
            { emoji: '📦', tipo: 'Otro tipo de tienda', desc: 'Si tienes el negocio visto y el local identificado, cuéntanos.' },
          ].map(item => (
            <div key={item.tipo} style={s.card}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{item.emoji}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.4rem' }}>{item.tipo}</div>
              <div style={{ fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={s.section}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '1.5rem' }}>Preguntas frecuentes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            ['¿Necesito historial crediticio o declaración de renta?', 'No. Escala no evalúa tu historial bancario. Evaluamos la viabilidad del negocio que quieres montar — qué vas a vender, cuánto esperas vender y si el local que escogiste es real y tiene el precio que declaras.'],
            ['¿Qué pasa si un día vendo muy poco?', 'Si un día el excedente (ventas menos costos) es negativo, no pagas al inversionista ese día. El déficit se acumula y se descuenta del excedente del día siguiente. Lo importante es que reportes siempre.'],
            ['¿Puedo salir del contrato anticipadamente?', 'Sí. Puedes pagar de una sola vez la deuda pendiente más una penalidad del 4% del total de arriendos del año si estás en la fase de repago, o el 8% si estás en la fase de participacion. Eso te deja completamente libre.'],
            ['¿Cuánto tiempo tarda la aprobación?', 'Escala verifica la información del local en 24 a 48 horas hábiles. Después la publicamos a nuestra red de inversionistas. El tiempo total desde que aplicas hasta que tienes el capital depende de cuándo un inversionista acepta financiar tu proyecto.'],
            ['¿El inversionista puede entrar a mi local o controlar mi negocio?', 'No. El inversionista ve el avance de los pagos desde la plataforma. Escala puede solicitar fotos del cuadre de caja como parte del reporte diario, pero no hay control del inventario ni de las operaciones del negocio.'],
          ].map(([q, a]) => (
            <div key={q} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 0' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>{q}</h3>
              <p style={{ fontSize: '0.83rem', color: '#8FA3CC', lineHeight: '1.7', margin: 0 }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ padding: '0 1.5rem 5rem', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '20px', padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>¿Tienes el local visto y el negocio claro?</h2>
          <p style={{ color: '#8FA3CC', marginBottom: '2rem', lineHeight: '1.6' }}>Crea tu cuenta en Escala y empieza el proceso. No necesitas capital propio — solo el negocio, el local y las ganas de trabajar.</p>
          <a href="/registro" style={s.btn}>Solicitar fondeo para el arriendo de mi local →</a>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>
          © 2026 Escala Network ·{' '}
          <a href="/capital-para-abrir-tienda" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Capital para tienda</a> ·{' '}
          <a href="/startup-colombia" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Startups Colombia</a> ·{' '}
          <a href="/registro" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Registro</a>
        </div>
      </footer>
    </div>
  )
}
