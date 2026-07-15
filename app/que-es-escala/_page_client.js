'use client'

import RedesSociales from '@/components/RedesSociales'

const MODELOS = [
  {
    icon: '💡',
    titulo: 'Startup o empresa',
    subtitulo: 'Equity diferido',
    color: '#1D9E75',
    bg: 'rgba(29,158,117,0.08)',
    border: 'rgba(29,158,117,0.25)',
    desc: 'Tienes una idea, un producto digital o un negocio que quieres construir con un equipo. Los especialistas — desarrolladores, contadores, abogados, diseñadores — trabajan por participación diferida en vez de salario. Cuando la empresa genera ingresos o levanta inversión, cada quien recibe según lo que aportó.',
    para: 'Fundadores con una idea o empresa en etapa temprana que necesitan equipo sin capital para pagarlo.',
    link: '/crear-empresa-sin-capital',
    linkText: 'Cómo crear empresa sin capital →',
  },
  {
    icon: '🏪',
    titulo: 'Negocio en un local',
    subtitulo: 'Fondeo Escala',
    color: '#4A90D9',
    bg: 'rgba(74,144,217,0.08)',
    border: 'rgba(74,144,217,0.25)',
    badge: 'Nuevo',
    desc: 'Quieres montar una tienda, restaurante, frutería, almacén de ropa u otro negocio de venta de productos y necesitas el capital para el depósito, el primer arriendo y las adecuaciones del local. Un inversionista de Escala financia ese capital. Tú reportas tus ventas cada día y pagas el excedente diario hasta cubrir la deuda con intereses. Cuando terminas de pagar, el negocio es completamente tuyo.',
    para: 'Emprendedores que tienen claro el negocio y el local pero no tienen el capital inicial para arrancar.',
    link: '/financiar-negocio-local-colombia',
    linkText: 'Cómo funciona el fondeo de locales →',
  },
]

const PREGUNTAS = [
  {
    q: '¿Qué es Escala?',
    a: 'Una plataforma donde personas con ideas, capital, conocimiento o trabajo pueden co-crear negocios reales. Cada aporte queda registrado y reconocido formalmente — ya sea equity diferido para una startup o fondeo de capital para un negocio en un local.'
  },
  {
    q: '¿Qué problema resuelve?',
    a: 'La mayoría de buenos negocios no arrancan por falta de capital o equipo. Escala tiene dos soluciones: para startups, conecta con especialistas que trabajan por participación. Para negocios físicos, conecta con inversionistas que financian el local.'
  },
  {
    q: '¿Cómo funciona la participación diferida?',
    a: 'Cada hora, tarea o servicio que un especialista aporta queda registrado en la plataforma. Ese aporte se convierte en participación económica cuando el proyecto genera ingresos, levanta inversión o se vende. El contrato se genera automáticamente al aceptar un rol.'
  },
  {
    q: '¿Cómo funciona el fondeo de locales?',
    a: 'El operador ingresa los datos de su negocio y el local que quiere arrendar. Escala verifica la información, asigna una tasa de interés y publica el proyecto a su red de inversionistas. Cuando un inversionista acepta, el capital va directo al propietario del local. El operador reporta sus ventas diariamente y paga el excedente hasta cubrir la deuda.'
  },
  {
    q: '¿Qué es el Escala Score?',
    a: 'Tu reputación construida con hechos reales — tareas completadas y verificadas, roles aceptados, proyectos cerrados exitosamente. Sube con cada aporte real y determina qué tan confiable eres para inversionistas y fundadores.'
  },
  {
    q: '¿Necesito capital para empezar?',
    a: 'No. Si eres fundador de una startup, puedes publicar tu proyecto sin capital — los especialistas trabajan por participación. Si necesitas un local, el capital lo aporta un inversionista de Escala — tú pones el negocio y el trabajo.'
  },
]

const ROLES = [
  { icon: '💡', nombre: 'Ideador / Fundador', desc: 'Tiene una idea o empresa existente y busca equipo. No necesariamente aporta capital.' },
  { icon: '💰', nombre: 'Capitalista', desc: 'Aporta capital a proyectos con potencial a cambio de participación accionaria o retorno financiero.' },
  { icon: '🔧', nombre: 'Especialista', desc: 'Aporta conocimiento o servicios profesionales — abogados, contadores, diseñadores, programadores.' },
  { icon: '⚙️', nombre: 'Ejecutor / Gerente de Proyecto', desc: 'Administrador operativo: asigna tareas, verifica entregables, mantiene el proyecto organizado.' },
  { icon: '🌟', nombre: 'Ángel de Impulso', desc: 'Financia un hito puntual o un negocio completo en local sin financiar toda la empresa.' },
  { icon: '🧭', nombre: 'Mentor', desc: 'Aporta experiencia estratégica sin ejecutar tareas operativas.' },
  { icon: '🏢', nombre: 'Empresa', desc: 'Puede actuar como fundadora, ejecutora, prestadora de servicios, ángel o mentora.' },
]

export default function QueEsEscala() {
  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif',color:'#fff'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/" style={{textDecoration:'none',fontSize:'1.1rem',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Esca<span style={{color:'#1D9E75'}}>la</span></a>
        <a href="/registro" style={{background:'#1D9E75',color:'#fff',padding:'0.5rem 1.25rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.82rem',fontWeight:'700'}}>Crear cuenta →</a>
      </nav>

      <main style={{maxWidth:'820px',margin:'0 auto',padding:'3rem 1.25rem'}}>
        <div style={{textAlign:'center',marginBottom:'3rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.75rem'}}>Antes de registrarte</div>
          <div style={{fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:'900',letterSpacing:'-0.03em',marginBottom:'1rem'}}>Cómo funciona Escala</div>
          <div style={{fontSize:'1rem',color:'#8FA3CC',maxWidth:'520px',margin:'0 auto',lineHeight:'1.6'}}>
            Dos minutos de lectura antes de empezar — para que sepas exactamente en qué estás entrando.
          </div>
        </div>

        {/* Modelos de proyecto */}
        <div style={{marginBottom:'3rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.08em',textTransform:'uppercase',color:'#8FA3CC',marginBottom:'1rem'}}>Dos tipos de proyecto en Escala</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:'1rem'}}>
            {MODELOS.map(m => (
              <div key={m.titulo} style={{background:m.bg,border:`1px solid ${m.border}`,borderRadius:'14px',padding:'1.5rem',position:'relative'}}>
                {m.badge && (
                  <div style={{position:'absolute',top:'-10px',right:'1rem',background:m.color,color:'#fff',fontSize:'0.6rem',fontWeight:'700',padding:'2px 10px',borderRadius:'20px'}}>{m.badge}</div>
                )}
                <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.875rem'}}>
                  <span style={{fontSize:'1.75rem'}}>{m.icon}</span>
                  <div>
                    <div style={{fontSize:'1rem',fontWeight:'800',color:'#fff'}}>{m.titulo}</div>
                    <div style={{fontSize:'0.68rem',fontWeight:'700',color:m.color,textTransform:'uppercase',letterSpacing:'0.05em'}}>{m.subtitulo}</div>
                  </div>
                </div>
                <p style={{fontSize:'0.82rem',color:'#C8D4E8',lineHeight:'1.65',marginBottom:'0.875rem'}}>{m.desc}</p>
                <div style={{fontSize:'0.72rem',color:'#8FA3CC',background:'rgba(255,255,255,0.04)',borderRadius:'8px',padding:'0.5rem 0.75rem',marginBottom:'0.875rem'}}>
                  <strong style={{color:'#fff'}}>Para quién:</strong> {m.para}
                </div>
                <a href={m.link} style={{fontSize:'0.78rem',color:m.color,textDecoration:'none',fontWeight:'600'}}>{m.linkText}</a>
              </div>
            ))}
          </div>
        </div>

        {/* Preguntas frecuentes */}
        <div style={{marginBottom:'3rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.08em',textTransform:'uppercase',color:'#8FA3CC',marginBottom:'1rem'}}>Preguntas frecuentes</div>
          {PREGUNTAS.map((p, i) => (
            <div key={i} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem',marginBottom:'0.75rem'}}>
              <div style={{fontSize:'0.92rem',fontWeight:'700',color:'#1D9E75',marginBottom:'0.5rem'}}>{p.q}</div>
              <div style={{fontSize:'0.85rem',color:'#C8D4E8',lineHeight:'1.65'}}>{p.a}</div>
            </div>
          ))}
        </div>

        {/* Roles */}
        <div style={{marginBottom:'2.5rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.08em',textTransform:'uppercase',color:'#8FA3CC',marginBottom:'1rem'}}>Los 7 roles dentro de Escala</div>
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

        {/* Links relacionados */}
        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem',marginBottom:'2rem'}}>
          <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#8FA3CC',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.875rem'}}>Saber mas</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:'0.5rem'}}>
            {[
              { href: '/crear-empresa-sin-capital', label: 'Crear empresa sin capital' },
              { href: '/financiar-negocio-local-colombia', label: 'Financiar negocio en local comercial' },
              { href: '/buscar-cofundador', label: 'Buscar cofundador' },
              { href: '/angel-investor', label: 'Ser Ángel de Impulso' },
              { href: '/blog/que-es-la-participacion-diferida', label: 'Qué es la participación diferida' },
              { href: '/blog/como-crear-una-startup-sin-dinero', label: 'Crear startup sin dinero' },
            ].map(l => (
              <a key={l.href} href={l.href} style={{fontSize:'0.8rem',color:'#4A90D9',textDecoration:'none',padding:'0.35rem 0',display:'block'}}>{l.label} →</a>
            ))}
          </div>
        </div>

        <div style={{textAlign:'center',padding:'2rem 0'}}>
          <a href="/registro" style={{display:'inline-block',background:'#1D9E75',color:'#fff',padding:'0.9rem 2.5rem',borderRadius:'10px',textDecoration:'none',fontSize:'1rem',fontWeight:'700'}}>
            Listo, quiero entrar →
          </a>
        </div>
      </main>

      <footer style={{borderTop:'1px solid rgba(255,255,255,0.08)',padding:'2rem 1.25rem',textAlign:'center'}}>
        <RedesSociales />
        <div style={{fontSize:'0.75rem',color:'#8FA3CC',marginTop:'1rem'}}>© {new Date().getFullYear()} Escala Network</div>
      </footer>
    </div>
  )
}

