'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../../lib/supabase'

const estadoConfig = {
  pendiente: { label: 'Pendiente', color: '#8FA3CC', bg: 'rgba(143,163,204,0.1)', icon: '○' },
  en_progreso: { label: 'En progreso', color: '#E8A020', bg: 'rgba(232,160,32,0.1)', icon: '◑' },
  completada: { label: 'Completada', color: '#1D9E75', bg: 'rgba(29,158,117,0.1)', icon: '◉' },
  verificada: { label: 'Verificada', color: '#AFA9EC', bg: 'rgba(175,169,236,0.1)', icon: '✓' },
}

export default function Tareas() {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [proyecto, setProyecto] = useState(null)
  const [roles, setRoles] = useState([])
  const [miRol, setMiRol] = useState(null)
  const [equipo, setEquipo] = useState([])
  const [tareas, setTareas] = useState([])
  const [plantillas, setPlantillas] = useState({})
  const [cargando, setCargando] = useState(true)
  const [acceso, setAcceso] = useState(false)
  const [esFundador, setEsFundador] = useState(false)
  const [esGerente, setEsGerente] = useState(false)
  const [actualizando, setActualizando] = useState(null)
  const [filtroRol, setFiltroRol] = useState('todos')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [mostrarNueva, setMostrarNueva] = useState(false)
  const [mostrarInicializar, setMostrarInicializar] = useState(false)
  const [nuevaTarea, setNuevaTarea] = useState({ nombre: '', descripcion: '', categoria: '', asignado_a: '', razon_creacion: '' })
  const [rolInicializar, setRolInicializar] = useState('')
  const [miembroInicializar, setMiembroInicializar] = useState('')
  const [creando, setCreando] = useState(false)

  function tareaPerteneceAMiRol(tarea) {
    if (!miRol || !tarea?.rol_nombre) return false
    const miNombre = `${miRol.nombre} ${miRol.sub_especialidad || ''}`.toLowerCase().trim()
    const rolTarea = tarea.rol_nombre.toLowerCase().trim()
    if (!miNombre || !rolTarea) return false
    if (miNombre === rolTarea) return true
    if (miNombre.includes(rolTarea) || rolTarea.includes(miNombre)) return true
    const miPalabras = miNombre.split(/\s+/).filter(Boolean)
    const rolPalabras = rolTarea.split(/\s+/).filter(Boolean)
    return miPalabras.some(word => word.length > 2 && rolPalabras.includes(word))
  }

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)

      const parts = window.location.pathname.split('/')
      const pid = parts[parts.indexOf('proyectos') + 1]

      const [pRes, perfilRes, rolesRes, postRes] = await Promise.all([
        fetch('/api/proyectos/' + pid),
        fetch('/api/usuarios?id=' + user.id),
        fetch('/api/roles?proyecto_id=' + pid),
        fetch('/api/postulaciones?postulante_id=' + user.id + '&proyecto_id=' + pid)
      ])

      const pData = await pRes.json()
      const perfilData = await perfilRes.json()
      const rolesData = await rolesRes.json()
      const postData = await postRes.json()

      const proy = pData.proyecto
      const todosRoles = rolesData.roles || []
      const posts = postData.postulaciones || []

      const esFund = proy?.fundador_id === user.id
      const miPost = posts.find(p => p.estado === 'aceptada' && p.roles?.proyecto_id === pid && todosRoles.some(r => r.id === p.rol_id))
      const miRol = todosRoles.find(r => r.id === miPost?.rol_id)
      const esGer = miRol?.nombre?.toLowerCase().includes('gerente')

      if (!esFund && !miPost) { setAcceso(false); setCargando(false); return }

      setAcceso(true)
      setProyecto(proy)
      setPerfil(perfilData.usuario)
      setRoles(todosRoles)
      setMiRol(miRol || null)
      setEsFundador(esFund)
      setEsGerente(esGer)

      // Cargar equipo
      const equipoData = []
      await Promise.all(todosRoles.map(async rol => {
        const r = await fetch('/api/postulaciones?rol_id=' + rol.id)
        const d = await r.json()
        if (d.postulaciones) {
          d.postulaciones.filter(p => p.estado === 'aceptada').forEach(p => {
            equipoData.push({ ...p, rol_nombre: rol.nombre })
          })
        }
      }))
      setEquipo(equipoData)

      // Cargar tareas
      const tRes = await fetch('/api/tareas?proyecto_id=' + pid)
      const tData = await tRes.json()
      setTareas(tData.tareas || [])
      setPlantillas(tData.plantillas || {})

      // Si no es fundador ni gerente, filtrar solo sus tareas
      if (!esFund && !esGer) {
        setFiltroRol('todos')
      }
      setCargando(false)
    }
    cargar()
  }, [])

  async function cambiarEstado(tarea, nuevoEstado) {
    setActualizando(tarea.id)
    const res = await fetch('/api/tareas', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tarea.id, estado: nuevoEstado, verificado_por: usuario?.id })
    })
    const data = await res.json()
    if (!data.error) setTareas(t => t.map(x => x.id === tarea.id ? data.tarea : x))
    setActualizando(null)
  }

  async function crearTarea() {
    if (!nuevaTarea.nombre) return
    setCreando(true)
    const parts = window.location.pathname.split('/')
    const pid = parts[parts.indexOf('proyectos') + 1]
    const miembro = equipo.find(e => e.postulante_id === nuevaTarea.asignado_a)
    const res = await fetch('/api/tareas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proyecto_id: pid,
        nombre: nuevaTarea.nombre,
        descripcion: nuevaTarea.descripcion,
        categoria: nuevaTarea.categoria || 'General',
        asignado_a: nuevaTarea.asignado_a || null,
        rol_nombre: miembro?.rol_nombre || '',
        creado_por: usuario?.id,
        razon_creacion: nuevaTarea.razon_creacion
      })
    })
    const data = await res.json()
    if (!data.error) {
      setTareas(t => [...t, data.tarea])
      setNuevaTarea({ nombre: '', descripcion: '', categoria: '', asignado_a: '', razon_creacion: '' })
      setMostrarNueva(false)
    }
    setCreando(false)
  }

  async function inicializarRol() {
    if (!rolInicializar) return
    setCreando(true)
    const parts = window.location.pathname.split('/')
    const pid = parts[parts.indexOf('proyectos') + 1]
    const res = await fetch('/api/tareas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proyecto_id: pid,
        rol_nombre: rolInicializar,
        asignado_a: miembroInicializar || null,
        creado_por: usuario?.id,
        inicializar: true
      })
    })
    const data = await res.json()
    if (!data.error) {
      setTareas(t => [...t, ...(data.tareas || [])])
      setMostrarInicializar(false)
      setRolInicializar('')
      setMiembroInicializar('')
    }
    setCreando(false)
  }

  const rolesTareas = [...new Set(tareas.map(t => t.rol_nombre).filter(Boolean))]
  const misTareas = tareas.filter(t =>
    t.asignado_a === usuario?.id ||
    (!t.asignado_a && tareaPerteneceAMiRol(t))
  )
  const [verTodas, setVerTodas] = useState(false)

  // Roles que requieren coincidencia de jurisdicción — la categoría legal/fiscal depende de la ley local
  const ROLES_REGULATORIOS = ['Abogado', 'Contador']
  // Categorías que, aunque coincidan con un rol regulatorio, no dependen de legislación local (propiedad intelectual, contratos internacionales, etc.) — quedan fuera de la restricción geográfica
  const ESPECIALIZACION_GLOBAL_KEYWORDS = ['internacional', 'propiedad intelectual', 'marcas', 'comercio exterior', 'compliance', 'protección de datos']

  // Asignación inteligente — filtra miembros del equipo según categoría de la tarea
  // y aplica restricción geográfica solo cuando el rol es regulatorio Y la tarea no es de especialización global
  function miembrosParaCategoria(categoria, esTareaRegulatoria) {
    const CATEGORIA_ROL = {
      'Legal': ['Abogado'],
      'Finanzas': ['Contador'],
      'Técnico': ['Desarrollador Full-Stack'],
      'Diseño': ['Diseñador'],
      'Marketing': ['Community Manager'],
      'Inversión': ['Inversionista inicial'],
      'Gestión': ['Gerente de Proyecto'],
    }
    const rolesCompatibles = CATEGORIA_ROL[categoria] || null
    if (!rolesCompatibles) return equipo // sin restricción de categoría, todos disponibles

    let candidatos = equipo.filter(e => rolesCompatibles.some(r => e.rol_nombre?.toLowerCase().includes(r.toLowerCase())))

    // Restricción geográfica: solo aplica a roles regulatorios cuando la tarea está marcada como tal
    const esRolRegulatorio = rolesCompatibles.some(r => ROLES_REGULATORIOS.includes(r))
    if (esRolRegulatorio && esTareaRegulatoria && proyecto?.pais) {
      candidatos = candidatos.filter(e => e.perfiles?.pais === proyecto.pais)
    }

    return candidatos
  }

  // Determina si una tarea es de naturaleza regulatoria local (categoría + nombre sugieren ley local)
  function esTareaRegulatoria(nombreTarea, categoria) {
    if (categoria !== 'Legal' && categoria !== 'Finanzas') return false
    const nombreLower = (nombreTarea || '').toLowerCase()
    const esGlobalPorPalabraClave = ESPECIALIZACION_GLOBAL_KEYWORDS.some(kw => nombreLower.includes(kw))
    return !esGlobalPorPalabraClave
  }
  const tareasFiltradas = tareas.filter(t => {
    if (!esFundador && !verTodas) {
      if (t.asignado_a === usuario?.id) return true
      if (!t.asignado_a && tareaPerteneceAMiRol(t)) return true
      return false
    }
    if (filtroRol !== 'todos' && t.rol_nombre !== filtroRol) return false
    if (filtroEstado !== 'todos' && t.estado !== filtroEstado) return false
    return true
  })

  const pctCompletadas = tareas.length > 0 ? Math.round((tareas.filter(t => t.estado === 'verificada' || t.estado === 'completada').length / tareas.length) * 100) : 0

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0B1628',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>Cargando tareas...</div>
  )

  if (!acceso) return (
    <div style={{minHeight:'100vh',background:'#0B1628',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif',gap:'1rem'}}>
      <div style={{fontSize:'2rem'}}>🔒</div>
      <div style={{color:'#fff',fontWeight:'700'}}>Acceso restringido</div>
      <a href="/proyectos" style={{color:'#1D9E75',textDecoration:'none'}}>← Ver proyectos</a>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0B1628',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <a href={'/proyectos/'+proyecto?.id+'/workspace'} style={{color:'#8FA3CC',textDecoration:'none',fontSize:'0.82rem'}}>← Workspace</a>
          <span style={{color:'rgba(255,255,255,0.2)'}}>·</span>
          <span style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff'}}>{proyecto?.nombre}</span>
          <span style={{fontSize:'0.75rem',color:'#8FA3CC'}}>— Plan de trabajo</span>
        </div>
        <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.78rem',textDecoration:'none'}}>Dashboard</a>
      </nav>

      <main style={{maxWidth:'1000px',margin:'0 auto',padding:'2rem 1.25rem'}}>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'2rem',flexWrap:'wrap',gap:'1rem'}}>
          <div>
            <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.4rem'}}>Plan de trabajo</div>
            <div style={{fontSize:'clamp(1.3rem,3vw,1.75rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em',marginBottom:'0.3rem'}}>{esFundador||esGerente ? 'Tareas del equipo' : 'Mis tareas'}</div>
            <div style={{fontSize:'0.82rem',color:'#8FA3CC'}}>{esFundador||esGerente ? `${tareas.length} tareas · ${pctCompletadas}% completadas` : `${misTareas.length} tareas asignadas · ${misTareas.filter(t=>t.estado==='completada'||t.estado==='verificada').length} completadas`}</div>
          </div>
          {(esFundador || esGerente) && (
            <div style={{display:'flex',gap:'0.5rem'}}>
              {esGerente && !esFundador && (
                <button onClick={()=>setVerTodas(!verTodas)} style={{background: verTodas ? 'rgba(232,160,32,0.15)' : 'rgba(255,255,255,0.06)', color: verTodas ? '#E8A020' : '#8FA3CC', border: verTodas ? '1px solid rgba(232,160,32,0.3)' : '1px solid rgba(255,255,255,0.12)', borderRadius:'8px', padding:'0.6rem 1rem', fontSize:'0.78rem', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif'}}>
                  {verTodas ? '👤 Ver solo mis tareas' : '👥 Ver todas las tareas'}
                </button>
              )}
              <button onClick={() => {setMostrarInicializar(!mostrarInicializar);setMostrarNueva(false)}} style={{background:'rgba(232,160,32,0.1)',color:'#E8A020',border:'1px solid rgba(232,160,32,0.25)',borderRadius:'8px',padding:'0.6rem 1rem',fontSize:'0.78rem',fontWeight:'600',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                📋 Cargar plantilla de rol
              </button>
              <button onClick={() => {setMostrarNueva(!mostrarNueva);setMostrarInicializar(false)}} style={{background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.6rem 1rem',fontSize:'0.78rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                + Nueva tarea
              </button>
            </div>
          )}
        </div>

        {tareas.length > 0 && (
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'0.875rem 1.25rem',marginBottom:'1.5rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.72rem',color:'#8FA3CC',marginBottom:'6px'}}>
              <span>Progreso general</span><span>{pctCompletadas}%</span>
            </div>
            <div style={{height:'6px',background:'rgba(255,255,255,0.08)',borderRadius:'3px',overflow:'hidden'}}>
              <div style={{height:'100%',width:pctCompletadas+'%',background:'linear-gradient(90deg,#1D9E75,#25c795)',borderRadius:'3px',transition:'width 0.5s'}}></div>
            </div>
          </div>
        )}

        {mostrarInicializar && (
          <div style={{background:'rgba(232,160,32,0.06)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'12px',padding:'1.5rem',marginBottom:'1.5rem'}}>
            <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff',marginBottom:'1rem'}}>Cargar plantilla de tareas por rol</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'1rem'}}>
              <div>
                <label style={{display:'block',fontSize:'0.68rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.3rem',letterSpacing:'0.04em',textTransform:'uppercase'}} htmlFor="tk-rol-inicial">Rol</label>
                <select id="tk-rol-inicial" value={rolInicializar} onChange={e=>setRolInicializar(e.target.value)} style={{width:'100%',background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',fontFamily:'Inter,sans-serif',boxSizing:'border-box'}}>
                  <option value="">Selecciona un rol...</option>
                  {Object.keys(plantillas).map(r => <option key={r} value={r}>{r} ({plantillas[r].length} tareas)</option>)}
                </select>
              </div>
              <div>
                <label style={{display:'block',fontSize:'0.68rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.3rem',letterSpacing:'0.04em',textTransform:'uppercase'}} htmlFor="tk-asignar-inicial">Asignar a (opcional)</label>
                <select id="tk-asignar-inicial" value={miembroInicializar} onChange={e=>setMiembroInicializar(e.target.value)} style={{width:'100%',background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',fontFamily:'Inter,sans-serif',boxSizing:'border-box'}}>
                  <option value="">Sin asignar</option>
                  {equipo.map(e => <option key={e.postulante_id} value={e.postulante_id}>{e.perfiles?.nombre} — {e.rol_nombre}</option>)}
                </select>
              </div>
            </div>
            {rolInicializar && (
              <div style={{fontSize:'0.75rem',color:'#8FA3CC',marginBottom:'1rem'}}>
                Se cargarán {plantillas[rolInicializar]?.length} tareas base para el rol de {rolInicializar}.
              </div>
            )}
            <div style={{display:'flex',gap:'0.75rem'}}>
              <button onClick={() => {setMostrarInicializar(false);setRolInicializar('')}} style={{background:'transparent',color:'#8FA3CC',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.6rem 1.25rem',fontSize:'0.82rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Cancelar</button>
              <button onClick={inicializarRol} disabled={!rolInicializar||creando} style={{background:'#E8A020',color:'#fff',border:'none',borderRadius:'8px',padding:'0.6rem 1.5rem',fontSize:'0.82rem',fontWeight:'700',cursor:rolInicializar?'pointer':'not-allowed',fontFamily:'Inter,sans-serif'}}>
                {creando ? 'Cargando...' : 'Cargar tareas →'}
              </button>
            </div>
          </div>
        )}

        {mostrarNueva && (
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.5rem',marginBottom:'1.5rem'}}>
            <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff',marginBottom:'1rem'}}>Nueva tarea</div>
            <div style={{marginBottom:'0.75rem'}}>
              <label style={{display:'block',fontSize:'0.68rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.3rem',letterSpacing:'0.04em',textTransform:'uppercase'}} htmlFor="tk-nombre">Nombre de la tarea *</label>
              <input id="tk-nombre" value={nuevaTarea.nombre} onChange={e=>setNuevaTarea(n=>({...n,nombre:e.target.value}))} placeholder="¿Qué hay que hacer?" style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif'}}/>
            </div>
            <div style={{marginBottom:'0.75rem'}}>
              <label style={{display:'block',fontSize:'0.68rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.3rem',letterSpacing:'0.04em',textTransform:'uppercase'}} htmlFor="tk-razon">¿Por qué se agrega esta tarea?</label>
              <input id="tk-razon" value={nuevaTarea.razon_creacion} onChange={e=>setNuevaTarea(n=>({...n,razon_creacion:e.target.value}))} placeholder="Contexto para que el equipo entienda por qué se necesita..." style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif'}}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.75rem',marginBottom:'1.25rem'}}>
              <div>
                <label style={{display:'block',fontSize:'0.68rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.3rem',letterSpacing:'0.04em',textTransform:'uppercase'}} htmlFor="tk-descripcion">Descripción</label>
                <input id="tk-descripcion" value={nuevaTarea.descripcion} onChange={e=>setNuevaTarea(n=>({...n,descripcion:e.target.value}))} placeholder="Detalle..." style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif'}}/>
              </div>
              <div>
                <label style={{display:'block',fontSize:'0.68rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.3rem',letterSpacing:'0.04em',textTransform:'uppercase'}} htmlFor="tk-categoria">Categoría</label>
                <select id="tk-categoria" value={nuevaTarea.categoria} onChange={e=>setNuevaTarea(n=>({...n,categoria:e.target.value}))} style={{width:'100%',background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',fontFamily:'Inter,sans-serif',boxSizing:'border-box'}}>
                  <option value="">General</option>
                  {['Legal','Finanzas','Técnico','Gestión','Diseño','Marketing','Inversión','Operaciones'].map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:'block',fontSize:'0.68rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.3rem',letterSpacing:'0.04em',textTransform:'uppercase'}} htmlFor="tk-asignado">Asignar a</label>
                <select id="tk-asignado" key={'asignar-' + nuevaTarea.categoria} value={nuevaTarea.asignado_a} onChange={e=>setNuevaTarea(n=>({...n,asignado_a:e.target.value}))} style={{width:'100%',background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',fontFamily:'Inter,sans-serif',boxSizing:'border-box'}}>
                  <option value="">Sin asignar</option>
                  {miembrosParaCategoria(nuevaTarea.categoria, esTareaRegulatoria(nuevaTarea.nombre, nuevaTarea.categoria)).map(e=><option key={e.postulante_id} value={e.postulante_id}>{e.perfiles?.nombre} — {e.rol_nombre}{e.perfiles?.pais ? ' (' + e.perfiles.pais + ')' : ''}</option>)}
                </select>
                {nuevaTarea.categoria && esTareaRegulatoria(nuevaTarea.nombre, nuevaTarea.categoria) && proyecto?.pais && (
                  <div style={{fontSize:'0.68rem',color:'#1D9E75',marginTop:'0.3rem'}}>
                    ✓ Filtrando por jurisdicción {proyecto.pais} — tarea regulatoria local
                  </div>
                )}
                {nuevaTarea.categoria && !esTareaRegulatoria(nuevaTarea.nombre, nuevaTarea.categoria) && (nuevaTarea.categoria==='Legal'||nuevaTarea.categoria==='Finanzas') && (
                  <div style={{fontSize:'0.68rem',color:'#E8A020',marginTop:'0.3rem'}}>
                    🌐 Especialización global — cualquier país disponible
                  </div>
                )}
                {nuevaTarea.categoria && nuevaTarea.categoria!=='Legal' && nuevaTarea.categoria!=='Finanzas' && miembrosParaCategoria(nuevaTarea.categoria, false).length < equipo.length && (
                  <div style={{fontSize:'0.68rem',color:'#1D9E75',marginTop:'0.3rem'}}>
                    ✓ Mostrando solo ejecutores compatibles con {nuevaTarea.categoria}
                  </div>
                )}
              </div>
            </div>

            <div style={{display:'flex',gap:'0.75rem'}}>
              <button onClick={()=>setMostrarNueva(false)} style={{background:'transparent',color:'#8FA3CC',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.6rem 1.25rem',fontSize:'0.82rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Cancelar</button>
              <button onClick={crearTarea} disabled={!nuevaTarea.nombre||creando} style={{background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.6rem 1.5rem',fontSize:'0.82rem',fontWeight:'700',cursor:nuevaTarea.nombre?'pointer':'not-allowed',fontFamily:'Inter,sans-serif'}}>
                {creando ? 'Creando...' : 'Crear tarea →'}
              </button>
            </div>
          </div>
        )}

        {tareas.length === 0 ? (
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
            <div style={{fontSize:'2rem',marginBottom:'0.75rem'}}>📋</div>
            <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.4rem'}}>Sin tareas todavía</div>
            <div style={{color:'#8FA3CC',fontSize:'0.85rem',marginBottom:'1.5rem'}}>Carga la plantilla de tareas para cada rol del equipo o crea tareas manualmente.</div>
            {(esFundador||esGerente) && (
              <button onClick={()=>setMostrarInicializar(true)} style={{background:'#E8A020',color:'#fff',border:'none',borderRadius:'8px',padding:'0.75rem 1.5rem',fontSize:'0.875rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                📋 Cargar plantilla de rol →
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginBottom:'1.5rem'}}>
              <button onClick={()=>setFiltroEstado('todos')} style={{background:filtroEstado==='todos'?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.04)',color:filtroEstado==='todos'?'#fff':'#8FA3CC',border:'none',borderRadius:'6px',padding:'0.35rem 0.875rem',fontSize:'0.72rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Todas</button>
              {['pendiente','en_progreso','completada','verificada'].map(e=><button key={e} onClick={()=>setFiltroEstado(e)} style={{background:filtroEstado===e?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.04)',color:filtroEstado===e?'#fff':'#8FA3CC',border:'none',borderRadius:'6px',padding:'0.35rem 0.875rem',fontSize:'0.72rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>{estadoConfig[e]?.label}</button>)}
              {(esFundador || verTodas) && (
                <>
                  <span style={{width:'1px',background:'rgba(255,255,255,0.1)',margin:'0 0.25rem'}}></span>
                  <button onClick={()=>setFiltroRol('todos')} style={{background:filtroRol==='todos'?'#1D9E75':'rgba(255,255,255,0.06)',color:filtroRol==='todos'?'#fff':'#8FA3CC',border:'none',borderRadius:'6px',padding:'0.35rem 0.875rem',fontSize:'0.75rem',fontWeight:'600',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Todos los roles</button>
                  {rolesTareas.map(r=><button key={r} onClick={()=>setFiltroRol(r)} style={{background:filtroRol===r?'#1D9E75':'rgba(255,255,255,0.06)',color:filtroRol===r?'#fff':'#8FA3CC',border:'none',borderRadius:'6px',padding:'0.35rem 0.875rem',fontSize:'0.75rem',fontWeight:'600',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>{r}</button>)}
                </>
              )}
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              {tareasFiltradas.map(t => {
                const cfg = estadoConfig[t.estado] || estadoConfig.pendiente
                const esMia = t.asignado_a === usuario?.id
                const puedeVerificar = (esFundador || esGerente) && t.estado === 'completada'
                const puedeMover = esMia || esFundador || esGerente

                return (
                  <div key={t.id} style={{background: esMia ? 'rgba(29,158,117,0.04)' : 'rgba(255,255,255,0.03)', border: esMia ? '1px solid rgba(29,158,117,0.15)' : '1px solid rgba(255,255,255,0.07)', borderRadius:'10px', padding:'1rem 1.25rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem',flexWrap:'wrap'}}>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',gap:'0.5rem',alignItems:'center',marginBottom:'0.3rem',flexWrap:'wrap'}}>
                          {t.rol_nombre && <span style={{fontSize:'0.62rem',fontWeight:'700',color:'#8FA3CC',letterSpacing:'0.06em',textTransform:'uppercase'}}>{t.rol_nombre}</span>}
                          {t.categoria && <span style={{fontSize:'0.62rem',padding:'1px 6px',borderRadius:'4px',background:'rgba(255,255,255,0.06)',color:'#8FA3CC'}}>{t.categoria}</span>}
                          {esMia && <span style={{fontSize:'0.62rem',fontWeight:'700',color:'#1D9E75'}}>● Mía</span>}
                          {t.razon_creacion && <span style={{fontSize:'0.62rem',color:'#6B7280'}}>+ agregada</span>}
                        </div>
                        <div style={{fontSize:'0.875rem',fontWeight:'600',color: t.estado==='verificada' ? '#AFA9EC' : '#fff', textDecoration: t.estado==='verificada'?'line-through':'none', marginBottom:'0.2rem'}}>{t.nombre}</div>
                        {t.descripcion && <div style={{fontSize:'0.75rem',color:'#8FA3CC',lineHeight:'1.5',marginBottom:'0.3rem'}}>{t.descripcion}</div>}
                        {t.razon_creacion && <div style={{fontSize:'0.7rem',color:'#6B7280',fontStyle:'italic'}}>Por qué: {t.razon_creacion}</div>}
                        <div style={{fontSize:'0.68rem',color:'#6B7280',marginTop:'0.3rem'}}>
                          {t.asignado_perfil?.nombre ? 'Asignada a ' + t.asignado_perfil.nombre : 'Sin asignar'}
                          {t.creador?.nombre && t.razon_creacion ? ' · Creada por ' + t.creador.nombre : ''}
                          {t.completado_at ? ' · Completada ' + new Date(t.completado_at).toLocaleDateString('es-CO') : ''}
                          {t.verificado_perfil?.nombre ? ' · Verificada por ' + t.verificado_perfil.nombre : ''}
                        </div>
                      </div>

                      <div style={{display:'flex',gap:'0.4rem',alignItems:'center',flexShrink:0}}>
                        <span style={{fontSize:'0.7rem',fontWeight:'700',padding:'0.2rem 0.75rem',borderRadius:'20px',background:cfg.bg,color:cfg.color}}>
                          {cfg.icon} {cfg.label}
                        </span>
                        {puedeMover && t.estado === 'pendiente' && (
                          <button onClick={()=>cambiarEstado(t,'en_progreso')} disabled={actualizando===t.id} style={{background:'rgba(232,160,32,0.12)',color:'#E8A020',border:'1px solid rgba(232,160,32,0.25)',borderRadius:'6px',padding:'0.25rem 0.625rem',fontSize:'0.7rem',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:'600'}}>
                            {actualizando===t.id?'...':'Iniciar'}
                          </button>
                        )}
                        {puedeMover && t.estado === 'en_progreso' && (
                          <button onClick={()=>cambiarEstado(t,'completada')} disabled={actualizando===t.id} style={{background:'rgba(29,158,117,0.12)',color:'#1D9E75',border:'1px solid rgba(29,158,117,0.25)',borderRadius:'6px',padding:'0.25rem 0.625rem',fontSize:'0.7rem',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:'600'}}>
                            {actualizando===t.id?'...':'Completar'}
                          </button>
                        )}
                        {puedeVerificar && (
                          <button onClick={()=>cambiarEstado(t,'verificada')} disabled={actualizando===t.id} style={{background:'rgba(175,169,236,0.12)',color:'#AFA9EC',border:'1px solid rgba(175,169,236,0.25)',borderRadius:'6px',padding:'0.25rem 0.625rem',fontSize:'0.7rem',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:'600'}}>
                            {actualizando===t.id?'...':'✓ Verificar'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
