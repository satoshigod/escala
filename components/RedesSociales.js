// components/RedesSociales.js
//
// Bloque compartido de enlaces a redes sociales de Escala.
// Un solo lugar para actualizar links/handles — no repetir en cada página pública.
//
// Uso:
//   import RedesSociales from '@/components/RedesSociales'
//   <RedesSociales />
//
// Nota: el link de Instagram se guarda SIN el ?utm_source=qr que trae el link
// original (ese parámetro es del código QR físico, no de la web — un click
// desde el sitio no debe reportarse como si viniera de un QR).

const REDES = [
  {
    nombre: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=61591678262407',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
      </svg>
    ),
  },
  {
    nombre: 'Instagram',
    url: 'https://www.instagram.com/joinescala',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.22.6 1.77 1.15.55.55.9 1.11 1.15 1.77.25.64.42 1.37.47 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.77 4.9 4.9 0 0 1-1.77 1.15c-.64.25-1.37.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.22 1.15-1.77a4.9 4.9 0 0 1 1.77-1.15c.64-.25 1.37-.42 2.43-.47C8.94 2.01 9.28 2 12 2Zm0 1.8c-2.67 0-2.99.01-4.04.06-.92.04-1.42.2-1.75.33-.44.17-.75.37-1.08.7-.33.33-.53.64-.7 1.08-.13.33-.29.83-.33 1.75C4.05 8.77 4.04 9.09 4.04 12s.01 3.23.06 4.28c.04.92.2 1.42.33 1.75.17.44.37.75.7 1.08.33.33.64.53 1.08.7.33.13.83.29 1.75.33 1.05.05 1.37.06 4.04.06s2.99-.01 4.04-.06c.92-.04 1.42-.2 1.75-.33.44-.17.75-.37 1.08-.7.33-.33.53-.64.7-1.08.13-.33.29-.83.33-1.75.05-1.05.06-1.37.06-4.28s-.01-3.23-.06-4.28c-.04-.92-.2-1.42-.33-1.75a2.9 2.9 0 0 0-.7-1.08 2.9 2.9 0 0 0-1.08-.7c-.33-.13-.83-.29-1.75-.33C14.99 3.81 14.67 3.8 12 3.8Zm0 3.05a5.15 5.15 0 1 1 0 10.3 5.15 5.15 0 0 1 0-10.3Zm0 1.8a3.35 3.35 0 1 0 0 6.7 3.35 3.35 0 0 0 0-6.7Zm5.35-1.99a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z" />
      </svg>
    ),
  },
]

export default function RedesSociales({ align = 'center' }) {
  const justify = align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'flex-end'
  return (
    <div style={{ display: 'flex', justifyContent: justify, gap: '0.75rem' }}>
      {REDES.map((r) => (
        <a
          key={r.nombre}
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Escala en ${r.nombre}`}
          title={r.nombre}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#8FA3CC',
            textDecoration: 'none',
            transition: 'color 0.15s, border-color 0.15s',
          }}
        >
          {r.icon}
        </a>
      ))}
    </div>
  )
}
