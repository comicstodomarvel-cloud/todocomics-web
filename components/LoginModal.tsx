'use client'

import { useState } from 'react'
import { X, Mail, Lock, User as UserIcon, CheckCircle, Send } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'

interface LoginModalProps {
  open: boolean
  onClose: () => void
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const { signIn, signUp, signInWithGoogle, resendConfirmation } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resendSent, setResendSent] = useState(false)

  if (!open) return null

  function resetToLogin() {
    setMode('login')
    setRegistered(false)
    setRegisteredEmail('')
    setResendSent(false)
    setError('')
    setEmail('')
    setPassword('')
    setNickname('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'login') {
      const err = await signIn(email, password)
      if (err) {
        if (err.toLowerCase().includes('email not confirmed')) {
          setError('Correo no confirmado. Revisa tu bandeja de entrada o solicita un reenvío.')
        } else {
          setError(err)
        }
      } else {
        onClose()
      }
      setLoading(false)
    } else {
      if (!nickname.trim()) {
        setError('El nickname es obligatorio')
        setLoading(false)
        return
      }
      const err = await signUp(email, password, nickname.trim())
      setLoading(false)
      if (err) {
        setError(err)
      } else {
        setRegistered(true)
        setRegisteredEmail(email)
      }
    }
  }

  async function handleResend() {
    setResending(true)
    setResendSent(false)
    const err = await resendConfirmation(registeredEmail)
    setResending(false)
    if (err) {
      setError(err)
    } else {
      setResendSent(true)
    }
  }

  if (registered) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
        <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">Cuenta creada</h2>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col items-center text-center mb-6">
            <CheckCircle size={48} className="text-emerald-400 mb-3" />
            <p className="text-zinc-200 text-sm leading-relaxed">
              Te enviamos un enlace de confirmación a <span className="text-amber-400 font-medium">{registeredEmail}</span>
            </p>
            <p className="text-zinc-500 text-xs mt-2">Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.</p>
          </div>

          {error && <p className="text-xs text-red-400 text-center mb-3">{error}</p>}

          {resendSent && (
            <p className="text-xs text-emerald-400 text-center mb-3">Correo reenviado correctamente</p>
          )}

          <button
            onClick={handleResend}
            disabled={resending}
            className="w-full flex items-center justify-center gap-2 rounded-md border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-800 disabled:opacity-40 mb-3"
          >
            <Send size={16} />
            {resending ? 'Enviando...' : 'Reenviar correo de confirmación'}
          </button>

          <button
            onClick={resetToLogin}
            className="w-full rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-400"
          >
            Ya confirmé, iniciar sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X size={20} />
          </button>
        </div>

        <button
          onClick={signInWithGoogle}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-md border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-800"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continuar con Google
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-700" />
          <span className="text-xs text-zinc-500">o con correo</span>
          <div className="h-px flex-1 bg-zinc-700" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div className="relative">
              <UserIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Nickname"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div className="relative">
            <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-500"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              minLength={6}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-500"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-40"
          >
            {loading
              ? 'Procesando...'
              : mode === 'login'
              ? 'Iniciar sesión'
              : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-zinc-500">
          {mode === 'login' ? (
            <>
              ¿No tienes cuenta?{' '}
              <button onClick={() => { setMode('register'); setError('') }} className="text-amber-400 hover:underline">
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button onClick={() => { setMode('login'); setError('') }} className="text-amber-400 hover:underline">
                Inicia sesión
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
