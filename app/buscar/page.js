'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Buscar() {
  const [usuario, setUsuario] = useState(null)
  const [proyectos, setProyectos] = useState([])
  const [filtrados, setFiltrados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [sector, setSector] = useState('')
  const [tipo, setTipo] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [pais, setPais] = useState('')
  const [industria, setIndustria] = useState('')
  const [especialidadBuscada, setEspecialidadBuscada] = useState('')
  const [ordenarPor, setOrdenarPor] = useState('recientes')
  const [paisesDB, setPaisesDB] = useState([])
  const [industriasDB, setIndustriasDB] = useState([])
  const [especialidadesDB, setEspecialidadesDB] = useState([])
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false)

  const BANDERAS = { 'Colombia':'🇨🇴','México':'🇲🇽','Perú':'🇵🇪','Chile':'🇨🇱','Argentina':'🇦🇷','España':'🇪🇸','Estados Unidos':'🇺🇸' }

  const sectores = ['Tecnología','Salud','Educación','Agro','Comercio','Servicios','Construcción','Alimentos','Moda','Otro']

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)
      const [res, paisRes, indRes, espRes] = await Promise.all([
        fetch('/api/proyectos'),
        fetch('/api/paises'),
        fetch('/api/industrias').catch(() => ({ json: () => ({ industrias: [] }) })),
        fetch('/api/especialidades'),
      ])
      const data = await res.json()
      setProyectos(data.proyectos || [])
      setFiltrados(data.proyectos || [])
      try {
        const paisData = await paisRes.json()
        setPaisesDB(paisData.paises || [])
      } catch(e) {}
      try {
        const espData = await espRes.json()
        setEspecialidadesDB(espData.especialidades || [])
      } catch(e) {}
      setCargando(false)
    }
    cargar()
  }, [])

  useEffect(() => {
    let r = proyectos
    if (busqueda) {
      const q = busqueda.toLowerCase()
      r = r.filter(p => p.nombre?.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q))
    }
    if (sector) r = r.filter(p => p.sector === sector)
    if (tipo) r = r.filter(p => p.tipo === tipo)
    if (ciudad) r = r.filter(p => p.ciudad?.toLowerCase().includes(ciudad.toLowerCase()))
    if (pais) r = r.filter(p => p.pais === pais)
    if (industria) r = r.filter(p => p.industria === industria)
    if (especialidadBuscada) {
      r = r.filter(p => p.roles?.some(rol => rol.estado === 'abierto' && rol.nombre?.toLowerCase().includes(especialidadBuscada.toLowerCase())))
    }

    r = [...r].sort((a, b) => {
      if (ordenarPor === 'recientes') return new Date(b.created_at) - new Date(a.created_at)
      if (ordenarPor === 'antiguos') return new Date(a.created_at) - new Date(b.created_at)
      if (ordenarPor === 'mas_roles') return (b.roles?.filter(rl=>rl.estado==='abierto').length||0) - (a.roles?.filter(rl=>rl.estado==='abierto').length||0)
      if (ordenarPor === 'alfabetico') return (a.nombre||'').localeCompare(b.nombre||'')
      return 0
    })

    setFiltrados(r)
  }, [busqueda, sector, tipo, ciudad, pais, industria, especialidadBuscada, ordenarPor, proyectos])

  const filtrosActivos = !!(busqueda||sector||tipo||ciudad||pais||industria||especialidadBuscada)
  function limpiarTodo() {
    setBusqueda('');setSector('');setTipo('');setCiudad('');setPais('');setIndustria('');setEspecialidadBuscada('')
  }

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>Buscando...</div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/dashboard" style={{textDecoration:'none',display:'flex',alignItems:'center'}}><img src="/brand/isotipo.svg" alt="Escala" width="26" height="26" style={{display:"inline-block",verticalAlign:"middle",marginRight:"6px"}}/><span style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Esca<span style={{color:'#1D9E75'}}>la</span></span></a>
        <div style={{display:'flex',gap:'1.5rem'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Dashboard</a>
          <a href="/directorio" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Directorio</a>
          <a href="/buscar" style={{color:'#fff',fontSize:'0.82rem',fontWeight:'600',textDecoration:'none'}}>Buscar</a>
        </div>
      </nav>

      <main style={{maxWidth:'1000px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'2rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.4rem'}}>Explorar</div>
          <div style={{fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em',marginBottom:'0.3rem'}}>Buscar proyectos</div>
          <div style={{fontSize:'0.85rem',color:'#8FA3CC'}}>{filtrados.length} proyecto{filtrados.length!==1?'s':''} encontrado{filtrados.length!==1?'s':''}</div>
        </div>

        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem',marginBottom:'2rem'}}>
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
            style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.7rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',fontFamily:'Inter,sans-serif',boxSizing:'border-box',marginBottom:'0.75rem'}}
          />
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.75rem'}}>
            <select value={sector} onChange={e => setSector(e.target.value)} style={{background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.82rem',outline:'none',fontFamily:'Inter,sans-serif'}}>
              <option value="">Todos los sectores</option>
              {sectores.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={tipo} onChange={e => setTipo(e.target.value)} style={{background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.82rem',outline:'none',fontFamily:'Inter,sans-serif'}}>
              <option value="">Tipo A y B</option>
              <option value="A">Tipo A — Empresa nueva</option>
              <option value="B">Tipo B — Transformación</option>
            </select>
            <input value={ciudad} onChange={e => setCiudad(e.target.value)} placeholder="Ciudad..." style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.82rem',outline:'none',fontFamily:'Inter,sans-serif'}}/>
          </div>

          <button onClick={() => setMostrarFiltrosAvanzados(v => !v)} style={{marginTop:'0.75rem',background:'none',border:'none',color:'#1D9E75',fontSize:'0.78rem',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:'600'}}>
            {mostrarFiltrosAvanzados ? '▲ Ocultar filtros avanzados' : '▼ Filtros avanzados (país, industria, rol, orden)'}
          </button>

          {mostrarFiltrosAvanzados && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'0.75rem',marginTop:'0.75rem',paddingTop:'0.75rem',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
              <select value={pais} onChange={e => setPais(e.target.value)} style={{background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.82rem',outline:'none',fontFamily:'Inter,sans-serif'}}>
                <option value="">Todos los países</option>
                {paisesDB.map(p => <option key={p.nombre} value={p.nombre}>{BANDERAS[p.nombre]||'🌐'} {p.nombre}</option>)}
              </select>
              <select value={industria} onChange={e => setIndustria(e.target.value)} style={{background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.82rem',outline:'none',fontFamily:'Inter,sans-serif'}}>
                <option value="">Todas las industrias</option>
                {industriasDB.map(i => <option key={i.nombre||i} value={i.nombre||i}>{i.nombre||i}</option>)}
              </select>
              <select value={especialidadBuscada} onChange={e => setEspecialidadBuscada(e.target.value)} style={{background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.82rem',outline:'none',fontFamily:'Inter,sans-serif'}}>
                <option value="">Buscan cualquier rol</option>
                {especialidadesDB.map(e => <option key={e.nombre} value={e.nombre}>Buscan: {e.nombre}</option>)}
              </select>
              <select value={ordenarPor} onChange={e => setOrdenarPor(e.target.value)} style={{background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.82rem',outline:'none',fontFamily:'Inter,sans-serif'}}>
                <option value="recientes">Más recientes</option>
                <option value="antiguos">Más antiguos</option>
                <option value="mas_roles">Más roles abiertos</option>
                <option value="alfabetico">Alfabético</option>
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
            <div style={{fontSize:'0.85rem',marginBottom:'1.5rem'}}>Intenta con otros filtros o publica tu propio proyecto.</div>
            <a href="/proyectos" style={{background:'#1D9E75',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.875rem',fontWeight:'700'}}>+ Publicar proyecto</a>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1rem'}}>
            {filtrados.map(p => (
              <a key={p.id} href={'/proyectos/'+p.id} style={{textDecoration:'none',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',overflow:'hidden',display:'block',transition:'border-color 0.2s'}} onMouseOver={e=>e.currentTarget.style.borderColor='rgba(29,158,117,0.4)'} onMouseOut={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}>
                <div style={{background:'#0A1530',padding:'1.25rem',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                  <div title={p.tipo==='A' ? 'Tipo A: idea de negocio que busca equipo y capital desde cero' : 'Tipo B: empresa existente que busca talento externo para resolver una brecha específica'} style={{fontSize:'0.62rem',fontWeight:'700',color:'#1D9E75',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'0.4rem',cursor:'help'}}>Tipo {p.tipo} — {p.tipo==='A'?'Empresa nueva':'Transformación'} ⓘ</div>
                  <div style={{fontSize:'1rem',fontWeight:'800',color:'#fff',marginBottom:'0.2rem'}}>{p.nombre}</div>
                  <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>{p.sector} · {p.ciudad}{p.pais ? ' · ' + (BANDERAS[p.pais]||'🌐') + ' ' + p.pais : ''}{p.industria ? ' · ' + p.industria : ''}</div>
                </div>
                <div style={{padding:'1.25rem'}}>
                  <div style={{fontSize:'0.82rem',color:'#8FA3CC',lineHeight:'1.6',marginBottom:'1rem',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical'}}>{p.descripcion}</div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:'0.68rem',fontWeight:'700',padding:'0.2rem 0.7rem',borderRadius:'20px',background:'rgba(29,158,117,0.15)',color:'#1D9E75',border:'1px solid rgba(29,158,117,0.3)'}}>● {p.estado}</span>
                    <span style={{fontSize:'0.75rem',color:'#1D9E75',fontWeight:'600'}}>Ver roles →</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
