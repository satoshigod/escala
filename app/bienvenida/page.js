'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const ROLES = [
  { value: 'ideador',      icon: '💡', titulo: 'Fundador',  desc: 'Tengo una idea de negocio' },
  { value: 'especialista', icon: '🔧', titulo: 'Especialista',         desc: 'Tengo conocimiento profesional' },
  { value: 'ejecutor',     icon: '⚙️', titulo: 'Gerente de Proyecto',  desc: 'Sé construir y operar empresas' },
  { value: 'capitalista',  icon: '💰', titulo: 'Inversionista',          desc: 'Tengo capital para invertir' },
  { value: 'mentor',       icon: '🧭', titulo: 'Mentor',               desc: 'Quiero aportar experiencia estratégica' },
  { value: 'empresa',      icon: '🏢', titulo: 'Empresa',              desc: 'Represento una empresa' },
]

export default function Bienvenida() {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [rolSel, setRolSel] = useState(null)

  useEffect(() => {
    async function verificar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/registro?modo=login'; return }
      setUsuario(user)

      const res = await fetch('/api/usuarios?id=' + user.id)
      const data = await res.json()
      const perfil = data.usuario

      if (perfil?.rol_principal && perfil?.especialidad) {
        window.location.href = '/dashboard'
        return
      }
      setCargando(false)
    }
    verificar()
  }, [])

  function continuar() {
    if (rolSel) {
      window.location.href = '/onboarding?rol=' + rolSel
    } else {
      window.location.href = '/onboarding'
    }
  }

  if (cargando) return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',display:'flex',alignItems:'center',justifyContent:'center',color:'#8FA3CC',fontFamily:'Inter,sans-serif'}}>
      Cargando...
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif',display:'flex',alignItems:'center',justifyContent:'center',padding:'1.5rem'}}>
      <div style={{maxWidth:'600px',width:'100%',textAlign:'center'}}>
        <div style={{fontSize:'2.5rem',marginBottom:'1.5rem'}}>👋</div>
        <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.5rem'}}>Bienvenido a Escala</div>
        <h1 style={{fontSize:'clamp(1.4rem,4vw,1.9rem)',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em',marginBottom:'0.75rem'}}>¿Con qué perfil entras a Escala?</h1>
        <p style={{fontSize:'0.875rem',color:'#8FA3CC',lineHeight:'1.7',marginBottom:'1.75rem'}}>
          Selecciona el que mejor te describe. Puedes cambiarlo después desde tu perfil.
        </p>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'1.75rem',textAlign:'left'}}>
          {ROLES.map(r => (
            <div
              key={r.value}
              onClick={() => setRolSel(r.value)}
              style={{
                background: rolSel === r.value ? 'rgba(29,158,117,0.12)' : 'rgba(255,255,255,0.04)',
                border: rolSel === r.value ? '1.5px solid #1D9E75' : '1px solid rgba(255,255,255,0.08)',
                borderRadius:'12px',
                padding:'1rem',
                cursor:'pointer',
                transition:'all 0.15s',
              }}
            >
              <div style={{fontSize:'1.25rem',marginBottom:'0.4rem'}}>{r.icon}</div>
              <div style={{fontSize:'0.82rem',fontWeight:'700',color: rolSel === r.value ? '#1D9E75' : '#fff',marginBottom:'0.2rem'}}>{r.titulo}</div>
              <div style={{fontSize:'0.72rem',color:'#8FA3CC',lineHeight:'1.4'}}>{r.desc}</div>
            </div>
          ))}
        </div>

        <button
          onClick={continuar}
          style={{display:'block',width:'100%',background: rolSel ? '#1D9E75' : 'rgba(29,158,117,0.4)',color:'#fff',padding:'1rem 2rem',borderRadius:'10px',border:'none',fontSize:'1rem',fontWeight:'800',marginBottom:'1rem',cursor: rolSel ? 'pointer' : 'default',fontFamily:'Inter,sans-serif',transition:'background 0.2s'}}
        >
          {rolSel ? 'Completar mi perfil →' : 'Selecciona un perfil para continuar'}
        </button>
        <a href="/dashboard" style={{display:'block',color:'#8FA3CC',fontSize:'0.82rem',textDecoration:'none'}}>
          Saltar por ahora y explorar
        </a>
      </div>
    </div>
  )
}
