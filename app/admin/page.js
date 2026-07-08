'use client'
// /admin → redirige a /mis-contratos
// La ruta /admin fue renombrada a /mis-contratos para evitar confusión con /admin-escala.
import { useEffect } from 'react'
export default function AdminRedirect() {
  useEffect(() => { window.location.replace('/mis-contratos') }, [])
  return null
}
