import Link from 'next/link'
export const metadata = {
  title: 'Como financiar equipos y maquinaria para tu negocio en Colombia — Escala Blog',
  description: 'Opciones reales para financiar maquinaria, equipos y activos para tu empresa en Colombia. Leasing, inversores angel, modelo Escala y alternativas al credito bancario.',
  keywords: ['financiar maquinaria colombia', 'como comprar equipos negocio', 'leasing maquinaria colombia', 'credito equipos empresa colombia', 'inversionista maquinaria negocio'],
}
const s = {
  page: { minHeight: '100vh', background: '#080F20', fontFamily: 'Inter,sans-serif', color: '#fff' },
  wrap: { maxWidth: '720px', margin: '0 auto', padding: '5rem 1.5rem' },
  h1: { fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '1rem', lineHeight: '1.2' },
  meta: { fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '2.5rem' },
  p: { fontSize: '1rem', color: '#C8D4E8', lineHeight: '1.8', marginBottom: '1.25rem' },
  h2: { fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: '2.5rem 0 1rem', letterSpacing: '-0.02em' },
  btn: { display: 'inline-block', background: '#4A90D9', color: '#fff', padding: '0.75rem 1.75rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '700', marginTop: '2rem' },
}
export default function Page() {
  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4A90D9', marginBottom: '0.75rem' }}>Blog · Maquinaria y equipos</div>
        <h1 style={s.h1}>Como financiar los equipos que tu negocio necesita sin credito bancario</h1>
        <div style={s.meta}>Escala · Julio 2026 · 5 min de lectura</div>
        <p style={s.p}>El horno cuesta $18 millones. El banco pide historial crediticio que no tienes. Los prestamistas cobran tasas del 5% mensual. Y el negocio no puede arrancar sin esa maquina.</p>
        <p style={s.p}>Este es el problema que Escala resuelve: conectar al emprendedor que necesita el equipo con el inversionista que tiene el capital para comprarlo.</p>
        <h2 style={s.h2}>Las opciones disponibles en Colombia</h2>
        <p style={s.p}><strong style={{ color: '#fff' }}>Leasing bancario:</strong> el banco compra el equipo y tu lo "arriendas" con opcion de compra. Requiere historial y garantias. Tasas entre 1.5% y 3% mensual.</p>
        <p style={s.p}><strong style={{ color: '#fff' }}>Credito de proveedor:</strong> algunos proveedores de maquinaria ofrecen credito directo. Util pero limitado a los equipos que ellos venden.</p>
        <p style={s.p}><strong style={{ color: '#fff' }}>Inversionista angel via Escala:</strong> un angel compra el equipo o transfiere el capital. Tu lo pagas desde los ingresos que ese equipo genera. Sin historial crediticio, sin garante.</p>
        <h2 style={s.h2}>El modelo de Escala para equipos</h2>
        <p style={s.p}>El emprendedor describe el equipo que necesita (nombre, precio, para que lo va a usar) y lo publica en el directorio. Los angeles del directorio ven la oportunidad y proponen financiarla a cambio de participacion, cuotas mensuales o porcentaje de ventas.</p>
        <p style={s.p}>Lo clave es que el inversionista financia ese equipo especifico — no el proyecto completo. Sabe exactamente que esta comprando y puede evaluar el retorno.</p>
        <h2 style={s.h2}>Que equipos se pueden financiar</h2>
        <p style={s.p}>Cualquier activo que genere ingresos: hornos industriales, maquinas de coser, neveras comerciales, vehiculos de trabajo, computadores, servidores, equipos de belleza, maquinaria agricola.</p>
        <Link href="/financiar-maquinaria-colombia" style={s.btn}>Financiar mi equipo con Escala →</Link>
      </div>
    </div>
  )
}
