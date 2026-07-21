import LandingIntermedia from '../components/LandingIntermedia'

export const metadata = {
  title: 'Necesito contratar talento — Arma tu equipo sin pagar salarios · Escala',
  description: 'Encuentra al diseñador, contador, desarrollador o especialista que tu proyecto necesita. Trabajan por participación en lugar de salario. Construye tu equipo sin capital.',
  keywords: ['contratar talento sin capital', 'encontrar desarrollador startup', 'equipo por participacion Colombia', 'cofundador especialista'],
}

export default function Page() {
  return (
    <LandingIntermedia
      accent="#4A90D9"
      eyebrow="Contratar talento · Escala"
      emoji="🤝"
      h1="Arma tu equipo sin pagar salarios por adelantado."
      sub="¿Necesitas un diseñador, un contador, un desarrollador o un abogado pero no tienes cómo pagarles todavía? En Escala los especialistas trabajan por participación — cobran cuando tu proyecto genera."
      beneficios={[
        { icon: '💼', titulo: 'Especialistas de todo tipo', texto: 'Desarrolladores, diseñadores, contadores, abogados, marketers. El talento que tu proyecto necesita.' },
        { icon: '📈', titulo: 'Trabajan por participación', texto: 'En lugar de un salario que no puedes pagar, acuerdan una participación futura. Ganan cuando ganas.' },
        { icon: '⭐', titulo: 'Reputación verificada', texto: 'Cada especialista tiene un score basado en su historial real de trabajo en la plataforma.' },
        { icon: '📝', titulo: 'Contrato automático', texto: 'Cuando aceptas a alguien, el contrato de participación se genera solo, con validez legal.' },
      ]}
      pasos={[
        { n: '1', titulo: 'Publica tu proyecto', texto: 'Describe qué estás construyendo y qué roles necesitas — un diseñador, un dev, un contador.' },
        { n: '2', titulo: 'Recibe postulaciones', texto: 'Los especialistas interesados se postulan. Ves su perfil, su experiencia y su reputación.' },
        { n: '3', titulo: 'Acuerda la participación', texto: 'Defines con cada especialista cuánta participación recibe por su trabajo. Se firma el contrato.' },
        { n: '4', titulo: 'Construyan juntos', texto: 'El equipo trabaja desde el workspace de Escala. Cada tarea queda registrada y verificada.' },
      ]}
      ctaPrincipal={{ texto: 'Crear cuenta y publicar proyecto →', href: '/registro?intent=talento' }}
      ctaSecundario={{ texto: 'Ver el directorio de especialistas', href: '/directorio' }}
      nota="El talento que necesitas está aquí"
    />
  )
}
