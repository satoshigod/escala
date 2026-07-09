// app/blog/como-constituir-una-empresa-sas-en-colombia/page.js
export const metadata = {
  title: 'Cómo Constituir una Empresa SAS en Colombia 2026 — Guía Paso a Paso',
  description: 'Guía completa y actualizada para 2026. Cómo crear una Sociedad por Acciones Simplificada (SAS) en Colombia: Cámara de Comercio, DIAN, NIT, libros contables y todo lo que necesitas.',
  keywords: ['constituir empresa sas colombia', 'crear sas colombia 2026', 'como constituir empresa colombia', 'nit colombia startup', 'camara de comercio bogota sas'],
  openGraph: { title: 'Cómo Constituir una Empresa SAS en Colombia 2026', description: 'Guía paso a paso para formalizar tu startup en Colombia.', url: 'https://escala.network/blog/como-constituir-una-empresa-sas-en-colombia', images: [{ url: 'https://escala.network/brand/og-default.png?v=3', width: 1200, height: 630 }] },
  alternates: { canonical: 'https://escala.network/blog/como-constituir-una-empresa-sas-en-colombia' },
}
const s = {
  page: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter,sans-serif', color: '#fff' },
  nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  article: { maxWidth: '720px', margin: '0 auto', padding: '4rem 1.5rem' },
  h1: { fontSize: 'clamp(1.75rem,4vw,2.75rem)', fontWeight: '900', lineHeight: '1.15', letterSpacing: '-0.03em', color: '#fff', marginBottom: '1.5rem' },
  h2: { fontSize: '1.4rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em', margin: '2.5rem 0 1rem' },
  p: { fontSize: '1rem', color: '#C8D4E8', lineHeight: '1.85', marginBottom: '1.25rem' },
  step: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem 1.5rem', margin: '1rem 0', display: 'flex', gap: '1rem', alignItems: 'flex-start' },
  stepNum: { fontSize: '1.25rem', fontWeight: '900', color: '#AFA9EC', flexShrink: 0, minWidth: '2rem' },
}
export default function ComoConstituirSASPage() {
  const pasos = [
    { num: '01', titulo: 'Redactar el documento privado de constitución', desc: 'La SAS se puede constituir por documento privado (no necesitas notaría). El documento debe incluir nombre de la empresa, domicilio, objeto social, capital y datos del accionista o accionistas. Si hay varios socios, todos deben firmar.' },
    { num: '02', titulo: 'Registrarse ante la Cámara de Comercio', desc: 'Con el documento privado firmado, vas a la Cámara de Comercio de tu ciudad y solicitas el registro mercantil. Pagas los derechos de matrícula (varía según el capital de la empresa). Recibes el Certificado de Existencia y Representación Legal.' },
    { num: '03', titulo: 'Obtener el NIT ante la DIAN', desc: 'Con el Certificado de Existencia vas a la DIAN (o a través de su plataforma digital) a obtener el Número de Identificación Tributaria (NIT). Este proceso incluye también el RUT de la empresa y la inscripción en el régimen tributario correspondiente.' },
    { num: '04', titulo: 'Definir el régimen tributario', desc: 'Puedes inscribirte en el Régimen Simple de Tributación (si calificas) o en el régimen común. El Simple tiene tasas más bajas y menos obligaciones para empresas pequeñas. Un contador puede asesorarte sobre cuál conviene más según tu actividad.' },
    { num: '05', titulo: 'Abrir cuenta bancaria empresarial', desc: 'Con el NIT y el Certificado de Existencia ya puedes abrir una cuenta corriente o de ahorros empresarial. Algunos bancos piden documentación adicional. Nequi Empresas, Bancolombia y Davivienda son opciones comunes para startups.' },
    { num: '06', titulo: 'Configurar la facturación electrónica DIAN', desc: 'Si vas a facturar, necesitas habilitarte como facturador electrónico ante la DIAN. Puedes usar el software gratuito de la DIAN o plataformas como Siigo, Alegra o Facture.co. Esto es obligatorio para emitir facturas válidas en Colombia.' },
    { num: '07', titulo: 'Apertura de libros contables', desc: 'Debes llevar contabilidad desde el primer día. Un contador puede ayudarte a definir el plan de cuentas y a configurar los libros. En Escala, puedes encontrar contadores que hacen esto por participación si estás en etapa temprana.' },
  ]
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href="/" style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', textDecoration: 'none' }}>Esca<span style={{ color: '#1D9E75' }}>la</span></a>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/blog" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>← Blog</a>
          <a href="/registro" style={{ background: '#1D9E75', color: '#fff', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>Crear cuenta</a>
        </div>
      </nav>
      <article style={s.article}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: '700', background: '#AFA9EC', color: '#26215C', padding: '3px 10px', borderRadius: '20px' }}>Legal y Tributario</span>
          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Julio 2026 · 10 min de lectura</span>
        </div>
        <h1 style={s.h1}>Cómo constituir una empresa SAS en Colombia paso a paso (2026)</h1>
        <p style={s.p}>La Sociedad por Acciones Simplificada (SAS) es el tipo de empresa más popular entre startups y emprendedores en Colombia por su flexibilidad, costo bajo de constitución y ausencia de requisitos mínimos de capital. Esta guía cubre el proceso completo, actualizado para 2026.</p>
        <div style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '12px', padding: '1.25rem 1.5rem', margin: '2rem 0' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1D9E75', marginBottom: '0.5rem' }}>¿No tienes capital para pagar el proceso?</div>
          <div style={{ fontSize: '0.85rem', color: '#C8D4E8', lineHeight: '1.6' }}>En Escala puedes encontrar un contador y un abogado que te acompañen en este proceso a cambio de participación diferida — no pagas salario, ellos trabajan por equity. <a href="/contador-publico-colombia" style={{ color: '#1D9E75' }}>Ver contadores disponibles →</a></div>
        </div>
        <h2 style={s.h2}>Los 7 pasos para constituir una SAS en Colombia</h2>
        {pasos.map(paso => (
          <div key={paso.num} style={s.step}>
            <div style={s.stepNum}>{paso.num}</div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.4rem' }}>{paso.titulo}</div>
              <div style={{ fontSize: '0.85rem', color: '#8FA3CC', lineHeight: '1.6' }}>{paso.desc}</div>
            </div>
          </div>
        ))}
        <h2 style={s.h2}>Costos aproximados (2026)</h2>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' }}>
          {[
            ['Registro Cámara de Comercio', 'Depende del capital. Capital $0: ~$400.000 COP'],
            ['NIT ante la DIAN', 'Gratuito'],
            ['Honorarios del abogado', '$500.000 - $2.000.000 COP (o participación en Escala)'],
            ['Honorarios del contador', '$300.000 - $800.000 COP/mes (o participación en Escala)'],
            ['Software de facturación electrónica', 'Desde $0 (DIAN gratuito) hasta $150.000 COP/mes'],
          ].map(([concepto, costo], i) => (
            <div key={concepto} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.875rem 1.25rem', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.06)' : 'none', gap: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#C8D4E8' }}>{concepto}</span>
              <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '600', textAlign: 'right', flexShrink: 0 }}>{costo}</span>
            </div>
          ))}
        </div>
        <h2 style={s.h2}>Preguntas frecuentes</h2>
        {[
          ['¿Necesito notaría para constituir una SAS?', 'No. La SAS es el único tipo de empresa en Colombia que se puede constituir por documento privado, sin necesidad de escritura pública ni notaría. Esto reduce significativamente el costo y el tiempo del proceso.'],
          ['¿Cuánto tarda todo el proceso?', 'El registro ante la Cámara de Comercio puede hacerse en el mismo día si vas en persona o en 1-3 días hábiles online. La obtención del NIT puede tardar 1-5 días hábiles adicionales. En total, puedes tener tu empresa lista en una semana.'],
          ['¿Puedo constituir una SAS solo, sin socios?', 'Sí. La SAS puede ser unipersonal — un solo accionista es suficiente. No hay mínimo de capital requerido por ley, aunque la Cámara de Comercio cobra una tarifa mínima de registro.'],
        ].map(([q, a]) => (
          <div key={q} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 0' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>{q}</div>
            <div style={{ fontSize: '0.85rem', color: '#8FA3CC', lineHeight: '1.6' }}>{a}</div>
          </div>
        ))}
        <div style={{ margin: '2.5rem 0', textAlign: 'center' }}>
          <a href="/contador-publico-colombia" style={{ background: '#1D9E75', color: '#fff', padding: '1rem 2.5rem', borderRadius: '10px', textDecoration: 'none', fontSize: '1rem', fontWeight: '700', display: 'inline-block' }}>Buscar contador para mi startup →</a>
        </div>
      </article>
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>© 2026 Escala Network · <a href="/blog" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Blog</a> · <a href="/registro" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Registro</a></div>
      </footer>
    </div>
  )
}
