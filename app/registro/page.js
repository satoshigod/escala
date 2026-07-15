// app/registro/page.js — wrapper servidor con metadata y canonical
import RegistroClientePage from './_page_client'

export const metadata = {
  title: 'Crear cuenta en Escala — Empieza gratis',
  description: 'Crea tu cuenta en Escala y empieza a construir tu empresa o negocio. Gratis, sin tarjeta de crédito.',
  alternates: {
    canonical: 'https://escala.network/registro',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RegistroPage() {
  return <RegistroClientePage />
}
