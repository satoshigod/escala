import LandingIntermedia from '../components/LandingIntermedia'

export const metadata = {
  title: 'Tengo un problema que resolver — Encuentra la solución · Escala',
  description: 'Tu negocio o empresa ya funciona pero algo lo frena. En Escala encuentras al especialista o la solución que necesitas para resolverlo, sin pagar por adelantado.',
  keywords: ['resolver problema empresa', 'consultoria sin capital', 'especialista para mi negocio', 'mejorar productividad negocio'],
}

export default function Page() {
  return (
    <LandingIntermedia
      accent="#D946EF"
      eyebrow="Resolver un problema · Escala"
      emoji="🧩"
      h1="Tu negocio ya funciona. Resolvamos lo que lo frena."
      sub="A veces no falta capital ni equipo — falta resolver algo específico. Un proceso que no fluye, un área que no rinde, una decisión que no sabes tomar. En Escala encuentras al especialista correcto para resolverlo."
      beneficios={[
        { icon: '🔍', titulo: 'El especialista correcto', texto: 'No un consultor genérico. Alguien con experiencia real en el problema específico que tienes.' },
        { icon: '📈', titulo: 'Pago por resultado', texto: 'Muchos especialistas trabajan por participación en la mejora que generan, no por una factura fija.' },
        { icon: '⭐', titulo: 'Reputación verificada', texto: 'Ves el historial real de cada especialista antes de decidir. Sin sorpresas.' },
        { icon: '⚡', titulo: 'Rápido y directo', texto: 'Describes el problema, recibes propuestas, eliges. Sin procesos eternos de contratación.' },
      ]}
      pasos={[
        { n: '1', titulo: 'Describe el problema', texto: 'Cuentas qué está frenando tu negocio o empresa. Entre más claro, mejores propuestas recibes.' },
        { n: '2', titulo: 'Recibe propuestas', texto: 'Los especialistas que pueden resolverlo se postulan con su enfoque y experiencia.' },
        { n: '3', titulo: 'Elige con quién trabajar', texto: 'Comparas perfiles, reputación y propuestas. Decides quién ataca el problema.' },
        { n: '4', titulo: 'Resuélvelo', texto: 'El especialista trabaja contigo desde la plataforma. Acuerdan cómo se compensa el resultado.' },
      ]}
      ctaPrincipal={{ texto: 'Crear cuenta y describir mi problema →', href: '/registro?intent=resolver' }}
      ctaSecundario={{ texto: 'Ver el directorio de especialistas', href: '/directorio' }}
      nota="La solución que buscas existe"
    />
  )
}
