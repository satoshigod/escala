'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../../lib/supabase'

const estadoConfig = {
  pendiente: { label: 'Pendiente', color: '#8FA3CC', bg: 'rgba(143,163,204,0.1)', icon: 'o' },
  en_progreso: { label: 'En progreso', color: '#E8A020', bg: 'rgba(232,160,32,0.1)', icon: '~' },
  completada: { label: 'Completada', color: '#1D9E75', bg: 'rgba(29,158,117,0.1)', icon: '*' },
  verificada: { label: 'Verificada', color: '#AFA9EC', bg: 'rgba(175,169,236,0.1)', icon: 'v' },
}

function normalizarTexto(text) {
  return (text || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

function detectarRolConstitucion(nombreRol, subEsp) {
  const n = normalizarTexto(nombreRol || '')
  const s = normalizarTexto(subEsp || '')
  const esConstitucion = /constituc/.test(n + ' ' + s)
  if (!esConstitucion) return null
  if (/abogado|legal|juridico/.test(n + ' ' + s)) return 'Abogado'
  if (/contador|contable|contabilidad|tributario/.test(n + ' ' + s)) return 'Contador'
  return null
}

export default function Tareas() {
  const [usuario, setUsuario] = useState(null)
  const [proyecto, setProyecto] = useState(null)
  const [roles, setRoles] = useState([])
  const [miRol, setMiRol] = useState(null)
  const [equipo, setEquipo] = useState([])
  const [tareas, setTareas] = useState([])
  const [plantillas, setPlantillas] = useState({})
  const [segmentos, setSegmentos] = useState({})
  const [segmentoInicializar, setSegmentoInicializar] = useState('')
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
  const [verTodas, setVerTodas] = useState(false)
  const [rolesConstitucionSinCubrir, setRolesConstitucionSinCubrir] = useState([]) // roles que el fundador puede asumir

  function getProyectoIdFromPath() {
    const parts = window.location.pathname.split('/').filter(Boolean)
    const idx = parts.indexOf('proyectos')
    return idx !== -1 ? parts[idx + 1] : null
  }

  function tareaPerteneceAMiRol(tarea) {
    if (!miRol || !tarea) return false
    const miNombre = normalizarTexto(`${miRol.nombre} ${miRol.sub_especialidad || ''}`).trim()
    const esRolLegal = /abogado|legal|juridico/.test(miNombre)
    const esRolContable = /contador|contable|contabilidad|tributario/.test(miNombre)
    const categoria = normalizarTexto(tarea.categoria)
    const rolTarea = normalizarTexto(tarea.rol_nombre)
    if (categoria.includes('constituc') || rolTarea.includes('constituc')) return esRolLegal || esRolContable
    if (!tarea.rol_nombre) {
      if (categoria === 'legal' && esRolLegal) return true
      if (categoria === 'finanzas' && esRolContable) return true
      return false
    }
    if (!miNombre || !rolTarea) return false
    if (miNombre === rolTarea) return true
    if (miNombre.includes(rolTarea) || rolTarea.includes(miNombre)) return true
    const miPalabras = miNombre.split(/\s+/).filter(Boolean)
    const rolPalabras = rolTarea.split(/\s+/).filter(Boolean)
    return miPalabras.some(w => w.length > 2 && rolPalabras.includes(w))
  }

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)

      const pid = getProyectoIdFromPath()
      if (!pid || pid === 'undefined') { window.location.href = '/proyectos'; return }

      const [pRes, rolesRes, postRes] = await Promise.all([
        fetch('/api/proyectos/' + pid),
        fetch('/api/roles?proyecto_id=' + pid),
        fetch('/api/postulaciones?postulante_id=' + user.id + '&proyecto_id=' + pid)
      ])

      const pData = await pRes.json()
      const rolesData = await rolesRes.json()
      const postData = await postRes.json()

      const proy = pData.proyecto
      const todosRoles = rolesData.roles || []
      const posts = postData.postulaciones || []

      const esFund = proy?.fundador_id === user.id
      const miPost = posts.find(p => p.estado === 'aceptada' && p.roles?.proyecto_id === pid && todosRoles.some(r => r.id === p.rol_id))
      const rolEncontrado = todosRoles.find(r => r.id === miPost?.rol_id)
      const esGer = rolEncontrado?.nombre?.toLowerCase().includes('gerente')

      if (!esFund && !miPost) { setAcceso(false); setCargando(false); return }

      setAcceso(true)
      setProyecto(proy)
      setRoles(todosRoles)
      setMiRol(rolEncontrado || null)
      setEsFundador(esFund)
      setEsGerente(esGer)

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

      const tRes = await fetch('/api/tareas?proyecto_id=' + pid)
      const tData = await tRes.json()
      let tareasActuales = tData.tareas || []
      setPlantillas(tData.plantillas || {})
      setSegmentos(tData.segmentos || {})

      if (!esFund && rolEncontrado) {
        const rolTipo = detectarRolConstitucion(rolEncontrado.nombre, rolEncontrado.sub_especialidad)
        if (rolTipo) {
          const misTareasActuales = tareasActuales.filter(t => t.asignado_a === user.id)
          if (misTareasActuales.length === 0) {
            const initRes = await fetch('/api/tareas', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                proyecto_id: pid,
                inicializar_constitucion: true,
                rol_nombre_especialista: rolEncontrado.nombre,
                sub_especialidad: rolEncontrado.sub_especialidad || '',
                asignado_a: user.id,
                creado_por: user.id,
              })
            })
            const initData = await initRes.json()
            if (initData.tareas?.length > 0) tareasActuales = [...tareasActuales, ...initData.tareas]
          }
        }
      }

      setTareas(tareasActuales)

      // ── BOOTSTRAPPING: detectar roles de constitución sin especialista ──
      // Si el fundador no tiene nadie aceptado en abogado/contador de constitución,
      // le ofrecemos asumir ese rol él mismo.
      if (esFund) {
        const sinCubrir = []
        for (const rol of todosRoles) {
          const textoRol = (rol.nombre + ' ' + (rol.sub_especialidad || '')).toLowerCase()
          const esConstitucion = textoRol.includes('constituc') || textoRol.includes('constituci')
          const esRolLegal = textoRol.includes('abogado') || textoRol.includes('contador') || textoRol.includes('legal') || textoRol.includes('contab')
          if (!esConstitucion || !esRolLegal) continue

          const hayEspecialista = equipoData.some(e => {
            const rId = todosRoles.find(r => r.nombre === e.rol_nombre)?.id
            return rId === rol.id
          })
          if (hayEspecialista) continue

          const rolTipo = (textoRol.includes('abogado') || textoRol.includes('legal')) ? 'Abogado' : 'Contador'

          const yaBootstrapped = tareasActuales.some(t =>
            t.asignado_a === user.id &&
            t.rol_nombre === rolTipo &&
            (t.razon_creacion || '').includes('Bootstrapping')
          )
          if (!yaBootstrapped) sinCubrir.push({ ...rol, rolTipo })
        }
        setRolesConstitucionSinCubrir(sinCubrir)
      }

      setCargando(false)
    }
    cargar()
  }, [])

  async function asumiRol(rol) {
    const pid = getProyectoIdFromPath()
    const res = await fetch('/api/tareas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proyecto_id: pid,
        inicializar_bootstrapping: true,
        rol_tipo: rol.rolTipo,
        asignado_a: usuario?.id,
        creado_por: usuario?.id,
      })
    })
    const data = await res.json()
    if (data.tareas?.length > 0) {
      setTareas(t => [...t, ...data.tareas])
      setRolesConstitucionSinCubrir(prev => prev.filter(r => r.id !== rol.id))
    } else if (data.ya_inicializado) {
      setRolesConstitucionSinCubrir(prev => prev.filter(r => r.id !== rol.id))
    }
  }

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
    const pid = getProyectoIdFromPath()
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
    const pid = getProyectoIdFromPath()
    const res = await fetch('/api/tareas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proyecto_id: pid, rol_nombre: rolInicializar, segmento: segmentoInicializar || null, asignado_a: miembroInicializar || null, creado_por: usuario?.id, inicializar: true })
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
  const misTareas = tareas.filter(t => t.asignado_a === usuario?.id)
  const tareasAsignadasAMi = tareas.filter(t => t.asignado_a === usuario?.id)
  const [rolesAbiertos, setRolesAbiertos] = useState({})
  const [segmentosAbiertos, setSegmentosAbiertos] = useState({})

  function toggleRol(rol) {
    setRolesAbiertos(prev => ({ ...prev, [rol]: !prev[rol] }))
  }

  function toggleSegmento(rol, segmento) {
    const key = rol + '|||' + segmento
    setSegmentosAbiertos(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Extraer el segmento de la razon_creacion de una tarea
  function getSegmento(tarea) {
    const r = tarea.razon_creacion || ''
    // Tareas del sistema de países regulatorios → siempre bajo "Constitución de empresas"
    if (r.includes('regulatori') || r.includes('Tarea regulatoria')) {
      return 'Constitución de empresas'
    }
    const match = r.match(/— (.+)$/)
    return match ? match[1] : 'General'
  }

  const ROLES_REGULATORIOS = ['Abogado', 'Contador']
  const GLOBAL_KW = ['internacional', 'propiedad intelectual', 'marcas', 'comercio exterior']

  function miembrosParaCategoria(categoria) {
    const MAP = { 'Legal': ['Abogado'], 'Finanzas': ['Contador'], 'Tecnico': ['Desarrollador Full-Stack'], 'Diseno': ['Disenador'], 'Marketing': ['Community Manager'], 'Inversion': ['Inversionista inicial'], 'Gestion': ['Gerente de Proyecto'] }
    const rolesC = MAP[categoria] || null
    if (!rolesC) return equipo
    return equipo.filter(e => rolesC.some(r => e.rol_nombre?.toLowerCase().includes(r.toLowerCase())))
  }

  function esTareaRegulatoria(nombre, categoria) {
    if (categoria !== 'Legal' && categoria !== 'Finanzas') return false
    return !GLOBAL_KW.some(kw => (nombre || '').toLowerCase().includes(kw))
  }

  const tareasFiltradas = tareas.filter(t => {
    if (!esFundador && !verTodas) {
      const esMia = t.asignado_a === usuario?.id || (!t.asignado_a && tareasAsignadasAMi.length === 0 && tareaPerteneceAMiRol(t))
      if (!esMia) return false
      if (filtroEstado !== 'todos' && t.estado !== filtroEstado) return false
      return true
    }
    if (filtroRol !== 'todos' && t.rol_nombre !== filtroRol) return false
    if (filtroEstado !== 'todos' && t.estado !== filtroEstado) return false
    return true
  })

  const pctCompletadas = tareas.length > 0
    ? Math.round((tareas.filter(t => t.estado === 'verificada' || t.estado === 'completada').length / tareas.length) * 100)
    : 0

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0B1628',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>Cargando tareas...</div>
  )

  if (!acceso) return (
    <div style={{minHeight:'100vh',background:'#0B1628',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif',gap:'1rem'}}>
      <div style={{fontSize:'2rem'}}>&#x1F512;</div>
      <div style={{color:'#fff',fontWeight:'700'}}>Acceso restringido</div>
      <a href="/proyectos" style={{color:'#1D9E75',textDecoration:'none'}}>Ver proyectos</a>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0B1628',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <a href={'/proyectos/'+proyecto?.id+'/workspace'} style={{color:'#8FA3CC',textDecoration:'none',fontSize:'0.82rem'}}>Workspace</a>
          <span style={{color:'rgba(255,255,255,0.2)'}}>·</span>
          <span style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff'}}>{proyecto?.nombre}</span>
          <span style={{fontSize:'0.75rem',color:'#8FA3CC'}}>Plan de trabajo</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.78rem',textDecoration:'none'}}>Dashboard</a>
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/registro?modo=login' }} style={{background:'rgba(216,90,48,0.1)',border:'1px solid rgba(216,90,48,0.25)',color:'#D85A30',fontSize:'0.75rem',fontWeight:'600',padding:'0.3rem 0.75rem',borderRadius:'6px',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Salir</button>
        </div>
      </nav>

      <main style={{maxWidth:'1000px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'2rem',flexWrap:'wrap',gap:'1rem'}}>
          <div>
            <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.4rem'}}>Plan de trabajo</div>
            <div style={{fontSize:'clamp(1.3rem,3vw,1.75rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em',marginBottom:'0.3rem'}}>
              {esFundador||esGerente ? 'Tareas del equipo' : 'Mis tareas'}
            </div>
            <div style={{fontSize:'0.82rem',color:'#8FA3CC'}}>
              {esFundador||esGerente
                ? `${tareas.length} tareas · ${pctCompletadas}% completadas`
                : `${misTareas.length} tareas asignadas · ${misTareas.filter(t=>t.estado==='completada'||t.estado==='verificada').length} completadas`}
            </div>
          </div>
          {(esFundador || esGerente) && (
            <div style={{display:'flex',gap:'0.5rem'}}>
              {esGerente && !esFundador && (
                <button onClick={()=>setVerTodas(!verTodas)} style={{background: verTodas ? 'rgba(232,160,32,0.15)' : 'rgba(255,255,255,0.06)', color: verTodas ? '#E8A020' : '#8FA3CC', border: verTodas ? '1px solid rgba(232,160,32,0.3)' : '1px solid rgba(255,255,255,0.12)', borderRadius:'8px', padding:'0.6rem 1rem', fontSize:'0.78rem', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif'}}>
                  {verTodas ? 'Ver solo mis tareas' : 'Ver todas las tareas'}
                </button>
              )}
              <button onClick={() => {setMostrarInicializar(!mostrarInicializar);setMostrarNueva(false)}} style={{background:'rgba(232,160,32,0.1)',color:'#E8A020',border:'1px solid rgba(232,160,32,0.25)',borderRadius:'8px',padding:'0.6rem 1rem',fontSize:'0.78rem',fontWeight:'600',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                Cargar plantilla de rol
              </button>
              <button onClick={() => {setMostrarNueva(!mostrarNueva);setMostrarInicializar(false)}} style={{background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.6rem 1rem',fontSize:'0.78rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                + Nueva tarea
              </button>
            </div>
          )}
        </div>

        {rolesConstitucionSinCubrir.length > 0 && esFundador && (
          <div style={{background:'rgba(232,160,32,0.06)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'12px',padding:'1.25rem',marginBottom:'1.5rem'}}>
            <div style={{fontSize:'0.82rem',fontWeight:'700',color:'#E8A020',marginBottom:'0.4rem'}}>Roles de constitucion sin especialista</div>
            <div style={{fontSize:'0.78rem',color:'#8FA3CC',marginBottom:'1rem',lineHeight:'1.6'}}>
              No tienes especialista aceptado para estos roles. Puedes asumir tu mismo las tareas — quedan registradas y si despues llega el especialista complementa lo que falta.
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              {rolesConstitucionSinCubrir.map(rol => (
                <div key={rol.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(255,255,255,0.03)',borderRadius:'8px',padding:'0.75rem 1rem'}}>
                  <div>
                    <div style={{fontSize:'0.82rem',fontWeight:'600',color:'#fff'}}>{rol.nombre}{rol.sub_especialidad ? ' - ' + rol.sub_especialidad : ''}</div>
                    <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'2px'}}>Sin especialista asignado - Bootstrapping disponible</div>
                  </div>
                  <button onClick={() => asumiRol(rol)} style={{background:'#E8A020',border:'none',color:'#fff',borderRadius:'8px',padding:'0.5rem 1rem',fontSize:'0.78rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap'}}>
                    Asumir este rol
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.75rem',marginBottom:'1rem'}}>
              <div>
                <label style={{display:'block',fontSize:'0.68rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.3rem'}} htmlFor="tk-rol-inicial">Rol</label>
                <select id="tk-rol-inicial" value={rolInicializar} onChange={e=>{setRolInicializar(e.target.value);setSegmentoInicializar('')}} style={{width:'100%',background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',fontFamily:'Inter,sans-serif',boxSizing:'border-box'}}>
                  <option value="">Selecciona un rol...</option>
                  {Object.keys(segmentos).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:'block',fontSize:'0.68rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.3rem'}} htmlFor="tk-segmento-inicial">Segmento / Especialidad</label>
                <select id="tk-segmento-inicial" value={segmentoInicializar} onChange={e=>setSegmentoInicializar(e.target.value)} disabled={!rolInicializar} style={{width:'100%',background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',fontFamily:'Inter,sans-serif',boxSizing:'border-box',opacity:rolInicializar?1:0.5}}>
                  <option value="">Todos los segmentos</option>
                  {rolInicializar && Object.keys(segmentos[rolInicializar] || {}).map(s => (
                    <option key={s} value={s}>{s} ({(segmentos[rolInicializar][s] || []).length} tareas)</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{display:'block',fontSize:'0.68rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.3rem'}} htmlFor="tk-asignar-inicial">Asignar a (opcional)</label>
                <select id="tk-asignar-inicial" value={miembroInicializar} onChange={e=>setMiembroInicializar(e.target.value)} style={{width:'100%',background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',fontFamily:'Inter,sans-serif',boxSizing:'border-box'}}>
                  <option value="">Sin asignar</option>
                  {equipo.map(e => <option key={e.postulante_id} value={e.postulante_id}>{e.perfiles?.nombre} - {e.rol_nombre}</option>)}
                </select>
              </div>
            </div>
            {rolInicializar && (
              <div style={{fontSize:'0.75rem',color:'#8FA3CC',marginBottom:'1rem'}}>
                {segmentoInicializar
                  ? `Se cargaran ${(segmentos[rolInicializar]?.[segmentoInicializar] || []).length} tareas de "${segmentoInicializar}"`
                  : `Selecciona un segmento o deja en blanco para cargar el segmento principal de ${rolInicializar}`
                }
              </div>
            )}
            <div style={{display:'flex',gap:'0.75rem'}}>
              <button onClick={() => {setMostrarInicializar(false);setRolInicializar('')}} style={{background:'transparent',color:'#8FA3CC',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.6rem 1.25rem',fontSize:'0.82rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Cancelar</button>
              <button onClick={inicializarRol} disabled={!rolInicializar||creando} style={{background:'#E8A020',color:'#fff',border:'none',borderRadius:'8px',padding:'0.6rem 1.5rem',fontSize:'0.82rem',fontWeight:'700',cursor:rolInicializar?'pointer':'not-allowed',fontFamily:'Inter,sans-serif'}}>
                {creando ? 'Cargando...' : 'Cargar tareas'}
              </button>
            </div>
          </div>
        )}

        {mostrarNueva && (
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.5rem',marginBottom:'1.5rem'}}>
            <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff',marginBottom:'1rem'}}>Nueva tarea</div>
            <div style={{marginBottom:'0.75rem'}}>
              <label style={{display:'block',fontSize:'0.68rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.3rem'}} htmlFor="tk-nombre">Nombre de la tarea *</label>
              <input id="tk-nombre" value={nuevaTarea.nombre} onChange={e=>setNuevaTarea(n=>({...n,nombre:e.target.value}))} placeholder="Que hay que hacer?" style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif'}}/>
            </div>
            <div style={{marginBottom:'0.75rem'}}>
              <label style={{display:'block',fontSize:'0.68rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.3rem'}} htmlFor="tk-razon">Por que se agrega esta tarea?</label>
              <input id="tk-razon" value={nuevaTarea.razon_creacion} onChange={e=>setNuevaTarea(n=>({...n,razon_creacion:e.target.value}))} placeholder="Contexto para el equipo..." style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif'}}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.75rem',marginBottom:'1.25rem'}}>
              <div>
                <label style={{display:'block',fontSize:'0.68rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.3rem'}} htmlFor="tk-descripcion">Descripcion</label>
                <input id="tk-descripcion" value={nuevaTarea.descripcion} onChange={e=>setNuevaTarea(n=>({...n,descripcion:e.target.value}))} placeholder="Detalle..." style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif'}}/>
              </div>
              <div>
                <label style={{display:'block',fontSize:'0.68rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.3rem'}} htmlFor="tk-categoria">Categoria</label>
                <select id="tk-categoria" value={nuevaTarea.categoria} onChange={e=>setNuevaTarea(n=>({...n,categoria:e.target.value}))} style={{width:'100%',background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',fontFamily:'Inter,sans-serif',boxSizing:'border-box'}}>
                  <option value="">General</option>
                  {['Legal','Finanzas','Tecnico','Gestion','Diseno','Marketing','Inversion','Operaciones'].map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:'block',fontSize:'0.68rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.3rem'}} htmlFor="tk-asignado">Asignar a</label>
                <select id="tk-asignado" value={nuevaTarea.asignado_a} onChange={e=>setNuevaTarea(n=>({...n,asignado_a:e.target.value}))} style={{width:'100%',background:'#1a2a4a',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',fontFamily:'Inter,sans-serif',boxSizing:'border-box'}}>
                  <option value="">Sin asignar</option>
                  {miembrosParaCategoria(nuevaTarea.categoria).map(e=><option key={e.postulante_id} value={e.postulante_id}>{e.perfiles?.nombre} - {e.rol_nombre}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:'flex',gap:'0.75rem'}}>
              <button onClick={()=>setMostrarNueva(false)} style={{background:'transparent',color:'#8FA3CC',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.6rem 1.25rem',fontSize:'0.82rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Cancelar</button>
              <button onClick={crearTarea} disabled={!nuevaTarea.nombre||creando} style={{background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.6rem 1.5rem',fontSize:'0.82rem',fontWeight:'700',cursor:nuevaTarea.nombre?'pointer':'not-allowed',fontFamily:'Inter,sans-serif'}}>
                {creando ? 'Creando...' : 'Crear tarea'}
              </button>
            </div>
          </div>
        )}

        {tareas.length > 0 && (
          <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginBottom:'1.5rem'}}>
            <button onClick={()=>setFiltroEstado('todos')} style={{background:filtroEstado==='todos'?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.04)',color:filtroEstado==='todos'?'#fff':'#8FA3CC',border:'none',borderRadius:'6px',padding:'0.35rem 0.875rem',fontSize:'0.72rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Todas</button>
            {['pendiente','en_progreso','completada','verificada'].map(e=>(
              <button key={e} onClick={()=>setFiltroEstado(e)} style={{background:filtroEstado===e?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.04)',color:filtroEstado===e?'#fff':'#8FA3CC',border:'none',borderRadius:'6px',padding:'0.35rem 0.875rem',fontSize:'0.72rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                {estadoConfig[e]?.label}
              </button>
            ))}
            {(esFundador || verTodas) && (
              <span style={{display:'contents'}}>
                <span style={{width:'1px',background:'rgba(255,255,255,0.1)',margin:'0 0.25rem',display:'inline-block'}}></span>
                <button onClick={()=>setFiltroRol('todos')} style={{background:filtroRol==='todos'?'#1D9E75':'rgba(255,255,255,0.06)',color:filtroRol==='todos'?'#fff':'#8FA3CC',border:'none',borderRadius:'6px',padding:'0.35rem 0.875rem',fontSize:'0.75rem',fontWeight:'600',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Todos los roles</button>
                {rolesTareas.map(r=>(
                  <button key={r} onClick={()=>setFiltroRol(r)} style={{background:filtroRol===r?'#1D9E75':'rgba(255,255,255,0.06)',color:filtroRol===r?'#fff':'#8FA3CC',border:'none',borderRadius:'6px',padding:'0.35rem 0.875rem',fontSize:'0.75rem',fontWeight:'600',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>{r}</button>
                ))}
              </span>
            )}
          </div>
        )}

        {tareasFiltradas.length === 0 && tareas.length === 0 ? (
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
            <div style={{fontSize:'2rem',marginBottom:'0.75rem'}}>&#x1F4CB;</div>
            <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.4rem'}}>Sin tareas todavia</div>
            <div style={{color:'#8FA3CC',fontSize:'0.85rem',marginBottom:'1.5rem'}}>
              {esFundador||esGerente ? 'Carga la plantilla de tareas para cada rol del equipo o crea tareas manualmente.' : 'El fundador asignara tareas a tu rol proximamente.'}
            </div>
            {(esFundador||esGerente) && (
              <button onClick={()=>setMostrarInicializar(true)} style={{background:'#E8A020',color:'#fff',border:'none',borderRadius:'8px',padding:'0.75rem 1.5rem',fontSize:'0.875rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                Cargar plantilla de rol
              </button>
            )}
          </div>
        ) : tareasFiltradas.length === 0 ? (
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'12px',padding:'2rem',textAlign:'center',color:'#8FA3CC',fontSize:'0.85rem'}}>
            No hay tareas con ese filtro.{' '}
            <button onClick={()=>setFiltroEstado('todos')} style={{background:'none',border:'none',color:'#1D9E75',cursor:'pointer',fontFamily:'Inter,sans-serif',fontSize:'0.85rem',textDecoration:'underline'}}>Ver todas</button>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            {rolesTareas.filter(rol => tareasFiltradas.some(t => t.rol_nombre === rol)).map(rol => {
              const tareasDelRol = tareasFiltradas.filter(t => t.rol_nombre === rol)
              const rolAbierto = rolesAbiertos[rol] === true
              const completadas = tareasDelRol.filter(t => t.estado === 'completada' || t.estado === 'verificada').length
              const pct = tareasDelRol.length > 0 ? Math.round((completadas / tareasDelRol.length) * 100) : 0
              const hayMias = tareasDelRol.some(t => t.asignado_a === usuario?.id)

              // Agrupar tareas por segmento
              const porSegmento = {}
              for (const t of tareasDelRol) {
                const seg = getSegmento(t)
                if (!porSegmento[seg]) porSegmento[seg] = []
                porSegmento[seg].push(t)
              }

              return (
                <div key={rol} style={{background:'rgba(255,255,255,0.03)',border: hayMias ? '1px solid rgba(29,158,117,0.15)' : '1px solid rgba(255,255,255,0.07)',borderRadius:'12px',overflow:'hidden'}}>
                  {/* Nivel 1 — Rol */}
                  <div onClick={() => toggleRol(rol)} style={{padding:'1rem 1.25rem',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem'}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'0.9rem',fontWeight:'700',color:'#fff'}}>{rol}</div>
                      <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'2px'}}>{tareasDelRol.length} tareas · {pct}% completadas</div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'0.75rem',flexShrink:0}}>
                      <div style={{width:'80px',height:'4px',background:'rgba(255,255,255,0.08)',borderRadius:'2px',overflow:'hidden'}}>
                        <div style={{height:'100%',width:pct+'%',background:'#1D9E75',borderRadius:'2px'}}></div>
                      </div>
                      <span style={{color:'#8FA3CC',fontSize:'0.75rem'}}>{rolAbierto ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {rolAbierto && (
                    <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'0.5rem 0.75rem',display:'flex',flexDirection:'column',gap:'0.375rem'}}>
                      {Object.entries(porSegmento).map(([segmento, tareasSegmento]) => {
                        const segKey = rol + '|||' + segmento
                        const segAbierto = segmentosAbiertos[segKey] === true
                        const compSeg = tareasSegmento.filter(t => t.estado === 'completada' || t.estado === 'verificada').length
                        const pctSeg = Math.round((compSeg / tareasSegmento.length) * 100)

                        return (
                          <div key={segmento} style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:'8px',overflow:'hidden',marginBottom:'0.25rem'}}>
                            {/* Nivel 2 — Segmento */}
                            <div onClick={() => toggleSegmento(rol, segmento)} style={{padding:'0.625rem 0.875rem',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'0.75rem'}}>
                              <div style={{flex:1}}>
                                <div style={{fontSize:'0.78rem',fontWeight:'600',color:'#8FA3CC'}}>{segmento}</div>
                                <div style={{fontSize:'0.65rem',color:'#6B7280',marginTop:'1px'}}>{tareasSegmento.length} tareas · {pctSeg}% completadas</div>
                              </div>
                              <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexShrink:0}}>
                                <div style={{width:'50px',height:'3px',background:'rgba(255,255,255,0.06)',borderRadius:'2px',overflow:'hidden'}}>
                                  <div style={{height:'100%',width:pctSeg+'%',background:'#1D9E75',borderRadius:'2px'}}></div>
                                </div>
                                <span style={{color:'#6B7280',fontSize:'0.68rem'}}>{segAbierto ? '▲' : '▼'}</span>
                              </div>
                            </div>

                            {segAbierto && (
                              <div style={{borderTop:'1px solid rgba(255,255,255,0.04)',padding:'0.375rem 0.5rem',display:'flex',flexDirection:'column',gap:'0.25rem'}}>
                                {tareasSegmento.map(t => {
                                  const cfg = estadoConfig[t.estado] || estadoConfig.pendiente
                                  const esMia = t.asignado_a === usuario?.id
                                  const puedeVerificar = (esFundador || esGerente) && t.estado === 'completada'
                                  const puedeMover = esMia || esFundador || esGerente

                                  return (
                                    <div key={t.id} style={{background: esMia ? 'rgba(29,158,117,0.04)' : 'rgba(255,255,255,0.02)', border: esMia ? '1px solid rgba(29,158,117,0.1)' : '1px solid rgba(255,255,255,0.04)', borderRadius:'6px', padding:'0.625rem 0.75rem'}}>
                                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'0.75rem',flexWrap:'wrap'}}>
                                        <div style={{flex:1}}>
                                          <div style={{display:'flex',gap:'0.35rem',alignItems:'center',marginBottom:'0.2rem',flexWrap:'wrap'}}>
                                            {t.categoria && <span style={{fontSize:'0.58rem',padding:'1px 4px',borderRadius:'3px',background:'rgba(255,255,255,0.06)',color:'#6B7280'}}>{t.categoria}</span>}
                                            {esMia && <span style={{fontSize:'0.58rem',fontWeight:'700',color:'#1D9E75'}}>Mia</span>}
                                            {(t.razon_creacion||'').includes('Bootstrapping') && <span style={{fontSize:'0.58rem',fontWeight:'700',color:'#E8A020',background:'rgba(232,160,32,0.1)',padding:'1px 4px',borderRadius:'3px'}}>Bootstrapping</span>}
                                          </div>
                                          <div style={{fontSize:'0.8rem',fontWeight:'600',color: t.estado==='verificada' ? '#AFA9EC' : '#fff', textDecoration: t.estado==='verificada'?'line-through':'none', marginBottom:'0.1rem'}}>{t.nombre}</div>
                                          {t.descripcion && <div style={{fontSize:'0.7rem',color:'#6B7280',lineHeight:'1.4'}}>{t.descripcion}</div>}
                                          <div style={{fontSize:'0.62rem',color:'#4B5563',marginTop:'0.2rem'}}>
                                            {t.asignado_perfil?.nombre ? 'Asignada a ' + t.asignado_perfil.nombre : 'Sin asignar'}
                                            {t.completado_at ? ' · ' + new Date(t.completado_at).toLocaleDateString('es-CO') : ''}
                                          </div>
                                        </div>
                                        <div style={{display:'flex',gap:'0.35rem',alignItems:'center',flexShrink:0}}>
                                          <span style={{fontSize:'0.65rem',fontWeight:'700',padding:'0.12rem 0.5rem',borderRadius:'20px',background:cfg.bg,color:cfg.color,whiteSpace:'nowrap'}}>{cfg.label}</span>
                                          {puedeMover && t.estado === 'pendiente' && <button onClick={()=>cambiarEstado(t,'en_progreso')} disabled={actualizando===t.id} style={{background:'rgba(232,160,32,0.12)',color:'#E8A020',border:'1px solid rgba(232,160,32,0.25)',borderRadius:'5px',padding:'0.15rem 0.45rem',fontSize:'0.65rem',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:'600'}}>{actualizando===t.id?'...':'Iniciar'}</button>}
                                          {puedeMover && t.estado === 'en_progreso' && <button onClick={()=>cambiarEstado(t,'completada')} disabled={actualizando===t.id} style={{background:'rgba(29,158,117,0.12)',color:'#1D9E75',border:'1px solid rgba(29,158,117,0.25)',borderRadius:'5px',padding:'0.15rem 0.45rem',fontSize:'0.65rem',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:'600'}}>{actualizando===t.id?'...':'Completar'}</button>}
                                          {puedeVerificar && <button onClick={()=>cambiarEstado(t,'verificada')} disabled={actualizando===t.id} style={{background:'rgba(175,169,236,0.12)',color:'#AFA9EC',border:'1px solid rgba(175,169,236,0.25)',borderRadius:'5px',padding:'0.15rem 0.45rem',fontSize:'0.65rem',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:'600'}}>{actualizando===t.id?'...':'Verificar'}</button>}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            {tareasFiltradas.filter(t => !t.rol_nombre).map(t => {
              const cfg = estadoConfig[t.estado] || estadoConfig.pendiente
              const esMia = t.asignado_a === usuario?.id
              const puedeVerificar = (esFundador || esGerente) && t.estado === 'completada'
              const puedeMover = esMia || esFundador || esGerente
              return (
                <div key={t.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'10px',padding:'0.75rem 1rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem'}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'0.82rem',fontWeight:'600',color:'#fff',marginBottom:'0.15rem'}}>{t.nombre}</div>
                      {t.descripcion && <div style={{fontSize:'0.72rem',color:'#6B7280'}}>{t.descripcion}</div>}
                    </div>
                    <div style={{display:'flex',gap:'0.4rem',alignItems:'center',flexShrink:0}}>
                      <span style={{fontSize:'0.68rem',fontWeight:'700',padding:'0.15rem 0.625rem',borderRadius:'20px',background:cfg.bg,color:cfg.color}}>{cfg.label}</span>
                      {puedeMover && t.estado === 'pendiente' && <button onClick={()=>cambiarEstado(t,'en_progreso')} style={{background:'rgba(232,160,32,0.12)',color:'#E8A020',border:'1px solid rgba(232,160,32,0.25)',borderRadius:'6px',padding:'0.2rem 0.5rem',fontSize:'0.68rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Iniciar</button>}
                      {puedeMover && t.estado === 'en_progreso' && <button onClick={()=>cambiarEstado(t,'completada')} style={{background:'rgba(29,158,117,0.12)',color:'#1D9E75',border:'1px solid rgba(29,158,117,0.25)',borderRadius:'6px',padding:'0.2rem 0.5rem',fontSize:'0.68rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Completar</button>}
                      {puedeVerificar && <button onClick={()=>cambiarEstado(t,'verificada')} style={{background:'rgba(175,169,236,0.12)',color:'#AFA9EC',border:'1px solid rgba(175,169,236,0.25)',borderRadius:'6px',padding:'0.2rem 0.5rem',fontSize:'0.68rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Verificar</button>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
