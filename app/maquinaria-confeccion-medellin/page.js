import Link from 'next/link'

export const metadata = {
  title: 'Consigue la maquina de confeccion que necesitas — sin banco ni garante',
  description: 'Tienes los pedidos pero te falta la maquina. Un inversionista la compra y tu la pagas desde lo que produces. Sin banco, sin historial, sin garante. Medellin y Valle de Aburra.',
  keywords: ['maquina de confeccion Medellin', 'maquina industrial sin credito', 'como conseguir maquina de coser', 'financiar maquina confeccion Colombia', 'maquina overlock sin banco'],
}

const s = {
  page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff' },
  hero: { maxWidth: '860px', margin: '0 auto', padding: '4rem 1.5rem 3rem', textAlign: 'center' },
  h1: { fontSize: 'clamp(1.9rem,5vw,3rem)', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: '1.15', marginBottom: '1.25rem' },
  sub: { fontSize: '1.05rem', color: '#8FA3CC', lineHeight: '1.7', maxWidth: '580px', margin: '0 auto 2.5rem' },
  btnVerde: { display: 'inline-block', background: '#1D9E75', color: '#fff', padding: '1rem 2.5rem', borderRadius: '12px', textDecoration: 'none', fontSize: '1.05rem', fontWeight: '700', letterSpacing: '-0.01em' },
  wrap: { maxWidth: '860px', margin: '0 auto', padding: '0 1.5rem 5rem' },
  h2: { fontSize: '1.6rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em', marginBottom: '1rem' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem', marginBottom: '1rem' },
  paso: { display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' },
  numCircle: (c) => ({ width: '36px', height: '36px', borderRadius: '50%', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700', color: '#fff', flexShrink: 0 }),
}

export default function Page() {
  return (
    <div style={s.page}>

      {/* HERO */}
      <div style={s.hero}>
        <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '1rem' }}>
          Medellin y Valle de Aburra · Confeccion
        </div>
        <h1 style={s.h1}>
          Tienes los pedidos.<br/>
          Te falta la maquina.<br/>
          <span style={{ color: '#1D9E75' }}>Te la conseguimos.</span>
        </h1>
        <p style={s.sub}>
          Un inversionista compra la maquina que necesitas. Tu la usas para producir mas y pagas al angel desde el excedente que genera la misma maquina. Sin banco. Sin garante. Sin historial crediticio.
        </p>
        <Link href="#aplica" style={s.btnVerde}>
          Quiero mi maquina →
        </Link>
        <div style={{ fontSize: '0.75rem', color: '#4B5563', marginTop: '0.875rem' }}>
          Solo 10 cupos para la primera ronda · Medellin y Valle de Aburra
        </div>
      </div>

      <div style={s.wrap}>

        {/* PARA QUIEN ES */}
        <div style={{ background: 'rgba(29,158,117,0.06)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '14px', padding: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#1D9E75', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Este programa es para ti si</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '0.75rem' }}>
            {[
              '✓ Confeccionas ropa interior, vestidos de bano, uniformes o ropa en general',
              '✓ Ya tienes clientes y pedidos — pero tu maquina no da abasto',
              '✓ Vives y trabajas en Medellin o el Valle de Aburra',
              '✓ Puedes mostrar tus pedidos actuales y cuanto produces al mes',
            ].map((t,i) => (
              <div key={i} style={{ fontSize: '0.85rem', color: '#C8D4E8', lineHeight: '1.5' }}>{t}</div>
            ))}
          </div>
        </div>

        {/* COMO FUNCIONA */}
        <h2 style={s.h2}>Como funciona en 3 pasos</h2>
        <div style={{ marginBottom: '3rem' }}>
          {[
            { n: '1', c: '#4A90D9', t: 'Aplicas y nos cuentas que maquina necesitas', d: 'Nos dices que tipo de maquina te falta — Juki, Jack, overlock, plana, cortadora — y cuanto cuesta aproximadamente. Nos muestras tus pedidos actuales.' },
            { n: '2', c: '#1D9E75', t: 'Un inversionista compra la maquina', d: 'Un angel inversionista compra la maquina especifica que necesitas. Juntos acuerdan que porcentaje del excedente mensual se abona al capital — tipicamente entre el 60% y el 80%. Cuanto mas produces, mas rapido pagas.' },
            { n: '3', c: '#E8A020', t: 'Produces mas y el excedente abona al angel', d: 'Empiezas a usar la maquina de inmediato. Cada mes reportas tus ventas. Del excedente (ventas - costos - gastos), un porcentaje acordado va al angel como abono al capital. Si produces mas, pagas mas rapido. Cuando el angel recupera el total, la maquina es tuya.' },
          ].map(p => (
            <div key={p.n} style={s.paso}>
              <div style={s.numCircle(p.c)}>{p.n}</div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.3rem' }}>{p.t}</div>
                <div style={{ fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6' }}>{p.d}</div>
              </div>
            </div>
          ))}
        </div>

        {/* EJEMPLO REAL */}
        <div style={{ ...s.card, borderColor: 'rgba(29,158,117,0.25)', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#1D9E75', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>Ejemplo real</div>
          <div style={{ fontSize: '0.88rem', color: '#C8D4E8', lineHeight: '1.7', marginBottom: '1rem' }}>
            <strong style={{ color: '#fff' }}>Maria tiene una maquina plana y produce 80 unidades al mes.</strong> Sus clientes le piden 150 pero no puede cumplir. Necesita una maquina overlock que cuesta <strong style={{ color: '#fff' }}>$8.500.000</strong>.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            {[
              { l: 'Maquina que necesita', v: 'Overlock industrial Jack', c: '#fff' },
              { l: 'Valor', v: '$8.500.000 COP', c: '#fff' },
              { l: 'Excedente adicional/mes', v: '~$1.000.000', c: '#E8A020' },
              { l: 'La maquina es suya en', v: '~8-12 meses', c: '#1D9E75' },
            ].map(k => (
              <div key={k.l} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.65rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{k.l}</div>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: k.c }}>{k.v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#1D9E75', lineHeight: '1.5' }}>
            Con la maquina nueva Maria puede cumplir los 150 pedidos. Su excedente adicional es ~$1M/mes. Si el 80% de ese excedente va al angel, abona $800K/mes y recupera la maquina en menos de 11 meses — no en anos.
          </div>
        </div>

        {/* MAQUINAS QUE FINANCIAMOS */}
        <h2 style={s.h2}>Maquinas que financiamos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0.75rem', marginBottom: '3rem' }}>
          {[
            { e: '🧵', t: 'Maquina plana', m: 'Juki, Jack, Brother, Singer' },
            { e: '🔗', t: 'Overlock / fileteadora', m: 'Pegasus, Juki, Jack' },
            { e: '✂️', t: 'Cortadora industrial', m: 'Eastman, Jontex' },
            { e: '🩱', t: 'Maquina para bano / ropa interior', m: 'Kansai, Rimoldi' },
            { e: '🔘', t: 'Botonera / ojaladora', m: 'Brother, Juki' },
            { e: '📐', t: 'Bordadora', m: 'Brother, Tajima' },
          ].map(m => (
            <div key={m.t} style={s.card}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{m.e}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff', marginBottom: '3px' }}>{m.t}</div>
              <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{m.m}</div>
            </div>
          ))}
        </div>

        {/* FORMULARIO APLICA */}
        <div id="aplica" style={{ background: 'rgba(29,158,117,0.06)', border: '1px solid rgba(29,158,117,0.3)', borderRadius: '16px', padding: '2rem', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#1D9E75', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Solicita tu cupo</div>
          <h2 style={{ ...s.h2, fontSize: '1.3rem', marginBottom: '0.5rem' }}>Solo 10 cupos para la primera ronda</h2>
          <p style={{ fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '1.5rem' }}>
            Cuéntanos tu situacion. Te contactamos por WhatsApp en menos de 24 horas para confirmar tu cupo.
          </p>
          <Link
            href="https://wa.me/573000000000?text=Hola%2C+quiero+aplicar+al+programa+de+maquinaria+para+confeccion+de+Escala"
            target="_blank"
            style={{ display: 'block', textAlign: 'center', background: '#25D366', color: '#fff', borderRadius: '10px', padding: '1rem', fontSize: '1rem', fontWeight: '700', textDecoration: 'none', marginBottom: '1rem' }}>
            📲 Aplicar por WhatsApp
          </Link>
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#4B5563' }}>
            O escríbenos directamente a <span style={{ color: '#1D9E75' }}>hola@escala.network</span>
          </div>
        </div>

        {/* PREGUNTAS FRECUENTES */}
        <h2 style={s.h2}>Preguntas frecuentes</h2>
        {[
          { p: '¿Necesito historial crediticio o codeudor?', r: 'No. No evaluamos tu historial bancario. Lo que nos importa es que tengas pedidos reales y sepas operar la maquina.' },
          { p: '¿La maquina es mia desde el primer dia?', r: 'La usas desde el primer dia. El inversionista queda como propietario registrado hasta que termines de pagar. Al llegar al 100%, la maquina pasa a tu nombre.' },
          { p: '¿Que pasa si un mes vendo poco?', r: 'Hablamos contigo. El modelo funciona sobre el excedente real — si vendes menos ese mes, el abono es menor. No hay cuota fija que te ahogue. Si vendes mas, pagas mas rapido y la maquina es tuya antes.' },
          { p: '¿Que tipo de maquinas financian?', r: 'Cualquier maquina industrial para confeccion: planas, overlock, cortadoras, maquinas para ropa de bano, botoneras, bordadoras. Marcas como Juki, Jack, Pegasus, Kansai, Brother, Singer.' },
          { p: '¿Cuanto tiempo toma el proceso?', r: 'Si tu perfil califica, el proceso de aprobacion toma entre 3 y 7 dias habiles. Una vez aprobado, el inversionista compra la maquina y te la entregamos.' },
        ].map(f => (
          <div key={f.p} style={{ ...s.card, marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>{f.p}</div>
            <div style={{ fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6' }}>{f.r}</div>
          </div>
        ))}

        {/* CTA FINAL */}
        <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>¿Lista para producir mas?</div>
          <div style={{ fontSize: '0.85rem', color: '#8FA3CC', marginBottom: '1.5rem' }}>Los cupos son limitados. Aplica ahora y te contactamos en 24 horas.</div>
          <Link href="#aplica" style={s.btnVerde}>Quiero mi maquina →</Link>
        </div>

      </div>
    </div>
  )
}
