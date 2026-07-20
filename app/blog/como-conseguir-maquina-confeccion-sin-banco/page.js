import Link from 'next/link'
export const metadata = {
  title: 'Como conseguir una maquina de confeccion sin banco ni codeudor — Escala Blog',
  description: 'Si el banco te rechazó o no tienes historial crediticio, hay una forma real de conseguir tu máquina overlock, plana o fileteadora. Te explicamos cómo funciona.',
  keywords: ['maquina confeccion sin banco','maquina de coser industrial sin credito','como conseguir overlock sin historial','financiar maquina confeccion Colombia','maquina coser sin codeudor Medellin'],
}
const s = {
  page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff' },
  wrap: { maxWidth: '720px', margin: '0 auto', padding: '5rem 1.5rem' },
  h1: { fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '1rem', lineHeight: '1.2' },
  meta: { fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '2.5rem' },
  p: { fontSize: '1rem', color: '#C8D4E8', lineHeight: '1.8', marginBottom: '1.25rem' },
  h2: { fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: '2.5rem 0 1rem', letterSpacing: '-0.02em' },
  callout: { background: 'rgba(175,169,236,0.08)', border: '1px solid rgba(175,169,236,0.25)', borderRadius: '12px', padding: '1.25rem 1.5rem', margin: '2rem 0' },
  btn: { display: 'inline-block', background: '#AFA9EC', color: '#2D2866', padding: '0.75rem 1.75rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', marginTop: '2rem' },
}
export default function Page() {
  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#AFA9EC', marginBottom: '0.75rem' }}>Blog · Maquinaria y equipos</div>
        <h1 style={s.h1}>Como conseguir tu maquina de confeccion sin banco ni codeudor</h1>
        <div style={s.meta}>Escala · Julio 2026 · 5 min de lectura</div>
        <p style={s.p}>Tienes los pedidos. Sabes trabajar. Pero la overlock que necesitas cuesta $8 millones y el banco te dice que no porque no tienes historial crediticio, porque trabajas informal o porque no tienes codeudor. Es la trampa más común en el sector de confección en Colombia.</p>
        <p style={s.p}>La buena noticia es que hay una alternativa real que no depende de Datacrédito ni de quién te firme.</p>
        <h2 style={s.h2}>Por qué el banco te rechaza</h2>
        <p style={s.p}>Los bancos evalúan el pasado: si tienes historial, si tienes empleo formal, si tienes garantías. Una confeccionista que trabaja desde casa como taller satélite para marcas no cumple ninguno de esos criterios, aunque tenga clientes fijos y pedidos reales todos los meses.</p>
        <p style={s.p}>El sistema financiero tradicional no está diseñado para evaluar lo que realmente importa: que el negocio ya funciona y que la máquina va a generar el dinero para pagarla.</p>
        <h2 style={s.h2}>El modelo que funciona para confeccionistas</h2>
        <p style={s.p}>En lugar de pedir un crédito, hay un modelo donde un ángel inversionista compra la máquina y queda como propietario. Tú la usas desde el primer día y pagas al ángel desde el excedente que genera la misma máquina. No hay cuota fija. No hay interés bancario. No hay codeudor.</p>
        <div style={s.callout}>
          <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#AFA9EC', marginBottom: '0.75rem' }}>Ejemplo real</div>
          <p style={{ ...s.p, marginBottom: '0.5rem' }}>Lorena tiene pedidos para 180 unidades por mes pero su máquina plana solo da para 90. Necesita una overlock que cuesta $8.500.000.</p>
          <p style={{ ...s.p, marginBottom: '0.5rem' }}>Un ángel la compra. Lorena la usa. Del excedente adicional que genera la máquina nueva — alrededor de $1.000.000 por mes — el 80% va al ángel como abono. En menos de 11 meses la máquina es de Lorena.</p>
          <p style={{ ...s.p, marginBottom: 0 }}>Sin banco. Sin historial. Sin codeudor.</p>
        </div>
        <h2 style={s.h2}>Qué necesitas para aplicar</h2>
        <p style={s.p}>No se evalúa Datacrédito. Se evalúa que tengas pedidos reales, que sepas operar la máquina y que puedas reportar tus ventas mensualmente en la plataforma. Eso es todo.</p>
        <p style={s.p}>Las máquinas que se financian incluyen planas industriales (Juki, Jack, Brother), overlock y fileteadoras (Pegasus, Juki), máquinas para ropa interior y vestidos de baño (Kansai, Rimoldi), cortadoras y bordadoras industriales.</p>
        <h2 style={s.h2}>Como funciona el programa Las 10 Maquinas</h2>
        <p style={s.p}>Escala tiene un programa activo para confeccionistas de Medellín y el Valle de Aburrá. Se seleccionan las 10 mejores proyectos entre cientos de aplicantes. Las ganadoras reciben su máquina y pagan desde el excedente mensual que genera.</p>
        <Link href="/maquinaria-confeccion-medellin" style={s.btn}>Ver el programa →</Link>
      </div>
    </div>
  )
}
