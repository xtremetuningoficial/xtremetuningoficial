import { useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigationType } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { WhatsAppFloatButton } from '../components/layout/WhatsAppFloatButton'
import { useCategories } from '../hooks/useCategories'

const esInicio = (path: string) => path === '/' || path.startsWith('/categoria/')

export function Layout() {
  const categoriesState = useCategories()
  const { pathname } = useLocation()
  const navigationType = useNavigationType()
  const previous = useRef(pathname)

  // Al abrir una ficha o el carrito se empieza arriba. Entre el inicio y sus categorías no se
  // mueve (el filtro ya lleva al catálogo) y con "atrás" se deja al navegador.
  useEffect(() => {
    const from = previous.current
    previous.current = pathname
    if (from === pathname || navigationType === 'POP') return
    if (esInicio(from) && esInicio(pathname)) return
    window.scrollTo(0, 0)
  }, [pathname, navigationType])

  // El flotante sobra donde ya hay un botón de WhatsApp a la vista (ficha y carrito) y en
  // pantallas anchas, donde la barra de arriba ya lo muestra con texto.
  const showFloat = !pathname.startsWith('/producto/') && pathname !== '/carrito'

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
      <Footer categories={categoriesState.data} spaceForFloat={showFloat} />
      {showFloat && <WhatsAppFloatButton />}
    </div>
  )
}
