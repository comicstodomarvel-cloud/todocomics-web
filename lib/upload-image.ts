import { getSupabaseAdmin } from './supabase-admin'
import sharp from 'sharp'

const MAX_INTENTOS = 3

export async function uploadImageBytesToSupabase(
  imageBuffer: ArrayBuffer | Uint8Array | Buffer,
  filename: string
): Promise<string> {
  const supabase = getSupabaseAdmin()

  let uploadBuffer: Buffer
  let contentType: string
  let filePath: string

  try {
    const source = imageBuffer instanceof ArrayBuffer
      ? new Uint8Array(imageBuffer)
      : imageBuffer
    uploadBuffer = await sharp(source)
      .webp({ quality: 85 })
      .toBuffer()
    contentType = 'image/webp'
    filePath = `${Date.now()}-${filename}`.replace(/\.\w+$/, '.webp')
  } catch (sharpErr) {
    console.warn('[uploadImageBytes] Sharp falló al convertir a WebP, subiendo como JPEG:', sharpErr)
    uploadBuffer = Buffer.from(imageBuffer instanceof ArrayBuffer ? new Uint8Array(imageBuffer) : imageBuffer)
    contentType = 'image/jpeg'
    filePath = `${Date.now()}-${filename}`
  }

  for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
    try {
      const { data, error } = await supabase.storage
        .from('portadas')
        .upload(filePath, uploadBuffer, {
          contentType,
          upsert: false,
        })

      if (error) {
        console.error('[uploadImageBytes] Error de Supabase:', error.message)
        if (intento < MAX_INTENTOS) {
          await new Promise((r) => setTimeout(r, 1000))
          continue
        }
        return ''
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('portadas').getPublicUrl(data.path)

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
