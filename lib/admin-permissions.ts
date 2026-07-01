export const ALL_SECTIONS = {
  importar: 'Importar Post',
  editar: 'Editar Post',
  eliminar: 'Eliminar Post',
  revisar: 'Revisar Contenido',
  faq: 'Gestionar FAQ',
  peticiones: 'Peticiones',
  reportes: 'Reportes',
  monitoreo: 'Monitoreo',
  usuarios: 'Usuarios',
} as const

export type SectionKey = keyof typeof ALL_SECTIONS

export interface AdminUser {
  id: string
  username: string
  role: 'admin' | 'editor'
  display_name: string
  permissions: { sections: string[] }
}

export function hasPermission(user: AdminUser | null, section: string): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  return user.permissions?.sections?.includes(section) ?? false
}
