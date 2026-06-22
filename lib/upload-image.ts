import { getSupabaseAdmin } from './supabase-admin'

const MAX_INTENTOS = 3

function detectImageType(buffer: Uint8Array): { ext: string; mime: string } {
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { ext: 'jpg', mime: 'image/jpeg' }
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return { ext: 'png', mime: 'image/png' }
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return { ext: 'gif', mime: 'image/gif' }
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) return { ext: 'webp', mime: 'image/webp' }
  if (buffer[0] === 0x42 && buffer[1] === 0x4d) return { ext: 'bmp', mime: 'image/bmp' }
  return { ext: 'jpg', mime: 'image/jpeg' }
}

export async function uploadImageBytesToSupabase(
  imageBuffer: ArrayBuffer | Uint8Array | Buffer,
  filename: string
): Promise<string> {
  const supabase = getSupabaseAdmin()

  const bytes = imageBuffer instanceof ArrayBuffer ? new Uint8Array(imageBuffer) : imageBuffer
  const { ext, mime } = detectImageType(bytes)
  const uploadBuffer = Buffer.from(bytes)
  const timestamp = Date.now()
  const cleanName = filename.replace(/\.\w+$/, '')
  const filePath = `${timestamp}-${cleanName}.${ext}`

  for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
    try {
      const { data, error } = await supabase.storage
        .from('portadas')
        .upload(filePath, uploadBuffer, { contentType: mime, upsert: false })

      if (error) {
        console.error('[uploadImageBytes] Error de Supabase:', error.message)
        if (intento < MAX_INTENTOS) {
          await new Promise((r) => setTimeout(r, 1000))
          continue
        }
        return ''
      }

      const { data: { publicUrl } } = supabase.storage.from('portadas').getPublicUrl(data.path)
      return publicUrl
    } catch (err) {
      console.error(`[uploadImageBytes] Error en intento ${intento}:`, err)
      if (intento < MAX_INTENTOS) {
        await new Promise((r) => setTimeout(r, 1000))
        continue
      }
    }
  }

  return ''
}
