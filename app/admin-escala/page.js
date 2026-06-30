'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const ROLES = ['Abogado','Contador','Desarrollador Full-Stack','Gerente de Proyecto','Diseñador','Community Manager','Inversionista inicial']
const BANDERAS = { 'Colombia':'🇨🇴','México':'🇲🇽','Perú':'🇵🇪','Chile':'🇨🇱','Argentina':'🇦🇷','España':'🇪🇸','Estados Unidos':'🇺🇸' }

export default function AdminEscala() {
  const [usuario, setUsuario] = useState(null)
  const [perfiles, setPerfiles] = useState([])
  const [proyectos, setProyectos] = useState([])
  const [industrias, setIndustrias] = useState([])
  const [paises, setPaises] = useState([])
  const [cargando, setCargando] = useState(true)
  const [tab, setTab] = useState('resumen')
  const [recalculando, setRecalculando] = useState(null)
  const [scores, setScores] = useState({})
  const [eliminandoId, setEliminandoId] = useState(null)

  const [industriaEditando, setIndustriaEditando] = useState(null)
  const [mostrarNuevaIndustria, setMostrarNuevaIndustria] = useState(false)
  const [nuevaIndustria, setNuevaIndustria] = useState({ nombre: '', tareas: [] })
  const [nuevaTareaInd, setNuevaTareaInd] = useState({ nombre: '', categoria: '', rol_nombre: '' })
  const [guardandoInd, setGuardandoInd] = useState(false)

  const [paisEditando, setPaisEditando] = useState(null)
  const [mostrarNuevoPais, setMostrarNuevoPais] = useState(false)
  const [nuevoPais, setNuevoPais] = useState({ nombre: '', bandera: '', tareas: [] })
  const [nuevaTareaPais, setNuevaTareaPais] = useState({ nombre: '', categoria: '', rol_nombre: '' })
  const [guardandoPais, setGuardandoPais] = useState(false)

  const [especialidades, setEspecialidades] = useState([])
  const [especialidadEditando, setEspecialidadEditando] = useState(null)
  const [mostrarNuevaEspecialidad, setMostrarNuevaEspecialidad] = useState(false)
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState({ nombre: '', categoria: '' })
  const [guardandoEsp, setGuardandoEsp] = useState(false)

  const [categoriasDB, setCategoriasDB] = useState([])
  const [mostrarNuevaCategoriaNueva, setMostrarNuevaCategoriaNueva] = useState(false)
  const [mostrarNuevaCategoriaEditar, setMostrarNuevaCategoriaEditar] = useState(false)
  const [nuevaCategoriaTexto, setNuevaCategoriaTexto] = useState('')
  const [creandoCategoria, setCreandoCategoria] = useState(false)

  useEffect(() => { cargarTodo() }, [])

  async function cargarTodo() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/registro'; return }
    setUsuario(user)
    const [perfsRes, proyRes, indRes, paisRes, espRes, catRes] = await Promise.all([
      supabase.from('perfiles').select('*').order('escala_score', { ascending: false }),
      fetch('/api/proyectos'),
      supabase.from('industrias').select('*').order('nombre'),
      supabase.from('paises_regulatorios').select('*').order('nombre'),
      supabase.from('especialidades').select('*').order('nombre'),
      supabase.from('categorias').select('*').order('nombre'),
    ])
    const pData = await proyRes.json()
    setPerfiles(perfsRes.data || [])
    setProyectos(pData.proyectos || [])
    setIndustrias(indRes.data || [])
    setPaises(paisRes.data || [])
    setEspecialidades(espRes.data || [])
    setCategoriasDB(catRes.data || [])
    setCargando(false)
  }

  async function recalcularScore(perfil_id) {
    setRecalculando(perfil_id)
    const res = await fetch('/api/score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ perfil_id }) })
    const data = await res.json()
    if (!data.error) {
      setScores(s => ({ ...s, [perfil_id]: data.score }))
      setPerfiles(p => p.map(x => x.id === perfil_id ? { ...x, escala_score: data.score } : x))
    }
    setRecalculando(null)
  }

  async function recalcularTodos() {
    setRecalculando('todos')
    for (const p of perfiles) await recalcularScore(p.id)
    setRecalculando(null)
  }

  async function eliminarProyecto(id, nombre) {
    const primeraConfirmacion = confirm('¿Eliminar el proyecto "' + nombre + '"?\n\nEsto borrará también sus roles, tareas, postulaciones, hitos, aportes y mensajes. Esta acción no se puede deshacer.')
    if (!primeraConfirmacion) return

    const textoEsperado = nombre.trim()
    const textoEscrito = prompt('Para confirmar, escribe exactamente el nombre del proyecto:\n\n"' + textoEsperado + '"')
    if (textoEscrito === null) return
    if (textoEscrito.trim() !== textoEsperado) {
      alert('El nombre no coincide. Eliminación cancelada por seguridad.')
      return
    }

    setEliminandoId(id)
    try {
      const res = await fetch('/api/proyectos/' + id, { method: 'DELETE' })
      const data = await res.json()
      if (data.error) { alert('Error eliminando proyecto: ' + data.error) }
      else { setProyectos(prev => prev.filter(p => p.id !== id)) }
    } catch (e) { alert('Error de conexión: ' + e.message) }
    setEliminandoId(null)
  }

  async function eliminarUsuario(id, nombre) {
    const primeraConfirmacion = confirm('¿Eliminar al usuario "' + nombre + '"?\n\nEsto borrará su perfil, postulaciones, mensajes y aportes. Sus tareas asignadas quedarán sin asignar. Esta acción no se puede deshacer.')
    if (!primeraConfirmacion) return

    const textoEsperado = (nombre || 'usuario').trim()
    const textoEscrito = prompt('Para confirmar, escribe exactamente el nombre del usuario:\n\n"' + textoEsperado + '"')
    if (textoEscrito === null) return
    if (textoEscrito.trim() !== textoEsperado) {
      alert('El nombre no coincide. Eliminación cancelada por seguridad.')
      return
    }

    setEliminandoId(id)
    try {
      const res = await fetch('/api/usuarios?id=' + id, { method: 'DELETE' })
      const data = await res.json()
      if (data.error) { alert('Error eliminando usuario: ' + data.error) }
      else {
        setPerfiles(prev => prev.filter(p => p.id !== id))
        if (data.advertencia) alert(data.advertencia)
      }
    } catch (e) { alert('Error de conexión: ' + e.message) }
    setEliminandoId(null)
  }

  async function guardarIndustria() {
    setGuardandoInd(true)
    if (industriaEditando) {
      await supabase.from('industrias').update({ nombre: industriaEditando.nombre, tareas: industriaEditando.tareas }).eq('id', industriaEditando.id)
      setIndustrias(prev => prev.map(i => i.id === industriaEditando.id ? industriaEditando : i))
      setIndustriaEditando(null)
    } else {
      const { data } = await supabase.from('industrias').insert([{ nombre: nuevaIndustria.nombre, tareas: nuevaIndustria.tareas }]).select().single()
      if (data) setIndustrias(prev => [...prev, data])
      setNuevaIndustria({ nombre: '', tareas: [] })
      setMostrarNuevaIndustria(false)
    }
    setGuardandoInd(false)
  }

  async function eliminarIndustria(id) {
    if (!confirm('¿Eliminar esta industria?')) return
    await supabase.from('industrias').delete().eq('id', id)
    setIndustrias(prev => prev.filter(i => i.id !== id))
  }

  function agregarTareaA(target, setTarget, nuevaTarea, setNuevaTarea) {
    if (!nuevaTarea.nombre) return
    const tarea = { nombre: nuevaTarea.nombre, categoria: nuevaTarea.categoria || 'General', rol_nombre: nuevaTarea.rol_nombre || '' }
    setTarget(prev => ({ ...prev, tareas: [...(prev.tareas || []), tarea] }))
    setNuevaTarea({ nombre: '', categoria: '', rol_nombre: '' })
  }

  function eliminarTareaDe(target, setTarget, idx) {
    setTarget(prev => ({ ...prev, tareas: prev.tareas.filter((_, i) => i !== idx) }))
  }

  async function guardarPais() {
    setGuardandoPais(true)
    if (paisEditando) {
      await supabase.from('paises_regulatorios').update({ nombre: paisEditando.nombre, bandera: paisEditando.bandera, tareas: paisEditando.tareas }).eq('id', paisEditando.id)
      setPaises(prev => prev.map(p => p.id === paisEditando.id ? paisEditando : p))
      setPaisEditando(null)
    } else {
      const { data } = await supabase.from('paises_regulatorios').insert([{ nombre: nuevoPais.nombre, bandera: nuevoPais.bandera, tareas: nuevoPais.tareas }]).select().single()
      if (data) setPaises(prev => [...prev, data])
      setNuevoPais({ nombre: '', bandera: '', tareas: [] })
      setMostrarNuevoPais(false)
    }
    setGuardandoPais(false)
  }

  async function eliminarPais(id) {
    if (!confirm('¿Eliminar este país?')) return
    await supabase.from('paises_regulatorios').delete().eq('id', id)
    setPaises(prev => prev.filter(p => p.id !== id))
  }

  async function guardarEspecialidad() {
    setGuardandoEsp(true)
    if (especialidadEditando) {
      await supabase.from('especialidades').update({ nombre: especialidadEditando.nombre, categoria: especialidadEditando.categoria }).eq('id', especialidadEditando.id)
      setEspecialidades(prev => prev.map(e => e.id === especialidadEditando.id ? especialidadEditando : e))
      setEspecialidadEditando(null)
    } else {
      const { data } = await supabase.from('especialidades').insert([{ nombre: nuevaEspecialidad.nombre, categoria: nuevaEspecialidad.categoria || 'General' }]).select().single()
      if (data) setEspecialidades(prev => [...prev, data].sort((a,b) => a.nombre.localeCompare(b.nombre)))
      setNuevaEspecialidad({ nombre: '', categoria: '' })
      setMostrarNuevaEspecialidad(false)
    }
    setGuardandoEsp(false)
  }

  async function eliminarEspecialidad(id) {
    if (!confirm('¿Eliminar esta especialidad? Los usuarios que ya la tengan asignada no se verán afectados, pero dejará de aparecer como opción en el registro.')) return
    await supabase.from('especialidades').delete().eq('id', id)
    setEspecialidades(prev => prev.filter(e => e.id !== id))
  }

  async function crearNuevaCategoria(nombre, destino) {
    const limpio = nombre.trim()
    if (!limpio) { alert('Escribe el nombre de la categoría'); return }
    setCreandoCategoria(true)
    try {
      const res = await fetch('/api/categorias', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: limpio })
      })
      const data = await res.json()
      if (data.error) { alert('Error: ' + data.error) }
      else {
        setCategoriasDB(prev => [...prev.filter(c => c.nombre !== data.categoria.nombre), data.categoria].sort((a,b) => a.nombre.localeCompare(b.nombre)))
        if (destino === 'nueva') {
          setNuevaEspecialidad(n => ({...n, categoria: data.categoria.nombre}))
          setMostrarNuevaCategoriaNueva(false)
        } else {
          setEspecialidadEditando(n => ({...n, categoria: data.categoria.nombre}))
          setMostrarNuevaCategoriaEditar(false)
        }
        setNuevaCategoriaTexto('')
      }
    } catch(e) {
      alert('Error de conexión: ' + e.message)
    }
    setCreandoCategoria(false)
  }

  const tabs = [
    { id: 'resumen', label: '📊 Resumen' },
    { id: 'perfiles', label: '👥 Perfiles y Score' },
    { id: 'proyectos', label: '🚀 Proyectos' },
    { id: 'industrias', label: '🏭 Industrias' },
    { id: 'paises', label: '🌎 Países' },
    { id: 'especialidades', label: '🎓 Especialidades' },
  ]

  const st = {
    input: { width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', padding:'0.65rem 1rem', color:'#fff', fontSize:'0.875rem', outline:'none', boxSizing:'border-box', fontFamily:'Inter,sans-serif' },
    select: { width:'100%', background:'#1a2a4a', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', padding:'0.65rem 1rem', color:'#fff', fontSize:'0.875rem', outline:'none', fontFamily:'Inter,sans-serif', boxSizing:'border-box' },
    label: { display:'block', fontSize:'0.68rem', fontWeight:'600', color:'#8FA3CC', marginBottom:'0.3rem', letterSpacing:'0.04em', textTransform:'uppercase' },
    btnGreen: { background:'#1D9E75', color:'#fff', border:'none', borderRadius:'8px', padding:'0.5rem 1.25rem', fontSize:'0.78rem', fontWeight:'700', cursor:'pointer', fontFamily:'Inter,sans-serif' },
    btnAmber: { background:'rgba(232,160,32,0.15)', color:'#E8A020', border:'1px solid rgba(232,160,32,0.3)', borderRadius:'8px', padding:'0.4rem 0.875rem', fontSize:'0.72rem', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif' },
    btnRed: { background:'rgba(216,90,48,0.1)', color:'#D85A30', border:'1px solid rgba(216,90,48,0.25)', borderRadius:'6px', padding:'0.3rem 0.625rem', fontSize:'0.68rem', cursor:'pointer', fontFamily:'Inter,sans-serif' },
    btnSec: { background:'transparent', color:'#8FA3CC', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', padding:'0.5rem 1rem', fontSize:'0.78rem', cursor:'pointer', fontFamily:'Inter,sans-serif' },
    card: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'1.5rem', marginBottom:'1rem' },
    formBox: { background:'rgba(29,158,117,0.06)', border:'1px solid rgba(29,158,117,0.2)', borderRadius:'12px', padding:'1.5rem', marginBottom:'1.5rem' },
    tag: { fontSize:'0.68rem', padding:'2px 8px', borderRadius:'10px', background:'rgba(255,255,255,0.08)', color:'#8FA3CC', marginRight:'0.3rem' },
  }

  if (cargando) return <div style={{minHeight:'100vh',background:'#0B1628',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>Cargando panel admin...</div>

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
        {tabs.map(t => {
          const pendientesPaises = t.id === 'paises' ? paises.filter(p => !p.tareas || p.tareas.length === 0).length : 0
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{background:'none',border:'none',borderBottom:tab===t.id?'2px solid #1D9E75':'2px solid transparent',color:tab===t.id?'#fff':'#8FA3CC',padding:'0.875rem 1.25rem',fontSize:'0.82rem',fontWeight:tab===t.id?'700':'400',cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:'0.4rem'}}>
              {t.label}
              {pendientesPaises > 0 && (
                <span style={{background:'#E8A020',color:'#0B1628',fontSize:'0.65rem',fontWeight:'800',borderRadius:'10px',padding:'1px 6px',minWidth:'16px',textAlign:'center'}}>{pendientesPaises}</span>
              )}
            </button>
          )
        })}
      </div>

      <main style={{maxWidth:'1100px',margin:'0 auto',padding:'2rem 1.25rem'}}>

        {tab === 'resumen' && (
          <div>
            <div style={{marginBottom:'1.5rem'}}>
              <div style={{fontSize:'1rem',fontWeight:'700',color:'#fff'}}>Estado general de la plataforma</div>
              <div style={{fontSize:'0.82rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Un vistazo a lo técnico, lo comercial y la operación diaria</div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
              <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.6rem',fontWeight:'700',color:'#fff'}}>{perfiles.length}</div>
                <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Usuarios registrados</div>
              </div>
              <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.6rem',fontWeight:'700',color:'#1D9E75'}}>{proyectos.length}</div>
                <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Proyectos activos</div>
              </div>
              <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.6rem',fontWeight:'700',color:'#fff'}}>
                  {perfiles.length > 0 ? Math.round(perfiles.reduce((s,p)=>s+(p.escala_score||0),0)/perfiles.length) : 0}
                </div>
                <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Score promedio de la red</div>
              </div>
              <div style={{background: paises.filter(p=>!p.tareas||p.tareas.length===0).length>0 ? 'rgba(232,160,32,0.1)' : 'rgba(255,255,255,0.04)', border: paises.filter(p=>!p.tareas||p.tareas.length===0).length>0 ? '1px solid rgba(232,160,32,0.3)' : '1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.6rem',fontWeight:'700',color: paises.filter(p=>!p.tareas||p.tareas.length===0).length>0 ? '#E8A020' : '#fff'}}>
                  {paises.filter(p=>!p.tareas||p.tareas.length===0).length}
                </div>
                <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Países pendientes de configurar</div>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'1rem'}}>
              <a href="/desarrollo" style={{textDecoration:'none',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'1.5rem',display:'block'}}>
                <div style={{fontSize:'0.68rem',fontWeight:'700',color:'#1D9E75',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:'0.5rem'}}>Técnico</div>
                <div style={{fontSize:'1.5rem',fontWeight:'800',color:'#fff',marginBottom:'0.3rem'}}>89.1%</div>
                <div style={{fontSize:'0.78rem',color:'#8FA3CC'}}>$121.2M de $136M construidos</div>
                <div style={{fontSize:'0.75rem',color:'#1D9E75',marginTop:'0.75rem',fontWeight:'600'}}>Ver roadmap completo →</div>
              </a>
              <a href="/comercial" style={{textDecoration:'none',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'1.5rem',display:'block'}}>
                <div style={{fontSize:'0.68rem',fontWeight:'700',color:'#E8A020',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:'0.5rem'}}>Comercial</div>
                <div style={{fontSize:'1.5rem',fontWeight:'800',color:'#fff',marginBottom:'0.3rem'}}>0%</div>
                <div style={{fontSize:'0.78rem',color:'#8FA3CC'}}>$0 de $7.7M ejecutados</div>
                <div style={{fontSize:'0.75rem',color:'#E8A020',marginTop:'0.75rem',fontWeight:'600'}}>Ver plan comercial →</div>
              </a>
              <a href="/qa" style={{textDecoration:'none',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'1.5rem',display:'block'}}>
                <div style={{fontSize:'0.68rem',fontWeight:'700',color:'#AFA9EC',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:'0.5rem'}}>Salud técnica</div>
                <div style={{fontSize:'1.5rem',fontWeight:'800',color:'#fff',marginBottom:'0.3rem'}}>27 tests</div>
                <div style={{fontSize:'0.78rem',color:'#8FA3CC'}}>Suite automática de QA</div>
                <div style={{fontSize:'0.75rem',color:'#AFA9EC',marginTop:'0.75rem',fontWeight:'600'}}>Correr pruebas →</div>
              </a>
            </div>
          </div>
        )}

        {tab === 'perfiles' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem',flexWrap:'wrap',gap:'1rem'}}>
              <div>
                <div style={{fontSize:'1rem',fontWeight:'700',color:'#fff'}}>Perfiles de la red</div>
                <div style={{fontSize:'0.82rem',color:'#8FA3CC',marginTop:'0.2rem'}}>{perfiles.length} personas registradas</div>
              </div>
              <button onClick={recalcularTodos} disabled={recalculando==='todos'} style={st.btnGreen}>
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
                      <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>
                        {p.pais ? (BANDERAS[p.pais]||'🌐') + ' ' + p.pais : ''}{p.ciudad ? ' · ' + p.ciudad : ''}{p.especialidad ? ' · ' + p.especialidad : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:'0.75rem',alignItems:'center'}}>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontFamily:'monospace',fontSize:'1.25rem',fontWeight:'700',color:(scores[p.id]||p.escala_score||0)>=50?'#1D9E75':(scores[p.id]||p.escala_score||0)>=20?'#E8A020':'#8FA3CC'}}>
                        {scores[p.id] ?? p.escala_score ?? 0}
                      </div>
                      <div style={{fontSize:'0.62rem',color:'#6B7280'}}>Score</div>
                    </div>
                    <button onClick={() => recalcularScore(p.id)} disabled={recalculando===p.id} style={st.btnAmber}>
                      {recalculando===p.id ? '...' : '🔄'}
                    </button>
                    <a href={'/perfil/'+p.id} style={{fontSize:'0.72rem',color:'#8FA3CC',textDecoration:'none'}}>Ver →</a>
                    <button onClick={() => eliminarUsuario(p.id, p.nombre)} disabled={eliminandoId===p.id} style={st.btnRed}>
                      {eliminandoId===p.id ? '...' : '🗑 Eliminar'}
                    </button>
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
                    <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>
                      {p.sector}{p.pais ? ' · ' + (BANDERAS[p.pais]||'🌐') + ' ' + p.pais : ''}{p.industria ? ' · ' + p.industria : ''}{p.ciudad ? ' · ' + p.ciudad : ''} · Tipo {p.tipo}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:'0.75rem',alignItems:'center'}}>
                    <span style={{fontSize:'0.68rem',fontWeight:'700',padding:'2px 8px',borderRadius:'10px',background:'rgba(29,158,117,0.15)',color:'#1D9E75'}}>{p.estado}</span>
                    <a href={'/proyectos/'+p.id+'/workspace'} style={{fontSize:'0.72rem',color:'#1D9E75',textDecoration:'none',fontWeight:'600'}}>Workspace →</a>
                    <a href={'/p/'+p.id} target="_blank" style={{fontSize:'0.72rem',color:'#8FA3CC',textDecoration:'none'}}>Público →</a>
                    <button onClick={() => eliminarProyecto(p.id, p.nombre)} disabled={eliminandoId===p.id} style={st.btnRed}>
                      {eliminandoId===p.id ? '...' : '🗑 Eliminar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'industrias' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
              <div>
                <div style={{fontSize:'1rem',fontWeight:'700',color:'#fff'}}>Plantillas por industria</div>
                <div style={{fontSize:'0.82rem',color:'#8FA3CC',marginTop:'0.2rem'}}>{industrias.length} industrias · Las tareas se cargan automáticamente al crear un proyecto</div>
              </div>
              <button onClick={() => { setMostrarNuevaIndustria(true); setIndustriaEditando(null) }} style={st.btnGreen}>+ Nueva industria</button>
            </div>

            {mostrarNuevaIndustria && (
              <div style={st.formBox}>
                <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff',marginBottom:'1rem'}}>Nueva industria</div>
                <div style={{marginBottom:'0.75rem'}}>
                  <label style={st.label}>Nombre</label>
                  <input style={st.input} value={nuevaIndustria.nombre} onChange={e => setNuevaIndustria(n => ({...n,nombre:e.target.value}))} placeholder="Ej: Salud, Educación..." />
                </div>
                <div style={{fontSize:'0.75rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.5rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Tareas ({nuevaIndustria.tareas?.length || 0})</div>
                {(nuevaIndustria.tareas||[]).map((t,i) => (
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.4rem 0.75rem',background:'rgba(255,255,255,0.04)',borderRadius:'6px',marginBottom:'0.3rem'}}>
                    <span style={{fontSize:'0.78rem',color:'#fff'}}>{t.nombre} <span style={st.tag}>{t.categoria}</span><span style={st.tag}>{t.rol_nombre}</span></span>
                    <button onClick={() => eliminarTareaDe(nuevaIndustria, setNuevaIndustria, i)} style={st.btnRed}>✕</button>
                  </div>
                ))}
                <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:'0.5rem',marginTop:'0.75rem',alignItems:'end'}}>
                  <div>
                    <label style={st.label}>Tarea</label>
                    <input style={st.input} value={nuevaTareaInd.nombre} onChange={e => setNuevaTareaInd(n=>({...n,nombre:e.target.value}))} placeholder="Nombre de la tarea..." />
                  </div>
                  <div>
                    <label style={st.label}>Categoría</label>
                    <select style={st.select} value={nuevaTareaInd.categoria} onChange={e => setNuevaTareaInd(n=>({...n,categoria:e.target.value}))}>
                      <option value="">Categoría...</option>
                      {categoriasDB.map(c => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={st.label}>Rol</label>
                    <select style={st.select} value={nuevaTareaInd.rol_nombre} onChange={e => setNuevaTareaInd(n=>({...n,rol_nombre:e.target.value}))}>
                      <option value="">Rol...</option>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <button type="button" onClick={() => agregarTareaA(nuevaIndustria, setNuevaIndustria, nuevaTareaInd, setNuevaTareaInd)} style={{...st.btnGreen,padding:'0.65rem 1rem'}}>+ Agregar</button>
                </div>
                <div style={{display:'flex',gap:'0.75rem',marginTop:'1.25rem'}}>
                  <button onClick={() => { setMostrarNuevaIndustria(false); setNuevaIndustria({nombre:'',tareas:[]}) }} style={st.btnSec}>Cancelar</button>
                  <button onClick={guardarIndustria} disabled={!nuevaIndustria.nombre||guardandoInd} style={st.btnGreen}>{guardandoInd?'Guardando...':'Guardar industria →'}</button>
                </div>
              </div>
            )}

            {industriaEditando && (
              <div style={st.formBox}>
                <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff',marginBottom:'1rem'}}>Editando: {industriaEditando.nombre}</div>
                <div style={{marginBottom:'0.75rem'}}>
                  <label style={st.label}>Nombre</label>
                  <input style={st.input} value={industriaEditando.nombre} onChange={e => setIndustriaEditando(n=>({...n,nombre:e.target.value}))} />
                </div>
                <div style={{fontSize:'0.75rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.5rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Tareas ({industriaEditando.tareas?.length || 0})</div>
                {(industriaEditando.tareas||[]).map((t,i) => (
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.4rem 0.75rem',background:'rgba(255,255,255,0.04)',borderRadius:'6px',marginBottom:'0.3rem'}}>
                    <span style={{fontSize:'0.78rem',color:'#fff'}}>{t.nombre} <span style={st.tag}>{t.categoria}</span><span style={st.tag}>{t.rol_nombre}</span></span>
                    <button onClick={() => eliminarTareaDe(industriaEditando, setIndustriaEditando, i)} style={st.btnRed}>✕</button>
                  </div>
                ))}
                <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:'0.5rem',marginTop:'0.75rem',alignItems:'end'}}>
                  <div>
                    <label style={st.label}>Nueva tarea</label>
                    <input style={st.input} value={nuevaTareaInd.nombre} onChange={e => setNuevaTareaInd(n=>({...n,nombre:e.target.value}))} placeholder="Nombre de la tarea..." />
                  </div>
                  <div>
                    <label style={st.label}>Categoría</label>
                    <select style={st.select} value={nuevaTareaInd.categoria} onChange={e => setNuevaTareaInd(n=>({...n,categoria:e.target.value}))}>
                      <option value="">Categoría...</option>
                      {categoriasDB.map(c => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={st.label}>Rol</label>
                    <select style={st.select} value={nuevaTareaInd.rol_nombre} onChange={e => setNuevaTareaInd(n=>({...n,rol_nombre:e.target.value}))}>
                      <option value="">Rol...</option>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <button type="button" onClick={() => agregarTareaA(industriaEditando, setIndustriaEditando, nuevaTareaInd, setNuevaTareaInd)} style={{...st.btnGreen,padding:'0.65rem 1rem'}}>+ Agregar</button>
                </div>
                <div style={{display:'flex',gap:'0.75rem',marginTop:'1.25rem'}}>
                  <button onClick={() => setIndustriaEditando(null)} style={st.btnSec}>Cancelar</button>
                  <button onClick={guardarIndustria} disabled={guardandoInd} style={st.btnGreen}>{guardandoInd?'Guardando...':'Guardar cambios →'}</button>
                </div>
              </div>
            )}

            {industrias.map(ind => (
              <div key={ind.id} style={st.card}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.875rem'}}>
                  <div style={{fontSize:'0.9rem',fontWeight:'700',color:'#fff'}}>{ind.nombre} <span style={{fontSize:'0.68rem',color:'#8FA3CC',fontWeight:'400'}}>— {ind.tareas?.length||0} tareas</span></div>
                  <div style={{display:'flex',gap:'0.5rem'}}>
                    <button onClick={() => { setIndustriaEditando({...ind}); setMostrarNuevaIndustria(false) }} style={st.btnAmber}>✏️ Editar</button>
                    <button onClick={() => eliminarIndustria(ind.id)} style={st.btnRed}>🗑</button>
                  </div>
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:'0.4rem'}}>
                  {(ind.tareas||[]).map((t,i) => (
                    <span key={i} style={{fontSize:'0.72rem',color:'#C8D4E8',background:'rgba(255,255,255,0.06)',padding:'0.25rem 0.625rem',borderRadius:'6px'}}>{t.nombre}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'paises' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
              <div>
                <div style={{fontSize:'1rem',fontWeight:'700',color:'#fff'}}>Tareas regulatorias por país</div>
                <div style={{fontSize:'0.82rem',color:'#8FA3CC',marginTop:'0.2rem'}}>{paises.length} países configurados · Se cargan automáticamente al crear un proyecto</div>
              </div>
              <button onClick={() => { setMostrarNuevoPais(true); setPaisEditando(null) }} style={st.btnGreen}>+ Nuevo país</button>
            </div>

            {paises.filter(p => !p.tareas || p.tareas.length === 0).length > 0 && (
              <div style={{background:'rgba(232,160,32,0.1)',border:'1px solid rgba(232,160,32,0.3)',borderRadius:'12px',padding:'1.25rem',marginBottom:'1.5rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.75rem'}}>
                  <span style={{fontSize:'1.1rem'}}>⚠️</span>
                  <span style={{fontSize:'0.9rem',fontWeight:'700',color:'#E8A020'}}>
                    {paises.filter(p => !p.tareas || p.tareas.length === 0).length} país{paises.filter(p => !p.tareas || p.tareas.length === 0).length !== 1 ? 'es' : ''} pendiente{paises.filter(p => !p.tareas || p.tareas.length === 0).length !== 1 ? 's' : ''} de configurar
                  </span>
                </div>
                <div style={{fontSize:'0.78rem',color:'#C8D4E8',marginBottom:'0.75rem'}}>
                  Estos países fueron creados por usuarios pero todavía no tienen tareas regulatorias. Si el email de alerta no llegó o se perdió, aquí queda visible de todas formas.
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:'0.5rem'}}>
                  {paises.filter(p => !p.tareas || p.tareas.length === 0).map(p => (
                    <button key={p.id} onClick={() => { setPaisEditando({...p}); setMostrarNuevoPais(false) }} style={{background:'rgba(232,160,32,0.15)',border:'1px solid rgba(232,160,32,0.3)',borderRadius:'8px',padding:'0.4rem 0.875rem',fontSize:'0.78rem',color:'#E8A020',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:'600'}}>
                      {p.bandera || '🌐'} {p.nombre} →
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mostrarNuevoPais && (
              <div style={st.formBox}>
                <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff',marginBottom:'1rem'}}>Nuevo país</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'0.75rem'}}>
                  <div>
                    <label style={st.label}>Nombre del país</label>
                    <input style={st.input} value={nuevoPais.nombre} onChange={e => setNuevoPais(n=>({...n,nombre:e.target.value}))} placeholder="Ej: Brasil, Ecuador..." />
                  </div>
                  <div>
                    <label style={st.label}>Bandera (emoji)</label>
                    <input style={st.input} value={nuevoPais.bandera} onChange={e => setNuevoPais(n=>({...n,bandera:e.target.value}))} placeholder="🇧🇷" />
                  </div>
                </div>
                <div style={{fontSize:'0.75rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.5rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Tareas regulatorias ({nuevoPais.tareas?.length||0})</div>
                {(nuevoPais.tareas||[]).map((t,i) => (
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.4rem 0.75rem',background:'rgba(255,255,255,0.04)',borderRadius:'6px',marginBottom:'0.3rem'}}>
                    <span style={{fontSize:'0.78rem',color:'#fff'}}>{t.nombre} <span style={st.tag}>{t.categoria}</span><span style={st.tag}>{t.rol_nombre}</span></span>
                    <button onClick={() => eliminarTareaDe(nuevoPais, setNuevoPais, i)} style={st.btnRed}>✕</button>
                  </div>
                ))}
                <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:'0.5rem',marginTop:'0.75rem',alignItems:'end'}}>
                  <div>
                    <label style={st.label}>Tarea</label>
                    <input style={st.input} value={nuevaTareaPais.nombre} onChange={e => setNuevaTareaPais(n=>({...n,nombre:e.target.value}))} placeholder="Ej: Registro en SAT..." />
                  </div>
                  <div>
                    <label style={st.label}>Categoría</label>
                    <select style={st.select} value={nuevaTareaPais.categoria} onChange={e => setNuevaTareaPais(n=>({...n,categoria:e.target.value}))}>
                      <option value="">Categoría...</option>
                      {categoriasDB.map(c => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={st.label}>Rol</label>
                    <select style={st.select} value={nuevaTareaPais.rol_nombre} onChange={e => setNuevaTareaPais(n=>({...n,rol_nombre:e.target.value}))}>
                      <option value="">Rol...</option>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <button type="button" onClick={() => agregarTareaA(nuevoPais, setNuevoPais, nuevaTareaPais, setNuevaTareaPais)} style={{...st.btnGreen,padding:'0.65rem 1rem'}}>+ Agregar</button>
                </div>
                <div style={{display:'flex',gap:'0.75rem',marginTop:'1.25rem'}}>
                  <button onClick={() => { setMostrarNuevoPais(false); setNuevoPais({nombre:'',bandera:'',tareas:[]}) }} style={st.btnSec}>Cancelar</button>
                  <button onClick={guardarPais} disabled={!nuevoPais.nombre||guardandoPais} style={st.btnGreen}>{guardandoPais?'Guardando...':'Guardar país →'}</button>
                </div>
              </div>
            )}

            {paisEditando && (
              <div style={st.formBox}>
                <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff',marginBottom:'1rem'}}>Editando: {paisEditando.bandera} {paisEditando.nombre}</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'0.75rem'}}>
                  <div>
                    <label style={st.label}>Nombre</label>
                    <input style={st.input} value={paisEditando.nombre} onChange={e => setPaisEditando(n=>({...n,nombre:e.target.value}))} />
                  </div>
                  <div>
                    <label style={st.label}>Bandera</label>
                    <input style={st.input} value={paisEditando.bandera} onChange={e => setPaisEditando(n=>({...n,bandera:e.target.value}))} />
                  </div>
                </div>
                <div style={{fontSize:'0.75rem',fontWeight:'600',color:'#8FA3CC',marginBottom:'0.5rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Tareas ({paisEditando.tareas?.length||0})</div>
                {(paisEditando.tareas||[]).map((t,i) => (
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.4rem 0.75rem',background:'rgba(255,255,255,0.04)',borderRadius:'6px',marginBottom:'0.3rem'}}>
                    <span style={{fontSize:'0.78rem',color:'#fff'}}>{t.nombre} <span style={st.tag}>{t.categoria}</span><span style={st.tag}>{t.rol_nombre}</span></span>
                    <button onClick={() => eliminarTareaDe(paisEditando, setPaisEditando, i)} style={st.btnRed}>✕</button>
                  </div>
                ))}
                <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:'0.5rem',marginTop:'0.75rem',alignItems:'end'}}>
                  <div>
                    <label style={st.label}>Nueva tarea</label>
                    <input style={st.input} value={nuevaTareaPais.nombre} onChange={e => setNuevaTareaPais(n=>({...n,nombre:e.target.value}))} placeholder="Ej: Registro mercantil..." />
                  </div>
                  <div>
                    <label style={st.label}>Categoría</label>
                    <select style={st.select} value={nuevaTareaPais.categoria} onChange={e => setNuevaTareaPais(n=>({...n,categoria:e.target.value}))}>
                      <option value="">Categoría...</option>
                      {categoriasDB.map(c => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={st.label}>Rol</label>
                    <select style={st.select} value={nuevaTareaPais.rol_nombre} onChange={e => setNuevaTareaPais(n=>({...n,rol_nombre:e.target.value}))}>
                      <option value="">Rol...</option>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <button type="button" onClick={() => agregarTareaA(paisEditando, setPaisEditando, nuevaTareaPais, setNuevaTareaPais)} style={{...st.btnGreen,padding:'0.65rem 1rem'}}>+ Agregar</button>
                </div>
                <div style={{display:'flex',gap:'0.75rem',marginTop:'1.25rem'}}>
                  <button onClick={() => setPaisEditando(null)} style={st.btnSec}>Cancelar</button>
                  <button onClick={guardarPais} disabled={guardandoPais} style={st.btnGreen}>{guardandoPais?'Guardando...':'Guardar cambios →'}</button>
                </div>
              </div>
            )}

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:'1rem'}}>
              {paises.map(p => (
                <div key={p.id} style={st.card}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.875rem'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                      <span style={{fontSize:'1.5rem'}}>{p.bandera}</span>
                      <div>
                        <div style={{fontSize:'0.9rem',fontWeight:'700',color:'#fff'}}>{p.nombre}</div>
                        <div style={{fontSize:'0.68rem',color:'#8FA3CC'}}>
                          {p.tareas?.length||0} tareas regulatorias
                          {p.perfiles?.nombre && <span> · creado por {p.perfiles.nombre}</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:'0.5rem'}}>
                      <button onClick={() => { setPaisEditando({...p}); setMostrarNuevoPais(false) }} style={st.btnAmber}>✏️</button>
                      <button onClick={() => eliminarPais(p.id)} style={st.btnRed}>🗑</button>
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'0.25rem'}}>
                    {(p.tareas||[]).map((t,i) => (
                      <div key={i} style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                        <div style={{width:'4px',height:'4px',borderRadius:'50%',background:'#1D9E75',flexShrink:0}}></div>
                        <span style={{fontSize:'0.72rem',color:'#8FA3CC'}}>{t.nombre}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'especialidades' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
              <div>
                <div style={{fontSize:'1rem',fontWeight:'700',color:'#fff'}}>Perfiles profesionales</div>
                <div style={{fontSize:'0.82rem',color:'#8FA3CC',marginTop:'0.2rem'}}>{especialidades.length} especialidades · Aparecen como opciones en el registro de especialistas</div>
              </div>
              <button onClick={() => { setMostrarNuevaEspecialidad(true); setEspecialidadEditando(null) }} style={st.btnGreen}>+ Nueva especialidad</button>
            </div>

            {mostrarNuevaEspecialidad && (
              <div style={st.formBox}>
                <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff',marginBottom:'1rem'}}>Nueva especialidad</div>
                <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'0.75rem',marginBottom:'1rem'}}>
                  <div>
                    <label style={st.label}>Nombre</label>
                    <input style={st.input} value={nuevaEspecialidad.nombre} onChange={e => setNuevaEspecialidad(n => ({...n,nombre:e.target.value}))} placeholder="Ej: Especialista en marcas, UX Researcher..." />
                  </div>
                  <div>
                    <label style={st.label}>Categoría asociada</label>
                    <select style={st.select} value={nuevaEspecialidad.categoria} onChange={e => { if(e.target.value==='__nueva__'){setMostrarNuevaCategoriaNueva(true)}else{setNuevaEspecialidad(n=>({...n,categoria:e.target.value}));setMostrarNuevaCategoriaNueva(false)} }}>
                      <option value="">Selecciona categoría...</option>
                      {categoriasDB.map(c => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
                      <option value="__nueva__">+ Mi categoría no está en la lista</option>
                    </select>
                    {mostrarNuevaCategoriaNueva && (
                      <div style={{display:'flex',gap:'0.5rem',marginTop:'0.5rem'}}>
                        <input type="text" value={nuevaCategoriaTexto} onChange={e=>setNuevaCategoriaTexto(e.target.value)} placeholder="Ej: Operaciones, Logística..." style={{flex:1,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.5rem 0.875rem',color:'#fff',fontSize:'0.82rem',outline:'none',fontFamily:'Inter,sans-serif'}} onKeyDown={(e)=>{if(e.key==='Enter'){e.preventDefault();crearNuevaCategoria(nuevaCategoriaTexto,'nueva')}}} />
                        <button type="button" onClick={()=>crearNuevaCategoria(nuevaCategoriaTexto,'nueva')} disabled={creandoCategoria} style={st.btnGreen}>{creandoCategoria?'...':'Crear'}</button>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{display:'flex',gap:'0.75rem'}}>
                  <button onClick={() => { setMostrarNuevaEspecialidad(false); setNuevaEspecialidad({nombre:'',categoria:''}) }} style={st.btnSec}>Cancelar</button>
                  <button onClick={guardarEspecialidad} disabled={!nuevaEspecialidad.nombre||guardandoEsp} style={st.btnGreen}>{guardandoEsp?'Guardando...':'Guardar especialidad →'}</button>
                </div>
              </div>
            )}

            {especialidadEditando && (
              <div style={st.formBox}>
                <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff',marginBottom:'1rem'}}>Editando: {especialidadEditando.nombre}</div>
                <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'0.75rem',marginBottom:'1rem'}}>
                  <div>
                    <label style={st.label}>Nombre</label>
                    <input style={st.input} value={especialidadEditando.nombre} onChange={e => setEspecialidadEditando(n=>({...n,nombre:e.target.value}))} />
                  </div>
                  <div>
                    <label style={st.label}>Categoría asociada</label>
                    <select style={st.select} value={especialidadEditando.categoria || ''} onChange={e => { if(e.target.value==='__nueva__'){setMostrarNuevaCategoriaEditar(true)}else{setEspecialidadEditando(n=>({...n,categoria:e.target.value}));setMostrarNuevaCategoriaEditar(false)} }}>
                      <option value="">Selecciona categoría...</option>
                      {categoriasDB.map(c => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
                      <option value="__nueva__">+ Mi categoría no está en la lista</option>
                    </select>
                    {mostrarNuevaCategoriaEditar && (
                      <div style={{display:'flex',gap:'0.5rem',marginTop:'0.5rem'}}>
                        <input type="text" value={nuevaCategoriaTexto} onChange={e=>setNuevaCategoriaTexto(e.target.value)} placeholder="Ej: Operaciones, Logística..." style={{flex:1,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.5rem 0.875rem',color:'#fff',fontSize:'0.82rem',outline:'none',fontFamily:'Inter,sans-serif'}} onKeyDown={(e)=>{if(e.key==='Enter'){e.preventDefault();crearNuevaCategoria(nuevaCategoriaTexto,'editar')}}} />
                        <button type="button" onClick={()=>crearNuevaCategoria(nuevaCategoriaTexto,'editar')} disabled={creandoCategoria} style={st.btnGreen}>{creandoCategoria?'...':'Crear'}</button>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{display:'flex',gap:'0.75rem'}}>
                  <button onClick={() => setEspecialidadEditando(null)} style={st.btnSec}>Cancelar</button>
                  <button onClick={guardarEspecialidad} disabled={guardandoEsp} style={st.btnGreen}>{guardandoEsp?'Guardando...':'Guardar cambios →'}</button>
                </div>
              </div>
            )}

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'0.75rem'}}>
              {especialidades.map(esp => (
                <div key={esp.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'1rem 1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>{esp.nombre}</div>
                    {esp.categoria && <span style={{fontSize:'0.62rem',padding:'1px 6px',borderRadius:'4px',background:'rgba(255,255,255,0.06)',color:'#8FA3CC'}}>{esp.categoria}</span>}
                  </div>
                  <div style={{display:'flex',gap:'0.5rem'}}>
                    <button onClick={() => { setEspecialidadEditando({...esp}); setMostrarNuevaEspecialidad(false) }} style={st.btnAmber}>✏️</button>
                    <button onClick={() => eliminarEspecialidad(esp.id)} style={st.btnRed}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
