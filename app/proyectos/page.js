'use client'

import { useState, useEffect } from 'react'
import NavApp from '@/components/NavApp'
import { supabase } from '../../lib/supabase'

const sectores = ['Tecnología','Salud','Educación','Agro','Comercio','Servicios','Construcción','Alimentos','Moda','Otro']

const NIVELES_AVANCE = [
  { id: 'tengo_la_idea',      emoji: '💡', label: 'Tengo la idea',      desc: 'Sé qué quiero hacer pero aún no he empezado' },
  { id: 'ya_empece',          emoji: '🔧', label: 'Ya empecé',          desc: 'Tengo algo funcionando, aunque sea pequeño' },
  { id: 'tengo_clientes',     emoji: '🤝', label: 'Tengo clientes',     desc: 'Ya hay personas pagando o usando lo que ofrezco' },
  { id: 'necesito_crecer',    emoji: '📈', label: 'Necesito crecer',    desc: 'El negocio funciona pero me falta capital o equipo' },
  { id: 'quiero_transformar', emoji: '🔄', label: 'Quiero transformar', desc: 'Tengo una empresa y necesito cambiar algo' },
]

const MODALIDADES = [
  { id: 'remoto',     emoji: '🌐', label: 'Remoto' },
  { id: 'presencial', emoji: '📍', label: 'Presencial' },
  { id: 'hibrido',    emoji: '🔀', label: 'Híbrido' },
]

const ROLES_DISPONIBLES = [
  { id: 'Capitalista',    emoji: '💰' },
  { id: 'Cofundador',     emoji: '🤝' },
  { id: 'Desarrollador',  emoji: '💻' },
  { id: 'Diseñador',      emoji: '🎨' },
  { id: 'Contador',       emoji: '📊' },
  { id: 'Abogado',        emoji: '⚖️' },
  { id: 'Marketing',      emoji: '📣' },
  { id: 'Ventas',         emoji: '🎯' },
  { id: 'Otro',           emoji: '➕' },
]
const INDUSTRIAS_LIST = ['Restaurante','Retail','Servicios Profesionales','Tecnología','Comercio Electrónico']
const PAISES_LIST = [
  { nombre: 'Colombia', bandera: '🇨🇴' }, { nombre: 'México', bandera: '🇲🇽' },
  { nombre: 'Perú', bandera: '🇵🇪' }, { nombre: 'Chile', bandera: '🇨🇱' },
  { nombre: 'Argentina', bandera: '🇦🇷' }, { nombre: 'España', bandera: '🇪🇸' },
  { nombre: 'Estados Unidos', bandera: '🇺🇸' },
]

export default function Proyectos() {
  const [usuario, setUsuario] = useState(null)
  const [proyectos, setProyectos] = useState([])
  const [vista, setVista] = useState('lista')
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [eliminando, setEliminando] = useState(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState(null)
  const [proyectosConEquipo, setProyectosConEquipo] = useState({}) // { [id]: true/false }
  const [mensaje, setMensaje] = useState('')
  const [paisesDB, setPaisesDB] = useState([])
  const [nuevoPaisNombre, setNuevoPaisNombre] = useState('')
  const [mostrarNuevoPais, setMostrarNuevoPais] = useState(false)
  const [creandoPais, setCreandoPais] = useState(false)
  const [form, setForm] = useState({
    nombre: '', descripcion: '', tipo: 'A', sector: '', ciudad: '', industria: '', pais: '', estado_financiacion: 'riesgo_compartido', nivel_avance: '', modalidad_trabajo: '', roles_buscados: [], mostrar_guia: false, guia_que: '', guia_problema: '', guia_quien: '', paso: 1, escenario: ''
  })

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)
      const [pRes, paisRes] = await Promise.all([
        fetch('/api/proyectos'),
        fetch('/api/paises')
      ])
      const data = await pRes.json()
      const pData = await paisRes.json()
      const ps = data.proyectos || []
      setProyectos(ps)
      setPaisesDB(pData.paises || [])
      // Para cada proyecto del usuario, verificar si tiene postulaciones aceptadas
      if (user) {
        const miosIds = ps.filter(p => p.fundador_id === user.id).map(p => p.id)
        const checks = await Promise.all(miosIds.map(async pid => {
          try {
            const r = await fetch(`/api/proyectos/${pid}?check_equipo=1&fundador_id=${user.id}`)
            const d = await r.json()
            return [pid, d.tiene_equipo || false]
          } catch { return [pid, false] }
        }))
        setProyectosConEquipo(Object.fromEntries(checks))
      }
      setCargando(false)
    }
    cargar()
  }, [])

  function actualizar(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }))
  }

  function toggleRol(rol) {
    setForm(f => {
      const ya = f.roles_buscados.includes(rol)
      return { ...f, roles_buscados: ya ? f.roles_buscados.filter(r => r !== rol) : [...f.roles_buscados, rol] }
    })
  }

  function mejorarConIA() {
    setForm(f => ({ ...f, mostrar_guia: !f.mostrar_guia }))
  }

  function construirDescripcion() {
    const { guia_que, guia_problema, guia_quien } = form
    if (!guia_que && !guia_problema && !guia_quien) return
    const partes = []
    if (guia_que) partes.push(guia_que.trim())
    if (guia_problema) partes.push('Resuelve ' + guia_problema.trim().replace(/^resuelve\s+/i, ''))
    if (guia_quien) partes.push('Dirigido a ' + guia_quien.trim().replace(/^dirigido a\s+/i, ''))
    const descripcion = partes.join('. ') + '.'
    setForm(f => ({ ...f, descripcion, mostrar_guia: false, guia_que: '', guia_problema: '', guia_quien: '' }))
  }

  async function crearNuevoPais() {
    const nombre = nuevoPaisNombre.trim()
    if (!nombre) { alert('Escribe el nombre del país'); return }
    setCreandoPais(true)
    try {
      const res = await fetch('/api/paises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, bandera: '🌐', tipo_origen: 'fundador', creado_por: usuario?.id, creado_por_nombre: usuario?.user_metadata?.nombre || usuario?.email })
      })
      const data = await res.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setPaisesDB(prev => [...prev.filter(p => p.nombre !== data.pais.nombre), data.pais].sort((a,b) => a.nombre.localeCompare(b.nombre)))
        actualizar('pais', data.pais.nombre)
        setNuevoPaisNombre('')
        setMostrarNuevoPais(false)
      }
    } catch(e) {
      alert('Error de conexión: ' + e.message)
    }
    setCreandoPais(false)
  }

  async function eliminarProyecto(proyectoId) {
    setEliminando(proyectoId)
    try {
      const res = await fetch(`/api/proyectos/${proyectoId}?fundador_id=${usuario.id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.error) {
        if (data.codigo === 'tiene_aceptados') {
          alert('No puedes eliminar este proyecto — ya hay personas aceptadas en algún rol.')
        } else {
          alert('Error: ' + data.error)
        }
      } else {
        setProyectos(prev => prev.filter(p => p.id !== proyectoId))
      }
    } catch (e) {
      alert('Error de conexión: ' + e.message)
    }
    setEliminando(null)
    setConfirmarEliminar(null)
  }

  async function publicar() {
    if (!form.nombre.trim()) {
      setMensaje('El nombre del proyecto es obligatorio')
      return
    }
    if (!form.descripcion.trim()) {
      setMensaje('La descripción es obligatoria — explica qué hace tu proyecto')
      return
    }
    if (form.descripcion.trim().length < 80) {
      setMensaje('La descripción es muy corta. Explica qué hace el proyecto, qué problema resuelve y a quién va dirigido. Mínimo 80 caracteres.')
      return
    }
    if (!form.sector) {
      setMensaje('Selecciona el sector del proyecto')
      return
    }
    if (!form.pais) {
      setMensaje('El país es obligatorio — define dónde opera el proyecto')
      return
    }
    setEnviando(true)
    setMensaje('')

    const res = await fetch('/api/proyectos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, fundador_id: usuario.id, estado: 'activo' })
    })
    const data = await res.json()

    if (data.error) {
      setMensaje('Error: ' + data.error)
    } else {
      const pid = data.proyecto.id

      // Cargar tareas regulatorias por país automáticamente
      if (form.pais) {
        await fetch('/api/tareas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proyecto_id: pid, inicializar_pais: true, pais: form.pais, creado_por: usuario.id })
        })
        // Cargar costos predefinidos por país automáticamente
        await fetch('/api/costos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inicializar_pais: true, proyecto_id: pid, pais: form.pais, creado_por: usuario.id })
        })
      }

      // Cargar tareas comerciales por industria automáticamente
      if (form.industria) {
        await fetch('/api/tareas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proyecto_id: pid, inicializar_industria: true, industria: form.industria, creado_por: usuario.id })
        })
      }

      setProyectos(p => [data.proyecto, ...p])
      setVista('lista')
      setForm({ nombre: '', descripcion: '', tipo: 'A', sector: '', ciudad: '', industria: '', pais: '', estado_financiacion: 'riesgo_compartido', nivel_avance: '', modalidad_trabajo: '', roles_buscados: [], mostrar_guia: false, guia_que: '', guia_problema: '', guia_quien: '', escenario: '' })
    }
    setEnviando(false)
  }

  const s = {
    wrap: { minHeight: '100vh', background: '#0D1B3E', fontFamily: 'Inter, sans-serif' },
    nav: { background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    logo: { fontSize: '1.1rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em' },
    logoSpan: { color: '#1D9E75' },
    navLinks: { display: 'flex', gap: '1.5rem', alignItems: 'center' },
    navLink: { color: '#8FA3CC', fontSize: '0.82rem', textDecoration: 'none', cursor: 'pointer' },
    navLinkAct: { color: '#fff', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none' },
    main: { maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.25rem' },
    header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
    h1: { fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', marginBottom: '0.3rem' },
    sub: { fontSize: '0.85rem', color: '#8FA3CC' },
    btnNew: { background: '#1D9E75', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' },
    form: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '2rem' },
    formTitle: { fontSize: '1.1rem', fontWeight: '800', color: '#fff', marginBottom: '0.3rem' },
    formSub: { fontSize: '0.82rem', color: '#8FA3CC', marginBottom: '2rem' },
    label: { display: 'block', fontSize: '0.72rem', fontWeight: '600', color: '#8FA3CC', marginBottom: '0.4rem', letterSpacing: '0.04em', textTransform: 'uppercase' },
    input: { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '1.25rem', fontFamily: 'Inter, sans-serif' },
    textarea: { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '1.25rem', fontFamily: 'Inter, sans-serif', resize: 'vertical', minHeight: '100px' },
    select: { width: '100%', background: '#1a2a4a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '1.25rem', fontFamily: 'Inter, sans-serif' },
    tipoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' },
    tipoCard: (act) => ({ background: act ? 'rgba(29,158,117,0.15)' : 'rgba(255,255,255,0.04)', border: act ? '2px solid #1D9E75' : '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '1rem', cursor: 'pointer' }),
    tipoLabel: { fontSize: '0.875rem', fontWeight: '700', color: '#fff', marginBottom: '0.2rem' },
    tipoDesc: { fontSize: '0.75rem', color: '#8FA3CC' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    btnRow: { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' },
    btn: { flex: 1, background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.875rem', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
    btnCancel: { background: 'transparent', color: '#8FA3CC', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.875rem 1.5rem', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
    error: { background: 'rgba(216,90,48,0.1)', border: '1px solid rgba(216,90,48,0.3)', borderRadius: '8px', padding: '0.875rem', color: '#D85A30', fontSize: '0.82rem', marginTop: '1rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '1.25rem' },
    card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.2s' },
    cardTop: { background: '#0A1530', padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' },
    cardTipo: { fontSize: '0.62rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '0.5rem' },
    cardNombre: { fontSize: '1rem', fontWeight: '800', color: '#fff', marginBottom: '0.2rem' },
    cardSector: { fontSize: '0.72rem', color: '#8FA3CC' },
    cardBody: { padding: '1.25rem' },
    cardDesc: { fontSize: '0.82rem', color: '#8FA3CC', lineHeight: '1.6', marginBottom: '1rem' },
    cardBadge: { display: 'inline-block', fontSize: '0.68rem', fontWeight: '700', padding: '0.2rem 0.75rem', borderRadius: '20px', background: 'rgba(29,158,117,0.15)', color: '#1D9E75', border: '1px solid rgba(29,158,117,0.3)' },
    empty: { background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '12px', padding: '3rem', textAlign: 'center' },
    emptyIcon: { fontSize: '2.5rem', marginBottom: '1rem' },
    emptyTitle: { fontSize: '1rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' },
    emptyDesc: { fontSize: '0.85rem', color: '#8FA3CC', marginBottom: '1.5rem', lineHeight: '1.6' },
    loading: { minHeight: '100vh', background: '#0D1B3E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8FA3CC', fontFamily: 'Inter, sans-serif' },
  }

  if (cargando) return <div style={s.loading}>Cargando proyectos...</div>

  return (
    <div style={s.wrap}>
      <NavApp paginaActual="proyectos" />

      <main style={s.main}>
        {vista === 'lista' && (
          <>
            <div style={s.header}>
              <div>
                <h1 style={s.h1}>Proyectos en Escala</h1>
                <p style={s.sub}>{proyectos.length} proyecto{proyectos.length !== 1 ? 's' : ''} activo{proyectos.length !== 1 ? 's' : ''}</p>
              </div>
              <button style={s.btnNew} onClick={() => setVista('nuevo')}>+ Publicar proyecto</button>
            </div>

            {proyectos.length === 0 ? (
              <div style={s.empty}>
                <div style={s.emptyIcon}>🚀</div>
                <div style={s.emptyTitle}>Sé el primero en publicar</div>
                <div style={s.emptyDesc}>Aún no hay proyectos en Escala. Publica el tuyo y empieza a formar el equipo.</div>
                <button style={s.btnNew} onClick={() => setVista('nuevo')}>+ Publicar mi proyecto</button>
              </div>
            ) : (
              <div style={s.grid}>
                {proyectos.map(p => (
                  <div key={p.id} style={s.card}>
                    <div style={{...s.cardTop, cursor:'pointer'}} onClick={() => window.location.href="/proyectos/"+p.id}>
                      <div style={s.cardTipo}>Tipo {p.tipo} — {p.tipo === 'A' ? 'Creación' : 'Transformación'}</div>
                      <div style={s.cardNombre}>{p.nombre}</div>
                      <div style={s.cardSector}>{p.sector} · {p.ciudad}</div>
                    </div>
                    <div style={s.cardBody}>
                      <div style={s.cardDesc}>{p.descripcion}</div>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'0.5rem'}}>
                        <span style={s.cardBadge}>● {p.estado}</span>
                        {p.fundador_id === usuario?.id && !proyectosConEquipo[p.id] && (
                          confirmarEliminar === p.id ? (
                            <div style={{display:'flex',gap:'0.4rem',alignItems:'center'}}>
                              <span style={{fontSize:'0.72rem',color:'#E85A20'}}>¿Eliminar?</span>
                              <button onClick={e => { e.stopPropagation(); eliminarProyecto(p.id) }} disabled={eliminando===p.id} style={{background:'#E85A20',color:'#fff',border:'none',borderRadius:'6px',padding:'0.25rem 0.6rem',fontSize:'0.72rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                                {eliminando===p.id ? '...' : 'Sí, eliminar'}
                              </button>
                              <button onClick={e => { e.stopPropagation(); setConfirmarEliminar(null) }} style={{background:'rgba(255,255,255,0.08)',color:'#8FA3CC',border:'none',borderRadius:'6px',padding:'0.25rem 0.6rem',fontSize:'0.72rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button onClick={e => { e.stopPropagation(); setConfirmarEliminar(p.id) }} style={{background:'none',color:'#E85A20',border:'1px solid rgba(232,90,32,0.25)',borderRadius:'6px',padding:'0.25rem 0.6rem',fontSize:'0.72rem',cursor:'pointer',fontFamily:'Inter,sans-serif',opacity:'0.7'}}>
                              Eliminar
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {vista === 'nuevo' && (
          <div style={s.form}>
            {/* Indicador de pasos */}
            <div style={{display:'flex',gap:'0.5rem',alignItems:'center',marginBottom:'1.25rem'}}>
              {[1,2].map(p => (
                <div key={p} style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                  <div style={{width:'28px',height:'28px',borderRadius:'50%',background:form.paso >= p ? '#1D9E75' : 'rgba(255,255,255,0.1)',color:form.paso >= p ? '#fff' : '#8FA3CC',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.78rem',fontWeight:'700'}}>{form.paso > p ? '✓' : p}</div>
                  <span style={{fontSize:'0.75rem',color:form.paso >= p ? '#fff' : '#6B7280',fontWeight:form.paso === p ? '700' : '400'}}>{p === 1 ? 'Lo básico' : 'El equipo'}</span>
                  {p < 2 && <div style={{width:'24px',height:'1px',background:'rgba(255,255,255,0.15)'}}></div>}
                </div>
              ))}
            </div>
            <div style={s.formTitle}>{form.paso === 1 ? 'Cuéntanos sobre tu proyecto' : '¿Qué perfiles necesitas?'}</div>
            <div style={s.formSub}>Define tu proyecto y lo que necesitas. Aparecerá en el directorio para que especialistas y capitalistas puedan postularse.</div>

            <label style={s.label} htmlFor="py-nombre">Nombre del proyecto *</label>
            <input id="py-nombre" style={s.input} value={form.nombre} onChange={e => actualizar('nombre', e.target.value)} placeholder="Ej: VetApp, Ekivibe, POS Restaurantes..." />

            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.4rem'}}>
              <label style={{...s.label,marginBottom:0}} htmlFor="py-descripcion">Descripción *</label>
              <button type="button" onClick={mejorarConIA} style={{background:'rgba(29,158,117,0.15)',border:'1px solid rgba(29,158,117,0.3)',borderRadius:'6px',padding:'0.3rem 0.7rem',fontSize:'0.72rem',fontWeight:'700',color:'#1D9E75',cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap'}}>
                {form.mostrar_guia ? '✕ Cerrar guía' : '✍️ Guía para escribir'}
              </button>
            </div>
            <textarea id="py-descripcion" style={s.textarea} value={form.descripcion} onChange={e => actualizar('descripcion', e.target.value)} placeholder="Ejemplo: VetApp es una plataforma para clínicas veterinarias en Colombia que automatiza la historia clínica de mascotas, recordatorios de vacunas y pagos. Resuelve el caos de los registros en papel que sufren el 80% de las clínicas pequeñas." rows={5} />
            <div style={{fontSize:'0.72rem',marginTop:'-1rem',marginBottom:'1.25rem',display:'flex',justifyContent:'space-between'}}>
              <span style={{color: form.descripcion.length < 80 ? '#E85A20' : '#1D9E75'}}>
                {form.descripcion.length < 80
                  ? `Muy corta — faltan ${80 - form.descripcion.length} caracteres mínimo`
                  : `✓ Buena longitud (${form.descripcion.length} caracteres)`}
              </span>
              <span style={{color:'#8FA3CC'}}>{form.descripcion.length} / 500</span>
            </div>

            {form.mostrar_guia && (
              <div style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'12px',padding:'1.25rem',marginBottom:'1.25rem'}}>
                <div style={{fontSize:'0.78rem',fontWeight:'700',color:'#1D9E75',marginBottom:'1rem'}}>Responde estas 3 preguntas y armamos la descripción por ti:</div>

                <label style={{...s.label}}>¿Qué hace exactamente tu proyecto?</label>
                <input style={{...s.input,marginBottom:'0.75rem'}} value={form.guia_que} onChange={e => actualizar('guia_que', e.target.value)} placeholder='Ej: Vendemos galletas naturales para caballos hechas con ingredientes colombianos' />

                <label style={{...s.label}}>¿Qué problema resuelve?</label>
                <input style={{...s.input,marginBottom:'0.75rem'}} value={form.guia_problema} onChange={e => actualizar('guia_problema', e.target.value)} placeholder='Ej: No hay snacks saludables para caballos en el mercado colombiano' />

                <label style={{...s.label}}>¿A quién va dirigido?</label>
                <input style={{...s.input,marginBottom:'1rem'}} value={form.guia_quien} onChange={e => actualizar('guia_quien', e.target.value)} placeholder='Ej: Dueños de caballos, criaderos y clubes ecuestres' />

                <button type="button" onClick={construirDescripcion} style={{background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.6rem 1.25rem',fontSize:'0.82rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                  Generar descripción →
                </button>
              </div>
            )}

            <label style={s.label}>¿Qué tipo de proyecto vas a publicar? *</label>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.75rem',marginBottom:'1.25rem'}}>
              {[
                {
                  id: 'startup',
                  icon: '💡',
                  titulo: 'Startup o empresa',
                  desc: 'Tienes una idea, un producto digital, un servicio o una empresa que quieres hacer crecer con un equipo.',
                  badge: 'Equity diferido',
                  badgeColor: '#1D9E75',
                },
                {
                  id: 'local_comercial',
                  icon: '🏪',
                  titulo: 'Negocio en un local',
                  desc: 'Quieres montar una tienda, restaurante, frutería, almacén de ropa u otro negocio de venta de productos y necesitas financiar el local.',
                  badge: 'Fondeo Escala',
                  badgeColor: '#4A90D9',
                  destacado: true,
                },
                {
                  id: 'otro',
                  icon: '📦',
                  titulo: 'Otro proyecto',
                  desc: 'Importación, compra de vehículo, maquinaria u otro tipo de proyecto que necesita capital específico.',
                  badge: 'Capital de trabajo',
                  badgeColor: '#E8A020',
                },
              ].map(op => (
                <div
                  key={op.id}
                  onClick={() => actualizar('escenario', op.id)}
                  style={{
                    cursor: 'pointer',
                    border: form.escenario === op.id
                      ? `2px solid ${op.badgeColor}`
                      : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '1rem',
                    background: form.escenario === op.id
                      ? `rgba(${op.id === 'startup' ? '29,158,117' : op.id === 'local_comercial' ? '74,144,217' : '232,160,32'},0.08)`
                      : 'rgba(255,255,255,0.03)',
                    transition: 'all 0.15s',
                    position: 'relative',
                  }}
                >
                  {op.destacado && (
                    <div style={{position:'absolute',top:'-10px',left:'50%',transform:'translateX(-50%)',background:op.badgeColor,color:'#fff',fontSize:'0.6rem',fontWeight:'700',padding:'2px 10px',borderRadius:'20px',whiteSpace:'nowrap'}}>NUEVO</div>
                  )}
                  <div style={{fontSize:'1.75rem',marginBottom:'0.5rem'}}>{op.icon}</div>
                  <div style={{fontSize:'0.88rem',fontWeight:'700',color:'#fff',marginBottom:'0.4rem'}}>{op.titulo}</div>
                  <div style={{fontSize:'0.75rem',color:'#8FA3CC',lineHeight:'1.5',marginBottom:'0.75rem'}}>{op.desc}</div>
                  <span style={{fontSize:'0.65rem',fontWeight:'700',background:`rgba(${op.id === 'startup' ? '29,158,117' : op.id === 'local_comercial' ? '74,144,217' : '232,160,32'},0.15)`,color:op.badgeColor,padding:'2px 8px',borderRadius:'20px'}}>{op.badge}</span>
                </div>
              ))}
            </div>

            {form.escenario === 'local_comercial' && (
              <div style={{background:'rgba(74,144,217,0.08)',border:'1px solid rgba(74,144,217,0.25)',borderRadius:'12px',padding:'1rem 1.25rem',marginBottom:'1.25rem'}}>
                <div style={{fontSize:'0.82rem',fontWeight:'700',color:'#4A90D9',marginBottom:'0.5rem'}}>🏪 Negocio en local — cómo funciona el fondeo</div>
                <div style={{fontSize:'0.78rem',color:'#8FA3CC',lineHeight:'1.6'}}>
                  Escala financia el depósito, el primer arriendo y las adecuaciones del local. Cada día que tengas ventas, pagas primero los intereses del día y luego abonas al capital. Cuando termines de pagar, el negocio es tuyo. El wizard te guía paso a paso — no necesitas saber de finanzas.
                </div>
                <div style={{marginTop:'0.75rem',fontSize:'0.75rem',color:'#4A90D9',fontWeight:'600'}}>
                  Este tipo de proyecto tiene un wizard especial en el siguiente paso →
                </div>
              </div>
            )}

            <label style={s.label}>Tipo de proyecto *</label>
            <div style={s.tipoGrid}>
              <div style={s.tipoCard(form.tipo === 'A')} onClick={() => actualizar('tipo', 'A')}>
                <div style={s.tipoLabel}>Tipo A — Creación</div>
                <div style={s.tipoDesc}>Empresa nueva que busca equipo y capital</div>
              </div>
              <div style={s.tipoCard(form.tipo === 'B')} onClick={() => actualizar('tipo', 'B')}>
                <div style={s.tipoLabel}>Tipo B — Transformación</div>
                <div style={s.tipoDesc}>Empresa existente con una brecha específica</div>
              </div>
            </div>

            <label style={s.label}>¿El proyecto tiene recursos para esta etapa inicial? *</label>
            <div style={s.tipoGrid}>
              <div style={s.tipoCard(form.estado_financiacion === 'con_recursos')} onClick={() => actualizar('estado_financiacion', 'con_recursos')}>
                <div style={s.tipoLabel}>Con Recursos para Etapa Inicial</div>
                <div style={s.tipoDesc}>Hay fondos reales para pagar en efectivo lo que se acuerde con cada especialista</div>
              </div>
              <div style={s.tipoCard(form.estado_financiacion === 'riesgo_compartido')} onClick={() => actualizar('estado_financiacion', 'riesgo_compartido')}>
                <div style={s.tipoLabel}>Riesgo Compartido</div>
                <div style={s.tipoDesc}>Todavía no hay fondos — el pago queda en acciones o como deuda de la empresa, condicionado a que el proyecto genere valor</div>
              </div>
            </div>

            <div style={s.row}>
              <div>
                <label style={s.label} htmlFor="py-sector">Sector *</label>
                <select id="py-sector" style={s.select} value={form.sector} onChange={e => actualizar('sector', e.target.value)}>
                  <option value="">Selecciona...</option>
                  {sectores.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label} htmlFor="py-ciudad">Ciudad</label>
                <input id="py-ciudad" style={s.input} value={form.ciudad} onChange={e => actualizar('ciudad', e.target.value)} placeholder="Medellín, Bogotá..." />
              </div>
            </div>

            <div style={s.row}>
              <div>
                <label style={s.label} htmlFor="py-pais">País del proyecto</label>
                <select id="py-pais" style={s.select} value={form.pais} onChange={e => { if(e.target.value==='__nuevo__'){setMostrarNuevoPais(true)}else{actualizar('pais',e.target.value);setMostrarNuevoPais(false)} }}>
                  <option value="">Selecciona país...</option>
                  {paisesDB.map(p => <option key={p.nombre} value={p.nombre}>{p.bandera||'🌐'} {p.nombre}</option>)}
                  <option value="__nuevo__">+ Mi país no está en la lista</option>
                </select>
                {mostrarNuevoPais && (
                  <div style={{display:'flex',gap:'0.5rem',marginTop:'-0.75rem',marginBottom:'0.75rem'}}>
                    <input type="text" value={nuevoPaisNombre} onChange={e=>setNuevoPaisNombre(e.target.value)} placeholder="Nombre del país (ej: Brasil)" style={{flex:1,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.5rem 0.875rem',color:'#fff',fontSize:'0.82rem',outline:'none',fontFamily:'Inter,sans-serif'}} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); crearNuevoPais(); } }} />
                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); crearNuevoPais(); }} disabled={creandoPais} style={{background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.5rem 1.25rem',fontSize:'0.78rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>{creandoPais?'Creando...':'Agregar país'}</button>
                  </div>
                )}
                {form.pais && form.pais!=='__nuevo__' && <div style={{fontSize:'0.7rem',color:'#1D9E75',marginTop:'-0.5rem',marginBottom:'0.875rem'}}>✓ Se cargarán las tareas regulatorias de {form.pais} al crear</div>}
              </div>
              <div>
                <label style={s.label} htmlFor="py-industria">Industria (opcional)</label>
                <select id="py-industria" style={s.select} value={form.industria} onChange={e => actualizar('industria', e.target.value)}>
                  <option value="">Selecciona industria...</option>
                  {INDUSTRIAS_LIST.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                {form.industria && <div style={{fontSize:'0.7rem',color:'#E8A020',marginTop:'-0.75rem',marginBottom:'0.875rem'}}>✓ Se cargarán las tareas comerciales de {form.industria} al crear</div>}
              </div>
            </div>

            {/* NIVEL DE AVANCE */}
            <label style={s.label}>¿En qué etapa está tu proyecto? *</label>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem',marginBottom:'1.25rem'}}>
              {NIVELES_AVANCE.map(n => (
                <div key={n.id}
                  onClick={() => actualizar('nivel_avance', n.id)}
                  style={{display:'flex',alignItems:'center',gap:'0.875rem',padding:'0.875rem 1rem',borderRadius:'10px',border:`1px solid ${form.nivel_avance === n.id ? '#1D9E75' : 'rgba(255,255,255,0.1)'}`,background:form.nivel_avance === n.id ? 'rgba(29,158,117,0.12)' : 'rgba(255,255,255,0.04)',cursor:'pointer',transition:'all 0.15s'}}>
                  <span style={{fontSize:'1.25rem'}}>{n.emoji}</span>
                  <div>
                    <div style={{fontSize:'0.88rem',fontWeight:'700',color:'#fff'}}>{n.label}</div>
                    <div style={{fontSize:'0.75rem',color:'#8FA3CC'}}>{n.desc}</div>
                  </div>
                  {form.nivel_avance === n.id && <span style={{marginLeft:'auto',color:'#1D9E75',fontSize:'1rem'}}>✓</span>}
                </div>
              ))}
            </div>

            {/* MODALIDAD */}
            <label style={s.label}>Modalidad de trabajo</label>
            <div style={{display:'flex',gap:'0.5rem',marginBottom:'1.25rem',flexWrap:'wrap'}}>
              {MODALIDADES.map(m => (
                <div key={m.id}
                  onClick={() => actualizar('modalidad_trabajo', form.modalidad_trabajo === m.id ? '' : m.id)}
                  style={{flex:1,minWidth:'90px',textAlign:'center',padding:'0.75rem 0.5rem',borderRadius:'10px',border:`1px solid ${form.modalidad_trabajo === m.id ? '#1D9E75' : 'rgba(255,255,255,0.1)'}`,background:form.modalidad_trabajo === m.id ? 'rgba(29,158,117,0.12)' : 'rgba(255,255,255,0.04)',cursor:'pointer',transition:'all 0.15s'}}>
                  <div style={{fontSize:'1.25rem',marginBottom:'0.25rem'}}>{m.emoji}</div>
                  <div style={{fontSize:'0.8rem',fontWeight:'600',color: form.modalidad_trabajo === m.id ? '#1D9E75' : '#fff'}}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* ROLES BUSCADOS */}
            <label style={s.label}>¿Qué perfiles necesitas? (elige los que apliquen)</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:'0.5rem',marginBottom:'1.5rem'}}>
              {ROLES_DISPONIBLES.map(r => {
                const sel = form.roles_buscados.includes(r.id)
                return (
                  <div key={r.id}
                    onClick={() => toggleRol(r.id)}
                    style={{display:'flex',alignItems:'center',gap:'0.4rem',padding:'0.5rem 0.875rem',borderRadius:'20px',border:`1px solid ${sel ? '#1D9E75' : 'rgba(255,255,255,0.12)'}`,background:sel ? 'rgba(29,158,117,0.15)' : 'rgba(255,255,255,0.04)',cursor:'pointer',fontSize:'0.82rem',fontWeight: sel ? '700' : '400',color: sel ? '#1D9E75' : '#C8D4E8',transition:'all 0.15s'}}>
                    <span>{r.emoji}</span> {r.id}
                    {sel && <span style={{fontSize:'0.75rem'}}>✓</span>}
                  </div>
                )
              })}
            </div>

            {mensaje && <div style={s.error}>{mensaje}</div>}

            <div style={s.btnRow}>
              <button style={s.btnCancel} onClick={() => {
                if (form.paso === 2) { actualizar('paso', 1); setMensaje('') }
                else { setVista('lista'); setMensaje('') }
              }}>
                {form.paso === 2 ? '← Atrás' : 'Cancelar'}
              </button>
              {form.paso === 1 ? (
                <button style={s.btn} onClick={() => {
                  if (!form.nombre.trim()) { setMensaje('El nombre del proyecto es obligatorio'); return }
                  if (!form.descripcion.trim() || form.descripcion.trim().length < 80) { setMensaje('La descripción debe tener al menos 80 caracteres'); return }
                  if (!form.sector) { setMensaje('Selecciona el sector del proyecto'); return }
                  setMensaje('')
                  actualizar('paso', 2)
                }}>
                  Siguiente: el equipo →
                </button>
              ) : (
                <button style={s.btn} onClick={publicar} disabled={enviando}>
                  {enviando ? 'Publicando...' : 'Publicar proyecto →'}
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
