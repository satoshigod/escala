'use client'
import { useState } from 'react'

export default function TestCategorias() {
  const [nombre, setNombre] = useState('')
  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [paso, setPaso] = useState('')

  async function probar() {
    setCargando(true)
    setResultado(null)
    setPaso('Enviando petición...')

    try {
      const res = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre || 'CategoriaPrueba' + Date.now() })
      })

      setPaso('Respuesta recibida, status: ' + res.status)

      const texto = await res.text()
      setPaso('Texto crudo recibido')

      let data
      try {
        data = JSON.parse(texto)
      } catch (e) {
        setResultado({ error: 'La respuesta no es JSON válido', textoCrudo: texto })
        setCargando(false)
        return
      }

      setResultado(data)
    } catch (e) {
      setResultado({ error: 'Error de red: ' + e.message })
    }
    setCargando(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif',padding:'2rem',color:'#fff'}}>
      <div style={{maxWidth:'600px',margin:'0 auto'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:'800',marginBottom:'0.5rem'}}>Diagnóstico — Crear categoría</h1>
        <p style={{color:'#8FA3CC',marginBottom:'2rem'}}>Prueba directa de /api/categorias sin pasar por el formulario normal.</p>

        <label style={{display:'block',fontSize:'0.8rem',color:'#8FA3CC',marginBottom:'0.5rem'}}>Nombre de la categoría a probar</label>
        <input
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Ej: Logística"
          style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.875rem 1rem',color:'#fff',fontSize:'1rem',outline:'none',boxSizing:'border-box',marginBottom:'1rem'}}
        />

        <button
          onClick={probar}
          disabled={cargando}
          style={{width:'100%',background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'1rem',fontSize:'1rem',fontWeight:'700',cursor:'pointer'}}
        >
          {cargando ? 'Probando...' : 'PROBAR CREAR CATEGORÍA'}
        </button>

        {paso && (
          <div style={{marginTop:'1.5rem',padding:'1rem',background:'rgba(255,255,255,0.05)',borderRadius:'8px',fontSize:'0.85rem',color:'#8FA3CC'}}>
            Estado: {paso}
          </div>
        )}

        {resultado && (
          <div style={{marginTop:'1rem',padding:'1.5rem',background: resultado.error ? 'rgba(216,90,48,0.1)' : 'rgba(29,158,117,0.1)', border: resultado.error ? '1px solid rgba(216,90,48,0.3)' : '1px solid rgba(29,158,117,0.3)', borderRadius:'12px'}}>
            <div style={{fontSize:'0.9rem',fontWeight:'700',marginBottom:'0.75rem',color: resultado.error ? '#D85A30' : '#1D9E75'}}>
              {resultado.error ? '❌ ERROR ENCONTRADO' : '✅ FUNCIONÓ'}
            </div>
            <pre style={{whiteSpace:'pre-wrap',fontSize:'0.8rem',color:'#fff',background:'rgba(0,0,0,0.3)',padding:'1rem',borderRadius:'8px',overflow:'auto'}}>
              {JSON.stringify(resultado, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
