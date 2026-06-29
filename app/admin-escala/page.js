'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const INDUSTRIAS = {
  'Restaurante': [
    'Diseñar carta digital', 'Fotografía gastronómica', 'Registro en Google Maps',
    'Configurar plataformas de delivery', 'Crear promociones de lanzamiento',
    'Sistema de reservas', 'Programa de fidelización', 'Campañas locales en redes'
  ],
  'Retail': [
    'Crear catálogo de productos', 'Configurar inventario', 'Instalar POS',
    'Codificación de productos', 'Publicar en marketplaces', 'Estrategia de promociones',
    'Implementar CRM', 'Gestión de proveedores'
  ],
  'Servicios Profesionales': [
    'Crear identidad de marca', 'Desarrollar página web', 'Implementar CRM',
    'Configurar agenda online', 'Automatización de procesos', 'Generación de leads',
    'Documentar casos de éxito', 'Recopilar testimonios'
  ],
  'Tecnología': [
    'Configurar repositorio', 'Deploy inicial', 'Base de datos',
    'Autenticación de usuarios', 'API REST', 'Panel de administración',
    'Métricas y analytics', 'Seguridad y backups'
  ],
  'Comercio Electrónico': [
    'Configurar tienda online', 'Integrar pasarela de pagos', 'Configurar logística',
    'Gestión de inventario', 'SEO inicial', 'Campañas de adquisición',
    'Email marketing', 'Recuperación de carritos abandonados'
  ],
}

const PAISES = ['Colombia', 'México', 'Perú', 'Chile', 'Argentina', 'España', 'Estados Unidos']

export default function AdminEscala() {
  const [usuario, setUsuario] = useState(null)
  const [perfiles, setPerfiles] = useState([])
  const [proyectos, setProyectos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [tab, setTab] = useState('perfiles')
  const [recalculando, setRecalculando] = useState(null)
  const [scores, setScores] = useState({})

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro'; return }
      setUsuario(user)

      const { data: perfsData } = await supabase
        .from('perfiles')
        .select('*')
        .order('escala_score', { ascending: false })

      const pRes = await fetch('/api/proyectos')
      const pData = await pRes.json()

      setPerfiles(perfsData || [])
      setProyectos(pData.proyectos || [])
      setCargando(false)
    }
    cargar()
  }, [])

  async function recalcularScore(perfil_id) {
    setRecalculando(perfil_id)
    const res = await fetch('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perfil_id })
    })
    const data = await res.json()
    if (!data.error) {
      setScores(s => ({ ...s, [perfil_id]: data.score }))
      setPerfiles(p => p.map(x => x.id === perfil_id ? { ...x, escala_score: data.score } : x))
    }
    setRecalculando(null)
  }

  async function recalcularTodos() {
    setRecalculando('todos')
    for (const p of perfiles) {
      await recalcularScore(p.id)
    }
    setRecalculando(null)
  }

  const tabs = [
    { id: 'perfiles', label: '👥 Perfiles y Score' },
    { id: 'proyectos', label: '🚀 Proyectos' },
    { id: 'industrias', label: '🏭 Plantillas por industria' },
    { id: 'paises', label: '🌎 Países' },
  ]

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0B1628',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>Cargando panel admin...</div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0B1628',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
          <span style={{fontSize:'1rem',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Esca<span style={{color:'#1D9E75'}}>la</span></span>
          <span style={{fontSize:'0.62rem',fontWeight:'700',padding:'2px 8px',borderRadius:'10px',background:'rgba(232,160,32,0.2)',color:'#E8A020'}}>ADMIN</span>
        </div>
        <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.78rem',textDecoration:'none'}}>Dashboard</a>
      </nav>

      <div style={{background:'rgba(255,255,255,0.02)',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'0 1.5rem',display:'flex',gap:'0',overflowX:'auto'}}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{background:'none',border:'none',borderBottom:tab===t.id?'2px solid #1D9E75':'2px solid transparent',color:tab===t.id?'#fff':'#8FA3CC',padding:'0.875rem 1.25rem',fontSize:'0.82rem',fontWeight:tab===t.id?'700':'400',cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap'}}>
            {t.label}
          </button>
        ))}
      </div>

      <main style={{maxWidth:'1100px',margin:'0 auto',padding:'2rem 1.25rem'}}>

        {tab === 'perfiles' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem',flexWrap:'wrap',gap:'1rem'}}>
              <div>
                <div style={{fontSize:'1rem',fontWeight:'700',color:'#fff'}}>Perfiles de la red</div>
                <div style={{fontSize:'0.82rem',color:'#8FA3CC',marginTop:'0.2rem'}}>{perfiles.length} personas registradas</div>
              </div>
              <button onClick={recalcularTodos} disabled={recalculando==='todos'} style={{background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.6rem 1.25rem',fontSize:'0.78rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                {recalculando==='todos' ? 'Recalculando...' : '🔄 Recalcular todos los scores'}
              </button>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              {perfiles.map(p => (
                <div key={p.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'1rem 1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
                  <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
                    <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'rgba(29,158,117,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.9rem',fontWeight:'700',color:'#1D9E75',flexShrink:0}}>
                      {(p.nombre||'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff'}}>{p.nombre || 'Sin nombre'}</div>
                      <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>{p.ciudad||''}{p.especialidad?' · '+p.especialidad:''}{p.rol_principal?' · '+p.rol_principal:''}</div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontFamily:'monospace',fontSize:'1.25rem',fontWeight:'700',color: (scores[p.id]||p.escala_score||0) >= 50 ? '#1D9E75' : (scores[p.id]||p.escala_score||0) >= 20 ? '#E8A020' : '#8FA3CC'}}>
                        {scores[p.id] ?? p.escala_score ?? 0}
                      </div>
                      <div style={{fontSize:'0.62rem',color:'#6B7280'}}>Escala Score</div>
                    </div>
                    <button onClick={() => recalcularScore(p.id)} disabled={recalculando===p.id} style={{background:'rgba(29,158,117,0.1)',color:'#1D9E75',border:'1px solid rgba(29,158,117,0.25)',borderRadius:'6px',padding:'0.3rem 0.75rem',fontSize:'0.72rem',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:'600'}}>
                      {recalculando===p.id ? '...' : '🔄 Recalcular'}
                    </button>
                    <a href={'/perfil/'+p.id} style={{fontSize:'0.72rem',color:'#8FA3CC',textDecoration:'none'}}>Ver perfil →</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'proyectos' && (
          <div>
            <div style={{fontSize:'1rem',fontWeight:'700',color:'#fff',marginBottom:'1.5rem'}}>{proyectos.length} proyectos en la plataforma</div>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              {proyectos.map(p => (
                <div key={p.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'1rem 1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
                  <div>
                    <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>{p.nombre}</div>
                    <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>{p.sector} · {p.ciudad} · Tipo {p.tipo}</div>
                  </div>
                  <div style={{display:'flex',gap:'0.75rem',alignItems:'center'}}>
                    <span style={{fontSize:'0.68rem',fontWeight:'700',padding:'2px 8px',borderRadius:'10px',background:'rgba(29,158,117,0.15)',color:'#1D9E75'}}>{p.estado}</span>
                    <a href={'/proyectos/'+p.id+'/workspace'} style={{fontSize:'0.72rem',color:'#1D9E75',textDecoration:'none',fontWeight:'600'}}>Workspace →</a>
                    <a href={'/p/'+p.id} target="_blank" style={{fontSize:'0.72rem',color:'#8FA3CC',textDecoration:'none'}}>Público →</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'industrias' && (
          <div>
            <div style={{fontSize:'0.82rem',color:'#8FA3CC',marginBottom:'1.5rem',lineHeight:'1.6'}}>
              Estas plantillas se cargarán automáticamente cuando un proyecto defina su industria. Próximamente editables desde este panel.
            </div>
            {Object.entries(INDUSTRIAS).map(([industria, tareas]) => (
              <div key={industria} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem',marginBottom:'1rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
                  <div style={{fontSize:'0.9rem',fontWeight:'700',color:'#fff'}}>{industria}</div>
                  <span style={{fontSize:'0.68rem',fontWeight:'600',color:'#8FA3CC',background:'rgba(255,255,255,0.06)',padding:'2px 8px',borderRadius:'10px'}}>{tareas.length} tareas</span>
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:'0.4rem'}}>
                  {tareas.map((t, i) => (
                    <span key={i} style={{fontSize:'0.72rem',color:'#C8D4E8',background:'rgba(255,255,255,0.06)',padding:'0.25rem 0.625rem',borderRadius:'6px'}}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'paises' && (
          <div>
            <div style={{fontSize:'0.82rem',color:'#8FA3CC',marginBottom:'1.5rem',lineHeight:'1.6'}}>
              Cada país tiene tareas regulatorias específicas que se cargan al inicio del proyecto. Los especialistas regulatorios se filtran por jurisdicción.
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1rem'}}>
              {PAISES.map(pais => {
                const banderas = { 'Colombia':'🇨🇴', 'México':'🇲🇽', 'Perú':'🇵🇪', 'Chile':'🇨🇱', 'Argentina':'🇦🇷', 'España':'🇪🇸', 'Estados Unidos':'🇺🇸' }
                const tareas = {
                  'Colombia': ['Constituir SAS', 'Registro Cámara de Comercio', 'NIT DIAN', 'RUT', 'Facturación electrónica DIAN', 'Cuenta bancaria empresarial'],
                  'México': ['Constituir SA de CV o SAPI', 'Registro SAT', 'RFC', 'IMSS e INFONAVIT', 'Facturación CFDI', 'Cuenta bancaria empresarial'],
                  'Perú': ['Constituir SAC o SRL', 'RUC SUNAT', 'Registro SUNARP', 'Régimen tributario', 'Comprobantes electrónicos', 'Cuenta bancaria empresarial'],
                  'Chile': ['Constituir SpA o SRL', 'RUT empresa', 'SII inicio de actividades', 'Declaración IVA', 'Facturación electrónica SII', 'Cuenta bancaria empresarial'],
                  'Argentina': ['Constituir SAS o SRL', 'CUIT AFIP', 'Inscripción IGJ', 'Régimen monotributo o responsable inscripto', 'Facturación electrónica AFIP', 'Cuenta bancaria empresarial'],
                  'España': ['Constituir SL', 'NIF empresa', 'Registro mercantil', 'Alta IAE', 'Facturación electrónica AEAT', 'Cuenta bancaria empresarial'],
                  'Estados Unidos': ['Constituir LLC o C-Corp', 'EIN IRS', 'Registro estatal', 'Cuenta bancaria empresarial', 'Compliance fiscal estatal', 'Acuerdo operativo LLC'],
                }
                return (
                  <div key={pais} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem'}}>
                    <div style={{fontSize:'1.25rem',marginBottom:'0.4rem'}}>{banderas[pais]}</div>
                    <div style={{fontSize:'0.9rem',fontWeight:'700',color:'#fff',marginBottom:'0.875rem'}}>{pais}</div>
                    <div style={{display:'flex',flexDirection:'column',gap:'0.3rem'}}>
                      {(tareas[pais]||[]).map((t,i) => (
                        <div key={i} style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                          <div style={{width:'4px',height:'4px',borderRadius:'50%',background:'#1D9E75',flexShrink:0}}></div>
                          <span style={{fontSize:'0.75rem',color:'#8FA3CC'}}>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
