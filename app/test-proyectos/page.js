'use client'
import { useState } from 'react'

export default function TestProyectos() {
  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando] = useState(false)

  async function probar() {
    setCargando(true)
    setResultado(null)

    try {
      const res = await fetch('/api/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: 'TEST-' + Date.now(),
          descripcion: 'Proyecto de diagnóstico automático',
          tipo: 'A',
          sector: 'Tecnología',
          ciudad: 'Test',
          fundador_id: 'a57b6849-1388-4186-8880-2ec31dd31af5',
          estado: 'activo'
        })
      })

      const status = res.status
      const texto = await res.text()
      let data
      try { data = JSON.parse(texto) } catch(e) { data = { errorParse: texto } }

      setResultado({ status, data })
    } catch (e) {
      setResultado({ error: 'Error de red: ' + e.message })
    }
    setCargando(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif',padding:'2rem',color:'#fff'}}>
      <div style={{maxWidth:'700px',margin:'0 auto'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:'800',marginBottom:'2rem'}}>Diagnóstico — Crear proyecto</h1>

        <button
          onClick={probar}
          disabled={cargando}
          style={{width:'100%',background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'1rem',fontSize:'1rem',fontWeight:'700',cursor:'pointer'}}
        >
          {cargando ? 'Probando...' : 'CREAR PROYECTO DE PRUEBA'}
        </button>

        {resultado && (
          <div style={{marginTop:'1.5rem',padding:'1.5rem',background: resultado.error || resultado.data?.error ? 'rgba(216,90,48,0.1)' : 'rgba(29,158,117,0.1)', border: resultado.error || resultado.data?.error ? '1px solid rgba(216,90,48,0.3)' : '1px solid rgba(29,158,117,0.3)', borderRadius:'12px'}}>
            <pre style={{whiteSpace:'pre-wrap',fontSize:'0.8rem',color:'#fff',background:'rgba(0,0,0,0.3)',padding:'1rem',borderRadius:'8px',overflow:'auto'}}>
              {JSON.stringify(resultado, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
