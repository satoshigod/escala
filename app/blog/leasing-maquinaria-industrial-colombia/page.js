import Link from 'next/link'
export const metadata = {
  title: 'Que es el leasing de maquinaria industrial en Colombia y como funciona — Escala Blog',
  description: 'El leasing tradicional te amarra a una cuota fija mensual por años. El modelo de Escala funciona diferente: pagas desde el excedente que genera la misma máquina.',
  keywords: ['leasing maquinaria industrial Colombia','leasing sin banco Colombia','como financiar maquinaria sin credito','leasing desde excedente','alternativa leasing confeccion'],
}
const s = {
  page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff' },
  wrap: { maxWidth: '720px', margin: '0 auto', padding: '5rem 1.5rem' },
  h1: { fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '1rem', lineHeight: '1.2' },
  meta: { fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '2.5rem' },
  p: { fontSize: '1rem', color: '#C8D4E8', lineHeight: '1.8', marginBottom: '1.25rem' },
  h2: { fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: '2.5rem 0 1rem', letterSpacing: '-0.02em' },
  tabla: { width: '100%', borderCollapse: 'collapse', margin: '1.5rem 0', fontSize: '0.88rem' },
  th: { background: 'rgba(255,255,255,0.08)', padding: '0.75rem 1rem', textAlign: 'left', color: '#fff', fontWeight: '700', border: '1px solid rgba(255,255,255,0.1)' },
  td: { padding: '0.75rem 1rem', color: '#C8D4E8', border: '1px solid rgba(255,255,255,0.07)' },
  btn: { display: 'inline-block', background: '#AFA9EC', color: '#2D2866', padding: '0.75rem 1.75rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', marginTop: '2rem' },
}
export default function Page() {
  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#AFA9EC', marginBottom: '0.75rem' }}>Blog · Maquinaria y equipos</div>
        <h1 style={s.h1}>Leasing de maquinaria en Colombia: la diferencia entre el modelo bancario y el modelo Escala</h1>
        <div style={s.meta}>Escala · Julio 2026 · 6 min de lectura</div>
        <p style={s.p}>Cuando buscas financiar una máquina industrial en Colombia, la mayoría de opciones te llevan al mismo lugar: un banco o una financiera que te cobra una cuota fija mensual durante 24 o 36 meses, independiente de cuánto produzcas ese mes. Si el negocio va mal un mes, la cuota sigue igual.</p>
        <p style={s.p}>Hay un modelo diferente donde el pago sale directamente del excedente que genera la máquina. Si produces más, pagas más rápido. Si un mes va mal, el abono es menor.</p>
        <h2 style={s.h2}>Leasing bancario vs leasing desde el excedente</h2>
        <table style={s.tabla}>
          <thead>
            <tr>
              <th style={s.th}>Aspecto</th>
              <th style={s.th}>Leasing bancario</th>
              <th style={s.th}>Modelo Escala</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Quién evalúa','Historial Datacrédito','Pedidos reales actuales'],
              ['Cuota','Fija mensual','% del excedente real'],
              ['Si no produces','Cuota igual','Abono menor ese mes'],
              ['Codeudor','Generalmente sí','No'],
              ['Tiempo para pagar','24-36 meses fijos','Depende de tu producción'],
              ['Quien es dueño','Banco hasta el final','Angel inversionista'],
              ['Al terminar','La máquina es tuya','La máquina es tuya'],
            ].map(([a,b,c],i) => (
              <tr key={i} style={{ background: i%2===0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                <td style={s.td}><strong style={{color:'#fff'}}>{a}</strong></td>
                <td style={s.td}>{b}</td>
                <td style={{...s.td,color:'#AFA9EC'}}>{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2 style={s.h2}>Como funciona el excedente</h2>
        <p style={s.p}>El excedente es lo que te queda después de restar los costos de producción y los gastos fijos de tus ingresos del mes. No es lo que vendes — es la ganancia real.</p>
        <p style={s.p}>Del excedente mensual, un porcentaje acordado — típicamente entre el 60% y el 80% — va al ángel como abono al capital. El resto es tuyo. Si ese mes tuviste más pedidos, el abono es mayor y la máquina se paga más rápido. Si fue un mes flojo, el abono es menor y no te ahoga.</p>
        <h2 style={s.h2}>Para qué tipo de maquinaria aplica</h2>
        <p style={s.p}>El modelo funciona para cualquier equipo que genere ingresos desde el primer día de uso: máquinas de confección (planas, overlock, fileteadoras), equipos de cocina industrial (freidoras, hornos, amasadoras), equipos de belleza (sillas hidráulicas, secadoras, cabinas) y herramientas productivas en general.</p>
        <p style={s.p}>No aplica para equipos que no generan ingresos directos — el modelo requiere que la máquina misma produzca el dinero para pagarla.</p>
        <Link href="/maquinaria-confeccion-medellin" style={s.btn}>Ver programa de maquinaria →</Link>
      </div>
    </div>
  )
}
