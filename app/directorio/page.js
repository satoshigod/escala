'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const roles = ['todos', 'especialista', 'ejecutor', 'ideador', 'capitalista', 'angel']
const rolLabel = { todos: 'Todos', especialista: 'Especialista', ejecutor: 'Ejecutor', ideador: 'Ideador', capitalista: 'Capitalista', angel: 'Angel' }

export default function Directorio() {
  const [usuario, setUsuario] = useState(null)
  const [perfiles, setPerfiles] = useState([])
  const [filtrados, setFiltrados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [rolFiltro, setRolFiltro] = useState('todos')
  const [ciudadFiltro, setCiudadFiltro] = useState('')
  const [paisFiltro, setPaisFiltro] = useState('')
  const [especialidadFiltro, setEspecialidadFiltro] = useState('')
  const [scoreMinimo, setScoreMinimo] = useState('')
  const [ordenarPor, setOrdenarPor] = useState('score')
  const [paisesDB, setPaisesDB] = useState([])
  const [especialidadesDB, setEspecialidadesDB] = useState([])
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false)

  const BANDERAS = { 'Colombia':'🇨🇴','México':'🇲🇽','Perú':'🇵🇪','Chile':'🇨🇱','Argentina':'🇦🇷','España':'🇪🇸','Estados Unidos':'🇺🇸' }

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)

      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .not('nombre', 'is', null)
        .order('escala_score', { ascending: false })

      if (!error) {
        setPerfiles(data || [])
        setFiltrados(data || [])
      }

      try {
        const [paisRes, espRes] = await Promise.all([fetch('/api/paises'), fetch('/api/especialidades')])
        const paisData = await paisRes.json()
        const espData = await espRes.json()
        setPaisesDB(paisData.paises || [])
        setEspecialidadesDB(espData.especialidades || [])
      } catch(e) {}

      setCargando(false)
    }
    cargar()
  }, [])

  useEffect(() => {
    let resultado = perfiles
    if (busqueda) {
      const q = busqueda.toLowerCase()
      resultado = resultado.filter(p =>
        p.nombre?.toLowerCase().includes(q) ||
        p.especialidad?.toLowerCase().includes(q) ||
        p.lo_que_aporto?.toLowerCase().includes(q)
      )
    }
    if (rolFiltro !== 'todos') resultado = resultado.filter(p => p.rol_principal === rolFiltro)
    if (ciudadFiltro) resultado = resultado.filter(p => p.ciudad?.toLowerCase().includes(ciudadFiltro.toLowerCase()))
    if (paisFiltro) resultado = resultado.filter(p => p.pais === paisFiltro)
    if (especialidadFiltro) resultado = resultado.filter(p => p.especialidad === especialidadFiltro)
    if (scoreMinimo) resultado = resultado.filter(p => (p.escala_score||0) >= parseInt(scoreMinimo))

    resultado = [...resultado].sort((a,b) => {
      if (ordenarPor === 'score') return (b.escala_score||0) - (a.escala_score||0)
      if (ordenarPor === 'alfabetico') return (a.nombre||'').localeCompare(b.nombre||'')
      if (ordenarPor === 'recientes') return new Date(b.created_at||0) - new Date(a.created_at||0)
      return 0
    })

    setFiltrados(resultado)
  }, [busqueda, rolFiltro, ciudadFiltro, paisFiltro, especialidadFiltro, scoreMinimo, ordenarPor, perfiles])

  const filtrosActivos = !!(busqueda||rolFiltro!=='todos'||ciudadFiltro||paisFiltro||especialidadFiltro||scoreMinimo)
  function limpiarTodo() {
    setBusqueda('');setRolFiltro('todos');setCiudadFiltro('');setPaisFiltro('');setEspecialidadFiltro('');setScoreMinimo('')
  }

  const ciudades = [...new Set(perfiles.map(p => p.ciudad).filter(Boolean))]
  const scoreColor = s => s >= 70 ? '#1D9E75' : s >= 40 ? '#E8A020' : '#8FA3CC'

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>Cargando directorio...</div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/dashboard" style={{textDecoration:'none'}}><div style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff'}}>Esca<span style={{color:'#1D9E75'}}>la</span></div></a>
        <div style={{display:'flex',gap:'1.5rem'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Dashboard</a>
          <a href="/proyectos" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Proyectos</a>
          <a href="/directorio" style={{color:'#fff',fontSize:'0.82rem',fontWeight:'600',textDecoration:'none'}}>Directorio</a>
        </div>
      </nav>

      <main style={{maxWidth:'1000px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'2rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.4rem'}}>Red de talento</div>
          <div style={{fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em',marginBottom:'0.3rem'}}>Directorio de especialistas</div>
          <div style={{fontSize:'0.85rem',color:'#8FA3CC'}}>{filtrados.length} persona{filtrados.length!==1?'s':''} en la red de Escala</div>
        </div>

        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem',marginBottom:'2rem'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:'0.75rem',flexWrap:'wrap'}}>
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, especialidad o habilidad..."
              style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.7rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',fontFamily:'Inter,sans-serif'}}
            />
            <select
              value={ciudadFiltro}
              onChange={e => setCiudadFiltro(e.target.value)}
              style={{background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.7rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',fontFamily:'Inter,sans-serif'}}
            >
              <option value="">Todas las ciudades</option>
              {ciudades.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={rolFiltro}
              onChange={e => setRolFiltro(e.target.value)}
              style={{background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.7rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',fontFamily:'Inter,sans-serif'}}
            >
              {roles.map(r => <option key={r} value={r}>{rolLabel[r]}</option>)}
            </select>
          </div>

          <button onClick={() => setMostrarFiltrosAvanzados(v => !v)} style={{marginTop:'0.75rem',background:'none',border:'none',color:'#1D9E75',fontSize:'0.78rem',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:'600'}}>
            {mostrarFiltrosAvanzados ? '▲ Ocultar filtros avanzados' : '▼ Filtros avanzados (país, especialidad, score)'}
          </button>

          {mostrarFiltrosAvanzados && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'0.75rem',marginTop:'0.75rem',paddingTop:'0.75rem',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
              <select value={paisFiltro} onChange={e => setPaisFiltro(e.target.value)} style={{background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.82rem',outline:'none',fontFamily:'Inter,sans-serif'}}>
                <option value="">Todos los países</option>
                {paisesDB.map(p => <option key={p.nombre} value={p.nombre}>{BANDERAS[p.nombre]||'🌐'} {p.nombre}</option>)}
              </select>
              <select value={especialidadFiltro} onChange={e => setEspecialidadFiltro(e.target.value)} style={{background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.82rem',outline:'none',fontFamily:'Inter,sans-serif'}}>
                <option value="">Cualquier especialidad</option>
                {especialidadesDB.map(e => <option key={e.nombre} value={e.nombre}>{e.nombre}</option>)}
              </select>
              <select value={scoreMinimo} onChange={e => setScoreMinimo(e.target.value)} style={{background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.82rem',outline:'none',fontFamily:'Inter,sans-serif'}}>
                <option value="">Cualquier score</option>
                <option value="20">Score 20+</option>
                <option value="50">Score 50+</option>
                <option value="80">Score 80+</option>
              </select>
              <select value={ordenarPor} onChange={e => setOrdenarPor(e.target.value)} style={{background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.82rem',outline:'none',fontFamily:'Inter,sans-serif'}}>
                <option value="score">Mayor score</option>
                <option value="alfabetico">Alfabético</option>
                <option value="recientes">Más recientes</option>
              </select>
            </div>
          )}

          {filtrosActivos && (
            <button onClick={limpiarTodo} style={{marginTop:'0.75rem',background:'none',border:'none',color:'#8FA3CC',fontSize:'0.78rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>✕ Limpiar filtros</button>
          )}
        </div>

        {filtrados.length === 0 ? (
          <div style={{textAlign:'center',padding:'3rem',color:'#8FA3CC'}}>
            <div style={{fontSize:'2rem',marginBottom:'1rem'}}>🔍</div>
            <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.5rem'}}>Sin resultados</div>
            <div style={{fontSize:'0.85rem'}}>Intenta con otros filtros.</div>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1rem'}}>
            {filtrados.map(p => (
              <a key={p.id} href={'/perfil/'+p.id} style={{textDecoration:'none',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'1.5rem',display:'block',transition:'border-color 0.2s'}} onMouseOver={e=>e.currentTarget.style.borderColor='rgba(29,158,117,0.4)'} onMouseOut={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.875rem'}}>
                  <div style={{width:'42px',height:'42px',borderRadius:'50%',background:'rgba(29,158,117,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',fontWeight:'700',color:'#1D9E75',flexShrink:0}}>
                    {(p.nombre||'U').charAt(0).toUpperCase()}
                  </div>
                  <div style={{fontFamily:'monospace',fontSize:'1.1rem',fontWeight:'700',color:scoreColor(p.escala_score||0)}}>{p.escala_score||0}</div>
                </div>
                <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>{p.nombre}</div>
                <div style={{fontSize:'0.75rem',color:'#8FA3CC',marginBottom:'0.5rem'}}>{p.ciudad||''}{p.pais?' · '+(BANDERAS[p.pais]||'🌐')+' '+p.pais:''}{p.especialidad?' · '+p.especialidad:''}</div>
                {p.rol_principal && (
                  <span style={{fontSize:'0.68rem',fontWeight:'700',padding:'0.2rem 0.6rem',borderRadius:'10px',background:'rgba(29,158,117,0.12)',color:'#1D9E75',border:'1px solid rgba(29,158,117,0.2)',display:'inline-block',marginBottom:'0.75rem'}}>
                    {rolLabel[p.rol_principal]||p.rol_principal}
                  </span>
                )}
                {p.lo_que_aporto && (
                  <div style={{fontSize:'0.78rem',color:'#8FA3CC',lineHeight:'1.5',marginBottom:'0.75rem',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>
                    {p.lo_que_aporto}
                  </div>
                )}
                {p.whatsapp && p.id !== usuario?.id && (
                  <div style={{fontSize:'0.75rem',color:'#1D9E75',fontWeight:'600'}}>Ver perfil y contactar →</div>
                )}
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
