'use client'

import { useState } from 'react'

const ROADMAP = [
  {
    fase: 'FASE 1 — NÚCLEO',
    descripcion: 'Registro, autenticación, proyectos y postulaciones',
    estado: 'completada',
    items: [
      { id: 1, texto: 'Registro y login con Supabase Auth', estado: 'completado' },
      { id: 2, texto: 'Onboarding fundador y especialista', estado: 'completado' },
      { id: 3, texto: 'Dashboard fundador y especialista', estado: 'completado' },
      { id: 4, texto: 'Crear y publicar proyectos con roles', estado: 'completado' },
      { id: 5, texto: 'Postularse a roles abiertos', estado: 'completado' },
      { id: 6, texto: 'Aceptar / rechazar postulaciones', estado: 'completado' },
      { id: 7, texto: 'Emails automáticos (postulación, aceptada, rechazada)', estado: 'completado' },
    ]
  },
  {
    fase: 'FASE 2 — WORKSPACE',
    descripcion: 'Espacio de trabajo colaborativo por proyecto',
    estado: 'completada',
    items: [
      { id: 8, texto: 'Workspace con 7 tabs (Resumen, Hitos, Equipo, Aportes, Economía, Tareas, Chat)', estado: 'completado' },
      { id: 9, texto: 'Chat en tiempo real con Supabase Realtime', estado: 'completado' },
      { id: 10, texto: 'Tareas por rol con plantillas predefinidas (7 roles)', estado: 'completado' },
      { id: 11, texto: 'Principio de mínima información — cada rol ve solo sus tareas', estado: 'completado' },
      { id: 12, texto: 'Gerente ve sus tareas + toggle ver todo el equipo', estado: 'completado' },
      { id: 13, texto: 'Historial de asignaciones en tabla historial_tareas', estado: 'completado' },
      { id: 14, texto: 'Emails automáticos de tareas (asignada, completada, verificada)', estado: 'completado' },
      { id: 15, texto: 'Badges en tiempo real en tabs Tareas y Chat', estado: 'completado', nota: 'Timing ocasional — no crítico' },
    ]
  },
  {
    fase: 'FASE 3 — ECONOMÍA Y SCORE',
    descripcion: 'Aportes, hitos y reputación de especialistas',
    estado: 'completada',
    items: [
      { id: 16, texto: 'Registro de aportes reales por fundador', estado: 'completado' },
      { id: 17, texto: 'Hitos de proyecto con estado', estado: 'completado' },
      { id: 18, texto: 'Score automático con función SQL calcular_escala_score', estado: 'completado', nota: '10pts tarea verificada, 15pts aporte, 20pts aceptación' },
      { id: 19, texto: 'Página /score con ranking de especialistas', estado: 'completado' },
      { id: 20, texto: 'Métricas del fundador con embudo de conversión', estado: 'completado' },
    ]
  },
  {
    fase: 'FASE 4 — DESCUBRIMIENTO',
    descripcion: 'Encontrar proyectos, especialistas e invitar',
    estado: 'completada',
    items: [
      { id: 21, texto: 'Directorio de especialistas con filtros', estado: 'completado' },
      { id: 22, texto: 'Búsqueda de proyectos con filtros', estado: 'completado' },
      { id: 23, texto: 'Invitar especialistas por email', estado: 'completado' },
      { id: 24, texto: 'Proyecto público compartible sin login (/p/[id])', estado: 'completado' },
      { id: 25, texto: 'Perfil público por especialista (/perfil/[id])', estado: 'completado' },
    ]
  },
  {
    fase: 'FASE 5 — ADMIN',
    descripcion: 'Panel de control de la plataforma',
    estado: 'completada',
    items: [
      { id: 26, texto: 'Panel /admin-escala con perfiles, proyectos, industrias, países', estado: 'completado' },
      { id: 27, texto: 'Plantillas de tareas por industria en admin (5 industrias)', estado: 'completado' },
      { id: 28, texto: 'Países con tareas regulatorias (CO, MX, PE, CL, AR, ES, US)', estado: 'completado' },
    ]
  },
  {
    fase: 'FASE 6 — INTELIGENCIA OPERATIVA',
    descripcion: 'Automatización y personalización avanzada',
    estado: 'en_progreso',
    items: [
      { id: 29, texto: 'Plantillas por industria aplicables al crear proyecto', estado: 'pendiente' },
      { id: 30, texto: 'Perfiles comerciales por industria configurables desde admin', estado: 'pendiente' },
      { id: 31, texto: 'Internacionalización — país del proyecto carga tareas regulatorias automáticas', estado: 'pendiente' },
      { id: 32, texto: 'Asignación inteligente de tareas — filtrar ejecutores por categoría', estado: 'pendiente' },
      { id: 33, texto: 'Panel admin completamente parametrizable (sin tocar código)', estado: 'pendiente' },
    ]
  },
  {
    fase: 'FASE 7 — MONETIZACIÓN Y LEGAL',
    descripcion: 'Pagos, contratos y dominio propio',
    estado: 'bloqueada',
    items: [
      { id: 34, texto: 'Contratos digitales', estado: 'bloqueado', bloqueador: 'Requiere abogado' },
      { id: 35, texto: 'Wompi pagos (suscripciones y comisiones)', estado: 'bloqueado', bloqueador: 'Requiere cuenta Wompi activa' },
      { id: 36, texto: 'Emails a cualquier destinatario', estado: 'bloqueado', bloqueador: 'Requiere dominio escala.co verificado en Resend' },
    ]
  },
]

const VALOR = {
  construido: 75,
  estimado: 85,
  porcentaje: 88,
}

const ESTADO_COLOR = {
  completada: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  en_progreso: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  bloqueada: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
}

const ITEM_COLOR = {
  completado: { icon: '✓', cls: 'text-emerald-600', linecls: 'line-through text-gray-400' },
  pendiente: { icon: '○', cls: 'text-gray-300', linecls: 'text-gray-700' },
  bloqueado: { icon: '⊘', cls: 'text-amber-400', linecls: 'text-gray-500' },
}

const ESTADO_LABEL = {
  completada: 'Completada',
  en_progreso: 'En progreso',
  bloqueada: 'Bloqueada',
}

export default function DesarrolloPage() {
  const [expandido, setExpandido] = useState({ 4: true, 5: true }) // Fases 6 y 7 abiertas por defecto

  const toggle = (i) => setExpandido(prev => ({ ...prev, [i]: !prev[i] }))

  const totalItems = ROADMAP.flatMap(f => f.items).length
  const completados = ROADMAP.flatMap(f => f.items).filter(i => i.estado === 'completado').length

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Escala · Roadmap</p>
              <h1 className="text-2xl font-bold text-gray-900">Plan de desarrollo</h1>
              <p className="text-sm text-gray-500 mt-1">Actualizado al 29 de junio 2026</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-emerald-600">{VALOR.porcentaje}%</p>
              <p className="text-xs text-gray-400 mt-0.5">completado</p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>{completados} de {totalItems} funciones</span>
              <span>${VALOR.construido}M de ${VALOR.estimado}M COP construidos</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${(completados / totalItems) * 100}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: 'Fases completas', value: ROADMAP.filter(f => f.estado === 'completada').length, color: 'text-emerald-600' },
              { label: 'En progreso', value: ROADMAP.filter(f => f.estado === 'en_progreso').length, color: 'text-blue-600' },
              { label: 'Bloqueadas', value: ROADMAP.filter(f => f.estado === 'bloqueada').length, color: 'text-amber-500' },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fases */}
      <div className="max-w-3xl mx-auto px-6 mt-6 space-y-3">
        {ROADMAP.map((fase, i) => {
          const c = ESTADO_COLOR[fase.estado]
          const abierto = expandido[i] !== false // por defecto abierto
          const completadosFase = fase.items.filter(it => it.estado === 'completado').length

          return (
            <div key={i} className={`rounded-2xl border ${c.border} ${c.bg} overflow-hidden`}>
              {/* Header de fase */}
              <button
                onClick={() => toggle(i)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${c.dot} flex-shrink-0`} />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-800">{fase.fase}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>
                        {ESTADO_LABEL[fase.estado]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{fase.descripcion}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="text-xs text-gray-400 font-medium">
                    {completadosFase}/{fase.items.length}
                  </span>
                  <span className="text-gray-400 text-sm">{abierto ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Items */}
              {abierto && (
                <div className="px-5 pb-4 space-y-2 border-t border-white/60 pt-3">
                  {fase.items.map(item => {
                    const ic = ITEM_COLOR[item.estado]
                    return (
                      <div key={item.id} className="flex items-start gap-3">
                        <span className={`mt-0.5 text-sm font-bold flex-shrink-0 ${ic.cls}`}>{ic.icon}</span>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm ${ic.linecls}`}>{item.texto}</span>
                          {item.nota && (
                            <p className="text-xs text-gray-400 mt-0.5 italic">{item.nota}</p>
                          )}
                          {item.bloqueador && (
                            <p className="text-xs text-amber-500 mt-0.5 font-medium">⚠ {item.bloqueador}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Infraestructura */}
      <div className="max-w-3xl mx-auto px-6 mt-6">
        <div className="bg-gray-900 rounded-2xl p-5 text-gray-300">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Infraestructura</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            {[
              ['Stack', 'Next.js 16.2.9 · Supabase · PostgreSQL · Resend'],
              ['Repositorio', 'satoshigod/escala'],
              ['Deploy', 'escala-blush-nine.vercel.app'],
              ['DB', 'avrjgcitrgziiweirzfe.supabase.co'],
              ['Tablas', '11 tablas activas'],
              ['Realtime', 'mensajes · tareas'],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-gray-600 flex-shrink-0">{k}:</span>
                <span className="text-gray-300">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Principios */}
      <div className="max-w-3xl mx-auto px-6 mt-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Principios de arquitectura</p>
          <div className="space-y-1.5">
            {[
              'Fundador paga aportes Claude AI — registrado como aporte real',
              'Principio de mínima información por rol',
              'Gerente de Proyecto como admin operativo del equipo',
              'No commitear equity percentages al desarrollador',
              'Repositorio único satoshigod/escala',
              'Shell heredoc corrompe archivos — usar file tool de Claude',
            ].map((p, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-gray-300 mt-0.5 flex-shrink-0">—</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
