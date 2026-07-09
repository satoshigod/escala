'use client'
import { useState } from 'react'

const KEYWORDS_TOP = [
  // Fundadores
  { kw: 'crear startup colombia', vol: 800, dif: 'Media', conv: 'Alta', tipo: 'Fundador' },
  { kw: 'cofundador colombia', vol: 400, dif: 'Baja', conv: 'Muy alta', tipo: 'Fundador' },
  { kw: 'crear empresa sin capital', vol: 300, dif: 'Baja', conv: 'Muy alta', tipo: 'Fundador' },
  { kw: 'crear startup mexico', vol: 600, dif: 'Media', conv: 'Alta', tipo: 'Fundador' },
  { kw: 'startup chile', vol: 500, dif: 'Media', conv: 'Alta', tipo: 'Fundador' },
  { kw: 'buscar cofundador', vol: 250, dif: 'Baja', conv: 'Muy alta', tipo: 'Fundador' },
  { kw: 'angel investor colombia', vol: 300, dif: 'Media', conv: 'Alta', tipo: 'Fundador' },
  { kw: 'startup bogota', vol: 350, dif: 'Baja', conv: 'Alta', tipo: 'Fundador' },
  { kw: 'startup medellin', vol: 250, dif: 'Baja', conv: 'Alta', tipo: 'Fundador' },
  { kw: 'participacion diferida startup', vol: 100, dif: 'Muy baja', conv: 'Muy alta', tipo: 'Fundador' },
  // Especialistas
  { kw: 'contador publico colombia trabajo', vol: 600, dif: 'Baja', conv: 'Muy alta', tipo: 'Especialista' },
  { kw: 'contador freelance colombia', vol: 400, dif: 'Baja', conv: 'Muy alta', tipo: 'Especialista' },
  { kw: 'abogado startups colombia', vol: 200, dif: 'Muy baja', conv: 'Muy alta', tipo: 'Especialista' },
  { kw: 'desarrollador freelance colombia', vol: 800, dif: 'Media', conv: 'Alta', tipo: 'Especialista' },
  { kw: 'diseñador freelance colombia', vol: 600, dif: 'Media', conv: 'Alta', tipo: 'Especialista' },
  { kw: 'servicios contables startups', vol: 150, dif: 'Muy baja', conv: 'Muy alta', tipo: 'Especialista' },
  { kw: 'trabajo contador medellin', vol: 400, dif: 'Baja', conv: 'Alta', tipo: 'Especialista' },
  { kw: 'abogado freelance colombia', vol: 300, dif: 'Baja', conv: 'Muy alta', tipo: 'Especialista' },
  // Informacional
  { kw: 'que es el equity en una startup', vol: 800, dif: 'Baja', conv: 'Media', tipo: 'Informacional' },
  { kw: 'como constituir empresa sas colombia', vol: 1200, dif: 'Baja', conv: 'Media', tipo: 'Informacional' },
  { kw: 'como crear una startup sin dinero', vol: 600, dif: 'Baja', conv: 'Alta', tipo: 'Informacional' },
  { kw: 'contrato de participacion colombia', vol: 200, dif: 'Baja', conv: 'Alta', tipo: 'Informacional' },
  { kw: 'acuerdo de socios startup', vol: 350, dif: 'Baja', conv: 'Alta', tipo: 'Informacional' },
  { kw: 'que es la participacion diferida', vol: 100, dif: 'Muy baja', conv: 'Alta', tipo: 'Informacional' },
  { kw: 'cofundador vs socio', vol: 300, dif: 'Baja', conv: 'Media', tipo: 'Informacional' },
]

const LANDING_PAGES = [
  { url: '/startup-colombia', kw: 'crear startup colombia', estado: 'live', tier: 1, audiencia: 'Fundadores CO' },
  { url: '/startup-mexico', kw: 'crear startup mexico', estado: 'live', tier: 1, audiencia: 'Fundadores MX' },
  { url: '/startup-chile', kw: 'crear startup chile', estado: 'live', tier: 1, audiencia: 'Fundadores CL' },
  { url: '/que-es-escala', kw: 'qué es escala', estado: 'live', tier: 1, audiencia: 'Todos' },
  { url: '/buscar-cofundador', kw: 'buscar cofundador', estado: 'live', tier: 1, audiencia: 'Fundadores' },
  { url: '/contador-publico-colombia', kw: 'contador publico colombia', estado: 'live', tier: 1, audiencia: 'Especialistas CO' },
  { url: '/abogado-startups-colombia', kw: 'abogado startups colombia', estado: 'live', tier: 1, audiencia: 'Especialistas CO' },
  { url: '/crear-empresa-sin-capital', kw: 'crear empresa sin capital', estado: 'live', tier: 1, audiencia: 'Fundadores LATAM' },
  { url: '/directorio', kw: 'directorio especialistas', estado: 'live', tier: 1, audiencia: 'Todos' },
  { url: '/desarrollador-startup-colombia', kw: 'desarrollador freelance colombia', estado: 'pendiente', tier: 2, audiencia: 'Especialistas CO' },
  { url: '/startup-bogota', kw: 'startup bogota', estado: 'pendiente', tier: 2, audiencia: 'Fundadores CO' },
  { url: '/startup-medellin', kw: 'startup medellin', estado: 'pendiente', tier: 2, audiencia: 'Fundadores CO' },
  { url: '/startup-santiago', kw: 'startup santiago', estado: 'pendiente', tier: 2, audiencia: 'Fundadores CL' },
  { url: '/angel-investor', kw: 'angel investor latinoamerica', estado: 'pendiente', tier: 2, audiencia: 'Inversores' },
  { url: '/buscar-cto', kw: 'buscar cto startup', estado: 'pendiente', tier: 2, audiencia: 'Fundadores' },
  { url: '/startup-argentina', kw: 'crear startup argentina', estado: 'pendiente', tier: 3, audiencia: 'Fundadores AR' },
  { url: '/startup-espana', kw: 'crear startup españa', estado: 'pendiente', tier: 3, audiencia: 'Fundadores ES' },
]

const BLOG_ARTICULOS = [
  { num: 1, titulo: 'Cómo constituir una empresa SAS en Colombia paso a paso', kw: 'constituir sas colombia', vol: 1200, estado: 'pendiente', prioridad: '🔴 Alta' },
  { num: 2, titulo: 'Qué es la participación diferida y cómo funciona', kw: 'participacion diferida', vol: 100, estado: 'pendiente', prioridad: '🔴 Alta' },
  { num: 3, titulo: 'Cofundador vs empleado vs socio: diferencias', kw: 'cofundador vs socio', vol: 300, estado: 'pendiente', prioridad: '🔴 Alta' },
  { num: 4, titulo: 'Cómo crear una startup sin dinero en Latinoamérica', kw: 'startup sin dinero', vol: 600, estado: 'pendiente', prioridad: '🔴 Alta' },
  { num: 5, titulo: 'Qué es el equity en una startup y cómo calcularlo', kw: 'equity startup', vol: 800, estado: 'pendiente', prioridad: '🔴 Alta' },
  { num: 6, titulo: 'Los 7 errores al contratar el primer equipo de una startup', kw: 'equipo startup', vol: 400, estado: 'pendiente', prioridad: '🟡 Media' },
  { num: 7, titulo: 'Qué buscan los ángeles inversionistas en etapa temprana', kw: 'angel investor startup', vol: 300, estado: 'pendiente', prioridad: '🟡 Media' },
  { num: 8, titulo: 'Cómo encontrar un contador para tu startup en Colombia', kw: 'contador startup colombia', vol: 400, estado: 'pendiente', prioridad: '🟡 Media' },
  { num: 9, titulo: 'Checklist legal para lanzar una startup en Colombia', kw: 'legal startup colombia', vol: 500, estado: 'pendiente', prioridad: '🟡 Media' },
  { num: 10, titulo: 'Cuánto vale mi startup: métodos de valoración', kw: 'valoracion startup', vol: 400, estado: 'pendiente', prioridad: '🟡 Media' },
]

const ACCIONES_ROI = [
  { num: 1, accion: 'Landing /contador-publico-colombia', estado: true },
  { num: 2, accion: 'Landing /abogado-startups-colombia', estado: true },
  { num: 3, accion: 'Landing /crear-empresa-sin-capital', estado: true },
  { num: 4, accion: 'Landing /startup-chile', estado: true },
  { num: 5, accion: 'Sitemap + robots.txt actualizados', estado: true },
  { num: 6, accion: 'Blog: artículo "Cómo constituir SAS Colombia"', estado: false },
  { num: 7, accion: 'Blog: artículo "Qué es participación diferida"', estado: false },
  { num: 8, accion: 'Landing /desarrollador-startup-colombia', estado: false },
  { num: 9, accion: 'Landing /angel-investor', estado: false },
  { num: 10, accion: 'LinkedIn: posts de Ivan 2-3x/semana', estado: false },
  { num: 11, accion: 'Reddit: responder r/colombia, r/emprendimiento', estado: false },
  { num: 12, accion: 'Product Hunt: lanzamiento oficial', estado: false },
  { num: 13, accion: 'Landing /startup-bogota y /startup-medellin', estado: false },
  { num: 14, accion: 'Blog: checklist legal startup Colombia', estado: false },
  { num: 15, accion: 'Directorio de Ruta N e iNNpulsa — solicitar mención', estado: false },
  { num: 16, accion: 'Blog: qué buscan los ángeles inversionistas', estado: false },
  { num: 17, accion: 'Landing /buscar-cto', estado: false },
  { num: 18, accion: 'Guest post en medio de emprendimiento LATAM', estado: false },
  { num: 19, accion: 'Podcast de emprendimiento — aparecer como invitado', estado: false },
  { num: 20, accion: 'SEO programático: /especialista/{rol}/{pais}', estado: false },
]

const KPIS = [
  { metrica: 'Impresiones en Google', s1_4: '0-500', s5_12: '500-5,000', s13_24: '5,000-50,000' },
  { metrica: 'Clics orgánicos', s1_4: '0-20', s5_12: '20-200', s13_24: '200-2,000' },
  { metrica: 'CTR promedio', s1_4: '—', s5_12: '2-4%', s13_24: '3-6%' },
  { metrica: 'Páginas indexadas', s1_4: '10', s5_12: '20', s13_24: '40+' },
  { metrica: 'Keywords en top 20', s1_4: '0', s5_12: '2-5', s13_24: '10-20' },
  { metrica: 'Registros orgánicos/semana', s1_4: '0', s5_12: '1-3', s13_24: '5-15' },
]

const COLOR_TIPO = { Fundador: '#1D9E75', Especialista: '#4A90D9', Informacional: '#AFA9EC' }
const COLOR_DIF = { 'Muy baja': '#1D9E75', Baja: '#34D399', Media: '#E8A020', Alta: '#E05555', 'Muy alta': '#E05555' }

export default function PlanSEO() {
  const [tab, setTab] = useState('acciones')
  const [filtroTipo, setFiltroTipo] = useState('Todos')

  const liveCount = LANDING_PAGES.filter(p => p.estado === 'live').length
  const doneAcciones = ACCIONES_ROI.filter(a => a.estado).length
  const pct = Math.round((doneAcciones / ACCIONES_ROI.length) * 100)

  const tabs = [
    { id: 'acciones', label: '🎯 20 Acciones ROI' },
    { id: 'landing', label: '📄 Landing Pages' },
    { id: 'blog', label: '✍️ Blog' },
    { id: 'keywords', label: '🔍 Keywords' },
    { id: 'kpis', label: '📊 KPIs' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0B1628', fontFamily: 'Inter,sans-serif', color: '#fff' }}>
      <nav style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="/dashboard" style={{ color: '#8FA3CC', textDecoration: 'none', fontSize: '0.82rem' }}>Dashboard</a>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
          <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#fff' }}>Plan SEO Escala</span>
        </div>
        <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#1D9E75', textDecoration: 'none', fontWeight: '600' }}>Search Console →</a>
      </nav>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.25rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1D9E75', marginBottom: '0.4rem' }}>SEO y Crecimiento Orgánico</div>
          <div style={{ fontSize: 'clamp(1.3rem,3vw,1.75rem)', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Plan Maestro SEO — Escala</div>
          <div style={{ fontSize: '0.82rem', color: '#8FA3CC' }}>Objetivo: primeros usuarios orgánicos reales en 6 meses · Actualizado julio 2026</div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '0.75rem', marginBottom: '1.75rem' }}>
          {[
            { label: 'Landing pages live', val: liveCount + '/' + LANDING_PAGES.length, color: '#1D9E75' },
            { label: 'Artículos blog', val: '0/10', color: '#E8A020' },
            { label: 'Acciones ROI hechas', val: doneAcciones + '/20', color: '#4A90D9' },
            { label: 'Progreso general', val: pct + '%', color: '#AFA9EC' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: s.color, marginBottom: '0.25rem' }}>{s.val}</div>
              <div style={{ fontSize: '0.7rem', color: '#8FA3CC' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Barra de progreso */}
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '4px', height: '6px', marginBottom: '1.75rem', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: pct + '%', background: '#1D9E75', borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? '#1D9E75' : 'rgba(255,255,255,0.06)', color: tab === t.id ? '#fff' : '#8FA3CC', border: 'none', borderRadius: '8px', padding: '0.4rem 0.875rem', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>{t.label}</button>
          ))}
        </div>

        {/* Tab: 20 Acciones ROI */}
        {tab === 'acciones' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ACCIONES_ROI.map(a => (
              <div key={a.num} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: a.estado ? 'rgba(29,158,117,0.06)' : 'rgba(255,255,255,0.03)', border: a.estado ? '1px solid rgba(29,158,117,0.2)' : '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: a.estado ? '#1D9E75' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '700', color: a.estado ? '#fff' : '#6B7280', flexShrink: 0 }}>{a.estado ? '✓' : a.num}</div>
                <div style={{ fontSize: '0.82rem', color: a.estado ? '#fff' : '#8FA3CC', textDecoration: a.estado ? 'none' : 'none', flex: 1 }}>{a.accion}</div>
                <div style={{ fontSize: '0.65rem', fontWeight: '700', color: a.estado ? '#1D9E75' : '#4B5563', flexShrink: 0 }}>{a.estado ? 'Hecho' : 'Pendiente'}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Landing Pages */}
        {tab === 'landing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {['1', '2', '3'].map(tier => (
              <div key={tier}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#8FA3CC', marginBottom: '0.5rem', marginTop: tier !== '1' ? '1rem' : 0 }}>TIER {tier}</div>
                {LANDING_PAGES.filter(p => p.tier === parseInt(tier)).map(p => (
                  <div key={p.url} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: p.estado === 'live' ? 'rgba(29,158,117,0.05)' : 'rgba(255,255,255,0.03)', border: p.estado === 'live' ? '1px solid rgba(29,158,117,0.2)' : '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', background: p.estado === 'live' ? 'rgba(29,158,117,0.15)' : 'rgba(255,255,255,0.06)', color: p.estado === 'live' ? '#1D9E75' : '#6B7280', flexShrink: 0 }}>{p.estado === 'live' ? '✅ Live' : '⏳ Pendiente'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {p.estado === 'live'
                        ? <a href={'https://escala.network' + p.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.82rem', fontWeight: '600', color: '#4A90D9', textDecoration: 'none' }}>escala.network{p.url}</a>
                        : <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>escala.network{p.url}</span>
                      }
                      <div style={{ fontSize: '0.68rem', color: '#4B5563', marginTop: '2px' }}>{p.kw} · {p.audiencia}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Tab: Blog */}
        {tab === 'blog' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ background: 'rgba(232,160,32,0.06)', border: '1px solid rgba(232,160,32,0.2)', borderRadius: '10px', padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#E8A020', marginBottom: '0.75rem' }}>
              📝 Blog aún no creado. La ruta `/blog` y los primeros 10 artículos son parte del Tier 2.
            </div>
            {BLOG_ARTICULOS.map(a => (
              <div key={a.num} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#6B7280', flexShrink: 0, paddingTop: '2px' }}>#{a.num}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#fff', marginBottom: '0.2rem' }}>{a.titulo}</div>
                  <div style={{ fontSize: '0.68rem', color: '#4B5563' }}>Keyword: {a.kw} · ~{a.vol} búsquedas/mes</div>
                </div>
                <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#6B7280', flexShrink: 0 }}>{a.prioridad}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Keywords */}
        {tab === 'keywords' && (
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {['Todos', 'Fundador', 'Especialista', 'Informacional'].map(t => (
                <button key={t} onClick={() => setFiltroTipo(t)} style={{ background: filtroTipo === t ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', color: filtroTipo === t ? '#fff' : '#8FA3CC', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.3rem 0.75rem', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>{t}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {KEYWORDS_TOP.filter(k => filtroTipo === 'Todos' || k.tipo === filtroTipo).map(k => (
                <div key={k.kw} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '0.625rem 0.875rem' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '1px 6px', borderRadius: '10px', background: `rgba(${k.tipo === 'Fundador' ? '29,158,117' : k.tipo === 'Especialista' ? '74,144,217' : '175,169,236'},0.12)`, color: COLOR_TIPO[k.tipo], flexShrink: 0 }}>{k.tipo}</span>
                  <div style={{ flex: 1, fontSize: '0.82rem', color: '#fff' }}>{k.kw}</div>
                  <div style={{ fontSize: '0.68rem', color: '#8FA3CC', flexShrink: 0 }}>~{k.vol}/mes</div>
                  <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '1px 6px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', color: COLOR_DIF[k.dif], flexShrink: 0 }}>{k.dif}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: '700', color: k.conv === 'Muy alta' ? '#1D9E75' : k.conv === 'Alta' ? '#34D399' : '#8FA3CC', flexShrink: 0 }}>{k.conv}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: KPIs */}
        {tab === 'kpis' && (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 0 }}>
                {['Métrica', 'Semanas 1-4', 'Semanas 5-12', 'Semanas 13-24'].map(h => (
                  <div key={h} style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: '700', color: '#8FA3CC', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>{h}</div>
                ))}
                {KPIS.map((k, i) => [
                  <div key={k.metrica} style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#fff', borderBottom: i < KPIS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>{k.metrica}</div>,
                  <div key={k.metrica+'1'} style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#8FA3CC', borderBottom: i < KPIS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>{k.s1_4}</div>,
                  <div key={k.metrica+'2'} style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#E8A020', borderBottom: i < KPIS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>{k.s5_12}</div>,
                  <div key={k.metrica+'3'} style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#1D9E75', borderBottom: i < KPIS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>{k.s13_24}</div>,
                ])}
              </div>
            </div>
            <div style={{ marginTop: '1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>⚠️ Riesgos a tener en cuenta</div>
              {['Dominio nuevo: Google tarda 3-6 meses en dar autoridad. Las primeras semanas en Search Console mostrarán pocas impresiones — es normal.',
                'Sin Cámara de Comercio: algunas keywords de "empresa registrada" pueden no rankear bien.',
                'Competencia de contenido: Platzi, Siigo, Alegra posicionan en muchas keywords contables. Atacar la cola larga.',
                'El blog debe ser contenido útil de verdad, no relleno de keywords. Google penaliza el contenido de baja calidad.',
              ].map(r => (
                <div key={r} style={{ fontSize: '0.75rem', color: '#8FA3CC', lineHeight: '1.6', paddingLeft: '0.75rem', borderLeft: '2px solid rgba(255,255,255,0.1)', marginBottom: '0.5rem' }}>{r}</div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
