'use client'
import { useState } from 'react'

export default function TestCategorias() {
  const [nombre, setNombre] = useState('')
  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando] = useState(false)

  async function probar() {
    setCargando(true)
    setResultado(null)
    try {
      const res = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre || 'CategoriaPrueba' + Date.now(), creado_por: 'ad384027-ecf6-4254-8e9c-4e07944046ce' })
      })
      const texto = await res.text()
      let data
      try { data = JSON.parse(texto) } catch(e) { data = { error: 'No es JSON', textoCrudo: texto } }
      setResultado({ status: res.status, ...data })
    } catch (e) {
      setResultado({ error: 'Error de red: ' + e.message })
    }
    setCargando(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif',padding:'2rem',color:'#fff'}}>
      <div style={{maxWidth:'600px',margin:'0 auto'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:'800',marginBottom:'1rem'}}>Diagnóstico v2 — creado_por fijo</h1>
        <p style={{color:'#8FA3CC',marginBottom:'1.5rem'}}>Esta prueba manda un UUID real fijo: ad384027-ecf6-4254-8e9c-4e07944046ce</p>
        <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre categoría" style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'8px',padding:'0.875rem 1rem',color:'#fff',fontSize:'1rem',outline:'none',boxSizing:'border-box',marginBottom:'1rem'}} />
        <button onClick={probar} disabled={cargando} style={{width:'100%',background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'1rem',fontSize:'1rem',fontWeight:'700',cursor:'pointer'}}>
          {cargando ? 'Probando...' : 'PROBAR CON CREADO_POR FIJO'}
        </button>
        {resultado && (
          <pre style={{marginTop:'1.5rem',whiteSpace:'pre-wrap',fontSize:'0.85rem',color:'#fff',background:'rgba(0,0,0,0.3)',padding:'1.25rem',borderRadius:'8px',overflow:'auto'}}>
            {JSON.stringify(resultado, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
