// app/blog/historia-de-escala/page.js
export const metadata = {
  title: 'La Historia de Escala — Cómo Construimos el Sistema Operativo para Crear Empresas',
  description: 'De la idea a la plataforma. Cómo Ivan Correa empezó a construir Escala desde Medellín, qué problemas intentamos resolver, y qué hemos aprendido construyendo en producción.',
  keywords: ['historia escala network', 'escala startup colombia', 'ivan correa escala', 'participacion diferida colombia', 'crear empresa colaborativa'],
  openGraph: { title: 'La Historia de Escala', description: 'Cómo nació el sistema operativo para crear empresas colaborativas en Latinoamérica.', url: 'https://escala.network/blog/historia-de-escala', images: [{ url: 'https://escala.network/brand/og-default.png?v=3', width: 1200, height: 630 }] },
  alternates: { canonical: 'https://escala.network/blog/historia-de-escala' },
}

const s = {
  page: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter,sans-serif', color: '#fff' },
  nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  article: { maxWidth: '720px', margin: '0 auto', padding: '4rem 1.5rem' },
  h1: { fontSize: 'clamp(1.75rem,4vw,2.75rem)', fontWeight: '900', lineHeight: '1.15', letterSpacing: '-0.03em', color: '#fff', marginBottom: '1.5rem' },
  h2: { fontSize: '1.4rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em', margin: '2.5rem 0 1rem' },
  p: { fontSize: '1rem', color: '#C8D4E8', lineHeight: '1.85', marginBottom: '1.25rem' },
  highlight: { background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '12px', padding: '1.25rem 1.5rem', margin: '2rem 0', fontSize: '1rem', color: '#C8D4E8', lineHeight: '1.7', fontStyle: 'italic' },
  stat: { display: 'inline-block', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '0.5rem 1rem', margin: '0.25rem', fontSize: '0.85rem', color: '#fff', fontWeight: '600' },
}

export default function HistoriaEscalaPage() {
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <a href="/" style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', textDecoration: 'none' }}>Esca<span style={{ color: '#1D9E75' }}>la</span></a>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/blog" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>← Blog</a>
          <a href="/registro" style={{ background: '#1D9E75', color: '#fff', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>Crear cuenta</a>
        </div>
      </nav>

      <article style={s.article}>
        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: '700', background: '#1D9E75', color: '#fff', padding: '3px 10px', borderRadius: '20px' }}>Sobre Escala</span>
          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Julio 2026 · 8 min de lectura</span>
        </div>

        <h1 style={s.h1}>La historia de Escala: cómo construimos el sistema operativo para crear empresas</h1>

        <div style={s.highlight}>
          "¿Qué pasaría si el talento y el capital pudieran encontrarse en un solo lugar, con reglas claras y sin intermediarios?" — Esa pregunta fue el punto de partida.
        </div>

        <h2 style={s.h2}>El problema que vimos</h2>
        <p style={s.p}>En Colombia y en toda Latinoamérica hay miles de personas con ideas de negocio reales, con ganas de construir, con conocimiento para ejecutar — y sin capital para pagar un equipo. Y al mismo tiempo hay contadores, abogados, desarrolladores y diseñadores con habilidades valiosas buscando proyectos con sentido donde aportar, más allá de la relación empleado-empleador.</p>
        <p style={s.p}>El puente entre esos dos grupos no existía de forma estructurada. Había acuerdos informales entre amigos, handshakes sin respaldo legal, proyectos que morían porque alguien se fue o porque no había reglas claras sobre quién se lleva qué cuando la empresa gana dinero.</p>
        <p style={s.p}>Eso es lo que Escala intenta resolver.</p>

        <h2 style={s.h2}>La idea original</h2>
        <p style={s.p}>Ivan Correa, fundador de Escala, venía de trabajar en proyectos de tecnología en Colombia y España. La misma historia se repetía: proyectos prometedores que no despegaban porque el fundador no podía pagar el stack de especialistas que necesitaba desde el principio.</p>
        <p style={s.p}>La intuición era simple: si una empresa en etapa temprana no puede pagar salarios, ¿por qué no crear un sistema donde los especialistas trabajen por participación futura en vez de salario presente? No es una idea nueva en Silicon Valley — el equity compensation lleva décadas siendo un pilar de las startups norteamericanas. Pero en Latinoamérica no existía la infraestructura para hacer eso de forma ordenada, legal y transparente.</p>
        <p style={s.p}>Escala empezó como esa infraestructura.</p>

        <h2 style={s.h2}>Cómo se construyó</h2>
        <p style={s.p}>La plataforma se construyó en colaboración con Claude AI de Anthropic — un experimento real de construcción de producto asistida por inteligencia artificial. Desde el diseño de la base de datos hasta el sistema de contratos, desde el workspace de tareas hasta las landing pages que estás leyendo ahora, el desarrollo fue iterativo, en producción, con usuarios reales desde etapas muy tempranas.</p>
        <p style={s.p}>A julio de 2026, Escala tiene:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '1rem 0 1.5rem' }}>
          {[
            '30+ fases de desarrollo completadas',
            '7 países activos',
            '138 tareas por rol definidas',
            '8 roles × 27 segmentos',
            'Motor financiero multi-moneda (9 monedas)',
            'Sistema de contratos automáticos',
            'Workspace completo por proyecto',
            'Sistema de badges y Escala Score',
            'Notificaciones en tiempo real',
            'SEO en 10+ landing pages',
          ].map(item => <span key={item} style={s.stat}>{item}</span>)}
        </div>

        <h2 style={s.h2}>El modelo en la práctica</h2>
        <p style={s.p}>El primer proyecto piloto fue Escala misma. El fundador publicó el proyecto en la plataforma, definió los roles que necesitaba — Contador, Abogado, Gerente de Proyecto, Desarrollador Full-Stack, Diseñador, Community Manager — y empezó a recibir postulaciones.</p>
        <p style={s.p}>Juan Camilo Cañas, contador colombiano, fue uno de los primeros especialistas en aceptar un rol en el proyecto. Completó las 5 tareas de constitución del proyecto (NIT, libros contables, facturación electrónica, régimen tributario, cuenta bancaria) y su trabajo quedó documentado, verificado y registrado como aporte al proyecto.</p>
        <p style={s.p}>Ese flujo — postulación, aceptación, workspace de tareas, chat por tarea, documentación, verificación — es lo que Escala le ofrece a cualquier fundador en Colombia, México, Chile y el resto de la región.</p>

        <h2 style={s.h2}>Qué aprendimos</h2>
        <p style={s.p}>Construir en producción con usuarios reales desde el principio fue una decisión correcta. Cada bug, cada flujo roto, cada cosa que no funcionaba la descubrimos porque alguien real lo usó — no porque lo simulamos en un ambiente de pruebas.</p>
        <p style={s.p}>También aprendimos que el problema más difícil no es técnico. Es de comportamiento. Convencer a un contador de que trabajar por participación es un modelo válido y protegido requiere educación, confianza y demostración. Por eso el blog existe — para explicar el modelo, resolver dudas y generar la confianza que hace posible que un especialista diga "sí, entro".</p>
        <p style={s.p}>Y aprendimos que la legalidad importa. No como barrera sino como habilitador. Un contrato claro, generado automáticamente, que documenta exactamente qué aportó cada quien y qué le corresponde — eso es lo que convierte un acuerdo informal en una relación profesional sostenible.</p>

        <h2 style={s.h2}>Hacia dónde vamos</h2>
        <p style={s.p}>Escala está en etapa temprana. Hay mucho por construir — más países, más roles, más integraciones, más herramientas para los fundadores y los especialistas. La inteligencia artificial va a jugar un papel cada vez más importante en cómo conectamos el talento correcto con el proyecto correcto.</p>
        <p style={s.p}>Pero el núcleo del modelo no va a cambiar: el talento construye. El capital acelera. La participación queda registrada bajo reglas claras y verificables. Eso es Escala.</p>

        <div style={s.highlight}>
          Si tienes una idea y necesitas un equipo, o si eres un especialista que quiere trabajar en proyectos con sentido, Escala es para ti.
        </div>

        <div style={{ margin: '2.5rem 0', textAlign: 'center' }}>
          <a href="/registro" style={{ background: '#1D9E75', color: '#fff', padding: '1rem 2.5rem', borderRadius: '10px', textDecoration: 'none', fontSize: '1rem', fontWeight: '700', display: 'inline-block' }}>Unirme a Escala →</a>
        </div>

        {/* Artículos relacionados */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2.5rem', marginTop: '2.5rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#8FA3CC', marginBottom: '1.25rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Más artículos</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { href: '/blog/que-es-la-participacion-diferida', titulo: 'Qué es la participación diferida y cómo funciona en la práctica' },
              { href: '/blog/como-crear-una-startup-sin-dinero', titulo: 'Cómo crear una startup sin dinero en Latinoamérica' },
              { href: '/blog/como-constituir-una-empresa-sas-en-colombia', titulo: 'Cómo constituir una empresa SAS en Colombia paso a paso' },
            ].map(a => (
              <a key={a.href} href={a.href} style={{ fontSize: '0.88rem', color: '#4A90D9', textDecoration: 'none', lineHeight: '1.5' }}>{a.titulo} →</a>
            ))}
          </div>
        </div>
      </article>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>
          © 2026 Escala Network ·{' '}
          <a href="/blog" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Blog</a> ·{' '}
          <a href="/registro" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Registro</a>
        </div>
      </footer>
    </div>
  )
}
