'use client'
import { useState } from 'react'

const PROYECTO_ESCALA = 'f31699bd-96b2-4a78-ac6a-08e7a0ad3fbf'
const FUNDADOR_ID = 'a57b6849-1388-4186-8880-2ec31dd31af5'

const GRUPOS = [
  {
    nombre: '🌎 País e Industria',
    tests: [
      {
        id: 'paises_get',
        nombre: 'GET /api/paises — lista países',
        run: async () => {
          const res = await fetch('/api/paises')
          const data = await res.json()
          if (!data.paises || !Array.isArray(data.paises)) throw new Error('No devuelve array de países')
          if (data.paises.length === 0) throw new Error('Lista de países vacía')
          return data.paises.length + ' países encontrados'
        }
      },
      {
        id: 'paises_post',
        nombre: 'POST /api/paises — crear país nuevo',
        run: async () => {
          const nombre = 'QA-Pais-' + Date.now()
          const res = await fetch('/api/paises', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, bandera: '🧪', tipo_origen: 'qa' })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          if (!data.pais || data.pais.nombre !== nombre) throw new Error('No se creó correctamente')
          return 'País "' + nombre + '" creado con ID ' + data.pais.id.slice(0,8)
        }
      },
      {
        id: 'paises_duplicado',
        nombre: 'POST /api/paises — detecta duplicado existente',
        run: async () => {
          const res = await fetch('/api/paises', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: 'Colombia' })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          if (!data.existia) throw new Error('Debería marcar existia=true para Colombia')
          return 'Colombia detectada como existente correctamente'
        }
      },
    ]
  },
  {
    nombre: '🚀 Proyectos',
    tests: [
      {
        id: 'proyectos_get',
        nombre: 'GET /api/proyectos — lista proyectos activos',
        run: async () => {
          const res = await fetch('/api/proyectos')
          const data = await res.json()
          if (!data.proyectos) throw new Error('No devuelve proyectos')
          const todosActivos = data.proyectos.every(p => p.estado === 'activo')
          if (!todosActivos) throw new Error('Hay proyectos con estado distinto a activo en la lista')
          return data.proyectos.length + ' proyectos activos'
        }
      },
      {
        id: 'proyectos_post',
        nombre: 'POST /api/proyectos — crear con estado activo',
        run: async () => {
          const nombre = 'QA-Proyecto-' + Date.now()
          const res = await fetch('/api/proyectos', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, descripcion: 'Test QA automático', tipo: 'A', sector: 'Tecnología', ciudad: 'QA', fundador_id: FUNDADOR_ID, estado: 'activo' })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          if (data.proyecto.estado !== 'activo') throw new Error('Estado quedó como "' + data.proyecto.estado + '" en vez de "activo" — BUG CRÍTICO')
          window._qaProyectoId = data.proyecto.id
          return 'Creado con estado=activo, ID ' + data.proyecto.id.slice(0,8)
        }
      },
      {
        id: 'proyectos_delete',
        nombre: 'DELETE /api/proyectos/[id] — eliminar en cascada',
        run: async () => {
          if (!window._qaProyectoId) throw new Error('Necesita correr "crear proyecto" primero')
          const res = await fetch('/api/proyectos/' + window._qaProyectoId, { method: 'DELETE' })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          return 'Proyecto de prueba eliminado correctamente'
        }
      },
    ]
  },
  {
    nombre: '✅ Tareas',
    tests: [
      {
        id: 'tareas_get',
        nombre: 'GET /api/tareas — lista tareas de ESCALA',
        run: async () => {
          const res = await fetch('/api/tareas?proyecto_id=' + PROYECTO_ESCALA)
          const data = await res.json()
          if (!data.tareas) throw new Error('No devuelve tareas')
          if (!data.plantillas) throw new Error('No devuelve plantillas por rol')
          return data.tareas.length + ' tareas, ' + Object.keys(data.plantillas).length + ' plantillas de rol'
        }
      },
      {
        id: 'tareas_inicializar_pais',
        nombre: 'POST /api/tareas — inicializar por país (Colombia)',
        run: async () => {
          if (!window._qaProyectoIdPais) {
            const nombre = 'QA-Pais-Tareas-' + Date.now()
            const resP = await fetch('/api/proyectos', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ nombre, descripcion: 'QA', tipo: 'A', sector: 'Tecnología', fundador_id: FUNDADOR_ID, estado: 'activo' })
            })
            const dataP = await resP.json()
            window._qaProyectoIdPais = dataP.proyecto.id
          }
          const res = await fetch('/api/tareas', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proyecto_id: window._qaProyectoIdPais, inicializar_pais: true, pais: 'Colombia', creado_por: FUNDADOR_ID })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          if (!data.tareas || data.tareas.length === 0) throw new Error('No se cargaron tareas de Colombia')
          return data.tareas.length + ' tareas regulatorias de Colombia cargadas'
        }
      },
      {
        id: 'tareas_cleanup',
        nombre: 'Limpieza — eliminar proyecto de prueba de tareas',
        run: async () => {
          if (!window._qaProyectoIdPais) return 'Nada que limpiar'
          await fetch('/api/proyectos/' + window._qaProyectoIdPais, { method: 'DELETE' })
          window._qaProyectoIdPais = null
          return 'Limpiado correctamente'
        }
      },
    ]
  },
  {
    nombre: '👤 Usuarios',
    tests: [
      {
        id: 'usuarios_get',
        nombre: 'GET /api/usuarios — obtener perfil fundador',
        run: async () => {
          const res = await fetch('/api/usuarios?id=' + FUNDADOR_ID)
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          if (!data.usuario || !data.usuario.nombre) throw new Error('No devuelve datos del usuario')
          return 'Usuario: ' + data.usuario.nombre
        }
      },
    ]
  },
  {
    nombre: '📋 Roles y Postulaciones',
    tests: [
      {
        id: 'roles_get',
        nombre: 'GET /api/roles — roles de ESCALA',
        run: async () => {
          const res = await fetch('/api/roles?proyecto_id=' + PROYECTO_ESCALA)
          const data = await res.json()
          if (!data.roles) throw new Error('No devuelve roles')
          return data.roles.length + ' roles encontrados'
        }
      },
      {
        id: 'postulaciones_get',
        nombre: 'GET /api/postulaciones — del fundador',
        run: async () => {
          const res = await fetch('/api/postulaciones?postulante_id=' + FUNDADOR_ID)
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          return (data.postulaciones?.length || 0) + ' postulaciones'
        }
      },
    ]
  },
  {
    nombre: '💰 Score, Hitos, Aportes',
    tests: [
      {
        id: 'hitos_get',
        nombre: 'GET /api/hitos — hitos de ESCALA',
        run: async () => {
          const res = await fetch('/api/hitos?proyecto_id=' + PROYECTO_ESCALA)
          const data = await res.json()
          if (!data.hitos) throw new Error('No devuelve hitos')
          return data.hitos.length + ' hitos encontrados'
        }
      },
      {
        id: 'score_post',
        nombre: 'POST /api/score — recalcular score fundador',
        run: async () => {
          const res = await fetch('/api/score', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ perfil_id: FUNDADOR_ID })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          return 'Score recalculado: ' + data.score
        }
      },
    ]
  },
  {
    nombre: '💬 Chat y Email',
    tests: [
      {
        id: 'mensajes_get',
        nombre: 'GET /api/mensajes — chat de ESCALA',
        run: async () => {
          const res = await fetch('/api/mensajes?proyecto_id=' + PROYECTO_ESCALA)
          const data = await res.json()
          if (!data.mensajes && data.mensajes !== null) throw new Error('Respuesta inesperada')
          return (data.mensajes?.length || 0) + ' mensajes en el chat'
        }
      },
    ]
  },
]

export default function QA() {
  const [resultados, setResultados] = useState({})
  const [corriendoTodo, setCorriendoTodo] = useState(false)

  async function correrTest(test) {
    setResultados(prev => ({ ...prev, [test.id]: { estado: 'corriendo' } }))
    try {
      const mensaje = await test.run()
      setResultados(prev => ({ ...prev, [test.id]: { estado: 'ok', mensaje } }))
    } catch (e) {
      setResultados(prev => ({ ...prev, [test.id]: { estado: 'error', mensaje: e.message } }))
    }
  }

  async function correrTodo() {
    setCorriendoTodo(true)
    for (const grupo of GRUPOS) {
      for (const test of grupo.tests) {
        await correrTest(test)
      }
    }
    setCorriendoTodo(false)
  }

  const totalTests = GRUPOS.reduce((s, g) => s + g.tests.length, 0)
  const okCount = Object.values(resultados).filter(r => r.estado === 'ok').length
  const errorCount = Object.values(resultados).filter(r => r.estado === 'error').length

  const colorEstado = { ok: '#1D9E75', error: '#D85A30', corriendo: '#E8A020' }
  const iconoEstado = { ok: '✓', error: '✕', corriendo: '...' }

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif',color:'#fff',padding:'2rem 1.25rem'}}>
      <div style={{maxWidth:'900px',margin:'0 auto'}}>
        <div style={{marginBottom:'2rem'}}>
          <div style={{fontSize:'0.7rem',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:'#1D9E75',marginBottom:'0.4rem'}}>Control de calidad</div>
          <div style={{fontSize:'1.75rem',fontWeight:'900',letterSpacing:'-0.03em',marginBottom:'0.3rem'}}>QA automático de Escala</div>
          <div style={{fontSize:'0.85rem',color:'#8FA3CC'}}>Prueba todas las APIs del sistema sin navegar manualmente. Resultados en tiempo real.</div>
        </div>

        <div style={{display:'flex',gap:'1rem',alignItems:'center',marginBottom:'2rem',flexWrap:'wrap'}}>
          <button onClick={correrTodo} disabled={corriendoTodo} style={{background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.875rem 1.75rem',fontSize:'0.9rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
            {corriendoTodo ? 'Corriendo todas las pruebas...' : '▶ Correr todas las pruebas (' + totalTests + ')'}
          </button>
          {Object.keys(resultados).length > 0 && (
            <div style={{display:'flex',gap:'1rem',fontSize:'0.85rem'}}>
              <span style={{color:'#1D9E75',fontWeight:'700'}}>✓ {okCount} OK</span>
              <span style={{color:'#D85A30',fontWeight:'700'}}>✕ {errorCount} fallos</span>
            </div>
          )}
        </div>

        {GRUPOS.map(grupo => (
          <div key={grupo.nombre} style={{marginBottom:'1.5rem'}}>
            <div style={{fontSize:'0.95rem',fontWeight:'700',color:'#fff',marginBottom:'0.75rem',paddingBottom:'0.5rem',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>{grupo.nombre}</div>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              {grupo.tests.map(test => {
                const r = resultados[test.id]
                return (
                  <div key={test.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'0.875rem 1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem',flexWrap:'wrap'}}>
                    <div style={{flex:1,minWidth:'200px'}}>
                      <div style={{fontSize:'0.82rem',fontWeight:'600',color:'#fff',marginBottom:'0.2rem'}}>{test.nombre}</div>
                      {r && (
                        <div style={{fontSize:'0.72rem',color: r.estado==='error' ? '#D85A30' : '#8FA3CC'}}>{r.mensaje}</div>
                      )}
                    </div>
                    <div style={{display:'flex',gap:'0.75rem',alignItems:'center',flexShrink:0}}>
                      {r && (
                        <span style={{fontSize:'0.78rem',fontWeight:'700',color:colorEstado[r.estado]}}>
                          {iconoEstado[r.estado]} {r.estado === 'corriendo' ? 'Corriendo' : r.estado === 'ok' ? 'OK' : 'Error'}
                        </span>
                      )}
                      <button onClick={() => correrTest(test)} disabled={r?.estado==='corriendo'} style={{background:'rgba(29,158,117,0.1)',color:'#1D9E75',border:'1px solid rgba(29,158,117,0.25)',borderRadius:'6px',padding:'0.35rem 0.875rem',fontSize:'0.72rem',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:'600'}}>
                        {r?.estado === 'corriendo' ? '...' : '▶ Probar'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <div style={{marginTop:'2rem',padding:'1.25rem',background:'rgba(255,255,255,0.04)',borderRadius:'12px',fontSize:'0.78rem',color:'#8FA3CC',lineHeight:'1.6'}}>
          <strong style={{color:'#fff'}}>Nota:</strong> esta página crea y elimina datos de prueba automáticamente para no ensuciar la base de datos real. Los proyectos y países de prueba llevan el prefijo "QA-" y se limpian solos cuando es posible.
        </div>
      </div>
    </div>
  )
}
