import { getSupabaseAdmin } from './supabase-admin'

const MAX_INTENTOS = 3

export async function uploadImageBytesToSupabase(
  imageBuffer: ArrayBuffer | Uint8Array | Buffer,
  filename: string
): Promise<string> {
  const supabase = getSupabaseAdmin()

  for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
    try {
      const filePath = `${Date.now()}-${filename}`
      const { data, error } = await supabase.storage
        .from('portadas')
        .upload(filePath, imageBuffer, {
          contentType: 'image/jpeg',
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
