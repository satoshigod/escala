// app/latinos-usa/page.js
// Landing page para latinos en USA — el puente entre LATAM y USA
// Keywords: latinos emprendedores usa, negocio latino estados unidos,
// como crear empresa siendo latino en usa, capital para negocio latino usa

export const metadata = {
  title: 'Escala para Latinos en USA — Monta tu Negocio con Equipo de LATAM',
  description: 'Eres latino en Estados Unidos y quieres montar un negocio. Escala conecta tu proyecto con especialistas en Colombia, México y Chile que trabajan por participación. Capital desde inversionistas latinos.',
  keywords: ['latinos emprendedores usa', 'negocio latino estados unidos', 'como crear empresa latino usa', 'capital negocio latino usa', 'startup latino eeuu', 'emprendimiento hispano estados unidos'],
  openGraph: {
    title: 'Escala para Latinos en USA — Tu Negocio con Equipo de LATAM',
    description: '4.7 millones de negocios latinos en USA. El problema no es la idea — es el equipo y el capital. Escala lo resuelve.',
    url: 'https://escala.network/latinos-usa',
    images: [{ url: 'https://escala.network/brand/og-default.png?v=3', width: 1200, height: 630 }],
  },
  alternates: { canonical: 'https://escala.network/latinos-usa' },
}

const s = {
  page: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter,sans-serif', color: '#fff' },
  nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: '1.1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', textDecoration: 'none' },
  hero: { maxWidth: '900px', margin: '0 auto', padding: '5rem 1.5rem 4rem' },
  tag: { display: 'inline-block', background: 'rgba(178,34,52,0.15)', border: '1px solid rgba(178,34,52,0.4)', color: '#E8A0A8', fontSize: '0.75rem', fontWeight: '700', padding: '0.3rem 0.875rem', borderRadius: '20px', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1.5rem' },
  h1: { fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: '900', lineHeight: '1.1', letterSpacing: '-0.03em', marginBottom: '1.5rem', color: '#fff' },
  sub: { fontSize: '1.1rem', color: '#8FA3CC', lineHeight: '1.7', maxWidth: '640px', marginBottom: '2.5rem' },
  btn: { background: '#1D9E75', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', display: 'inline-block' },
  btn2: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600', display: 'inline-block' },
  section: { maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 4rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem', marginBottom: '3rem' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem' },
  stat: { background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' },
}

export default function LatinosUSAPage() {
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href="/" style={s.logo}>Esca<span style={{ color: '#1D9E75' }}>la</span></a>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/que-es-escala" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>Cómo funciona</a>
          <a href="/registro" style={{ background: '#1D9E75', color: '#fff', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>Comenzar gratis</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={s.hero}>
        <div style={s.tag}>🇺🇸🤝🌎 Latinos en USA</div>
        <h1 style={s.h1}>Tienes la idea y las ganas. Te falta el equipo y el capital.</h1>
        <p style={s.sub}>
          Los latinos en Estados Unidos crean negocios al doble de la tasa del promedio nacional — y el 53% reporta dificultades para acceder a capital. Escala conecta tu proyecto con especialistas en Colombia, México y Chile que trabajan por participación, e inversionistas latinos que fondean lo que los bancos rechazan.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <a href="/registro" style={s.btn}>Publicar mi proyecto →</a>
          <a href="#como-funciona" style={s.btn2}>Cómo funciona</a>
        </div>

        {/* Stats reales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0.75rem', maxWidth: '800px' }}>
          {[
            { numero: '4.7M', label: 'negocios latinos en USA', fuente: 'Cámara de Comercio Hispana' },
            { numero: '$800B', label: 'generados al año', fuente: 'USHCC 2024' },
            { numero: '2x', label: 'tasa de creación de negocios vs. promedio', fuente: 'McKinsey 2024' },
            { numero: '80%', label: 'proyectan crecer en 2025', fuente: 'Bank of America 2024' },
          ].map(item => (
            <div key={item.numero} style={s.stat}>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1D9E75', letterSpacing: '-0.02em' }}>{item.numero}</div>
              <div style={{ fontSize: '0.72rem', color: '#C8D4E8', marginTop: '4px', lineHeight: '1.4' }}>{item.label}</div>
              <div style={{ fontSize: '0.62rem', color: '#4B5563', marginTop: '4px' }}>{item.fuente}</div>
            </div>
          ))}
        </div>
      </section>

      {/* EL PROBLEMA REAL */}
      <section style={s.section}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
          El problema no es la idea ni el trabajo duro
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#8FA3CC', lineHeight: '1.7', maxWidth: '680px', marginBottom: '2rem' }}>
          Los latinos en USA son los que más negocios crean. El problema es que el 53% no consigue el capital que necesita, y construir el equipo correcto — contador, abogado, desarrollador — cuesta lo que no tienen cuando están empezando.
        </p>
        <div style={s.grid}>
          {[
            {
              icono: '🏦',
              problema: 'El banco dice no',
              desc: 'El 53% de emprendedores latinos no recibe el capital que solicita. Sin historial crediticio en USA, sin garantías, el banco convencional no es una opción real para quien lleva pocos años aquí.',
              solucion: 'Inversionistas latinos de Escala fondean sin historial bancario — evalúan la viabilidad del negocio, no el credit score.',
            },
            {
              icono: '👥',
              problema: 'El equipo cuesta lo que no hay',
              desc: 'Un contador en USA cobra $150/hora. Un abogado de negocios, $300/hora. Un desarrollador para tu app, $80,000 al año. Ese equipo es imposible antes de tener ingresos.',
              solucion: 'Especialistas en Colombia, México y Chile trabajan por participación diferida — cobran cuando el negocio gana, no antes.',
            },
            {
              icono: '🌐',
              problema: 'La burocracia de dos países',
              desc: 'Quieres operar en USA pero tu familia, tu red y tu capital están en LATAM. Navegar dos sistemas legales, dos monedas y dos culturas empresariales es complejo sin apoyo.',
              solucion: 'Escala conecta ambos mundos — un equipo en LATAM construyendo para un mercado en USA, con contratos claros en los dos lados.',
            },
          ].map(item => (
            <div key={item.problema} style={s.card}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{item.icono}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#E05555', marginBottom: '0.5rem' }}>{item.problema}</div>
              <p style={{ fontSize: '0.8rem', color: '#8FA3CC', lineHeight: '1.6', marginBottom: '0.875rem' }}>{item.desc}</p>
              <div style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '8px', padding: '0.625rem 0.875rem', fontSize: '0.78rem', color: '#1D9E75', lineHeight: '1.5' }}>
                <strong>Escala:</strong> {item.solucion}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section style={s.section} id="como-funciona">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
          El modelo del puente USA - LATAM
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            {
              num: '01',
              titulo: 'Publicas tu proyecto desde donde estás',
              desc: 'Estás en Miami, Houston, Los Angeles, Chicago. Publicas tu proyecto en Escala — tu idea, tu negocio, lo que necesitas. No importa si es una taquería en Texas, una app de remesas o una tienda de ropa.',
            },
            {
              num: '02',
              titulo: 'Un equipo en LATAM se une por participación',
              desc: 'Un contador en Bogotá te ayuda a estructurar el negocio. Un desarrollador en Medellín construye tu app. Un diseñador en Ciudad de México crea tu marca. Trabajan por participación diferida — ganan cuando tú ganas.',
            },
            {
              num: '03',
              titulo: 'Un inversionista latino financia lo que el banco rechaza',
              desc: 'Para negocios que necesitan local, equipos o capital de trabajo, los Ángeles de Impulso de Escala — inversionistas en Colombia, México, Chile — fondean el proyecto. Tú pagas desde los ingresos del negocio.',
            },
            {
              num: '04',
              titulo: 'El negocio crece en USA con raíces en LATAM',
              desc: 'Tu negocio opera en USA. Tu equipo está en LATAM. Tu inversionista puede estar en cualquier país de habla hispana. Escala documenta cada aporte, cada contrato y cada pago — todo transparente.',
            },
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

      {/* MODELO LOCAL COMERCIAL PARA USA */}
      <section style={s.section}>
        <div style={{ background: 'rgba(74,144,217,0.06)', border: '1px solid rgba(74,144,217,0.2)', borderRadius: '16px', padding: '2rem', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-block', background: 'rgba(74,144,217,0.15)', border: '1px solid rgba(74,144,217,0.3)', color: '#4A90D9', fontSize: '0.7rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '20px', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem' }}>Fondeo para tu local en USA</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Quieres abrir tu taquería, tu salon, tu tienda — pero el deposito y el primer mes no los tienes
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#8FA3CC', lineHeight: '1.7', marginBottom: '1.5rem' }}>
            El problema mas comun del latino en USA que quiere abrir un negocio fisico no es el local — es el capital inicial. El landlord pide 2-3 meses de deposito mas el primer mes. Eso puede ser $6,000, $10,000 o $20,000 que no estan disponibles. Escala tiene un modelo especifico para esto.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#8FA3CC', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Como funciona</div>
              {[
                '1. Publicas tu negocio en Escala con los datos del local',
                '2. Escala verifica el local y te asigna una tasa',
                '3. Un inversionista latino financia el deposito y primer mes',
                '4. Reportas tus ventas cada dia en la app',
                '5. Pagas el excedente diario hasta cubrir la deuda',
                '6. El negocio es completamente tuyo',
              ].map(item => (
                <div key={item} style={{ fontSize: '0.8rem', color: '#C8D4E8', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', lineHeight: '1.5' }}>{item}</div>
              ))}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#8FA3CC', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Ejemplo real — taqueria en Houston</div>
              {[
                ['Deposito (2 meses x $1,500)', '$3,000'],
                ['Primer mes de renta', '$1,500'],
                ['Adecuaciones basicas', '$2,000'],
                ['Total financiado', '$6,500'],
                ['', ''],
                ['Ventas dia normal', '$400'],
                ['- Costo de insumos (45%)', '-$180'],
                ['- Gastos fijos del dia', '-$85'],
                ['= Pago al inversionista', '$135/dia'],
              ].map(([label, valor]) => label ? (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: valor === '$6,500' ? '0.85rem' : '0.78rem', fontWeight: valor === '$6,500' ? '700' : '400', color: valor === '$6,500' ? '#4A90D9' : valor === '$135/dia' ? '#1D9E75' : '#8FA3CC', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span>{label}</span><span>{valor}</span>
                </div>
              ) : <div key="sep" style={{ height: '8px' }} />)}
            </div>
          </div>

          <a href="/financiar-negocio-local-colombia" style={{ fontSize: '0.85rem', color: '#4A90D9', textDecoration: 'none', fontWeight: '600' }}>
            Ver el modelo completo de fondeo para locales →
          </a>
        </div>
      </section>

      {/* SECTORES */}
      <section style={s.section}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
          Los negocios que más montan los latinos en USA
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#8FA3CC', marginBottom: '1.5rem' }}>
          Según el Stanford Latino Entrepreneurship Report, estos son los sectores donde los latinos en USA tienen mayor presencia — y donde Escala puede hacer la diferencia.
        </p>
        <div style={s.grid}>
          {[
            { emoji: '🍔', sector: 'Restaurantes y comida', pct: '1er sector de LOB inmigrantes', desc: 'La cultura culinaria latina es el diferencial. Taquerías, restaurantes colombianos, panaderías, food trucks.' },
            { emoji: '🏗️', sector: 'Construcción', pct: '31.5% de la fuerza laboral', desc: 'El latino que trabaja en construcción y quiere ser su propio jefe. Escala le pone el contador y el abogado que necesita.' },
            { emoji: '💻', sector: 'Tecnología y software', pct: '19% de los negocios latinos', desc: 'Apps, plataformas, soluciones digitales. El talento técnico de LATAM construye para el mercado de USA.' },
            { emoji: '🛒', sector: 'Retail y tiendas', pct: 'Alta concentración en comunidades', desc: 'Tiendas de barrio, almacenes, bodegas. El modelo de fondeo de Escala financia el arriendo del local — deposito y mensualidades.' },
            { emoji: '🏠', sector: 'Servicios al hogar', pct: 'Limpieza, jardinería, remodelación', desc: 'Del trabajo independiente a la empresa formal con equipo, contratos y facturación.' },
            { emoji: '💆', sector: 'Belleza y cuidado personal', pct: 'Salones, spas, barberías', desc: 'Alta densidad en comunidades latinas. El local es la barrera — Escala la elimina.' },
          ].map(item => (
            <div key={item.sector} style={s.card}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{item.emoji}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff', marginBottom: '0.25rem' }}>{item.sector}</div>
              <div style={{ fontSize: '0.7rem', color: '#1D9E75', fontWeight: '600', marginBottom: '0.5rem' }}>{item.pct}</div>
              <div style={{ fontSize: '0.78rem', color: '#8FA3CC', lineHeight: '1.5' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LO QUE ESCALA NO ES */}
      <section style={s.section}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', marginBottom: '1.25rem' }}>Escala no es LinkedIn, no es Upwork, no es un banco</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '0.75rem' }}>
            {[
              { que: 'LinkedIn', diff: 'LinkedIn es para buscar empleo. Escala es para crear tu propio negocio.' },
              { que: 'Upwork / Fiverr', diff: 'En Upwork pagas por hora. En Escala el equipo trabaja por participación — no necesitas capital para empezar.' },
              { que: 'Un banco', diff: 'El banco pide historial y garantías. Escala evalúa la viabilidad del negocio.' },
              { que: 'AngelList', diff: 'AngelList es para startups tech con métricas. Escala es para cualquier negocio latino, desde una taquería hasta una app.' },
            ].map(item => (
              <div key={item.que} style={{ padding: '0.875rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#E8A020', marginBottom: '0.3rem' }}>vs {item.que}</div>
                <div style={{ fontSize: '0.78rem', color: '#8FA3CC', lineHeight: '1.5' }}>{item.diff}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={s.section}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Preguntas frecuentes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            ['¿Necesito tener visa o ciudadanía para usar Escala?', 'No. Escala es una plataforma que conecta personas — no hace ninguna verificación migratoria. Lo que importa es tu proyecto y tu compromiso con el equipo que se une a él.'],
            ['¿El equipo de LATAM puede trabajar legalmente para un negocio en USA?', 'Sí. Los contratos de participación diferida son acuerdos entre personas naturales o empresas — no son contratos laborales. El especialista en Colombia trabaja como contratista independiente para un proyecto, independientemente del país donde opere el negocio.'],
            ['¿El inversionista de Escala puede financiar un negocio en USA?', 'Sí. El modelo de fondeo de local comercial de Escala funciona para negocios en cualquier país. Un inversionista en Bogotá puede financiar el depósito y los meses de arriendo del contrato de una taquería en Houston — el repago es desde los ingresos diarios del negocio.'],
            ['¿En qué idioma funciona Escala?', 'En español. Toda la plataforma, los contratos, el workspace y el soporte son en español. Para el mercado latino — dentro y fuera de USA — el idioma no es una barrera.'],
            ['¿Qué pasa cuando el negocio empiece a generar ingresos en USA?', 'Cada participante recibe según lo que aportó y lo que acordaron al inicio — documentado en el contrato de participación diferida. Cómo se distribuye fiscalmente en USA depende de la estructura legal que elijan (LLC, S-Corp, etc.) — para eso Escala conecta con contadores especializados.'],
          ].map(([q, a]) => (
            <div key={q} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 0' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>{q}</h3>
              <p style={{ fontSize: '0.83rem', color: '#8FA3CC', lineHeight: '1.7', margin: 0 }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <div style={{ padding: '0 1.5rem 5rem', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '20px', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🌎🤝🇺🇸</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Tu negocio en USA con el talento de LATAM
          </h2>
          <p style={{ color: '#8FA3CC', marginBottom: '2rem', lineHeight: '1.7', fontSize: '0.95rem' }}>
            Crea tu cuenta en Escala hoy. Publica tu proyecto, conecta con especialistas en Colombia, México y Chile, y consigue el fondeo que los bancos te niegan.
          </p>
          <a href="/registro" style={s.btn}>Empezar gratis →</a>
          <div style={{ fontSize: '0.75rem', color: '#4B5563', marginTop: '1rem' }}>Sin tarjeta de crédito. Sin requisitos de visa.</div>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>
          © 2026 Escala Network ·{' '}
          <a href="/startup-colombia" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Colombia</a> ·{' '}
          <a href="/startup-mexico" style={{ color: '#8FA3CC', textDecoration: 'none' }}>México</a> ·{' '}
          <a href="/financiar-negocio-local-colombia" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Fondeo local</a> ·{' '}
          <a href="/que-es-escala" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Qué es Escala</a>
        </div>
      </footer>
    </div>
  )
}
