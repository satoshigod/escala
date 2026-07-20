import Link from 'next/link'
export const metadata = {
  title: 'Como ganar mas dinero con tu taller de confeccion en Medellin — Escala Blog',
  description: 'Guía práctica para confeccionistas de Medellín que quieren aumentar sus ingresos: más capacidad de producción, mejores clientes, y cómo financiar el equipo que necesitas.',
  keywords: ['ganar dinero confeccion Medellin','aumentar produccion confeccion','taller confeccion Medellin','como vender mas confeccion Colombia','crecer taller costura Medellin'],
}
const s = {
  page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff' },
  wrap: { maxWidth: '720px', margin: '0 auto', padding: '5rem 1.5rem' },
  h1: { fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '1rem', lineHeight: '1.2' },
  meta: { fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '2.5rem' },
  p: { fontSize: '1rem', color: '#C8D4E8', lineHeight: '1.8', marginBottom: '1.25rem' },
  h2: { fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: '2.5rem 0 1rem', letterSpacing: '-0.02em' },
  paso: { display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.25rem' },
  num: { width: '28px', height: '28px', borderRadius: '50%', background: '#1D9E75', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', flexShrink: 0, marginTop: '2px' },
  btn: { display: 'inline-block', background: '#1D9E75', color: '#fff', padding: '0.75rem 1.75rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', marginTop: '2rem' },
}
export default function Page() {
  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '0.75rem' }}>Blog · Confección · Medellín</div>
        <h1 style={s.h1}>Como ganar mas dinero con tu taller de confeccion en Medellin</h1>
        <div style={s.meta}>Escala · Julio 2026 · 7 min de lectura</div>
        <p style={s.p}>Medellín es la capital de la confección en Colombia. Hay miles de talleres satélite — confeccionistas que trabajan desde casa para marcas, talleres grandes y exportadoras. La mayoría tiene el conocimiento y los clientes. Lo que les falta es capacidad.</p>
        <p style={s.p}>Aquí van cinco formas reales de aumentar tus ingresos como confeccionista en Medellín, desde lo más básico hasta lo más estratégico.</p>
        <h2 style={s.h2}>Cinco pasos para ganar mas</h2>
        {[
          { t:'Calcula cuanto dejas de ganar por falta de capacidad', d:'Si tienes pedidos que rechazas o no puedes cumplir, ese es dinero que ya existe pero no puedes cobrar. Cuantifícalo: ¿cuántas unidades más podrías producir con otra máquina? ¿Cuánto vale cada unidad? Ese es el primer número que necesitas.' },
          { t:'Especialízate en un producto de mayor margen', d:'Ropa interior femenina, vestidos de baño y ropa deportiva tienen márgenes más altos que ropa básica. Si tu maquinaria te lo permite, moverse a estos segmentos puede duplicar tu ingreso con el mismo tiempo de trabajo.' },
          { t:'Trabaja directamente con marcas, no solo con talleres intermediarios', d:'Los talleres que te mandan maquila te pagan menos de lo que pagaría la marca directamente. Busca marcas medianas de Medellín que tercerizan producción — hay muchas en el sector de Guayabal e Itagüí.' },
          { t:'Consigue el equipo que amplía lo que puedes ofrecer', d:'Una máquina overlock te permite hacer acabados que una plana sola no puede. Una Kansai te permite hacer pretinas que muchos talleres no hacen. Cada máquina nueva no solo aumenta la cantidad — puede abrir servicios nuevos.' },
          { t:'Financia el equipo desde el excedente que genera', d:'Si la máquina nueva genera $1.000.000 adicionales por mes, el pago del equipo sale de ahí — no del bolsillo. Ese es el modelo de Escala para confeccionistas en Medellín.' },
        ].map((p,i) => (
          <div key={i} style={s.paso}>
            <div style={s.num}>{i+1}</div>
            <div>
              <p style={{...s.p,fontWeight:'700',color:'#fff',marginBottom:'0.25rem'}}>{p.t}</p>
              <p style={{...s.p,marginBottom:0}}>{p.d}</p>
            </div>
          </div>
        ))}
        <Link href="/maquinaria-confeccion-medellin" style={s.btn}>Ver programa de maquinaria Medellin →</Link>
      </div>
    </div>
  )
}
