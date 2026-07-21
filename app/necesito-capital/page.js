import LandingIntermedia from '../components/LandingIntermedia'

export const metadata = {
  title: 'Necesito capital para crecer — Financia tu negocio o empresa · Escala',
  description: 'Consigue capital para tu negocio o empresa sin banco. Un inversionista financia lo que necesitas y recupera desde el excedente que genera. Sin historial crediticio.',
  keywords: ['capital para negocio Colombia', 'financiar empresa sin banco', 'inversionistas para mi negocio', 'conseguir capital sin credito'],
}

export default function Page() {
  return (
    <LandingIntermedia
      accent="#1D9E75"
      eyebrow="Capital para crecer · Escala"
      emoji="💰"
      h1="Consigue el capital que tu negocio o empresa necesita."
      sub="Sin banco, sin historial crediticio, sin garante. En Escala publicas lo que necesitas financiar y un inversionista lo aporta — a cambio de participación o de un retorno desde lo que el negocio genera."
      beneficios={[
        { icon: '🏦', titulo: 'Sin banco ni historial', texto: 'No evaluamos tu Datacrédito. Evaluamos que tu negocio tenga demanda real y capacidad de generar.' },
        { icon: '📊', titulo: 'Pagas desde lo que generas', texto: 'El retorno del inversionista sale del excedente real de tu negocio — no de una cuota fija que te ahoga.' },
        { icon: '🤝', titulo: 'Inversionistas reales', texto: 'Personas que quieren poner su capital en negocios concretos, no un fondo anónimo con letra chica.' },
        { icon: '📝', titulo: 'Todo con contrato', texto: 'Las condiciones quedan firmadas con validez legal. Ambas partes saben exactamente qué se acordó.' },
      ]}
      pasos={[
        { n: '1', titulo: 'Publica lo que necesitas', texto: 'Cuentas cuánto capital necesitas, para qué, y cuánto genera o generará tu negocio o empresa.' },
        { n: '2', titulo: 'Un inversionista lo financia', texto: 'Los inversionistas de Escala ven tu proyecto y deciden financiarlo. Tú defines las condiciones de retorno.' },
        { n: '3', titulo: 'Recibes el capital', texto: 'El dinero se administra a través de la plataforma, con trazabilidad total de cada peso.' },
        { n: '4', titulo: 'Pagas desde el excedente', texto: 'A medida que tu negocio genera, el inversionista recupera. Sin cuota fija — desde lo que produces.' },
      ]}
      ctaPrincipal={{ texto: 'Crear cuenta y publicar →', href: '/registro?intent=capital' }}
      ctaSecundario={{ texto: '¿Cómo funciona Escala?', href: '/que-es-escala' }}
      nota="Tu negocio está listo para crecer"
    />
  )
}
