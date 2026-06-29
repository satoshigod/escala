'use client'
import { useState } from 'react'

const fases = [
  {
    num: '01',
    titulo: 'Presentación y diseño web',
    estado: 'completa',
    valor_total: 3200000,
    valor_hecho: 3200000,
    hitos: [
      { num: '1.1', nombre: 'Arquitectura de información y navegación', done: true, valor: 400000, quien: 'Claude AI + Fundador' },
      { num: '1.2', nombre: 'Diseño visual y sistema de estilos mobile-first', done: true, valor: 600000, quien: 'Claude AI' },
      { num: '1.3', nombre: 'Página principal (index.html)', done: true, valor: 800000, quien: 'Claude AI' },
      { num: '1.4', nombre: 'Página de proyectos (proyectos.html)', done: true, valor: 400000, quien: 'Claude AI' },
      { num: '1.5', nombre: 'Página proyecto piloto (proyecto-escala.html)', done: true, valor: 400000, quien: 'Claude AI' },
      { num: '1.6', nombre: 'Página Ángel de Impulso (impulso.html)', done: true, valor: 300000, quien: 'Claude AI' },
      { num: '1.7', nombre: 'Página de costos (costos.html)', done: true, valor: 200000, quien: 'Claude AI' },
      { num: '1.8', nombre: 'Página expectativa WhatsApp (coming.html)', done: true, valor: 100000, quien: 'Claude AI' },
    ]
  },
  {
    num: '02',
    titulo: 'Backend y base de datos',
    estado: 'progreso',
    valor_total: 12000000,
    valor_hecho: 8500000,
    hitos: [
      { num: '2.1', nombre: 'Modelo de datos completo — 8 tablas Supabase PostgreSQL', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '2.2', nombre: 'Sistema de autenticación — Supabase Auth + trigger perfiles', done: true, valor: 1500000, quien: 'Supabase + Claude AI' },
      { num: '2.3', nombre: 'API REST proyectos, usuarios y roles — 3 endpoints', done: true, valor: 2500000, quien: 'Claude AI + Fundador' },
      { num: '2.4', nombre: 'API aportes, hitos y postulaciones — 3 endpoints', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '2.5', nombre: 'Sistema de notificaciones por email', done: false, valor: 1000000, quien: 'Desarrollador' },
      { num: '2.6', nombre: 'Almacenamiento de archivos (Supabase Storage)', done: false, valor: 1000000, quien: 'Desarrollador' },
      { num: '2.7', nombre: 'Infraestructura y despliegue — GitHub + Vercel + Supabase', done: true, valor: 500000, quien: 'Claude AI + Fundador' },
    ]
  },
  {
    num: '03',
    titulo: 'Frontend operativo (plataforma real)',
    estado: 'progreso',
    valor_total: 14000000,
    valor_hecho: 13000000,
    hitos: [
      { num: '3.1', nombre: 'Registro y onboarding de usuarios — 3 pasos', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '3.2', nombre: 'Perfil público de usuario con Escala Score', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '3.3', nombre: 'Publicación y gestión de proyectos', done: true, valor: 3000000, quien: 'Claude AI + Fundador' },
      { num: '3.4', nombre: 'Detalle de proyecto con roles y postulación real', done: true, valor: 2500000, quien: 'Claude AI + Fundador' },
      { num: '3.5', nombre: 'Dashboard centro de control completo', done: true, valor: 2000000, quien: 'Claude AI + Fundador' },
      { num: '3.6', nombre: 'Hitos, aportes, postulaciones y panel fundador', done: true, valor: 1500000, quien: 'Claude AI + Fundador' },
      { num: '3.7', nombre: 'Panel de administración Escala', done: false, valor: 1000000, quien: 'Desarrollador' },
    ]
  },
  {
    num: '04',
    titulo: 'Contratos digitales y documentos',
    estado: 'pendiente',
    valor_total: 8000000,
    valor_hecho: 0,
    hitos: [
      { num: '4.1', nombre: 'Plantillas legales base (abogado + desarrollador)', done: false, valor: 1400000, quien: 'Abogado + Desarrollador' },
      { num: '4.2', nombre: 'Motor de generación automática de contratos', done: false, valor: 2000000, quien: 'Desarrollador' },
      { num: '4.3', nombre: 'Integración de firma digital (DocuSign/HelloSign)', done: false, valor: 2500000, quien: 'Desarrollador' },
      { num: '4.4', nombre: 'Expediente digital del proyecto exportable a PDF', done: false, valor: 2100000, quien: 'Desarrollador' },
    ]
  },
  {
    num: '05',
    titulo: 'Sistema de calificación y Escala Score',
    estado: 'pendiente',
    valor_total: 8000000,
    valor_hecho: 0,
    hitos: [
      { num: '5.1', nombre: 'Sistema de evaluación por hito', done: false, valor: 2000000, quien: 'Desarrollador' },
      { num: '5.2', nombre: 'Algoritmo del Escala Score', done: false, valor: 2500000, quien: 'Desarrollador' },
      { num: '5.3', nombre: 'Panel de definición de carril (A/B/C)', done: false, valor: 2000000, quien: 'Desarrollador' },
      { num: '5.4', nombre: 'Track record público por usuario', done: false, valor: 1500000, quien: 'Desarrollador' },
    ]
  },
  {
    num: '06',
    titulo: 'Pagos y distribución automática',
    estado: 'pendiente',
    valor_total: 9800000,
    valor_hecho: 0,
    hitos: [
      { num: '6.1', nombre: 'Integración Wompi (pagos Colombia)', done: false, valor: 2500000, quien: 'Desarrollador' },
      { num: '6.2', nombre: 'Motor de distribución automática', done: false, valor: 3000000, quien: 'Desarrollador' },
      { num: '6.3', nombre: 'Pago de hitos del Ángel de Impulso', done: false, valor: 2000000, quien: 'Desarrollador' },
      { num: '6.4', nombre: 'Facturación electrónica DIAN', done: false, valor: 2300000, quien: 'Desarrollador + Contador' },
    ]
  },
]

export default function Desarrollo() {
  const [faseAbierta, setFaseAbierta] = useState(null)

  const totalPlataforma = 55000000
  const totalHecho = fases.reduce((s, f) => s + f.valor_hecho, 0)
  const totalPendiente = totalPlataforma - totalHecho
  const pct = Math.round((totalHecho / totalPlataforma) * 100 * 10) / 10

  const fmt = v => '$' + v.toLocaleString('es-CO')

  const estadoColor = { completa: '#1D9E75', progreso: '#E8A020', pendiente: '#6B7280' }
  const estadoLabel = { completa: '✓ Completada', progreso: '⚡ En progreso', pendiente: '⏳ Pendiente' }

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif',color:'#fff'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontSize:'1.1rem',fontWeight:'900',letterSpacing:'-0.03em'}}>Esca<span style={{color:'#1D9E75'}}>la</span></div>
        <div style={{display:'flex',gap:'1.5rem'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Dashboard</a>
          <a href="/desarrollo" style={{color:'#fff',fontSize:'0.82rem',fontWeight:'600',textDecoration:'none'}}>Desarrollo</a>
          <a href="/" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Sitio</a>
        </div>
      </nav>

      <main style={{maxWidth:'900px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'2rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.4rem'}}>Seguimiento técnico</div>
          <div style={{fontSize:'clamp(1.5rem,3vw,2rem)',fontWeight:'900',letterSpacing:'-0.03em',marginBottom:'0.3rem'}}>Plan de desarrollo</div>
          <div style={{fontSize:'0.85rem',color:'#8FA3CC'}}>Lo que ya está construido reduce la deuda diferida del desarrollador.</div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1rem',marginBottom:'2rem'}}>
          <div style={{background:'rgba(29,158,117,0.1)',border:'1px solid rgba(29,158,117,0.25)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#1D9E75',lineHeight:'1',marginBottom:'0.3rem'}}>{fmt(totalHecho)}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>Valor ya construido — pagado por el fundador con IA</div>
          </div>
          <div style={{background:'rgba(232,160,32,0.1)',border:'1px solid rgba(232,160,32,0.25)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#E8A020',lineHeight:'1',marginBottom:'0.3rem'}}>{fmt(totalPendiente)}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>Deuda diferida máxima para el desarrollador</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#fff',lineHeight:'1',marginBottom:'0.3rem'}}>{fmt(totalPlataforma)}</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>Valor total estimado de la plataforma</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#AFA9EC',lineHeight:'1',marginBottom:'0.3rem'}}>{pct}%</div>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>Porcentaje completado del desarrollo total</div>
          </div>
        </div>

        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1rem 1.25rem',marginBottom:'2rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.72rem',color:'#8FA3CC',marginBottom:'6px'}}>
            <span>Progreso total</span><span>{pct}%</span>
          </div>
          <div style={{height:'8px',background:'rgba(255,255,255,0.08)',borderRadius:'4px',overflow:'hidden'}}>
            <div style={{height:'100%',width:pct+'%',background:'linear-gradient(90deg,#1D9E75,#25c795)',borderRadius:'4px',transition:'width 0.8s ease'}}></div>
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
          <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff',marginBottom:'0.4rem'}}>El argumento para la negociación</div>
          <div style={{fontSize:'0.82rem',color:'#8FA3CC',lineHeight:'1.6'}}>El fundador ya construyó <strong style={{color:'#1D9E75'}}>{fmt(totalHecho)}</strong> en valor real de plataforma — pagado con IA y tiempo propio. El desarrollador entra a construir los <strong style={{color:'#E8A020'}}>{fmt(totalPendiente)}</strong> restantes. No a repetir lo que ya existe.</div>
        </div>
      </main>
    </div>
  )
}
