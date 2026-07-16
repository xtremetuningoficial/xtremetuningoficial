import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function AdminLayout() {
  const { signOut, session } = useAuth()

  return (
    <div className="min-h-screen bg-paper-50">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="flex h-9 w-12 items-center justify-center">
              <img src="/logo.webp" alt="Xtreme Tuning" className="h-full w-full object-contain" />
            </span>
            <span className="font-display text-sm uppercase tracking-wide text-white">
              Panel de administración
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-xs text-white/50 sm:block">{session?.user.email}</span>
            <Link
              to="/"
              className="text-xs font-semibold text-white/60 transition hover:text-cyan-400"
            >
              Ver tienda
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-bold text-white transition hover:border-ember-500 hover:text-ember-500"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
