import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to: '/admin', label: 'Productos', end: true },
  { to: '/admin/categorias', label: 'Categorías', end: false },
]

export function AdminLayout() {
  const { signOut, session } = useAuth()

  return (
    <div className="min-h-screen bg-ink-900">
      <header className="sticky top-0 z-50 bg-ink-900/95 backdrop-blur supports-[backdrop-filter]:bg-ink-900/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/admin" className="flex items-center gap-3">
            <span className="flex h-9 w-11 items-center justify-center">
              <img src="/logo.webp" alt="Xtreme Tuning" className="h-full w-full object-contain" />
            </span>
            <span className="flex items-center gap-2">
              <span className="font-display text-sm uppercase tracking-wide text-white sm:text-base">
                Panel de administración
              </span>
              <span className="relative hidden h-2 w-2 sm:flex">
                <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-cyan-400" />
                <span className="relative h-2 w-2 rounded-full bg-cyan-400" />
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-xs text-white/50 lg:block">{session?.user.email}</span>
            <Link to="/" className="text-xs font-semibold text-white/60 transition hover:text-cyan-400">
              Ver tienda
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-bold text-white transition hover:border-ember-400 hover:text-ember-400"
            >
              Salir
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 px-4 sm:px-6">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `border-b-2 px-3 py-2 text-xs font-bold uppercase tracking-wide transition ${
                  isActive
                    ? 'border-electric-400 text-white'
                    : 'border-transparent text-white/50 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hazard-stripes h-[3px] w-full opacity-70" aria-hidden="true" />
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="circuit-bg pointer-events-none fixed inset-0 opacity-[0.04]" aria-hidden="true" />
        <div className="relative">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
