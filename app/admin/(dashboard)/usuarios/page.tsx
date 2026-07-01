'use client'

import { useState, useEffect } from 'react'
import { ALL_SECTIONS } from '@/lib/admin-permissions'
import type { SectionKey } from '@/lib/admin-permissions'

interface EditorUser {
  id: string
  username: string
  display_name: string
  role: string
  permissions: { sections: string[] }
  created_at: string
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<EditorUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Nuevo usuario
  const [showNewForm, setShowNewForm] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newDisplayName, setNewDisplayName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const sectionKeys = Object.keys(ALL_SECTIONS) as SectionKey[]

  async function loadUsers() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/usuarios', { credentials: 'include' })
      if (!res.ok) throw new Error('Error al cargar')
      const data = await res.json()
      setUsers(data)
    } catch {
      setError('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          display_name: newDisplayName,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al crear usuario')
        return
      }

      setNewUsername('')
      setNewPassword('')
      setNewDisplayName('')
      setShowNewForm(false)
      await loadUsers()
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  async function handleSavePermissions(userId: string, sections: string[]) {
    try {
      const res = await fetch(`/api/admin/usuarios/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ permissions: { sections } }),
      })

      if (!res.ok) throw new Error('Error al guardar')
      await loadUsers()
    } catch {
      setError('Error al guardar permisos')
    }
  }

  async function handleDelete(userId: string, username: string) {
    if (!confirm(`¿Eliminar al usuario "${username}"? Esta acción no se puede deshacer.`)) return

    try {
      const res = await fetch(`/api/admin/usuarios/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!res.ok) throw new Error('Error al eliminar')
      if (expandedId === userId) setExpandedId(null)
      await loadUsers()
    } catch {
      setError('Error al eliminar usuario')
    }
  }

  function togglePermission(sections: string[], key: string): string[] {
    if (sections.includes(key)) {
      if (sections.length <= 1) return sections
      return sections.filter((s) => s !== key)
    }
    return [...sections, key]
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 transition-colors"
        >
          {showNewForm ? 'Cancelar' : '+ Nuevo Editor'}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-lg px-3 py-2 mb-6">{error}</p>
      )}

      {showNewForm && (
        <form onSubmit={handleCreate} className="mb-8 p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-4 max-w-lg">
          <h2 className="text-lg font-semibold">Crear nuevo editor</h2>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Usuario</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500 text-zinc-100 placeholder-zinc-500"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Nombre visible</label>
            <input
              type="text"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500 text-zinc-100 placeholder-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-amber-500 text-zinc-100 placeholder-zinc-500"
              minLength={6}
              required
            />
          </div>

          <p className="text-xs text-zinc-500">El editor se crea con permiso solo de &quot;Importar Post&quot;. Puedes ajustarlo después.</p>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Creando...' : 'Crear Editor'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-zinc-500">Cargando usuarios...</p>
      ) : users.length === 0 ? (
        <p className="text-zinc-500">No hay editores registrados.</p>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                    {u.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-100">{u.display_name}</p>
                    <p className="text-xs text-zinc-500">@{u.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500">
                    {u.permissions?.sections?.length ?? 0} permisos
                  </span>
                  <svg
                    className={`w-4 h-4 text-zinc-500 transition-transform ${expandedId === u.id ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {expandedId === u.id && (
                <div className="border-t border-zinc-800 p-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-3">Permisos</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {sectionKeys.map((key) => {
                        const checked = u.permissions?.sections?.includes(key) ?? false
                        return (
                          <label
                            key={key}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                              checked
                                ? 'border-amber-500 bg-amber-500/10 text-zinc-100'
                                : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                const newSections = togglePermission(u.permissions?.sections ?? [], key)
                                handleSavePermissions(u.id, newSections)
                              }}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              checked ? 'bg-amber-500 border-amber-500' : 'border-zinc-600'
                            }`}>
                              {checked && (
                                <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-xs">{ALL_SECTIONS[key]}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleDelete(u.id, u.display_name)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-950/50"
                    >
                      Eliminar usuario
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
