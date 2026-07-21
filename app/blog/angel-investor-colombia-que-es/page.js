import Link from 'next/link'
export const metadata = {
  title: 'Que es un angel investor en Colombia y como encontrar uno para tu negocio — Escala Blog',
  description: 'Un ángel inversionista no es un banco ni un socio. Te explicamos qué es, qué busca, qué espera a cambio y cómo conectar con uno para tu negocio en Colombia.',
  keywords: ['angel investor Colombia','como encontrar inversionista Colombia','que es un angel inversionista','angel investor Medellin','inversionista para negocio Colombia'],
}
const s = {
  page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff' },
  wrap: { maxWidth: '720px', margin: '0 auto', padding: '5rem 1.5rem' },
  h1: { fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '1rem', lineHeight: '1.2' },
  meta: { fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '2.5rem' },
  p: { fontSize: '1rem', color: '#C8D4E8', lineHeight: '1.8', marginBottom: '1.25rem' },
  h2: { fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: '2.5rem 0 1rem', letterSpacing: '-0.02em' },
  callout: { background: 'rgba(232,160,32,0.06)', border: '1px solid rgba(232,160,32,0.2)', borderRadius: '12px', padding: '1.25rem 1.5rem', margin: '2rem 0' },
  btn: { display: 'inline-block', background: '#E8A020', color: '#fff', padding: '0.75rem 1.75rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', marginTop: '2rem' },
}
export default function Page() {
  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#E8A020', marginBottom: '0.75rem' }}>Blog · Inversión</div>
        <h1 style={s.h1}>Que es un angel investor y como puede financiar tu negocio en Colombia</h1>
        <div style={s.meta}>Escala · Julio 2026 · 6 min de lectura</div>
        <p style={s.p}>Un ángel inversionista es una persona que pone capital en un negocio a cambio de una participación, un retorno o un acuerdo específico. No es un banco — no cobra cuota mensual fija. No es un socio mayoritario — no toma decisiones operativas. Es alguien que apuesta por el negocio y espera recuperar su inversión más un retorno razonable.</p>
        <p style={s.p}>En Colombia, el modelo de ángel inversionista ha estado históricamente reservado para startups tecnológicas. Escala lo abre a cualquier negocio real: una confeccionista, una cocinera, alguien que quiere abrir una tienda en un local.</p>
        <h2 style={s.h2}>Que espera un angel a cambio</h2>
        <p style={s.p}>Depende del tipo de inversión. Para startups, el ángel espera participación en la empresa — un porcentaje de las acciones que vale más cuando la empresa crece. Para locales comerciales o maquinaria, el ángel espera recuperar su capital más un retorno, pagado desde los ingresos del negocio.</p>
        <p style={s.p}>Lo que el ángel no quiere es gestionar el negocio. Quiere que tú lo hagas bien y que el dinero regrese.</p>
        <div style={s.callout}>
          <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#E8A020', marginBottom: '0.75rem' }}>Tres modelos de retorno para el angel en Escala</div>
          <p style={{ ...s.p, marginBottom: '0.5rem' }}><strong style={{color:'#fff'}}>Participación diferida:</strong> el ángel invierte en una startup y recibe % de las acciones. Cobra cuando la empresa vende, distribuye dividendos o cierra.</p>
          <p style={{ ...s.p, marginBottom: '0.5rem' }}><strong style={{color:'#fff'}}>Financiamiento de local:</strong> el ángel financia el arriendo del local y recupera su capital más el retorno acordado desde las ventas diarias del operador.</p>
          <p style={{ ...s.p, marginBottom: 0 }}><strong style={{color:'#fff'}}>Leasing de maquinaria:</strong> el ángel compra la máquina y recupera su inversión desde el excedente mensual que genera el equipo.</p>
        </div>
        <h2 style={s.h2}>Como conectar con un angel en Colombia</h2>
        <p style={s.p}>Las redes tradicionales de ángeles en Colombia (Inversionistas Ángeles de Colombia, Bavaria, redes universitarias) se enfocan en startups con proyección de crecimiento exponencial. Si tienes un negocio de confección, un local o un taller, esas redes no son para ti.</p>
        <p style={s.p}>Escala tiene una red de ángeles que invierten específicamente en negocios de este tipo — maquinaria, locales, equipos productivos. La plataforma conecta al ángel con el emprendedor y administra el proceso.</p>
        <Link href="/directorio-inversion" style={s.btn}>Ver oportunidades de inversion →</Link>
      </div>
    </div>
  )
}
