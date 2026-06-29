'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'

export default function Workspace() {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [proyecto, setProyecto] = useState(null)
  const [roles, setRoles] = useState([])
  const [hitos, setHitos] = useState([])
  const [aportes, setAportes] = useState([])
  const [postulaciones, setPostulaciones] = useState([])
  const [tab, setTab] = useState('resumen')
  const [cargando, setCargando] = useState(true)
  const [acceso, setAcceso] = useState(false)
  const [actualizando, setActualizando] = useState(null)
  const [nuevoHito, setNuevoHito] = useState('')
  const [creandoHito, setCreandoHito] = useState(false)
  const [nuevoAporte, setNuevoAporte] = useState({ descripcion: '', valor: '', tipo: 'horas' })
  const [registrando, setRegistrando] = useState(false)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro'; return }
      setUsuario(user)

      const pid = window.location.pathname.split('/').slice(-2)[0]

      const [pRes, perfilRes, rolesRes, hitosRes, aportesRes, postRes] = await Promise.all([
        fetch('/api/proyectos/' + pid),
        fetch('/api/usuarios?id=' + user.id),
        fetch('/api/roles?proyecto_id=' + pid),
        fetch('/api/hitos?proyecto_id=' + pid),
        fetch('/api/aportes?proyecto_id=' + pid),
        fetch('/api/postulaciones?postulante_id=' + user.id)
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
        p.estado === 'aceptada' && todosRoles.some(r => r.id === p.rol_id)
      )

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
      setCargando(false)
    }
    cargar()
  }, [])

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

  async function crearHito() {
    if (!nuevoHito.trim()) return
    setCreandoHito(true)
    const pid = window.location.pathname.split('/').slice(-2)[0]
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
    const pid = window.location.pathname.split('/').slice(-2)[0]
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

  const esFundador = proyecto?.fundador_id === usuario?.id
  const misAportes = aportes.filter(a => a.aportante_id === usuario?.id)
  const totalMisAportes = misAportes.reduce((s, a) => s + (a.valor || 0), 0)
  const totalAportes = aportes.reduce((s, a) => s + (a.valor || 0), 0)
  const hitosCompletados = hitos.filter(h => h.completado).length
  const hitosPendientes = hitos.filter(h => !h.completado).length
  const miRol = roles.find(r => postulaciones.some(p => p.rol_id === r.id && p.estado === 'aceptada'))
  const equipo = postulaciones.filter(p => p.estado === 'aceptada' && roles.some(r => r.id === p.rol_id))

  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: '📊' },
    { id: 'hitos', label: 'Hitos', icon: '🎯', badge: hitosPendientes > 0 ? hitosPendientes : null },
    { id: 'equipo', label: 'Equipo', icon: '👥' },
    { id: 'aportes', label: 'Mis aportes', icon: '📋' },
    { id: 'economia', label: 'Economía', icon: '💰' },
  ]

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
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <a href={'/proyectos/'+proyecto?.id+'/workspace/tareas'} style={{fontSize:'0.78rem',fontWeight:'700',color:'#E8A020',textDecoration:'none',background:'rgba(232,160,32,0.1)',padding:'0.3rem 0.875rem',borderRadius:'6px',border:'1px solid rgba(232,160,32,0.25)'}}>📋 Tareas</a>
          <a href={'/proyectos/'+proyecto?.id+'/workspace/chat'} style={{fontSize:'0.78rem',fontWeight:'700',color:'#1D9E75',textDecoration:'none',background:'rgba(29,158,117,0.1)',padding:'0.3rem 0.875rem',borderRadius:'6px',border:'1px solid rgba(29,158,117,0.25)'}}>💬 Chat</a>
          <a href={'/proyectos/' + proyecto?.id} style={{color:'#8FA3CC',fontSize:'0.78rem',textDecoration:'none'}}>Ver proyecto</a>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.78rem',textDecoration:'none'}}>Dashboard</a>
        </div>
      </nav>

      {/* TABS */}
      <div style={{background:'rgba(255,255,255,0.02)',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'0 1.5rem',display:'flex',gap:'0',overflowX:'auto'}}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{background:'none',border:'none',borderBottom: tab===t.id ? '2px solid #1D9E75' : '2px solid transparent',color: tab===t.id ? '#fff' : '#8FA3CC',padding:'0.875rem 1.25rem',fontSize:'0.82rem',fontWeight: tab===t.id ? '700' : '400',cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:'0.4rem',position:'relative'}}>
            {t.icon} {t.label}
            {t.badge && <span style={{background:'#E8A020',color:'#fff',fontSize:'0.6rem',fontWeight:'700',padding:'1px 5px',borderRadius:'10px',minWidth:'16px',textAlign:'center'}}>{t.badge}</span>}
          </button>
        ))}
      </div>

      <main style={{maxWidth:'1000px',margin:'0 auto',padding:'2rem 1.25rem'}}>

        {/* TAB: RESUMEN */}
        {tab === 'resumen' && (
          <div>
            <div style={{marginBottom:'2rem'}}>
              <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.4rem'}}>Workspace del proyecto</div>
              <div style={{fontSize:'clamp(1.3rem,3vw,1.75rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em',marginBottom:'0.3rem'}}>{proyecto?.nombre}</div>
              <div style={{fontSize:'0.82rem',color:'#8FA3CC'}}>{proyecto?.sector} · {proyecto?.ciudad} · {proyecto?.estado}</div>
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
                  <div style={{fontSize:'0.875rem',color:'#fff',fontWeight:'600'}}>{miRol?.modalidad || 'Equity'}</div>
                </div>
                <div>
                  <div style={{fontSize:'0.65rem',fontWeight:'700',color:'#8FA3CC',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:'0.3rem'}}>Valor pactado</div>
                  <div style={{fontSize:'0.875rem',color:'#E8A020',fontWeight:'600'}}>{miRol?.valor_mercado ? '$'+miRol.valor_mercado.toLocaleString()+'/mes' : 'A negociar'}</div>
                </div>
              </div>
            </div>
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

            <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem',marginBottom:'1.5rem'}}>
              <div style={{fontSize:'0.8rem',fontWeight:'700',color:'#fff',marginBottom:'1rem'}}>Los 3 carriles de compensación</div>
              {[
                {id:'A',label:'Carril A — Extraordinario',desc:'El aporte fue excepcional. Te conviertes en socio accionista al precio de mercado completo.',color:'#1D9E75',bg:'rgba(29,158,117,0.08)'},
                {id:'B',label:'Carril B — Normal',desc:'Cumpliste lo esperado. Recibes el 50% del precio pactado más experiencia y red de contactos.',color:'#E8A020',bg:'rgba(232,160,32,0.08)'},
                {id:'C',label:'Carril C — Sales del proyecto',desc:'El equipo decide que no continúas. Recibes el precio de mercado completo en efectivo.',color:'#D85A30',bg:'rgba(216,90,48,0.08)'},
              ].map(c => (
                <div key={c.id} style={{background:c.bg,border:`1px solid ${c.color}30`,borderRadius:'10px',padding:'1rem',marginBottom:'0.75rem'}}>
                  <div style={{fontSize:'0.82rem',fontWeight:'700',color:c.color,marginBottom:'0.25rem'}}>{c.label}</div>
                  <div style={{fontSize:'0.75rem',color:'#8FA3CC',lineHeight:'1.5'}}>{c.desc}</div>
                </div>
              ))}
              <div style={{fontSize:'0.75rem',color:'#8FA3CC',marginTop:'0.875rem',padding:'0.875rem',background:'rgba(255,255,255,0.03)',borderRadius:'8px',lineHeight:'1.6'}}>
                <strong style={{color:'#fff'}}>Regla fundamental:</strong> En ningún escenario pierdes por haber tomado el riesgo. Siempre hay compensación.
              </div>
            </div>

            {esFundador && aportes.length > 0 && (
              <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.5rem'}}>
                <div style={{fontSize:'0.8rem',fontWeight:'700',color:'#fff',marginBottom:'1rem'}}>Aportes del equipo completo</div>
                {aportes.map(a => (
                  <div key={a.id} style={{display:'flex',justifyContent:'space-between',padding:'0.5rem 0',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:'0.78rem'}}>
                    <div>
                      <span style={{color:'#fff'}}>{a.descripcion}</span>
                      <span style={{color:'#6B7280',marginLeft:'0.5rem'}}>· {a.tipo}</span>
                    </div>
                    <span style={{fontFamily:'monospace',color:'#1D9E75',fontWeight:'600'}}>${a.valor?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}
