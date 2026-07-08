'use client'
// /p/[id] — redirige a /proyectos/[id]
// Esta página existía como duplicado de /proyectos/[id].
// Se mantiene la URL para compatibilidad con enlaces externos.
import { useEffect } from 'react'

export default function ProyectoPublicoAlias() {
  useEffect(() => {
    const id = window.location.pathname.split('/').pop()
    window.location.replace('/proyectos/' + id)
  }, [])
  return null
}
