import Link from 'next/link'

export const metadata = {
  title: 'Programa de Maquinaria — Consigue tu equipo sin banco · Escala',
  description: 'Un ángel compra el equipo que necesitas. Tú lo usas y pagas desde el excedente que genera. Sin banco, sin garante, sin cuota fija. Confección, belleza y comida en Medellín.',
  keywords: ['programa maquinaria sin banco Colombia', 'conseguir equipo sin credito Medellin', 'leasing maquinaria excedente Colombia'],
}

const s = {
  page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff' },
  wrap: { maxWidth: '900px', margin: '0 auto', padding: '4rem 1.5rem 5rem' },
  h1: { fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: '1.15', marginBottom: '1rem' },
  sub: { fontSize: '1.05rem', color: '#8FA3CC', lineHeight: '1.7', maxWidth: '600px', marginBottom: '3rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.25rem', marginBottom: '3rem' },
  card: (border) => ({ background: 'rgba(255,255,255,0.04)', border: `1px solid ${border}`, borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }),
  tag: (bg, color) => ({ display: 'inline-block', background: bg, color, fontSize: '0.65rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.06em', textTransform: 'uppercase', alignSelf: 'flex-start' }),
  h2: { fontSize: '1.15rem', fontWeight: '800', color: '#fff', lineHeight: '1.3' },
  desc: { fontSize: '0.85rem', color: '#8FA3CC', lineHeight: '1.65', flex: 1 },
  avatar: { fontSize: '0.82rem', color: '#6B7280', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem', marginTop: 'auto' },
  kpis: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  kpi: (c) => ({ fontSize: '0.75rem', color: c, fontWeight: '700' }),
  btn: (bg, color) => ({ display: 'block', textAlign: 'center', background: bg, color, borderRadius: '10px', padding: '0.7rem 1.25rem', textDecoration: 'none', fontSize: '0.88rem', fontWeight: '700', marginTop: '0.5rem' }),
  modelo: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '3rem' },
  paso: { display: 'flex', gap: '0.875rem', alignItems: 'flex-start', marginBottom: '1rem' },
  num: (c) => ({ width: '28px', height: '28px', borderRadius: '50%', background: c, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: '700', flexShrink: 0, marginTop: '2px' }),
}

const NICHOS = [
  {
    slug: '/maquinaria-confeccion-medellin',
    color: '#1D9E75',
    borderColor: 'rgba(29,158,117,0.3)',
    tagBg: 'rgba(29,158,117,0.15)',
    emoji: '🧵',
    nicho: 'Confección · Medellín',
    titulo: 'Máquina overlock, plana o fileteadora para tu taller',
    desc: 'Si tienes pedidos de confección pero tu máquina no da abasto, un ángel compra la overlock o flatseamer que necesitas. Perfecto para vestidos de baño, ropa interior y maquila.',
    avatar: 'Lorena tiene 180 pedidos/mes. Su máquina solo da para 90.',
    excedente: '~$1M/mes excedente adicional',
    tiempo: 'Paga en 8-12 meses',
    ticket: 'Máquinas desde $3M hasta $18M COP',
  },
  {
    slug: '/equipos-salon-belleza-medellin',
    color: '#D946EF',
    borderColor: 'rgba(217,70,239,0.3)',
    tagBg: 'rgba(217,70,239,0.12)',
    emoji: '💄',
    nicho: 'Belleza · Medellín',
    titulo: 'Silla hidráulica, secadora de casco o cabina de ozono para tu salón',
    desc: 'Si tienes clientas pero te falta el equipo para ofrecer servicios premium, un ángel compra la silla hidráulica, la secadora o la cabina que necesitas.',
    avatar: 'Sandra tiene 25 clientas. Sin secadora no puede hacer hidrataciones a $60.000.',
    excedente: '~$720K/mes excedente adicional',
    tiempo: 'Paga en 4-6 meses',
    ticket: 'Equipos desde $800K hasta $8M COP',
  },
  {
    slug: '/equipos-negocio-comida-medellin',
    color: '#E8A020',
    borderColor: 'rgba(232,160,32,0.3)',
    tagBg: 'rgba(232,160,32,0.12)',
    emoji: '🍳',
    nicho: 'Comida · Medellín',
    titulo: 'Freidora, horno panadero o amasadora para tu negocio',
    desc: 'Si vendes empanadas, arepas, pandebonos o fritanga y necesitas producir más, un ángel compra la freidora industrial o el horno que te da la capacidad que necesitas.',
    avatar: 'Patricia hace 80 empanadas/día. Con freidora industrial puede hacer 250.',
    excedente: '~$7.6M/mes excedente adicional',
    tiempo: 'Paga en 1-2 meses',
    ticket: 'Equipos desde $1.5M hasta $8M COP',
  },
]

export default function Page() {
  return (
    <div style={s.page}>
      <div style={s.wrap}>

        {/* Hero */}
        <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#AFA9EC', marginBottom: '1rem' }}>
          Programa de Maquinaria · Escala · Medellín
        </div>
        <h1 style={s.h1}>
          Tienes los pedidos.<br/>
          Falta la máquina.<br/>
          <span style={{ color: '#AFA9EC' }}>La conseguimos.</span>
        </h1>
        <p style={s.sub}>
          Un ángel inversionista compra el equipo que necesitas. Tú lo usas desde el primer día y pagas desde el excedente que genera la misma máquina. Sin banco. Sin garante. Sin cuota fija.
        </p>

        {/* Cómo funciona — resumen */}
        <div style={s.modelo}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#AFA9EC', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>Cómo funciona</div>
          {[
            { n: '1', c: '#AFA9EC', t: 'Aplicas al programa', d: 'Nos cuentas qué equipo necesitas, cuánto produces hoy y cuánto podrías producir con el equipo nuevo.' },
            { n: '2', c: '#4A90D9', t: 'El ángel compra el equipo', d: 'Un inversionista lo compra y queda como propietario registrado. Tú lo recibes y lo usas desde el primer día.' },
            { n: '3', c: '#1D9E75', t: 'Pagas desde el excedente', d: 'Cada mes reportas tus ventas. Del excedente (ventas - costos - gastos), un % acordado va al ángel. Si produces más, pagas más rápido.' },
            { n: '4', c: '#E8A020', t: 'La máquina es tuya', d: 'Cuando el ángel recupera el total, la máquina pasa a tu nombre. Sin deuda bancaria, sin historial crediticio.' },
          ].map(p => (
            <div key={p.n} style={s.paso}>
              <div style={s.num(p.c)}>{p.n}</div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff', marginBottom: '2px' }}>{p.t}</div>
                <div style={{ fontSize: '0.8rem', color: '#8FA3CC', lineHeight: '1.6' }}>{p.d}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Los 3 nichos */}
        <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#8FA3CC', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
          Elige tu sector
        </div>
        <div style={s.grid}>
          {NICHOS.map(n => (
            <div key={n.slug} style={s.card(n.borderColor)}>
              <div style={s.tag(n.tagBg, n.color)}>{n.emoji} {n.nicho}</div>
              <h2 style={s.h2}>{n.titulo}</h2>
              <p style={s.desc}>{n.desc}</p>
              <div style={s.kpis}>
                <span style={s.kpi(n.color)}>{n.excedente}</span>
                <span style={s.kpi('#1D9E75')}>{n.tiempo}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{n.ticket}</div>
              <div style={s.avatar}>{n.avatar}</div>
              <Link href={n.slug} style={s.btn(n.color, n.color === '#E8A020' ? '#fff' : '#fff')}>
                Ver programa →
              </Link>
            </div>
          ))}
        </div>

        {/* Sin banco — resumen */}
        <div style={{ background: 'rgba(175,169,236,0.06)', border: '1px solid rgba(175,169,236,0.2)', borderRadius: '14px', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>
            Sin banco · Sin garante · Sin historial · Sin cuota fija
          </div>
          <div style={{ fontSize: '0.85rem', color: '#8FA3CC', marginBottom: '1.5rem' }}>
            Lo que evaluamos no es tu pasado — es si el equipo nuevo genera el dinero para pagarse solo.
          </div>
          <Link href="/registro" style={{ display: 'inline-block', background: '#AFA9EC', color: '#2D2866', borderRadius: '10px', padding: '0.75rem 2rem', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700' }}>
            Crear cuenta en Escala →
          </Link>
        </div>

      </div>
    </div>
  )
}
