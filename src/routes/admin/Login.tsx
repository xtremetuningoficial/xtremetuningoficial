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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-900 px-4">
      <div className="circuit-bg pointer-events-none absolute inset-0 opacity-[0.14]" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-electric-500/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 translate-y-1/3 rounded-full bg-ember-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="hazard-stripes pointer-events-none absolute left-0 top-0 h-full w-2.5 opacity-40" aria-hidden="true" />
      <div className="hazard-stripes pointer-events-none absolute right-0 top-0 h-full w-2.5 opacity-40" aria-hidden="true" />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-ink-800 shadow-2xl shadow-black/40"
      >
        <div className="hazard-stripes h-1.5 w-full" aria-hidden="true" />

        <div className="p-6 sm:p-8">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
            <span className="pulse-ring absolute inset-0 rounded-full border-2 border-cyan-400/40" />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-ink-900 ring-1 ring-white/10">
              <img src="/logo.webp" alt="Xtreme Tuning" className="h-10 w-14 object-contain" />
            </span>
          </div>

          <h1 className="mt-4 text-center font-display text-xl uppercase text-white">
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
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-ember-500/10 px-3 py-2 text-sm text-ember-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center rounded-full bg-electric-500 py-3 text-sm font-bold text-white transition hover:bg-electric-400 disabled:opacity-60"
          >
            {submitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>
      </form>
    </div>
  )
}
