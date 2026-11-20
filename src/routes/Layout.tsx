import { Outlet } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { WhatsAppFloatButton } from '../components/layout/WhatsAppFloatButton'
import { useCategories } from '../hooks/useCategories'

export function Layout() {
  const categoriesState = useCategories()

  return (
    <div className="min-h-screen bg-paper-50">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-hazard-400 focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-ink-900"
      >
        Saltar al contenido
      </a>
      <Header categories={categoriesState.data} />
      <main id="contenido" tabIndex={-1} className="outline-none">
        <Outlet context={categoriesState} />
      </main>
      <Footer categories={categoriesState.data} />
      <WhatsAppFloatButton />
    </div>
  )
}
