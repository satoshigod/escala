'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../../lib/supabase'

const ROL_ABOGADO = ['abogado', 'abogado de constitución', 'abogado constitución', 'legal']
const ROL_CONTADOR = ['contador', 'contador de constitución', 'contador constitución', 'contable', 'contabilidad']

function detectarRol(nombreRol) {
  const n = (nombreRol || '').toLowerCase()
  if (ROL_ABOGADO.some(r => n.includes(r))) return 'abogado'
  if (ROL_CONTADOR.some(r => n.includes(r))) return 'contador'
  return null
}

export default function Constitucion({ params }) {
  const { id: proyectoId } = params
  const [usuario, setUsuario] = useState(null)
  const [proyecto, setProyecto] = useState(null)
  const [rolTipo, setRolTipo] = useState(null) // 'abogado' | 'contador'
  const [miRol, setMiRol] = useState(null)
  const [miPostulacion, setMiPostulacion] = useState(null)
  const [tareasPais, setTareasPais] = useState([])
  const [progreso, setProgreso] = useState([]) // [{nombre, completada, entregable, archivo}]
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')
  const [mensajes, setMensajes] = useState([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [enviandoMsg, setEnviandoMsg] = useState(false)
  const [compensacion, setCompensacion] = useState(null)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)

      // Cargar proyecto con país
      const pRes = await fetch('/api/proyectos/' + proyectoId)
      const pData = await pRes.json()
      const proy = pData.proyecto
      setProyecto(proy)

      // Cargar mis postulaciones para este proyecto
      const postRes = await fetch('/api/postulaciones?postulante_id=' + user.id)
      const postData = await postRes.json()
      const rolesRes = await fetch('/api/roles?proyecto_id=' + proyectoId)
      const rolesData = await rolesRes.json()
      const todosRoles = rolesData.roles || []

      // Encontrar mi rol aceptado en este proyecto
      const miPost = (postData.postulaciones || []).find(p =>
        p.estado === 'aceptada' && todosRoles.some(r => r.id === p.rol_id)
      )
      if (!miPost) { window.location.href = '/proyectos/' + proyectoId + '/workspace'; return }

      const rolEncontrado = todosRoles.find(r => r.id === miPost.rol_id)
      const tipoRol = detectarRol(rolEncontrado?.nombre)

      setMiRol(rolEncontrado)
      setMiPostulacion(miPost)
      setRolTipo(tipoRol)
      setCompensacion(miPost)

      // Cargar tareas del país filtradas por rol
      if (proy?.pais && tipoRol) {
        const paisRes = await supabase
          .from('paises_regulatorios')
          .select('tareas')
          .eq('nombre', proy.pais)
          .single()

        const todasTareas = paisRes.data?.tareas || []
        const tareasRol = todasTareas.filter(t =>
          (t.rol_nombre || '').toLowerCase() === tipoRol
        )
        setTareasPais(tareasRol)

        // Cargar progreso guardado en las tareas del proyecto
        const { data: tareasProyecto } = await supabase
          .from('tareas')
          .select('*')
          .eq('proyecto_id', proyectoId)
          .eq('asignado_a', user.id)

        // Sincronizar tareas del país con tareas del proyecto
        const progresoInicial = tareasRol.map(tp => {
          const existente = (tareasProyecto || []).find(t => t.nombre === tp.nombre)
          return {
            nombre: tp.nombre,
            entregable: tp.entregable || '',
            completada: existente?.estado === 'completada' || existente?.estado === 'verificada',
            verificada: existente?.estado === 'verificada',
            tarea_id: existente?.id || null,
          }
        })
        setProgreso(progresoInicial)
      }

      // Cargar mensajes del chat del proyecto
      const { data: msgs } = await supabase
        .from('mensajes')
        .select('*, perfiles:autor_id(nombre)')
        .eq('proyecto_id', proyectoId)
        .order('created_at', { ascending: true })
        .limit(30)
      setMensajes(msgs || [])

      setCargando(false)
    }
    cargar()
  }, [proyectoId])

  async function marcarTarea(idx) {
    const tarea = progreso[idx]
    const nuevoEstado = tarea.completada ? 'pendiente' : 'completada'

    if (tarea.tarea_id) {
      await supabase.from('tareas').update({ estado: nuevoEstado }).eq('id', tarea.tarea_id)
    } else {
      const { data } = await supabase.from('tareas').insert([{
        proyecto_id: proyectoId,
        nombre: tarea.nombre,
        estado: nuevoEstado,
        asignado_a: usuario.id,
        creado_por: usuario.id,
        categoria: 'Constitución',
      }]).select().single()
      setProgreso(prev => prev.map((t, i) => i === idx ? { ...t, tarea_id: data?.id } : t))
    }

    setProgreso(prev => prev.map((t, i) => i === idx ? { ...t, completada: !t.completada } : t))
  }

  async function enviarMensaje() {
    if (!nuevoMensaje.trim()) return
    setEnviandoMsg(true)
    const { data } = await supabase.from('mensajes').insert([{
      proyecto_id: proyectoId,
      autor_id: usuario.id,
      contenido: nuevoMensaje.trim(),
    }]).select('*, perfiles:autor_id(nombre)').single()
    if (data) setMensajes(prev => [...prev, data])
    setNuevoMensaje('')
    setEnviandoMsg(false)
  }

  const tareasCompletadas = progreso.filter(t => t.completada).length
  const pct = progreso.length > 0 ? Math.round((tareasCompletadas / progreso.length) * 100) : 0
  const modalidadLabel = miPostulacion?.forma_pago === 'acciones' ? 'Convertible en acciones'
    : miPostulacion?.forma_pago === 'pasivo' ? 'Deuda como pasivo'
    : miPostulacion?.origen === 'postulante' ? 'Por definir al completar'
    : 'Por definir al completar'

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando...
    </div>
  )

  if (!rolTipo) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif',gap:'1rem'}}>
      <div>Este workspace de constitución es solo para abogados y contadores.</div>
      <a href={'/proyectos/' + proyectoId + '/workspace'} style={{color:'#1D9E75',textDecoration:'none'}}>← Volver al workspace general</a>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/dashboard" style={{textDecoration:'none'}}><div style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff'}}>Esca<span style={{color:'#1D9E75'}}>la</span></div></a>
        <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
          <span style={{fontSize:'0.8rem',color:'#8FA3CC'}}>{proyecto?.nombre}</span>
          <span style={{fontSize:'0.68rem',fontWeight:'700',padding:'3px 10px',borderRadius:'20px',background: proyecto?.estado_financiacion === 'con_recursos' ? 'rgba(29,158,117,0.15)' : 'rgba(232,160,32,0.15)',color: proyecto?.estado_financiacion === 'con_recursos' ? '#1D9E75' : '#E8A020'}}>
            {proyecto?.estado_financiacion === 'con_recursos' ? 'Con recursos' : 'Riesgo compartido'}
          </span>
          <a href={'/proyectos/' + proyectoId + '/workspace'} style={{color:'#8FA3CC',fontSize:'0.78rem',textDecoration:'none'}}>← Workspace general</a>
        </div>
      </nav>

      <main style={{maxWidth:'960px',margin:'0 auto',padding:'2rem 1.25rem',display:'grid',gridTemplateColumns:'1fr 320px',gap:'1.5rem',alignItems:'start'}}>

        {/* COLUMNA PRINCIPAL */}
        <div>
          {/* Encabezado */}
          <div style={{marginBottom:'1.5rem'}}>
            <div style={{fontSize:'0.68rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color: rolTipo === 'abogado' ? '#AFA9EC' : '#1D9E75',marginBottom:'0.3rem'}}>
              {rolTipo === 'abogado' ? 'Constitución legal' : 'Constitución contable'}
            </div>
            <div style={{fontSize:'clamp(1.2rem,2.5vw,1.6rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>
              {miRol?.nombre || (rolTipo === 'abogado' ? 'Abogado de constitución' : 'Contador de constitución')}
            </div>
            <div style={{fontSize:'0.82rem',color:'#8FA3CC',marginTop:'0.2rem'}}>
              {proyecto?.pais} · {tareasCompletadas} de {progreso.length} tareas completadas
            </div>
          </div>

          {/* Barra de progreso */}
          <div style={{background:'rgba(255,255,255,0.06)',borderRadius:'4px',height:'6px',marginBottom:'1.5rem',overflow:'hidden'}}>
            <div style={{height:'100%',width:pct+'%',background:'#1D9E75',borderRadius:'4px',transition:'width 0.4s ease'}}></div>
          </div>

          {/* Datos que necesitas */}
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem',marginBottom:'1.25rem'}}>
            <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#8FA3CC',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.875rem'}}>
              {rolTipo === 'abogado' ? 'Datos legales del proyecto' : 'Datos tributarios del proyecto'}
            </div>
            {rolTipo === 'abogado' ? (
              <div>
                {[
                  ['Nombre de la empresa', proyecto?.nombre],
                  ['Objeto social', proyecto?.descripcion],
                  ['Ciudad', proyecto?.ciudad],
                  ['País', proyecto?.pais],
                  ['Tipo de proyecto', proyecto?.tipo === 'A' ? 'Creación — empresa nueva' : 'Transformación — empresa existente'],
                ].map(([label, val]) => (
                  <div key={label} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,0.06)',fontSize:'0.82rem'}}>
                    <span style={{color:'#8FA3CC'}}>{label}</span>
                    <span style={{color:'#fff',fontWeight:'500',maxWidth:'55%',textAlign:'right'}}>{val || '—'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {[
                  ['País', proyecto?.pais],
                  ['Sector', proyecto?.sector],
                  ['Ciudad', proyecto?.ciudad],
                  ['Tipo de proyecto', proyecto?.tipo === 'A' ? 'Creación — empresa nueva' : 'Transformación — empresa existente'],
                ].map(([label, val]) => (
                  <div key={label} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,0.06)',fontSize:'0.82rem'}}>
                    <span style={{color:'#8FA3CC'}}>{label}</span>
                    <span style={{color:'#fff',fontWeight:'500'}}>{val || '—'}</span>
                  </div>
                ))}
                <div style={{marginTop:'0.75rem',padding:'0.75rem',background:'rgba(232,160,32,0.08)',borderRadius:'8px',fontSize:'0.78rem',color:'#E8A020'}}>
                  Si necesitas datos adicionales (CIIU, ingresos proyectados, empleados), comunícate con el fundador por el chat.
                </div>
              </div>
            )}
          </div>

          {/* Tareas del país */}
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#8FA3CC',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.875rem'}}>
              Tus tareas — {proyecto?.pais}
            </div>
            {progreso.length === 0 ? (
              <div style={{fontSize:'0.82rem',color:'#8FA3CC',padding:'1rem 0'}}>
                No hay tareas configuradas para {proyecto?.pais} todavía. El administrador de Escala puede agregarlas desde el panel.
              </div>
            ) : (
              progreso.map((t, i) => (
                <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'0.875rem',padding:'0.875rem 0',borderBottom: i < progreso.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none'}}>
                  <button onClick={() => marcarTarea(i)} style={{width:'22px',height:'22px',borderRadius:'50%',border: t.completada ? 'none' : '1.5px solid rgba(255,255,255,0.25)',background: t.completada ? '#1D9E75' : 'transparent',cursor:'pointer',flexShrink:0,marginTop:'2px',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'12px',fontFamily:'Inter,sans-serif'}}>
                    {t.completada ? '✓' : ''}
                  </button>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'0.88rem',color: t.completada ? '#8FA3CC' : '#fff',fontWeight:'500',textDecoration: t.completada ? 'line-through' : 'none'}}>
                      {t.nombre}
                    </div>
                    {t.entregable && (
                      <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'2px'}}>
                        Entregable: {t.entregable}
                      </div>
                    )}
                  </div>
                  {t.verificada && (
                    <span style={{fontSize:'0.65rem',fontWeight:'700',padding:'2px 8px',borderRadius:'12px',background:'rgba(29,158,117,0.15)',color:'#1D9E75',flexShrink:0}}>Verificada</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>

          {/* Compensación */}
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#8FA3CC',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.75rem'}}>Tu compensación</div>
            <div style={{fontSize:'1.4rem',fontWeight:'900',color:'#fff',fontFamily:'monospace'}}>
              {miRol?.valor_mercado ? '$' + Number(miRol.valor_mercado).toLocaleString('es-CO') : 'Por acordar'}
            </div>
            <div style={{fontSize:'0.75rem',color:'#8FA3CC',marginTop:'4px'}}>{modalidadLabel}</div>
            <div style={{marginTop:'0.875rem',padding:'0.75rem',background:'rgba(255,255,255,0.03)',borderRadius:'8px',fontSize:'0.72rem',color:'#8FA3CC',lineHeight:'1.6'}}>
              {proyecto?.estado_financiacion === 'con_recursos'
                ? 'Al completar todas las tareas, el fundador definirá si pagas en efectivo o prefieres acciones.'
                : 'Proyecto en Riesgo Compartido — al completar, acordarán deuda diferida o acciones. Riesgo real de $0 si el proyecto no genera valor.'}
            </div>
          </div>

          {/* Chat con el fundador */}
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#8FA3CC',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.875rem'}}>Chat con el fundador</div>
            <div style={{maxHeight:'220px',overflowY:'auto',display:'flex',flexDirection:'column',gap:'6px',marginBottom:'0.75rem'}}>
              {mensajes.length === 0 ? (
                <div style={{fontSize:'0.78rem',color:'#8FA3CC'}}>Sin mensajes todavía.</div>
              ) : mensajes.map(m => (
                <div key={m.id} style={{
                  background: m.autor_id === usuario?.id ? 'rgba(29,158,117,0.12)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${m.autor_id === usuario?.id ? 'rgba(29,158,117,0.2)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius:'8px',padding:'6px 10px',fontSize:'0.78rem',color:'#fff',
                  alignSelf: m.autor_id === usuario?.id ? 'flex-end' : 'flex-start',
                  maxWidth:'85%',
                }}>
                  {m.contenido}
                  <div style={{fontSize:'0.65rem',color:'#8FA3CC',marginTop:'2px'}}>{m.perfiles?.nombre}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:'6px'}}>
              <input
                value={nuevoMensaje}
                onChange={e => setNuevoMensaje(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !enviandoMsg && enviarMensaje()}
                placeholder="Escribe un mensaje..."
                style={{flex:1,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.5rem 0.75rem',color:'#fff',fontSize:'0.78rem',fontFamily:'Inter,sans-serif',outline:'none'}}
              />
              <button onClick={enviarMensaje} disabled={enviandoMsg} style={{background:'#1D9E75',border:'none',borderRadius:'8px',padding:'0.5rem 0.75rem',color:'#fff',fontSize:'0.78rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
