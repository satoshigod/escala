'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const MODALIDADES = [
  { value: 'equity', label: 'Equity' },
  { value: 'deuda_diferida', label: 'Deuda diferida' },
  { value: 'convertible', label: 'Deuda convertible' },
  { value: 'success_fee', label: 'Success fee' },
  { value: 'hibrido', label: 'Híbrido' },
]
const TIPOS_APORTE = [
  { value: 'tiempo', label: 'Tiempo' },
  { value: 'servicio', label: 'Servicio' },
  { value: 'capital', label: 'Capital' },
  { value: 'conocimiento', label: 'Conocimiento' },
  { value: 'activo', label: 'Activo' },
]

export default function Admin() {
  const [usuario, setUsuario] = useState(null)
  const [proyectos, setProyectos] = useState([])
  const [postulaciones, setPostulaciones] = useState({})
  const [roles, setRoles] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [cargando, setCargando] = useState(true)
  const [actualizando, setActualizando] = useState(null)
  const [proyectoSel, setProyectoSel] = useState(null)
  const [tab, setTab] = useState('postulaciones')
  const [vista, setVista] = useState('catalogo')
  const [guardandoRol, setGuardandoRol] = useState(false)
  const [msgRol, setMsgRol] = useState('')
  const [busquedaEsp, setBusquedaEsp] = useState('')
  const [espSeleccionada, setEspSeleccionada] = useState(null)
  const [rolForm, setRolForm] = useState({ valor_mercado: '', modalidad: 'equity', es_prioritario: false, descripcion: '' })
  const [contratos, setContratos] = useState([])

  const s = {
    input: { width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', padding:'0.65rem 0.875rem', color:'#fff', fontSize:'0.875rem', outline:'none', boxSizing:'border-box', fontFamily:'Inter,sans-serif' },
    label: { display:'block', fontSize:'0.72rem', fontWeight:'600', color:'#8FA3CC', marginBottom:'0.4rem', textTransform:'uppercase', letterSpacing:'0.04em' },
    btnGreen: { background:'#1D9E75', color:'#fff', border:'none', borderRadius:'8px', padding:'0.65rem 1.25rem', fontSize:'0.82rem', fontWeight:'700', cursor:'pointer', fontFamily:'Inter,sans-serif' },
    btnSec: { background:'transparent', color:'#8FA3CC', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', padding:'0.65rem 1.25rem', fontSize:'0.82rem', cursor:'pointer', fontFamily:'Inter,sans-serif' },
  }

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)

      const [resP, resEsp] = await Promise.all([
        fetch('/api/proyectos'),
        fetch('/api/especialidades?aprobado=true'),
      ])
      const dataP = await resP.json()
      const dataEsp = await resEsp.json()

      const misproyectos = (dataP.proyectos || []).filter(p => p.fundador_id === user.id)
      setProyectos(misproyectos)
      setEspecialidades(dataEsp.especialidades || [])

      if (misproyectos.length > 0) {
        setProyectoSel(misproyectos[0].id)
        await cargarRolesYPostulaciones(misproyectos[0].id)
      }
      setCargando(false)
    }
    cargar()
  }, [])

  async function cargarRolesYPostulaciones(proyecto_id) {
    const [rolesRes, contratosRes] = await Promise.all([
      fetch('/api/roles?proyecto_id=' + proyecto_id),
      fetch('/api/contratos?proyecto_id=' + proyecto_id),
    ])
    const rolesData = await rolesRes.json()
    const contratosData = await contratosRes.json()
    const todosRoles = rolesData.roles || []
    setRoles(todosRoles)
    setContratos(contratosData.contratos || [])

    const posts = {}
    await Promise.all(todosRoles.map(async rol => {
      const res = await fetch('/api/postulaciones?rol_id=' + rol.id)
      const data = await res.json()
      if (data.postulaciones?.length > 0) posts[rol.nombre] = data.postulaciones
    }))
    setPostulaciones(posts)
  }

  async function seleccionarProyecto(id) {
    setProyectoSel(id)
    setPostulaciones({})
    setRoles([])
    await cargarRolesYPostulaciones(id)
  }

  async function cambiarEstado(id, estado, rol_nombre) {
    setActualizando(id)
    await fetch('/api/postulaciones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, estado, fundador_id: usuario?.id })
    })

    // Si se acepta, generar contrato automaticamente
    if (estado === 'aceptada') {
      await fetch('/api/contratos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postulacion_id: id, fundador_id: usuario?.id })
      })
    }

    setPostulaciones(prev => ({
      ...prev,
      [rol_nombre]: prev[rol_nombre].map(p => p.id === id ? { ...p, estado } : p)
    }))
    setActualizando(null)
  }

  async function agregarRolDesdeCatalogo() {
    if (!espSeleccionada || !proyectoSel) return
    setGuardandoRol(true)
    setMsgRol('')
    const res = await fetch('/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proyecto_id: proyectoSel,
        nombre: espSeleccionada.nombre,
        descripcion: rolForm.descripcion || espSeleccionada.descripcion || '',
        tipo_aporte: espSeleccionada.tipo_aporte || 'tiempo',
        valor_mercado: Number(rolForm.valor_mercado) || 0,
        modalidad: rolForm.modalidad,
        es_prioritario: rolForm.es_prioritario,
        fundador_id: usuario.id,
      })
    })
    const data = await res.json()
    if (data.error) {
      setMsgRol('Error: ' + data.error)
    } else {
      setRoles(prev => [...prev, data.rol])
      setMsgRol('✓ Especialidad/Rol agregada al proyecto')
      setEspSeleccionada(null)
      setRolForm({ valor_mercado: '', modalidad: 'equity', es_prioritario: false, descripcion: '' })
      setBusquedaEsp('')
      setVista('catalogo')
      setTimeout(() => setMsgRol(''), 3000)
    }
    setGuardandoRol(false)
  }

  async function crearEspecialidadYRol() {
    if (!nuevaEspForm.nombre || !proyectoSel) return
    setGuardandoRol(true)
    setMsgRol('')

    // 1. Proponer la especialidad al catálogo (queda pendiente de aprobación)
    await fetch('/api/especialidades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nuevaEspForm.nombre,
        categoria: nuevaEspForm.categoria,
        propuesto_por: usuario.id,
      })
    })

    // 2. Crear el rol en el proyecto inmediatamente
    const res = await fetch('/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proyecto_id: proyectoSel,
        nombre: nuevaEspForm.nombre,
        descripcion: nuevaEspForm.descripcion,
        tipo_aporte: nuevaEspForm.tipo_aporte,
        valor_mercado: Number(nuevaEspForm.valor_mercado) || 0,
        modalidad: nuevaEspForm.modalidad,
        es_prioritario: nuevaEspForm.es_prioritario,
        fundador_id: usuario.id,
      })
    })
    const data = await res.json()
    if (data.error) {
      setMsgRol('Error: ' + data.error)
    } else {
      setRoles(prev => [...prev, data.rol])
      setMsgRol('✓ Rol creado en tu proyecto. La especialidad fue enviada a Escala para revisión y quedará disponible para otros proyectos cuando sea aprobada.')
      setNuevaEspForm({ nombre: '', categoria: 'General', tipo_aporte: 'tiempo', descripcion: '', valor_mercado: '', modalidad: 'equity', es_prioritario: false })
      setVista('catalogo')
      setTimeout(() => setMsgRol(''), 5000)
    }
    setGuardandoRol(false)
  }

  async function cambiarEstadoRol(rolId, estado) {
    await fetch('/api/roles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: rolId, estado })
    })
    setRoles(prev => prev.map(r => r.id === rolId ? { ...r, estado } : r))
  }

  const estadoColor = { pendiente: '#E8A020', aceptada: '#1D9E75', rechazada: '#D85A30' }
  const estadoLabel = { pendiente: '⏳ Pendiente', aceptada: '✅ Aceptada', rechazada: '✗ Rechazada' }
  const totalPost = Object.values(postulaciones).reduce((a, b) => a + b.length, 0)
  const pendientes = Object.values(postulaciones).flat().filter(p => p.estado === 'pendiente').length

  const espFiltradas = especialidades.filter(e =>
    !busquedaEsp || e.nombre.toLowerCase().includes(busquedaEsp.toLowerCase()) || (e.categoria || '').toLowerCase().includes(busquedaEsp.toLowerCase())
  )
  const categorias = [...new Set(especialidades.map(e => e.categoria || 'General'))].sort()

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando panel...
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/dashboard" style={{textDecoration:'none'}}><div style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff'}}>Esca<span style={{color:'#1D9E75'}}>la</span></div></a>
        <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Dashboard</a>
          <a href="/proyectos" style={{color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>Proyectos</a>
          <a href="/admin" style={{color:'#fff',fontSize:'0.82rem',fontWeight:'600',textDecoration:'none'}}>Panel fundador</a>
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/registro?modo=login' }} style={{background:'rgba(216,90,48,0.1)',border:'1px solid rgba(216,90,48,0.25)',color:'#D85A30',fontSize:'0.78rem',fontWeight:'600',padding:'0.3rem 0.875rem',borderRadius:'6px',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Salir</button>
        </div>
      </nav>

      <main style={{maxWidth:'1000px',margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'1.5rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#E8A020',marginBottom:'0.4rem'}}>Panel del fundador</div>
          <div style={{fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Gestión del proyecto</div>
        </div>

        {proyectos.length === 0 ? (
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.12)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
            <div style={{fontSize:'2rem',marginBottom:'1rem'}}>🚀</div>
            <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.5rem'}}>No tienes proyectos publicados</div>
            <a href="/proyectos" style={{background:'#1D9E75',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.875rem',fontWeight:'700'}}>Publicar proyecto →</a>
          </div>
        ) : (
          <>
            {proyectos.length > 1 && (
              <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap',marginBottom:'1.5rem'}}>
                {proyectos.map(p => (
                  <button key={p.id} onClick={() => seleccionarProyecto(p.id)} style={{background: proyectoSel === p.id ? '#1D9E75' : 'rgba(255,255,255,0.05)', color: proyectoSel === p.id ? '#fff' : '#8FA3CC', border: proyectoSel === p.id ? 'none' : '1px solid rgba(255,255,255,0.12)', borderRadius:'8px', padding:'0.5rem 1rem', fontSize:'0.82rem', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif'}}>
                    {p.nombre}
                  </button>
                ))}
              </div>
            )}

            {/* Tabs principales */}
            <div style={{display:'flex',gap:'4px',marginBottom:'1.5rem',background:'rgba(255,255,255,0.04)',borderRadius:'10px',padding:'4px',width:'fit-content'}}>
              {[
                ['postulaciones', `Postulaciones${pendientes > 0 ? ' ('+pendientes+')' : ''}`],
                ['roles', `Especialidades / Roles (${roles.length})`],
                ['contratos', `Contratos${contratos.length > 0 ? ' ('+contratos.length+')' : ''}`],
              ].map(([t, label]) => (
                <button key={t} onClick={() => setTab(t)} style={{background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#0D1B3E' : '#8FA3CC', border:'none', borderRadius:'7px', padding:'0.5rem 1.25rem', fontSize:'0.82rem', fontWeight: tab === t ? '700' : '400', cursor:'pointer', fontFamily:'Inter,sans-serif', transition:'all 0.15s'}}>
                  {label}
                </button>
              ))}
            </div>

            {/* TAB POSTULACIONES */}
            {tab === 'postulaciones' && (
              Object.keys(postulaciones).length === 0 ? (
                <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.12)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
                  <div style={{fontSize:'2rem',marginBottom:'1rem'}}>📭</div>
                  <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.5rem'}}>Sin postulaciones todavía</div>
                  <div style={{color:'#8FA3CC',fontSize:'0.85rem'}}>Agrega especialidades/roles a tu proyecto para empezar a recibir postulaciones.</div>
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:'2rem'}}>
                  {Object.entries(postulaciones).map(([rol, posts]) => (
                    <div key={rol}>
                      <div style={{fontSize:'0.9rem',fontWeight:'700',color:'#fff',marginBottom:'0.875rem',paddingBottom:'0.75rem',borderBottom:'1px solid rgba(255,255,255,0.08)',display:'flex',justifyContent:'space-between'}}>
                        <span>{rol}</span>
                        <span style={{fontSize:'0.72rem',color:'#8FA3CC',fontWeight:'400'}}>{posts.length} postulación{posts.length !== 1 ? 'es' : ''}</span>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                        {posts.map(p => (
                          <div key={p.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
                            <div>
                              <a href={'/perfil/' + p.postulante_id} style={{fontSize:'0.9rem',fontWeight:'700',color:'#1D9E75',textDecoration:'none',display:'block',marginBottom:'0.2rem'}}>{p.perfiles?.nombre || 'Usuario'} →</a>
                              <div style={{fontSize:'0.75rem',color:'#8FA3CC'}}>{p.perfiles?.ciudad || ''} · {p.perfiles?.especialidad || p.perfiles?.rol_principal || ''}</div>
                              <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'2px'}}>Score: {p.perfiles?.escala_score || 0} · {new Date(p.created_at).toLocaleDateString('es-CO')}</div>
                            </div>
                            <div style={{display:'flex',alignItems:'center',gap:'0.75rem',flexWrap:'wrap'}}>
                              <span style={{fontSize:'0.75rem',fontWeight:'700',padding:'0.3rem 0.875rem',borderRadius:'20px',background:`rgba(${p.estado==='aceptada'?'29,158,117':p.estado==='rechazada'?'216,90,48':'232,160,32'},0.15)`,color:estadoColor[p.estado]}}>
                                {estadoLabel[p.estado]}
                              </span>
                              {p.estado === 'pendiente' && (
                                <>
                                  <button onClick={() => cambiarEstado(p.id, 'aceptada', rol)} disabled={actualizando === p.id} style={{background:'rgba(29,158,117,0.15)',color:'#1D9E75',border:'1px solid rgba(29,158,117,0.3)',borderRadius:'6px',padding:'0.4rem 0.875rem',fontSize:'0.78rem',fontWeight:'600',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Aceptar</button>
                                  <button onClick={() => cambiarEstado(p.id, 'rechazada', rol)} disabled={actualizando === p.id} style={{background:'rgba(216,90,48,0.1)',color:'#D85A30',border:'1px solid rgba(216,90,48,0.25)',borderRadius:'6px',padding:'0.4rem 0.875rem',fontSize:'0.78rem',fontWeight:'600',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Rechazar</button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* TAB ROLES */}
            {tab === 'roles' && (
              <div>
                {/* Roles actuales */}
                {roles.length > 0 && (
                  <div style={{marginBottom:'1.5rem'}}>
                    <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#8FA3CC',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.875rem'}}>
                      Especialidades / Roles publicados en este proyecto
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                      {roles.map(r => (
                        <div key={r.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'1rem 1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'0.75rem'}}>
                          <div>
                            <div style={{fontSize:'0.9rem',fontWeight:'700',color:'#fff'}}>{r.nombre} {r.es_prioritario && '🔥'}</div>
                            {r.descripcion && <div style={{fontSize:'0.75rem',color:'#8FA3CC',marginTop:'2px'}}>{r.descripcion}</div>}
                            <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'4px'}}>
                              {r.valor_mercado > 0 ? '$' + Number(r.valor_mercado).toLocaleString('es-CO') : 'Valor a negociar'} · {r.modalidad}
                            </div>
                          </div>
                          <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                            <span style={{fontSize:'0.68rem',fontWeight:'700',padding:'3px 10px',borderRadius:'20px',background: r.estado==='abierto' ? 'rgba(29,158,117,0.15)' : 'rgba(255,255,255,0.08)',color: r.estado==='abierto' ? '#1D9E75' : '#8FA3CC'}}>
                              {r.estado === 'abierto' ? 'Abierto' : r.estado === 'cubierto' ? 'Cubierto' : 'En negociación'}
                            </span>
                            {r.estado === 'abierto' && (
                              <button onClick={() => cambiarEstadoRol(r.id, 'cubierto')} style={{background:'none',border:'none',color:'#8FA3CC',fontSize:'0.72rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Marcar cubierto</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {msgRol && (
                  <div style={{padding:'0.75rem 1rem',background: msgRol.startsWith('✓') ? 'rgba(29,158,117,0.1)' : 'rgba(216,90,48,0.1)',border:`1px solid ${msgRol.startsWith('✓') ? 'rgba(29,158,117,0.3)' : 'rgba(216,90,48,0.3)'}`,borderRadius:'8px',fontSize:'0.82rem',color: msgRol.startsWith('✓') ? '#1D9E75' : '#D85A30',marginBottom:'1rem',lineHeight:'1.6'}}>
                    {msgRol}
                  </div>
                )}

                {/* Sub-tabs: catálogo o nueva */}
                {vista !== 'nueva' && (
                  <div style={{display:'flex',gap:'0.75rem',marginBottom:'1.25rem',flexWrap:'wrap'}}>
                    <button onClick={() => setVista('catalogo')} style={{...s.btnGreen}}>
                      + Agregar del catálogo
                    </button>
                    <button onClick={() => { setVista('nueva'); setEspSeleccionada(null) }} style={s.btnSec}>
                      + Crear especialidad / Rol nuevo
                    </button>
                  </div>
                )}

                {/* Vista: elegir del catálogo */}
                {vista === 'catalogo' && (
                  <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem'}}>
                    <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#8FA3CC',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'1rem'}}>
                      Catálogo de especialidades / roles
                    </div>
                    <input
                      value={busquedaEsp}
                      onChange={e => setBusquedaEsp(e.target.value)}
                      placeholder="Buscar por nombre o categoría..."
                      style={{...s.input, marginBottom:'1rem'}}
                    />
                    <div style={{display:'flex',flexDirection:'column',gap:'0.4rem',maxHeight:'320px',overflowY:'auto',marginBottom: espSeleccionada ? '1rem' : 0}}>
                      {categorias.map(cat => {
                        const deEstaCategoria = espFiltradas.filter(e => (e.categoria || 'General') === cat)
                        if (deEstaCategoria.length === 0) return null
                        return (
                          <div key={cat}>
                            <div style={{fontSize:'0.65rem',fontWeight:'700',color:'#8FA3CC',textTransform:'uppercase',letterSpacing:'0.06em',padding:'0.5rem 0 0.25rem'}}>{cat}</div>
                            {deEstaCategoria.map(e => (
                              <div key={e.id} onClick={() => setEspSeleccionada(e)} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.625rem 0.875rem',borderRadius:'8px',cursor:'pointer',marginBottom:'2px',background: espSeleccionada?.id === e.id ? 'rgba(29,158,117,0.12)' : 'rgba(255,255,255,0.03)',border: espSeleccionada?.id === e.id ? '1px solid rgba(29,158,117,0.3)' : '1px solid rgba(255,255,255,0.06)'}}>
                                <span style={{fontSize:'0.85rem',color: espSeleccionada?.id === e.id ? '#1D9E75' : '#fff',fontWeight: espSeleccionada?.id === e.id ? '600' : '400'}}>
                                  {e.nombre} {espSeleccionada?.id === e.id ? '✓' : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        )
                      })}
                      {espFiltradas.length === 0 && (
                        <div style={{fontSize:'0.82rem',color:'#8FA3CC',padding:'1rem 0'}}>
                          No se encontró "{busquedaEsp}" en el catálogo.{' '}
                          <button onClick={() => setVista('nueva')} style={{background:'none',border:'none',color:'#1D9E75',cursor:'pointer',fontFamily:'Inter,sans-serif',fontSize:'0.82rem',textDecoration:'underline'}}>
                            Crear especialidad nueva →
                          </button>
                        </div>
                      )}
                    </div>

                    {espSeleccionada && (
                      <div style={{borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:'1rem',marginTop:'0.5rem'}}>
                        <div style={{fontSize:'0.82rem',fontWeight:'600',color:'#fff',marginBottom:'0.875rem'}}>
                          Configurar "{espSeleccionada.nombre}" en este proyecto
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'0.875rem'}}>
                          <div>
                            <label style={s.label}>Valor en COP (0 = a negociar)</label>
                            <input style={s.input} type="number" value={rolForm.valor_mercado} onChange={e => setRolForm(f => ({...f,valor_mercado:e.target.value}))} placeholder="Ej: 500000" />
                          </div>
                          <div>
                            <label style={s.label}>Modalidad de compensación</label>
                            <select style={{...s.input,background:'#1a2a4a'}} value={rolForm.modalidad} onChange={e => setRolForm(f => ({...f,modalidad:e.target.value}))}>
                              {MODALIDADES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                          </div>
                        </div>
                        <div style={{marginBottom:'0.875rem'}}>
                          <label style={s.label}>Descripción específica (opcional)</label>
                          <input style={s.input} value={rolForm.descripcion} onChange={e => setRolForm(f => ({...f,descripcion:e.target.value}))} placeholder="¿Qué necesitas exactamente para este proyecto?" />
                        </div>
                        <label style={{display:'flex',alignItems:'center',gap:'0.5rem',cursor:'pointer',fontSize:'0.82rem',color:'#8FA3CC',marginBottom:'1rem'}}>
                          <input type="checkbox" checked={rolForm.es_prioritario} onChange={e => setRolForm(f => ({...f,es_prioritario:e.target.checked}))} />
                          Marcar como prioritario — aparece destacado en el proyecto
                        </label>
                        <div style={{display:'flex',gap:'0.75rem'}}>
                          <button onClick={() => { setEspSeleccionada(null); setRolForm({ valor_mercado:'', modalidad:'equity', es_prioritario:false, descripcion:'' }) }} style={s.btnSec}>Cancelar</button>
                          <button onClick={agregarRolDesdeCatalogo} disabled={guardandoRol} style={s.btnGreen}>
                            {guardandoRol ? 'Agregando...' : 'Agregar a mi proyecto →'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Vista: crear especialidad nueva */}
                {vista === 'nueva' && (
                  <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.5rem'}}>
                    <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#fff',marginBottom:'0.4rem'}}>Crear nueva especialidad / Rol</div>
                    <div style={{fontSize:'0.75rem',color:'#8FA3CC',marginBottom:'1.25rem',lineHeight:'1.6'}}>
                      El rol se agrega a tu proyecto inmediatamente. El nombre de la especialidad se envía a Escala para revisión — cuando sea aprobado quedará disponible para todos los fundadores.
                    </div>
                    <div style={{display:'grid',gap:'0.875rem',marginBottom:'1rem'}}>
                      <div>
                        <label style={s.label}>Nombre de la especialidad / Rol *</label>
                        <input style={s.input} value={nuevaEspForm.nombre} onChange={e => setNuevaEspForm(f => ({...f,nombre:e.target.value}))} placeholder="Ej: Experto en logística para clínica" />
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
                        <div>
                          <label style={s.label}>Categoría</label>
                          <input style={s.input} value={nuevaEspForm.categoria} onChange={e => setNuevaEspForm(f => ({...f,categoria:e.target.value}))} placeholder="Ej: Logística, Legal, Tecnología..." />
                        </div>
                        <div>
                          <label style={s.label}>Tipo de aporte</label>
                          <select style={{...s.input,background:'#1a2a4a'}} value={nuevaEspForm.tipo_aporte} onChange={e => setNuevaEspForm(f => ({...f,tipo_aporte:e.target.value}))}>
                            {TIPOS_APORTE.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label style={s.label}>Descripción</label>
                        <input style={s.input} value={nuevaEspForm.descripcion} onChange={e => setNuevaEspForm(f => ({...f,descripcion:e.target.value}))} placeholder="¿Qué necesitas que haga esta persona?" />
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
                        <div>
                          <label style={s.label}>Valor en COP (0 = a negociar)</label>
                          <input style={s.input} type="number" value={nuevaEspForm.valor_mercado} onChange={e => setNuevaEspForm(f => ({...f,valor_mercado:e.target.value}))} placeholder="0" />
                        </div>
                        <div>
                          <label style={s.label}>Modalidad</label>
                          <select style={{...s.input,background:'#1a2a4a'}} value={nuevaEspForm.modalidad} onChange={e => setNuevaEspForm(f => ({...f,modalidad:e.target.value}))}>
                            {MODALIDADES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                          </select>
                        </div>
                      </div>
                      <label style={{display:'flex',alignItems:'center',gap:'0.5rem',cursor:'pointer',fontSize:'0.82rem',color:'#8FA3CC'}}>
                        <input type="checkbox" checked={nuevaEspForm.es_prioritario} onChange={e => setNuevaEspForm(f => ({...f,es_prioritario:e.target.checked}))} />
                        Marcar como prioritario
                      </label>
                    </div>
                    <div style={{display:'flex',gap:'0.75rem'}}>
                      <button onClick={() => setVista('catalogo')} style={s.btnSec}>Cancelar</button>
                      <button onClick={crearEspecialidadYRol} disabled={!nuevaEspForm.nombre || guardandoRol} style={s.btnGreen}>
                        {guardandoRol ? 'Creando...' : 'Crear y agregar al proyecto →'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'contratos' && (
              <div>
                <div style={{marginBottom:'1.5rem'}}>
                  <div style={{fontSize:'1rem',fontWeight:'700',color:'#fff',marginBottom:'0.3rem'}}>Contratos del proyecto</div>
                  <div style={{fontSize:'0.8rem',color:'#8FA3CC'}}>Contratos generados con los especialistas aceptados. Descarga, firma fisicamente y confirma tu firma aqui.</div>
                </div>

                {contratos.length === 0 ? (
                  <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'12px',padding:'3rem',textAlign:'center'}}>
                    <div style={{fontSize:'2rem',marginBottom:'0.75rem'}}>📄</div>
                    <div style={{color:'#fff',fontWeight:'700',marginBottom:'0.4rem'}}>Sin contratos todavia</div>
                    <div style={{color:'#8FA3CC',fontSize:'0.85rem'}}>Los contratos se generan automaticamente cuando aceptas una postulacion.</div>
                  </div>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                    {contratos.map(c => {
                      const fundadorFirmo = c.firmado_fundador
                      const profesionalFirmo = c.firmado_profesional
                      const estadoLabel = c.estado === 'vigente' ? 'Vigente' : c.estado === 'firmado_parcial' ? 'Firma parcial' : 'Pendiente de firma'
                      const estadoColor = c.estado === 'vigente' ? '#1D9E75' : c.estado === 'firmado_parcial' ? '#E8A020' : '#8FA3CC'
                      const estadoBg = c.estado === 'vigente' ? 'rgba(29,158,117,0.1)' : c.estado === 'firmado_parcial' ? 'rgba(232,160,32,0.1)' : 'rgba(255,255,255,0.06)'
                      const textoContrato = c.condiciones || c.contenido_json?.texto_pdf

                      return (
                        <div key={c.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem'}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1rem',flexWrap:'wrap',gap:'0.5rem'}}>
                            <div>
                              <div style={{fontSize:'0.9rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>
                                {c.perfil_profesional?.nombre || 'Especialista'}
                              </div>
                              <div style={{fontSize:'0.75rem',color:'#8FA3CC'}}>
                                {c.roles?.nombre}{c.roles?.sub_especialidad ? ' - ' + c.roles.sub_especialidad : ''}
                              </div>
                              <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.2rem'}}>
                                {c.modalidad === 'deuda_diferida' ? 'Riesgo Compartido' : c.modalidad === 'equity' ? 'Equity' : c.modalidad}
                                {c.valor ? ' - $' + Number(c.valor).toLocaleString('es-CO') + ' COP' : ''}
                              </div>
                            </div>
                            <span style={{fontSize:'0.7rem',fontWeight:'700',padding:'0.25rem 0.875rem',borderRadius:'20px',background:estadoBg,color:estadoColor}}>
                              {estadoLabel}
                            </span>
                          </div>

                          <div style={{display:'flex',gap:'2rem',marginBottom:'1rem',flexWrap:'wrap'}}>
                            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                              <span style={{fontSize:'1.1rem'}}>{fundadorFirmo ? '✅' : '⬜'}</span>
                              <div>
                                <div style={{fontSize:'0.72rem',fontWeight:'700',color:fundadorFirmo?'#1D9E75':'#fff'}}>Tu firma</div>
                                <div style={{fontSize:'0.68rem',color:'#8FA3CC'}}>{fundadorFirmo ? 'Confirmada' : 'Pendiente'}</div>
                              </div>
                            </div>
                            <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                              <span style={{fontSize:'1.1rem'}}>{profesionalFirmo ? '✅' : '⬜'}</span>
                              <div>
                                <div style={{fontSize:'0.72rem',fontWeight:'700',color:profesionalFirmo?'#1D9E75':'#fff'}}>{c.perfil_profesional?.nombre || 'Especialista'}</div>
                                <div style={{fontSize:'0.68rem',color:'#8FA3CC'}}>{profesionalFirmo ? 'Confirmo su firma' : 'Pendiente de firma'}</div>
                              </div>
                            </div>
                          </div>

                          <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
                            {textoContrato && (
                              <button onClick={() => {
                                const blob = new Blob([textoContrato], {type:'text/plain;charset=utf-8'})
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = 'Contrato_' + (c.perfil_profesional?.nombre || 'especialista').replace(/\s/g,'_') + '.txt'
                                a.click()
                                URL.revokeObjectURL(url)
                              }} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.15)',color:'#fff',borderRadius:'8px',padding:'0.5rem 1rem',fontSize:'0.78rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                                Descargar contrato
                              </button>
                            )}
                            {!fundadorFirmo && (
                              <button onClick={async () => {
                                const res = await fetch('/api/contratos', {
                                  method: 'PATCH',
                                  headers: {'Content-Type':'application/json'},
                                  body: JSON.stringify({id: c.id, tipo: 'fundador'})
                                })
                                const data = await res.json()
                                if (data.contrato) setContratos(prev => prev.map(x => x.id === c.id ? {...x, ...data.contrato} : x))
                              }} style={{background:'#1D9E75',border:'none',color:'#fff',borderRadius:'8px',padding:'0.5rem 1rem',fontSize:'0.78rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                                Confirmar mi firma
                              </button>
                            )}
                            {fundadorFirmo && !profesionalFirmo && (
                              <div style={{fontSize:'0.75rem',color:'#E8A020',display:'flex',alignItems:'center',gap:'0.4rem'}}>
                                Esperando firma de {c.perfil_profesional?.nombre || 'el especialista'}
                              </div>
                            )}
                          </div>

                          {!fundadorFirmo && (
                            <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.75rem',lineHeight:'1.5',borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:'0.75rem'}}>
                              Descarga el contrato, firmalo fisicamente junto a {c.perfil_profesional?.nombre || 'el especialista'} y confirma tu firma aqui para que quede registrado en la plataforma.
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
