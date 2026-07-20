'use client'

import RedesSociales from '@/components/RedesSociales'

const MODELOS = [
  {
    icon: '💡',
    titulo: 'Startup o empresa',
    subtitulo: 'Participacion diferida',
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
    desc: 'Quieres montar una tienda, restaurante, frutería, almacén de ropa u otro negocio de venta de productos y necesitas el capital para el depósito, el primer arriendo y las adecuaciones del local. Un inversionista financia ese capital. Tú reportas tus ventas cada día y pagas el excedente hasta cubrir el total. Cuando terminas de pagar, el negocio es completamente tuyo.',
    para: 'Emprendedores que tienen claro el negocio y el local pero no tienen el capital inicial para arrancar.',
    link: '/financiar-negocio-local-colombia',
    linkText: 'Cómo funciona el fondeo de locales →',
  },
  {
    icon: '🔧',
    titulo: 'Necesito una máquina',
    subtitulo: 'Leasing desde el excedente',
    color: '#AFA9EC',
    bg: 'rgba(175,169,236,0.08)',
    border: 'rgba(175,169,236,0.3)',
    badge: 'Nuevo',
    desc: 'Tienes los pedidos pero te falta la máquina o el equipo para producir más. Un ángel inversionista compra el equipo y queda como propietario. Tú lo usas desde el primer día y pagas desde el excedente que genera el mismo equipo. Sin banco, sin garante, sin cuota fija mensual. Cuando terminas de pagar, la máquina es tuya.',
    para: 'Confeccionistas, cocineras, estilistas y cualquier persona con pedidos reales que necesita un equipo para producir más.',
    ejemplos: ['Máquina overlock para confección · Medellín', 'Freidora industrial para empanadas', 'Silla hidráulica para salón de belleza', 'Horno panadero o amasadora'],
    link: '/maquinaria-confeccion-medellin',
    linkText: 'Ver programa Las 10 Máquinas →',
  },
]

const PREGUNTAS = [
  {
    q: '¿Qué es Escala?',
    a: 'Una plataforma donde personas con ideas, capital, conocimiento o trabajo pueden co-crear negocios reales. Cada aporte queda registrado y reconocido — participación diferida para startups, fondeo de capital para locales, o leasing de maquinaria desde el excedente.'
  },
  {
    q: '¿Qué problema resuelve?',
    a: 'La mayoría de buenos negocios no arrancan por falta de capital o equipo. Escala tiene tres soluciones: para startups, conecta con especialistas que trabajan por participación. Para negocios físicos, conecta con inversionistas que financian el local. Para quienes producen con equipos, conecta con ángeles que compran la máquina y reciben el pago desde el excedente.'
  },
  {
    q: '¿Cómo funciona la participación diferida?',
    a: 'Cada hora, tarea o servicio que un especialista aporta queda registrado en la plataforma. Ese aporte se convierte en participación económica cuando el proyecto genera ingresos, levanta inversión o se vende. El contrato se genera automáticamente al aceptar un rol.'
  },
  {
    q: '¿Cómo funciona el fondeo de locales?',
    a: 'El operador ingresa los datos de su negocio y el local que quiere arrendar. Escala verifica la información y publica el proyecto a su red de inversionistas. Cuando un inversionista acepta, el capital va directo al propietario del local. El operador reporta sus ventas diariamente y paga el excedente hasta cubrir el total.'
  },
  {
    q: '¿Cómo funciona el leasing de maquinaria?',
    a: 'El ángel compra la máquina y queda como propietario registrado. La beneficiaria la usa desde el primer día y cada mes reporta sus ventas. Del excedente mensual (ventas menos costos y gastos), un porcentaje acordado se abona al capital. Si produce más, paga más rápido. Cuando el ángel recupera el total, la máquina pasa a nombre de la beneficiaria. Sin banco, sin garante, sin cuota fija.'
  },
  {
    q: '¿Qué es el Escala Score?',
    a: 'Tu reputación construida con hechos reales — tareas completadas y verificadas, roles aceptados, proyectos cerrados exitosamente. Sube con cada aporte real y determina qué tan confiable eres para inversionistas y fundadores.'
  },
  {
    q: '¿Necesito capital para empezar?',
    a: 'No. Si eres fundador de una startup, puedes publicar tu proyecto sin capital. Si necesitas un local o una máquina, el capital lo aporta un ángel inversionista. Tú pones el negocio, el trabajo y el conocimiento.'
  },
]

const ROLES = [
  { icon: '💡', nombre: 'Ideador / Fundador', desc: 'Tiene una idea o empresa existente y busca equipo. No necesariamente aporta capital.' },
  { icon: '💰', nombre: 'Capitalista', desc: 'Aporta capital a proyectos con potencial a cambio de participación accionaria o retorno financiero.' },
  { icon: '🔧', nombre: 'Especialista', desc: 'Aporta conocimiento o servicios profesionales — abogados, contadores, diseñadores, programadores.' },
  { icon: '⚙️', nombre: 'Ejecutor / Gerente de Proyecto', desc: 'Administrador operativo: asigna tareas, verifica entregables, mantiene el proyecto organizado.' },
  { icon: '🌟', nombre: 'Angel Inversionista', desc: 'Financia un hito puntual o un negocio completo en local sin financiar toda la empresa.' },
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
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.08em',textTransform:'uppercase',color:'#8FA3CC',marginBottom:'0.5rem'}}>Tres modelos en Escala — elige el que se ajusta a ti</div>
          <div style={{fontSize:'0.72rem',color:'#4B5563',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'0.375rem'}}>
            <span>←</span> desliza para ver los tres <span>→</span>
          </div>
          {/* Scroll horizontal en móvil, grid en desktop */}
          <div style={{
            display:'flex',
            gap:'1rem',
            overflowX:'auto',
            paddingBottom:'0.75rem',
            scrollSnapType:'x mandatory',
            WebkitOverflowScrolling:'touch',
            msOverflowStyle:'none',
            scrollbarWidth:'none',
          }}>
            {MODELOS.map((m, idx) => (
              <div key={m.titulo} style={{
                background:m.bg,
                border:`1px solid ${m.border}`,
                borderRadius:'14px',
                padding:'1.5rem',
                position:'relative',
                flexShrink:0,
                width:'min(85vw, 320px)',
                scrollSnapAlign:'start',
              }}>
                {m.badge && (
                  <div style={{position:'absolute',top:'-10px',right:'1rem',background:m.color,color: m.color === '#AFA9EC' ? '#2D2866' : '#fff',fontSize:'0.6rem',fontWeight:'700',padding:'2px 10px',borderRadius:'20px'}}>{m.badge}</div>
                )}
                {/* Indicador de posición */}
                <div style={{display:'flex',gap:'4px',marginBottom:'0.875rem'}}>
                  {MODELOS.map((_,i) => (
                    <div key={i} style={{width: i===idx ? '16px' : '6px', height:'4px',borderRadius:'2px',background: i===idx ? m.color : 'rgba(255,255,255,0.15)',transition:'width 0.2s'}} />
                  ))}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.875rem'}}>
                  <span style={{fontSize:'1.75rem'}}>{m.icon}</span>
                  <div>
                    <div style={{fontSize:'1rem',fontWeight:'800',color:'#fff'}}>{m.titulo}</div>
                    <div style={{fontSize:'0.68rem',fontWeight:'700',color:m.color,textTransform:'uppercase',letterSpacing:'0.05em'}}>{m.subtitulo}</div>
                  </div>
                </div>
                <p style={{fontSize:'0.82rem',color:'#C8D4E8',lineHeight:'1.65',marginBottom:'0.875rem'}}>{m.desc}</p>
                {m.ejemplos && (
                  <div style={{marginBottom:'0.875rem'}}>
                    {m.ejemplos.map(ej => (
                      <div key={ej} style={{fontSize:'0.75rem',color:'#8FA3CC',padding:'3px 0',display:'flex',gap:'0.5rem',alignItems:'center'}}>
                        <span style={{color:m.color}}>→</span>{ej}
                      </div>
                    ))}
                  </div>
                )}
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
              { href: '/financiar-negocio-local-colombia', label: 'Necesito un local para mi negocio' },
              { href: '/buscar-cofundador', label: 'Buscar cofundador' },
              { href: '/angel-investor', label: 'Ser Angel Inversionista' },
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

