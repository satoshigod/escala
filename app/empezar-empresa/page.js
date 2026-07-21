import LandingIntermedia from '../components/LandingIntermedia'

export const metadata = {
  title: 'Quiero empezar mi empresa desde cero — Sin capital inicial · Escala',
  description: 'Tienes la idea pero no el capital ni el equipo. En Escala armas tu equipo sin pagar salarios, consigues financiamiento y construyes tu empresa paso a paso.',
  keywords: ['empezar empresa sin dinero', 'crear startup sin capital Colombia', 'emprender desde cero', 'tengo una idea de negocio'],
}

export default function Page() {
  return (
    <LandingIntermedia
      accent="#AFA9EC"
      eyebrow="Empezar desde cero · Escala"
      emoji="💡"
      h1="Tienes la idea. Escala te da con qué construirla."
      sub="No necesitas capital ni un equipo contratado para empezar. En Escala publicas tu idea, atraes a los especialistas que la construyen contigo por participación, y consigues el financiamiento que necesitas en el camino."
      beneficios={[
        { icon: '👥', titulo: 'Equipo sin salarios', texto: 'Atrae desarrolladores, diseñadores y más que trabajan por participación en tu idea, no por sueldo.' },
        { icon: '💰', titulo: 'Financiamiento cuando lo necesites', texto: 'Cuando tu idea avanza, los inversionistas de Escala pueden financiar los siguientes pasos.' },
        { icon: '🧩', titulo: 'Todo en un solo lugar', texto: 'Constitución legal, contratos, equipo, capital y herramientas. No saltas entre diez plataformas.' },
        { icon: '📊', titulo: 'Reglas claras', texto: 'Cada aporte —tuyo o de tu equipo— queda registrado. Todos saben cuánto les corresponde.' },
      ]}
      pasos={[
        { n: '1', titulo: 'Publica tu idea', texto: 'Cuentas qué quieres construir y qué necesitas para lograrlo. No importa si aún no tienes nada.' },
        { n: '2', titulo: 'Arma tu equipo', texto: 'Los especialistas que creen en tu idea se suman por participación. Tú eliges con quién trabajar.' },
        { n: '3', titulo: 'Construyan el proyecto', texto: 'Desde el workspace de Escala coordinan el trabajo. Cada avance queda registrado.' },
        { n: '4', titulo: 'Consigue capital', texto: 'Cuando necesitas financiamiento para crecer, publicas lo que requieres y un inversionista lo aporta.' },
      ]}
      ctaPrincipal={{ texto: 'Crear cuenta y publicar mi idea →', href: '/registro?intent=crear' }}
      ctaSecundario={{ texto: '¿Cómo funciona Escala?', href: '/que-es-escala' }}
      nota="Tu idea está lista para arrancar"
    />
  )
}
