'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../../lib/supabase'

const ROL_ABOGADO = ['abogado', 'legal', 'jurídico']
const ROL_CONTADOR = ['contador', 'contable', 'contabilidad', 'tributario']
const SUB_CONSTITUCION = ['constitución', 'constitucion', 'constitución de empresa', 'constitucion de empresa']

function detectarRol(nombreRol, subEsp) {
  const n = (nombreRol || '').toLowerCase()
  const s = (subEsp || '').toLowerCase()
  if (ROL_ABOGADO.some(r => n.includes(r) || s.includes(r))) return 'Abogado'
  if (ROL_CONTADOR.some(r => n.includes(r) || s.includes(r))) return 'Contador'
  const esCon = esConstitucion(n) || esConstitucion(s)
  if (esCon) {
    if (/contador|contable|contabilidad|tributario/.test(n + ' ' + s)) return 'Contador'
    return 'Abogado'
  }
  return null
}

function esConstitucion(subEsp) {
  const s = (subEsp || '').toLowerCase()
  return SUB_CONSTITUCION.some(r => s.includes(r))
}

export default function Constitucion({ params }) {
  const { id: proyectoId } = params
  const [usuario, setUsuario] = useState(null)
  const [proyecto, setProyecto] = useState(null)
  const [rolTipo, setRolTipo] = useState(null)
  const [miRol, setMiRol] = useState(null)
  const [miPostulacion, setMiPostulacion] = useState(null)
  const [tareas, setTareas] = useState([])
  const [contrato, setContrato] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [enviandoMsg, setEnviandoMsg] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      if (!proyectoId) { window.location.href = '/proyectos'; return }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)

      const pRes = await fetch('/api/proyectos/' + proyectoId)
      const pData = await pRes.json()
      const proy = pData.proyecto
      setProyecto(proy)

      const postRes = await fetch('/api/postulaciones?postulante_id=' + user.id + '&proyecto_id=' + proyectoId)
      const postData = await postRes.json()
      const rolesRes = await fetch('/api/roles?proyecto_id=' + proyectoId)
      const rolesData = await rolesRes.json()
      const todosRoles = rolesData.roles || []

      const miPost = (postData.postulaciones || []).find(p =>
        p.estado === 'aceptada' && todosRoles.some(r => r.id === p.rol_id)
      )
      if (!miPost) {
        window.location.href = proyectoId ? '/proyectos/' + proyectoId + '/workspace/tareas' : '/proyectos'
        return
      }

      const rolEncontrado = todosRoles.find(r => r.id === miPost.rol_id)
      if (!proyectoId || proyectoId === 'undefined' || rolEncontrado?.sub_especialidad) {
        window.location.href = proyectoId ? '/proyectos/' + proyectoId + '/workspace/tareas' : '/proyectos'
        return
      }
      const tipoRol = detectarRol(rolEncontrado?.nombre, subEs)

      setMiRol(rolEncontrado)
      setMiPostulacion(miPost)
      setRolTipo(tipoRol)

      // Cargar tareas del país filtradas por rol
      if (proy?.pais && tipoRol) {
        const { data: paisData } = await supabase
          .from('paises_regulatorios')
          .select('tareas')
          .eq('nombre', proy.pais)
          .single()

        const todasTareas = paisData?.tareas || []
        const tareasRol = todasTareas.filter(t => (t.rol_nombre || '').toLowerCase() === (tipoRol || '').toLowerCase())

        // Sincronizar con tareas del proyecto
        const { data: tareasProyecto } = await supabase
          .from('tareas')
          .select('*')
          .eq('proyecto_id', proyectoId)
          .eq('asignado_a', user.id)

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
        setTareas(progresoInicial)
      }

      // Cargar contrato
      const contRes = await fetch('/api/contratos?postulacion_id=' + miPost.id)
      const contData = await contRes.json()
      if (contData.contratos?.length > 0) setContrato(contData.contratos[0])

      // Cargar mensajes
      const { data: msgs } = await supabase
        .from('mensajes')
        .select('*, perfiles:autor_id(nombre)')
        .eq('proyecto_id', proyectoId)
        .order('created_at', { ascending: true })
        .limit(50)
      setMensajes(msgs || [])

      setCargando(false)
    }
    cargar()
  }, [proyectoId])

  async function marcarTarea(idx) {
    const t = tareas[idx]
    const nuevoEstado = t.completada ? 'pendiente' : 'completada'
    if (t.tarea_id) {
      await supabase.from('tareas').update({ estado: nuevoEstado }).eq('id', t.tarea_id)
    } else {
      const { data } = await supabase.from('tareas').insert([{
        proyecto_id: proyectoId,
        nombre: t.nombre,
        estado: nuevoEstado,
        asignado_a: usuario.id,
        creado_por: usuario.id,
        categoria: 'Constitución',
      }]).select().single()
      setTareas(prev => prev.map((x, i) => i === idx ? { ...x, tarea_id: data?.id } : x))
    }
    setTareas(prev => prev.map((x, i) => i === idx ? { ...x, completada: !x.completada } : x))
  }

  async function confirmarFirma() {
    if (!contrato) return
    const esFounder = usuario.id === contrato.fundador_id
    const tipo = esFounder ? 'fundador' : 'profesional'
    const res = await fetch('/api/contratos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: contrato.id, tipo })
    })
    const data = await res.json()
    if (data.contrato) setContrato(data.contrato)
  }

  function descargarContrato() {
    if (!contrato?.contenido_json?.texto_pdf) return
    const blob = new Blob([contrato.contenido_json.texto_pdf], { type: 'text/plain; charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Contrato_${proyecto?.nombre}_${rolTipo}.txt`
    a.click()
    URL.revokeObjectURL(url)
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

  const tareasCompletadas = tareas.filter(t => t.completada).length
  const pct = tareas.length > 0 ? Math.round((tareasCompletadas / tareas.length) * 100) : 0
  const yoFirme = contrato && (usuario?.id === contrato.fundador_id ? contrato.firmado_fundador : contrato.firmado_profesional)

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>Cargando...</div>
  )

  if (!rolTipo) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif',gap:'1rem'}}>
      <div>Este workspace es exclusivo para abogados y contadores asignados a este proyecto.</div>
      <a href={proyectoId ? '/proyectos/' + proyectoId + '/workspace' : '/proyectos'} style={{color:'#1D9E75',textDecoration:'none'}}>← Volver al workspace general</a>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/dashboard" style={{textDecoration:'none'}}><div style={{fontSize:'1.1rem',fontWeight:'900',color:'#fff'}}>Esca<span style={{color:'#1D9E75'}}>la</span></div></a>
        <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
          <span style={{fontSize:'0.8rem',color:'#8FA3CC'}}>{proyecto?.nombre}</span>
          <span style={{fontSize:'0.68rem',fontWeight:'700',padding:'3px 10px',borderRadius:'20px',background: proyecto?.estado_financiacion==='con_recursos'?'rgba(29,158,117,0.15)':'rgba(232,160,32,0.15)',color: proyecto?.estado_financiacion==='con_recursos'?'#1D9E75':'#E8A020'}}>
            {proyecto?.estado_financiacion==='con_recursos'?'Con recursos':'Riesgo compartido'}
          </span>
          <a href={proyectoId ? '/proyectos/'+proyectoId+'/workspace' : '/proyectos'} style={{color:'#8FA3CC',fontSize:'0.78rem',textDecoration:'none'}}>← Workspace</a>
        </div>
      </nav>

      <main style={{maxWidth:'960px',margin:'0 auto',padding:'2rem 1.25rem',display:'grid',gridTemplateColumns:'1fr 320px',gap:'1.5rem',alignItems:'start'}}>
        <div>
          {/* Encabezado */}
          <div style={{marginBottom:'1.5rem'}}>
            <div style={{fontSize:'0.68rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:rolTipo==='abogado'?'#AFA9EC':'#1D9E75',marginBottom:'0.3rem'}}>
              {rolTipo==='abogado'?'Constitución legal':'Constitución contable'} · {proyecto?.pais}
            </div>
            <div style={{fontSize:'clamp(1.2rem,2.5vw,1.6rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>
              {miRol?.nombre}
              {miRol?.sub_especialidad && <span style={{fontSize:'0.9rem',color:'#8FA3CC',fontWeight:'400'}}> — {miRol.sub_especialidad}</span>}
            </div>
            <div style={{fontSize:'0.82rem',color:'#8FA3CC',marginTop:'0.3rem'}}>
              {tareasCompletadas} de {tareas.length} tareas · {pct}% completado
            </div>
          </div>

          {/* Progreso */}
          <div style={{background:'rgba(255,255,255,0.06)',borderRadius:'4px',height:'6px',marginBottom:'1.5rem',overflow:'hidden'}}>
            <div style={{height:'100%',width:pct+'%',background:'#1D9E75',borderRadius:'4px',transition:'width 0.4s ease'}}/>
          </div>

          {/* Contrato */}
          <div style={{background:'rgba(255,255,255,0.04)',border:`1px solid ${contrato?.estado==='vigente'?'rgba(29,158,117,0.3)':'rgba(232,160,32,0.3)'}`,borderRadius:'12px',padding:'1.25rem',marginBottom:'1.25rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
              <div style={{fontSize:'0.82rem',fontWeight:'700',color:'#fff'}}>
                {contrato ? 'Contrato de prestación de servicios' : 'Contrato pendiente de generación'}
              </div>
              {contrato && (
                <span style={{fontSize:'0.65rem',fontWeight:'700',padding:'3px 10px',borderRadius:'20px',background: contrato.estado==='vigente'?'rgba(29,158,117,0.15)':contrato.estado==='firmado_parcial'?'rgba(232,160,32,0.15)':'rgba(255,255,255,0.08)',color: contrato.estado==='vigente'?'#1D9E75':contrato.estado==='firmado_parcial'?'#E8A020':'#8FA3CC'}}>
                  {contrato.estado==='vigente'?'✓ Vigente':contrato.estado==='firmado_parcial'?'Firma parcial':'Pendiente de firma'}
                </span>
              )}
            </div>

            {contrato ? (
              <>
                <div style={{fontSize:'0.75rem',color:'#8FA3CC',marginBottom:'1rem',lineHeight:'1.6'}}>
                  <span style={{color: contrato.firmado_fundador?'#1D9E75':'#8FA3CC'}}>
                    {contrato.firmado_fundador?'✓':'○'} Fundador firmó
                  </span>
                  <span style={{margin:'0 1rem',color:'rgba(255,255,255,0.2)'}}>·</span>
                  <span style={{color: contrato.firmado_profesional?'#1D9E75':'#8FA3CC'}}>
                    {contrato.firmado_profesional?'✓':'○'} {rolTipo==='abogado'?'Abogado':'Contador'} firmó
                  </span>
                </div>
                <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
                  <button onClick={descargarContrato} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.15)',color:'#fff',borderRadius:'8px',padding:'0.5rem 1rem',fontSize:'0.78rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                    ⬇ Descargar contrato
                  </button>
                  {!yoFirme && (
                    <button onClick={confirmarFirma} style={{background:'#1D9E75',border:'none',color:'#fff',borderRadius:'8px',padding:'0.5rem 1rem',fontSize:'0.78rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                      ✓ Confirmar firma física
                    </button>
                  )}
                  {yoFirme && (
                    <span style={{fontSize:'0.78rem',color:'#1D9E75',padding:'0.5rem 0'}}>✓ Ya confirmaste tu firma</span>
                  )}
                </div>
                <div style={{fontSize:'0.7rem',color:'#8FA3CC',marginTop:'0.75rem',lineHeight:'1.5'}}>
                  Descarga el contrato, imprímelo o fírmalo digitalmente, y confirma aquí que ya lo firmaste. El contrato queda vigente cuando ambas partes confirmen.
                </div>
              </>
            ) : (
              <div style={{fontSize:'0.78rem',color:'#8FA3CC'}}>
                El contrato se genera automáticamente cuando el fundador acepta tu postulación. Si ya fuiste aceptado y no aparece, contacta al fundador.
              </div>
            )}
          </div>

          {/* Datos del proyecto */}
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem',marginBottom:'1.25rem'}}>
            <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#8FA3CC',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.875rem'}}>
              {rolTipo==='abogado'?'Datos legales del proyecto':'Datos tributarios del proyecto'}
            </div>
            {[
              ['Nombre', proyecto?.nombre],
              ['Descripción / Objeto social', proyecto?.descripcion],
              ['Ciudad', proyecto?.ciudad],
              ['País', proyecto?.pais],
              ['Sector', proyecto?.sector],
              ['Tipo', proyecto?.tipo==='A'?'Creación — empresa nueva':'Transformación — empresa existente'],
            ].map(([label, val]) => (
              <div key={label} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,0.06)',fontSize:'0.82rem'}}>
                <span style={{color:'#8FA3CC'}}>{label}</span>
                <span style={{color:'#fff',fontWeight:'500',maxWidth:'55%',textAlign:'right'}}>{val||'—'}</span>
              </div>
            ))}
            <div style={{marginTop:'0.75rem',padding:'0.75rem',background:'rgba(232,160,32,0.06)',borderRadius:'8px',fontSize:'0.75rem',color:'#8FA3CC',lineHeight:'1.6'}}>
              Si necesitas información adicional (capital inicial, socios, CIIU), comunícate con el fundador por el chat.
            </div>
          </div>

          {/* Tareas */}
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#8FA3CC',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.875rem'}}>
              Tus tareas — {proyecto?.pais}
            </div>
            {tareas.length===0 ? (
              <div style={{fontSize:'0.82rem',color:'#8FA3CC',padding:'0.5rem 0'}}>
                No hay tareas configuradas para {proyecto?.pais} todavía. El administrador de Escala puede agregarlas desde el panel.
              </div>
            ) : tareas.map((t, i) => (
              <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'0.875rem',padding:'0.875rem 0',borderBottom: i<tareas.length-1?'1px solid rgba(255,255,255,0.06)':'none'}}>
                <button onClick={() => marcarTarea(i)} style={{width:'22px',height:'22px',borderRadius:'50%',border: t.completada?'none':'1.5px solid rgba(255,255,255,0.25)',background: t.completada?'#1D9E75':'transparent',cursor:'pointer',flexShrink:0,marginTop:'2px',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'12px',fontFamily:'Inter,sans-serif'}}>
                  {t.completada?'✓':''}
                </button>
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.88rem',color: t.completada?'#8FA3CC':'#fff',fontWeight:'500',textDecoration: t.completada?'line-through':'none'}}>{t.nombre}</div>
                  {t.entregable && <div style={{fontSize:'0.72rem',color:'#8FA3CC',marginTop:'2px'}}>Entregable: {t.entregable}</div>}
                </div>
                {t.verificada && <span style={{fontSize:'0.65rem',fontWeight:'700',padding:'2px 8px',borderRadius:'12px',background:'rgba(29,158,117,0.15)',color:'#1D9E75',flexShrink:0}}>Verificada</span>}
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          {/* Compensación */}
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#8FA3CC',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.75rem'}}>Tu compensación</div>
            <div style={{fontSize:'1.4rem',fontWeight:'900',color:'#fff',fontFamily:'monospace'}}>
              {miRol?.valor_mercado>0?'$'+Number(miRol.valor_mercado).toLocaleString('es-CO'):'Por acordar'}
            </div>
            <div style={{fontSize:'0.75rem',color:'#8FA3CC',marginTop:'4px'}}>
              {proyecto?.estado_financiacion==='con_recursos'?'Modalidad A — pago en efectivo o acciones al completar':'Modalidad B — deuda diferida o acciones al llegar el evento'}
            </div>
            {proyecto?.estado_financiacion!=='con_recursos' && (
              <div style={{marginTop:'0.875rem',padding:'0.75rem',background:'rgba(232,160,32,0.08)',borderRadius:'8px',fontSize:'0.72rem',color:'#E8A020',lineHeight:'1.6'}}>
                Riesgo real de terminar en $0 si el proyecto no genera valor.
              </div>
            )}
          </div>

          {/* Chat */}
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.25rem'}}>
            <div style={{fontSize:'0.72rem',fontWeight:'700',color:'#8FA3CC',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.875rem'}}>Chat con el fundador</div>
            <div style={{maxHeight:'220px',overflowY:'auto',display:'flex',flexDirection:'column',gap:'6px',marginBottom:'0.75rem'}}>
              {mensajes.length===0 ? (
                <div style={{fontSize:'0.78rem',color:'#8FA3CC'}}>Sin mensajes todavía.</div>
              ) : mensajes.map(m => (
                <div key={m.id} style={{background: m.autor_id===usuario?.id?'rgba(29,158,117,0.12)':'rgba(255,255,255,0.05)',border:`1px solid ${m.autor_id===usuario?.id?'rgba(29,158,117,0.2)':'rgba(255,255,255,0.08)'}`,borderRadius:'8px',padding:'6px 10px',fontSize:'0.78rem',color:'#fff',alignSelf: m.autor_id===usuario?.id?'flex-end':'flex-start',maxWidth:'85%'}}>
                  {m.contenido}
                  <div style={{fontSize:'0.65rem',color:'#8FA3CC',marginTop:'2px'}}>{m.perfiles?.nombre}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:'6px'}}>
              <input value={nuevoMensaje} onChange={e=>setNuevoMensaje(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!enviandoMsg&&enviarMensaje()} placeholder="Escribe un mensaje..." style={{flex:1,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.5rem 0.75rem',color:'#fff',fontSize:'0.78rem',fontFamily:'Inter,sans-serif',outline:'none'}}/>
              <button onClick={enviarMensaje} disabled={enviandoMsg} style={{background:'#1D9E75',border:'none',borderRadius:'8px',padding:'0.5rem 0.75rem',color:'#fff',fontSize:'0.78rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>→</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
