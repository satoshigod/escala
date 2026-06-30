import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const BUCKET = 'evidencias'
const MAX_SIZE_MB = 10
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']

// POST — subir un archivo y devolver su URL pública
export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const carpeta = formData.get('carpeta') || 'general' // ej: 'aportes', 'tareas', 'perfiles'

    if (!file) {
      return Response.json({ error: 'No se recibió ningún archivo' }, { status: 400 })
    }

    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      return Response.json({ error: 'Tipo de archivo no permitido. Solo imágenes (JPG, PNG, WEBP, GIF) o PDF.' }, { status: 400 })
    }

    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > MAX_SIZE_MB) {
      return Response.json({ error: `El archivo pesa ${sizeMB.toFixed(1)}MB, el máximo permitido es ${MAX_SIZE_MB}MB` }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const extension = file.name.split('.').pop()
    const nombreUnico = carpeta + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + extension

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(nombreUnico, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      return Response.json({ error: 'Error subiendo archivo: ' + error.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(nombreUnico)

    return Response.json({
      url: urlData.publicUrl,
      path: nombreUnico,
      nombre_original: file.name,
      tipo: file.type,
      tamano_mb: sizeMB.toFixed(2)
    }, { status: 201 })

  } catch (e) {
    return Response.json({ error: 'Error inesperado: ' + e.message }, { status: 500 })
  }
}

// DELETE — eliminar un archivo subido (por su path)
export async function DELETE(request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')

  if (!path) return Response.json({ error: 'Falta el path del archivo' }, { status: 400 })

  const { error } = await supabase.storage.from(BUCKET).remove([path])

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
