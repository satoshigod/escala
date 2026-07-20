// app/blog/page.js
export const metadata = {
  title: 'Blog Escala — Emprendimiento, Startups y Empresas Colaborativas',
  description: 'Aprende cómo crear startups sin capital, constituir empresas en Colombia y Chile, conseguir cofundadores, y construir equipos por participación. El blog de Escala para emprendedores latinoamericanos.',
  keywords: ['blog emprendimiento colombia', 'crear startup latinoamerica', 'constituir empresa colombia', 'participacion diferida startup', 'blog escala network'],
  openGraph: { title: 'Blog Escala — Emprendimiento y Startups en Latinoamérica', description: 'Guías reales para emprendedores. Sin teoría vacía.', url: 'https://escala.network/blog', images: [{ url: 'https://escala.network/brand/og-default.png?v=3', width: 1200, height: 630 }] },
  alternates: { canonical: 'https://escala.network/blog' },
}

const ARTICULOS = [
  {
    slug: 'historia-de-escala',
    titulo: 'La historia de Escala: cómo construimos la plataforma para crear y hacer crecer negocios y empresas',
    descripcion: 'De la idea a la plataforma. Cómo Ivan Correa empezó a construir Escala desde Medellín, qué problemas intentamos resolver y qué hemos aprendido.',
    fecha: 'Julio 2026', categoria: 'Sobre Escala', tiempo: '8 min', destacado: true,
  },
  {
    slug: 'como-conseguir-maquina-confeccion-sin-banco',
    titulo: 'Como conseguir tu maquina de confeccion sin banco ni codeudor',
    descripcion: 'Si el banco te rechazó o no tienes historial, hay una forma real de conseguir tu overlock, plana o fileteadora. Sin Datacrédito, sin codeudor.',
    fecha: 'Julio 2026', categoria: 'Maquinaria', tiempo: '5 min', destacado: true,
  },
  {
    slug: 'leasing-maquinaria-industrial-colombia',
    titulo: 'Leasing bancario vs modelo desde el excedente: cual conviene para tu maquina',
    descripcion: 'El leasing bancario te cobra cuota fija 36 meses. El modelo de Escala cobra desde el excedente real. La diferencia puede ser enorme.',
    fecha: 'Julio 2026', categoria: 'Maquinaria', tiempo: '6 min', destacado: false,
  },
  {
    slug: 'como-abrir-salon-belleza-sin-capital',
    titulo: 'Como abrir o mejorar tu salon de belleza sin capital para el equipo',
    descripcion: 'Tienes las clientas pero te falta la silla hidráulica o la secadora. Te explicamos cómo conseguirlos sin banco en Medellín.',
    fecha: 'Julio 2026', categoria: 'Belleza', tiempo: '5 min', destacado: false,
  },
  {
    slug: 'negocio-comida-casa-colombia',
    titulo: 'Como crecer tu negocio de comida desde casa sin pedir prestamo',
    descripcion: 'Empanadas, arepas, tamales. Si ya vendes y quieres producir más, la freidora o el horno se puede financiar desde lo que genera.',
    fecha: 'Julio 2026', categoria: 'Comida', tiempo: '5 min', destacado: false,
  },
  {
    slug: 'diferencia-leasing-credito-maquinaria',
    titulo: 'Credito, leasing o modelo desde el excedente: cual conviene para tu maquina',
    descripcion: 'Tres caminos para financiar maquinaria. Comparación directa con tabla: requisitos, cuota, riesgo y cuándo usar cada uno.',
    fecha: 'Julio 2026', categoria: 'Finanzas', tiempo: '7 min', destacado: false,
  },
  {
    slug: 'como-ganar-dinero-confeccion-medellin',
    titulo: 'Como ganar mas dinero con tu taller de confeccion en Medellin',
    descripcion: 'Cinco pasos reales para aumentar ingresos como confeccionista: más capacidad, mejores clientes, y cómo financiar el equipo.',
    fecha: 'Julio 2026', categoria: 'Confección', tiempo: '7 min', destacado: false,
  },
  {
    slug: 'angel-investor-colombia-que-es',
    titulo: 'Que es un angel investor y como puede financiar tu negocio en Colombia',
    descripcion: 'Un ángel no es un banco ni un socio mayoritario. Te explicamos qué busca, qué espera a cambio y cómo conectar con uno.',
    fecha: 'Julio 2026', categoria: 'Inversión', tiempo: '6 min', destacado: false,
  },
  {
    slug: 'como-escalar-negocio-sin-prestamo',
    titulo: 'Como hacer crecer tu negocio sin pedir prestamo al banco',
    descripcion: 'Tres modelos donde el crecimiento se financia con el excedente del mismo negocio. Sin historial, sin garantías, sin deuda bancaria.',
    fecha: 'Julio 2026', categoria: 'Crecimiento', tiempo: '6 min', destacado: false,
  },
  {
    slug: 'trabajar-desde-casa-confeccion-colombia',
    titulo: 'Trabajar desde casa haciendo confeccion: como funciona y cuanto se gana',
    descripcion: 'Cómo funciona el modelo de taller satélite en Colombia, cuánto se puede ganar y cómo superar el límite de la capacidad.',
    fecha: 'Julio 2026', categoria: 'Confección', tiempo: '6 min', destacado: false,
  },
  {
    slug: 'equipo-belleza-financiado-medellin',
    titulo: 'Como conseguir equipo para tu salon en Medellin sin ir al banco',
    descripcion: 'Precios reales de silla hidráulica, secadora, cabina de ozono y más. Y cómo conseguirlos sin crédito ni codeudor en Medellín.',
    fecha: 'Julio 2026', categoria: 'Belleza', tiempo: '5 min', destacado: false,
  },
  {
    slug: 'que-es-la-participacion-diferida',
    titulo: 'Qué es la participación diferida y cómo funciona en la práctica',
    descripcion: 'El modelo que permite crear empresas sin capital inicial. Explicamos qué es el equity diferido, cómo se calcula y qué protege a cada parte.',
    fecha: 'Julio 2026', categoria: 'Modelo de negocio', tiempo: '6 min', destacado: false,
  },
  {
    slug: 'como-constituir-una-empresa-sas-en-colombia',
    titulo: 'Cómo constituir una empresa SAS en Colombia paso a paso',
    descripcion: 'Guía completa para 2026. Cámara de Comercio, DIAN, NIT, libros contables y todo lo que necesitas para formalizar tu startup.',
    fecha: 'Julio 2026', categoria: 'Legal y Tributario', tiempo: '10 min', destacado: false,
  },
  {
    slug: 'como-crear-una-startup-sin-dinero',
    titulo: 'Cómo crear una startup sin dinero en Latinoamérica',
    descripcion: 'El modelo de participación diferida, cómo conseguir un equipo que trabaje por equity y qué errores evitar al emprender sin capital.',
    fecha: 'Julio 2026', categoria: 'Emprendimiento', tiempo: '7 min', destacado: false,
  },
]

const COLOR_CAT = {
  'Sobre Escala': '#1D9E75',
  'Modelo de negocio': '#4A90D9',
  'Legal y Tributario': '#AFA9EC',
  'Emprendimiento': '#E8A020',
  'Maquinaria': '#AFA9EC',
  'Belleza': '#D946EF',
  'Comida': '#E8A020',
  'Confección': '#1D9E75',
  'Finanzas': '#4A90D9',
  'Inversión': '#E8A020',
  'Crecimiento': '#1D9E75',
}

export default function BlogPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter,sans-serif', color: '#fff' }}>
      <nav style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', textDecoration: 'none' }}>Esca<span style={{ color: '#1D9E75' }}>la</span></a>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/que-es-escala" style={{ color: '#8FA3CC', fontSize: '0.85rem', textDecoration: 'none' }}>Qué es Escala</a>
          <a href="/registro" style={{ background: '#1D9E75', color: '#fff', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>Crear cuenta</a>
        </div>
      </nav>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '0.5rem' }}>Blog</div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '0.75rem', color: '#fff' }}>Emprendimiento sin filtro</h1>
          <p style={{ fontSize: '1rem', color: '#8FA3CC', lineHeight: '1.7', maxWidth: '600px' }}>Guías reales para emprendedores en Colombia, México y Chile. Sin teoría vacía — lo que necesitas saber para construir una empresa.</p>
        </div>

        {/* Artículo destacado */}
        {ARTICULOS.filter(a => a.destacado).map(a => (
          <a key={a.slug} href={'/blog/' + a.slug} style={{ display: 'block', textDecoration: 'none', background: 'rgba(29,158,117,0.06)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: '700', background: '#1D9E75', color: '#fff', padding: '3px 10px', borderRadius: '20px' }}>Destacado</span>
              <span style={{ fontSize: '0.68rem', color: COLOR_CAT[a.categoria] || '#8FA3CC', fontWeight: '700' }}>{a.categoria}</span>
              <span style={{ fontSize: '0.68rem', color: '#6B7280' }}>{a.fecha} · {a.tiempo} de lectura</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', marginBottom: '0.75rem', lineHeight: '1.3', letterSpacing: '-0.02em' }}>{a.titulo}</h2>
            <p style={{ fontSize: '0.9rem', color: '#8FA3CC', lineHeight: '1.6', margin: 0 }}>{a.descripcion}</p>
            <div style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: '#1D9E75', fontWeight: '600' }}>Leer artículo →</div>
          </a>
        ))}

        {/* Resto de artículos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem' }}>
          {ARTICULOS.filter(a => !a.destacado).map(a => (
            <a key={a.slug} href={'/blog/' + a.slug} style={{ display: 'block', textDecoration: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', color: COLOR_CAT[a.categoria] || '#8FA3CC' }}>{a.categoria}</span>
                <span style={{ fontSize: '0.65rem', color: '#4B5563' }}>{a.fecha} · {a.tiempo}</span>
              </div>
              <h2 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem', lineHeight: '1.4' }}>{a.titulo}</h2>
              <p style={{ fontSize: '0.8rem', color: '#8FA3CC', lineHeight: '1.6', margin: '0 0 1rem' }}>{a.descripcion}</p>
              <span style={{ fontSize: '0.78rem', color: '#4A90D9', fontWeight: '600' }}>Leer →</span>
            </a>
          ))}
        </div>
      </main>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#8FA3CC' }}>
          © 2026 Escala Network ·{' '}
          <a href="/startup-colombia" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Colombia</a> ·{' '}
          <a href="/crear-empresa-sin-capital" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Crear sin capital</a> ·{' '}
          <a href="/registro" style={{ color: '#8FA3CC', textDecoration: 'none' }}>Registro</a>
        </div>
      </footer>
    </div>
  )
}
