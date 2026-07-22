import Link from 'next/link'

export const metadata = {
  title: 'Consigue la freidora, horno o amasadora para tu negocio de comida — sin banco · Medellín',
  description: 'Vendes empanadas, arepas, tamales o comida en tu barrio y necesitas producir más. Un inversionista compra el equipo y tú lo pagas desde lo que vendes. Sin banco, sin garante. Medellín.',
  keywords: ['freidora industrial Medellin sin credito', 'equipo negocio comida Medellin', 'financiar horno panaderia Colombia', 'amasadora sin banco Medellin', 'maquina empanadas Medellin'],
}

const s = {
  page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff' },
  hero: { maxWidth: '860px', margin: '0 auto', padding: '4rem 1.5rem 3rem', textAlign: 'center' },
  h1: { fontSize: 'clamp(1.9rem,5vw,3rem)', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: '1.15', marginBottom: '1.25rem' },
  sub: { fontSize: '1.05rem', color: '#8FA3CC', lineHeight: '1.7', maxWidth: '580px', margin: '0 auto 2.5rem' },
  btnNaranja: { display: 'inline-block', background: '#E8A020', color: '#fff', padding: '1rem 2.5rem', borderRadius: '12px', textDecoration: 'none', fontSize: '1.05rem', fontWeight: '700', letterSpacing: '-0.01em' },
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
        <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#E8A020', marginBottom: '1rem' }}>
          Medellín · Comida y Emprendimiento
        </div>
        <h1 style={s.h1}>
          Tienes los clientes.<br/>
          Te falta el equipo.<br/>
          <span style={{ color: '#E8A020' }}>Gánatelo.</span>
        </h1>
        <p style={s.sub}>
          Un inversionista compra la freidora, el horno o la amasadora que necesitas. Tú lo pagas desde lo que vendes cada día. Sin banco. Sin garante. Sin historial crediticio.
        </p>
        <Link href="#aplica" style={s.btnNaranja}>
          Quiero mi equipo →
        </Link>
        <div style={{ fontSize: '0.75rem', color: '#4B5563', marginTop: '0.875rem' }}>
          Solo 10 cupos · Primera ronda · Medellín y Valle de Aburrá
        </div>
      </div>

      <div style={s.wrap}>

        {/* PARA QUIEN ES */}
        <div style={{ background: 'rgba(232,160,32,0.06)', border: '1px solid rgba(232,160,32,0.2)', borderRadius: '14px', padding: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#E8A020', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Este programa es para ti si</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '0.75rem' }}>
            {[
              '✓ Vendes empanadas, arepas, tamales, pandebonos, fritanga o comida casera en tu barrio',
              '✓ Ya tienes clientes fijos pero con lo que tienes no puedes producir más',
              '✓ Vives y trabajas en Medellín o el Valle de Aburrá',
              '✓ Puedes mostrar cuánto vendes al día y qué equipo necesitas para vender más',
            ].map((t, i) => (
              <div key={i} style={{ fontSize: '0.85rem', color: '#C8D4E8', lineHeight: '1.5' }}>{t}</div>
            ))}
          </div>
        </div>

        {/* COMO FUNCIONA */}
        <h2 style={s.h2}>Como funciona en 3 pasos</h2>
        <div style={{ marginBottom: '3rem' }}>
          {[
            { n: '1', c: '#E8A020', t: 'Aplicas y nos dices qué equipo necesitas', d: 'Nos cuentas cuánto vendes hoy, cuánto podrías vender con el equipo nuevo y cuánto cuesta — freidora, horno, amasadora, estufa industrial, nevera, licuadora industrial.' },
            { n: '2', c: '#4A90D9', t: 'Un inversionista compra el equipo', d: 'Un inversionista ángel compra el equipo específico que necesitas. Juntos acuerdan qué porcentaje del excedente adicional que genera el equipo se abona al capital. Cuanto más produces, más rápido pagas.' },
            { n: '3', c: '#1D9E75', t: 'Produces más y pagas desde lo que vendes', d: 'Empiezas a usar el equipo de inmediato. Cada mes pagas al inversionista desde tus ventas. Cuando termines de pagar, el equipo es tuyo.' },
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
        <div style={{ ...s.card, borderColor: 'rgba(232,160,32,0.25)', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#E8A020', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>Ejemplo real</div>
          <div style={{ fontSize: '0.88rem', color: '#C8D4E8', lineHeight: '1.7', marginBottom: '1rem' }}>
            <strong style={{ color: '#fff' }}>Patricia vende 80 empanadas al día desde su casa en Belén.</strong> Con su freidora vieja no puede hacer más. Una freidora industrial le permite hacer 300 por día. El equipo cuesta <strong style={{ color: '#fff' }}>$3.200.000</strong>.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            {[
              { l: 'Equipo que necesita', v: 'Freidora industrial 20L', c: '#fff' },
              { l: 'Valor', v: '$3.200.000 COP', c: '#fff' },
              { l: 'Excedente adicional/mes', v: '~$7.600.000', c: '#E8A020' },
              { l: 'El equipo es suyo en', v: '~1-2 meses', c: '#1D9E75' },
            ].map(k => (
              <div key={k.l} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.65rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{k.l}</div>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: k.c }}>{k.v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#1D9E75', lineHeight: '1.5' }}>
            Con la freidora nueva Patricia pasa de 80 a 250 empanadas/dia. Excedente adicional: ~$7.6M/mes. Si el 80% de ese excedente va al angel, abona $6M/mes y recupera el equipo en menos de 2 meses.
          </div>
        </div>

        {/* EQUIPOS QUE FINANCIAMOS */}
        <h2 style={s.h2}>Equipos que financiamos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0.75rem', marginBottom: '3rem' }}>
          {[
            { e: '🍳', t: 'Freidora industrial', d: 'Para empanadas, papas, buñuelos, chorizos' },
            { e: '🍞', t: 'Horno panadero', d: 'Para pandebono, almojábana, pan artesanal' },
            { e: '🫙', t: 'Amasadora industrial', d: 'Para masa de pan, empanadas, tamales' },
            { e: '🍲', t: 'Estufa industrial', d: 'Para sancocho, frijoles, comida al por mayor' },
            { e: '❄️', t: 'Nevera comercial', d: 'Para conservar y exhibir productos' },
            { e: '🥤', t: 'Licuadora industrial', d: 'Para jugos, batidos y salsas en volumen' },
            { e: '🫕', t: 'Marmita de cocción', d: 'Para sopas, caldos y comidas en cantidad' },
            { e: '🌡️', t: 'Vitrina refrigerada', d: 'Para exhibición y venta en punto de ventas' },
          ].map(m => (
            <div key={m.t} style={s.card}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{m.e}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff', marginBottom: '3px' }}>{m.t}</div>
              <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{m.d}</div>
            </div>
          ))}
        </div>

        {/* POR QUE FUNCIONA */}
        <div style={{ ...s.card, borderColor: 'rgba(29,158,117,0.2)', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#1D9E75', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>Por qué funciona para tu negocio</div>
          <div style={{ fontSize: '0.85rem', color: '#C8D4E8', lineHeight: '1.7' }}>
            Los negocios de comida tienen algo único: <strong style={{ color: '#fff' }}>venden todos los días.</strong> Una freidora genera ingresos desde el primer día que la usas. Eso hace que el modelo de pago mensual sea de los más seguros — no estás apostando a que el negocio funcione. Ya funciona. Solo necesitas más capacidad.
          </div>
        </div>

        {/* APLICA */}
        <div id="aplica" style={{ background: 'rgba(232,160,32,0.06)', border: '1px solid rgba(232,160,32,0.3)', borderRadius: '16px', padding: '2rem', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#E8A020', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Solicita tu cupo</div>
          <h2 style={{ ...s.h2, fontSize: '1.3rem', marginBottom: '0.5rem' }}>Solo 10 cupos para la primera ronda</h2>
          <p style={{ fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '1.5rem' }}>
            Cuéntanos tu negocio. Te contactamos por WhatsApp en menos de 24 horas para confirmar tu cupo.
          </p>
          <Link
            href="https://wa.me/573000000000?text=Hola%2C+quiero+aplicar+al+programa+de+equipos+para+negocio+de+comida+de+Escala"
            target="_blank"
            style={{ display: 'block', textAlign: 'center', background: '#25D366', color: '#fff', borderRadius: '10px', padding: '1rem', fontSize: '1rem', fontWeight: '700', textDecoration: 'none', marginBottom: '1rem' }}>
            📲 Aplicar por WhatsApp
          </Link>
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#4B5563' }}>
            O escríbenos a <span style={{ color: '#E8A020' }}>hola@escala.network</span>
          </div>
        </div>

        {/* FAQ */}
        <h2 style={s.h2}>Preguntas frecuentes</h2>
        {[
          { p: '¿Necesito historial crediticio o codeudor?', r: 'No. No evaluamos tu historial bancario. Lo que nos importa es que tengas ventas reales y sepas usar el equipo.' },
          { p: '¿El equipo es mío desde el primer día?', r: 'Lo usas desde el primer día. El inversionista queda como propietario registrado hasta que termines de pagar. Al llegar al 100%, pasa a tu nombre.' },
          { p: '¿Qué pasa si un mes vendo menos?', r: 'Hablamos contigo. El modelo está diseñado para que el excedente del equipo nuevo sea lo que paga al inversionista ángel. Si vendes menos ese mes, el abono es menor. Si vendes más, pagas más rápido.' },
          { p: '¿Financia equipos usados o solo nuevos?', r: 'Principalmente equipos nuevos. En casos donde el equipo usado tiene garantía verificable y precio justo, también se puede evaluar.' },
          { p: '¿Cuánto tiempo toma el proceso?', r: 'Si tu perfil califica, entre 3 y 7 días hábiles. Una vez aprobado, el inversionista compra el equipo y te lo entregamos.' },
        ].map(f => (
          <div key={f.p} style={{ ...s.card, marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>{f.p}</div>
            <div style={{ fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6' }}>{f.r}</div>
          </div>
        ))}

        {/* CTA FINAL */}
        <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>¿Lista para vender más?</div>
          <div style={{ fontSize: '0.85rem', color: '#8FA3CC', marginBottom: '1.5rem' }}>Los cupos son limitados. Aplica ahora y te contactamos en 24 horas.</div>
          <Link href="#aplica" style={s.btnNaranja}>Quiero mi equipo →</Link>
        </div>

      </div>
    </div>
  )
}
