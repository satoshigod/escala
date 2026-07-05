'use client'
import { useState } from 'react'

const fases = [
  {
    num: 'C1',
    titulo: 'Convenios estratégicos',
    estado: 'pendiente',
    valor_total: 2500000,
    valor_hecho: 0,
    hitos: [
      { num: 'C1.1', nombre: 'Convenio con cámaras de comercio — beneficios de constitución para usuarios Escala', done: false, valor: 400000, quien: 'Comercial Escala' },
      { num: 'C1.2', nombre: 'Convenio con bancos — apertura preferencial de cuenta empresarial', done: false, valor: 400000, quien: 'Comercial Escala' },
      { num: 'C1.3', nombre: 'Convenio con pasarela de pagos (Wompi/PayU) — tarifa preferencial', done: false, valor: 350000, quien: 'Comercial Escala' },
      { num: 'C1.4', nombre: 'Convenio de correo corporativo y hosting para proyectos nuevos', done: false, valor: 300000, quien: 'Comercial Escala' },
      { num: 'C1.5', nombre: 'Convenio con proveedores SaaS — descuentos para equipos Escala', done: false, valor: 300000, quien: 'Comercial Escala' },
      { num: 'C1.6', nombre: 'Convenio con herramientas de IA — créditos para fundadores', done: false, valor: 250000, quien: 'Comercial Escala' },
      { num: 'C1.7', nombre: 'Convenio con firmas jurídicas — tarifa preferencial para contratos', done: false, valor: 250000, quien: 'Comercial Escala' },
      { num: 'C1.8', nombre: 'Convenio con firmas contables — tarifa preferencial para constitución', done: false, valor: 250000, quien: 'Comercial Escala' },
    ]
  },
  {
    num: 'C2',
    titulo: 'Desarrollo de alianzas',
    estado: 'pendiente',
    valor_total: 1500000,
    valor_hecho: 0,
    hitos: [
      { num: 'C2.1', nombre: 'Mapeo y contacto con incubadoras locales — propuesta de valor para sus emprendedores', done: false, valor: 300000, quien: 'Comercial Escala' },
      { num: 'C2.2', nombre: 'Mapeo y contacto con aceleradoras — canal de proyectos post-aceleración', done: false, valor: 300000, quien: 'Comercial Escala' },
      { num: 'C2.3', nombre: 'Alianza con universidades — programa de prácticas como Ejecutores', done: false, valor: 350000, quien: 'Comercial Escala' },
      { num: 'C2.4', nombre: 'Alianza con cámaras binacionales — proyectos de expansión internacional', done: false, valor: 250000, quien: 'Comercial Escala' },
      { num: 'C2.5', nombre: 'Mapeo de gremios sectoriales relevantes para industrias clave', done: false, valor: 150000, quien: 'Comercial Escala' },
      { num: 'C2.6', nombre: 'Mapeo de fondos e inversionistas activos para conectar con proyectos Tipo B', done: false, valor: 150000, quien: 'Comercial Escala' },
    ]
  },
  {
    num: 'C3',
    titulo: 'Estrategia de adquisición — Fundadores',
    estado: 'pendiente',
    valor_total: 1200000,
    valor_hecho: 0,
    hitos: [
      { num: 'C3.1', nombre: 'Definir perfil ideal de fundador y propuesta de valor diferenciada', done: false, valor: 250000, quien: 'Comercial Escala' },
      { num: 'C3.2', nombre: 'Canal de adquisición — contenido y casos de éxito documentados', done: false, valor: 350000, quien: 'Comercial Escala' },
      { num: 'C3.3', nombre: 'Métricas de funnel — visitas, registros, proyectos publicados, conversión', done: false, valor: 300000, quien: 'Comercial Escala' },
      { num: 'C3.4', nombre: 'Proceso de onboarding asistido para los primeros 50 fundadores', done: false, valor: 300000, quien: 'Comercial Escala' },
    ]
  },
  {
    num: 'C4',
    titulo: 'Estrategia de adquisición — Ejecutores y Gerentes',
    estado: 'pendiente',
    valor_total: 1100000,
    valor_hecho: 0,
    hitos: [
      { num: 'C4.1', nombre: 'Definir perfil ideal de ejecutor/especialista por categoría (legal, contable, técnico, etc.)', done: false, valor: 250000, quien: 'Comercial Escala' },
      { num: 'C4.2', nombre: 'Canal de adquisición en comunidades profesionales y colegios gremiales', done: false, valor: 300000, quien: 'Comercial Escala' },
      { num: 'C4.3', nombre: 'Programa de certificación de Gerentes de Proyecto Escala', done: false, valor: 350000, quien: 'Comercial Escala' },
      { num: 'C4.4', nombre: 'Métricas de calidad y retención de especialistas activos', done: false, valor: 200000, quien: 'Comercial Escala' },
    ]
  },
  {
    num: 'C5',
    titulo: 'Estrategia de adquisición — Ángeles, Mentores y Empresas',
    estado: 'pendiente',
    valor_total: 1400000,
    valor_hecho: 0,
    hitos: [
      { num: 'C5.1', nombre: 'Definir perfil de Ángel de Impulso y mecánica de financiamiento por hito', done: false, valor: 300000, quien: 'Comercial Escala' },
      { num: 'C5.2', nombre: 'Canal de adquisición para mentores — comunidades de ejecutivos senior', done: false, valor: 300000, quien: 'Comercial Escala' },
      { num: 'C5.3', nombre: 'Propuesta de valor para empresas aliadas — acceso a talento y proyectos', done: false, valor: 350000, quien: 'Comercial Escala' },
      { num: 'C5.4', nombre: 'Programa piloto con primeros 10 ángeles y 5 empresas aliadas', done: false, valor: 450000, quien: 'Comercial Escala' },
    ]
  },
]

export default function Comercial() {
  const [faseAbierta, setFaseAbierta] = useState(null)

  const totalPlataforma = fases.reduce((s, f) => s + f.valor_total, 0)
  const totalHecho = fases.reduce((s, f) => s + f.valor_hecho, 0)
  const totalPendiente = totalPlataforma - totalHecho
  const pct = totalPlataforma > 0 ? Math.round((totalHecho / totalPlataforma) * 1000) / 10 : 0

  const fmt = v => '$' + v.toLocaleString('es-CO')

  const estadoColor = { completa: '#1D9E75', progreso: '#E8A020', pendiente: '#6B7280' }
  const estadoLabel = { completa: '✓ Completada', progreso: '⚡ En progreso', pendiente: '⏳ Pendiente' }

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif',color:'#fff'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/dashboard" style={{textDecoration:'none',display:'flex',alignItems:'center'}}><img src="/brand/isotipo.svg" alt="Escala" width="26" height="26" style={{display:"inline-block",verticalAlign:"middle",marginRight:"6px"}}/><span style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Esca<span style={{color:'#1D9E75'}}>la</span></span></a>
        <div style={{display:'flex',gap:'1.5rem'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Dashboard</a>
          <a href="/desarrollo" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Desarrollo</a>
          <a href="/comercial" style={{color:'#fff',fontSize:'0.82rem',fontWeight:'600',textDecoration:'none'}}>Comercial</a>
          <a href="/" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Sitio</a>
        </div>
      </nav>

      <main style={{maxWidth:'900px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'2rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.4rem'}}>Comercial Escala</div>
          <div style={{fontSize:'clamp(1.5rem,3vw,2rem)',fontWeight:'900',letterSpacing:'-0.03em',marginBottom:'0.3rem'}}>Plan comercial</div>
          <div style={{fontSize:'0.85rem',color:'#8FA3CC'}}>Convenios estratégicos, alianzas y estrategia de adquisición por tipo de usuario — roadmap paralelo al técnico.</div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1rem',marginBottom:'2rem'}}>
          <div style={{background:'rgba(29,158,117,0.1)',border:'1px solid rgba(29,158,117,0.25)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#1D9E75',lineHeight:'1',marginBottom:'0.3rem'}}>{fmt(totalHecho)}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>Valor comercial ya construido</div>
          </div>
          <div style={{background:'rgba(232,160,32,0.1)',border:'1px solid rgba(232,160,32,0.25)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#E8A020',lineHeight:'1',marginBottom:'0.3rem'}}>{fmt(totalPendiente)}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>Pendiente por ejecutar</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#fff',lineHeight:'1',marginBottom:'0.3rem'}}>{fmt(totalPlataforma)}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>Valor total del plan comercial</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#AFA9EC',lineHeight:'1',marginBottom:'0.3rem'}}>{pct}%</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>Porcentaje completado</div>
          </div>
        </div>

        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1rem 1.25rem',marginBottom:'2rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.72rem',color:'#8FA3CC',marginBottom:'6px'}}>
            <span>Progreso total</span><span>{pct}%</span>
          </div>
          <div style={{height:'8px',background:'rgba(255,255,255,0.08)',borderRadius:'4px',overflow:'hidden'}}>
            <div style={{height:'100%',width:pct+'%',background:'linear-gradient(90deg,#1D9E75,#25c795)',borderRadius:'4px'}}></div>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.68rem',color:'#8FA3CC',marginTop:'4px'}}>
            <span>$0</span><span>{fmt(totalHecho)} completados</span><span>{fmt(totalPlataforma)}</span>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
          {fases.map(fase => {
            const abierta = faseAbierta === fase.num
            const pctFase = fase.valor_total > 0 ? Math.round((fase.valor_hecho / fase.valor_total) * 100) : 0
            return (
              <div key={fase.num} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',overflow:'hidden'}}>
                <div onClick={() => setFaseAbierta(abierta ? null : fase.num)} style={{padding:'1.25rem',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem'}}>
                  <div style={{display:'flex',gap:'1rem',alignItems:'center',flex:1}}>
                    <div style={{fontFamily:'monospace',fontSize:'1.5rem',fontWeight:'700',color:'rgba(255,255,255,0.12)',flexShrink:0}}>{fase.num}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'0.9rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>{fase.titulo}</div>
                      <div style={{height:'4px',background:'rgba(255,255,255,0.08)',borderRadius:'2px',overflow:'hidden',width:'100%',maxWidth:'200px'}}>
                        <div style={{height:'100%',width:pctFase+'%',background:estadoColor[fase.estado],borderRadius:'2px'}}></div>
                      </div>
                    </div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontSize:'0.75rem',fontWeight:'700',color:estadoColor[fase.estado],marginBottom:'0.2rem'}}>{estadoLabel[fase.estado]}</div>
                    <div style={{fontFamily:'monospace',fontSize:'0.78rem',color:fase.valor_hecho > 0 ? '#1D9E75' : '#8FA3CC'}}>{fmt(fase.valor_hecho)} / {fmt(fase.valor_total)}</div>
                  </div>
                  <div style={{color:'#8FA3CC',fontSize:'0.75rem',flexShrink:0}}>{abierta ? '▲' : '▼'}</div>
                </div>

                {abierta && (
                  <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'0 1.25rem 1.25rem'}}>
                    {fase.hitos.map(h => (
                      <div key={h.num} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'0.75rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)',gap:'1rem'}}>
                        <div style={{display:'flex',gap:'0.75rem',alignItems:'flex-start',flex:1}}>
                          <div style={{width:'22px',height:'22px',borderRadius:'50%',background: h.done ? '#1D9E75' : 'rgba(255,255,255,0.06)',border: h.done ? 'none' : '1px solid rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.65rem',flexShrink:0,marginTop:'2px',color: h.done ? '#fff' : '#8FA3CC'}}>
                            {h.done ? '✓' : h.num.split('.')[1]}
                          </div>
                          <div>
                            <div style={{fontSize:'0.82rem',fontWeight: h.done ? '600' : '400',color: h.done ? '#fff' : '#8FA3CC',marginBottom:'0.15rem'}}>{h.nombre}</div>
                            <div style={{fontSize:'0.68rem',color: h.done ? '#1D9E75' : '#6B7280'}}>{h.quien}</div>
                          </div>
                        </div>
                        <div style={{fontFamily:'monospace',fontSize:'0.78rem',fontWeight:'600',color: h.done ? '#1D9E75' : '#6B7280',flexShrink:0}}>{fmt(h.valor)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.5rem',marginTop:'2rem'}}>
          <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff',marginBottom:'0.4rem'}}>Por qué importa el plan comercial</div>
          <div style={{fontSize:'0.82rem',color:'#8FA3CC',lineHeight:'1.6'}}>La plataforma técnica conecta personas, pero los convenios estratégicos y las alianzas son lo que hace que valga la pena entrar. Un fundador que llega a Escala y encuentra beneficios reales con bancos, cámaras de comercio y pasarelas de pago tiene una razón concreta para quedarse, más allá del producto mismo.</div>
        </div>
      </main>
    </div>
  )
}
