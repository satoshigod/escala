import Link from 'next/link'
export const metadata = {
  title: 'Diferencia entre leasing y credito para comprar maquinaria en Colombia — Escala Blog',
  description: 'Crédito bancario, leasing financiero o modelo desde el excedente. Te explicamos cuándo usar cada uno y por qué el modelo de excedente gana para pequeños productores.',
  keywords: ['diferencia leasing credito maquinaria','leasing financiero Colombia','credito maquinaria vs leasing','como comprar maquinaria industrial Colombia','alternativas financiamiento maquinaria'],
}
const s = {
  page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff' },
  wrap: { maxWidth: '720px', margin: '0 auto', padding: '5rem 1.5rem' },
  h1: { fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '1rem', lineHeight: '1.2' },
  meta: { fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '2.5rem' },
  p: { fontSize: '1rem', color: '#C8D4E8', lineHeight: '1.8', marginBottom: '1.25rem' },
  h2: { fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: '2.5rem 0 1rem', letterSpacing: '-0.02em' },
  tabla: { width: '100%', borderCollapse: 'collapse', margin: '1.5rem 0', fontSize: '0.85rem' },
  th: { background: 'rgba(255,255,255,0.08)', padding: '0.75rem', textAlign: 'left', color: '#fff', fontWeight: '700', border: '1px solid rgba(255,255,255,0.1)' },
  td: { padding: '0.65rem 0.75rem', color: '#C8D4E8', border: '1px solid rgba(255,255,255,0.07)', verticalAlign: 'top' },
  btn: { display: 'inline-block', background: '#1D9E75', color: '#fff', padding: '0.75rem 1.75rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', marginTop: '2rem' },
}
export default function Page() {
  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '0.75rem' }}>Blog · Finanzas para negocios</div>
        <h1 style={s.h1}>Credito, leasing o modelo desde el excedente: cual conviene para comprar tu maquina</h1>
        <div style={s.meta}>Escala · Julio 2026 · 7 min de lectura</div>
        <p style={s.p}>Cuando necesitas una máquina industrial y no tienes el efectivo para comprarla, hay tres caminos principales. Cada uno funciona diferente y conviene en situaciones distintas.</p>
        <h2 style={s.h2}>Las tres opciones explicadas</h2>
        <p style={s.p}><strong style={{color:'#fff'}}>Crédito bancario:</strong> el banco te presta el dinero, tú compras la máquina y pagas cuotas fijas mensuales con interés. La máquina es tuya desde el primer día pero debes el capital más el interés pactado. Requiere historial crediticio, declaración de renta o certificación laboral.</p>
        <p style={s.p}><strong style={{color:'#fff'}}>Leasing financiero:</strong> una empresa financiera compra la máquina y te la arrienda durante un periodo. Al final puedes comprarla pagando el valor residual. Las cuotas son mensuales y fijas. También requiere historial y estados financieros.</p>
        <p style={s.p}><strong style={{color:'#fff'}}>Modelo desde el excedente (Escala):</strong> un ángel inversionista compra la máquina. Tú la usas y cada mes el porcentaje acordado de tu excedente real va al ángel. Si produces más, pagas más rápido. Sin historial crediticio, sin cuota fija, sin codeudor.</p>
        <h2 style={s.h2}>Comparacion directa</h2>
        <table style={s.tabla}>
          <thead>
            <tr>
              <th style={s.th}>Criterio</th>
              <th style={s.th}>Crédito banco</th>
              <th style={s.th}>Leasing financiero</th>
              <th style={{...s.th,color:'#AFA9EC'}}>Modelo Escala</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Requiere historial','Sí','Sí','No'],
              ['Cuota fija','Sí','Sí','No — % del excedente'],
              ['Si el negocio va mal','Cuota igual','Cuota igual','Abono menor ese mes'],
              ['Codeudor','Generalmente','A veces','No'],
              ['Tiempo para aprobar','2-4 semanas','1-3 semanas','3-7 días'],
              ['Acceso informal','No','No','Sí'],
            ].map(([a,b,c,d],i) => (
              <tr key={i} style={{background: i%2===0?'transparent':'rgba(255,255,255,0.02)'}}>
                <td style={{...s.td,color:'#fff',fontWeight:'600'}}>{a}</td>
                <td style={s.td}>{b}</td>
                <td style={s.td}>{c}</td>
                <td style={{...s.td,color:'#AFA9EC'}}>{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2 style={s.h2}>Cuando conviene cada uno</h2>
        <p style={s.p}>El crédito bancario conviene si tienes buen historial, ingresos formales y quieres ser dueño de la máquina desde el primer día. Las tasas pueden ser más bajas que el leasing.</p>
        <p style={s.p}>El leasing financiero conviene si eres empresa formal con estados financieros y quieres deducir los cánones de renta. El valor residual al final puede ser bajo.</p>
        <p style={s.p}>El modelo desde el excedente conviene si trabajas informal, no tienes historial crediticio, o si el negocio tiene variación mensual y una cuota fija sería un riesgo. Es también el más rápido de gestionar.</p>
        <Link href="/maquinaria-confeccion-medellin" style={s.btn}>Ver el programa de maquinaria →</Link>
      </div>
    </div>
  )
}
