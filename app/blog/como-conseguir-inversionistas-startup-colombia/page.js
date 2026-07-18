import Link from 'next/link'
export const metadata = {
  title: 'Como conseguir inversionistas para tu startup en Colombia — Escala Blog',
  description: 'Guia practica para atraer inversores angel a tu startup colombiana. Que buscan, como presentarles, cuanto piden y como negociar los terminos.',
  keywords: ['como conseguir inversionistas startup colombia', 'angel investor colombia', 'conseguir inversion startup', 'pitch inversores colombia', 'como atraer inversores colombia'],
}
const s = {
  page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff' },
  wrap: { maxWidth: '720px', margin: '0 auto', padding: '5rem 1.5rem' },
  h1: { fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '1rem', lineHeight: '1.2' },
  meta: { fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '2.5rem' },
  p: { fontSize: '1rem', color: '#C8D4E8', lineHeight: '1.8', marginBottom: '1.25rem' },
  h2: { fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: '2.5rem 0 1rem', letterSpacing: '-0.02em' },
  btn: { display: 'inline-block', background: '#1D9E75', color: '#fff', padding: '0.75rem 1.75rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', marginTop: '2rem' },
}
export default function Page() {
  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '0.75rem' }}>Blog · Inversores</div>
        <h1 style={s.h1}>Como conseguir inversionistas para tu startup en Colombia</h1>
        <div style={s.meta}>Escala · Julio 2026 · 6 min de lectura</div>
        <p style={s.p}>Conseguir un inversor angel en Colombia no requiere conocer a alguien del ecosistema tech de Bogota. Requiere tener algo concreto que mostrar y saber donde buscar.</p>
        <h2 style={s.h2}>Que busca un angel inversionista</h2>
        <p style={s.p}>Los angeles no invierten en ideas — invierten en equipos y en traccion. Quieren ver que hay personas comprometidas con el proyecto y que hay algun indicador de que funciona: usuarios, ventas, contratos, proyecciones.</p>
        <p style={s.p}>En el modelo de Escala, los angeles invierten por item especifico: no en el proyecto completo, sino en el servidor, la maquina o el capital de trabajo que el proyecto necesita. Esto reduce su riesgo y facilita la decision.</p>
        <h2 style={s.h2}>Como presentar tu proyecto</h2>
        <p style={s.p}>Lo mas importante es la claridad. Un angel necesita entender en 2 minutos: que hace el negocio, quien lo esta haciendo, cuanto necesita y a cambio de que. No necesitas una presentacion de 30 slides.</p>
        <h2 style={s.h2}>Donde encontrar inversores en Colombia</h2>
        <p style={s.p}>El directorio de inversion de Escala es uno de los puntos de acceso mas directos. Tambien hay redes como Bavaria Lab, Ventures, y eventos como Colombia 4.0 y Talent Land Colombia.</p>
        <h2 style={s.h2}>Como negociar los terminos</h2>
        <p style={s.p}>Los tres modelos mas comunes son participacion en el negocio, deuda con tasa mensual y revenue share. Cada uno tiene ventajas segun el tipo de negocio y la etapa. Escala muestra los tres con ejemplos concretos para que el emprendedor entienda que esta dando a cambio.</p>
        <Link href="/directorio-inversion" style={s.btn}>Ver inversores en Escala →</Link>
      </div>
    </div>
  )
}
