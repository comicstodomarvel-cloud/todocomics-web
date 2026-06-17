import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Cliente de Supabase con service_role key.
 * By-passes RLS, necesario para insertar/actualizar desde el webhook.
 *
 * Si no hay SUPABASE_SERVICE_ROLE_KEY definida, las operaciones de escritura fallarán
 * porque la tabla `contenido` tiene RLS activo que requiere autenticación.
 */
export function getSupabaseAdmin() {
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY no está definida. ' +
        'Agrega la variable en .env.local o en el panel de Vercel. ' +
        'Puedes obtenerla en: Project Settings → API → service_role key'
    )
  }

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL no está definida.')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}
