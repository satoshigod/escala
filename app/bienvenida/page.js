'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Bienvenida() {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function verificar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro'; return }
      setUsuario(user)

      const res = await fetch('/api/usuarios?id=' + user.id)
      const data = await res.json()
      const perfil = data.usuario

      if (perfil?.rol_principal && perfil?.especialidad) {
        window.location.href = '/dashboard'
      } else {
        setCargando(false)
      }
    }
    verificar()
  }, [])

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando...
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif',display:'flex',alignItems:'center',justifyContent:'center',padding:'1.5rem'}}>
      <div style={{maxWidth:'520px',width:'100%',textAlign:'center'}}>
        <div style={{fontSize:'2.5rem',marginBottom:'1.5rem'}}>👋</div>
        <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.5rem'}}>Bienvenido a Escala</div>
        <h1 style={{fontSize:'clamp(1.5rem,4vw,2rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em',marginBottom:'1rem'}}>Antes de empezar, cuéntanos quién eres</h1>
        <p style={{fontSize:'0.9rem',color:'#8FA3CC',lineHeight:'1.7',marginBottom:'2rem'}}>
          Tu perfil determina cómo te ven los fundadores y qué proyectos aparecen para ti. Solo toma 2 minutos.
        </p>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'2rem',textAlign:'left'}}>
          {[
            { icon: '🔧', titulo: 'Especialista', desc: 'Aportas conocimiento, tiempo o servicios a cambio de participación diferida' },
            { icon: '⚙️', titulo: 'Ejecutor', desc: 'Gestionas proyectos y equipos, liberas al fundador para crecer' },
            { icon: '💰', titulo: 'Capitalista', desc: 'Aportas capital a proyectos con potencial a cambio de equity' },
            { icon: '🌟', titulo: 'Ángel de Impulso', desc: 'Financias hitos específicos sin equity ni devolución' },
          ].map(r => (
            <div key={r.titulo} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'1.1rem'}}>
              <div style={{fontSize:'1.25rem',marginBottom:'0.4rem'}}>{r.icon}</div>
              <div style={{fontSize:'0.82rem',fontWeight:'700',color:'#fff',marginBottom:'0.2rem'}}>{r.titulo}</div>
              <div style={{fontSize:'0.72rem',color:'#8FA3CC',lineHeight:'1.4'}}>{r.desc}</div>
            </div>
          ))}
        </div>

        <a href="/onboarding" style={{display:'block',background:'#1D9E75',color:'#fff',padding:'1rem 2rem',borderRadius:'10px',textDecoration:'none',fontSize:'1rem',fontWeight:'800',marginBottom:'1rem'}}>
          Completar mi perfil →
        </a>
        <a href="/dashboard" style={{display:'block',color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>
          Saltar por ahora y explorar
        </a>
      </div>
    </div>
  )
}
