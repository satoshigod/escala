'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
const MODALIDADES = [
  { value: 'equity', label: 'Equity' },
  { value: 'deuda_diferida', label: 'Deuda diferida' },
  { value: 'convertible', label: 'Deuda convertible' },
  { value: 'success_fee', label: 'Success fee' },
  { value: 'hibrido', label: 'Híbrido' },
]
const TIPOS_APORTE = [
  { value: 'servicio', label: 'Servicio profesional' },
  { value: 'tiempo', label: 'Tiempo / trabajo' },
  { value: 'conocimiento', label: 'Conocimiento / mentoría' },
  { value: 'capital', label: 'Capital' },
  { value: 'activo', label: 'Activo' },
]

const SUB_ESP_ABOGADO = [
  { value: 'Constitución de empresas', label: 'Constitución de empresas', desc: 'Estudio de forma societaria, redacción de estatutos, registro en Cámara de Comercio, NIT ante la DIAN y trámites legales iniciales.' },
  { value: 'Contratos comerciales', label: 'Contratos comerciales', desc: 'Redacción y revisión de contratos con clientes, proveedores, distribuidores o socios.' },
  { value: 'Propiedad intelectual', label: 'Propiedad intelectual', desc: 'Registro de marca, patentes, protección de software y activos intelectuales del proyecto.' },
  { value: 'Derecho laboral', label: 'Derecho laboral', desc: 'Contratos de trabajo, reglamento interno, liquidaciones y cumplimiento normativo laboral.' },
  { value: 'Derecho tributario', label: 'Derecho tributario', desc: 'Planeación tributaria, revisión de obligaciones fiscales y representación ante la DIAN.' },
  { value: 'General', label: 'Asesoría jurídica general', desc: 'Acompañamiento legal general del proyecto en las áreas que se requieran.' },
]

const SUB_ESP_CONTADOR = [
  { value: 'Constitución de empresas', label: 'Constitución de empresas', desc: 'RUT, régimen tributario, facturación electrónica, apertura de libros contables y configuración de obligaciones ante la DIAN.' },
  { value: 'Contabilidad mensual', label: 'Contabilidad mensual', desc: 'Registro contable mensual, conciliaciones y estados financieros básicos.' },
  { value: 'Declaraciones tributarias', label: 'Declaraciones tributarias', desc: 'Preparación y presentación de declaraciones de IVA, renta, retención en la fuente e industria y comercio.' },
  { value: 'Nómina', label: 'Nómina', desc: 'Liquidación de nómina, aportes a seguridad social y prestaciones sociales.' },
  { value: 'Auditoría', label: 'Auditoría', desc: 'Revisión independiente de estados financieros y control interno.' },
  { value: 'General', label: 'Asesoría contable general', desc: 'Acompañamiento contable y tributario general del proyecto.' },
]
export default function Workspace() {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [proyecto, setProyecto] = useState(null)
  const [roles, setRoles] = useState([])
  const [hitos, setHitos] = useState([])
  const [aportes, setAportes] = useState([])
  const [postulaciones, setPostulaciones] = useState([])
  const [miPostulacion, setMiPostulacion] = useState(null)
  const [miContrato, setMiContrato] = useState(null)
  const [tab, setTab] = useState('resumen')
  const [cargando, setCargando] = useState(true)
  const [acceso, setAcceso] = useState(false)
  const [actualizando, setActualizando] = useState(null)
  const [nuevoHito, setNuevoHito] = useState('')
  const [creandoHito, setCreandoHito] = useState(false)
  const [nuevoAporte, setNuevoAporte] = useState({ descripcion: '', valor: '', tipo: 'horas' })
  const [registrando, setRegistrando] = useState(false)
  const [deuda, setDeuda] = useState({ pendiente: [], resuelta: [], total_pendiente: 0 })
  const [badgeTareas, setBadgeTareas] = useState(0)
  const [badgeChat, setBadgeChat] = useState(0)
  const [mostrarFormRol, setMostrarFormRol] = useState(false)
  const [rolForm, setRolForm] = useState({ nombre: '', sub_especialidad: '', descripcion: '', tipo_aporte: 'servicio', valor_mercado: '', es_prioritario: false })
  const [guardandoRol, setGuardandoRol] = useState(false)
  const [mensajeRol, setMensajeRol] = useState('')
  const [catalogoEsp, setCatalogoEsp] = useState([])
  const [busquedaEsp, setBusquedaEsp] = useState('')
  const [vistaRol, setVistaRol] = useState('catalogo') // 'catalogo' | 'nueva'
  const [nuevaEspNombre, setNuevaEspNombre] = useState('')

  function getProyectoIdFromPath() {
    const parts = window.location.pathname.split('/').filter(Boolean)
    const proyectoIndex = parts.indexOf('proyectos')
    return proyectoIndex !== -1 ? parts[proyectoIndex + 1] : null
  }

  function normalizarTexto(text) {
    return (text || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
  }

  function esRolConstitucion(rol) {
    const texto = normalizarTexto(`${rol?.nombre || ''} ${rol?.sub_especialidad || ''}`)
    return /constituc/.test(texto)
  }

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)

      const pid = getProyectoIdFromPath()
      if (!pid || pid === 'undefined') {
        window.location.href = '/proyectos'
        return
      }
      const initialTab = new URLSearchParams(window.location.search).get('tab')
      if (initialTab && ['resumen','hitos','equipo','aportes','presupuesto','economia','roles','tareas','chat'].includes(initialTab)) {
        setTab(initialTab)
      }

      const [pRes, perfilRes, rolesRes, hitosRes, aportesRes, postRes] = await Promise.all([
        fetch('/api/proyectos/' + pid),
        fetch('/api/usuarios?id=' + user.id),
        fetch('/api/roles?proyecto_id=' + pid),
        fetch('/api/hitos?proyecto_id=' + pid),
        fetch('/api/aportes?proyecto_id=' + pid),
        fetch('/api/postulaciones?postulante_id=' + user.id + '&proyecto_id=' + pid)
      ])

      const pData = await pRes.json()
      const perfilData = await perfilRes.json()
      const rolesData = await rolesRes.json()
      const hitosData = await hitosRes.json()
      const aportesData = await aportesRes.json()
      const postData = await postRes.json()

      const proy = pData.proyecto
      const todosRoles = rolesData.roles || []
      const todasPost = postData.postulaciones || []

      // Verificar acceso: fundador o postulación aceptada en este proyecto
      const esFundador = proy?.fundador_id === user.id
      const miPostulacionAceptada = todasPost.find(p =>
        p.estado === 'aceptada' && p.roles?.proyecto_id === pid && todosRoles.some(r => r.id === p.rol_id)
      )
      setMiPostulacion(miPostulacionAceptada || null)

      // Cargar contrato del especialista si existe
      if (miPostulacionAceptada) {
        const contratoRes = await fetch('/api/contratos?profesional_id=' + user.id + '&proyecto_id=' + pid + '&postulacion_id=' + miPostulacionAceptada.id)
        const contratoData = await contratoRes.json()
        if (contratoData.contratos?.length > 0) setMiContrato(contratoData.contratos[0])
      }

      if (!esFundador && !miPostulacionAceptada) {
        setAcceso(false)
        setCargando(false)
        return
      }

      // Cargar postulaciones aceptadas de todos los roles para mostrar el equipo
      const postEquipo = []
      await Promise.all(todosRoles.map(async rol => {
        const r = await fetch('/api/postulaciones?rol_id=' + rol.id)
        const d = await r.json()
        if (d.postulaciones) {
          d.postulaciones.filter(p => p.estado === 'aceptada').forEach(p => {
            postEquipo.push({...p, rol_nombre: rol.nombre})
          })
        }
      }))

      setAcceso(true)
      setProyecto(proy)
      setPerfil(perfilData.usuario)
      setRoles(todosRoles)
      setHitos(hitosData.hitos || [])
      setAportes(aportesData.aportes || [])
      setPostulaciones(postEquipo)

      // Cargar deuda pendiente (solo tiene datos si el proyecto pasó por Riesgo Compartido)
      const deudaRes = await fetch('/api/deuda?proyecto_id=' + pid)
      const deudaData = await deudaRes.json()
      setDeuda({ pendiente: deudaData.pendiente || [], resuelta: deudaData.resuelta || [], total_pendiente: deudaData.total_pendiente || 0 })

      // Cargar catálogo de especialidades para el formulario de roles
      const espRes = await fetch('/api/especialidades?aprobado=true')
      const espData = await espRes.json()
      setCatalogoEsp(espData.especialidades || [])

      // Cargar badge tareas pendientes
      const tRes = await fetch('/api/tareas?proyecto_id=' + pid)
      const tData = await tRes.json()
      const misPendientes = (tData.tareas || []).filter(t => t.asignado_a === user.id && t.estado === 'pendiente')
      setBadgeTareas(misPendientes.length)

      setCargando(false)
    }
    cargar()
  }, [])

  // Suscripciones realtime
  useEffect(() => {
    if (!proyecto || !usuario) return
    const pid = proyecto.id

    const tareasChannel = supabase
      .channel('ws-tareas-' + pid)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tareas', filter: 'proyecto_id=eq.' + pid }, payload => {
        if (payload.new.asignado_a === usuario.id) setBadgeTareas(n => n + 1)
      })
      .subscribe()

    const mensajesChannel = supabase
      .channel('ws-mensajes-' + pid)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes', filter: 'proyecto_id=eq.' + pid }, payload => {
        if (payload.new.autor_id !== usuario.id) setBadgeChat(n => n + 1)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(tareasChannel)
      supabase.removeChannel(mensajesChannel)
    }
  }, [proyecto, usuario])

  async function completarHito(hito) {
    setActualizando(hito.id)
    const res = await fetch('/api/hitos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: hito.id, completado: !hito.completado })
    })
    const data = await res.json()
    if (!data.error) setHitos(h => h.map(x => x.id === hito.id ? data.hito : x))
    setActualizando(null)
  }

  async function resolverDeuda(deudaId, resuelta_como) {
    const res = await fetch('/api/deuda', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deudaId, resuelta_como, resuelta_por: usuario?.id })
    })
    const data = await res.json()
    if (!data.error) {
      setDeuda(prev => {
        const item = prev.pendiente.find(d => d.id === deudaId)
        return {
          pendiente: prev.pendiente.filter(d => d.id !== deudaId),
          resuelta: item ? [...prev.resuelta, { ...item, resuelta: true, resuelta_como }] : prev.resuelta,
          total_pendiente: prev.total_pendiente - Number(item?.valor || 0),
        }
      })
    }
  }

  async function crearHito() {
    if (!nuevoHito.trim()) return
    setCreandoHito(true)
    const pid = getProyectoIdFromPath()
    if (!pid || pid === 'undefined') { setCreandoHito(false); alert('ID de proyecto inválido'); return }
    const res = await fetch('/api/hitos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proyecto_id: pid, nombre: nuevoHito })
    })
    const data = await res.json()
    if (!data.error) { setHitos(h => [...h, data.hito]); setNuevoHito('') }
    setCreandoHito(false)
  }

  async function registrarAporte() {
    if (!nuevoAporte.descripcion || !nuevoAporte.valor) return
    setRegistrando(true)
    const pid = getProyectoIdFromPath()
    if (!pid || pid === 'undefined') { setRegistrando(false); alert('ID de proyecto inválido'); return }
    const res = await fetch('/api/aportes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proyecto_id: pid,
        aportante_id: usuario.id,
        tipo: nuevoAporte.tipo,
        descripcion: nuevoAporte.descripcion,
        valor: parseInt(nuevoAporte.valor),
        fecha: new Date().toISOString().split('T')[0]
      })
    })
    const data = await res.json()
    if (!data.error) {
      setAportes(a => [data.aporte, ...a])
      setNuevoAporte({ descripcion: '', valor: '', tipo: 'horas' })
    }
    setRegistrando(false)
  }

  async function eliminarRol(rolId) {
    if (!confirm('¿Eliminar este rol? Los especialistas que se hayan postulado ya no podrán ver la postulación.')) return
    const res = await fetch('/api/roles?id=' + rolId + '&fundador_id=' + usuario?.id, { method: 'DELETE' })
    const data = await res.json()
    if (data.ok) {
      setRoles(prev => prev.filter(r => r.id !== rolId))
    } else {
      alert('Error al eliminar: ' + (data.error || 'intenta de nuevo'))
    }
  }

  async function crearRolProyecto() {
    if (!rolForm.nombre.trim() || !proyecto?.id) {
      setMensajeRol('Completa el nombre del rol')
      return
    }
    setGuardandoRol(true)
    setMensajeRol('')

    // Si es una especialidad nueva, proponerla al catálogo
    const estaEnCatalogo = catalogoEsp.some(e => e.nombre.toLowerCase() === rolForm.nombre.toLowerCase())
    if (!estaEnCatalogo && usuario?.id) {
      await fetch('/api/especialidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: rolForm.nombre, categoria: 'General', propuesto_por: usuario.id })
      })
    }

    const res = await fetch('/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proyecto_id: proyecto.id,
        nombre: rolForm.nombre,
        sub_especialidad: rolForm.sub_especialidad || null,
        descripcion: rolForm.descripcion,
        tipo_aporte: rolForm.tipo_aporte,
        valor_mercado: Number(rolForm.valor_mercado) || 0,
        modalidad: proyecto?.estado_financiacion === 'con_recursos' ? 'equity' : 'deuda_diferida',
        es_prioritario: rolForm.es_prioritario,
        estado: 'abierto',
        fundador_id: usuario?.id,
      })
    })
    const data = await res.json()
    if (data.error) {
      setMensajeRol('Error: ' + data.error)
    } else {
      setRoles(prev => [...prev, data.rol])
      setMensajeRol('✓ Rol publicado correctamente')
      setRolForm({ nombre: '', sub_especialidad: '', descripcion: '', tipo_aporte: 'servicio', valor_mercado: '', es_prioritario: false })
      setBusquedaEsp('')
      setVistaRol('catalogo')
      setMostrarFormRol(false)
      setTimeout(() => setMensajeRol(''), 3500)
    }
    setGuardandoRol(false)
  }

  const esFundador = proyecto?.fundador_id === usuario?.id
  const misAportes = aportes.filter(a => a.aportante_id === usuario?.id)
  const totalMisAportes = misAportes.reduce((s, a) => s + (a.valor || 0), 0)
  const totalAportes = aportes.reduce((s, a) => s + (a.valor || 0), 0)
  const hitosCompletados = hitos.filter(h => h.completado).length
  const hitosPendientes = hitos.filter(h => !h.completado).length
  const miRol = miPostulacion ? roles.find(r => r.id === miPostulacion.rol_id) : null
  const equipo = postulaciones.filter(p => p.estado === 'aceptada' && roles.some(r => r.id === p.rol_id))
  const esMiRolConstitucion = esRolConstitucion(miRol)
  const mostrarPresupuesto = esFundador || !esMiRolConstitucion

  useEffect(() => {
    if (!mostrarPresupuesto && tab === 'presupuesto') {
      setTab('resumen')
    }
  }, [mostrarPresupuesto, tab])

  async function salirProyecto() {
    if (!miPostulacion) return
    if (!confirm('⚠️ ¿Confirmas que te retiras permanentemente de este proyecto?\n\nEsto cancelará tu contrato y perderás acceso al workspace. Esta acción no se puede deshacer.')) return
    const res = await fetch('/api/desistir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postulacion_id: miPostulacion.id, especialista_id: usuario?.id })
    })
    const data = await res.json()
    if (data.ok) {
      alert(data.mensaje || 'Te has retirado del proyecto.')
      window.location.href = '/proyectos'
    } else {
      alert(data.error || 'Error al salir del proyecto')
    }
  }

  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: '📊' },
    { id: 'hitos', label: 'Hitos', icon: '🎯', badge: hitosPendientes > 0 ? hitosPendientes : null },
    { id: 'equipo', label: 'Equipo', icon: '👥' },
    { id: 'aportes', label: 'Mis aportes', icon: '📋' },
    ...(mostrarPresupuesto ? [{ id: 'presupuesto', label: 'Presupuesto', icon: '💸' }] : []),
    { id: 'economia', label: 'Economía', icon: '💰' },
    { id: 'roles', label: 'Roles', icon: '🧩', badge: roles.filter(r => r.estado === 'abierto').length > 0 ? roles.filter(r => r.estado === 'abierto').length : null },
    { id: 'tareas', label: 'Tareas', icon: '✅', badge: badgeTareas > 0 ? badgeTareas : null },
    { id: 'chat', label: 'Chat', icon: '💬', badge: badgeChat > 0 ? badgeChat : null },
  ]

  function handleTabClick(id) {
    if (id === 'tareas' && proyecto?.id) {
      window.location.href = '/proyectos/' + proyecto.id + '/workspace/tareas'
      return
    }
    setTab(id)
  }

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando workspace...
    </div>
  )

  if (!acceso) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif',gap:'1rem',padding:'2rem'}}>
      <div style={{fontSize:'2rem'}}>🔒</div>
      <div style={{color:'#fff',fontWeight:'700',fontSize:'1.1rem'}}>Acceso restringido</div>
      <div style={{color:'#8FA3CC',fontSize:'0.85rem',textAlign:'center',maxWidth:'400px'}}>Este workspace es solo para miembros aceptados del proyecto. Postúlate primero y espera confirmación del fundador.</div>
      <a href="/proyectos" style={{background:'#1D9E75',color:'#fff',padding:'0.75rem 1.5rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.875rem',fontWeight:'700',marginTop:'0.5rem'}}>Ver proyectos →</a>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0B1628',fontFamily:'Inter,sans-serif'}}>
      {/* NAV */}
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <a href="/dashboard" style={{fontSize:'1rem',fontWeight:'900',color:'#fff',textDecoration:'none',letterSpacing:'-0.03em'}}>Esca<span style={{color:'#1D9E75'}}>la</span></a>
          <span style={{color:'rgba(255,255,255,0.2)'}}>·</span>
          <span style={{fontSize:'0.85rem',fontWeight:'600',color:'#fff'}}>{proyecto?.nombre}</span>
          {esFundador && <span style={{fontSize:'0.62rem',fontWeight:'700',padding:'2px 8px',borderRadius:'10px',background:'rgba(232,160,32,0.2)',color:'#E8A020'}}>Fundador</span>}
          {miRol && !esFundador && <span style={{fontSize:'0.62rem',fontWeight:'700',padding:'2px 8px',borderRadius:'10px',background:'rgba(29,158,117,0.2)',color:'#1D9E75'}}>{miRol.nombre}</span>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'1rem',flexWrap:'wrap'}}>
          <a href={proyecto?.id ? '/proyectos/'+proyecto.id+'/workspace/tareas' : '#'} style={{fontSize:'0.78rem',fontWeight:'700',color:'#E8A020',textDecoration:'none',background:'rgba(232,160,32,0.1)',padding:'0.3rem 0.875rem',borderRadius:'6px',border:'1px solid rgba(232,160,32,0.25)'}}>📋 Tareas</a>
          <a href={proyecto?.id ? '/proyectos/'+proyecto.id+'/workspace/chat' : '#'} style={{fontSize:'0.78rem',fontWeight:'700',color:'#1D9E75',textDecoration:'none',background:'rgba(29,158,117,0.1)',padding:'0.3rem 0.875rem',borderRadius:'6px',border:'1px solid rgba(29,158,117,0.25)'}}>💬 Chat</a>

          {esFundador && (
            <button onClick={() => setTab('roles')} style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',background:'#1D9E75',padding:'0.3rem 0.875rem',borderRadius:'6px',border:'none',cursor:'pointer'}}>🧩 Roles</button>
          )}
          <a href={'/proyectos/' + proyecto?.id} style={{color:'#8FA3CC',fontSize:'0.78rem',textDecoration:'none'}}>Ver proyecto</a>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.78rem',textDecoration:'none'}}>Dashboard</a>
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/registro?modo=login' }} style={{background:'rgba(216,90,48,0.1)',border:'1px solid rgba(216,90,48,0.25)',color:'#D85A30',fontSize:'0.75rem',fontWeight:'600',padding:'0.3rem 0.75rem',borderRadius:'6px',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Salir</button>
        </div>
      </nav>

      {/* TABS */}
      <div style={{background:'rgba(255,255,255,0.02)',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'0 1.5rem',display:'flex',gap:'0',overflowX:'auto'}}>
        {tabs.map(t => {
          const tabContent = (
            <>
              {t.icon} {t.label}
              {t.badge && <span style={{background:'#E8A020',color:'#fff',fontSize:'0.6rem',fontWeight:'700',padding:'1px 5px',borderRadius:'10px',minWidth:'16px',textAlign:'center'}}>{t.badge}</span>}
            </>
          )
          const baseStyle = {background:'none',border:'none',borderBottom: tab===t.id ? '2px solid #1D9E75' : '2px solid transparent',color: tab===t.id ? '#fff' : '#8FA3CC',padding:'0.875rem 1.25rem',fontSize:'0.82rem',fontWeight: tab===t.id ? '700' : '400',cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:'0.4rem',position:'relative',textDecoration:'none'}
          if (t.id === 'tareas' && proyecto?.id) {
            return (
              <a key={t.id} href={'/proyectos/' + proyecto.id + '/workspace/' + t.id} style={baseStyle}>
                {tabContent}
              </a>
            )
          }
          return (
            <button key={t.id} onClick={() => handleTabClick(t.id)} style={baseStyle}>
              {tabContent}
            </button>
          )
        })}
      </div>

      <main style={{maxWidth:'1000px',margin:'0 auto',padding:'2rem 1.25rem'}}>

        {/* TAB: RESUMEN */}
        {tab === 'resumen' && (
          <div>
            <div style={{marginBottom:'2rem'}}>
              <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.4rem'}}>Workspace del proyecto</div>
              <div style={{fontSize:'clamp(1.3rem,3vw,1.75rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em',marginBottom:'0.3rem'}}>{proyecto?.nombre}</div>
              <div style={{fontSize:'0.82rem',color:'#8FA3CC',display:'flex',alignItems:'center',gap:'0.5rem',flexWrap:'wrap'}}>
                {proyecto?.pais && <span style={{fontSize:'0.78rem',fontWeight:'700',color:'#AFA9EC',background:'rgba(175,169,236,0.1)',border:'1px solid rgba(175,169,236,0.2)',borderRadius:'20px',padding:'0.15rem 0.6rem'}}>
                  {proyecto.pais === 'Colombia' ? '🇨🇴' : proyecto.pais === 'México' ? '🇲🇽' : proyecto.pais === 'Argentina' ? '🇦🇷' : proyecto.pais === 'Perú' ? '🇵🇪' : proyecto.pais === 'Chile' ? '🇨🇱' : '🌎'} {proyecto.pais}
                </span>}
                <span>{proyecto?.sector} · {proyecto?.ciudad} · {proyecto?.estado}</span>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
              <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#1D9E75'}}>{hitosCompletados}</div>
                <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Hitos completados</div>
              </div>
              <div style={{background:'rgba(232,160,32,0.08)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#E8A020'}}>{hitosPendientes}</div>
                <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Hitos pendientes</div>
              </div>
              <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#fff'}}>{equipo.length + 1}</div>
                <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Miembros del equipo</div>
              </div>
              <div style={{background:'rgba(175,169,236,0.08)',border:'1px solid rgba(175,169,236,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#AFA9EC'}}>${totalAportes.toLocaleString()}</div>
                <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Total aportado</div>
              </div>
            </div>

            <div style={{display:'flex',gap:'1rem',flexWrap:'wrap',marginBottom:'2rem'}}>
              <div style={{flex:'1 1 320px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'14px',padding:'1.5rem',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontSize:'0.8rem',fontWeight:'700',color:'#fff',marginBottom:'0.5rem'}}>Roles del proyecto</div>
                  <div style={{fontSize:'1.6rem',fontWeight:'800',color:'#1D9E75',marginBottom:'0.5rem'}}>{roles.filter(r => r.estado === 'abierto').length}</div>
                  <div style={{fontSize:'0.85rem',color:'#8FA3CC',lineHeight:'1.6'}}>{roles.filter(r => r.estado === 'abierto').length > 0 ? 'Roles abiertos para que el equipo se postule.' : 'Aún no hay roles abiertos en este proyecto.'}</div>
                </div>
                <button onClick={() => setTab('roles')} style={{marginTop:'1rem',background:'#1D9E75',color:'#fff',border:'none',borderRadius:'10px',padding:'0.85rem 1.25rem',fontSize:'0.9rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Ver roles</button>
              </div>
              {esFundador && (
                <div style={{flex:'1 1 320px',background:'rgba(232,160,32,0.08)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'14px',padding:'1.5rem'}}>
                  <div style={{fontSize:'0.8rem',fontWeight:'700',color:'#fff',marginBottom:'0.5rem'}}>Publicar un nuevo rol</div>
                  <div style={{fontSize:'0.85rem',color:'#fff',lineHeight:'1.6',marginBottom:'1rem'}}>Agrega un rol que tu proyecto necesita y empieza a recibir postulaciones hoy.</div>
                  <button onClick={() => { setTab('roles'); setMostrarFormRol(true) }} style={{background:'#1D9E75',color:'#fff',border:'none',borderRadius:'10px',padding:'0.85rem 1.25rem',fontSize:'0.9rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Publicar rol</button>
                </div>
              )}
            </div>

            {hitos.length > 0 && (
              <div style={{marginBottom:'2rem'}}>
                <div style={{fontSize:'0.8rem',fontWeight:'700',color:'#fff',marginBottom:'1rem',paddingBottom:'0.5rem',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>Próximos hitos</div>
                {hitos.filter(h => !h.completado).slice(0,3).map(h => (
                  <div key={h.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.75rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <div style={{display:'flex',gap:'0.75rem',alignItems:'center'}}>
                      <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#E8A020',flexShrink:0}}></div>
                      <div style={{fontSize:'0.85rem',color:'#fff'}}>{h.nombre}</div>
                    </div>
                    <button onClick={() => completarHito(h)} disabled={actualizando===h.id} style={{fontSize:'0.72rem',color:'#1D9E75',background:'rgba(29,158,117,0.1)',border:'1px solid rgba(29,158,117,0.25)',borderRadius:'6px',padding:'0.3rem 0.75rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                      {actualizando===h.id ? '...' : '✓ Completar'}
                    </button>
                  </div>
                ))}
                <button onClick={() => setTab('hitos')} style={{marginTop:'0.75rem',background:'none',border:'none',color:'#1D9E75',fontSize:'0.78rem',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:'600'}}>Ver todos los hitos →</button>
              </div>
            )}

            <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem'}}>
              {!esFundador && (
              <div style={{background: miContrato ? 'rgba(175,169,236,0.06)' : 'rgba(255,255,255,0.03)', border:`1px solid ${miContrato?.estado==='vigente'?'rgba(29,158,117,0.3)':'rgba(175,169,236,0.2)'}`,borderRadius:'12px',padding:'1.25rem',marginBottom:'1rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
                  <div style={{fontSize:'0.82rem',fontWeight:'700',color:'#fff'}}>📄 Contrato de prestación de servicios</div>
                  {miContrato && <span style={{fontSize:'0.65rem',fontWeight:'700',padding:'3px 10px',borderRadius:'20px',background:miContrato.estado==='vigente'?'rgba(29,158,117,0.15)':miContrato.estado==='firmado_parcial'?'rgba(232,160,32,0.15)':'rgba(255,255,255,0.08)',color:miContrato.estado==='vigente'?'#1D9E75':miContrato.estado==='firmado_parcial'?'#E8A020':'#8FA3CC'}}>
                    {miContrato.estado==='vigente'?'✓ Vigente':miContrato.estado==='firmado_parcial'?'Firma parcial':'Pendiente de firma'}
                  </span>}
                </div>
                {miContrato ? (<>
                  <div style={{fontSize:'0.75rem',color:'#8FA3CC',marginBottom:'0.875rem',lineHeight:'1.5'}}>
                    <span style={{color:miContrato.firmado_fundador?'#1D9E75':'#8FA3CC'}}>{miContrato.firmado_fundador?'✓':'○'} Fundador firmó</span>
                    <span style={{margin:'0 0.75rem',color:'rgba(255,255,255,0.15)'}}>·</span>
                    <span style={{color:miContrato.firmado_profesional?'#1D9E75':'#8FA3CC'}}>{miContrato.firmado_profesional?'✓':'○'} Especialista firmó</span>
                  </div>
                  <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
                    {miContrato.contenido_json?.texto_pdf && (
                      <button onClick={() => {
                        const blob = new Blob([miContrato.contenido_json.texto_pdf], {type:'text/plain;charset=utf-8'})
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a'); a.href=url; a.download=`Contrato_${proyecto?.nombre}.txt`; a.click()
                        URL.revokeObjectURL(url)
                      }} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.15)',color:'#fff',borderRadius:'8px',padding:'0.5rem 1rem',fontSize:'0.78rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                        ⬇ Descargar contrato
                      </button>
                    )}
                    {!miContrato.firmado_profesional && (
                      <button onClick={async () => {
                        const res = await fetch('/api/contratos', {method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:miContrato.id,tipo:'profesional'})})
                        const data = await res.json()
                        if (data.contrato) setMiContrato(data.contrato)
                      }} style={{background:'#1D9E75',border:'none',color:'#fff',borderRadius:'8px',padding:'0.5rem 1rem',fontSize:'0.78rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                        ✓ Confirmar mi firma
                      </button>
                    )}
                  </div>
                  <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.75rem',lineHeight:'1.5'}}>Descarga el contrato, fírmalo físicamente y confirma tu firma aquí.</div>
                </>) : (
                  <div style={{fontSize:'0.78rem',color:'#8FA3CC',lineHeight:'1.6'}}>
                    El contrato se genera automáticamente cuando el fundador acepta tu postulación. Si ya fuiste aceptado y no aparece, contacta al fundador.
                  </div>
                )}
              </div>
              )}

              <div style={{fontSize:'0.8rem',fontWeight:'700',color:'#fff',marginBottom:'1rem'}}>Mi situación en este proyecto</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem'}}>
                <div>
                  <div style={{fontSize:'0.65rem',fontWeight:'700',color:'#8FA3CC',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.3rem'}}>Mi rol</div>
                  <div style={{fontSize:'0.875rem',color:'#fff',fontWeight:'600'}}>{esFundador ? 'Fundador' : miRol?.nombre || '—'}</div>
                </div>
                <div>
                  <div style={{fontSize:'0.65rem',fontWeight:'700',color:'#8FA3CC',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.3rem'}}>Mis aportes</div>
                  <div style={{fontSize:'0.875rem',color:'#1D9E75',fontWeight:'600'}}>${totalMisAportes.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{fontSize:'0.65rem',fontWeight:'700',color:'#8FA3CC',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.3rem'}}>Modalidad</div>
                  <div style={{fontSize:'0.875rem',color:'#fff',fontWeight:'600'}}>{
                    miRol?.modalidad === 'deuda_diferida' ? 'Riesgo Compartido' :
                    miRol?.modalidad === 'equity' ? 'Equity' :
                    miRol?.modalidad === 'convertible' ? 'Deuda convertible' :
                    miRol?.modalidad === 'success_fee' ? 'Success fee' :
                    miRol?.modalidad || 'Equity'
                  }</div>
                </div>
                <div>
                  <div style={{fontSize:'0.65rem',fontWeight:'700',color:'#8FA3CC',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.3rem'}}>Valor pactado</div>
                  <div style={{fontSize:'0.875rem',color:'#E8A020',fontWeight:'600'}}>{miRol?.valor_mercado ? '$'+miRol.valor_mercado.toLocaleString()+'/mes' : 'A negociar'}</div>
                </div>
              </div>
            </div>
            {miPostulacion && !esFundador && (
              <div style={{marginTop:'1rem',display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
                <button onClick={salirProyecto} style={{background:'rgba(216,90,48,0.08)',color:'#D85A30',border:'1px solid rgba(216,90,48,0.25)',borderRadius:'10px',padding:'0.9rem 1.1rem',fontSize:'0.9rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                  ⚠️ Retirarme del proyecto
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: HITOS */}
        {tab === 'hitos' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
              <div>
                <div style={{fontSize:'1rem',fontWeight:'700',color:'#fff'}}>Hitos del proyecto</div>
                <div style={{fontSize:'0.78rem',color:'#8FA3CC',marginTop:'0.2rem'}}>{hitosCompletados} completados · {hitosPendientes} pendientes</div>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',marginBottom:'2rem'}}>
              <div>
                <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#E8A020',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'0.875rem'}}>⏳ Pendientes</div>
                <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                  {hitos.filter(h=>!h.completado).map(h => (
                    <div key={h.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'1rem'}}>
                      <div style={{fontSize:'0.85rem',fontWeight:'600',color:'#fff',marginBottom:'0.5rem'}}>{h.nombre}</div>
                      {h.descripcion && <div style={{fontSize:'0.75rem',color:'#8FA3CC',marginBottom:'0.625rem',lineHeight:'1.5'}}>{h.descripcion}</div>}
                      <button onClick={() => completarHito(h)} disabled={actualizando===h.id} style={{fontSize:'0.72rem',color:'#1D9E75',background:'rgba(29,158,117,0.1)',border:'1px solid rgba(29,158,117,0.25)',borderRadius:'6px',padding:'0.35rem 0.875rem',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:'600'}}>
                        {actualizando===h.id ? '...' : '✓ Marcar completado'}
                      </button>
                    </div>
                  ))}
                  {hitos.filter(h=>!h.completado).length === 0 && (
                    <div style={{color:'#8FA3CC',fontSize:'0.82rem',textAlign:'center',padding:'1.5rem',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'10px'}}>Sin hitos pendientes 🎉</div>
                  )}
                </div>
              </div>
              <div>
                <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#1D9E75',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'0.875rem'}}>✓ Completados</div>
                <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                  {hitos.filter(h=>h.completado).map(h => (
                    <div key={h.id} style={{background:'rgba(29,158,117,0.05)',border:'1px solid rgba(29,158,117,0.15)',borderRadius:'10px',padding:'1rem'}}>
                      <div style={{fontSize:'0.85rem',fontWeight:'600',color:'#1D9E75',textDecoration:'line-through',marginBottom:'0.25rem'}}>{h.nombre}</div>
                      {h.fecha_completado && <div style={{fontSize:'0.7rem',color:'#6B7280'}}>✓ {new Date(h.fecha_completado).toLocaleDateString('es-CO')}</div>}
                      <button onClick={() => completarHito(h)} disabled={actualizando===h.id} style={{marginTop:'0.5rem',fontSize:'0.68rem',color:'#6B7280',background:'none',border:'none',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                        {actualizando===h.id ? '...' : 'Reabrir'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {esFundador && (
              <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem'}}>
                <div style={{fontSize:'0.8rem',fontWeight:'700',color:'#fff',marginBottom:'0.875rem'}}>+ Crear nuevo hito</div>
                <div style={{display:'flex',gap:'0.75rem'}}>
                  <input value={nuevoHito} onChange={e=>setNuevoHito(e.target.value)} onKeyDown={e=>e.key==='Enter'&&crearHito()} placeholder="Nombre del hito..." style={{flex:1,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',fontFamily:'Inter,sans-serif'}}/>
                  <button onClick={crearHito} disabled={creandoHito||!nuevoHito.trim()} style={{background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.65rem 1.25rem',fontSize:'0.82rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap'}}>
                    {creandoHito ? '...' : 'Crear'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: EQUIPO */}
        {tab === 'equipo' && (
          <div>
            <div style={{fontSize:'1rem',fontWeight:'700',color:'#fff',marginBottom:'1.5rem'}}>Equipo del proyecto</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'1rem'}}>
              <div style={{background:'rgba(232,160,32,0.06)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'12px',padding:'1.5rem'}}>
                <div style={{fontSize:'0.62rem',fontWeight:'700',color:'#E8A020',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'0.5rem'}}>Fundador</div>
                <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',marginBottom:'0.25rem'}}>{proyecto?.perfiles?.nombre || 'Fundador'}</div>
                <div style={{fontSize:'0.75rem',color:'#8FA3CC',marginBottom:'0.875rem'}}>{proyecto?.perfiles?.ciudad || ''} · {proyecto?.perfiles?.especialidad || ''}</div>
                {proyecto?.perfiles?.whatsapp && usuario?.id !== proyecto?.fundador_id && (
                  <a href={'https://wa.me/'+proyecto.perfiles.whatsapp.replace(/\D/g,'')} target="_blank" style={{fontSize:'0.75rem',color:'#1D9E75',textDecoration:'none',fontWeight:'600'}}>📲 WhatsApp</a>
                )}
              </div>
              {equipo.map(p => {
                const rol = roles.find(r => r.id === p.rol_id)
                return (
                  <div key={p.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem'}}>
                    <div style={{fontSize:'0.62rem',fontWeight:'700',color:'#1D9E75',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'0.5rem'}}>{rol?.nombre || 'Miembro'}</div>
                    <a href={'/perfil/'+p.postulante_id} style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',textDecoration:'none',display:'block',marginBottom:'0.25rem'}}>{p.perfiles?.nombre || 'Miembro'} →</a>
                    <div style={{fontSize:'0.75rem',color:'#8FA3CC',marginBottom:'0.875rem'}}>{p.perfiles?.ciudad || ''} · {p.perfiles?.especialidad || p.perfiles?.rol_principal || ''}</div>
                    {p.perfiles?.whatsapp && usuario?.id !== p.postulante_id && (
                      <a href={'https://wa.me/'+p.perfiles.whatsapp.replace(/\D/g,'')} target="_blank" style={{fontSize:'0.75rem',color:'#1D9E75',textDecoration:'none',fontWeight:'600'}}>📲 WhatsApp</a>
                    )}
                  </div>
                )
              })}
              {roles.filter(r => r.estado === 'abierto').length > 0 && (
                <a href={'/proyectos/'+proyecto?.id} style={{textDecoration:'none',background:'rgba(255,255,255,0.02)',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.5rem',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',minHeight:'130px'}}>
                  <div style={{fontSize:'1.5rem',marginBottom:'0.5rem'}}>+</div>
                  <div style={{fontSize:'0.78rem',color:'#8FA3CC',fontWeight:'600'}}>{roles.filter(r=>r.estado==='abierto').length} roles abiertos</div>
                  <div style={{fontSize:'0.72rem',color:'#1D9E75',marginTop:'0.25rem'}}>Ver y compartir</div>
                </a>
              )}
            </div>
          </div>
        )}

        {tab === 'roles' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem',flexWrap:'wrap',marginBottom:'1.25rem'}}>
              <div>
                <div style={{fontSize:'1rem',fontWeight:'700',color:'#fff'}}>Roles del proyecto</div>
                <div style={{fontSize:'0.78rem',color:'#8FA3CC',marginTop:'0.25rem'}}>Visualiza roles abiertos y crea nuevos puestos si eres fundador.</div>
              </div>
              {esFundador && (
                <button onClick={() => setMostrarFormRol(prev => !prev)} style={{background: mostrarFormRol ? 'transparent' : '#1D9E75', color: mostrarFormRol ? '#8FA3CC' : '#fff', border: mostrarFormRol ? '1px solid rgba(255,255,255,0.15)' : 'none', borderRadius:'8px', padding:'0.6rem 1.15rem', fontSize:'0.82rem', fontWeight:'700', cursor:'pointer', fontFamily:'Inter,sans-serif'}}>
                  {mostrarFormRol ? 'Cancelar' : '+ Publicar rol'}
                </button>
              )}
            </div>

            {mensajeRol && (
              <div style={{marginBottom:'1.25rem',background: mensajeRol.startsWith('✓') ? 'rgba(29,158,117,0.1)' : 'rgba(216,90,48,0.08)',border: mensajeRol.startsWith('✓') ? '1px solid rgba(29,158,117,0.25)' : '1px solid rgba(216,90,48,0.25)',borderRadius:'10px',padding:'0.95rem 1rem',color: mensajeRol.startsWith('✓') ? '#1D9E75' : '#D85A30',fontSize:'0.85rem'}}>{mensajeRol}</div>
            )}

            {esFundador && mostrarFormRol && (() => {
              const esAbogado = rolForm.nombre.toLowerCase().includes('abogado') || rolForm.nombre.toLowerCase().includes('legal')
              const esContador = rolForm.nombre.toLowerCase().includes('contador') || rolForm.nombre.toLowerCase().includes('contable')
              const subOpciones = esAbogado ? SUB_ESP_ABOGADO : esContador ? SUB_ESP_CONTADOR : []
              const subSeleccionada = subOpciones.find(s => s.value === rolForm.sub_especialidad)
              const espFiltradas = catalogoEsp.filter(e => !busquedaEsp || e.nombre.toLowerCase().includes(busquedaEsp.toLowerCase()))
              const rangeSugerido = (esAbogado || esContador) && rolForm.sub_especialidad === 'Constitución de empresas'
              return (
              <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.5rem',marginBottom:'1.5rem'}}>
                <div style={{fontSize:'0.88rem',fontWeight:'700',color:'#fff',marginBottom:'1.25rem'}}>Publicar especialidad / Rol</div>
                {vistaRol === 'catalogo' ? (
                  <div style={{marginBottom:'1rem'}}>
                    <label style={{display:'block',fontSize:'0.72rem',fontWeight:'700',color:'#8FA3CC',marginBottom:'0.5rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Especialidad / Rol *</label>
                    <input value={busquedaEsp} onChange={e => { setBusquedaEsp(e.target.value); setRolForm(r => ({...r, nombre: e.target.value})) }} placeholder="Buscar: Abogado, Contador, Diseñador..." style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',padding:'0.8rem 1rem',color:'#fff',fontSize:'0.9rem',outline:'none',fontFamily:'Inter,sans-serif',boxSizing:'border-box',marginBottom:'0.5rem'}} />
                    <div style={{maxHeight:'180px',overflowY:'auto',display:'flex',flexDirection:'column',gap:'3px',marginBottom:'0.5rem'}}>
                      {espFiltradas.map(e => (
                        <div key={e.id} onClick={() => { setRolForm(r => ({...r, nombre: e.nombre, tipo_aporte: e.tipo_aporte || 'servicio'})); setBusquedaEsp(e.nombre) }} style={{padding:'0.6rem 0.875rem',borderRadius:'8px',cursor:'pointer',fontSize:'0.85rem',background: rolForm.nombre === e.nombre ? 'rgba(29,158,117,0.12)' : 'rgba(255,255,255,0.03)',border: rolForm.nombre === e.nombre ? '1px solid rgba(29,158,117,0.3)' : '1px solid rgba(255,255,255,0.06)',color: rolForm.nombre === e.nombre ? '#1D9E75' : '#fff',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <span>{e.nombre} {rolForm.nombre === e.nombre ? '✓' : ''}</span>
                          {e.categoria && <span style={{fontSize:'0.65rem',color:'#8FA3CC'}}>{e.categoria}</span>}
                        </div>
                      ))}
                      {espFiltradas.length === 0 && busquedaEsp && (
                        <div style={{fontSize:'0.82rem',color:'#8FA3CC',padding:'0.5rem'}}>"{busquedaEsp}" no está en el catálogo. <button onClick={() => { setVistaRol('nueva'); setNuevaEspNombre(busquedaEsp) }} style={{background:'none',border:'none',color:'#1D9E75',cursor:'pointer',fontFamily:'Inter,sans-serif',fontSize:'0.82rem',textDecoration:'underline'}}>Crear nueva →</button></div>
                      )}
                    </div>
                    <button onClick={() => setVistaRol('nueva')} style={{background:'none',border:'none',color:'#8FA3CC',fontSize:'0.75rem',cursor:'pointer',fontFamily:'Inter,sans-serif',textDecoration:'underline'}}>+ No encuentro lo que busco — crear especialidad nueva</button>
                  </div>
                ) : (
                  <div style={{marginBottom:'1rem'}}>
                    <label style={{display:'block',fontSize:'0.72rem',fontWeight:'700',color:'#8FA3CC',marginBottom:'0.5rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Nombre de la nueva especialidad / Rol *</label>
                    <div style={{display:'flex',gap:'0.5rem',marginBottom:'0.5rem'}}>
                      <input value={rolForm.nombre} onChange={e => setRolForm(r => ({...r, nombre: e.target.value}))} placeholder="Ej: Experto en logística para clínica" style={{flex:1,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',padding:'0.8rem 1rem',color:'#fff',fontSize:'0.9rem',outline:'none',fontFamily:'Inter,sans-serif'}} />
                      <button onClick={() => setVistaRol('catalogo')} style={{background:'none',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0 0.875rem',color:'#8FA3CC',fontSize:'0.78rem',cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap'}}>← Volver</button>
                    </div>
                    <div style={{fontSize:'0.72rem',color:'#8FA3CC',lineHeight:'1.5'}}>El nombre se propone al catálogo de Escala para aprobación.</div>
                  </div>
                )}
                {(esAbogado || esContador) && subOpciones.length > 0 && (
                  <div style={{marginBottom:'1rem'}}>
                    <label style={{display:'block',fontSize:'0.72rem',fontWeight:'700',color:'#8FA3CC',marginBottom:'0.5rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>¿Qué servicio específico necesitas?</label>
                    <select value={rolForm.sub_especialidad} onChange={e => {
                      const val = e.target.value
                      const opcion = subOpciones.find(s => s.value === val)
                      setRolForm(r => ({ ...r, sub_especialidad: val, descripcion: opcion ? opcion.desc : r.descripcion }))
                    }} style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',padding:'0.8rem 1rem',color:'#fff',fontSize:'0.9rem',outline:'none',fontFamily:'Inter,sans-serif',marginBottom: subSeleccionada ? '0.75rem' : 0}}>
                      <option value="">Selecciona el servicio...</option>
                      {subOpciones.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    {subSeleccionada && (
                      <div style={{padding:'0.75rem',background:'rgba(29,158,117,0.06)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'8px',fontSize:'0.78rem',color:'#C8D4E8',lineHeight:'1.6'}}>
                        <strong style={{color:'#1D9E75'}}>¿Qué incluye?</strong> {subSeleccionada.desc}
                      </div>
                    )}
                  </div>
                )}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
                  <div>
                    <label style={{display:'block',fontSize:'0.72rem',fontWeight:'700',color:'#8FA3CC',marginBottom:'0.5rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>{rangeSugerido ? 'Valor COP (sugerido: $300K–$800K)' : 'Valor en COP (0 = a negociar)'}</label>
                    <input type="number" value={rolForm.valor_mercado} onChange={e => setRolForm(r => ({...r, valor_mercado: e.target.value}))} placeholder={rangeSugerido ? '300000 – 800000' : '0'} style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',padding:'0.8rem 1rem',color:'#fff',fontSize:'0.9rem',outline:'none',fontFamily:'Inter,sans-serif',boxSizing:'border-box'}} />
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:'0.72rem',fontWeight:'700',color:'#8FA3CC',marginBottom:'0.5rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Tipo de aporte</label>
                    <select value={rolForm.tipo_aporte} onChange={e => setRolForm(r => ({...r, tipo_aporte: e.target.value}))} style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',padding:'0.8rem 1rem',color:'#fff',fontSize:'0.9rem',outline:'none',fontFamily:'Inter,sans-serif'}}>
                      {TIPOS_APORTE.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{padding:'0.75rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'8px',fontSize:'0.78rem',color:'#8FA3CC',marginBottom:'1rem',lineHeight:'1.6'}}>
                  <strong style={{color:'#fff'}}>Modalidad:</strong> {proyecto?.estado_financiacion === 'con_recursos' ? 'Con Recursos — cobra en efectivo o acciones al completar.' : 'Riesgo Compartido — pago diferido en deuda o acciones. Riesgo real de $0 si el proyecto no genera valor.'}
                </div>
                <div style={{marginBottom:'1rem'}}>
                  <label style={{display:'block',fontSize:'0.72rem',fontWeight:'700',color:'#8FA3CC',marginBottom:'0.5rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Descripción adicional (opcional)</label>
                  <textarea value={rolForm.descripcion} onChange={e => setRolForm(r => ({...r, descripcion: e.target.value}))} placeholder="¿Hay algo específico de tu proyecto que el especialista deba saber?" rows={3} style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',padding:'0.8rem 1rem',color:'#fff',fontSize:'0.9rem',outline:'none',fontFamily:'Inter,sans-serif',resize:'vertical'}} />
                </div>
                <label style={{display:'flex',alignItems:'center',gap:'0.5rem',fontSize:'0.85rem',color:'#8FA3CC',marginBottom:'1.25rem',cursor:'pointer'}}>
                  <input type="checkbox" checked={rolForm.es_prioritario} onChange={e => setRolForm(r => ({...r, es_prioritario: e.target.checked}))} style={{width:'16px',height:'16px'}} />
                  Marcar como prioritario — aparece destacado en el proyecto
                </label>
                {mensajeRol && <div style={{fontSize:'0.82rem',color: mensajeRol.startsWith('✓')?'#1D9E75':'#D85A30',marginBottom:'0.875rem'}}>{mensajeRol}</div>}
                <div style={{display:'flex',gap:'0.75rem'}}>
                  <button onClick={() => { setMostrarFormRol(false); setRolForm({nombre:'',sub_especialidad:'',descripcion:'',tipo_aporte:'servicio',valor_mercado:'',es_prioritario:false}); setBusquedaEsp(''); setVistaRol('catalogo') }} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.15)',color:'#8FA3CC',borderRadius:'8px',padding:'0.65rem 1.25rem',fontSize:'0.85rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Cancelar</button>
                  <button onClick={crearRolProyecto} disabled={!rolForm.nombre.trim() || guardandoRol} style={{background: rolForm.nombre.trim()?'#1D9E75':'rgba(29,158,117,0.3)',color:'#fff',border:'none',borderRadius:'8px',padding:'0.65rem 1.5rem',fontSize:'0.85rem',fontWeight:'700',cursor: rolForm.nombre.trim()?'pointer':'default',fontFamily:'Inter,sans-serif'}}>
                    {guardandoRol ? 'Publicando...' : 'Publicar rol →'}
                  </button>
                </div>
              </div>
              )
            })()}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:'1rem'}}>
              {roles.length === 0 ? (
                <div style={{gridColumn:'1/-1',color:'#8FA3CC',textAlign:'center',padding:'2rem',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'12px'}}>{esFundador ? 'No hay roles publicados aún. Publica el primero para recibir postulaciones.' : 'No hay roles publicados aún. Espera a que el fundador publique roles.'}</div>
              ) : (
                roles.map(rol => (
                  <div key={rol.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'0.75rem',marginBottom:'0.5rem'}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:'0.88rem',fontWeight:'700',color:'#fff'}}>{rol.nombre}</div>
                        {rol.sub_especialidad && (
                          <div style={{fontSize:'0.72rem',color:'#1D9E75',fontWeight:'600',marginTop:'0.15rem'}}>{rol.sub_especialidad}</div>
                        )}
                        <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.25rem'}}>{rol.tipo_aporte ? rol.tipo_aporte.replace(/_/g,' ') : 'Aporte'} · {rol.modalidad ? rol.modalidad.replace(/_/g,' ') : 'Modalidad'}</div>
                      </div>
                      <div style={{display:'flex',gap:'0.5rem',alignItems:'center',flexShrink:0}}>
                        <span style={{fontSize:'0.7rem',fontWeight:'700',padding:'0.3rem 0.7rem',borderRadius:'999px',background: rol.estado === 'abierto' ? 'rgba(29,158,117,0.14)' : 'rgba(255,255,255,0.08)',color: rol.estado === 'abierto' ? '#1D9E75' : '#8FA3CC'}}>{rol.estado === 'abierto' ? 'Abierto' : 'Cerrado'}</span>
                        {esFundador && (
                          <button onClick={() => eliminarRol(rol.id)} title="Eliminar rol" style={{background:'rgba(216,90,48,0.1)',border:'1px solid rgba(216,90,48,0.25)',borderRadius:'6px',padding:'0.3rem 0.5rem',color:'#D85A30',fontSize:'0.75rem',cursor:'pointer',fontFamily:'Inter,sans-serif',lineHeight:1}}>✕</button>
                        )}
                      </div>
                    </div>
                    {rol.descripcion && <div style={{fontSize:'0.78rem',color:'#8FA3CC',lineHeight:'1.6',marginBottom:'0.75rem'}}>{rol.descripcion}</div>}
                    <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:'0.5rem'}}>
                      <div style={{fontSize:'0.72rem',color:'#fff'}}>{rol.valor_mercado ? '$'+Number(rol.valor_mercado).toLocaleString()+'/mes' : 'Valor a negociar'}</div>
                      {rol.es_prioritario && <div style={{fontSize:'0.72rem',color:'#E8A020',fontWeight:'700'}}>Prioritario</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB: MIS APORTES */}
        {tab === 'aportes' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
              <div>
                <div style={{fontSize:'1rem',fontWeight:'700',color:'#fff'}}>Mis aportes en {proyecto?.nombre}</div>
                <div style={{fontSize:'0.78rem',color:'#8FA3CC',marginTop:'0.2rem'}}>{misAportes.length} registros · ${totalMisAportes.toLocaleString()} total</div>
              </div>
            </div>

            <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem',marginBottom:'1.5rem'}}>
              <div style={{fontSize:'0.8rem',fontWeight:'700',color:'#fff',marginBottom:'0.875rem'}}>+ Registrar aporte</div>
              <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap',marginBottom:'0.75rem'}}>
                {['horas','entregable','capital','activo','contacto'].map(t => (
                  <button key={t} onClick={()=>setNuevoAporte(a=>({...a,tipo:t}))} style={{background:nuevoAporte.tipo===t?'rgba(29,158,117,0.2)':'rgba(255,255,255,0.06)',border:nuevoAporte.tipo===t?'1px solid rgba(29,158,117,0.4)':'1px solid rgba(255,255,255,0.1)',borderRadius:'6px',padding:'0.35rem 0.875rem',color:nuevoAporte.tipo===t?'#1D9E75':'#8FA3CC',fontSize:'0.75rem',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:'600'}}>
                    {t==='horas'?'⏱️ Horas':t==='entregable'?'📄 Entregable':t==='capital'?'💵 Capital':t==='activo'?'🏗️ Activo':'🤝 Contacto'}
                  </button>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:'0.75rem',marginBottom:'0.75rem'}}>
                <input value={nuevoAporte.descripcion} onChange={e=>setNuevoAporte(a=>({...a,descripcion:e.target.value}))} placeholder="¿Qué hiciste? Sé específico..." style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',fontFamily:'Inter,sans-serif'}}/>
                <input type="number" value={nuevoAporte.valor} onChange={e=>setNuevoAporte(a=>({...a,valor:e.target.value}))} placeholder="Valor $" style={{width:'120px',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',fontFamily:'Inter,sans-serif'}}/>
              </div>
              <button onClick={registrarAporte} disabled={registrando||!nuevoAporte.descripcion||!nuevoAporte.valor} style={{background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.65rem 1.5rem',fontSize:'0.82rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                {registrando ? 'Registrando...' : 'Registrar aporte'}
              </button>
            </div>

            {misAportes.length === 0 ? (
              <div style={{color:'#8FA3CC',textAlign:'center',padding:'2rem',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'12px'}}>Aún no tienes aportes registrados en este proyecto.</div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                {misAportes.map(a => (
                  <div key={a.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'1rem',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem',flexWrap:'wrap'}}>
                    <div>
                      <div style={{fontSize:'0.85rem',fontWeight:'600',color:'#fff',marginBottom:'0.15rem'}}>{a.descripcion}</div>
                      <div style={{fontSize:'0.7rem',color:'#8FA3CC'}}>{a.fecha} · {a.tipo} · {a.validado?'✅ Validado':'⏳ Pendiente validación'}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontFamily:'monospace',fontSize:'0.95rem',fontWeight:'700',color:'#1D9E75'}}>${a.valor?.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: ECONOMÍA */}
        {tab === 'economia' && (
          <div>
            <div style={{fontSize:'1rem',fontWeight:'700',color:'#fff',marginBottom:'1.5rem'}}>Economía del proyecto</div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
              <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.25rem',textAlign:'center'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#1D9E75'}}>${totalMisAportes.toLocaleString()}</div>
                <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Mi deuda diferida acumulada</div>
              </div>
              <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.25rem',textAlign:'center'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#fff'}}>${totalAportes.toLocaleString()}</div>
                <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Total aportado por el equipo</div>
              </div>
              <div style={{background:'rgba(175,169,236,0.08)',border:'1px solid rgba(175,169,236,0.2)',borderRadius:'12px',padding:'1.25rem',textAlign:'center'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#AFA9EC'}}>{totalAportes>0?Math.round((totalMisAportes/totalAportes)*100):0}%</div>
                <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Mi participación en aportes</div>
              </div>
              <div style={{background:'rgba(232,160,32,0.08)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'12px',padding:'1.25rem',textAlign:'center'}}>
                <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#E8A020'}}>{miRol?.valor_mercado?'$'+miRol.valor_mercado.toLocaleString():'—'}</div>
                <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'0.3rem'}}>Valor mensual pactado</div>
              </div>
            </div>

            <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem'}}>
              <div style={{fontSize:'0.8rem',fontWeight:'700',color:'#fff',marginBottom:'0.75rem'}}>Modelo de compensación</div>
              <div style={{fontSize:'0.78rem',color:'#8FA3CC',lineHeight:'1.6',marginBottom:'1rem'}}>
                No cumplió → no se paga nada. Cumplió → se paga según el estado del proyecto: <strong style={{color:'#fff'}}>{proyecto?.estado_financiacion === 'con_recursos' ? 'Con Recursos (cash o acciones)' : 'Riesgo Compartido (acciones o deuda como pasivo)'}</strong>.
              </div>
              <a href="/carril" style={{display:'inline-block',fontSize:'0.78rem',color:'#1D9E75',fontWeight:'600',textDecoration:'none'}}>Confirmar cumplimiento y forma de pago →</a>
            </div>

            {(deuda.pendiente.length > 0 || deuda.resuelta.length > 0) && (
              <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem',marginTop:'1rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
                  <div style={{fontSize:'0.8rem',fontWeight:'700',color:'#fff'}}>Deuda registrada</div>
                  <div style={{fontFamily:'monospace',fontSize:'0.85rem',fontWeight:'700',color:'#E8A020'}}>${deuda.total_pendiente.toLocaleString()} pendiente</div>
                </div>
                <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginBottom:'0.875rem'}}>Ordenada de menor a mayor — lo más básico primero, para resolver rápido cuando entre capital.</div>
                {deuda.pendiente.map(d => (
                  <div key={d.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'0.75rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'8px',padding:'0.75rem',marginBottom:'0.5rem'}}>
                    <div>
                      <div style={{fontSize:'0.78rem',color:'#fff',fontWeight:'600'}}>{d.concepto}</div>
                      <div style={{fontSize:'0.7rem',color:'#8FA3CC'}}>{d.perfiles?.nombre || 'Especialista'} · {d.forma_pago === 'acciones' ? 'convertible en acciones' : 'deuda como pasivo'} · ${Number(d.valor).toLocaleString()}</div>
                    </div>
                    <div style={{display:'flex',gap:'0.4rem',flexShrink:0}}>
                      <button onClick={() => resolverDeuda(d.id, 'cash')} style={{background:'rgba(29,158,117,0.15)',border:'1px solid rgba(29,158,117,0.4)',color:'#1D9E75',fontSize:'0.68rem',fontWeight:'700',padding:'0.4rem 0.6rem',borderRadius:'6px',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Pagar cash</button>
                      <button onClick={() => resolverDeuda(d.id, 'acciones')} style={{background:'rgba(83,74,183,0.15)',border:'1px solid rgba(83,74,183,0.4)',color:'#534AB7',fontSize:'0.68rem',fontWeight:'700',padding:'0.4rem 0.6rem',borderRadius:'6px',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Formalizar acciones</button>
                    </div>
                  </div>
                ))}
                {deuda.resuelta.length > 0 && (
                  <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.75rem'}}>{deuda.resuelta.length} deuda(s) ya resuelta(s)</div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'tareas' && (
          <div style={{textAlign:'center',padding:'3rem'}}>
            <div style={{fontSize:'2rem',marginBottom:'1rem'}}>✅</div>
            <div style={{fontSize:'1rem',fontWeight:'700',color:'#fff',marginBottom:'0.5rem'}}>Plan de trabajo del proyecto</div>
            <div style={{fontSize:'0.85rem',color:'#8FA3CC',marginBottom:'1.5rem'}}>Tareas asignadas por rol con seguimiento de avance y verificación del fundador.</div>
            <a href={'/proyectos/'+proyecto?.id+'/workspace/tareas'} style={{background:'#1D9E75',color:'#fff',padding:'0.875rem 2rem',borderRadius:'10px',textDecoration:'none',fontSize:'0.95rem',fontWeight:'700',display:'inline-block'}}>
              Ver plan de trabajo completo →
            </a>
          </div>
        )}

        {tab === 'chat' && (
          <div style={{textAlign:'center',padding:'3rem'}}>
            <div style={{fontSize:'2rem',marginBottom:'1rem'}}>💬</div>
            <div style={{fontSize:'1rem',fontWeight:'700',color:'#fff',marginBottom:'0.5rem'}}>Chat del equipo</div>
            <div style={{fontSize:'0.85rem',color:'#8FA3CC',marginBottom:'1.5rem'}}>Comunicación en tiempo real con todos los miembros del proyecto.</div>
            <a href={window?.location?.pathname?.replace('/workspace','/workspace/chat')} onClick={()=>setBadgeChat(0)} style={{background:'#1D9E75',color:'#fff',padding:'0.875rem 2rem',borderRadius:'10px',textDecoration:'none',fontSize:'0.95rem',fontWeight:'700',display:'inline-block'}}>
              Abrir chat →
            </a>
          </div>
        )}

        {tab === 'presupuesto' && (
          <PresupuestoTab proyectoId={proyecto?.id} esFundador={proyecto?.fundador_id === usuario?.id} usuarioId={usuario?.id} />
        )}

      </main>
    </div>
  )
}

// ── Componente Presupuesto ────────────────────────────────────────────────────
function PresupuestoTab({ proyectoId, esFundador, usuarioId }) {
  const [costos, setCostos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [form, setForm] = useState({ nombre:'', descripcion:'', categoria:'infraestructura', valor:'', periodicidad:'unico' })

  const CATEGORIAS = [
    { id:'infraestructura', label:'🖥️ Infraestructura', desc:'Dominio, hosting, servidores, SaaS' },
    { id:'legal', label:'⚖️ Legal', desc:'Notaría, registro, abogado, DIAN' },
    { id:'diseno', label:'🎨 Diseño', desc:'Logo, identidad visual, UI/UX' },
    { id:'marketing', label:'📣 Marketing', desc:'Pauta, campaña, fotografía' },
    { id:'operativo', label:'⚙️ Operativo', desc:'Gastos operativos generales' },
    { id:'servicio', label:'🤝 Servicio externo', desc:'Freelance, proveedor, consultoría' },
  ]

  const PERIODICIDAD = [
    { id:'unico', label:'Pago único' },
    { id:'mensual', label:'Mensual' },
    { id:'anual', label:'Anual' },
  ]

  useEffect(() => {
    cargarCostos()
  }, [proyectoId])

  async function cargarCostos() {
    setCargando(true)
    const res = await fetch('/api/costos?proyecto_id=' + proyectoId)
    const data = await res.json()
    setCostos(data.costos || [])
    setCargando(false)
  }

  async function crearCosto() {
    if (!form.nombre || !form.valor) { setMensaje('Completa nombre y valor'); return }
    setGuardando(true)
    const res = await fetch('/api/costos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, proyecto_id: proyectoId, creado_por: usuarioId })
    })
    const data = await res.json()
    if (data.error) { setMensaje('Error: ' + data.error); setGuardando(false); return }
    setCostos(prev => [data.costo, ...prev])
    setForm({ nombre:'', descripcion:'', categoria:'infraestructura', valor:'', periodicidad:'unico' })
    setMostrarForm(false)
    setMensaje('✓ Costo registrado')
    setTimeout(() => setMensaje(''), 3000)
    setGuardando(false)
  }

  async function financiarCosto(costoId) {
    const costo = costos.find(c => c.id === costoId)
    if (!costo) return

    let aporteId = null

    // Solo crear aporte si el valor es mayor a 0
    if (costo.valor > 0) {
      const aporteRes = await fetch('/api/aportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proyecto_id: proyectoId,
          aportante_id: usuarioId,
          tipo: 'capital',
          descripcion: costo.nombre + ' — financiado como Ángel de Impulso',
          valor: costo.valor,
          fecha: new Date().toISOString().split('T')[0]
        })
      })
      const aporteData = await aporteRes.json()
      if (aporteData.error) { setMensaje('Error al registrar aporte: ' + aporteData.error); return }
      aporteId = aporteData.aporte?.id
    }

    // Marcar el costo como cubierto (con o sin aporte asociado)
    const costoRes = await fetch('/api/costos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: costoId, estado: 'cubierto', cubierto_por: usuarioId, aporte_id: aporteId })
    })
    const costoData = await costoRes.json()
    if (costoData.error) { setMensaje('Error: ' + costoData.error); return }

    setCostos(prev => prev.map(c => c.id === costoId ? costoData.costo : c))
    setMensaje(costo.valor > 0 ? '✓ Costo financiado y aporte registrado' : '✓ Costo marcado como cubierto')
    setTimeout(() => setMensaje(''), 3000)
  }

  async function eliminarCosto(costoId) {
    if (!confirm('¿Eliminar este costo?')) return
    await fetch('/api/costos?id=' + costoId, { method: 'DELETE' })
    setCostos(prev => prev.filter(c => c.id !== costoId))
  }

  const pendientes = costos.filter(c => c.estado === 'pendiente')
  const cubiertos = costos.filter(c => c.estado === 'cubierto')
  const totalPendiente = pendientes.reduce((s, c) => s + (c.valor || 0), 0)
  const totalCubierto = cubiertos.reduce((s, c) => s + (c.valor || 0), 0)
  const totalGeneral = totalPendiente + totalCubierto
  const pctCubierto = totalGeneral > 0 ? Math.round((totalCubierto / totalGeneral) * 100) : 0

  const categoriaLabel = Object.fromEntries(CATEGORIAS.map(c => [c.id, c.label]))

  if (cargando) return <div style={{color:'#8FA3CC',padding:'2rem',textAlign:'center'}}>Cargando presupuesto...</div>

  return (
    <div>
      {/* Resumen financiero */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'0.875rem',marginBottom:'1.75rem'}}>
        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
          <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#fff'}}>${totalGeneral.toLocaleString()}</div>
          <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Presupuesto total</div>
        </div>
        <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
          <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#1D9E75'}}>${totalCubierto.toLocaleString()}</div>
          <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Cubierto</div>
        </div>
        <div style={{background:'rgba(232,160,32,0.08)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
          <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#E8A020'}}>${totalPendiente.toLocaleString()}</div>
          <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Pendiente de financiación</div>
        </div>
        <div style={{background:'rgba(175,169,236,0.08)',border:'1px solid rgba(175,169,236,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
          <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#AFA9EC'}}>{pctCubierto}%</div>
          <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Avance del presupuesto</div>
        </div>
      </div>

      {/* Barra de progreso */}
      {totalGeneral > 0 && (
        <div style={{background:'rgba(255,255,255,0.06)',borderRadius:'4px',height:'6px',marginBottom:'1.75rem',overflow:'hidden'}}>
          <div style={{width:pctCubierto+'%',height:'100%',background:'#1D9E75',borderRadius:'4px',transition:'width 0.5s ease'}}/>
        </div>
      )}

      {/* Mensaje */}
      {mensaje && (
        <div style={{background: mensaje.startsWith('✓') ? 'rgba(29,158,117,0.1)' : 'rgba(216,90,48,0.1)', border:'1px solid', borderColor: mensaje.startsWith('✓') ? 'rgba(29,158,117,0.3)' : 'rgba(216,90,48,0.3)', borderRadius:'8px', padding:'0.75rem', color: mensaje.startsWith('✓') ? '#1D9E75' : '#D85A30', fontSize:'0.82rem', marginBottom:'1rem'}}>
          {mensaje}
        </div>
      )}

      {/* Botón agregar (solo fundador) */}
      {esFundador && (
        <div style={{marginBottom:'1.25rem'}}>
          <button onClick={() => setMostrarForm(!mostrarForm)} style={{background: mostrarForm ? 'transparent' : '#E8A020', color: mostrarForm ? '#8FA3CC' : '#fff', border: mostrarForm ? '1px solid rgba(255,255,255,0.1)' : 'none', borderRadius:'8px', padding:'0.6rem 1.25rem', fontSize:'0.82rem', fontWeight:'700', cursor:'pointer', fontFamily:'Inter,sans-serif'}}>
            {mostrarForm ? 'Cancelar' : '+ Agregar costo al presupuesto'}
          </button>
        </div>
      )}

      {/* Formulario para agregar costo */}
      {mostrarForm && esFundador && (
        <div style={{background:'rgba(232,160,32,0.06)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'12px',padding:'1.5rem',marginBottom:'1.75rem'}}>
          <div style={{fontSize:'0.82rem',fontWeight:'700',color:'#fff',marginBottom:'1.25rem'}}>Nuevo costo al presupuesto</div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
            <div>
              <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginBottom:'0.3rem',fontWeight:'600'}}>NOMBRE DEL COSTO *</div>
              <input value={form.nombre} onChange={e=>setForm(f=>({...f,nombre:e.target.value}))} placeholder="Ej: Dominio escala.app" style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 0.875rem',color:'#fff',fontSize:'0.85rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif'}}/>
            </div>
            <div>
              <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginBottom:'0.3rem',fontWeight:'600'}}>VALOR EN COP *</div>
              <input value={form.valor} onChange={e=>setForm(f=>({...f,valor:e.target.value}))} placeholder="120000" type="number" style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 0.875rem',color:'#fff',fontSize:'0.85rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif'}}/>
            </div>
          </div>

          <div style={{marginBottom:'1rem'}}>
            <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginBottom:'0.3rem',fontWeight:'600'}}>DESCRIPCIÓN (opcional)</div>
            <input value={form.descripcion} onChange={e=>setForm(f=>({...f,descripcion:e.target.value}))} placeholder="Ej: Registro anual del dominio en Namecheap" style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 0.875rem',color:'#fff',fontSize:'0.85rem',outline:'none',boxSizing:'border-box',fontFamily:'Inter,sans-serif'}}/>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.25rem'}}>
            <div>
              <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginBottom:'0.5rem',fontWeight:'600'}}>CATEGORÍA</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'0.4rem'}}>
                {CATEGORIAS.map(cat => (
                  <button key={cat.id} onClick={()=>setForm(f=>({...f,categoria:cat.id}))} style={{background: form.categoria===cat.id ? 'rgba(232,160,32,0.2)' : 'rgba(255,255,255,0.04)', border: form.categoria===cat.id ? '1px solid rgba(232,160,32,0.5)' : '1px solid rgba(255,255,255,0.1)', borderRadius:'6px', padding:'0.35rem 0.65rem', fontSize:'0.72rem', color: form.categoria===cat.id ? '#E8A020' : '#8FA3CC', cursor:'pointer', fontFamily:'Inter,sans-serif'}}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginBottom:'0.5rem',fontWeight:'600'}}>PERIODICIDAD</div>
              <div style={{display:'flex',gap:'0.4rem'}}>
                {PERIODICIDAD.map(p => (
                  <button key={p.id} onClick={()=>setForm(f=>({...f,periodicidad:p.id}))} style={{background: form.periodicidad===p.id ? 'rgba(175,169,236,0.15)' : 'rgba(255,255,255,0.04)', border: form.periodicidad===p.id ? '1px solid rgba(175,169,236,0.4)' : '1px solid rgba(255,255,255,0.1)', borderRadius:'6px', padding:'0.35rem 0.65rem', fontSize:'0.72rem', color: form.periodicidad===p.id ? '#AFA9EC' : '#8FA3CC', cursor:'pointer', fontFamily:'Inter,sans-serif'}}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={crearCosto} disabled={guardando} style={{background:guardando?'#0F6E56':'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.75rem 1.75rem',fontSize:'0.85rem',fontWeight:'700',cursor:guardando?'not-allowed':'pointer',fontFamily:'Inter,sans-serif'}}>
            {guardando ? 'Guardando...' : 'Agregar al presupuesto'}
          </button>
        </div>
      )}

      {/* Lista de costos pendientes — agrupados por categoría */}
      {pendientes.length > 0 && (
        <div style={{marginBottom:'1.75rem'}}>
          <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'0.875rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
            <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#E8A020',display:'inline-block'}}></span>
            Pendientes de financiación
            <span style={{fontSize:'0.68rem',background:'rgba(232,160,32,0.15)',color:'#E8A020',padding:'0.1rem 0.45rem',borderRadius:'10px'}}>{pendientes.length}</span>
          </div>
          {(() => {
            const GRUPOS = [
              { id:'legal',          label:'⚖️ Legal y constitución',    color:'#AFA9EC' },
              { id:'contable',       label:'📊 Contabilidad y tributario', color:'#1D9E75' },
              { id:'infraestructura',label:'🖥️ Infraestructura digital',  color:'#5A9FE8' },
              { id:'diseno',         label:'🎨 Diseño e identidad',        color:'#E8A020' },
              { id:'marketing',      label:'📣 Marketing y comunicación',  color:'#D85A30' },
              { id:'operativo',      label:'⚙️ Operativo',                color:'#8FA3CC' },
              { id:'servicio',       label:'🤝 Servicios externos',        color:'#C8D4E8' },
            ]
            // Mapear categorías de la BD a grupos
            const mapCategoria = c => {
              if (c === 'legal') return 'legal'
              if (c === 'contable' || c === 'operativo') return 'contable'
              if (c === 'infraestructura') return 'infraestructura'
              if (c === 'diseno') return 'diseno'
              if (c === 'marketing') return 'marketing'
              if (c === 'servicio') return 'servicio'
              return 'operativo'
            }
            return GRUPOS.map(grupo => {
              const ORDEN_LEGAL = ['Registro DIAN / RUT','Apertura cuenta bancaria empresarial','Registro Cámara de Comercio','Constitución SAS ante notaría','Certificado de existencia y representación','Estatutos y pacto de socios','Términos y condiciones + Política de privacidad','Contratos tipo para especialistas','Registro de marca en SIC']
              const ORDEN_CONTABLE = ['Configuración tributaria DIAN','Facturación electrónica DIAN','Contabilidad mensual']
              const ORDEN_INFRA = ['Dominio web','Hosting / servidor web','Correo corporativo','Certificado SSL']
              const ORDEN_DISENO = ['Diseño de logo e identidad visual']
              const ORDEN_MARKETING = ['Fotografía institucional','Primera campaña digital']
              const ORDENES = { legal: ORDEN_LEGAL, contable: ORDEN_CONTABLE, infraestructura: ORDEN_INFRA, diseno: ORDEN_DISENO, marketing: ORDEN_MARKETING }
              const ordenar = (items, gid) => {
                const orden = ORDENES[gid]
                if (!orden) return items
                return [...items].sort((a,b) => {
                  const ia = orden.indexOf(a.nombre)
                  const ib = orden.indexOf(b.nombre)
                  if (ia === -1 && ib === -1) return 0
                  if (ia === -1) return 1
                  if (ib === -1) return -1
                  return ia - ib
                })
              }
              const itemsRaw = pendientes.filter(c => mapCategoria(c.categoria) === grupo.id)
              const items = ordenar(itemsRaw, grupo.id)
              if (items.length === 0) return null
              return (
                <div key={grupo.id} style={{marginBottom:'1.75rem'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.75rem',paddingBottom:'0.5rem',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                    <div style={{width:'3px',height:'18px',borderRadius:'2px',background:grupo.color,flexShrink:0}}/>
                    <div style={{fontSize:'0.8rem',fontWeight:'800',color:grupo.color,letterSpacing:'0.06em',textTransform:'uppercase'}}>{grupo.label}</div>
                    <div style={{fontSize:'0.68rem',color:'#8FA3CC',background:'rgba(255,255,255,0.05)',padding:'0.1rem 0.45rem',borderRadius:'10px'}}>{items.length}</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                    {items.map(c => (
                      <div key={c.id} style={{background:'rgba(232,160,32,0.05)',border:'1px solid rgba(232,160,32,0.15)',borderRadius:'10px',padding:'0.875rem 1.1rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'0.875rem'}}>
                        <div style={{flex:1}}>
                          <div style={{display:'flex',alignItems:'center',gap:'0.4rem',marginBottom:'0.2rem'}}>
                            <div style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff'}}>{c.nombre}</div>
                            {c.periodicidad !== 'unico' && <span style={{fontSize:'0.6rem',color:'#8FA3CC',background:'rgba(255,255,255,0.06)',padding:'0.1rem 0.4rem',borderRadius:'8px'}}>{c.periodicidad}</span>}
                          </div>
                          {c.descripcion && <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>{c.descripcion}</div>}
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:'0.75rem',flexShrink:0}}>
                          <div style={{fontFamily:'monospace',fontSize:'1rem',fontWeight:'700',color:'#E8A020'}}>${c.valor.toLocaleString()}</div>
                          <button onClick={() => financiarCosto(c.id)} style={{background:'rgba(175,169,236,0.15)',color:'#AFA9EC',border:'1px solid rgba(175,169,236,0.3)',borderRadius:'8px',padding:'0.4rem 0.875rem',fontSize:'0.75rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap'}}>
                            🌟 Financiar
                          </button>
                          {esFundador && (
                            <button onClick={() => eliminarCosto(c.id)} style={{background:'none',border:'none',color:'#D85A30',cursor:'pointer',fontSize:'0.82rem',padding:'0.2rem'}}>✕</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          })()}
        </div>
      )}

      {/* Costos cubiertos */}
      {cubiertos.length > 0 && (
        <div>
          <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#fff',marginBottom:'0.875rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
            <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#1D9E75',display:'inline-block'}}></span>
            Cubiertos
            <span style={{fontSize:'0.68rem',background:'rgba(29,158,117,0.15)',color:'#1D9E75',padding:'0.1rem 0.45rem',borderRadius:'10px'}}>{cubiertos.length}</span>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
            {cubiertos.map(c => (
              <div key={c.id} style={{background:'rgba(29,158,117,0.05)',border:'1px solid rgba(29,158,117,0.15)',borderRadius:'10px',padding:'0.875rem 1.1rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'0.5rem'}}>
                <div>
                  <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#fff',marginBottom:'0.15rem'}}>✅ {c.nombre}</div>
                  <div style={{fontSize:'0.72rem',color:'#1D9E75'}}>Financiado por {c.cubierto_perfil?.nombre || 'un miembro del equipo'}</div>
                </div>
                <div style={{fontFamily:'monospace',fontSize:'1rem',fontWeight:'700',color:'#1D9E75'}}>${c.valor.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {costos.length === 0 && (
        <div style={{textAlign:'center',padding:'3rem',background:'rgba(255,255,255,0.02)',border:'1px dashed rgba(255,255,255,0.08)',borderRadius:'12px'}}>
          <div style={{fontSize:'2rem',marginBottom:'0.75rem'}}>💸</div>
          <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',marginBottom:'0.4rem'}}>Presupuesto del proyecto</div>
          <div style={{fontSize:'0.82rem',color:'#8FA3CC',marginBottom:esFundador?'1.25rem':0}}>
            {esFundador ? 'Define los costos que necesita este proyecto para que el equipo, ángeles e inversionistas puedan verlos y financiarlos.' : 'El fundador aún no ha definido el presupuesto de este proyecto.'}
          </div>
          {esFundador && (
            <div style={{display:'flex',gap:'0.75rem',justifyContent:'center',flexWrap:'wrap'}}>
              <BtnCargarPredefinidos proyectoId={proyectoId} usuarioId={usuarioId} onCargado={cargarCostos} />
              <button onClick={() => setMostrarForm(true)} style={{background:'transparent',color:'#8FA3CC',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.7rem 1.5rem',fontSize:'0.85rem',fontWeight:'600',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                + Agregar costo manualmente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Botón para cargar costos predefinidos del país ────────────────────────────
function BtnCargarPredefinidos({ proyectoId, usuarioId, onCargado }) {
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [pais, setPais] = useState('')

  useEffect(() => {
    // Obtener el país del proyecto
    fetch('/api/proyectos/' + proyectoId)
      .then(r => r.json())
      .then(d => { if (d.proyecto?.pais) setPais(d.proyecto.pais) })
  }, [proyectoId])

  async function cargar() {
    if (!pais) { setMensaje('Este proyecto no tiene país asignado'); return }
    setCargando(true)
    const res = await fetch('/api/costos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inicializar_pais: true, proyecto_id: proyectoId, pais, creado_por: usuarioId })
    })
    const data = await res.json()
    if (data.error) { setMensaje('Error: ' + data.error) }
    else if (data.cargados === 0) { setMensaje(data.mensaje || 'Ya estaban cargados') }
    else { setMensaje('✓ ' + data.cargados + ' costos de ' + pais + ' cargados'); onCargado() }
    setCargando(false)
    setTimeout(() => setMensaje(''), 4000)
  }

  return (
    <div>
      <button onClick={cargar} disabled={cargando || !pais} style={{background: pais ? '#E8A020' : 'rgba(255,255,255,0.1)', color:'#fff', border:'none', borderRadius:'8px', padding:'0.7rem 1.5rem', fontSize:'0.85rem', fontWeight:'700', cursor: pais ? 'pointer' : 'not-allowed', fontFamily:'Inter,sans-serif'}}>
        {cargando ? 'Cargando...' : pais ? ('🇨🇴 Cargar costos predefinidos de ' + pais) : 'Sin país asignado'}
      </button>
      {mensaje && <div style={{fontSize:'0.75rem',color: mensaje.startsWith('✓') ? '#1D9E75' : '#E8A020',marginTop:'0.4rem'}}>{mensaje}</div>}
    </div>
  )
}
