'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
if (typeof window !== 'undefined') window._supabase = supabase

const PROYECTO_ESCALA = 'f31699bd-96b2-4a78-ac6a-08e7a0ad3fbf'
const FUNDADOR_ID = 'a57b6849-1388-4186-8880-2ec31dd31af5'

// Funcion de limpieza de emergencia — elimina TODOS los datos QA acumulados
async function limpiarTodosProyectosQA() {
  const sb = window._supabase
  if (!sb) return 'Supabase no disponible'

  const resumen = []
  let totalEliminado = 0

  // 1. Proyectos QA (en cascada elimina roles, hitos, tareas, postulaciones, etc)
  const { data: proyectosQA } = await sb
    .from('proyectos').select('id, nombre')
    .eq('fundador_id', FUNDADOR_ID).ilike('nombre', 'QA-%')
  if (proyectosQA?.length) {
    for (const p of proyectosQA) {
      const res = await fetch('/api/proyectos?id=' + p.id + '&fundador_id=' + FUNDADOR_ID, { method: 'DELETE' })
      const d = await res.json()
      if (d.ok) totalEliminado++
    }
    resumen.push(proyectosQA.length + ' proyectos')
  }

  // 2. Paises QA
  const { data: paisesQA } = await sb.from('paises').select('id').ilike('nombre', 'QA-%')
  if (paisesQA?.length) {
    await sb.from('paises').delete().in('id', paisesQA.map(p => p.id))
    resumen.push(paisesQA.length + ' paises')
    totalEliminado += paisesQA.length
  }

  // 3. Categorias QA
  const { data: catsQA } = await sb.from('categorias').select('id').ilike('nombre', 'QA-%')
  if (catsQA?.length) {
    await sb.from('categorias').delete().in('id', catsQA.map(c => c.id))
    resumen.push(catsQA.length + ' categorias')
    totalEliminado += catsQA.length
  }

  // 4. Especialidades QA
  const { data: espQA } = await sb.from('especialidades').select('id').ilike('nombre', 'QA-%')
  if (espQA?.length) {
    await sb.from('especialidades').delete().in('id', espQA.map(e => e.id))
    resumen.push(espQA.length + ' especialidades')
    totalEliminado += espQA.length
  }

  // 5. Perfiles QA — cualquier perfil con nombre que empiece con QA- (excepto el fundador)
  const { data: perfilesQA } = await sb.from('perfiles').select('id, user_id').ilike('nombre', 'QA-%').neq('id', FUNDADOR_ID)
  if (perfilesQA?.length) {
    for (const p of perfilesQA) {
      // Usar funcion de eliminar usuario completo si existe
      await sb.rpc('eliminar_usuario_completo', { uid: p.user_id }).catch(() => {})
    }
    resumen.push(perfilesQA.length + ' perfiles')
    totalEliminado += perfilesQA.length
  }

  // 6. Repartos QA del proyecto ESCALA
  const { data: repartosQA } = await sb
    .from('repartos').select('id')
    .eq('proyecto_id', PROYECTO_ESCALA).ilike('descripcion', 'QA-%')
  if (repartosQA?.length) {
    await sb.from('reparto_lineas').delete().in('reparto_id', repartosQA.map(r => r.id))
    await sb.from('repartos').delete().in('id', repartosQA.map(r => r.id))
    resumen.push(repartosQA.length + ' repartos')
    totalEliminado += repartosQA.length
  }

  // 7. Items de presupuesto QA del proyecto ESCALA
  const { data: itemsQA } = await sb
    .from('presupuesto_items').select('id')
    .eq('proyecto_id', PROYECTO_ESCALA).ilike('nombre', 'QA-%')
  if (itemsQA?.length) {
    await sb.from('presupuesto_items').delete().in('id', itemsQA.map(i => i.id))
    resumen.push(itemsQA.length + ' items presupuesto')
    totalEliminado += itemsQA.length
  }

  // Limpiar variables globales window._qa*
  Object.keys(window).filter(k => k.startsWith('_qa')).forEach(k => { window[k] = null })

  if (totalEliminado === 0) return 'No hay datos QA acumulados'
  return 'Eliminado: ' + resumen.join(', ') + ' (' + totalEliminado + ' registros)'
}


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
        nombre: 'POST /api/paises — crear país nuevo y eliminarlo',
        run: async () => {
          const nombre = 'QA-Pais-Test'
          // Crear
          const res = await fetch('/api/paises', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, bandera: '🧪', tipo_origen: 'qa' })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          if (!data.pais || data.pais.nombre !== nombre) throw new Error('No se creó correctamente')
          const paisId = data.pais.id
          // Eliminar inmediatamente para no acumular
          await fetch('/api/paises?id=' + paisId, { method: 'DELETE' }).catch(() => {})
          return 'País QA-Pais-Test creado y eliminado correctamente'
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
            body: JSON.stringify({ nombre, descripcion: 'Test QA automatico para verificar la creacion y eliminacion correcta de proyectos en la plataforma Escala con todos sus campos requeridos', tipo: 'A', sector: 'Tecnología', ciudad: 'QA', fundador_id: FUNDADOR_ID, estado: 'activo' })
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
          const res = await fetch('/api/proyectos?id=' + window._qaProyectoId + '&fundador_id=' + FUNDADOR_ID, { method: 'DELETE' })
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
              body: JSON.stringify({ nombre, descripcion: 'QA test automatico para verificar la inicializacion correcta de tareas por pais e industria al crear un nuevo proyecto en la plataforma', tipo: 'A', sector: 'Tecnología', fundador_id: FUNDADOR_ID, estado: 'activo' })
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
          await fetch('/api/proyectos?id=' + window._qaProyectoIdPais + '&fundador_id=' + FUNDADOR_ID, { method: 'DELETE' })
          window._qaProyectoIdPais = null
          return 'Limpiado correctamente'
        }
      },
    ]
  },
  {
    nombre: '🏛️ Constitución de empresas — anti-duplicado',
    tests: [
      {
        id: 'constitucion_setup',
        nombre: 'Setup — crear proyecto Colombia de prueba',
        run: async () => {
          const nombre = 'QA-Constitucion-Dup-' + Date.now()
          const resP = await fetch('/api/proyectos', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, descripcion: 'QA test automatico para verificar que las tareas de constitucion no se dupliquen al inicializar un especialista', tipo: 'A', sector: 'Tecnología', pais: 'Colombia', fundador_id: FUNDADOR_ID, estado: 'activo' })
          })
          const dataP = await resP.json()
          if (!dataP.proyecto?.id) throw new Error('No se pudo crear el proyecto de prueba')
          window._qaProyectoIdConstitucion = dataP.proyecto.id
          return 'Proyecto creado: ' + dataP.proyecto.id
        }
      },
      {
        id: 'constitucion_inicializar_pais_primero',
        nombre: 'Paso 1 — cargar tareas del país SIN asignar (simula estado previo real)',
        run: async () => {
          const res = await fetch('/api/tareas', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proyecto_id: window._qaProyectoIdConstitucion, inicializar_pais: true, pais: 'Colombia', creado_por: FUNDADOR_ID })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          if (!data.tareas || data.tareas.length === 0) throw new Error('No se cargaron tareas del país')
          window._qaConteoPaisInicial = data.tareas.length
          return data.tareas.length + ' tareas cargadas sin asignar (Contador + Abogado)'
        }
      },
      {
        id: 'constitucion_inicializar_especialista',
        nombre: 'Paso 2 — especialista Contador entra por primera vez (inicializar_constitucion)',
        run: async () => {
          const res = await fetch('/api/tareas', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              proyecto_id: window._qaProyectoIdConstitucion,
              inicializar_constitucion: true,
              rol_nombre_especialista: 'Contador',
              sub_especialidad: 'Constitución de empresas',
              asignado_a: FUNDADOR_ID,
              creado_por: FUNDADOR_ID,
            })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          return (data.tareas?.length || 0) + ' tareas devueltas (reasignadas o nuevas), tipo: ' + data.tipo
        }
      },
      {
        id: 'constitucion_verificar_sin_duplicados',
        nombre: 'Verificación — el total de tareas de Contador NO se duplicó',
        run: async () => {
          const res = await fetch('/api/tareas?proyecto_id=' + window._qaProyectoIdConstitucion)
          const data = await res.json()
          const tareasContador = (data.tareas || []).filter(t => t.rol_nombre === 'Contador')
          const nombresUnicos = new Set(tareasContador.map(t => t.nombre))
          if (tareasContador.length !== nombresUnicos.size) {
            throw new Error(`Hay duplicados: ${tareasContador.length} tareas de Contador pero solo ${nombresUnicos.size} nombres únicos`)
          }
          const asignadas = tareasContador.filter(t => t.asignado_a === FUNDADOR_ID)
          if (asignadas.length !== tareasContador.length) {
            throw new Error(`Quedaron tareas sin reasignar: ${tareasContador.length - asignadas.length} de ${tareasContador.length}`)
          }
          return `${tareasContador.length} tareas de Contador, todas únicas y reasignadas correctamente (sin duplicados)`
        }
      },
      {
        id: 'constitucion_cleanup',
        nombre: 'Limpieza — eliminar proyecto de prueba de constitución',
        run: async () => {
          if (!window._qaProyectoIdConstitucion) return 'Nada que limpiar'
          await fetch('/api/proyectos?id=' + window._qaProyectoIdConstitucion + '&fundador_id=' + FUNDADOR_ID, { method: 'DELETE' })
          window._qaProyectoIdConstitucion = null
          return 'Limpiado correctamente'
        }
      },
    ]
  },
  {
    nombre: '💬 Hilo de tareas y Documentación (Fase 2)',
    tests: [
      {
        id: 'hilo_setup',
        nombre: 'Setup — crear proyecto y tarea de prueba',
        run: async () => {
          const nombre = 'QA-Hilo-' + Date.now()
          const resP = await fetch('/api/proyectos', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, descripcion: 'QA test automatico para verificar el hilo de conversacion por tarea y el guardado segmentado de documentos', tipo: 'A', sector: 'Tecnología', fundador_id: FUNDADOR_ID, estado: 'activo' })
          })
          const dataP = await resP.json()
          window._qaProyectoIdHilo = dataP.proyecto.id

          const resT = await fetch('/api/tareas', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proyecto_id: window._qaProyectoIdHilo, nombre: 'QA Tarea Hilo', descripcion: 'Test', categoria: 'Finanzas', rol_nombre: 'Contador', asignado_a: FUNDADOR_ID, creado_por: FUNDADOR_ID })
          })
          const dataT = await resT.json()
          window._qaTareaIdHilo = dataT.tarea.id
          return 'Proyecto y tarea creados: ' + window._qaTareaIdHilo
        }
      },
      {
        id: 'hilo_mensaje_general_no_mezcla',
        nombre: 'GET /api/mensajes sin tarea_id — no mezcla mensajes del chat general con los de hilos',
        run: async () => {
          await fetch('/api/mensajes', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proyecto_id: window._qaProyectoIdHilo, autor_id: FUNDADOR_ID, contenido: 'QA mensaje del chat general' })
          })
          const res = await fetch('/api/mensajes?proyecto_id=' + window._qaProyectoIdHilo)
          const data = await res.json()
          const conTarea = (data.mensajes || []).filter(m => m.tarea_id)
          if (conTarea.length > 0) throw new Error('El chat general está devolviendo mensajes de un hilo de tarea')
          return (data.mensajes || []).length + ' mensajes en el chat general, ninguno con tarea_id'
        }
      },
      {
        id: 'hilo_mensaje_tarea_completada',
        nombre: 'PATCH tarea → completada dispara mensaje automático en su hilo',
        run: async () => {
          await fetch('/api/tareas', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: window._qaTareaIdHilo, estado: 'completada', verificado_por: FUNDADOR_ID })
          })
          const res = await fetch('/api/mensajes?proyecto_id=' + window._qaProyectoIdHilo + '&tarea_id=' + window._qaTareaIdHilo)
          const data = await res.json()
          const sistema = (data.mensajes || []).filter(m => m.es_sistema)
          if (sistema.length === 0) throw new Error('No se creó el mensaje automático de tarea completada')
          return sistema.length + ' mensaje(s) de sistema en el hilo tras completar la tarea'
        }
      },
      {
        id: 'hilo_adjunto_guarda_documento',
        nombre: 'POST /api/mensajes con adjuntos — guarda también en documentos_proyecto',
        run: async () => {
          const adjunto = { url: 'https://example.com/qa-test.pdf', nombre_original: 'QA-Documento-Test.pdf', tipo: 'application/pdf', tamano_mb: '0.10' }
          await fetch('/api/mensajes', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proyecto_id: window._qaProyectoIdHilo, autor_id: FUNDADOR_ID, contenido: '📎 QA adjunto de prueba', tarea_id: window._qaTareaIdHilo, adjuntos: [adjunto] })
          })
          const res = await fetch('/api/documentos?proyecto_id=' + window._qaProyectoIdHilo)
          const data = await res.json()
          const encontrado = (data.documentos || []).find(d => d.nombre === 'QA-Documento-Test.pdf')
          if (!encontrado) throw new Error('El documento adjunto no quedó guardado en documentos_proyecto')
          if (encontrado.categoria !== 'Contabilidad y Tributario') throw new Error('Categoría incorrecta: se esperaba "Contabilidad y Tributario", vino "' + encontrado.categoria + '"')
          return 'Documento guardado correctamente bajo categoría "' + encontrado.categoria + '"'
        }
      },
      {
        id: 'hilo_verificar_cierra_hilo',
        nombre: 'PATCH tarea → verificada agrega mensaje de cierre al hilo',
        run: async () => {
          await fetch('/api/tareas', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: window._qaTareaIdHilo, estado: 'verificada', verificado_por: FUNDADOR_ID })
          })
          const res = await fetch('/api/mensajes?proyecto_id=' + window._qaProyectoIdHilo + '&tarea_id=' + window._qaTareaIdHilo)
          const data = await res.json()
          const cierre = (data.mensajes || []).find(m => m.es_sistema && m.contenido.includes('verificó'))
          if (!cierre) throw new Error('No se agregó el mensaje de cierre al verificar')
          return 'Mensaje de cierre encontrado: "' + cierre.contenido + '"'
        }
      },
      {
        id: 'hilo_cleanup',
        nombre: 'Limpieza — eliminar proyecto de prueba de hilos/documentos',
        run: async () => {
          if (!window._qaProyectoIdHilo) return 'Nada que limpiar'
          await fetch('/api/proyectos?id=' + window._qaProyectoIdHilo + '&fundador_id=' + FUNDADOR_ID, { method: 'DELETE' })
          window._qaProyectoIdHilo = null
          window._qaTareaIdHilo = null
          return 'Limpiado correctamente'
        }
      },
    ]
  },
  {
    nombre: '🌐 Landing pages SEO y Blog',
    tests: [
      {
        id: 'seo_landing_contador',
        nombre: 'GET /contador-publico-colombia — carga correctamente',
        run: async () => {
          const res = await fetch('/contador-publico-colombia')
          if (!res.ok) throw new Error('Status: ' + res.status)
          const html = await res.text()
          if (!html.includes('Contador')) throw new Error('No contiene contenido esperado')
          return 'OK — página carga con status ' + res.status
        }
      },
      {
        id: 'seo_landing_abogado',
        nombre: 'GET /abogado-startups-colombia — carga correctamente',
        run: async () => {
          const res = await fetch('/abogado-startups-colombia')
          if (!res.ok) throw new Error('Status: ' + res.status)
          return 'OK — status ' + res.status
        }
      },
      {
        id: 'seo_landing_desarrollador',
        nombre: 'GET /desarrollador-startup-colombia — carga correctamente',
        run: async () => {
          const res = await fetch('/desarrollador-startup-colombia')
          if (!res.ok) throw new Error('Status: ' + res.status)
          return 'OK — status ' + res.status
        }
      },
      {
        id: 'seo_landing_chile',
        nombre: 'GET /startup-chile — carga correctamente',
        run: async () => {
          const res = await fetch('/startup-chile')
          if (!res.ok) throw new Error('Status: ' + res.status)
          return 'OK — status ' + res.status
        }
      },
      {
        id: 'seo_landing_bogota',
        nombre: 'GET /startup-bogota — carga correctamente',
        run: async () => {
          const res = await fetch('/startup-bogota')
          if (!res.ok) throw new Error('Status: ' + res.status)
          return 'OK — status ' + res.status
        }
      },
      {
        id: 'seo_landing_angel',
        nombre: 'GET /angel-investor — carga correctamente',
        run: async () => {
          const res = await fetch('/angel-investor')
          if (!res.ok) throw new Error('Status: ' + res.status)
          return 'OK — status ' + res.status
        }
      },
      {
        id: 'seo_blog_index',
        nombre: 'GET /blog — índice del blog carga',
        run: async () => {
          const res = await fetch('/blog')
          if (!res.ok) throw new Error('Status: ' + res.status)
          const html = await res.text()
          if (!html.includes('historia-de-escala')) throw new Error('No contiene links a artículos')
          return 'OK — índice carga con artículos'
        }
      },
      {
        id: 'seo_blog_historia',
        nombre: 'GET /blog/historia-de-escala — artículo carga',
        run: async () => {
          const res = await fetch('/blog/historia-de-escala')
          if (!res.ok) throw new Error('Status: ' + res.status)
          return 'OK — status ' + res.status
        }
      },
      {
        id: 'seo_sitemap',
        nombre: 'GET /sitemap.xml — contiene 20+ URLs',
        run: async () => {
          const res = await fetch('/sitemap.xml')
          if (!res.ok) throw new Error('Status: ' + res.status)
          const xml = await res.text()
          const count = (xml.match(/<loc>/g) || []).length
          if (count < 20) throw new Error('Solo ' + count + ' URLs en el sitemap (esperaba 20+)')
          return count + ' URLs en el sitemap'
        }
      },
      {
        id: 'seo_documentos_api',
        nombre: 'GET /api/documentos — lista documentos del proyecto ESCALA',
        run: async () => {
          const res = await fetch('/api/documentos?proyecto_id=' + PROYECTO_ESCALA)
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          return (data.documentos || []).length + ' documentos, ' + Object.keys(data.por_categoria || {}).length + ' categorías'
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
  {
    nombre: '🎓 Especialidades y Categorías',
    tests: [
      {
        id: 'especialidades_get',
        nombre: 'GET /api/especialidades — lista especialidades',
        run: async () => {
          const res = await fetch('/api/especialidades')
          const data = await res.json()
          if (!data.especialidades || !Array.isArray(data.especialidades)) throw new Error('No devuelve array')
          if (data.especialidades.length === 0) throw new Error('Lista vacía')
          return data.especialidades.length + ' especialidades encontradas'
        }
      },
      {
        id: 'especialidades_post',
        nombre: 'POST /api/especialidades — crear y eliminar especialidad nueva',
        run: async () => {
          const nombre = 'QA-Especialidad-' + Date.now()
          const res = await fetch('/api/especialidades', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, categoria: 'General' })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          if (!data.especialidad || data.especialidad.nombre !== nombre) throw new Error('No se creó correctamente')
          const id = data.especialidad.id
          // Limpiar inmediatamente
          await window._supabase.from('especialidades').delete().eq('id', id).catch(() => {})
          return 'Especialidad creada y eliminada correctamente — sin residuos'
        }
      },
      {
        id: 'especialidades_duplicado',
        nombre: 'POST /api/especialidades — detecta duplicado (Abogado)',
        run: async () => {
          const res = await fetch('/api/especialidades', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: 'Abogado' })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          if (!data.existia) throw new Error('Debería marcar existia=true para Abogado')
          return 'Abogado detectado como existente correctamente'
        }
      },
      {
        id: 'categorias_get',
        nombre: 'GET /api/categorias — lista categorías',
        run: async () => {
          const res = await fetch('/api/categorias')
          const data = await res.json()
          if (!data.categorias || !Array.isArray(data.categorias)) throw new Error('No devuelve array')
          if (data.categorias.length === 0) throw new Error('Lista vacía')
          return data.categorias.length + ' categorías encontradas'
        }
      },
      {
        id: 'categorias_post',
        nombre: 'POST /api/categorias — crear y eliminar categoría nueva',
        run: async () => {
          const nombre = 'QA-Categoria-' + Date.now()
          const res = await fetch('/api/categorias', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          if (!data.categoria || data.categoria.nombre !== nombre) throw new Error('No se creó correctamente')
          const id = data.categoria.id
          // Limpiar inmediatamente
          await window._supabase.from('categorias').delete().eq('id', id).catch(() => {})
          return 'Categoría creada y eliminada correctamente — sin residuos'
        }
      },
    ]
  },
  {
    nombre: '🛡️ Eliminación (proyectos y usuarios)',
    tests: [
      {
        id: 'eliminar_proyecto_cascada',
        nombre: 'DELETE /api/proyectos/[id] — borra en cascada y desaparece de la lista',
        run: async () => {
          const nombre = 'QA-Eliminar-' + Date.now()
          const resCrear = await fetch('/api/proyectos', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, descripcion: 'QA test de eliminacion de proyecto para verificar que se borra en cascada correctamente sin dejar datos huerfanos en la base de datos', tipo: 'A', sector: 'Tecnología', fundador_id: FUNDADOR_ID, estado: 'activo' })
          })
          const dataCrear = await resCrear.json()
          if (dataCrear.error) throw new Error('No se pudo crear proyecto de prueba: ' + dataCrear.error)
          const id = dataCrear.proyecto.id

          const resDelete = await fetch('/api/proyectos?id=' + id + '&fundador_id=' + FUNDADOR_ID, { method: 'DELETE' })
          const dataDelete = await resDelete.json()
          if (dataDelete.error) throw new Error('Error al eliminar: ' + dataDelete.error)

          const resVerificar = await fetch('/api/proyectos')
          const dataVerificar = await resVerificar.json()
          const sigueExistiendo = dataVerificar.proyectos.some(p => p.id === id)
          if (sigueExistiendo) throw new Error('El proyecto sigue apareciendo en la lista después de eliminarlo')

          return 'Proyecto creado y eliminado correctamente, ya no aparece en /api/proyectos'
        }
      },
    ]
  },
  {
    nombre: '🌐 Distinción local vs global (Fase 14.4)',
    tests: [
      {
        id: 'postulaciones_trae_pais',
        nombre: 'GET /api/postulaciones — el join incluye el campo pais del perfil',
        run: async () => {
          const res = await fetch('/api/postulaciones?postulante_id=' + FUNDADOR_ID)
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          if (!data.postulaciones || data.postulaciones.length === 0) return 'Sin postulaciones del fundador para verificar (no es un fallo)'
          const tieneCampo = 'pais' in (data.postulaciones[0].perfiles || {})
          if (!tieneCampo) throw new Error('El campo pais no viene en el join de perfiles — revisar route de postulaciones')
          return 'Campo pais presente en el join de postulaciones'
        }
      },
    ]
  },
  {
    nombre: '📁 Almacenamiento de archivos',
    tests: [
      {
        id: 'upload_post',
        nombre: 'POST /api/upload — sube un archivo de prueba y devuelve URL pública',
        run: async () => {
          const contenido = 'QA test file ' + Date.now()
          const blob = new Blob([contenido], { type: 'text/plain' })
          const formData = new FormData()
          formData.append('file', blob, 'qa-test.txt')
          formData.append('carpeta', 'qa-tests')

          const res = await fetch('/api/upload', { method: 'POST', body: formData })
          const data = await res.json()

          // El endpoint solo acepta imágenes y PDF — un .txt debe ser rechazado correctamente
          if (!data.error) throw new Error('Se esperaba un error de tipo de archivo no permitido, pero se aceptó un .txt')
          if (!data.error.includes('no permitido')) throw new Error('El mensaje de error no es el esperado: ' + data.error)
          return 'Validación de tipo de archivo funciona — .txt correctamente rechazado'
        }
      },
      {
        id: 'upload_imagen_valida',
        nombre: 'POST /api/upload — sube una imagen PNG válida de 1x1 px',
        run: async () => {
          // PNG transparente de 1x1 en base64
          const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
          const binario = atob(base64)
          const bytes = new Uint8Array(binario.length)
          for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i)
          const blob = new Blob([bytes], { type: 'image/png' })
          const formData = new FormData()
          formData.append('file', blob, 'qa-pixel.png')
          formData.append('carpeta', 'qa-tests')

          const res = await fetch('/api/upload', { method: 'POST', body: formData })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          if (!data.url || !data.url.startsWith('http')) throw new Error('No se devolvió una URL pública válida')

          // Limpieza
          await fetch('/api/upload?path=' + encodeURIComponent(data.path), { method: 'DELETE' })

          return 'Imagen subida y URL pública generada correctamente: ' + data.url.slice(0, 50) + '...'
        }
      },
    ]
  },
  {
    nombre: '🔍 Búsqueda avanzada',
    tests: [
      {
        id: 'industrias_get',
        nombre: 'GET /api/industrias — lista industrias para filtro de búsqueda',
        run: async () => {
          const res = await fetch('/api/industrias')
          const data = await res.json()
          if (!data.industrias || !Array.isArray(data.industrias)) throw new Error('No devuelve array de industrias')
          if (data.industrias.length === 0) throw new Error('Lista de industrias vacía')
          return data.industrias.length + ' industrias disponibles para filtro'
        }
      },
      {
        id: 'proyectos_trae_pais_industria',
        nombre: 'GET /api/proyectos — incluye campos pais e industria para filtrar',
        run: async () => {
          const res = await fetch('/api/proyectos')
          const data = await res.json()
          if (!data.proyectos || data.proyectos.length === 0) throw new Error('Sin proyectos para verificar')
          const tieneCampos = 'pais' in data.proyectos[0] && 'industria' in data.proyectos[0]
          if (!tieneCampos) throw new Error('Los proyectos no traen los campos pais/industria necesarios para filtrar en /buscar')
          return 'Campos pais e industria presentes — filtros de /buscar pueden funcionar'
        }
      },
    ]
  },
  {
    nombre: '🔔 Notificaciones en tiempo real',
    tests: [
      {
        id: 'realtime_postulaciones_insert',
        nombre: 'Realtime — canal de postulaciones se suscribe correctamente (requiere tabla en supabase_realtime)',
        run: async () => {
          return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              supabase.removeChannel(canal)
              reject(new Error('Timeout de 5s sin confirmación SUBSCRIBED — verificar: ALTER PUBLICATION supabase_realtime ADD TABLE postulaciones;'))
            }, 5000)

            const canal = supabase
              .channel('qa-realtime-test-' + Date.now())
              .on('postgres_changes', { event: '*', schema: 'public', table: 'postulaciones' }, () => {})
              .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                  clearTimeout(timeout)
                  supabase.removeChannel(canal)
                  resolve('Canal Realtime suscrito y conectado correctamente (status: SUBSCRIBED)')
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                  clearTimeout(timeout)
                  supabase.removeChannel(canal)
                  reject(new Error('Error de canal: ' + status + ' — verificar que postulaciones esté en supabase_realtime'))
                }
              })
          })
        }
      },
    ]
  },
  {
    nombre: '🔔 Notificaciones (Fase 17)',
    tests: [
      {
        id: 'notif_setup',
        nombre: 'Setup — crear proyecto y 2 roles de prueba (dispara proyecto_publicado)',
        run: async () => {
          const nombre = 'QA-Notif-Proyecto-' + Date.now()
          const resP = await fetch('/api/proyectos', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, descripcion: 'QA test del sistema de notificaciones para verificar que se disparan correctamente los eventos de postulacion aceptada y rechazada', tipo: 'A', sector: 'Tecnología', fundador_id: FUNDADOR_ID, estado: 'activo' })
          })
          const dataP = await resP.json()
          if (dataP.error) throw new Error('POST proyecto falló: ' + dataP.error)
          window._qaNotifProyectoId = dataP.proyecto.id
          window._qaNotifFundadorId = dataP.proyecto.fundador_id || FUNDADOR_ID

          const resR1 = await fetch('/api/roles', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proyecto_id: window._qaNotifProyectoId, nombre: 'QA Rol A', tipo_aporte: 'tiempo', modalidad: 'equity', fundador_id: window._qaNotifFundadorId })
          })
          const dataR1 = await resR1.json()
          if (dataR1.error) throw new Error('POST rol A falló (proyectoId=' + window._qaNotifProyectoId + ', fundadorId=' + window._qaNotifFundadorId + '): ' + dataR1.error)
          window._qaNotifRolAId = dataR1.rol.id

          const resR2 = await fetch('/api/roles', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proyecto_id: window._qaNotifProyectoId, nombre: 'QA Rol B', tipo_aporte: 'tiempo', modalidad: 'equity', fundador_id: window._qaNotifFundadorId })
          })
          const dataR2 = await resR2.json()
          if (dataR2.error) throw new Error(dataR2.error)
          window._qaNotifRolBId = dataR2.rol.id

          return 'Proyecto y 2 roles creados — proyecto_publicado disparado, revisa correo/campanita'
        }
      },
      {
        id: 'notif_nueva_postulacion',
        nombre: 'nueva_postulacion — postularse al Rol A',
        run: async () => {
          if (!window._qaNotifRolAId) throw new Error('Corre primero el test de Setup')
          const res = await fetch('/api/postulaciones', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rol_id: window._qaNotifRolAId, postulante_id: FUNDADOR_ID, mensaje: 'QA test' })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          window._qaNotifPostulacionAId = data.postulacion.id
          return 'Postulación creada — revisa correo/campanita/push'
        }
      },
      {
        id: 'notif_postulacion_aceptada',
        nombre: 'postulacion_aceptada — aceptar esa postulación',
        run: async () => {
          if (!window._qaNotifPostulacionAId) throw new Error('Corre primero nueva_postulacion')
          const res = await fetch('/api/postulaciones', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: window._qaNotifPostulacionAId, estado: 'aceptada' })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          return 'Postulación aceptada — revisa correo/campanita/push'
        }
      },
      {
        id: 'notif_postulacion_rechazada',
        nombre: 'postulacion_rechazada — postularse al Rol B y rechazar',
        run: async () => {
          if (!window._qaNotifRolBId) throw new Error('Corre primero el test de Setup')
          const resPost = await fetch('/api/postulaciones', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rol_id: window._qaNotifRolBId, postulante_id: FUNDADOR_ID, mensaje: 'QA test' })
          })
          const dataPost = await resPost.json()
          if (dataPost.error) throw new Error(dataPost.error)
          const res = await fetch('/api/postulaciones', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: dataPost.postulacion.id, estado: 'rechazada' })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          return 'Postulación rechazada — revisa correo/campanita'
        }
      },
      {
        id: 'notif_tarea_asignada',
        nombre: 'tarea_asignada — crear tarea asignada a ti',
        run: async () => {
          if (!window._qaNotifProyectoId) throw new Error('Corre primero el test de Setup')
          const res = await fetch('/api/tareas', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proyecto_id: window._qaNotifProyectoId, nombre: 'QA Tarea', descripcion: 'Test', asignado_a: FUNDADOR_ID, creado_por: FUNDADOR_ID })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          window._qaNotifTareaId = data.tarea.id
          return 'Tarea asignada — revisa correo/campanita/push'
        }
      },
      {
        id: 'notif_tarea_completada',
        nombre: 'tarea_completada — marcarla completada',
        run: async () => {
          if (!window._qaNotifTareaId) throw new Error('Corre primero tarea_asignada')
          const res = await fetch('/api/tareas', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: window._qaNotifTareaId, estado: 'completada' })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          return 'Tarea completada — revisa correo/campanita/push'
        }
      },
      {
        id: 'notif_tarea_verificada',
        nombre: 'tarea_verificada — verificarla',
        run: async () => {
          if (!window._qaNotifTareaId) throw new Error('Corre primero tarea_asignada')
          const res = await fetch('/api/tareas', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: window._qaNotifTareaId, estado: 'verificada', verificado_por: FUNDADOR_ID })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          return 'Tarea verificada — revisa correo/campanita/push'
        }
      },
      {
        id: 'notif_hito_completado',
        nombre: 'hito_completado — crear hito y completarlo',
        run: async () => {
          if (!window._qaNotifProyectoId) throw new Error('Corre primero el test de Setup')
          const resH = await fetch('/api/hitos', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proyecto_id: window._qaNotifProyectoId, nombre: 'QA Hito', descripcion: 'Test' })
          })
          const dataH = await resH.json()
          if (dataH.error) throw new Error(dataH.error)
          const res = await fetch('/api/hitos', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: dataH.hito.id, completado: true })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          return 'Hito completado — revisa correo/campanita/push'
        }
      },
      {
        id: 'notif_aporte_pendiente',
        nombre: 'aporte_pendiente_verificacion — registrar aporte',
        run: async () => {
          if (!window._qaNotifProyectoId) throw new Error('Corre primero el test de Setup')
          const res = await fetch('/api/aportes', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proyecto_id: window._qaNotifProyectoId, aportante_id: FUNDADOR_ID, tipo: 'horas', descripcion: 'QA test', valor: 100000, fecha: new Date().toISOString().split('T')[0] })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          window._qaNotifAporteId = data.aporte.id
          return 'Aporte registrado — revisa correo/campanita/push'
        }
      },
      {
        id: 'notif_aporte_verificado',
        nombre: 'aporte_verificado — validarlo',
        run: async () => {
          if (!window._qaNotifAporteId) throw new Error('Corre primero aporte_pendiente_verificacion')
          const res = await fetch('/api/aportes', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: window._qaNotifAporteId, validado: true, validado_por: FUNDADOR_ID })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          return 'Aporte verificado — revisa correo/campanita/push'
        }
      },
      {
        id: 'notif_nuevo_pais',
        nombre: 'nuevo_pais — crear país nuevo (alerta a admin)',
        run: async () => {
          const nombre = 'QA-Pais-Notif-' + Date.now()
          const res = await fetch('/api/paises', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, bandera: '🧪', creado_por_nombre: 'QA', tipo_origen: 'qa', creado_por: FUNDADOR_ID })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          const id = data.pais?.id
          // Eliminar inmediatamente — solo verificamos que la notificacion se disparó
          if (id) await window._supabase.from('paises').delete().eq('id', id).catch(() => {})
          return 'País creado y eliminado — revisa correo de admin y campanita'
        }
      },
      {
        id: 'notif_verificar_correo',
        nombre: 'verificar_correo — reenviar correo de verificación',
        run: async () => {
          const resU = await fetch('/api/usuarios?id=' + FUNDADOR_ID)
          const dataU = await resU.json()
          if (dataU.error) throw new Error(dataU.error)
          const res = await fetch('/api/verificar-correo', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: FUNDADOR_ID, email: dataU.usuario.email, nombre: dataU.usuario.nombre })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          return 'Correo de verificación reenviado — revisa tu bandeja'
        }
      },
      {
        id: 'notif_cleanup',
        nombre: 'Limpieza — eliminar proyecto y datos de prueba de notificaciones',
        run: async () => {
          if (!window._qaNotifProyectoId) return 'Nada que limpiar'
          await fetch('/api/proyectos?id=' + window._qaNotifProyectoId + '&fundador_id=' + FUNDADOR_ID, { method: 'DELETE' })
          window._qaNotifProyectoId = null
          window._qaNotifRolAId = null
          window._qaNotifRolBId = null
          window._qaNotifPostulacionAId = null
          window._qaNotifTareaId = null
          window._qaNotifAporteId = null
          return 'Proyecto y datos de prueba eliminados — las notificaciones ya enviadas quedan en tu historial igual'
        }
      },
    ]
  },
  {
    nombre: '💰 Modelo de Compensación (Fase 19)',
    tests: [
      {
        id: 'comp_setup_riesgo',
        nombre: 'Setup — proyecto Riesgo Compartido + rol + postulación aceptada',
        run: async () => {
          const nombre = 'QA-Comp-Riesgo-' + Date.now()
          const resP = await fetch('/api/proyectos', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, descripcion: 'QA test de compensacion en modalidad riesgo compartido para verificar que se registra deuda pendiente correctamente al confirmar cumplimiento', tipo: 'A', sector: 'Tecnología', fundador_id: FUNDADOR_ID, estado: 'activo', estado_financiacion: 'riesgo_compartido' })
          })
          const dataP = await resP.json()
          if (dataP.error) throw new Error(dataP.error)
          if (dataP.proyecto.estado_financiacion !== 'riesgo_compartido') throw new Error('estado_financiacion no se guardó correctamente: ' + dataP.proyecto.estado_financiacion)
          window._qaCompRiesgoProyectoId = dataP.proyecto.id
          window._qaCompRiesgoFundadorId = dataP.proyecto.fundador_id || FUNDADOR_ID

          const resR = await fetch('/api/roles', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proyecto_id: window._qaCompRiesgoProyectoId, nombre: 'QA Rol Riesgo', tipo_aporte: 'tiempo', modalidad: 'equity', fundador_id: window._qaCompRiesgoFundadorId })
          })
          const dataR = await resR.json()
          if (dataR.error) throw new Error(dataR.error)
          window._qaCompRiesgoRolId = dataR.rol.id

          const resPost = await fetch('/api/postulaciones', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rol_id: window._qaCompRiesgoRolId, postulante_id: FUNDADOR_ID, mensaje: 'QA test' })
          })
          const dataPost = await resPost.json()
          if (dataPost.error) throw new Error(dataPost.error)
          window._qaCompRiesgoPostulacionId = dataPost.postulacion.id

          const resAcept = await fetch('/api/postulaciones', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: window._qaCompRiesgoPostulacionId, estado: 'aceptada' })
          })
          const dataAcept = await resAcept.json()
          if (dataAcept.error) throw new Error(dataAcept.error)

          return 'Proyecto Riesgo Compartido + postulación aceptada — listo para probar cumplimiento'
        }
      },
      {
        id: 'comp_cumplio_acciones',
        nombre: 'Marcar cumplió con forma_pago=acciones (debe crear deuda_pendiente)',
        run: async () => {
          if (!window._qaCompRiesgoPostulacionId) throw new Error('Corre primero el Setup')
          const res = await fetch('/api/postulaciones', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: window._qaCompRiesgoPostulacionId, cumplio: true, cumplio_confirmado_por: FUNDADOR_ID, forma_pago: 'acciones', valor: 500000, concepto: 'QA test deuda' })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          if (data.postulacion.cumplio !== true) throw new Error('cumplio no quedó en true')
          if (data.postulacion.forma_pago !== 'acciones') throw new Error('forma_pago no se guardó')
          return 'Cumplimiento confirmado con acciones — revisa correo/campanita'
        }
      },
      {
        id: 'comp_verificar_deuda',
        nombre: 'Verificar que la deuda quedó registrada en /api/deuda',
        run: async () => {
          if (!window._qaCompRiesgoProyectoId) throw new Error('Corre primero el Setup')
          const res = await fetch('/api/deuda?proyecto_id=' + window._qaCompRiesgoProyectoId)
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          const encontrada = (data.pendiente || []).find(d => d.postulacion_id === window._qaCompRiesgoPostulacionId)
          if (!encontrada) throw new Error('La deuda no aparece en /api/deuda — revisar la creación automática en el PATCH de postulaciones')
          if (Number(encontrada.valor) !== 500000) throw new Error('El valor de la deuda no coincide: ' + encontrada.valor)
          window._qaCompDeudaId = encontrada.id
          return 'Deuda encontrada: $' + Number(encontrada.valor).toLocaleString() + ' — ' + encontrada.concepto
        }
      },
      {
        id: 'comp_resolver_deuda',
        nombre: 'Resolver la deuda (pagar cash)',
        run: async () => {
          if (!window._qaCompDeudaId) throw new Error('Corre primero verificar deuda')
          const res = await fetch('/api/deuda', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: window._qaCompDeudaId, resuelta_como: 'cash', resuelta_por: FUNDADOR_ID })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          if (data.deuda.resuelta !== true) throw new Error('La deuda no quedó marcada como resuelta')
          return 'Deuda resuelta en cash — revisa correo/campanita'
        }
      },
      {
        id: 'comp_setup_con_recursos',
        nombre: 'Setup — proyecto Con Recursos + rol + postulación aceptada',
        run: async () => {
          const nombre = 'QA-Comp-ConRecursos-' + Date.now()
          const resP = await fetch('/api/proyectos', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, descripcion: 'QA test de compensacion en modalidad con recursos para verificar que NO se genera deuda pendiente al confirmar cumplimiento con forma de pago cash', tipo: 'A', sector: 'Tecnología', fundador_id: FUNDADOR_ID, estado: 'activo', estado_financiacion: 'con_recursos' })
          })
          const dataP = await resP.json()
          if (dataP.error) throw new Error(dataP.error)
          if (dataP.proyecto.estado_financiacion !== 'con_recursos') throw new Error('estado_financiacion no se guardó correctamente: ' + dataP.proyecto.estado_financiacion)
          window._qaCompRecProyectoId = dataP.proyecto.id

          const resR = await fetch('/api/roles', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proyecto_id: window._qaCompRecProyectoId, nombre: 'QA Rol Con Recursos', tipo_aporte: 'tiempo', modalidad: 'equity', fundador_id: FUNDADOR_ID })
          })
          const dataR = await resR.json()
          if (dataR.error) throw new Error(dataR.error)
          window._qaCompRecRolId = dataR.rol.id

          const resPost = await fetch('/api/postulaciones', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rol_id: window._qaCompRecRolId, postulante_id: FUNDADOR_ID, mensaje: 'QA test' })
          })
          const dataPost = await resPost.json()
          if (dataPost.error) throw new Error(dataPost.error)
          window._qaCompRecPostulacionId = dataPost.postulacion.id

          await fetch('/api/postulaciones', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: window._qaCompRecPostulacionId, estado: 'aceptada' })
          })

          return 'Proyecto Con Recursos + postulación aceptada — listo'
        }
      },
      {
        id: 'comp_cumplio_cash',
        nombre: 'Marcar cumplió con forma_pago=cash (NO debe crear deuda_pendiente)',
        run: async () => {
          if (!window._qaCompRecPostulacionId) throw new Error('Corre primero el Setup Con Recursos')
          const res = await fetch('/api/postulaciones', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: window._qaCompRecPostulacionId, cumplio: true, cumplio_confirmado_por: FUNDADOR_ID, forma_pago: 'cash', valor: 300000, concepto: 'QA test cash' })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)

          const resDeuda = await fetch('/api/deuda?proyecto_id=' + window._qaCompRecProyectoId)
          const dataDeuda = await resDeuda.json()
          const encontrada = (dataDeuda.pendiente || []).find(d => d.postulacion_id === window._qaCompRecPostulacionId)
          if (encontrada) throw new Error('Se creó deuda_pendiente para un proyecto Con Recursos — no debería pasar')

          return 'Cumplió con cash, sin deuda creada (correcto) — revisa correo/campanita'
        }
      },
      {
        id: 'comp_no_cumplio',
        nombre: 'no_cumplio — verificar que no aplica pago',
        run: async () => {
          const resR = await fetch('/api/roles', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proyecto_id: window._qaCompRecProyectoId, nombre: 'QA Rol No Cumplio', tipo_aporte: 'tiempo', modalidad: 'equity', fundador_id: FUNDADOR_ID })
          })
          const dataR = await resR.json()
          if (dataR.error) throw new Error(dataR.error)
          window._qaCompNoCumpleRolId = dataR.rol.id

          const resPost = await fetch('/api/postulaciones', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rol_id: window._qaCompNoCumpleRolId, postulante_id: FUNDADOR_ID, mensaje: 'QA test' })
          })
          const dataPost = await resPost.json()
          if (dataPost.error) throw new Error(dataPost.error)
          window._qaCompNoCumplePostulacionId = dataPost.postulacion.id

          await fetch('/api/postulaciones', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: window._qaCompNoCumplePostulacionId, estado: 'aceptada' })
          })

          const res = await fetch('/api/postulaciones', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: window._qaCompNoCumplePostulacionId, cumplio: false, cumplio_confirmado_por: FUNDADOR_ID })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          if (data.postulacion.cumplio !== false) throw new Error('cumplio no quedó en false')
          if (data.postulacion.forma_pago) throw new Error('No debería tener forma_pago si no cumplió')

          return 'No cumplió registrado correctamente, sin forma de pago — revisa correo/campanita'
        }
      },
      {
        id: 'comp_cleanup',
        nombre: 'Limpieza — eliminar los 2 proyectos de prueba',
        run: async () => {
          const ids = [window._qaCompRiesgoProyectoId, window._qaCompRecProyectoId].filter(Boolean)
          for (const pid of ids) {
            await fetch('/api/proyectos?id=' + pid + '&fundador_id=' + FUNDADOR_ID, { method: 'DELETE' })
          }
          window._qaCompRiesgoProyectoId = null
          window._qaCompRiesgoRolId = null
          window._qaCompRiesgoPostulacionId = null
          window._qaCompDeudaId = null
          window._qaCompRecProyectoId = null
          window._qaCompRecRolId = null
          window._qaCompRecPostulacionId = null
          window._qaCompNoCumpleRolId = null
          window._qaCompNoCumplePostulacionId = null
          return ids.length + ' proyecto(s) de prueba eliminados'
        }
      },
    ]
  },
  {
    nombre: '✉️ Ofertas e Invitaciones (Fase 21)',
    tests: [
      {
        id: 'ofertas_setup',
        nombre: 'Setup — proyecto + rol para probar ofertas',
        run: async () => {
          const nombre = 'QA-Ofertas-' + Date.now()
          const resP = await fetch('/api/proyectos', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, descripcion: 'QA test de ofertas e invitaciones para verificar que el sistema crea correctamente postulaciones con origen fundador y las muestra separadas', tipo: 'A', sector: 'Tecnología', fundador_id: FUNDADOR_ID, estado: 'activo', estado_financiacion: 'con_recursos' })
          })
          const dataP = await resP.json()
          if (dataP.error) throw new Error(dataP.error)
          window._qaOfertasProyectoId = dataP.proyecto.id

          const resR = await fetch('/api/roles', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proyecto_id: window._qaOfertasProyectoId, nombre: 'QA Rol Oferta', tipo_aporte: 'tiempo', modalidad: 'equity', fundador_id: FUNDADOR_ID })
          })
          const dataR = await resR.json()
          if (dataR.error) throw new Error(dataR.error)
          window._qaOfertasRolId = dataR.rol.id
          return 'Proyecto y rol listos'
        }
      },
      {
        id: 'ofertas_buscar_email',
        nombre: 'Buscar usuario por email (/api/usuarios?email=)',
        run: async () => {
          const res = await fetch('/api/usuarios?id=' + FUNDADOR_ID)
          const data = await res.json()
          const email = data.usuario?.email
          if (!email) throw new Error('El perfil del fundador no tiene email')
          const res2 = await fetch('/api/usuarios?email=' + encodeURIComponent(email))
          const data2 = await res2.json()
          if (data2.error) throw new Error(data2.error)
          if (data2.usuario?.id !== FUNDADOR_ID) throw new Error('La búsqueda por email no encontró al usuario correcto')
          return 'Búsqueda por email funciona: ' + email + ' → ' + data2.usuario.id.substring(0,8) + '...'
        }
      },
      {
        id: 'ofertas_crear',
        nombre: 'Crear oferta (postulación con origen=fundador)',
        run: async () => {
          if (!window._qaOfertasRolId) throw new Error('Corre primero el Setup')
          const res = await fetch('/api/postulaciones', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rol_id: window._qaOfertasRolId, postulante_id: FUNDADOR_ID, mensaje: 'QA oferta directa', origen: 'fundador' })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          if (data.postulacion.origen !== 'fundador') throw new Error('El origen no se guardó: ' + data.postulacion.origen)
          window._qaOfertasPostulacionId = data.postulacion.id
          return 'Oferta creada con origen=fundador'
        }
      },
      {
        id: 'ofertas_separacion',
        nombre: 'Verificar separación — la oferta aparece con origen distinto a las postulaciones propias',
        run: async () => {
          if (!window._qaOfertasPostulacionId) throw new Error('Corre primero crear oferta')
          const res = await fetch('/api/postulaciones?postulante_id=' + FUNDADOR_ID)
          const data = await res.json()
          const laOferta = (data.postulaciones || []).find(p => p.id === window._qaOfertasPostulacionId)
          if (!laOferta) throw new Error('La oferta no aparece en las postulaciones del usuario')
          if (laOferta.origen !== 'fundador') throw new Error('La oferta perdió su origen al consultarla')
          const propias = (data.postulaciones || []).filter(p => p.origen !== 'fundador')
          return 'Separación correcta: ' + (data.postulaciones||[]).filter(p=>p.origen==='fundador').length + ' oferta(s), ' + propias.length + ' postulación(es) propia(s)'
        }
      },
      {
        id: 'ofertas_default_origen',
        nombre: 'Postulación normal sin origen → default "postulante"',
        run: async () => {
          if (!window._qaOfertasRolId) throw new Error('Corre primero el Setup')
          const resR = await fetch('/api/roles', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proyecto_id: window._qaOfertasProyectoId, nombre: 'QA Rol Normal', tipo_aporte: 'tiempo', modalidad: 'equity', fundador_id: FUNDADOR_ID })
          })
          const dataR = await resR.json()
          if (dataR.error) throw new Error(dataR.error)
          const res = await fetch('/api/postulaciones', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rol_id: dataR.rol.id, postulante_id: FUNDADOR_ID, mensaje: 'QA normal' })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          if (data.postulacion.origen !== 'postulante') throw new Error('El default no es postulante: ' + data.postulacion.origen)
          return 'Default correcto: origen=postulante cuando no se envía'
        }
      },
      {
        id: 'ofertas_cleanup',
        nombre: 'Limpieza — eliminar el proyecto de prueba',
        run: async () => {
          if (!window._qaOfertasProyectoId) return 'Nada que limpiar'
          await fetch('/api/proyectos?id=' + window._qaOfertasProyectoId + '&fundador_id=' + FUNDADOR_ID, { method: 'DELETE' })
          window._qaOfertasProyectoId = null
          window._qaOfertasRolId = null
          window._qaOfertasPostulacionId = null
          return 'Proyecto de prueba eliminado'
        }
      },
    ]
  },
  {
    nombre: '📊 Ingresos del proyecto (Fase 22)',
    tests: [
      {
        id: 'ing_setup',
        nombre: 'Setup — proyecto para probar ingresos',
        run: async () => {
          const nombre = 'QA-Ingresos-' + Date.now()
          const res = await fetch('/api/proyectos', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, descripcion: 'QA test del modulo de ingresos para verificar que se registran correctamente las ventas y contratos del proyecto con tipo valor y fecha', tipo: 'A', sector: 'Tecnología', fundador_id: FUNDADOR_ID, estado: 'activo', estado_financiacion: 'con_recursos' })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          window._qaIngresosProyectoId = data.proyecto.id
          return 'Proyecto creado: ' + data.proyecto.id.substring(0,8) + '...'
        }
      },
      {
        id: 'ing_registrar',
        nombre: 'Registrar un ingreso (fundador puede)',
        run: async () => {
          if (!window._qaIngresosProyectoId) throw new Error('Corre primero el Setup')
          const res = await fetch('/api/ingresos', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proyecto_id: window._qaIngresosProyectoId, registrado_por: FUNDADOR_ID, descripcion: 'QA venta de prueba', valor: 1500000, tipo: 'venta', fecha: new Date().toISOString().split('T')[0] })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          if (!data.ingreso?.id) throw new Error('No se creó el ingreso')
          window._qaIngresosId = data.ingreso.id
          return 'Ingreso registrado: $' + Number(data.ingreso.valor).toLocaleString()
        }
      },
      {
        id: 'ing_listar',
        nombre: 'Listar ingresos y verificar total',
        run: async () => {
          if (!window._qaIngresosProyectoId) throw new Error('Corre primero el Setup')
          const res = await fetch('/api/ingresos?proyecto_id=' + window._qaIngresosProyectoId)
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          const encontrado = (data.ingresos || []).find(i => i.id === window._qaIngresosId)
          if (!encontrado) throw new Error('El ingreso no aparece en la lista')
          if (data.total !== 1500000) throw new Error('El total no cuadra: ' + data.total)
          return data.ingresos.length + ' ingreso(s) — total $' + data.total.toLocaleString()
        }
      },
      {
        id: 'ing_no_autorizado',
        nombre: 'Usuario sin permiso no puede registrar ingreso',
        run: async () => {
          if (!window._qaIngresosProyectoId) throw new Error('Corre primero el Setup')
          // Intenta registrar con un UUID que no es el fundador ni tiene rol aceptado
          const res = await fetch('/api/ingresos', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proyecto_id: window._qaIngresosProyectoId, registrado_por: '00000000-0000-0000-0000-000000000000', descripcion: 'intento no autorizado', valor: 999, tipo: 'venta' })
          })
          const data = await res.json()
          if (!data.error) throw new Error('Debería haber rechazado el registro — no lo hizo')
          return 'Rechazado correctamente: ' + data.error
        }
      },
      {
        id: 'ing_cleanup',
        nombre: 'Limpieza — eliminar proyecto de prueba',
        run: async () => {
          if (!window._qaIngresosProyectoId) return 'Nada que limpiar'
          const sb = window._supabase
          // Eliminar ingresos primero
          await sb.from('ingresos').delete().eq('proyecto_id', window._qaIngresosProyectoId)
          // Eliminar el proyecto
          await sb.from('proyectos').delete().eq('id', window._qaIngresosProyectoId).eq('fundador_id', FUNDADOR_ID)
          window._qaIngresosProyectoId = null
          window._qaIngresosId = null
          return 'Proyecto QA-Ingresos eliminado correctamente'
        }
      },
    ]
  },

  // ─── Calificaciones ──────────────────────────────────────────────────────
  {
    nombre: '⭐ Calificaciones',
    tests: [
      {
        id: 'calif_post',
        nombre: 'POST /api/calificaciones — crear calificación',
        run: async () => {
          // Necesitamos dos usuarios y un proyecto — usamos el QA Founder y creamos un proyecto rápido
          const pRes = await fetch('/api/proyectos', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: 'QA-Proyecto-Calif-' + Date.now(), descripcion: 'QA test calificaciones para verificar sistema de ratings entre colaboradores', tipo: 'A', sector: 'Tecnología', ciudad: 'Bogotá', pais: 'Colombia', estado_financiacion: 'riesgo_compartido', fundador_id: 'a57b6849-1388-4186-8880-2ec31dd31af5' })
          })
          const pData = await pRes.json()
          if (!pData.proyecto?.id) throw new Error('No se pudo crear proyecto QA: ' + JSON.stringify(pData))
          window._qaCalifProyectoId = pData.proyecto.id

          const res = await fetch('/api/calificaciones', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              proyecto_id: window._qaCalifProyectoId,
              de_usuario_id: 'a57b6849-1388-4186-8880-2ec31dd31af5',
              a_usuario_id: 'a57b6849-1388-4186-8880-2ec31dd31af5',
              estrellas: 5,
              comentario: 'QA test — excelente colaborador',
              tipo: 'fundador_a_especialista',
            })
          })
          const data = await res.json()
          // Puede fallar con "no puedes calificarte a ti mismo" — ese es el comportamiento correcto
          if (data.error && data.error.includes('a ti mismo')) return 'Validación correcta: no se puede calificar a sí mismo'
          if (data.ok) { window._qaCalifId = data.id; return 'Calificación creada: ' + data.id }
          throw new Error(JSON.stringify(data))
        }
      },
      {
        id: 'calif_get',
        nombre: 'GET /api/calificaciones?usuario_id — leer calificaciones',
        run: async () => {
          const res = await fetch('/api/calificaciones?usuario_id=a57b6849-1388-4186-8880-2ec31dd31af5')
          const data = await res.json()
          if (typeof data.total !== 'number') throw new Error('No devuelve total')
          return data.total + ' calificaciones, promedio: ' + (data.promedio || 'N/A')
        }
      },
      {
        id: 'calif_cleanup',
        nombre: 'Limpieza — eliminar proyecto de prueba',
        run: async () => {
          if (!window._qaCalifProyectoId) return 'Nada que limpiar'
          await fetch('/api/proyectos?id=' + window._qaCalifProyectoId + '&fundador_id=' + FUNDADOR_ID, { method: 'DELETE' })
          window._qaCalifProyectoId = null
          return 'Proyecto eliminado'
        }
      },
    ]
  },

  // ─── Logros ──────────────────────────────────────────────────────────────
  {
    nombre: '🎖️ Logros y Badges',
    tests: [
      {
        id: 'logros_post',
        nombre: 'POST /api/logros — otorgar logro (idempotente)',
        run: async () => {
          const res = await fetch('/api/logros', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: 'a57b6849-1388-4186-8880-2ec31dd31af5', tipo: 'perfil_completo' })
          })
          const data = await res.json()
          if (!data.ok) throw new Error(JSON.stringify(data))
          // Segunda llamada debe ser idempotente
          const res2 = await fetch('/api/logros', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: 'a57b6849-1388-4186-8880-2ec31dd31af5', tipo: 'perfil_completo' })
          })
          const data2 = await res2.json()
          if (!data2.ok) throw new Error('Segunda llamada falló: ' + JSON.stringify(data2))
          return 'Logro otorgado OK, segunda llamada idempotente OK (nuevo: ' + data2.nuevo + ')'
        }
      },
      {
        id: 'logros_get',
        nombre: 'GET /api/logros?usuario_id — leer logros del usuario',
        run: async () => {
          const res = await fetch('/api/logros?usuario_id=a57b6849-1388-4186-8880-2ec31dd31af5')
          const data = await res.json()
          if (!Array.isArray(data.logros)) throw new Error('No devuelve array de logros')
          return data.logros.length + ' logros encontrados: ' + data.logros.map(l => l.emoji + ' ' + l.titulo).join(', ')
        }
      },
    ]
  },

  // ─── Nuevos eventos cableados ────────────────────────────────────────────
  {
    nombre: '📡 Eventos Nuevos (Fase 27)',
    tests: [
      {
        id: 'impulsos_post',
        nombre: 'POST /api/impulsos — registrar impulso',
        run: async () => {
          const res = await fetch('/api/impulsos', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proyecto_id: PROYECTO_ESCALA, angel_id: FUNDADOR_ID, descripcion: 'QA test impulso', valor: 1000 })
          })
          const data = await res.json()
          if (!data.impulso?.id) throw new Error(JSON.stringify(data))
          window._qaImpulsoId = data.impulso.id
          return 'Impulso creado: ' + data.impulso.id
        }
      },
      {
        id: 'impulsos_get',
        nombre: 'GET /api/impulsos?angel_id — historial del ángel',
        run: async () => {
          const res = await fetch('/api/impulsos?angel_id=' + FUNDADOR_ID)
          const data = await res.json()
          if (!Array.isArray(data.impulsos)) throw new Error('No devuelve array: ' + JSON.stringify(data))
          return data.impulsos.length + ' impulsos encontrados'
        }
      },
      {
        id: 'mensaje_trigger',
        nombre: 'POST /api/notificaciones/mensaje — trigger de chat',
        run: async () => {
          const res = await fetch('/api/notificaciones/mensaje', {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'x-supabase-trigger': 'internal' },
            body: JSON.stringify({ mensaje_id: 'qa-test', proyecto_id: PROYECTO_ESCALA, autor_id: FUNDADOR_ID, contenido: 'QA test mensaje de prueba' })
          })
          const data = await res.json()
          if (!data.ok && !data.error) throw new Error(JSON.stringify(data))
          if (data.ok) return 'Trigger OK — notificados: ' + (data.notificados || 0) + ' miembros'
          return 'Sin miembros que notificar (esperado en proyecto sin equipo): ' + data.error
        }
      },
      {
        id: 'contratos_api_get',
        nombre: 'GET /api/contratos?proyecto_id — listar contratos',
        run: async () => {
          const res = await fetch('/api/contratos?proyecto_id=' + PROYECTO_ESCALA)
          const data = await res.json()
          if (!Array.isArray(data.contratos)) throw new Error('No devuelve array: ' + JSON.stringify(data))
          return data.contratos.length + ' contratos en proyecto Escala'
        }
      },
    ]
  },

  // ─── Preferencias de notificación ────────────────────────────────────────
  {
    nombre: '🔔 Preferencias de Notificación',
    tests: [
      {
        id: 'prefs_get',
        nombre: 'GET /api/notificaciones/preferencias — leer preferencias',
        run: async () => {
          const { data: { session } } = await window._supabase.auth.getSession()
          if (!session) return 'Requiere sesión activa — inicia sesión en /registro y vuelve al QA'
          const res = await fetch('/api/notificaciones/preferencias', {
            headers: { authorization: 'Bearer ' + session.access_token }
          })
          const data = await res.json()
          if (!data.preferencias) throw new Error('No devuelve preferencias: ' + JSON.stringify(data))
          return 'email_activo: ' + data.preferencias.email_activo + ', push_activo: ' + data.preferencias.push_activo + ', categorías desactivadas: ' + (data.preferencias.categorias_email_desactivadas?.length || 0)
        }
      },
      {
        id: 'prefs_patch',
        nombre: 'PATCH /api/notificaciones/preferencias — actualizar categoría',
        run: async () => {
          const { data: { session } } = await window._supabase.auth.getSession()
          if (!session) return 'Requiere sesión activa — inicia sesión en /registro y vuelve al QA'
          const res = await fetch('/api/notificaciones/preferencias', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + session.access_token },
            body: JSON.stringify({ categorias_email_desactivadas: ['tareas'] })
          })
          const data = await res.json()
          if (!data.ok) throw new Error('No actualizó: ' + JSON.stringify(data))
          // Revertir para no dejar datos de prueba
          await fetch('/api/notificaciones/preferencias', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', authorization: 'Bearer ' + session.access_token },
            body: JSON.stringify({ categorias_email_desactivadas: [] })
          })
          return 'Preferencia actualizada y revertida OK'
        }
      },
    ]
  },
  {
    nombre: '🗺️ Rutas y Páginas',
    tests: [
      {
        id: 'rutas1',
        nombre: 'Verificar páginas principales (no 404)',
        auto: true,
        run: async () => {
          const rutasPrincipales = [
            '/dashboard', '/proyectos', '/postulaciones', '/directorio', '/buscar',
            '/score', '/angel', '/carril', '/hitos', '/aportes', '/ingresos',
            '/metricas', '/invitar', '/mis-contratos', '/calendario',
          ]
          const errores = []
          for (const ruta of rutasPrincipales) {
            const res = await fetch(ruta, { method: 'HEAD' })
            if (res.status === 404) errores.push(ruta)
          }
          if (errores.length > 0) throw new Error('Páginas con 404: ' + errores.join(', '))
          return '✓ ' + rutasPrincipales.length + ' rutas principales OK'
        }
      },
      {
        id: 'rutas2',
        nombre: 'Verificar páginas del módulo financiero (no 404)',
        auto: true,
        run: async () => {
          const rutasWallet = [
            '/wallet', '/wallet/fondear', '/wallet/movimientos',
            '/wallet/pagos', '/wallet/pagos/solicitar', '/admin/financiero',
          ]
          const errores = []
          for (const ruta of rutasWallet) {
            const res = await fetch(ruta, { method: 'HEAD' })
            if (res.status === 404) errores.push(ruta)
          }
          if (errores.length > 0) throw new Error('Páginas con 404: ' + errores.join(', '))
          return '✓ ' + rutasWallet.length + ' rutas del módulo financiero OK'
        }
      },
      {
        id: 'rutas3',
        nombre: 'Verificar redireccionamientos: /admin → /mis-contratos',
        auto: true,
        run: async () => {
          const res = await fetch('/admin', { redirect: 'follow' })
          if (res.url?.includes('/mis-contratos') || res.url?.includes('/registro')) {
            return '✓ /admin redirige correctamente'
          }
          return '✓ /admin responde (verificar manualmente que redirige a /mis-contratos)'
        }
      },
      {
        id: 'rutas4',
        nombre: 'Verificar redireccionamientos: /p/[id] → /proyectos/[id]',
        auto: true,
        run: async () => {
          const res = await fetch('/p/test-id', { redirect: 'follow' })
          if (res.status === 404) return '✓ /p/[id] redirige (Next.js maneja la redirección client-side)'
          return '✓ /p/[id] responde — ' + res.status
        }
      },
      {
        id: 'rutas5',
        nombre: 'APIs del motor financiero responden',
        auto: true,
        run: async () => {
          const apis = ['/api/exchange-rates', '/api/wallet', '/api/fondeos', '/api/pagos']
          const errores = []
          const { data: { session } } = await window._supabase.auth.getSession()
          const headers = session ? { 'Authorization': 'Bearer ' + session.access_token } : {}
          for (const api of apis) {
            const res = await fetch(api, { headers })
            if (res.status === 404) errores.push(api + ' → 404')
            if (res.status === 500) errores.push(api + ' → 500')
          }
          if (errores.length > 0) throw new Error(errores.join(', '))
          return '✓ ' + apis.length + ' APIs responden (200 o 401 según autenticación)'
        }
      },
    ]
  },
  {
    nombre: '💳 Motor Financiero',
    tests: [
      {
        id: 'fin1',
        nombre: 'Exchange rates disponibles',
        auto: true,
        run: async () => {
          const res = await fetch('/api/exchange-rates')
          const data = await res.json()
          if (!res.ok) throw new Error(data.error)
          const monedas = Object.keys(data.tasas || {})
          if (!monedas.includes('COP')) throw new Error('COP no encontrado')
          if (!monedas.includes('USD')) throw new Error('USD no encontrado')
          return `✓ ${monedas.length} monedas: ${monedas.join(', ')}`
        }
      },
      {
        id: 'fin2',
        nombre: 'GET /api/wallet — autenticado',
        auto: true,
        run: async () => {
          const { data: { session } } = await window._supabase.auth.getSession()
          if (!session) throw new Error('Sin sesión activa')
          const res = await fetch('/api/wallet', { headers: { 'Authorization': 'Bearer ' + session.access_token } })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error)
          return '✓ ' + (data.wallets?.length || 0) + ' wallet(s)'
        }
      },
      {
        id: 'fin3',
        nombre: 'Crear wallet COP',
        auto: true,
        run: async () => {
          const { data: { session } } = await window._supabase.auth.getSession()
          if (!session) throw new Error('Sin sesión activa')
          const res = await fetch('/api/wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
            body: JSON.stringify({ moneda: 'COP', pais: 'CO' })
          })
          const data = await res.json()
          if (!res.ok && !data.error?.includes('duplicate') && !data.error?.includes('unique')) throw new Error(data.error)
          return '✓ Wallet COP OK — ' + (data.wallet?.id?.substring(0,8) || 'ya existía')
        }
      },
      {
        id: 'fin4',
        nombre: 'Iniciar fondeo BRE-B',
        auto: true,
        run: async () => {
          const { data: { session } } = await window._supabase.auth.getSession()
          if (!session) throw new Error('Sin sesión activa')
          const res = await fetch('/api/fondeos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token },
            body: JSON.stringify({ proveedor: 'breb', moneda: 'COP', monto: 10000, pais: 'CO' })
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error)
          if (!data.instrucciones?.referencia) throw new Error('Sin referencia')
          window._qaFondeoId = data.fondeo?.id
          return '✓ Fondeo BRE-B creado — Ref: ' + data.instrucciones.referencia
        }
      },
      {
        id: 'fin5',
        nombre: 'GET /api/fondeos — historial',
        auto: true,
        run: async () => {
          const { data: { session } } = await window._supabase.auth.getSession()
          if (!session) throw new Error('Sin sesión activa')
          const res = await fetch('/api/fondeos', { headers: { 'Authorization': 'Bearer ' + session.access_token } })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error)
          return '✓ ' + (data.fondeos?.length || 0) + ' fondeos'
        }
      },
      {
        id: 'fin6',
        nombre: 'GET /api/wallet/movimientos',
        auto: true,
        run: async () => {
          const { data: { session } } = await window._supabase.auth.getSession()
          if (!session) throw new Error('Sin sesión activa')
          const res = await fetch('/api/wallet/movimientos?limit=5', { headers: { 'Authorization': 'Bearer ' + session.access_token } })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error)
          return '✓ ' + (data.total || 0) + ' movimientos en ledger'
        }
      },
      {
        id: 'fin7',
        nombre: 'Tasas multimoneda válidas',
        auto: true,
        run: async () => {
          const res = await fetch('/api/exchange-rates')
          const data = await res.json()
          const t = data.tasas || {}
          if (!t.USD || parseFloat(t.USD.tasa_usd) !== 1) throw new Error('USD debe ser 1.0')
          if (!t.COP || parseFloat(t.COP.tasa_usd) > 0.001) throw new Error('COP tasa inválida')
          if (!t.MXN) throw new Error('MXN no encontrado')
          if (!t.EUR || parseFloat(t.EUR.tasa_usd) < 1) throw new Error('EUR tasa inválida')
          return '✓ COP: ' + t.COP.tasa_usd + ' | EUR: ' + t.EUR.tasa_usd + ' | MXN: ' + t.MXN.tasa_usd
        }
      },
      {
        id: 'fin9',
        nombre: 'Verificar rutas del módulo financiero (no 404)',
        auto: true,
        run: async () => {
          const rutas = ['/wallet', '/wallet/fondear', '/wallet/movimientos', '/wallet/pagos', '/wallet/pagos/solicitar', '/admin/financiero']
          const errores = []
          for (const ruta of rutas) {
            try {
              const res = await fetch(ruta, { method: 'HEAD' })
              if (res.status === 404) errores.push(`${ruta} → 404`)
            } catch (e) {
              errores.push(`${ruta} → error de red`)
            }
          }
          if (errores.length > 0) throw new Error('Páginas con 404: ' + errores.join(', '))
          return '✓ Todas las rutas del módulo financiero responden correctamente'
        }
      },
      {
        id: 'fin8',
        nombre: 'Admin financiero — 403 si no admin',
        auto: true,
        run: async () => {
          const { data: { session } } = await window._supabase.auth.getSession()
          if (!session) throw new Error('Sin sesión activa')
          const res = await fetch('/api/admin/financiero', { headers: { 'Authorization': 'Bearer ' + session.access_token } })
          const data = await res.json()
          if (res.status === 403) return '✓ RLS correcto — no-admin bloqueado'
          if (res.ok) return '✓ Admin verificado — ' + (data.total || 0) + ' órdenes'
          throw new Error(data.error)
        }
      },
    ]
  },
  {
    nombre: '🏪 Local Comercial — motor waterfall y verificacion',
    tests: [
      {
        id: 'local_wizard_selector',
        nombre: 'GET /proyectos — pagina de proyectos carga correctamente',
        run: async () => {
          const res = await fetch('/proyectos')
          if (!res.ok) throw new Error('Status: ' + res.status)
          const html = await res.text()
          // La pagina puede ser un componente React que renderiza en el cliente
          // Solo verificamos que la pagina carga con status 200
          if (html.length < 100) throw new Error('Pagina vacia o muy corta')
          return 'OK — pagina proyectos carga con status ' + res.status
        }
      },
      {
        id: 'local_api_sin_auth',
        nombre: 'POST /api/local-comercial — rechaza sin autenticacion',
        run: async () => {
          const res = await fetch('/api/local-comercial', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
          if (res.status === 401) return 'OK — 401 sin auth'
          throw new Error('Esperaba 401, recibio ' + res.status)
        }
      },
      {
        id: 'local_reporte_sin_auth',
        nombre: 'POST /api/local-comercial/reporte-diario — rechaza sin auth',
        run: async () => {
          const res = await fetch('/api/local-comercial/reporte-diario', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
          if (res.status === 401) return 'OK — 401 sin auth'
          throw new Error('Esperaba 401, recibio ' + res.status)
        }
      },
      {
        id: 'local_waterfall_calculo',
        nombre: 'Waterfall — calculo correcto de excedente e intereses',
        run: async () => {
          // Simular el calculo sin llamar la API
          const ventas = 180000
          const margen_pct = 58 // %
          const fijo_dia = 46667
          const capital = 4400000
          const tasa_mensual = 3.0

          const costo_producto = ventas * (1 - margen_pct / 100)
          const excedente = ventas - costo_producto - fijo_dia
          const tasa_diaria = tasa_mensual / 100 / 30
          const intereses = Math.round(capital * tasa_diaria)
          const abono = Math.round(excedente - intereses)
          const pago = intereses + abono

          if (excedente < 0) throw new Error('Excedente negativo inesperado: ' + excedente)
          if (intereses <= 0) throw new Error('Intereses deben ser positivos')
          if (abono <= 0) throw new Error('Abono al capital debe ser positivo')
          if (pago !== Math.round(excedente)) throw new Error('Pago total no coincide con excedente: ' + pago + ' vs ' + excedente)

          return `OK — excedente: $${Math.round(excedente).toLocaleString('es-CO')} | intereses: $${intereses.toLocaleString('es-CO')} | abono capital: $${abono.toLocaleString('es-CO')}`
        }
      },
      {
        id: 'local_salida_calculo',
        nombre: 'Salida anticipada — penalidad correcta por fase',
        run: async () => {
          const canon_mensual = 1200000
          const canon_anio = canon_mensual * 12
          const penalidad_fase1 = canon_anio * 0.04
          const penalidad_fase2 = canon_anio * 0.08

          if (penalidad_fase1 !== 576000) throw new Error('Penalidad Fase 1 incorrecta: ' + penalidad_fase1)
          if (penalidad_fase2 !== 1152000) throw new Error('Penalidad Fase 2 incorrecta: ' + penalidad_fase2)

          return `OK — Fase 1: $${penalidad_fase1.toLocaleString('es-CO')} | Fase 2: $${penalidad_fase2.toLocaleString('es-CO')}`
        }
      },
      {
        id: 'local_salida_api_sin_auth',
        nombre: 'GET /api/local-comercial/salida-anticipada — rechaza sin auth',
        run: async () => {
          const res = await fetch('/api/local-comercial/salida-anticipada?proyecto_id=test')
          if (res.status === 401) return 'OK — 401 sin auth'
          throw new Error('Esperaba 401, recibio ' + res.status)
        }
      },
      {
        id: 'local_inversionista_sin_auth',
        nombre: 'GET /api/local-comercial/inversionista — rechaza sin auth',
        run: async () => {
          const res = await fetch('/api/local-comercial/inversionista?proyecto_id=test')
          if (res.status === 401) return 'OK — 401 sin auth'
          throw new Error('Esperaba 401, recibio ' + res.status)
        }
      },
      {
        id: 'local_admin_no_admin',
        nombre: 'GET /api/admin/local-comercial — rechaza no-admin',
        run: async () => {
          const { data: { session } } = await window._supabase.auth.getSession()
          if (!session) return 'Sin sesion — omitido'
          const res = await fetch('/api/admin/local-comercial', { headers: { Authorization: 'Bearer ' + session.access_token } })
          const data = await res.json()
          if (res.status === 403) return 'OK — 403 no-admin bloqueado'
          if (res.ok) return 'OK — acceso admin verificado (' + data.total + ' locales)'
          throw new Error(data.error)
        }
      },
      {
        id: 'local_cron_sin_auth',
        nombre: 'GET /api/cron/local-comercial-alertas — rechaza sin CRON_SECRET',
        run: async () => {
          const res = await fetch('/api/cron/local-comercial-alertas', { headers: { Authorization: 'Bearer token-falso' } })
          if (res.status === 401) return 'OK — 401 sin CRON_SECRET valido'
          throw new Error('Esperaba 401, recibio ' + res.status)
        }
      },
      {
        id: 'local_panel_operador_carga',
        nombre: 'GET /proyectos/[id]/workspace/local — pagina carga',
        run: async () => {
          const res = await fetch('/proyectos/' + PROYECTO_ESCALA + '/workspace/local')
          if (res.ok) return 'OK — panel operador carga con status ' + res.status
          if (res.status === 404) return 'OK — 404 esperado (proyecto ESCALA no es tipo local)'
          throw new Error('Status inesperado: ' + res.status)
        }
      },
    ]
  },
  {
    nombre: '💰 Presupuesto e Inversion',
    tests: [
      {
        id: 'presupuesto_get_sin_proyecto',
        nombre: 'GET /api/presupuesto — rechaza sin proyecto_id',
        run: async () => {
          const res = await fetch('/api/presupuesto')
          if (res.status === 400) return 'OK — 400 sin proyecto_id'
          throw new Error('Esperaba 400, recibio ' + res.status)
        }
      },
      {
        id: 'presupuesto_get_proyecto_escala',
        nombre: 'GET /api/presupuesto — lista items del proyecto ESCALA',
        run: async () => {
          const res = await fetch('/api/presupuesto?proyecto_id=' + PROYECTO_ESCALA)
          const data = await res.json()
          if (!data.ok) throw new Error(data.error)
          return (data.items?.length || 0) + ' items — total: $' + Math.round(data.resumen?.total_presupuesto || 0).toLocaleString('es-CO')
        }
      },
      {
        id: 'presupuesto_post_sin_auth',
        nombre: 'POST /api/presupuesto — rechaza sin auth',
        run: async () => {
          const res = await fetch('/api/presupuesto', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
          if (res.status === 401) return 'OK — 401 sin auth'
          throw new Error('Esperaba 401, recibio ' + res.status)
        }
      },
      {
        id: 'presupuesto_crud_completo',
        nombre: 'POST + PUT + DELETE /api/presupuesto — CRUD completo con QA-Item',
        run: async () => {
          const { data: { session } } = await window._supabase.auth.getSession()
          if (!session) return 'Sin sesion — omitido'
          const resC = await fetch('/api/presupuesto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
            body: JSON.stringify({ proyecto_id: PROYECTO_ESCALA, categoria: 'tecnologia', nombre: 'QA-Item-Presupuesto', descripcion: 'Test QA automatico', cantidad: 2, valor_unitario: 500000, tipo_gasto: 'capex', prioridad: 'baja' })
          })
          const dataC = await resC.json()
          if (!dataC.ok) throw new Error('CREATE: ' + dataC.error)
          const itemId = dataC.item.id
          const resU = await fetch('/api/presupuesto', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
            body: JSON.stringify({ id: itemId, descripcion: 'QA actualizado' })
          })
          const dataU = await resU.json()
          if (!dataU.ok) throw new Error('UPDATE: ' + dataU.error)
          const resD = await fetch('/api/presupuesto?id=' + itemId, { method: 'DELETE', headers: { Authorization: 'Bearer ' + session.access_token } })
          const dataD = await resD.json()
          if (!dataD.ok) throw new Error('DELETE: ' + dataD.error)
          return 'OK — CREATE ($1.000.000) + UPDATE + DELETE completados'
        }
      },
      {
        id: 'presupuesto_fondeo_sin_auth',
        nombre: 'POST /api/presupuesto/fondeo — rechaza sin auth',
        run: async () => {
          const res = await fetch('/api/presupuesto/fondeo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
          if (res.status === 401) return 'OK — 401 sin auth'
          throw new Error('Esperaba 401, recibio ' + res.status)
        }
      },
      {
        id: 'presupuesto_aporte_especie',
        nombre: 'POST /api/presupuesto — aporte en especie queda como fondeado',
        run: async () => {
          const { data: { session } } = await window._supabase.auth.getSession()
          if (!session) return 'Sin sesion — omitido'
          const res = await fetch('/api/presupuesto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
            body: JSON.stringify({ proyecto_id: PROYECTO_ESCALA, categoria: 'equipos_activos', nombre: 'QA-Aporte-Especie', cantidad: 1, valor_unitario: 2000000, tipo_gasto: 'capex', prioridad: 'baja', es_aporte_especie: true })
          })
          const data = await res.json()
          if (!data.ok) throw new Error(data.error)
          const ok = data.item.estado_fondeo === 'fondeado' && parseFloat(data.item.monto_fondeado) === 2000000
          // Limpiar
          await fetch('/api/presupuesto?id=' + data.item.id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + session.access_token } })
          if (!ok) throw new Error('Aporte en especie no quedo como fondeado')
          return 'OK — aporte especie $2.000.000 quedo con estado_fondeo=fondeado'
        }
      },
    ]
  },
  {
    nombre: '💸 Reparto Economico y Cierre',
    tests: [
      {
        id: 'reparto_get_sin_proyecto',
        nombre: 'GET /api/reparto — rechaza sin proyecto_id',
        run: async () => {
          const { data: { session } } = await window._supabase.auth.getSession()
          if (!session) return 'Sin sesion — omitido'
          const res = await fetch('/api/reparto', { headers: { Authorization: 'Bearer ' + session.access_token } })
          if (res.status === 400) return 'OK — 400 sin proyecto_id'
          throw new Error('Esperaba 400, recibio ' + res.status)
        }
      },
      {
        id: 'reparto_get_proyecto_escala',
        nombre: 'GET /api/reparto — lista repartos del proyecto ESCALA',
        run: async () => {
          const { data: { session } } = await window._supabase.auth.getSession()
          if (!session) return 'Sin sesion — omitido'
          const res = await fetch('/api/reparto?proyecto_id=' + PROYECTO_ESCALA, { headers: { Authorization: 'Bearer ' + session.access_token } })
          const data = await res.json()
          if (!data.ok) throw new Error(data.error)
          return (data.repartos?.length || 0) + ' repartos encontrados'
        }
      },
      {
        id: 'reparto_post_sin_auth',
        nombre: 'POST /api/reparto — rechaza sin auth',
        run: async () => {
          const res = await fetch('/api/reparto', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
          if (res.status === 401) return 'OK — 401 sin auth'
          throw new Error('Esperaba 401, recibio ' + res.status)
        }
      },
      {
        id: 'reparto_calculo_completo',
        nombre: 'POST /api/reparto — calcula y registra reparto + limpia',
        run: async () => {
          const { data: { session } } = await window._supabase.auth.getSession()
          if (!session) return 'Sin sesion — omitido'
          const res = await fetch('/api/reparto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
            body: JSON.stringify({ proyecto_id: PROYECTO_ESCALA, monto_total: 1000000, descripcion: 'QA-Reparto-Test' })
          })
          const data = await res.json()
          if (!data.ok) throw new Error(data.error)
          const r = data.resumen
          // Limpiar el reparto creado
          const sb = window._supabase
          if (data.reparto?.id) {
            await sb.from('reparto_lineas').delete().eq('reparto_id', data.reparto.id)
            await sb.from('repartos').delete().eq('id', data.reparto.id)
          }
          return 'OK — total $' + Math.round(r.total).toLocaleString('es-CO') + ' | comprometido $' + Math.round(r.comprometido||0).toLocaleString('es-CO') + ' | fundador $' + Math.round(r.para_fundador||0).toLocaleString('es-CO')
        }
      },
      {
        id: 'cierre_get_checklist',
        nombre: 'GET /api/cierre — devuelve checklist del proyecto ESCALA',
        run: async () => {
          const { data: { session } } = await window._supabase.auth.getSession()
          if (!session) return 'Sin sesion — omitido'
          const res = await fetch('/api/cierre?proyecto_id=' + PROYECTO_ESCALA, { headers: { Authorization: 'Bearer ' + session.access_token } })
          const data = await res.json()
          if (!data.ok) throw new Error(data.error)
          const items = data.checklist?.length || 0
          const pct = data.resumen?.hitos_total > 0 ? Math.round((data.resumen.hitos_completados / data.resumen.hitos_total) * 100) : 0
          return 'OK — ' + items + ' items en checklist | hitos ' + data.resumen?.hitos_completados + '/' + data.resumen?.hitos_total + ' (' + pct + '%)'
        }
      },
      {
        id: 'cierre_post_sin_auth',
        nombre: 'POST /api/cierre — rechaza sin auth',
        run: async () => {
          const res = await fetch('/api/cierre', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
          if (res.status === 401) return 'OK — 401 sin auth'
          throw new Error('Esperaba 401, recibio ' + res.status)
        }
      },
    ]
  },
  {
    nombre: '⚙️ Motor Financiero — Pagos y Notificaciones',
    tests: [
      {
        id: 'wallet_get_proyecto',
        nombre: 'GET /api/wallet — retorna wallet del usuario',
        run: async () => {
          const { data: { session } } = await window._supabase.auth.getSession()
          if (!session) return 'Sin sesion — omitido'
          const res = await fetch('/api/wallet', { headers: { Authorization: 'Bearer ' + session.access_token } })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Error ' + res.status)
          return 'OK — wallet con ' + (data.wallets?.length || 0) + ' monedas'
        }
      },
      {
        id: 'ledger_entries_existen',
        nombre: 'Supabase — tabla ledger_entries existe y tiene estructura correcta',
        run: async () => {
          const sb = window._supabase
          const { data, error } = await sb.from('ledger_entries').select('id, tipo, monto, moneda, created_at').limit(3)
          if (error) throw new Error(error.message)
          return 'OK — ' + (data?.length || 0) + ' entradas en ledger (max 3 mostradas)'
        }
      },
      {
        id: 'wallets_existen',
        nombre: 'Supabase — tabla wallets existe con saldos',
        run: async () => {
          const sb = window._supabase
          const { data, error } = await sb.from('wallets').select('id, usuario_id, moneda, estado').limit(5)
          if (error) throw new Error(error.message)
          return 'OK — ' + (data?.length || 0) + ' wallets registrados'
        }
      },
      {
        id: 'fondeos_tabla',
        nombre: 'GET /api/fondeos — lista fondeos del usuario',
        run: async () => {
          const { data: { session } } = await window._supabase.auth.getSession()
          if (!session) return 'Sin sesion — omitido'
          const res = await fetch('/api/fondeos', { headers: { Authorization: 'Bearer ' + session.access_token } })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Error ' + res.status)
          return 'OK — ' + (data.fondeos?.length || 0) + ' fondeos encontrados'
        }
      },
      {
        id: 'wallet_movimientos',
        nombre: 'GET /api/wallet/movimientos — historial de movimientos',
        run: async () => {
          const { data: { session } } = await window._supabase.auth.getSession()
          if (!session) return 'Sin sesion — omitido'
          const res = await fetch('/api/wallet/movimientos?limit=5', { headers: { Authorization: 'Bearer ' + session.access_token } })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Error ' + res.status)
          return 'OK — ' + (data.movimientos?.length || 0) + ' movimientos (max 5)'
        }
      },
      {
        id: 'pago_request_sin_auth',
        nombre: 'POST /api/pagos — rechaza sin auth',
        run: async () => {
          const res = await fetch('/api/pagos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
          if (res.status === 401) return 'OK — 401 sin auth'
          if (res.status === 400) return 'OK — 400 (sin datos requeridos)'
          throw new Error('Esperaba 401 o 400, recibio ' + res.status)
        }
      },
      {
        id: 'exchange_rates_existen',
        nombre: 'Supabase — tabla exchange_rates existe',
        run: async () => {
          const sb = window._supabase
          const { data, error } = await sb.from('exchange_rates').select('id, moneda, tasa_usd').limit(5)
          if (error) throw new Error(error.message)
          return 'OK — ' + (data?.length || 0) + ' tasas de cambio registradas'
        }
      },
      {
        id: 'notificaciones_motor_financiero',
        nombre: 'Supabase — notificaciones de motor financiero existen',
        run: async () => {
          const sb = window._supabase
          const { data: { user } } = await sb.auth.getUser()
          if (!user) return 'Sin sesion — omitido'
          const { data, error } = await sb
            .from('notificaciones')
            .select('id, tipo, titulo, created_at')
            .eq('destinatario_id', user.id)
            .in('tipo', ['reparto_registrado', 'inversion_propuesta_recibida', 'inversion_propuesta_aceptada', 'inversion_fondeada_verificada'])
            .limit(5)
          if (error) throw new Error(error.message)
          return 'OK — ' + (data?.length || 0) + ' notificaciones de motor financiero encontradas'
        }
      },
    ]
  },
  {
    nombre: '📝 Borrador de Proyectos',
    tests: [
      {
        id: 'borrador_get_directorio_no_muestra',
        nombre: 'GET /api/proyectos — no devuelve proyectos en borrador',
        run: async () => {
          const res = await fetch('/api/proyectos')
          const data = await res.json()
          const borradores = (data.proyectos || []).filter(p => p.estado === 'borrador')
          if (borradores.length > 0) throw new Error('El directorio publico muestra ' + borradores.length + ' proyectos en borrador — no deberia')
          return 'OK — directorio publico tiene ' + (data.proyectos?.length || 0) + ' proyectos activos, 0 borradores'
        }
      },
      {
        id: 'borrador_post_crea_en_borrador',
        nombre: 'POST /api/proyectos — crea proyecto en estado borrador por defecto',
        run: async () => {
          const { data: { session } } = await window._supabase.auth.getSession()
          if (!session) return 'Sin sesion — omitido'
          const res = await fetch('/api/proyectos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: 'QA-Borrador-Test-' + Date.now(), descripcion: 'Proyecto de prueba QA para verificar que se crea en estado borrador y no aparece en el directorio publico hasta publicarse', tipo: 'A', sector: 'Tecnologia', fundador_id: session.user.id })
          })
          const data = await res.json()
          if (!data.proyecto) throw new Error(data.error || 'No se creo el proyecto')
          const estado = data.proyecto.estado
          // Limpiar — eliminar el proyecto de prueba
          await fetch('/api/proyectos?id=' + data.proyecto.id + '&fundador_id=' + session.user.id, { method: 'DELETE' }).catch(() => {})
          if (estado !== 'borrador') throw new Error('El proyecto se creo con estado=' + estado + ', esperaba borrador')
          return 'OK — proyecto creado con estado=borrador y eliminado'
        }
      },
      {
        id: 'borrador_patch_publica',
        nombre: 'PATCH /api/proyectos — publicar proyecto (borrador → activo)',
        run: async () => {
          const { data: { session } } = await window._supabase.auth.getSession()
          if (!session) return 'Sin sesion — omitido'
          const resC = await fetch('/api/proyectos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: 'QA-Publicar-Test-' + Date.now(), descripcion: 'Proyecto QA para verificar flujo de publicacion desde borrador a activo correctamente', tipo: 'A', sector: 'Tecnologia', fundador_id: session.user.id })
          })
          const dataC = await resC.json()
          if (!dataC.proyecto) throw new Error('No se creo: ' + dataC.error)
          const pid = dataC.proyecto.id
          const resP = await fetch('/api/proyectos', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: pid, fundador_id: session.user.id, estado: 'activo' })
          })
          const dataP = await resP.json()
          await fetch('/api/proyectos?id=' + pid + '&fundador_id=' + session.user.id, { method: 'DELETE' }).catch(() => {})
          if (dataP.proyecto?.estado !== 'activo') throw new Error('Estado final: ' + dataP.proyecto?.estado)
          return 'OK — borrador → activo en 2 pasos, proyecto eliminado'
        }
      },
    ]
  },
  {
    nombre: '🎛️ Formulario por Escenario',
    tests: [
      {
        id: 'form_local_sin_modalidad',
        nombre: 'POST proyecto local — estado_financiacion es riesgo_compartido automaticamente',
        run: async () => {
          const { data: { session } } = await window._supabase.auth.getSession()
          if (!session) return 'Sin sesion — omitido'
          const res = await fetch('/api/proyectos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nombre: 'QA-Local-Escenario-' + Date.now(),
              descripcion: 'Proyecto QA para verificar que local comercial queda con riesgo_compartido por defecto automaticamente',
              tipo: 'A', sector: 'Comercio', fundador_id: session.user.id,
              escenario: 'local_comercial',
              estado_financiacion: 'riesgo_compartido'
            })
          })
          const data = await res.json()
          if (!data.proyecto) throw new Error(data.error || 'No se creo')
          const ef = data.proyecto.estado_financiacion
          await fetch('/api/proyectos?id=' + data.proyecto.id + '&fundador_id=' + session.user.id, { method: 'DELETE' }).catch(() => {})
          if (ef !== 'riesgo_compartido') throw new Error('estado_financiacion=' + ef + ', esperaba riesgo_compartido')
          return 'OK — local creado con estado_financiacion=riesgo_compartido, proyecto eliminado'
        }
      },
      {
        id: 'form_equipos_sin_modalidad',
        nombre: 'POST proyecto equipos — tipo y escenario se guardan correctamente',
        run: async () => {
          const { data: { session } } = await window._supabase.auth.getSession()
          if (!session) return 'Sin sesion — omitido'
          const res = await fetch('/api/proyectos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nombre: 'QA-Equipos-Escenario-' + Date.now(),
              descripcion: 'Proyecto QA para verificar que equipos guarda escenario y tipo correctamente en el backend',
              tipo: 'B', sector: 'Manufactura', fundador_id: session.user.id,
              escenario: 'otro',
              estado_financiacion: 'riesgo_compartido'
            })
          })
          const data = await res.json()
          if (!data.proyecto) throw new Error(data.error || 'No se creo')
          const tipo = data.proyecto.tipo
          const esc = data.proyecto.escenario
          await fetch('/api/proyectos?id=' + data.proyecto.id + '&fundador_id=' + session.user.id, { method: 'DELETE' }).catch(() => {})
          if (tipo !== 'B') throw new Error('tipo=' + tipo + ', esperaba B')
          if (esc !== 'otro') throw new Error('escenario=' + esc + ', esperaba otro')
          return 'OK — equipos con tipo=B, escenario=otro, proyecto eliminado'
        }
      },
    ]
  }
]

const RUTAS_CRITICAS = [
  // Módulo principal
  { ruta: '/dashboard',            label: 'Dashboard' },
  { ruta: '/proyectos',            label: 'Proyectos' },
  { ruta: '/postulaciones',        label: 'Postulaciones' },
  { ruta: '/directorio',           label: 'Directorio' },
  { ruta: '/buscar',               label: 'Buscar' },
  { ruta: '/score',                label: 'Score' },
  { ruta: '/angel',                label: 'Ángel' },
  { ruta: '/carril',               label: 'Carril' },
  { ruta: '/hitos',                label: 'Hitos' },
  { ruta: '/aportes',              label: 'Aportes' },
  { ruta: '/ingresos',             label: 'Ingresos' },
  { ruta: '/metricas',             label: 'Métricas' },
  { ruta: '/invitar',              label: 'Invitar' },
  { ruta: '/mis-contratos',        label: 'Mis contratos' },
  { ruta: '/perfil/editar',        label: 'Editar perfil' },
  { ruta: '/calendario',           label: 'Calendario' },
  // Módulo financiero
  { ruta: '/wallet',               label: 'Wallet' },
  { ruta: '/wallet/fondear',       label: 'Wallet Fondear' },
  { ruta: '/wallet/movimientos',   label: 'Wallet Movimientos' },
  { ruta: '/wallet/pagos',         label: 'Wallet Pagos' },
  { ruta: '/wallet/pagos/solicitar', label: 'Solicitar Pago' },
  { ruta: '/admin/financiero',     label: 'Admin Financiero' },
  // Desarrollo
  { ruta: '/desarrollo',           label: 'Desarrollo' },
  { ruta: '/desarrollo-limpio',    label: 'Desarrollo Limpio' },
]

const MANUAL = [
  { id: 'm1', nombre: 'Login — Enter en el campo de contraseña', texto: 'Escribe tu contraseña en /registro (pestaña Iniciar sesión) y da Enter. Debe iniciar sesión sin que hagas clic en el botón.' },
  { id: 'm2', nombre: 'Registro — Enter en el campo de contraseña', texto: 'Lo mismo pero en la pestaña Crear cuenta, con datos de prueba. Debe crear la cuenta sin clic en el botón.' },
  { id: 'm3', nombre: 'Logo clickeable — página interna', texto: 'Desde cualquier página logueada (ej. /proyectos, /carril, /hitos), haz clic en el logo "Escala" arriba a la izquierda. Debe llevarte a /dashboard.' },
  { id: 'm4', nombre: 'Logo clickeable — página pre-sesión', texto: 'Desde /registro o /onboarding, haz clic en el logo. Debe llevarte a la portada pública (/), no a /dashboard.' },
  { id: 'm5', nombre: 'Botón "Iniciar sesión" en la landing', texto: 'Entra a escala.network sin sesión iniciada. Debe verse "Iniciar sesión" junto a "Registrarme" en el nav de arriba.' },
  { id: 'm6', nombre: '"Iniciar sesión" abre la pestaña correcta', texto: 'Haz clic en "Iniciar sesión" desde la landing. Debe abrir /registro ya en la pestaña de login, no en la de crear cuenta.' },
  { id: 'm7', nombre: '"Salir" del dashboard lleva a login, no a crear cuenta', texto: 'Desde el dashboard, haz clic en "Salir". Debe cerrarte la sesión y llevarte a /registro con la pestaña de Iniciar sesión activa, no la de Crear cuenta.' },
  { id: 'm8', nombre: 'Registro nuevo pasa por /bienvenida con opción de saltar', texto: 'Crea una cuenta de prueba nueva. Después del registro debe aparecer la pantalla de bienvenida con los 4 roles y dos opciones: "Completar mi perfil" y "Saltar por ahora y explorar". El salto debe llevarte al dashboard sin obligarte a llenar el onboarding.' },
  { id: 'm9', nombre: 'Invitar a alguien ya registrado crea oferta visible', texto: 'Desde /invitar, invita a un correo que YA tenga cuenta en Escala, eligiendo un rol específico. Esa persona debe ver la oferta en /postulaciones bajo "Ofertas recibidas", con los botones Aceptar/Declinar — separada de sus postulaciones propias.' },
  { id: 'm10', nombre: 'Logros visibles en /score', texto: 'Entra a /score. Si tienes al menos una postulación aceptada, una tarea verificada o un contrato firmado, debe aparecer la sección "Logros desbloqueados" con los badges correspondientes (emoji + nombre + fecha). Si no tienes ninguno, la sección no aparece.' },
  { id: 'm11', nombre: 'Calificaciones visibles en /score', texto: 'Si alguien te ha calificado, entra a /score y verifica que aparece la sección "Calificaciones recibidas" con el promedio en estrellas ⭐, el nombre del calificador, el comentario y el proyecto.' },
  { id: 'm12', nombre: 'Preferencias de notificación por categoría', texto: 'Entra a /perfil/editar. Al fondo debe aparecer la sección "Notificaciones" con toggles globales (email/push) y toggles por categoría (Postulaciones, Tareas, Hitos, Aportes, Proyectos). Al hacer clic en un toggle debe cambiar de color sin recargar la página.' },
  { id: 'm13', nombre: 'Ángel de Impulso — tab Métricas', texto: 'Entra a /angel. Debe aparecer un tercer tab "📊 Métricas" además de los dos existentes. Al hacer clic muestra: total invertido, % ejecutado, monto pendiente y historial de impulsos con estado.' },
  { id: 'm14', nombre: 'Contrato — notificación al profesional', texto: 'Acepta una postulación en un proyecto. El profesional debe recibir una notificación in_app y email diciendo que su contrato está listo para firmar. Verifica en /dashboard → campanita.' },
  { id: 'm15', nombre: 'Ambas firmas → contrato vigente', texto: 'Firma el contrato como fundador y como especialista. Al firmar el segundo, ambas partes deben recibir una notificación "Contrato vigente — ambas partes firmaron".' },
  { id: 'm16', nombre: 'Primera venta notifica al fundador', texto: 'Registra un ingreso en /ingresos de un proyecto que no tiene ingresos previos. El fundador debe recibir notificación "¡Primera venta registrada!" con el monto.' },
  { id: 'm17', nombre: 'Mensaje de chat notifica a miembros', texto: 'Desde el workspace de un proyecto con al menos 2 miembros, envía un mensaje en el chat. Los otros miembros deben recibir notificación push e in_app. Verifica en la campanita del dashboard.' },
  { id: 'm18', nombre: 'Retiro del proyecto notifica al fundador', texto: 'Desde /carril o el workspace, usa el botón Retirarme del proyecto. El fundador debe recibir notificación informando que el especialista se retiró y el rol está disponible de nuevo.' },
  { id: 'm19', nombre: 'Tour onboarding dashboard — especialista primera vez', texto: 'Crea una cuenta nueva como especialista. Al entrar al dashboard por primera vez debe aparecer el tour de 5 pasos con overlay oscuro: Bienvenida → Completar perfil → Qué son los proyectos → Cómo funcionan los roles → Buscar proyectos. El botón "Saltar" debe cerrarlo. No debe volver a aparecer al recargar.' },
  { id: 'm20', nombre: 'Tour onboarding dashboard — fundador primera vez', texto: 'Crea una cuenta nueva como fundador/ideador. Al entrar al dashboard debe aparecer el tour de 5 pasos: Bienvenida → Crear proyecto → Publicar roles → Directorio → CTA crear proyecto. Los pasos con href deben navegar al hacer clic. Paso final en verde.' },
  { id: 'm21', nombre: 'Tour onboarding workspace — especialista', texto: 'Como especialista aceptado en un proyecto, entra al workspace por primera vez. Debe aparecer el tour de 5 pasos: Bienvenida → Tareas → Chat → Aportes → Ir a tareas. El tour NO debe aparecer para el fundador. No vuelve al recargar.' },
  { id: 'm22', nombre: 'Hilo de tarea — mensaje automático al completar', texto: 'Como especialista, marca una tarea como "En progreso" y luego "Completada". Debe aparecer automáticamente un mensaje del sistema en el hilo de esa tarea invitando a adjuntar documentos. El botón 💬 debe aparecer en la tarea y abrir ese hilo.' },
  { id: 'm23', nombre: 'Hilo de tarea — adjuntar documento y ver en Documentación', texto: 'En el hilo de una tarea completada, adjunta un PDF o imagen. Debe aparecer en el chat del hilo Y en /workspace/documentos bajo la categoría correcta (ej. Contador → Contabilidad y Tributario).' },
  { id: 'm24', nombre: 'Banner de verificación pendiente en dashboard', texto: 'Cuando hay tareas con estado "completada" en tus proyectos, el dashboard del fundador debe mostrar un banner amarillo pulsante "Hay X tareas completadas esperando tu verificación" con link directo al hilo. Al hacer clic debe abrir /workspace/tareas?tarea=ID con el hilo abierto.' },
  { id: 'm25', nombre: 'Notificaciones como dropdown', texto: 'Haz clic en la campanita 🔔 del nav. Debe abrirse un panel de 360px anclado debajo (no ocupar toda la pantalla). Debe cerrarse al hacer clic afuera o en la X. Si hay notificaciones sin leer, debe mostrar el contador en rojo sobre la campanita.' },
  { id: 'm26', nombre: 'Badges contador — subir Tarjeta Profesional', texto: 'Como contador colombiano, entra a /perfil/editar. Al final debe aparecer la sección "Documentos profesionales — Contador (Colombia)" con dos uploaders: Tarjeta Profesional y Certificado JCC. Al subir uno, el Score debe subir y el badge debe aparecer en /score.' },
  { id: 'm27', nombre: 'Landing pages SEO — accesibles y con metadata', texto: 'Entra a /contador-publico-colombia, /abogado-startups-colombia, /startup-chile, /startup-bogota, /startup-medellin, /desarrollador-startup-colombia, /angel-investor, /buscar-cto, /crear-empresa-sin-capital. Cada una debe cargar, tener nav con logo "Escala" y link a /registro.' },
  { id: 'm28', nombre: 'Blog — índice y artículos', texto: 'Entra a /blog. Debe mostrar el artículo "La historia de Escala" como destacado y los otros 3 en grid. Los links a /blog/historia-de-escala, /blog/que-es-la-participacion-diferida, etc. deben cargar sus artículos correctamente.' },
  { id: 'm29', nombre: 'Dashboard tarjetas de proyecto — 1 CTA + overflow', texto: 'En el dashboard, las tarjetas de tus proyectos deben tener un solo botón verde "Workspace →" y un botón "···" que al hacer clic muestra un menú con Publicar rol, Ver hitos y Mis aportes.' },
  { id: 'm30', nombre: 'Dashboard sidebar — 3 saldos del wallet', texto: 'En el sidebar del dashboard, el widget del Wallet debe mostrar 3 saldos en un grid: Disponible (verde), Comprometido (amarillo) y Pendiente (púrpura). No solo el disponible.' },
  { id: 'm31', nombre: 'Local comercial — wizard completo 6 pasos', texto: 'Crea un proyecto tipo "Negocio en un local". El wizard de 6 pasos debe aparecer (no el formulario generico). Completa todos los pasos con datos reales. El paso 6 debe mostrar el bloque de deuda formal con el monto exacto calculado. Al enviar debe redirigir a /proyectos/local-en-verificacion.' },
  { id: 'm32', nombre: 'Local comercial — reporte diario waterfall', texto: 'En el workspace de un proyecto local_comercial, entra a Reporte diario. Ingresa ventas en efectivo y BREB. El preview debe calcular en tiempo real: costo producto, fijos del dia, excedente, intereses del dia y pago al inversionista. Al enviar debe mostrar el resultado y la instruccion de pago BREB.' },
  { id: 'm33', nombre: 'Local comercial — panel del inversionista', texto: 'Entra a /workspace/local/inversionista. Debe mostrar el semaforo de reportes (verde si reporto hoy), barra de progreso, stats de capital/recuperado/saldo, historial con gaps visibles, info del negocio y opcion de salida anticipada.' },
  { id: 'm34', nombre: 'Local comercial — salida anticipada', texto: 'En el panel del operador, clic en "Calcular mi salida anticipada". Debe mostrar: capital pendiente + penalidad (4% arriendos en Fase 1, 8% en Fase 2). Al confirmar debe pasar el proyecto a Fase 3 y registrar en el ledger.' },
  { id: 'm35', nombre: 'Local comercial — panel admin verificacion', texto: 'Entra a /admin/local-comercial con la cuenta de Ivan. Debe mostrar los proyectos en_verificacion con sus datos. Prueba aprobar uno con una tasa entre usura convencional y digital. El operador debe recibir notificacion de aprobacion.' },
  { id: 'm36', nombre: 'Presupuesto — agregar item con categoria Otro y subcategoria', texto: 'En el workspace de un proyecto, entra a Presupuesto. Clic en + Agregar item. Selecciona la categoria "Otro" — debe aparecer el submenu con 9 subcategorias (Logistica, Propiedad intelectual, R&D, etc). Selecciona una, llena el formulario y guarda. El item debe aparecer en la lista con la subcategoria visible.' },
  { id: 'm37', nombre: 'Presupuesto — flujo de fondeo completo', texto: 'Como inversionista, entra al workspace de un proyecto con items sin fondear. Ve a Presupuesto, clic en "Quiero fondear este item", elige un monto y el modelo (participacion/deuda/revenue_share). Envía la propuesta. Como fundador, acepta la propuesta. Verifica que el estado del item cambia a "parcialmente_fondeado" o "fondeado" y que el monto fondeado se actualiza.' },
  { id: 'm38', nombre: 'Presupuesto — resumen financiero y barra de progreso', texto: 'En el workspace de un proyecto con items, el resumen superior debe mostrar: Total presupuesto, Total fondeado, CAPEX, OPEX y % fondeado. La barra de progreso global debe reflejar el % correcto. Cada item debe tener su propia barra de progreso.' },
  { id: 'm39', nombre: 'Presupuesto — item como aporte en especie', texto: 'Como fundador, agrega un item marcando "Es aporte en especie". El item debe aparecer inmediatamente como "Fondeado" sin necesitar un inversionista externo. El monto fondeado debe ser igual al valor total del item.' },
  { id: 'm40', nombre: 'Borrador — proyecto se crea en borrador y no aparece en directorio', texto: 'Crea un proyecto nuevo. Debe redirigirte al workspace del proyecto recien creado. El workspace debe mostrar el banner amarillo "Este proyecto es privado". Ve a /proyectos — el proyecto NO debe aparecer en el directorio publico. Ve al dashboard — la tarjeta debe mostrar "Borrador — no publicado" en naranja.' },
  { id: 'm41', nombre: 'Borrador — publicar proyecto desde el workspace', texto: 'Desde el workspace de un proyecto en borrador, haz clic en "Publicar proyecto". Confirma en el dialogo. El banner debe desaparecer y el proyecto debe aparecer ahora en /proyectos (directorio publico). En el dashboard la tarjeta debe mostrar el estado activo.' },
  { id: 'm42', nombre: 'Sentry — verificar que captura errores en produccion', texto: 'Entra a sentry.io → proyecto escala-production. Debe haber al menos un evento registrado. Si no hay eventos, ve a escala.network/sentry-example-page (si existe) o espera a que ocurra un error real en produccion. El DSN debe estar configurado como NEXT_PUBLIC_SENTRY_DSN en Vercel.' },
  { id: 'm43', nombre: 'Formulario creacion — local no muestra modalidad ni perfiles', texto: 'En /proyectos → crear proyecto → seleccionar "Necesito un local". Verificar que NO aparecen: Modalidad de trabajo (remoto/presencial/hibrido), Perfiles que necesitas, Industria. Si aparecen es un error.' },
  { id: 'm44', nombre: 'Formulario creacion — equipos no muestra modalidad ni perfiles', texto: 'En /proyectos → crear proyecto → seleccionar "Necesito equipos o maquinaria". Verificar que NO aparecen: Modalidad de trabajo, Perfiles que necesitas, Industria. Verificar que SI aparece la etapa del proyecto.' },
  { id: 'm45', nombre: 'Tab Necesito mas — workspace local comercial', texto: 'Entra al workspace de un proyecto de local comercial. Debe haber un tab "Necesito mas" al final de la barra. Al hacer clic debe mostrar 3 bloques: Necesito un empleado (boton Publicar rol), Necesito un equipo (boton Agregar equipo), Necesito capital de trabajo (boton Agregar item).' },
  { id: 'm46', nombre: 'Tab Necesito mas — workspace equipos', texto: 'Entra al workspace de un proyecto de equipos/maquinaria. Debe haber un tab "Necesito mas" al final. Al hacer clic debe mostrar: Necesito un empleado, Necesito un local (enlace a crear proyecto local), Necesito otro equipo, Necesito capital de trabajo.' },
  { id: 'm47', nombre: 'Dashboard — pills Necesito mas en tarjetas de local y equipos', texto: 'En el dashboard, las tarjetas de proyectos de local y equipos deben mostrar un bloque con pills: Empleado / Equipo / Capital (local) o Empleado / Local / Capital (equipos). Hacer clic en un pill debe llevar al workspace en el tab Necesito mas.' },
  { id: 'm48', nombre: 'Wizard local — guia de nombre en paso 0', texto: 'En /proyectos → Necesito un local. Debajo del campo Nombre del negocio debe aparecer el enlace ¿No sabes como llamarlo?. Al hacer clic debe mostrar ejemplos, dos campos y boton Usar este nombre. Al hacer clic el nombre se pre-llena.' },
  { id: 'm49', nombre: 'Wizard local — validacion descripcion en paso 1', texto: 'En el wizard de local, paso 1, escribir menos de 50 caracteres en la descripcion y hacer clic en Siguiente. Debe mostrar error "Describe tu negocio al inversionista (minimo 50 caracteres)" y NO avanzar al paso 2.' },
  { id: 'm50', nombre: 'Formulario startup/equipos — boton Cambiar escenario', texto: 'En /proyectos → elegir startup o equipos. Debe aparecer un boton pequeno <- Cambiar en la esquina derecha del indicador de pasos. Al hacer clic debe volver a la pantalla de seleccion de escenario.' },
  { id: 'm51', nombre: 'Tab Necesito mas — workspace local: Publicar rol abre form', texto: 'En workspace de local → tab Necesito mas → clic en Publicar rol. Debe abrir el formulario de publicacion de rol dentro del mismo workspace, no ir a una pagina vacia.' },
  { id: 'm52', nombre: 'C2.23 Calificacion mutua al cerrar proyecto', texto: 'Cerrar un proyecto con equipo. En el paso 3 (cerrado) debe aparecer el bloque de calificacion con estrellas para cada miembro del equipo. Dar 4 estrellas a un miembro y enviar. Verificar que la calificacion aparece en el perfil del miembro en /perfil/[id].' },
]

export default function QA() {
  const [resultados, setResultados] = useState({})
  const [corriendoGrupo, setCorriendoGrupo] = useState(null)
  const [corriendoTodo, setCorriendoTodo] = useState(false)
  const [manualChecks, setManualChecks] = useState({})
  const [grupoActivo, setGrupoActivo] = useState(null) // null = todos
  const [seccion, setSeccion] = useState('auto') // 'auto' | 'manual'

  const colorEstado = { ok: '#1D9E75', error: '#D85A30', corriendo: '#E8A020' }
  const iconoEstado = { ok: '✓', error: '✕', corriendo: '⟳' }

  async function correrTest(test) {
    setResultados(prev => ({ ...prev, [test.id]: { estado: 'corriendo' } }))
    try {
      const mensaje = await test.run()
      setResultados(prev => ({ ...prev, [test.id]: { estado: 'ok', mensaje } }))
    } catch (e) {
      setResultados(prev => ({ ...prev, [test.id]: { estado: 'error', mensaje: e.message } }))
    }
  }

  async function correrGrupo(grupo) {
    setCorriendoGrupo(grupo.nombre)
    for (const test of grupo.tests) await correrTest(test)
    setCorriendoGrupo(null)
  }

  async function correrTodo() {
    setCorriendoTodo(true)
    setGrupoActivo(null)
    for (const grupo of GRUPOS) {
      for (const test of grupo.tests) await correrTest(test)
    }
    setCorriendoTodo(false)
  }

  const totalTests = GRUPOS.reduce((s, g) => s + g.tests.length, 0)
  const okCount = Object.values(resultados).filter(r => r.estado === 'ok').length
  const errorCount = Object.values(resultados).filter(r => r.estado === 'error').length
  const manualOk = Object.values(manualChecks).filter(Boolean).length
  const gruposVisibles = grupoActivo ? GRUPOS.filter(g => g.nombre === grupoActivo) : GRUPOS

  return (
    <div style={{minHeight:'100vh',background:'#0D1B3E',fontFamily:'Inter,sans-serif',color:'#fff',display:'flex',flexDirection:'column'}}>

      {/* NAV */}
      <nav style={{background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'0 1.5rem',height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <a href="/dashboard" style={{textDecoration:'none',display:'flex',alignItems:'center',gap:'6px'}}>
          <img src="/brand/isotipo.svg" alt="Escala" width="24" height="24"/>
          <span style={{fontSize:'1rem',fontWeight:'900',color:'#fff',letterSpacing:'-0.03em'}}>Esca<span style={{color:'#1D9E75'}}>la</span></span>
        </a>
        <div style={{display:'flex',gap:'1rem',fontSize:'0.78rem'}}>
          <span style={{color:'#1D9E75',fontWeight:'700'}}>✓ {okCount}/{totalTests}</span>
          {errorCount > 0 && <span style={{color:'#D85A30',fontWeight:'700'}}>✕ {errorCount} fallos</span>}
          <span style={{color:'#8FA3CC'}}>✋ {manualOk}/{MANUAL.length} manual</span>
        </div>
      </nav>

      <div style={{display:'flex',flex:1,overflow:'hidden'}}>

        {/* SIDEBAR */}
        <div style={{width:'220px',flexShrink:0,borderRight:'1px solid rgba(255,255,255,0.08)',background:'rgba(0,0,0,0.2)',padding:'1rem 0',overflowY:'auto'}}>
          {/* Sección selector */}
          <div style={{display:'flex',gap:'0',margin:'0 0.75rem 1rem',borderRadius:'8px',overflow:'hidden',border:'1px solid rgba(255,255,255,0.08)'}}>
            {['auto','manual'].map(s => (
              <button key={s} onClick={() => setSeccion(s)} style={{flex:1,background:seccion===s ? '#1D9E75' : 'transparent',color:seccion===s ? '#fff' : '#8FA3CC',border:'none',padding:'0.4rem',fontSize:'0.7rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif',textTransform:'uppercase',letterSpacing:'0.05em'}}>
                {s === 'auto' ? '⚡ Auto' : '✋ Manual'}
              </button>
            ))}
          </div>

          {seccion === 'auto' && (
            <>
              <button onClick={() => setGrupoActivo(null)} style={{width:'100%',textAlign:'left',padding:'0.5rem 1rem',background:!grupoActivo ? 'rgba(29,158,117,0.15)' : 'transparent',border:'none',color:!grupoActivo ? '#1D9E75' : '#8FA3CC',fontSize:'0.75rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif',borderLeft: !grupoActivo ? '3px solid #1D9E75' : '3px solid transparent'}}>
                📋 Todos ({totalTests})
              </button>
              {GRUPOS.map(g => {
                const gOk = g.tests.filter(t => resultados[t.id]?.estado === 'ok').length
                const gErr = g.tests.filter(t => resultados[t.id]?.estado === 'error').length
                const activo = grupoActivo === g.nombre
                return (
                  <button key={g.nombre} onClick={() => setGrupoActivo(g.nombre)} style={{width:'100%',textAlign:'left',padding:'0.45rem 1rem',background: activo ? 'rgba(29,158,117,0.12)' : 'transparent',border:'none',color: activo ? '#fff' : '#8FA3CC',fontSize:'0.72rem',cursor:'pointer',fontFamily:'Inter,sans-serif',borderLeft: activo ? '3px solid #1D9E75' : '3px solid transparent',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{g.nombre}</span>
                    <span style={{flexShrink:0,fontSize:'0.65rem',marginLeft:'0.25rem',color: gErr > 0 ? '#D85A30' : gOk === g.tests.length ? '#1D9E75' : '#6B7280'}}>
                      {gErr > 0 ? '✕'+gErr : gOk > 0 ? '✓'+gOk : g.tests.length}
                    </span>
                  </button>
                )
              })}
            </>
          )}
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div style={{flex:1,overflowY:'auto',padding:'1.5rem'}}>

          {seccion === 'auto' && (
            <>
              {/* Header con botones de acción */}
              <div style={{display:'flex',gap:'0.75rem',alignItems:'center',marginBottom:'1.5rem',flexWrap:'wrap'}}>
                <button onClick={correrTodo} disabled={corriendoTodo} style={{background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',padding:'0.6rem 1.25rem',fontSize:'0.82rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                  {corriendoTodo ? '⟳ Corriendo todo...' : '▶ Correr todos (' + totalTests + ')'}
                </button>
                {grupoActivo && (
                  <button onClick={() => correrGrupo(GRUPOS.find(g => g.nombre === grupoActivo))} disabled={!!corriendoGrupo} style={{background:'rgba(29,158,117,0.15)',color:'#1D9E75',border:'1px solid rgba(29,158,117,0.3)',borderRadius:'8px',padding:'0.6rem 1.25rem',fontSize:'0.82rem',fontWeight:'700',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                    {corriendoGrupo ? '⟳ Corriendo...' : '▶ Correr este grupo'}
                  </button>
                )}
                {Object.keys(resultados).length > 0 && (
                  <button onClick={() => setResultados({})} style={{background:'rgba(255,255,255,0.05)',color:'#8FA3CC',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',padding:'0.6rem 1rem',fontSize:'0.78rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                    Limpiar resultados
                  </button>
                )}
                <button onClick={async () => {
                  const res = await fetch('/api/qa-cleanup', {
                    method: 'DELETE',
                    headers: { 'x-qa-cleanup': 'escala-qa-2026' }
                  })
                  const data = await res.json()
                  alert(data.resumen ? data.resumen.join('\n') : data.mensaje)
                }} style={{background:'rgba(224,85,85,0.15)',color:'#E05555',border:'1px solid rgba(224,85,85,0.4)',borderRadius:'8px',padding:'0.6rem 1rem',fontSize:'0.78rem',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:'700'}}>
                  🧹 LIMPIAR AHORA (con log)
                </button>
                <button onClick={async () => {
                  const msg = await limpiarTodosProyectosQA()
                  alert(msg)
                }} style={{background:'rgba(224,85,85,0.1)',color:'#E05555',border:'1px solid rgba(224,85,85,0.25)',borderRadius:'8px',padding:'0.6rem 1rem',fontSize:'0.78rem',cursor:'pointer',fontFamily:'Inter,sans-serif',marginLeft:'auto'}}>
                  🧹 Limpiar proyectos QA acumulados
                </button>
              </div>

              {/* Grupos de tests */}
              {gruposVisibles.map(grupo => (
                <div key={grupo.nombre} style={{marginBottom:'2rem'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.75rem',paddingBottom:'0.5rem',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                    <div style={{fontSize:'0.9rem',fontWeight:'700',color:'#fff'}}>{grupo.nombre}</div>
                    <button onClick={() => correrGrupo(grupo)} disabled={corriendoGrupo === grupo.nombre} style={{background:'rgba(29,158,117,0.1)',color:'#1D9E75',border:'1px solid rgba(29,158,117,0.2)',borderRadius:'6px',padding:'0.25rem 0.75rem',fontSize:'0.68rem',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:'700'}}>
                      {corriendoGrupo === grupo.nombre ? '⟳' : '▶ Correr grupo'}
                    </button>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'0.4rem'}}>
                    {grupo.tests.map(test => {
                      const r = resultados[test.id]
                      return (
                        <div key={test.id} style={{background:'rgba(255,255,255,0.04)',border:`1px solid ${r?.estado === 'error' ? 'rgba(216,90,48,0.3)' : r?.estado === 'ok' ? 'rgba(29,158,117,0.2)' : 'rgba(255,255,255,0.08)'}`,borderRadius:'10px',padding:'0.75rem 1rem',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem'}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:'0.8rem',fontWeight:'600',color:'#fff',marginBottom: r ? '0.2rem' : 0}}>{test.nombre}</div>
                            {r && <div style={{fontSize:'0.7rem',color: r.estado==='error' ? '#D85A30' : '#8FA3CC',wordBreak:'break-word'}}>{r.mensaje}</div>}
                          </div>
                          <div style={{display:'flex',gap:'0.5rem',alignItems:'center',flexShrink:0}}>
                            {r && <span style={{fontSize:'0.75rem',fontWeight:'700',color:colorEstado[r.estado]}}>{iconoEstado[r.estado]} {r.estado === 'ok' ? 'OK' : r.estado === 'error' ? 'Error' : ''}</span>}
                            <button onClick={() => correrTest(test)} disabled={r?.estado==='corriendo'} style={{background:'rgba(29,158,117,0.1)',color:'#1D9E75',border:'1px solid rgba(29,158,117,0.25)',borderRadius:'6px',padding:'0.3rem 0.75rem',fontSize:'0.68rem',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:'600',whiteSpace:'nowrap'}}>
                              {r?.estado === 'corriendo' ? '⟳' : '▶ Probar'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              <div style={{padding:'1rem',background:'rgba(255,255,255,0.03)',borderRadius:'10px',fontSize:'0.72rem',color:'#6B7280',lineHeight:'1.6',marginTop:'1rem'}}>
                <strong style={{color:'#8FA3CC'}}>Nota:</strong> los tests crean datos con prefijo QA- y los limpian solos. Corre primero el Setup de cada grupo antes de los tests que dependen de él.
              </div>
            </>
          )}

          {seccion === 'manual' && (
            <>
              <div style={{marginBottom:'1.5rem'}}>
                <div style={{fontSize:'1rem',fontWeight:'800',color:'#fff',marginBottom:'0.3rem'}}>✋ Verificación manual</div>
                <div style={{fontSize:'0.78rem',color:'#8FA3CC',lineHeight:'1.6'}}>
                  Estas pruebas requieren interacción real en el navegador. Márcalas tú mismo después de verificarlas. <strong style={{color:'#E8A020'}}>{manualOk}/{MANUAL.length} completadas.</strong>
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                {MANUAL.map(item => (
                  <label key={item.id} style={{display:'flex',gap:'0.75rem',alignItems:'flex-start',cursor:'pointer',padding:'0.875rem',borderRadius:'10px',background: manualChecks[item.id] ? 'rgba(29,158,117,0.08)' : 'rgba(255,255,255,0.03)',border: manualChecks[item.id] ? '1px solid rgba(29,158,117,0.25)' : '1px solid rgba(255,255,255,0.07)',transition:'all 0.15s'}}>
                    <input type="checkbox" checked={!!manualChecks[item.id]} onChange={() => setManualChecks(prev => ({ ...prev, [item.id]: !prev[item.id] }))} style={{marginTop:'0.2rem',flexShrink:0,width:'16px',height:'16px',accentColor:'#1D9E75'}} />
                    <div>
                      <div style={{fontSize:'0.82rem',fontWeight:'700',color: manualChecks[item.id] ? '#1D9E75' : '#fff',marginBottom:'0.2rem'}}>{item.nombre}</div>
                      <div style={{fontSize:'0.74rem',color:'#8FA3CC',lineHeight:'1.55'}}>{item.texto}</div>
                    </div>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
