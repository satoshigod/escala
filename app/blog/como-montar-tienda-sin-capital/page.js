import Link from 'next/link'
export const metadata = {
  title: 'Como montar una tienda sin capital en Colombia — Escala Blog',
  description: 'Guia paso a paso para abrir una tienda, restaurante o negocio de venta sin tener el capital inicial. Modelo de fondeo desde ventas diarias con Escala.',
  keywords: ['como montar tienda sin capital', 'abrir negocio sin dinero colombia', 'financiar local comercial colombia', 'montar restaurante sin capital', 'abrir tienda sin banco'],
}
const s = {
  page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff' },
  wrap: { maxWidth: '720px', margin: '0 auto', padding: '5rem 1.5rem' },
  h1: { fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '1rem', lineHeight: '1.2' },
  meta: { fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '2.5rem' },
  p: { fontSize: '1rem', color: '#C8D4E8', lineHeight: '1.8', marginBottom: '1.25rem' },
  h2: { fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: '2.5rem 0 1rem', letterSpacing: '-0.02em' },
  btn: { display: 'inline-block', background: '#1D9E75', color: '#fff', padding: '0.75rem 1.75rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', marginTop: '2rem' },
  paso: { display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.25rem' },
  num: { width: '28px', height: '28px', borderRadius: '50%', background: '#E8A020', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', flexShrink: 0, marginTop: '2px' },
}
export default function Page() {
  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#E8A020', marginBottom: '0.75rem' }}>Blog · Negocios locales</div>
        <h1 style={s.h1}>Como montar tu tienda o negocio sin tener el capital</h1>
        <div style={s.meta}>Escala · Julio 2026 · 6 min de lectura</div>
        <p style={s.p}>El mayor obstaculo para abrir una tienda en Colombia no es la idea ni el conocimiento — es el deposito del local, los primeros meses de arriendo y el inventario inicial. Ese capital inicial es el que frena a la mayoria.</p>
        <p style={s.p}>Escala tiene un modelo especifico para este caso: un inversionista pone el capital del arriendo y tu lo pagas desde las ventas diarias del negocio.</p>
        <h2 style={s.h2}>Como funciona el modelo de fondeo desde ventas</h2>
        {[
          { n:'1', t:'Describes el negocio y el local', d:'Que vas a vender, en que ciudad, cuanto vale el arriendo mensual y cuantos meses de deposito pide el propietario.' },
          { n:'2', t:'Un inversionista pone el capital', d:'El inversionista financia el deposito, el primer mes de arriendo y las adecuaciones necesarias. Ese capital queda registrado como deuda con el inversionista.' },
          { n:'3', t:'Abres el negocio y reportas ventas', d:'Cada dia que tienes ventas, reportas el total en Escala. El sistema calcula automaticamente cuanto le corresponde al inversionista ese dia.' },
          { n:'4', t:'Pagas desde lo que vendes', d:'Del excedente diario (ventas menos costos) se pagan primero los intereses del dia y luego se abona al capital. Cuando terminas de pagar, el negocio es completamente tuyo.' },
        ].map(p => (
          <div key={p.n} style={s.paso}>
            <div style={s.num}>{p.n}</div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.3rem' }}>{p.t}</div>
              <div style={{ fontSize: '0.85rem', color: '#8FA3CC', lineHeight: '1.6' }}>{p.d}</div>
            </div>
          </div>
        ))}
        <h2 style={s.h2}>Que tipo de negocios funcionan con este modelo</h2>
        <p style={s.p}>Tiendas de ropa, restaurantes, fruterias, almacenes de calzado, negocios de belleza, miscelaneas, panaderias y cualquier negocio de venta de productos o servicios que tenga ingresos diarios constantes.</p>
        <h2 style={s.h2}>Lo que necesitas para aplicar</h2>
        <p style={s.p}>El local identificado (aunque no este firmado), claridad de que vas a vender, proyeccion honesta de cuanto esperas vender al dia y disposicion de reportar ventas diariamente a traves de la plataforma.</p>
        <Link href="/financiar-negocio-local-colombia" style={s.btn}>Ver como funciona el fondeo de local →</Link>
      </div>
    </div>
  )
}
