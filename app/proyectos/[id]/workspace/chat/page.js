'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../../../lib/supabase'

export default function Chat() {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [proyecto, setProyecto] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [acceso, setAcceso] = useState(false)
  const [cargando, setCargando] = useState(true)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)

      const parts = window.location.pathname.split('/').filter(Boolean)
      const proyectoIndex = parts.indexOf('proyectos')
      const pid = proyectoIndex !== -1 ? parts[proyectoIndex + 1] : null
      if (!pid || pid === 'undefined') { window.location.href = '/proyectos'; return }

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
      const roles = rolesData.roles || []
      const posts = postData.postulaciones || []

      const esFundador = proy?.fundador_id === user.id
      const aceptado = posts.find(p => p.estado === 'aceptada' && roles.some(r => r.id === p.rol_id))

      if (!esFundador && !aceptado) {
        setAcceso(false)
        setCargando(false)
        return
      }

      setAcceso(true)
      setProyecto(proy)
      setPerfil(perfilData.usuario)

      const msgRes = await fetch('/api/mensajes?proyecto_id=' + pid)
      const msgData = await msgRes.json()
      setMensajes(msgData.mensajes || [])
      setCargando(false)
    }
    cargar()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  useEffect(() => {
    if (!proyecto) return
    const pid = proyecto.id

    const channel = supabase
      .channel('mensajes-' + pid)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensajes',
        filter: 'proyecto_id=eq.' + pid
      }, async (payload) => {
        const res = await fetch('/api/mensajes?proyecto_id=' + pid)
        const data = await res.json()
        setMensajes(data.mensajes || [])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [proyecto])

  async function enviar() {
    if (!texto.trim() || enviando) return
    setEnviando(true)
    const contenido = texto.trim()
    setTexto('')

    try {
      const envio = await fetch('/api/mensajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proyecto_id: proyecto.id,
          autor_id: usuario.id,
          contenido
        })
      })
      const envioData = await envio.json()
      if (envioData.error) { alert('No se pudo enviar el mensaje: ' + envioData.error); setTexto(contenido); setEnviando(false); return }

      const res = await fetch('/api/mensajes?proyecto_id=' + proyecto.id)
      const data = await res.json()
      setMensajes(data.mensajes || [])
    } catch (e) {
      alert('No se pudo enviar el mensaje: ' + e.message); setTexto(contenido)
    }
    setEnviando(false)
    inputRef.current?.focus()
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  function formatHora(ts) {
    const d = new Date(ts)
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  }

  function formatFecha(ts) {
    const d = new Date(ts)
    const hoy = new Date()
    const ayer = new Date(hoy)
    ayer.setDate(ayer.getDate() - 1)
    if (d.toDateString() === hoy.toDateString()) return 'Hoy'
    if (d.toDateString() === ayer.toDateString()) return 'Ayer'
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })
  }

  const colores = ['#1D9E75', '#E8A020', '#AFA9EC', '#D85A30', '#4A90D9', '#9B59B6']
  function colorAutor(id) {
    let hash = 0
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
    return colores[Math.abs(hash) % colores.length]
  }

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0B1628',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando chat...
    </div>
  )

  if (!acceso) return (
    <div style={{minHeight:'100vh',background:'#0B1628',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif',gap:'1rem'}}>
      <div style={{fontSize:'2rem'}}>🔒</div>
      <div style={{color:'#fff',fontWeight:'700'}}>Acceso restringido</div>
      <a href="/proyectos" style={{color:'#1D9E75',textDecoration:'none',fontSize:'0.875rem'}}>← Ver proyectos</a>
    </div>
  )

  let ultimaFecha = null

  return (
    <div style={{height:'100vh',background:'#0B1628',fontFamily:'Inter,sans-serif',display:'flex',flexDirection:'column'}}>
      {/* NAV */}
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <a href={'/proyectos/'+proyecto?.id+'/workspace'} style={{color:'#8FA3CC',textDecoration:'none',fontSize:'0.82rem'}}>← Workspace</a>
          <span style={{color:'rgba(255,255,255,0.2)'}}>·</span>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#1D9E75'}}></div>
            <span style={{fontSize:'0.875rem',fontWeight:'700',color:'#fff'}}>{proyecto?.nombre}</span>
            <span style={{fontSize:'0.75rem',color:'#8FA3CC'}}>— Chat del equipo</span>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <a href="/dashboard" style={{color:'#8FA3CC',fontSize:'0.78rem',textDecoration:'none'}}>Dashboard</a>
          <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/registro?modo=login' }} style={{background:'rgba(216,90,48,0.1)',border:'1px solid rgba(216,90,48,0.25)',color:'#D85A30',fontSize:'0.75rem',fontWeight:'600',padding:'0.3rem 0.75rem',borderRadius:'6px',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Salir</button>
        </div>
      </nav>

      {/* MENSAJES */}
      <div style={{flex:1,overflowY:'auto',padding:'1.5rem',display:'flex',flexDirection:'column',gap:'0.25rem'}}>
        {mensajes.length === 0 && (
          <div style={{textAlign:'center',color:'#8FA3CC',fontSize:'0.85rem',margin:'auto',padding:'2rem'}}>
            <div style={{fontSize:'2rem',marginBottom:'0.75rem'}}>💬</div>
            <div style={{fontWeight:'600',color:'#fff',marginBottom:'0.3rem'}}>Bienvenidos al chat del equipo</div>
            <div>Este es el espacio de comunicación para {proyecto?.nombre}. Solo los miembros aceptados pueden escribir aquí.</div>
          </div>
        )}

        {mensajes.map((m, i) => {
          const esMio = m.autor_id === usuario?.id
          const fecha = formatFecha(m.created_at)
          const mostrarFecha = fecha !== ultimaFecha
          ultimaFecha = fecha

          const anterior = mensajes[i - 1]
          const mismoAutor = anterior && anterior.autor_id === m.autor_id && !mostrarFecha
          const color = colorAutor(m.autor_id)

          return (
            <div key={m.id}>
              {mostrarFecha && (
                <div style={{textAlign:'center',margin:'1rem 0 0.5rem',fontSize:'0.72rem',color:'#6B7280',fontWeight:'600'}}>
                  <span style={{background:'rgba(255,255,255,0.06)',padding:'0.2rem 0.75rem',borderRadius:'20px'}}>{fecha}</span>
                </div>
              )}
              <div style={{display:'flex',gap:'0.75rem',alignItems:'flex-end',flexDirection: esMio ? 'row-reverse' : 'row',marginBottom:'2px'}}>
                {!esMio && !mismoAutor ? (
                  <div style={{width:'32px',height:'32px',borderRadius:'50%',background:color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.75rem',fontWeight:'700',color:'#fff',flexShrink:0}}>
                    {(m.perfiles?.nombre || 'U').charAt(0).toUpperCase()}
                  </div>
                ) : !esMio ? (
                  <div style={{width:'32px',flexShrink:0}}></div>
                ) : null}

                <div style={{maxWidth:'70%'}}>
                  {!esMio && !mismoAutor && (
                    <div style={{fontSize:'0.72rem',fontWeight:'700',color:color,marginBottom:'0.2rem',marginLeft:'0.25rem'}}>
                      {m.perfiles?.nombre || 'Usuario'}
                      {m.perfiles?.especialidad ? <span style={{color:'#6B7280',fontWeight:'400'}}> · {m.perfiles.especialidad}</span> : null}
                    </div>
                  )}
                  <div style={{display:'flex',alignItems:'flex-end',gap:'0.4rem',flexDirection: esMio ? 'row-reverse' : 'row'}}>
                    <div style={{background: esMio ? '#1D5E4A' : 'rgba(255,255,255,0.08)',borderRadius: esMio ? '16px 16px 4px 16px' : '16px 16px 16px 4px',padding:'0.6rem 0.875rem',fontSize:'0.875rem',color:'#fff',lineHeight:'1.5',wordBreak:'break-word'}}>
                      {m.contenido}
                    </div>
                    <div style={{fontSize:'0.62rem',color:'#6B7280',flexShrink:0,paddingBottom:'4px'}}>
                      {formatHora(m.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef}></div>
      </div>

      {/* INPUT */}
      <div style={{borderTop:'1px solid rgba(255,255,255,0.08)',padding:'1rem 1.5rem',background:'rgba(255,255,255,0.02)',flexShrink:0}}>
        <div style={{display:'flex',gap:'0.75rem',alignItems:'flex-end',maxWidth:'900px',margin:'0 auto'}}>
          <div style={{width:'32px',height:'32px',borderRadius:'50%',background:colorAutor(usuario?.id||''),display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.75rem',fontWeight:'700',color:'#fff',flexShrink:0}}>
            {(perfil?.nombre||'U').charAt(0).toUpperCase()}
          </div>
          <textarea
            ref={inputRef}
            value={texto}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Escribe un mensaje... (Enter para enviar)"
            rows={1}
            style={{flex:1,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'12px',padding:'0.7rem 1rem',color:'#fff',fontSize:'0.875rem',outline:'none',fontFamily:'Inter,sans-serif',resize:'none',lineHeight:'1.5',maxHeight:'120px'}}
          />
          <button
            onClick={enviar}
            disabled={!texto.trim()||enviando}
            style={{background: texto.trim() ? '#1D9E75' : 'rgba(255,255,255,0.08)',color:'#fff',border:'none',borderRadius:'10px',width:'40px',height:'40px',display:'flex',alignItems:'center',justifyContent:'center',cursor: texto.trim() ? 'pointer' : 'not-allowed',fontSize:'1.1rem',flexShrink:0,transition:'background 0.2s'}}
          >
            {enviando ? '...' : '↑'}
          </button>
        </div>
        <div style={{textAlign:'center',fontSize:'0.65rem',color:'#6B7280',marginTop:'0.4rem'}}>Enter para enviar · Shift+Enter para nueva línea</div>
      </div>
    </div>
  )
}
