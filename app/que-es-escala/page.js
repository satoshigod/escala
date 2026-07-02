'use client'

const PREGUNTAS = [
  {
    q: '¿Qué es Escala?',
    a: 'Una plataforma donde varias personas — sin necesidad de conocerse antes — pueden co-crear una empresa aportando tiempo, conocimiento, activos o capital. Cada aporte queda registrado y reconocido formalmente.'
  },
  {
    q: '¿Qué problema resuelve?',
    a: 'La mayoría de buenas ideas mueren porque el fundador no tiene equipo, no tiene dinero para contratarlo, o no sabe cómo formalizar la colaboración de quienes sí quieren ayudar. Escala estructura esa colaboración con reglas claras desde el día uno.'
  },
  {
    q: '¿Cómo se convierte en participación lo que aporto?',
    a: 'Es el motor de compensación: cada aporte no monetario (horas, conocimiento, activos) o monetario que registras se convierte en participación económica futura cuando el proyecto empieza a generar ingresos.'
  },
  {
    q: '¿Qué es el Escala Score?',
    a: 'Tu reputación construida con hechos, no con lo que dices saber hacer. Sube cuando te aceptan en un rol, cuando un fundador valida tus aportes, y cuando se verifican tus tareas como completadas.'
  },
  {
    q: '¿Cómo se generan las tareas de mi proyecto?',
    a: 'Automáticamente, según el país (constitución legal, impuestos) y la industria (catálogo, redes sociales, branding) que elijas al crear tu proyecto — para que no tengas que pensarlo desde cero.'
  },
]

const ROLES = [
  { icon: '💡', nombre: 'Fundador', desc: 'Tiene una idea o empresa existente y busca equipo. No necesariamente aporta capital.' },
  { icon: '🔧', nombre: 'Ejecutor / Especialista', desc: 'Aporta tiempo, conocimiento o experiencia — abogados, contadores, diseñadores, programadores.' },
  { icon: '⚙️', nombre: 'Gerente de Proyecto', desc: 'Administrador operativo: asigna tareas, verifica entregables, mantiene el proyecto organizado.' },
  { icon: '🌟', nombre: 'Ángel de Impulso', desc: 'Financia un hito puntual (registro de marca, hosting, MVP) sin financiar toda la empresa.' },
  { icon: '🧭', nombre: 'Mentor', desc: 'Aporta experiencia estratégica — comercial, financiera, tecnológica — sin ejecutar tareas operativas.' },
  { icon: '🏢', nombre: 'Empresa', desc: 'Puede actuar como fundadora, ejecutora, prestadora de servicios, ángel o mentora.' },
]

export default function QueEsEscala() {
  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif',color:'#fff'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/" style={{textDecoration:'none',fontSize:'1.1rem',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Esca<span style={{color:'#1D9E75'}}>la</span></a>
        <a href="/registro" style={{background:'#1D9E75',color:'#fff',padding:'0.5rem 1.25rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.82rem',fontWeight:'700'}}>Crear cuenta →</a>
      </nav>

      <main style={{maxWidth:'780px',margin:'0 auto',padding:'3rem 1.25rem'}}>
        <div style={{textAlign:'center',marginBottom:'3rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.75rem'}}>Antes de registrarte</div>
          <div style={{fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:'900',letterSpacing:'-0.03em',marginBottom:'1rem'}}>Cómo funciona Escala</div>
          <div style={{fontSize:'1rem',color:'#8FA3CC',maxWidth:'520px',margin:'0 auto',lineHeight:'1.6'}}>
            Dos minutos de lectura antes de empezar — para que sepas exactamente en qué estás entrando.
          </div>
        </div>

        <div style={{marginBottom:'3rem'}}>
          {PREGUNTAS.map((p, i) => (
            <div key={i} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem',marginBottom:'0.875rem'}}>
              <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#1D9E75',marginBottom:'0.5rem'}}>{p.q}</div>
              <div style={{fontSize:'0.88rem',color:'#C8D4E8',lineHeight:'1.65'}}>{p.a}</div>
            </div>
          ))}
        </div>

        <div style={{marginBottom:'2rem'}}>
          <div style={{fontSize:'1.1rem',fontWeight:'800',marginBottom:'1.25rem',textAlign:'center'}}>Los 6 roles dentro de Escala</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'0.875rem'}}>
            {ROLES.map((r, i) => (
              <div key={i} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem'}}>
                <div style={{fontSize:'1.4rem',marginBottom:'0.5rem'}}>{r.icon}</div>
                <div style={{fontSize:'0.88rem',fontWeight:'700',color:'#fff',marginBottom:'0.35rem'}}>{r.nombre}</div>
                <div style={{fontSize:'0.76rem',color:'#8FA3CC',lineHeight:'1.5'}}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{textAlign:'center',padding:'2rem 0'}}>
          <a href="/registro" style={{display:'inline-block',background:'#1D9E75',color:'#fff',padding:'0.9rem 2.5rem',borderRadius:'10px',textDecoration:'none',fontSize:'1rem',fontWeight:'700'}}>
            Listo, quiero entrar →
          </a>
        </div>
      </main>
    </div>
  )
}
