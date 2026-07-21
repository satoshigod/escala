import { redirect } from 'next/navigation'

// /desarrollo-limpio se fusionó con /desarrollo (el roadmap por capas es ahora el único).
export default function DesarrolloLimpioRedirect() {
  redirect('/desarrollo')
}
