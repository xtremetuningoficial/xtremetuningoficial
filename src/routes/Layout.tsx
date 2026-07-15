import { Outlet } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { WhatsAppFloatButton } from '../components/layout/WhatsAppFloatButton'
import { useCategories } from '../hooks/useCategories'

export function Layout() {
  const categoriesState = useCategories()

  return (
    <div className="min-h-screen bg-paper-50">
      <Header categories={categoriesState.data} />
      <Outlet context={categoriesState} />
      <Footer categories={categoriesState.data} />
      <WhatsAppFloatButton />
    </div>
  )
}
