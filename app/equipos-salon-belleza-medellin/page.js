import Link from 'next/link'

export const metadata = {
  title: 'Consigue el equipo para tu salón de belleza — sin banco ni garante · Medellín',
  description: 'Tienes las clientas pero te falta el equipo. Un inversionista lo compra y tú lo pagas desde lo que produces. Silla hidráulica, horno UV, cabina de ozono, secadora. Sin banco, sin historial. Medellín.',
  keywords: ['equipo salon belleza Medellin', 'silla hidraulica sin credito', 'financiar salon belleza Colombia', 'como conseguir equipo estetica', 'maquina unas acrílicas Medellin'],
}

const s = {
  page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff' },
  hero: { maxWidth: '860px', margin: '0 auto', padding: '4rem 1.5rem 3rem', textAlign: 'center' },
  h1: { fontSize: 'clamp(1.9rem,5vw,3rem)', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: '1.15', marginBottom: '1.25rem' },
  sub: { fontSize: '1.05rem', color: '#8FA3CC', lineHeight: '1.7', maxWidth: '580px', margin: '0 auto 2.5rem' },
  btnRosa: { display: 'inline-block', background: '#D946EF', color: '#fff', padding: '1rem 2.5rem', borderRadius: '12px', textDecoration: 'none', fontSize: '1.05rem', fontWeight: '700', letterSpacing: '-0.01em' },
  wrap: { maxWidth: '860px', margin: '0 auto', padding: '0 1.5rem 5rem' },
  h2: { fontSize: '1.6rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em', marginBottom: '1rem' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem', marginBottom: '1rem' },
  paso: { display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' },
  num: (c) => ({ width: '36px', height: '36px', borderRadius: '50%', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700', color: '#fff', flexShrink: 0 }),
}

export default function Page() {
  return (
    <div style={s.page}>

      {/* HERO */}
      <div style={s.hero}>
        <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#D946EF', marginBottom: '1rem' }}>
          Medellín · Belleza y Estética
        </div>
        <h1 style={s.h1}>
          Tienes las clientas.<br/>
          Te falta el equipo.<br/>
          <span style={{ color: '#D946EF' }}>Gánatelo.</span>
        </h1>
        <p style={s.sub}>
          Un inversionista compra el equipo que necesitas para tu salón. Tú lo pagas desde lo que ganas. Sin banco. Sin garante. Sin historial crediticio.
        </p>
        <Link href="#aplica" style={s.btnRosa}>
          Quiero mi equipo →
        </Link>
        <div style={{ fontSize: '0.75rem', color: '#4B5563', marginTop: '0.875rem' }}>
          Solo 10 cupos · Primera ronda · Medellín y Valle de Aburrá
        </div>
      </div>

      <div style={s.wrap}>

        {/* PARA QUIEN ES */}
        <div style={{ background: 'rgba(217,70,239,0.06)', border: '1px solid rgba(217,70,239,0.2)', borderRadius: '14px', padding: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#D946EF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Este programa es para ti si</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '0.75rem' }}>
            {[
              '✓ Haces cabello, uñas, cejas, pestañas o estética desde tu casa o salón propio',
              '✓ Ya tienes clientas fijas — pero con el equipo que tienes no puedes crecer',
              '✓ Vives y trabajas en Medellín o el Valle de Aburrá',
              '✓ Puedes mostrar tus clientas actuales y cuánto produces al mes',
            ].map((t, i) => (
              <div key={i} style={{ fontSize: '0.85rem', color: '#C8D4E8', lineHeight: '1.5' }}>{t}</div>
            ))}
          </div>
        </div>

        {/* COMO FUNCIONA */}
        <h2 style={s.h2}>Como funciona en 3 pasos</h2>
        <div style={{ marginBottom: '3rem' }}>
          {[
            { n: '1', c: '#D946EF', t: 'Aplicas y nos dices qué equipo necesitas', d: 'Nos cuentas qué tienes, cuántas clientas atiendes y qué equipo te falta — silla hidráulica, secadora, horno UV, cabina de ozono, plancha de vapor. Y cuánto cuesta.' },
            { n: '2', c: '#4A90D9', t: 'Un inversionista compra el equipo', d: 'Un ángel inversionista compra el equipo específico que necesitas. Juntos acuerdan qué porcentaje del excedente adicional que genera el equipo se abona al capital. Cuanto más produces, más rápido pagas.' },
            { n: '3', c: '#1D9E75', t: 'Atiendes más clientas y pagas desde lo que ganas', d: 'Empiezas a usar el equipo de inmediato. Cada mes pagas al inversionista con lo que produces. Cuando termines de pagar, el equipo es tuyo.' },
          ].map(p => (
            <div key={p.n} style={s.paso}>
              <div style={s.num(p.c)}>{p.n}</div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.3rem' }}>{p.t}</div>
                <div style={{ fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6' }}>{p.d}</div>
              </div>
            </div>
          ))}
        </div>

        {/* EJEMPLO REAL */}
        <div style={{ ...s.card, borderColor: 'rgba(217,70,239,0.25)', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#D946EF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>Ejemplo real</div>
          <div style={{ fontSize: '0.88rem', color: '#C8D4E8', lineHeight: '1.7', marginBottom: '1rem' }}>
            <strong style={{ color: '#fff' }}>Sandra tiene 25 clientas fijas para cabello.</strong> Pero sin secadora de casco profesional no puede hacer tratamientos de hidratación que cobran $60.000 por sesión. La secadora cuesta <strong style={{ color: '#fff' }}>$2.800.000</strong>.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            {[
              { l: 'Equipo que necesita', v: 'Secadora de casco profesional', c: '#fff' },
              { l: 'Valor', v: '$2.800.000 COP', c: '#fff' },
              { l: 'Excedente adicional/mes', v: '~$720.000', c: '#D946EF' },
              { l: 'El equipo es suyo en', v: '~4-6 meses', c: '#1D9E75' },
            ].map(k => (
              <div key={k.l} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.65rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{k.l}</div>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: k.c }}>{k.v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#1D9E75', lineHeight: '1.5' }}>
            Con la secadora nueva Sandra genera $720K/mes adicionales. Si el 80% de ese excedente va al angel, abona $576K/mes y recupera el equipo en menos de 5 meses.
          </div>
        </div>

        {/* EQUIPOS QUE FINANCIAMOS */}
        <h2 style={s.h2}>Equipos que financiamos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0.75rem', marginBottom: '3rem' }}>
          {[
            { e: '💺', t: 'Silla hidráulica', d: 'Profesional para salón, con reposapiés' },
            { e: '💅', t: 'Horno UV/LED uñas', d: 'Para acrílico, gel y polygel' },
            { e: '💇', t: 'Secadora de casco', d: 'Para tratamientos y tintura' },
            { e: '🌬️', t: 'Plancha de vapor', d: 'Alisado, keratina, hidratación' },
            { e: '✨', t: 'Cabina de ozono', d: 'Tratamientos capilares premium' },
            { e: '🔆', t: 'Lámpara de fotones', d: 'Radiofrecuencia y rejuvenecimiento' },
            { e: '🧴', t: 'Vaporizador facial', d: 'Limpieza y tratamientos de piel' },
            { e: '💡', t: 'Camilla eléctrica', d: 'Para masajes y tratamientos corporales' },
          ].map(m => (
            <div key={m.t} style={s.card}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{m.e}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff', marginBottom: '3px' }}>{m.t}</div>
              <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{m.d}</div>
            </div>
          ))}
        </div>

        {/* APLICA */}
        <div id="aplica" style={{ background: 'rgba(217,70,239,0.06)', border: '1px solid rgba(217,70,239,0.3)', borderRadius: '16px', padding: '2rem', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#D946EF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Solicita tu cupo</div>
          <h2 style={{ ...s.h2, fontSize: '1.3rem', marginBottom: '0.5rem' }}>Solo 10 cupos para la primera ronda</h2>
          <p style={{ fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '1.5rem' }}>
            Cuéntanos tu situación. Te contactamos por WhatsApp en menos de 24 horas.
          </p>
          <Link
            href="https://wa.me/573000000000?text=Hola%2C+quiero+aplicar+al+programa+de+equipos+para+salon+de+belleza+de+Escala"
            target="_blank"
            style={{ display: 'block', textAlign: 'center', background: '#25D366', color: '#fff', borderRadius: '10px', padding: '1rem', fontSize: '1rem', fontWeight: '700', textDecoration: 'none', marginBottom: '1rem' }}>
            📲 Aplicar por WhatsApp
          </Link>
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#4B5563' }}>
            O escríbenos a <span style={{ color: '#D946EF' }}>hola@escala.network</span>
          </div>
        </div>

        {/* FAQ */}
        <h2 style={s.h2}>Preguntas frecuentes</h2>
        {[
          { p: '¿Necesito historial crediticio o codeudor?', r: 'No. No evaluamos historial bancario. Lo que nos importa es que tengas clientas reales y sepas usar el equipo.' },
          { p: '¿El equipo es mío desde el primer día?', r: 'Lo usas desde el primer día. El inversionista queda como propietario hasta que termines de pagar. Al llegar al 100%, pasa a tu nombre.' },
          { p: '¿Qué pasa si un mes atiendo menos clientas?', r: 'Hablamos contigo. El modelo está diseñado para que el excedente del equipo nuevo sea lo que paga al ángel. Si produces menos ese mes, el abono es menor. Si produces más, pagas más rápido.' },
          { p: '¿Cuánto tiempo toma el proceso?', r: 'Si tu perfil califica, entre 3 y 7 días hábiles. Una vez aprobado, el inversionista compra el equipo y te lo entregamos.' },
        ].map(f => (
          <div key={f.p} style={{ ...s.card, marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>{f.p}</div>
            <div style={{ fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6' }}>{f.r}</div>
          </div>
        ))}

        {/* CTA FINAL */}
        <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>¿Lista para atender más clientas?</div>
          <div style={{ fontSize: '0.85rem', color: '#8FA3CC', marginBottom: '1.5rem' }}>Los cupos son limitados. Aplica ahora y te contactamos en 24 horas.</div>
          <Link href="#aplica" style={s.btnRosa}>Quiero mi equipo →</Link>
        </div>

      </div>
    </div>
  )
}
