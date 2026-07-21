import Link from 'next/link'

/*
 * Componente reutilizable para las páginas intermedias de las tarjetas del home.
 * Mantiene la identidad visual de Escala en todas las landings.
 *
 * Props:
 *  - accent: color de acento (#hex)
 *  - eyebrow: texto pequeño arriba del título
 *  - emoji: ícono grande del hero
 *  - h1: título principal
 *  - sub: subtítulo
 *  - beneficios: [{ icon, titulo, texto }]
 *  - pasos: [{ n, titulo, texto }]  (Cómo funciona)
 *  - ejemplos: [{ titulo, texto }]  (opcional — casos/ejemplos)
 *  - ctaPrincipal: { texto, href }
 *  - ctaSecundario: { texto, href } (opcional)
 *  - nota: texto de cierre (opcional)
 */
export default function LandingIntermedia({
  accent = '#1D9E75',
  eyebrow,
  emoji,
  h1,
  sub,
  beneficios = [],
  pasos = [],
  ejemplos = [],
  ctaPrincipal,
  ctaSecundario,
  nota,
}) {
  const s = {
    page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff' },
    wrap: { maxWidth: '900px', margin: '0 auto', padding: '4rem 1.5rem 5rem' },
    volver: { color: '#6B7280', fontSize: '0.82rem', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' },
    eyebrow: { fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: accent, marginBottom: '1rem' },
    emoji: { fontSize: '2.5rem', marginBottom: '1rem' },
    h1: { fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: '1.15', marginBottom: '1rem' },
    sub: { fontSize: '1.05rem', color: '#8FA3CC', lineHeight: '1.7', maxWidth: '620px', marginBottom: '3rem' },
    secTitle: { fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8FA3CC', marginBottom: '1.25rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.25rem', marginBottom: '3rem' },
    benCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem' },
    benIcon: { fontSize: '1.75rem', marginBottom: '0.75rem' },
    benTitulo: { fontSize: '1rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' },
    benTexto: { fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6' },
    modelo: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.5rem', marginBottom: '3rem' },
    paso: { display: 'flex', gap: '0.875rem', alignItems: 'flex-start', marginBottom: '1.1rem' },
    num: { width: '28px', height: '28px', borderRadius: '50%', background: accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: '700', flexShrink: 0, marginTop: '2px' },
    pasoTitulo: { fontSize: '0.9rem', fontWeight: '700', color: '#fff', marginBottom: '2px' },
    pasoTexto: { fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6' },
    ejGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem', marginBottom: '3rem' },
    ejCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '1.1rem' },
    ejTitulo: { fontSize: '0.85rem', fontWeight: '700', color: '#fff', marginBottom: '0.35rem' },
    ejTexto: { fontSize: '0.78rem', color: '#8FA3CC', lineHeight: '1.55' },
    ctaBox: { background: `${accent}12`, border: `1px solid ${accent}40`, borderRadius: '16px', padding: '2rem', textAlign: 'center' },
    ctaTitulo: { fontSize: '1.1rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' },
    ctaNota: { fontSize: '0.85rem', color: '#8FA3CC', marginBottom: '1.5rem', maxWidth: '480px', margin: '0 auto 1.5rem' },
    ctaRow: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' },
    btnP: { background: accent, color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '700', textDecoration: 'none' },
    btnS: { background: 'rgba(255,255,255,0.08)', color: '#fff', padding: '0.875rem 2rem', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '700', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)' },
  }

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <Link href="/" style={s.volver}>← Volver al inicio</Link>

        {/* Hero */}
        <div style={s.eyebrow}>{eyebrow}</div>
        <div style={s.emoji}>{emoji}</div>
        <h1 style={s.h1}>{h1}</h1>
        <p style={s.sub}>{sub}</p>

        {/* Beneficios */}
        {beneficios.length > 0 && (
          <>
            <div style={s.secTitle}>Por qué Escala</div>
            <div style={s.grid}>
              {beneficios.map((b, i) => (
                <div key={i} style={s.benCard}>
                  <div style={s.benIcon}>{b.icon}</div>
                  <div style={s.benTitulo}>{b.titulo}</div>
                  <div style={s.benTexto}>{b.texto}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Cómo funciona */}
        {pasos.length > 0 && (
          <>
            <div style={s.secTitle}>Cómo funciona</div>
            <div style={s.modelo}>
              {pasos.map((p, i) => (
                <div key={i} style={{ ...s.paso, marginBottom: i === pasos.length - 1 ? 0 : '1.1rem' }}>
                  <div style={s.num}>{p.n}</div>
                  <div>
                    <div style={s.pasoTitulo}>{p.titulo}</div>
                    <div style={s.pasoTexto}>{p.texto}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Ejemplos */}
        {ejemplos.length > 0 && (
          <>
            <div style={s.secTitle}>Ejemplos</div>
            <div style={s.ejGrid}>
              {ejemplos.map((e, i) => (
                <div key={i} style={s.ejCard}>
                  <div style={s.ejTitulo}>{e.titulo}</div>
                  <div style={s.ejTexto}>{e.texto}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CTA */}
        <div style={s.ctaBox}>
          {nota && <div style={s.ctaTitulo}>{nota}</div>}
          <div style={s.ctaNota}>Crea tu cuenta gratis y da el siguiente paso. No necesitas capital para empezar.</div>
          <div style={s.ctaRow}>
            <Link href={ctaPrincipal.href} style={s.btnP}>{ctaPrincipal.texto}</Link>
            {ctaSecundario && <Link href={ctaSecundario.href} style={s.btnS}>{ctaSecundario.texto}</Link>}
          </div>
        </div>
      </div>
    </div>
  )
}
