'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'

function descargarContratoPDF(texto, nombreArchivo) {
  if (typeof window === 'undefined') return
  const previo = document.getElementById('escala-pdf-frame')
  if (previo) previo.remove()
  const prevBar = document.getElementById('escala-pdf-bar')
  if (prevBar) prevBar.remove()

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${nombreArchivo}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;font-size:10pt;color:#1a1a2e}.header{background:#0B1628;color:white;padding:14px 32px;display:flex;align-items:center;gap:6px}.logo-e{color:#1D9E75;font-size:16pt;font-weight:bold;font-family:Arial}.logo-la{color:white;font-size:16pt;font-weight:bold;font-family:Arial}.logo-sub{color:#8FA3CC;font-size:7.5pt;margin-left:10px;font-family:Arial}.content{padding:24px 40px 60px}p{margin-bottom:5pt;line-height:1.65}.titulo{font-size:9.5pt;font-weight:bold;color:#1D9E75;margin-top:14pt;margin-bottom:3pt;font-family:Arial}.footer-p{position:fixed;bottom:0;left:0;right:0;background:#f0f0f0;padding:5px 32px;font-size:7pt;color:#888;font-family:Arial;display:flex;justify-content:space-between;border-top:1px solid #ddd}@page{margin:0}</style></head><body><div class="header"><span class="logo-e">Esca</span><span class="logo-la">la</span><span class="logo-sub">escala.network — Contrato de Prestacion de Servicios</span></div><div class="content">${texto.split('\n').map(l=>{const t=l.trim();if(!t)return '<br>';const es=/^(CLAUSULA|ANEXO|PARTES|FIRMAS|PROYECTO|AVISO|CONTRATO DE)/.test(t)||(t.length>3&&t===t.toUpperCase()&&/[A-Z]{3}/.test(t));return es?`<p class="titulo">${t}</p>`:`<p>${l.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>`}).join('')}</div><div class="footer-p"><span>Escala actua unicamente como intermediario tecnologico y no es parte de este contrato.</span><span>${nombreArchivo}</span></div></body></html>`

  const iframe = document.createElement('iframe')
  iframe.id = 'escala-pdf-frame'
  iframe.style.cssText = 'position:fixed;top:50px;left:0;width:100%;height:calc(100% - 50px);border:none;z-index:99999;background:white;'
  document.body.appendChild(iframe)
  const doc = iframe.contentDocument || iframe.contentWindow.document
  doc.open(); doc.write(html); doc.close()

  const bar = document.createElement('div')
  bar.id = 'escala-pdf-bar'
  bar.style.cssText = 'position:fixed;top:0;left:0;right:0;height:50px;z-index:100000;background:#0B1628;padding:0 24px;display:flex;gap:12px;align-items:center;'
  bar.innerHTML = '<span style="color:#1D9E75;font-weight:700;font-family:Arial;font-size:14px;">Esca<span style="color:white">la</span></span><span style="color:#8FA3CC;font-size:12px;font-family:Arial;flex:1;">Selecciona Guardar como PDF al imprimir</span><button onclick="document.getElementById(\'escala-pdf-frame\').contentWindow.print()" style="background:#1D9E75;color:white;border:none;padding:8px 20px;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;font-family:Arial;">Guardar PDF</button><button id="cerrar-pdf-btn" style="background:rgba(255,255,255,0.1);color:#8FA3CC;border:1px solid rgba(255,255,255,0.2);padding:8px 16px;border-radius:6px;font-size:13px;cursor:pointer;font-family:Arial;">Cerrar</button>'
  document.body.appendChild(bar)
  document.getElementById('cerrar-pdf-btn').onclick = () => { iframe.remove(); bar.remove() }
}
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
  const [presupuestoItems, setPresupuestoItems] = useState([])
  const [localData, setLocalData] = useState(null)
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
  const [tareasPorVerificar, setTareasPorVerificar] = useState(0)
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [mostrarFormRol, setMostrarFormRol] = useState(false)
  const [rolForm, setRolForm] = useState({ nombre: '', sub_especialidad: '', descripcion: '', tipo_aporte: 'servicio', valor_mercado: '', es_prioritario: false })
  const [guardandoRol, setGuardandoRol] = useState(false)
  const [mensajeRol, setMensajeRol] = useState('')
  const [catalogoEsp, setCatalogoEsp] = useState([])
  const [busquedaEsp, setBusquedaEsp] = useState('')
  const [vistaRol, setVistaRol] = useState('catalogo') // 'catalogo' | 'nueva'
  const [nuevaEspNombre, setNuevaEspNombre] = useState('')
  const [tourPaso, setTourPaso] = useState(null) // null = inactivo, 0-4 = paso del tour

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
      if (initialTab && ['resumen','hitos','equipo','aportes','presupuesto','economia','roles','tareas','chat','necesito_mas','local'].includes(initialTab)) {
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

      // Cargar items del presupuesto para adaptar el nav
      fetch('/api/presupuesto?proyecto_id=' + pid)
        .then(r => r.json())
        .then(d => { if (d.ok) setPresupuestoItems(d.items || []) })

      // Cargar datos del local si el proyecto es local_comercial
      if (proyData.proyecto?.escenario === 'local_comercial') {
        fetch('/api/local-comercial?proyecto_id=' + pid)
          .then(r => r.json())
          .then(d => { if (d.local) setLocalData(d.local) })
          .catch(() => {})
      }

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
      const misPendientes = (tData.tareas || []).filter(t => t.asignado_a === user.id && (t.estado === 'pendiente' || t.estado === 'en_progreso'))
      const porVerif = (tData.tareas || []).filter(t => t.estado === 'completada')
      setBadgeTareas(esFundador ? porVerif.length : misPendientes.length)
      setTareasPorVerificar(porVerif.length)

      // Tour de onboarding — especialistas primera vez, fundadores en proyectos nuevos
      if (!esFundador && miPostulacionAceptada) {
        const tourKey = 'escala_tour_especialista_' + user.id + '_' + pid
        const yaVioTour = localStorage.getItem(tourKey)
        if (!yaVioTour) setTourPaso(0)
      } else if (esFundador) {
        const params = new URLSearchParams(window.location.search)
        const esNuevo = params.get('nuevo') === '1'
        const tourKey = 'escala_tour_fundador_' + pid
        const yaVioTour = localStorage.getItem(tourKey)
        if (esNuevo && !yaVioTour) setTourPaso(0)
      }

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
    else alert('No se pudo actualizar el hito: ' + (data.error || 'intenta de nuevo'))
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
    } else {
      alert('No se pudo resolver: ' + (data.error || 'intenta de nuevo'))
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
    else alert('No se pudo crear el hito: ' + (data.error || 'intenta de nuevo'))
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
    } else {
      alert('No se pudo registrar el aporte: ' + (data.error || 'intenta de nuevo'))
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

  // Detectar qué tiene el proyecto para adaptar el nav
  const esLocalComercial = proyecto?.escenario === 'local_comercial'

  // Helpers para navegar al tab correcto segun escenario
  // En local y equipos no existe el tab 'roles' ni 'presupuesto' como tal
  function irAPublicarRol() {
    // En todos los escenarios: abrir el form de rol en el tab que lo contiene
    if (esLocalComercial || esEscenarioEquipos) {
      // En local y equipos el form de rol esta en el tab necesito_mas → pero mejor
      // redirigir al workspace con el form de roles abierto via URL
      setTab('necesito_mas')
      setMostrarFormRol(true)
    } else {
      setTab('roles')
      setMostrarFormRol(true)
    }
  }

  function irAPresupuesto() {
    // En local comercial, presupuesto es una subpagina separada
    if (esLocalComercial) {
      window.location.href = '/proyectos/' + proyecto?.id + '/workspace/presupuesto'
    } else {
      setTab('presupuesto')
    }
  }
  const tieneMaquinaria = presupuestoItems.some(i => i.categoria === 'equipos_activos')
  const tienePersonas = presupuestoItems.some(i => i.categoria === 'equipo')
  const tieneTechItems = presupuestoItems.some(i => i.categoria === 'tecnologia')
  const tienePresupuestoDefinido = presupuestoItems.length > 0
  const esProyectoSimple = esLocalComercial || (tienePresupuestoDefinido && !tienePersonas && !tieneTechItems)

  // Definicion de tabs con icono SVG, label y tooltip
  const TABS_CONFIG = {
    // Tab "Mi proyecto" — resumen general, hitos, acciones del fundador
    resumen: {
      label: 'Mi proyecto',
      icon: (activo) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activo ? '#1D9E75' : '#8FA3CC'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      ),
      tooltip: ['Estado general y metas del proyecto', 'Publicar un nuevo rol', 'Registrar ingresos', 'Cerrar el proyecto'],
    },
    // Tab "Mi equipo" — personas, contratos, roles
    equipo: {
      label: 'Mi equipo',
      icon: (activo) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activo ? '#1D9E75' : '#8FA3CC'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.85"/>
        </svg>
      ),
      tooltip: ['Quienes hacen parte del proyecto', 'Contratos firmados y postulaciones', 'Roles abiertos que buscan personas'],
    },
    // Tab "Maquinas y activos" — equipos, tech, inventario, fondeo
    presupuesto: {
      label: 'Maquinas y activos',
      icon: (activo) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activo ? '#1D9E75' : '#8FA3CC'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      ),
      tooltip: ['Equipos y maquinas que necesitas', 'Tecnologia, software, inventario', 'Pedir financiamiento por cada parte', 'Ver qué está financiado y qué no'],
    },
    // Tab "Contrato leasing" — solo para proyectos de equipos con modelo leasing
    leasing: {
      label: 'Contrato leasing',
      icon: (activo) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activo ? '#AFA9EC' : '#8FA3CC'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      ),
      tooltip: ['Contrato de leasing de maquinaria', 'Firma digital paso a paso', 'Estado de aprobacion del angel', 'Historial de abonos'],
    },
    // Tab "Financiacion" — capital, aportes, economia, reparto
    economia: {
      label: 'Financiacion',
      icon: (activo) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activo ? '#1D9E75' : '#8FA3CC'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2"/>
          <circle cx="12" cy="12" r="2"/>
          <path d="M6 12h.01M18 12h.01"/>
        </svg>
      ),
      tooltip: ['Capital que ha entrado al proyecto', 'Aportes del equipo', 'Repartir ingresos entre participantes', 'Historial de movimientos'],
    },
    // Tab "Tareas" — lo que hay que hacer
    tareas: {
      label: 'Tareas',
      icon: (activo) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activo ? '#1D9E75' : '#8FA3CC'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
      tooltip: ['Lo que hay que hacer y quien lo hace', 'Plazos y prioridades', 'Documentos adjuntos por tarea'],
    },
    // Tab "Chat" — mensajes del equipo
    chat: {
      label: 'Chat',
      icon: (activo) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activo ? '#1D9E75' : '#8FA3CC'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      tooltip: ['Mensajes de todo el equipo', 'Solo ven los miembros del proyecto'],
    },
    // Tab para local comercial
    local: {
      label: 'Ventas de hoy',
      icon: (activo) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activo ? '#1D9E75' : '#8FA3CC'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
      tooltip: ['Reportar las ventas del dia', 'Ver el calculo del pago al inversionista', 'Historial de reportes diarios'],
    },
    aportes: {
      label: 'Mis aportes',
      icon: (activo) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activo ? '#1D9E75' : '#8FA3CC'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      ),
      tooltip: ['Lo que has aportado al proyecto', 'En tiempo, dinero o recursos'],
    },
    hitos: {
      label: 'Hitos',
      icon: (activo) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activo ? '#1D9E75' : '#8FA3CC'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
      tooltip: ['Las metas del proyecto', 'Completar metas desbloquea el financiamiento'],
    },
    documentos: {
      label: 'Documentos',
      icon: (activo) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activo ? '#1D9E75' : '#8FA3CC'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
      tooltip: ['Documentos y archivos del proyecto', 'Contratos, permisos, entregables'],
    },
    roles: {
      label: 'Roles',
      icon: (activo) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activo ? '#1D9E75' : '#8FA3CC'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/>
        </svg>
      ),
      tooltip: ['Roles que buscan postulantes', 'Publicar nuevo rol'],
    },
    necesito_mas: {
      label: 'Necesito mas',
      icon: (activo) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activo ? '#AFA9EC' : '#AFA9EC'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      ),
      tooltip: ['Agrega empleados, equipos o un local', 'Expande tu negocio cuando lo necesites'],
    },
  }

  // Construir lista de tabs segun tipo de proyecto y rol
  const tabIds = esLocalComercial ? [
    'resumen', 'local', 'economia', 'chat',
    ...(esFundador ? ['hitos'] : []),
    'documentos',
    ...(esFundador ? ['necesito_mas'] : []),
  ] : esFundador ? [
    'resumen', 'equipo', 'presupuesto', 'economia', 'tareas', 'chat',
    ...(esEscenarioEquipos ? ['necesito_mas'] : []),
  ] : [
    'tareas', 'resumen', 'aportes', 'economia', 'chat',
  ]

  const tabs = tabIds.map(id => ({
    id,
    ...TABS_CONFIG[id],
    badge: id === 'chat' ? (badgeChat > 0 ? badgeChat : null)
      : id === 'tareas' ? (badgeTareas > 0 ? badgeTareas : null)
      : id === 'hitos' ? (hitosPendientes > 0 ? hitosPendientes : null)
      : id === 'roles' ? (roles.filter(r => r.estado === 'abierto').length > 0 ? roles.filter(r => r.estado === 'abierto').length : null)
      : null
  }))

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

  const esEscenarioEquipos = proyecto?.escenario === 'maquinaria'
  const esEscenarioLocal = proyecto?.escenario === 'local_comercial'

  // Tour para FUNDADORES — diferente segun escenario
  const TOUR_PASOS_FUNDADOR = esEscenarioEquipos ? [
    {
      titulo: 'Tu proyecto esta listo',
      texto: 'Creaste el proyecto. Ahora hay una sola cosa que hacer para conseguir el capital que necesitas.',
      accion: 'Siguiente →',
    },
    {
      titulo: 'Ve a "Maquinas y activos"',
      texto: 'Ese tab es donde agregas lo que quieres comprar: el horno, la nevera, el servidor. Los angeles ven exactamente que necesitas y pueden financiarlo.',
      accion: 'Siguiente →',
      highlight: 'presupuesto',
    },
    {
      titulo: 'Tu decides a cambio de que',
      texto: 'Al agregar el equipo eliges: parte del negocio, cuotas mensuales, o un porcentaje de tus ventas. Nada esta fijo de antemano.',
      accion: 'Siguiente →',
    },
    {
      titulo: 'Los angeles te encontraran',
      texto: 'Cuando agregues el primer item, Escala notifica automaticamente a los angeles que han financiado proyectos similares. El capital viene a ti.',
      accion: 'Agregar lo que necesito →',
      href: proyecto?.id ? '/proyectos/' + proyecto.id + '/workspace/presupuesto' : null,
      esFinal: true,
    },
  ] : esEscenarioLocal ? [
    {
      titulo: 'Tu local esta en verificacion',
      texto: 'Escala contactara al propietario del local para confirmar el arriendo y el precio. Esto toma entre 24 y 48 horas.',
      accion: 'Siguiente →',
    },
    {
      titulo: 'Cuando tengas angel, reportas ventas diarias',
      texto: 'Aqui vas a reportar cuanto vendiste cada dia. El sistema calcula cuanto le corresponde al angel y abona automaticamente a tu deuda.',
      accion: 'Siguiente →',
      highlight: 'local',
    },
    {
      titulo: 'Te avisamos cuando haya novedades',
      texto: 'Recibiras una notificacion cuando el local sea verificado y cuando un angel quiera financiarlo. Por ahora no necesitas hacer nada mas.',
      accion: 'Entendido →',
      esFinal: true,
    },
  ] : [
    // Startup — proyecto con equipo
    {
      titulo: 'Tu proyecto ya aparece en el directorio',
      texto: 'Especialistas y cofundadores ya pueden encontrarlo y postularse. El siguiente paso es decirles que perfil necesitas.',
      accion: 'Siguiente →',
    },
    {
      titulo: 'Publica tu primer rol',
      texto: 'Ve a "Mi equipo" y define que tipo de persona necesitas. Ellos trabajan a cambio de participacion en el negocio — sin pagar salario ahora.',
      accion: 'Siguiente →',
      highlight: 'equipo',
    },
    {
      titulo: 'El equipo atrae al capital',
      texto: 'Los angeles invierten cuando ven personas comprometidas construyendo el proyecto. Forma el equipo primero, el capital llega despues.',
      accion: 'Publicar primer rol →',
      href: proyecto?.id ? '/proyectos/' + proyecto.id + '/workspace?tab=roles' : null,
      esFinal: true,
    },
  ]

  // Tour para ESPECIALISTAS
  const TOUR_PASOS = esFundador ? TOUR_PASOS_FUNDADOR : [
    {
      titulo: 'Bienvenido a tu workspace',
      texto: `Estas en el proyecto ${proyecto?.nombre}. Este es tu espacio de trabajo junto al equipo.`,
      accion: 'Siguiente →',
      highlight: null,
    },
    {
      titulo: 'Tus tareas',
      texto: 'Aqui aparecen las tareas asignadas a tu rol. Marcalas como "En progreso" cuando las inicias y "Completada" cuando terminas. El fundador las verifica.',
      accion: 'Ver mis tareas →',
      highlight: 'tareas',
      href: proyecto?.id ? '/proyectos/' + proyecto.id + '/workspace/tareas' : null,
    },
    {
      titulo: 'Chat del equipo',
      texto: 'El chat es para coordinarte con el resto del equipo. Cuando completas una tarea se abre un hilo especifico para subir documentos y hablar con el fundador.',
      accion: 'Siguiente →',
      highlight: 'chat',
    },
    {
      titulo: 'Tu aporte y participacion',
      texto: 'En "Mis aportes" puedes registrar el tiempo o servicios que estas aportando al proyecto. Eso construye tu participacion economica futura.',
      accion: 'Siguiente →',
      highlight: 'aportes',
    },
    {
      titulo: 'Listo para empezar',
      texto: 'El primer paso es ir a Tareas, iniciar las que tienes asignadas y completarlas. El fundador te avisara si necesita algo mas.',
      accion: 'Ir a mis tareas →',
      href: proyecto?.id ? '/proyectos/' + proyecto.id + '/workspace/tareas' : null,
      highlight: null,
      esFinal: true,
    },
  ]

  function cerrarTour() {
    if (esFundador) {
      localStorage.setItem('escala_tour_fundador_' + proyecto?.id, '1')
    } else {
      localStorage.setItem('escala_tour_especialista_' + usuario?.id + '_' + proyecto?.id, '1')
    }
    setTourPaso(null)
  }

  function avanzarTour() {
    const paso = TOUR_PASOS[tourPaso]
    if (paso?.href) {
      cerrarTour()
      window.location.href = paso.href
      return
    }
    if (tourPaso >= TOUR_PASOS.length - 1) {
      cerrarTour()
      return
    }
    setTourPaso(p => p + 1)
  }

  return (
    <div style={{minHeight:'100vh',background:'#0B1628',fontFamily:'Inter,sans-serif'}}>

      {/* TOUR ONBOARDING — fundadores en proyectos nuevos, especialistas primera vez */}
      {tourPaso !== null && TOUR_PASOS[tourPaso] && (
        <>
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,backdropFilter:'blur(2px)'}} onClick={cerrarTour}></div>
          <div style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:1001,background:'#15234a',border:'1px solid rgba(29,158,117,0.4)',borderRadius:'16px',padding:'2rem',maxWidth:'420px',width:'calc(100vw - 2rem)',boxShadow:'0 20px 60px rgba(0,0,0,0.6)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1rem'}}>
              <div style={{fontSize:'0.65rem',fontWeight:'700',color:'#1D9E75',letterSpacing:'0.08em',textTransform:'uppercase'}}>
                Paso {tourPaso + 1} de {TOUR_PASOS.length}
              </div>
              <button onClick={cerrarTour} style={{background:'none',border:'none',color:'#8FA3CC',cursor:'pointer',fontSize:'1rem',padding:0,lineHeight:1}}>✕</button>
            </div>
            {/* Barra de progreso */}
            <div style={{height:'3px',background:'rgba(255,255,255,0.08)',borderRadius:'2px',marginBottom:'1.5rem',overflow:'hidden'}}>
              <div style={{height:'100%',width:((tourPaso+1)/TOUR_PASOS.length*100)+'%',background:'#1D9E75',borderRadius:'2px',transition:'width 0.3s ease'}}></div>
            </div>
            <div style={{fontSize:'1.1rem',fontWeight:'800',color:'#fff',marginBottom:'0.75rem',lineHeight:'1.3'}}>
              {TOUR_PASOS[tourPaso].titulo}
            </div>
            <div style={{fontSize:'0.85rem',color:'#C8D4E8',lineHeight:'1.7',marginBottom:'1.75rem'}}>
              {TOUR_PASOS[tourPaso].texto}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <button onClick={cerrarTour} style={{background:'none',border:'none',color:'#8FA3CC',fontSize:'0.78rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                Saltar tour
              </button>
              <button onClick={avanzarTour} style={{background:'#1D9E75',color:'#fff',border:'none',borderRadius:'10px',padding:'0.7rem 1.5rem',fontSize:'0.85rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                {TOUR_PASOS[tourPaso].accion}
              </button>
            </div>
          </div>
        </>
      )}

      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <a href="/dashboard" style={{fontSize:'1rem',fontWeight:'900',color:'#fff',textDecoration:'none',letterSpacing:'-0.03em'}}>Esca<span style={{color:'#1D9E75'}}>la</span></a>
          <span style={{color:'rgba(255,255,255,0.2)'}}>·</span>
          <span style={{fontSize:'0.85rem',fontWeight:'600',color:'#fff'}}>{proyecto?.nombre}</span>
          {esFundador && <span style={{fontSize:'0.62rem',fontWeight:'700',padding:'2px 8px',borderRadius:'10px',background:'rgba(232,160,32,0.2)',color:'#E8A020'}}>Fundador</span>}
          {miRol && !esFundador && <span style={{fontSize:'0.62rem',fontWeight:'700',padding:'2px 8px',borderRadius:'10px',background:'rgba(29,158,117,0.2)',color:'#1D9E75'}}>{miRol.nombre}</span>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'1rem',flexWrap:'wrap'}}>
          <a href={'/proyectos/' + proyecto?.id} style={{color:'#6B7280',fontSize:'0.75rem',textDecoration:'none'}}>Ver proyecto</a>
          <a href="/dashboard" style={{color:'#6B7280',fontSize:'0.75rem',textDecoration:'none'}}>Dashboard</a>
          {esFundador && !confirmandoEliminar && (
            <button onClick={() => setConfirmandoEliminar(true)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.2)',fontSize:'0.72rem',cursor:'pointer',fontFamily:'Inter,sans-serif',padding:'0.3rem 0.5rem'}}>Eliminar</button>
          )}
          {esFundador && confirmandoEliminar && (
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem',background:'rgba(224,85,85,0.1)',border:'1px solid rgba(224,85,85,0.3)',borderRadius:'8px',padding:'0.3rem 0.75rem'}}>
              <span style={{fontSize:'0.72rem',color:'#E05555'}}>¿Eliminar proyecto?</span>
              <button onClick={async () => {
                setEliminando(true)
                try {
                  const { data: { session } } = await supabase.auth.getSession()
                  // Verificar que no hay especialistas aceptados
                  const { data: contratos } = await supabase
                    .from('contratos')
                    .select('id')
                    .eq('proyecto_id', proyecto.id)
                    .eq('estado', 'activo')
                    .limit(1)
                  if (contratos && contratos.length > 0) {
                    alert('No puedes eliminar este proyecto porque tiene especialistas con contratos activos.')
                    setConfirmandoEliminar(false)
                    setEliminando(false)
                    return
                  }
                  const res = await fetch(`/api/proyectos/${proyecto.id}?fundador_id=${usuario.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${session.access_token}` } })
                  if (res.ok) {
                    window.location.href = '/proyectos'
                  } else {
                    const d = await res.json()
                    alert(d.error || 'No se pudo eliminar el proyecto')
                    setConfirmandoEliminar(false)
                  }
                } catch (err) {
                  alert('Error al eliminar: ' + err.message)
                  setConfirmandoEliminar(false)
                } finally {
                  setEliminando(false)
                }
              }} style={{background:'#E05555',color:'#fff',border:'none',borderRadius:'5px',padding:'2px 8px',fontSize:'0.72rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                {eliminando ? '...' : 'Sí, eliminar'}
              </button>
              <button onClick={() => setConfirmandoEliminar(false)} style={{background:'none',border:'none',color:'#8FA3CC',fontSize:'0.72rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Cancelar</button>
            </div>
          )}
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/registro?modo=login' }} style={{background:'rgba(216,90,48,0.1)',border:'1px solid rgba(216,90,48,0.25)',color:'#D85A30',fontSize:'0.75rem',fontWeight:'600',padding:'0.3rem 0.75rem',borderRadius:'6px',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Salir</button>
        </div>
      </nav>

      {/* BANNER DE BORRADOR — proyecto no publicado todavia */}
      {esFundador && proyecto?.estado === 'borrador' && (
        <div style={{background:'rgba(232,160,32,0.06)',borderBottom:'2px solid rgba(232,160,32,0.3)',padding:'0.875rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.75rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
            <span style={{width:'8px',height:'8px',borderRadius:'50%',background:'#E8A020',flexShrink:0,animation:'pulseBanner 1.5s infinite'}}></span>
            <div>
              <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#E8A020'}}>Este proyecto es privado — solo tú lo puedes ver</div>
              <div style={{fontSize:'0.75rem',color:'#8FA3CC'}}>No aparece en el directorio público ni recibe postulaciones. Publícalo cuando estés listo.</div>
            </div>
          </div>
          <button onClick={async () => {
            if (!confirm('¿Confirmas que quieres publicar este proyecto?\n\nA partir de ahora será visible en el directorio público y podrás recibir postulaciones e inversión.')) return
            const { data: { session } } = await supabase.auth.getSession()
            const res = await fetch('/api/proyectos', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: proyecto.id, fundador_id: session.user.id, estado: 'activo' })
            })
            const d = await res.json()
            if (d.proyecto) window.location.reload()
            else alert(d.error || 'Error al publicar')
          }} style={{background:'#E8A020',color:'#fff',border:'none',borderRadius:'8px',padding:'0.5rem 1.25rem',fontSize:'0.82rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap'}}>
            Publicar proyecto →
          </button>
        </div>
      )}

      {/* BANNER DE TAREAS PENDIENTES — debajo del nav */}
      {badgeTareas > 0 && (
        <a href={proyecto?.id ? '/proyectos/'+proyecto.id+'/workspace/tareas' : '#'} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.625rem 1.5rem',textDecoration:'none',background: esFundador ? 'rgba(232,160,32,0.08)' : 'rgba(74,144,217,0.08)',borderBottom: esFundador ? '1px solid rgba(232,160,32,0.2)' : '1px solid rgba(74,144,217,0.2)'}}>
          <span style={{width:'7px',height:'7px',borderRadius:'50%',background: esFundador ? '#E8A020' : '#4A90D9',flexShrink:0,animation:'pulseBanner 1.5s infinite'}}></span>
          <span style={{fontSize:'0.8rem',fontWeight:'600',color: esFundador ? '#E8A020' : '#4A90D9'}}>
            {esFundador
              ? `${badgeTareas} tarea${badgeTareas > 1 ? 's' : ''} completada${badgeTareas > 1 ? 's' : ''} esperan tu verificación`
              : `Tienes ${badgeTareas} tarea${badgeTareas > 1 ? 's' : ''} pendiente${badgeTareas > 1 ? 's' : ''} de completar`
            }
          </span>
          <span style={{marginLeft:'auto',fontSize:'0.75rem',color: esFundador ? '#E8A020' : '#4A90D9',fontWeight:'600'}}>Ir a tareas →</span>
        </a>
      )}

      {/* TABS — icono + label + tooltip */}
      <div style={{background:'rgba(255,255,255,0.02)',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'0 1rem',display:'flex',gap:'0',overflowX:'auto',alignItems:'stretch'}}>
        {tabs.map(t => {
          const activo = tab === t.id
          const baseStyle = {
            background:'none', border:'none',
            borderBottom: activo ? '2px solid #1D9E75' : '2px solid transparent',
            padding:'0.75rem 1rem 0.625rem',
            cursor:'pointer', fontFamily:'Inter,sans-serif',
            whiteSpace:'nowrap', display:'flex', flexDirection:'column',
            alignItems:'center', gap:'4px', position:'relative',
            textDecoration:'none', minWidth:'80px',
            transition:'background 0.15s',
          }
          const labelStyle = {
            fontSize:'0.68rem',
            fontWeight: activo ? '700' : '400',
            color: activo ? '#1D9E75' : '#8FA3CC',
            lineHeight:'1.2',
            textAlign:'center',
          }
          const tooltipEl = t.tooltip ? (
            <div style={{
              position:'absolute', top:'calc(100% + 8px)', left:'50%',
              transform:'translateX(-50%)',
              background:'#0D1B3E', border:'1px solid rgba(255,255,255,0.15)',
              borderRadius:'10px', padding:'0.625rem 0.875rem',
              width:'200px', zIndex:200,
              pointerEvents:'none',
              opacity:0, transition:'opacity 0.15s',
              boxShadow:'0 8px 24px rgba(0,0,0,0.4)',
            }} className="tab-tooltip">
              <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#fff',marginBottom:'6px'}}>{t.label}</div>
              {t.tooltip.map((item, i) => (
                <div key={i} style={{display:'flex',gap:'5px',alignItems:'flex-start',fontSize:'0.68rem',color:'#8FA3CC',padding:'2px 0'}}>
                  <span style={{color:'#4B5563',flexShrink:0}}>·</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          ) : null

          const content = (
            <>
              {t.icon(activo)}
              <span style={labelStyle}>{t.label}</span>
              {t.badge && <span style={{position:'absolute',top:'6px',right:'6px',background:'#E8A020',color:'#fff',fontSize:'0.55rem',fontWeight:'700',padding:'1px 4px',borderRadius:'10px',minWidth:'14px',textAlign:'center',lineHeight:'1.4'}}>{t.badge}</span>}
              {tooltipEl}
            </>
          )

          if (t.id === 'tareas' && proyecto?.id) {
            return (
              <a key={t.id} href={'/proyectos/' + proyecto.id + '/workspace/tareas'}
                style={baseStyle}
                onMouseEnter={e => { const tt = e.currentTarget.querySelector('.tab-tooltip'); if(tt) tt.style.opacity='1' }}
                onMouseLeave={e => { const tt = e.currentTarget.querySelector('.tab-tooltip'); if(tt) tt.style.opacity='0' }}>
                {content}
              </a>
            )
          }
          if (t.id === 'documentos' && proyecto?.id) {
            return (
              <a key={t.id} href={'/proyectos/' + proyecto.id + '/workspace/documentos'}
                style={baseStyle}
                onMouseEnter={e => { const tt = e.currentTarget.querySelector('.tab-tooltip'); if(tt) tt.style.opacity='1' }}
                onMouseLeave={e => { const tt = e.currentTarget.querySelector('.tab-tooltip'); if(tt) tt.style.opacity='0' }}>
                {content}
              </a>
            )
          }
          if (t.id === 'local' && proyecto?.id) {
            return (
              <a key={t.id} href={'/proyectos/' + proyecto.id + '/workspace/local'}
                style={baseStyle}
                onMouseEnter={e => { const tt = e.currentTarget.querySelector('.tab-tooltip'); if(tt) tt.style.opacity='1' }}
                onMouseLeave={e => { const tt = e.currentTarget.querySelector('.tab-tooltip'); if(tt) tt.style.opacity='0' }}>
                {content}
              </a>
            )
          }
          return (
            <button key={t.id}
              onClick={() => handleTabClick(t.id)}
              style={baseStyle}
              onMouseEnter={e => { const tt = e.currentTarget.querySelector('.tab-tooltip'); if(tt) tt.style.opacity='1' }}
              onMouseLeave={e => { const tt = e.currentTarget.querySelector('.tab-tooltip'); if(tt) tt.style.opacity='0' }}>
              {content}
            </button>
          )
        })}
        {/* Acceso workspace completo si es modo reducido */}
        {esProyectoSimple && (
          <a href={'/proyectos/' + proyecto?.id + '/workspace'} style={{marginLeft:'auto',background:'none',border:'none',borderBottom:'2px solid transparent',color:'#4B5563',padding:'0.75rem 0.75rem',fontSize:'0.65rem',cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap',display:'flex',alignItems:'center',textDecoration:'none',flexShrink:0}}>
            ··· todo
          </a>
        )}
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

            {/* KPIs contextuales segun tipo de proyecto */}
            {esLocalComercial && localData ? (
              <div>
                {/* LOCAL COMERCIAL — ventas, deuda, proximo pago */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'0.875rem',marginBottom:'1.25rem'}}>
                  <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                    <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#1D9E75'}}>${Math.round(parseFloat(localData.capital_pagado||0)).toLocaleString('es-CO')}</div>
                    <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Pagado al angel</div>
                  </div>
                  <div style={{background:'rgba(232,160,32,0.08)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                    <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#E8A020'}}>${Math.round(parseFloat(localData.capital_total||0)-parseFloat(localData.capital_pagado||0)).toLocaleString('es-CO')}</div>
                    <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Saldo pendiente</div>
                  </div>
                  <div style={{background:'rgba(74,144,217,0.08)',border:'1px solid rgba(74,144,217,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                    <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#4A90D9'}}>{Math.round((parseFloat(localData.capital_pagado||0)/parseFloat(localData.capital_total||1))*100)}%</div>
                    <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Completado</div>
                  </div>
                  <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                    <div style={{fontFamily:'monospace',fontSize:'1.1rem',fontWeight:'700',color:'#fff',textTransform:'capitalize'}}>{localData.fase_actual === 'repago' ? 'Pagando capital' : localData.fase_actual === 'regalia' ? 'Pagando retorno' : 'Negocio libre'}</div>
                    <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Fase actual</div>
                  </div>
                </div>
                {/* Barra de progreso */}
                <div style={{height:'6px',background:'rgba(255,255,255,0.06)',borderRadius:'3px',overflow:'hidden',marginBottom:'1.25rem'}}>
                  <div style={{height:'100%',width:Math.round((parseFloat(localData.capital_pagado||0)/parseFloat(localData.capital_total||1))*100)+'%',background:'#1D9E75',borderRadius:'3px',transition:'width 0.5s'}}></div>
                </div>
                {/* Boton grande registrar ventas */}
                <a href={'/proyectos/'+proyecto.id+'/workspace/local'} style={{display:'block',textAlign:'center',background:'#E8A020',color:'#fff',borderRadius:'12px',padding:'0.875rem',fontSize:'0.95rem',fontWeight:'700',textDecoration:'none',marginBottom:'1.5rem'}}>
                  Registrar ventas de hoy →
                </a>
              </div>
            ) : esEscenarioEquipos ? (
              <div>
                {/* EQUIPOS — items fondeados vs sin fondear */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'0.875rem',marginBottom:'1.25rem'}}>
                  <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                    <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#1D9E75'}}>{presupuestoItems.filter(i=>i.estado_fondeo==='fondeado').length}</div>
                    <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Items financiados</div>
                  </div>
                  <div style={{background:'rgba(232,160,32,0.08)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                    <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#E8A020'}}>{presupuestoItems.filter(i=>i.estado_fondeo!=='fondeado').length}</div>
                    <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Sin financiar</div>
                  </div>
                  <div style={{background:'rgba(175,169,236,0.08)',border:'1px solid rgba(175,169,236,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                    <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#AFA9EC'}}>${Math.round(presupuestoItems.reduce((s,i)=>s+parseFloat(i.monto_fondeado||0),0)).toLocaleString('es-CO')}</div>
                    <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Capital recibido</div>
                  </div>
                  <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                    <div style={{fontFamily:'monospace',fontSize:'1.3rem',fontWeight:'700',color:'#fff'}}>${Math.round(presupuestoItems.reduce((s,i)=>s+parseFloat(i.valor_total||0)-parseFloat(i.monto_fondeado||0),0)).toLocaleString('es-CO')}</div>
                    <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Falta conseguir</div>
                  </div>
                </div>

                {/* CTAs de acción para equipos */}
                <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap',marginBottom:'0.5rem'}}>
                  <a
                    href={'/proyectos/' + proyecto?.id + '/workspace/equipos'}
                    style={{background:'#1D9E75',color:'#fff',borderRadius:'10px',padding:'0.625rem 1.25rem',fontSize:'0.82rem',fontWeight:'700',textDecoration:'none',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                    📊 Reportar ventas del mes
                  </a>
                  <button
                    onClick={() => setTab('leasing')}
                    style={{background:'rgba(175,169,236,0.12)',border:'1px solid rgba(175,169,236,0.3)',color:'#AFA9EC',borderRadius:'10px',padding:'0.625rem 1.25rem',fontSize:'0.82rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                    📄 Ver contrato de leasing
                  </button>
                  <a
                    href={'/proyectos/' + proyecto?.id + '/workspace/leasing'}
                    style={{background:'rgba(175,169,236,0.08)',border:'1px solid rgba(175,169,236,0.2)',color:'#AFA9EC',borderRadius:'10px',padding:'0.625rem 1.25rem',fontSize:'0.82rem',fontWeight:'700',textDecoration:'none',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                    ✍️ Firmar contrato leasing
                  </a>
                </div>
              </div>
            ) : (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
                <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                  <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#1D9E75'}}>{hitosCompletados}</div>
                  <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Metas completadas</div>
                </div>
                <div style={{background:'rgba(232,160,32,0.08)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'12px',padding:'1.1rem',textAlign:'center'}}>
                  <div style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:'700',color:'#E8A020'}}>{hitosPendientes}</div>
                  <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.2rem'}}>Metas pendientes</div>
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
            )}

            {/* FINANCIAMIENTO EMBEBIDO — C3.25
                Si hay items sin fondear, los muestra directamente aqui
                Sin tener que ir al tab de Maquinas y activos */}
            {(() => {
              const itemsSinFondear = presupuestoItems.filter(i =>
                i.estado_fondeo === 'sin_fondear' || i.estado_fondeo === 'parcialmente_fondeado'
              )
              const totalFaltante = itemsSinFondear.reduce((s, i) =>
                s + (parseFloat(i.valor_total || 0) - parseFloat(i.monto_fondeado || 0)), 0
              )
              const fmtM = n => {
                const v = parseFloat(n || 0)
                if (v >= 1000000) return '$' + (v/1000000).toFixed(1) + 'M'
                if (v >= 1000) return '$' + (v/1000).toFixed(0) + 'K'
                return '$' + Math.round(v).toLocaleString('es-CO')
              }

              if (itemsSinFondear.length === 0 && presupuestoItems.length > 0) {
                // Todo fondeado
                return (
                  <div style={{background:'rgba(29,158,117,0.06)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1rem 1.25rem',marginBottom:'1.5rem',display:'flex',alignItems:'center',gap:'0.875rem'}}>
                    <span style={{fontSize:'1.25rem'}}>✅</span>
                    <div>
                      <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#1D9E75'}}>Todo financiado</div>
                      <div style={{fontSize:'0.75rem',color:'#8FA3CC'}}>Todos los items del proyecto tienen capital asignado.</div>
                    </div>
                  </div>
                )
              }

              if (itemsSinFondear.length > 0) {
                return (
                  <div style={{background:'rgba(74,144,217,0.04)',border:'1px solid rgba(74,144,217,0.18)',borderRadius:'14px',padding:'1.1rem 1.25rem',marginBottom:'1.5rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.875rem',flexWrap:'wrap',gap:'0.5rem'}}>
                      <div>
                        <div style={{fontSize:'0.82rem',fontWeight:'700',color:'#4A90D9',marginBottom:'2px'}}>
                          {itemsSinFondear.length === 1
                            ? '1 cosa sin financiar'
                            : itemsSinFondear.length + ' cosas sin financiar'}
                        </div>
                        <div style={{fontSize:'0.72rem',color:'#8FA3CC'}}>
                          Falta conseguir {fmtM(totalFaltante)} — los angeles pueden financiar cada item por separado
                        </div>
                      </div>
                      <button
                        onClick={irAPresupuesto}
                        style={{background:'#4A90D9',color:'#fff',border:'none',borderRadius:'8px',padding:'0.45rem 1rem',fontSize:'0.75rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap'}}>
                        Conseguir fondeo →
                      </button>
                    </div>

                    {/* Items sin fondear — max 3 visibles */}
                    <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                      {itemsSinFondear.slice(0, 3).map(item => {
                        const fondeado = parseFloat(item.monto_fondeado || 0)
                        const total = parseFloat(item.valor_total || 0)
                        const faltante = total - fondeado
                        const pct = total > 0 ? Math.round((fondeado / total) * 100) : 0
                        const catLabel = {
                          equipo: 'Equipo', equipos_activos: 'Maquinas y activos',
                          tecnologia: 'Tecnologia', capital_trabajo: 'Capital de trabajo',
                          marketing_ventas: 'Marketing', legal_operacion: 'Legal', otro: 'Otro'
                        }[item.categoria] || item.categoria

                        return (
                          <div key={item.id} style={{background:'rgba(255,255,255,0.04)',borderRadius:'10px',padding:'0.75rem 0.875rem'}}>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'6px'}}>
                              <div>
                                <div style={{fontSize:'0.82rem',fontWeight:'600',color:'#fff'}}>{item.nombre}</div>
                                <div style={{fontSize:'0.65rem',color:'#6B7280'}}>{catLabel}</div>
                              </div>
                              <div style={{textAlign:'right',flexShrink:0}}>
                                <div style={{fontSize:'0.82rem',fontWeight:'700',color:'#E8A020'}}>{fmtM(faltante)}</div>
                                <div style={{fontSize:'0.62rem',color:'#6B7280'}}>falta</div>
                              </div>
                            </div>
                            <div style={{height:'3px',background:'rgba(255,255,255,0.06)',borderRadius:'2px',overflow:'hidden'}}>
                              <div style={{height:'100%',width:pct+'%',background:'#4A90D9',borderRadius:'2px'}}></div>
                            </div>
                          </div>
                        )
                      })}
                      {itemsSinFondear.length > 3 && (
                        <div style={{fontSize:'0.72rem',color:'#6B7280',textAlign:'center',padding:'0.25rem'}}>
                          +{itemsSinFondear.length - 3} mas sin financiar
                        </div>
                      )}
                    </div>
                  </div>
                )
              }

              // Sin presupuesto definido — CTA para agregar
              return (
                <div style={{background:'rgba(74,144,217,0.04)',border:'1px solid rgba(74,144,217,0.15)',borderRadius:'12px',padding:'1rem 1.25rem',marginBottom:'1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'0.75rem'}}>
                  <div>
                    <div style={{fontSize:'0.85rem',fontWeight:'700',color:'#4A90D9',marginBottom:'2px'}}>¿Necesitas capital para algo especifico?</div>
                    <div style={{fontSize:'0.75rem',color:'#8FA3CC',lineHeight:'1.5'}}>Agrega lo que necesitas — una maquina, un empleado, tecnologia. Los angeles lo financian por item.</div>
                  </div>
                  <button onClick={irAPresupuesto} style={{background:'#4A90D9',color:'#fff',border:'none',borderRadius:'8px',padding:'0.5rem 1.25rem',fontSize:'0.82rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap'}}>
                    Agregar lo que necesito →
                  </button>
                </div>
              )
            })()}

            {esFundador && hitosPendientes > 0 && (
              <div style={{background:'rgba(232,160,32,0.06)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'12px',padding:'0.875rem 1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'0.75rem',marginBottom:'1.5rem'}}>
                <div style={{fontSize:'0.78rem',color:'#E8A020'}}>📋 Tienes <strong>{hitosPendientes} hito{hitosPendientes > 1 ? 's' : ''}</strong> pendientes — vincúlalos a partes del presupuesto para que el financiamiento desbloquee el avance automáticamente.</div>
                <button onClick={() => setTab('hitos')} style={{background:'none',border:'1px solid rgba(232,160,32,0.4)',color:'#E8A020',borderRadius:'6px',padding:'0.35rem 0.875rem',fontSize:'0.75rem',fontWeight:'600',cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap'}}>Ver metas</button>
              </div>
            )}

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
                <div style={{fontSize:'0.8rem',fontWeight:'700',color:'#fff',marginBottom:'1rem',paddingBottom:'0.5rem',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>Próximas metas</div>
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
                <button onClick={() => setTab('hitos')} style={{marginTop:'0.75rem',background:'none',border:'none',color:'#1D9E75',fontSize:'0.78rem',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:'600'}}>Ver todas las metas →</button>
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
                    {(miContrato.contenido_json?.texto_pdf || miContrato.condiciones) && (
                      <button onClick={async () => {
                        const texto = miContrato.contenido_json?.texto_pdf || miContrato.condiciones || ''
                        descargarContratoPDF(texto, `Contrato_${proyecto?.nombre || 'Escala'}.pdf`)
                      }} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.15)',color:'#fff',borderRadius:'8px',padding:'0.5rem 1rem',fontSize:'0.78rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                        ⬇ Descargar PDF
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
                <div style={{fontSize:'1rem',fontWeight:'700',color:'#fff'}}>Metas del proyecto</div>
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
                    <div style={{color:'#8FA3CC',fontSize:'0.82rem',textAlign:'center',padding:'1.5rem',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'10px'}}>Sin metas pendientes 🎉</div>
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
                <div style={{fontSize:'0.8rem',fontWeight:'700',color:'#fff',marginBottom:'0.875rem'}}>+ Crear nueva meta</div>
                <div style={{display:'flex',gap:'0.75rem'}}>
                  <input value={nuevoHito} onChange={e=>setNuevoHito(e.target.value)} onKeyDown={e=>e.key==='Enter'&&crearHito()} placeholder="Nombre de la meta..." style={{flex:1,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.65rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',fontFamily:'Inter,sans-serif'}}/>
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

            {/* C5.9 — Estado vacio: sin equipo y sin roles publicados */}
            {equipo.length === 0 && roles.filter(r=>r.estado==='abierto').length === 0 && esFundador && (
              <div style={{background:'rgba(29,158,117,0.04)',border:'1px dashed rgba(29,158,117,0.2)',borderRadius:'14px',padding:'2rem',textAlign:'center',marginTop:'1.25rem'}}>
                <div style={{fontSize:'2rem',marginBottom:'0.75rem'}}>👥</div>
                <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',marginBottom:'0.5rem'}}>Tu proyecto no tiene equipo todavia</div>
                <div style={{fontSize:'0.82rem',color:'#8FA3CC',lineHeight:'1.6',maxWidth:'400px',margin:'0 auto 1.25rem'}}>
                  Publica un rol y especialistas del directorio se postulan para trabajar contigo a cambio de participacion en el negocio.
                </div>
                <div style={{display:'flex',gap:'0.75rem',justifyContent:'center',flexWrap:'wrap'}}>
                  <button onClick={() => { setTab('roles'); setMostrarFormRol(true) }} style={{background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.6rem 1.5rem',fontSize:'0.85rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                    + Publicar primer rol
                  </button>
                  <a href={'/proyectos/'+proyecto?.id} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',color:'#8FA3CC',borderRadius:'8px',padding:'0.6rem 1.5rem',fontSize:'0.85rem',textDecoration:'none'}}>
                    Ver proyecto publico
                  </a>
                </div>
              </div>
            )}
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

        {/* TAB: NECESITO MAS */}
        {tab === 'necesito_mas' && (
          <div>
            <div style={{fontSize:'1rem',fontWeight:'700',color:'#fff',marginBottom:'0.4rem'}}>¿Que mas necesitas para tu negocio?</div>
            <div style={{fontSize:'0.8rem',color:'#8FA3CC',marginBottom:'1.5rem'}}>Puedes agregar empleados, equipos o un local en cualquier momento — sin crear un proyecto nuevo.</div>

            <div style={{display:'flex',flexDirection:'column',gap:'0.875rem'}}>

              {/* Empleado */}
              <div style={{background:'rgba(29,158,117,0.06)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.1rem 1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.875rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.875rem'}}>
                  <div style={{width:'40px',height:'40px',borderRadius:'10px',background:'rgba(29,158,117,0.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.85"/></svg>
                  </div>
                  <div>
                    <div style={{fontSize:'0.9rem',fontWeight:'700',color:'#fff',marginBottom:'2px'}}>Necesito un empleado</div>
                    <div style={{fontSize:'0.78rem',color:'#8FA3CC',lineHeight:'1.5'}}>Publica un rol y alguien del directorio se postula para trabajar a cambio de participacion en el negocio.</div>
                  </div>
                </div>
                <button onClick={irAPublicarRol} style={{background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.5rem 1.25rem',fontSize:'0.82rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap'}}>
                  Publicar rol →
                </button>
              </div>

              {/* Equipo o maquina — solo si es local */}
              {esLocalComercial && (
                <div style={{background:'rgba(232,160,32,0.06)',border:'1px solid rgba(232,160,32,0.2)',borderRadius:'12px',padding:'1.1rem 1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.875rem'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.875rem'}}>
                    <div style={{width:'40px',height:'40px',borderRadius:'10px',background:'rgba(232,160,32,0.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8A020" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                    </div>
                    <div>
                      <div style={{fontSize:'0.9rem',fontWeight:'700',color:'#fff',marginBottom:'2px'}}>Necesito un equipo o maquina</div>
                      <div style={{fontSize:'0.78rem',color:'#8FA3CC',lineHeight:'1.5'}}>Agrega el equipo que necesitas al presupuesto. Un inversionista lo financia por item — tu pagas desde los ingresos.</div>
                    </div>
                  </div>
                  <button onClick={irAPresupuesto} style={{background:'#E8A020',color:'#fff',border:'none',borderRadius:'8px',padding:'0.5rem 1.25rem',fontSize:'0.82rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap'}}>
                    Agregar equipo →
                  </button>
                </div>
              )}

              {/* Local — solo si es proyecto de equipos */}
              {esEscenarioEquipos && (
                <div style={{background:'rgba(74,144,217,0.06)',border:'1px solid rgba(74,144,217,0.2)',borderRadius:'12px',padding:'1.1rem 1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.875rem'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.875rem'}}>
                    <div style={{width:'40px',height:'40px',borderRadius:'10px',background:'rgba(74,144,217,0.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    </div>
                    <div>
                      <div style={{fontSize:'0.9rem',fontWeight:'700',color:'#fff',marginBottom:'2px'}}>Necesito un local</div>
                      <div style={{fontSize:'0.78rem',color:'#8FA3CC',lineHeight:'1.5'}}>Un inversionista financia el deposito y el arriendo del local. Tu lo pagas desde las ventas diarias del negocio.</div>
                    </div>
                  </div>
                  <a href="/proyectos?escenario=local_comercial" style={{background:'#4A90D9',color:'#fff',border:'none',borderRadius:'8px',padding:'0.5rem 1.25rem',fontSize:'0.82rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap',textDecoration:'none'}}>
                    Ver como funciona →
                  </a>
                </div>
              )}

              {/* Capital de trabajo */}
              <div style={{background:'rgba(175,169,236,0.06)',border:'1px solid rgba(175,169,236,0.2)',borderRadius:'12px',padding:'1.1rem 1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.875rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.875rem'}}>
                  <div style={{width:'40px',height:'40px',borderRadius:'10px',background:'rgba(175,169,236,0.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#AFA9EC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                  </div>
                  <div>
                    <div style={{fontSize:'0.9rem',fontWeight:'700',color:'#fff',marginBottom:'2px'}}>Necesito capital de trabajo</div>
                    <div style={{fontSize:'0.78rem',color:'#8FA3CC',lineHeight:'1.5'}}>Para inventario, insumos, materia prima o cualquier gasto operativo. Agregalo al presupuesto y un inversionista lo financia.</div>
                  </div>
                </div>
                <button onClick={irAPresupuesto} style={{background:'rgba(175,169,236,0.2)',color:'#AFA9EC',border:'1px solid rgba(175,169,236,0.3)',borderRadius:'8px',padding:'0.5rem 1.25rem',fontSize:'0.82rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap'}}>
                  Agregar item →
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB: ECONOMÍA */}
        {tab === 'economia' && (
          <div>
            <div style={{fontSize:'1rem',fontWeight:'700',color:'#fff',marginBottom:'1.5rem'}}>Economía del proyecto</div>

            {/* Link al presupuesto completo */}
            <div style={{background:'rgba(74,144,217,0.06)',border:'1px solid rgba(74,144,217,0.2)',borderRadius:'12px',padding:'1rem 1.25rem',marginBottom:'1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.75rem'}}>
              <div>
                <div style={{fontSize:'0.88rem',fontWeight:'700',color:'#fff',marginBottom:'2px'}}>Equipos, maquinaria y capital del proyecto</div>
                <div style={{fontSize:'0.75rem',color:'#8FA3CC'}}>Define los recursos que necesitas y recibe financiamiento por item de inversionistas</div>
              </div>
              <a href={`/proyectos/${proyecto?.id}/workspace/presupuesto`} style={{background:'#4A90D9',color:'#fff',padding:'0.5rem 1.25rem',borderRadius:'8px',textDecoration:'none',fontSize:'0.82rem',fontWeight:'700',whiteSpace:'nowrap'}}>
                💰 Ver presupuesto →
              </a>
            </div>

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
              <a href="/carril" style={{display:'inline-block',fontSize:'0.78rem',color:'#1D9E75',fontWeight:'600',textDecoration:'none'}}>Confirmar trabajo y pagar al especialista →</a>
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

        {tab === 'leasing' && (
          <div style={{ padding: '1.5rem 0' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#AFA9EC', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Contrato de leasing</div>
            <div style={{ fontSize: '0.88rem', color: '#8FA3CC', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Flujo completo de contrato para leasing de maquinaria. Firma digital paso a paso en lenguaje simple.
            </div>
            <a href={'/proyectos/' + proyecto?.id + '/workspace/leasing'} style={{ display: 'inline-block', background: '#AFA9EC', color: '#080F20', borderRadius: '10px', padding: '0.75rem 1.5rem', fontSize: '0.88rem', fontWeight: '700', textDecoration: 'none' }}>
              Abrir flujo de contrato
            </a>
          </div>
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
          descripcion: costo.nombre + ' — financiado como Inversionista',
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
            {esFundador ? 'Define los costos que necesita este proyecto para que el equipo e inversionistas puedan verlos y financiarlos.' : 'El fundador aún no ha definido el presupuesto de este proyecto.'}
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
