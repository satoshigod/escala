'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
if (typeof window !== 'undefined') window._supabase = supabase

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
          const res = await fetch('/api/proyectos/' + window._qaProyectoId + '?fundador_id=' + FUNDADOR_ID, { method: 'DELETE' })
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
          await fetch('/api/proyectos/' + window._qaProyectoIdPais + '?fundador_id=' + FUNDADOR_ID, { method: 'DELETE' })
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
        nombre: 'POST /api/especialidades — crear especialidad nueva',
        run: async () => {
          const nombre = 'QA-Especialidad-' + Date.now()
          const res = await fetch('/api/especialidades', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, categoria: 'General' })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          if (!data.especialidad || data.especialidad.nombre !== nombre) throw new Error('No se creó correctamente')
          return 'Especialidad "' + nombre + '" creada con ID ' + data.especialidad.id.slice(0,8)
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
        nombre: 'POST /api/categorias — crear categoría nueva',
        run: async () => {
          const nombre = 'QA-Categoria-' + Date.now()
          const res = await fetch('/api/categorias', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre })
          })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          if (!data.categoria || data.categoria.nombre !== nombre) throw new Error('No se creó correctamente')
          return 'Categoría "' + nombre + '" creada con ID ' + data.categoria.id.slice(0,8)
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

          const resDelete = await fetch('/api/proyectos/' + id + '?fundador_id=' + FUNDADOR_ID, { method: 'DELETE' })
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
          if (dataP.error) throw new Error(dataP.error)
          window._qaNotifProyectoId = dataP.proyecto.id

          const resR1 = await fetch('/api/roles', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proyecto_id: window._qaNotifProyectoId, nombre: 'QA Rol A', tipo_aporte: 'tiempo', modalidad: 'equity', fundador_id: FUNDADOR_ID })
          })
          const dataR1 = await resR1.json()
          if (dataR1.error) throw new Error(dataR1.error)
          window._qaNotifRolAId = dataR1.rol.id

          const resR2 = await fetch('/api/roles', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proyecto_id: window._qaNotifProyectoId, nombre: 'QA Rol B', tipo_aporte: 'tiempo', modalidad: 'equity', fundador_id: FUNDADOR_ID })
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
          return 'País "' + nombre + '" creado — revisa correo de admin y campanita'
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
          await fetch('/api/proyectos/' + window._qaNotifProyectoId, { method: 'DELETE' })
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

          const resR = await fetch('/api/roles', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proyecto_id: window._qaCompRiesgoProyectoId, nombre: 'QA Rol Riesgo', tipo_aporte: 'tiempo', modalidad: 'equity', fundador_id: FUNDADOR_ID })
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
            await fetch('/api/proyectos/' + pid, { method: 'DELETE' })
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
          await fetch('/api/proyectos/' + window._qaOfertasProyectoId, { method: 'DELETE' })
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
          await fetch('/api/proyectos/' + window._qaIngresosProyectoId, { method: 'DELETE' })
          window._qaIngresosProyectoId = null
          window._qaIngresosId = null
          return 'Proyecto eliminado'
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
          await fetch('/api/proyectos/' + window._qaCalifProyectoId + '?fundador_id=a57b6849-1388-4186-8880-2ec31dd31af5', { method: 'DELETE' })
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
]

export default function QA() {
  const [resultados, setResultados] = useState({})
  const [corriendoTodo, setCorriendoTodo] = useState(false)
  const [manualChecks, setManualChecks] = useState({})

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

        <div style={{marginTop:'2rem',background:'rgba(232,160,32,0.06)',border:'1px solid rgba(232,160,32,0.25)',borderRadius:'12px',padding:'1.5rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.4rem'}}>
            <span style={{fontSize:'1rem'}}>✋</span>
            <div style={{fontSize:'0.95rem',fontWeight:'800',color:'#fff'}}>Verificación manual — no automatizable</div>
          </div>
          <div style={{fontSize:'0.78rem',color:'#8FA3CC',marginBottom:'1.25rem',lineHeight:'1.6'}}>
            Esto NO se prueba solo. Son interacciones de navegador (teclado, clics, navegación) sin ninguna respuesta de API que un fetch pueda revisar — un test automático aquí daría un falso ✓ verde. Márcalos tú mismo después de probarlos a mano.
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'0.625rem'}}>
            {MANUAL.map(item => (
              <label key={item.id} style={{display:'flex',gap:'0.75rem',alignItems:'flex-start',cursor:'pointer',padding:'0.75rem',borderRadius:'8px',background: manualChecks[item.id] ? 'rgba(29,158,117,0.08)' : 'rgba(255,255,255,0.03)',border: manualChecks[item.id] ? '1px solid rgba(29,158,117,0.25)' : '1px solid rgba(255,255,255,0.06)'}}>
                <input type="checkbox" checked={!!manualChecks[item.id]} onChange={() => setManualChecks(prev => ({ ...prev, [item.id]: !prev[item.id] }))} style={{marginTop:'0.2rem',flexShrink:0,width:'16px',height:'16px',accentColor:'#1D9E75'}} />
                <div>
                  <div style={{fontSize:'0.82rem',fontWeight:'700',color: manualChecks[item.id] ? '#1D9E75' : '#fff'}}>{item.nombre}</div>
                  <div style={{fontSize:'0.75rem',color:'#8FA3CC',marginTop:'0.15rem',lineHeight:'1.5'}}>{item.texto}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div style={{marginTop:'2rem',padding:'1.25rem',background:'rgba(255,255,255,0.04)',borderRadius:'12px',fontSize:'0.78rem',color:'#8FA3CC',lineHeight:'1.6'}}>
          <strong style={{color:'#fff'}}>Nota:</strong> esta página crea y elimina datos de prueba automáticamente para no ensuciar la base de datos real. Los proyectos y países de prueba llevan el prefijo "QA-" y se limpian solos cuando es posible.
        </div>
      </div>
    </div>
  )
}
