import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

export default function AdminLogin() {
  const { session, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  useDocumentTitle('Iniciar sesión')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? '/admin'

  useEffect(() => {
    if (session) navigate(redirectTo, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error: signInError } = await signIn(email, password)

    setSubmitting(false)
    if (signInError) {
      setError('Correo o contraseña incorrectos.')
      return
    }
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-ink-800 p-6 sm:p-8"
      >
        <span className="mx-auto flex h-14 w-20 items-center justify-center">
          <img src="/logo.webp" alt="Xtreme Tuning" className="h-full w-full object-contain" />
        </span>

        <h1 className="mt-5 text-center font-display text-xl uppercase text-white">
          Panel de administración
        </h1>
        <p className="mt-1 text-center text-sm text-white/50">Ingresa con tu correo y contraseña</p>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-semibold text-white/60">
              Correo
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-ink-900 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-electric-500"
              placeholder="tucorreo@xtremetuning.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-semibold text-white/60">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-ink-900 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-electric-500"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-ember-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 flex w-full items-center justify-center rounded-full bg-electric-500 py-3 text-sm font-bold text-white transition hover:bg-electric-400 disabled:opacity-60"
        >
          {submitting ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}
