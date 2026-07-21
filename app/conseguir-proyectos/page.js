import LandingIntermedia from '../components/LandingIntermedia'

export const metadata = {
  title: 'Quiero conseguir proyectos y clientes — Ofrece tu talento · Escala',
  description: 'Muestra lo que sabes hacer y postúlate a proyectos reales. Gana participación por tu trabajo. Para desarrolladores, diseñadores, contadores, abogados y más.',
  keywords: ['conseguir proyectos freelance Colombia', 'trabajar por participacion', 'proyectos para especialistas', 'vender servicios profesionales'],
}

export default function Page() {
  return (
    <LandingIntermedia
      accent="#E8A020"
      eyebrow="Conseguir proyectos · Escala"
      emoji="🎯"
      h1="Pon lo que sabes a trabajar en proyectos reales."
      sub="¿Eres desarrollador, diseñador, contador, abogado o tienes un oficio? En Escala te postulas a proyectos de fundadores que necesitan tu talento y ganas participación por tu trabajo — sin dejar lo que ya haces."
      beneficios={[
        { icon: '🚀', titulo: 'Proyectos con futuro', texto: 'Trabaja en negocios y empresas en crecimiento. Tu participación puede valer mucho más adelante.' },
        { icon: '⏰', titulo: 'A tu ritmo', texto: 'Dedica las horas que puedas sin renunciar a tu empleo o a tus otros clientes. Tú decides.' },
        { icon: '⭐', titulo: 'Construye tu reputación', texto: 'Cada proyecto suma a tu score en la plataforma. Mejor historial, mejores oportunidades.' },
        { icon: '📝', titulo: 'Todo con contrato', texto: 'Tu participación queda protegida por un contrato con validez legal desde el primer día.' },
      ]}
      pasos={[
        { n: '1', titulo: 'Crea tu perfil', texto: 'Muestra qué sabes hacer, tu experiencia y los tipos de proyecto que te interesan.' },
        { n: '2', titulo: 'Explora proyectos', texto: 'Ves los proyectos que buscan tu especialidad. Elige los que te interesan.' },
        { n: '3', titulo: 'Postúlate', texto: 'Aplicas al rol. El fundador ve tu perfil y tu reputación, y decide.' },
        { n: '4', titulo: 'Trabaja y gana participación', texto: 'Cada tarea que entregas queda registrada. Cobras cuando el proyecto genera.' },
      ]}
      ctaPrincipal={{ texto: 'Crear mi perfil de especialista →', href: '/registro?intent=proyectos' }}
      ctaSecundario={{ texto: 'Ver proyectos activos', href: '/proyectos' }}
      nota="Tu talento tiene dónde crecer"
    />
  )
}
