import { useEffect } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { Hero } from '../components/home/Hero'
import { TrustBar } from '../components/home/TrustBar'
import { CategorySection } from '../components/home/CategorySection'
import { CatalogSection } from '../components/catalog/CatalogSection'
import { SoundServiceSection } from '../components/home/SoundServiceSection'
import { PolarizadoSection } from '../components/home/PolarizadoSection'
import { MissionBand } from '../components/home/MissionBand'
import { TestimonialsSection } from '../components/home/TestimonialsSection'
import { VisitStore } from '../components/home/VisitStore'
import { HazardDivider } from '../components/layout/HazardDivider'
import { useProducts } from '../hooks/useProducts'
import { useProductRatings } from '../hooks/useProductRatings'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import type { Category } from '../types/product'
import { montarEscenas } from '../scripts/escenas'

interface CategoriesContext {
  status: 'loading' | 'success' | 'error'
  data: Category[]
}

export default function Home() {
  const { categorySlug } = useParams()
  const navigate = useNavigate()
  const categoriesState = useOutletContext<CategoriesContext>()
  const productsState = useProducts()
  const productRatings = useProductRatings()
  const activeCategory = categorySlug ?? 'all'

  const activeCategoryName = categoriesState.data.find((c) => c.slug === categorySlug)?.name
  useDocumentTitle(activeCategoryName)

  // Escenas de scroll del kit de la casa: héroe que se abre (sólo desde 1024 px, donde la
  // foto ocupa el costado), riel de sonido (desde 768 px; en celular queda el carrusel con
  // el dedo) y niveles de polarizado que se encienden. Respeta "reducir movimiento".
  useEffect(() => {
    const opciones = {
      barra: '[data-barra]',
      ancho: '(min-width: 1024px) and (min-height: 620px)',
      alto: '(min-width: 768px) and (min-height: 620px)',
    }
    montarEscenas(opciones)
    // Al salir de la home se sueltan las escenas que ya no están en pantalla.
    return () => montarEscenas(opciones)
  }, [])

  useEffect(() => {
    if (categorySlug) {
      document.getElementById('catalogo')?.scrollIntoView({ block: 'start' })
    }
  }, [categorySlug])

  function handleSelectCategory(slug: string) {
    navigate(slug === 'all' ? '/' : `/categoria/${slug}`)
  }

  return (
    <>
      <Hero totalProductos={productsState.status === 'success' ? productsState.data.length : null} />
      <TrustBar />
      <CategorySection
        categories={categoriesState.data}
        products={productsState.data}
        activeCategory={activeCategory}
        onSelect={handleSelectCategory}
      />
      <HazardDivider />
      <CatalogSection
        categories={categoriesState.data}
        products={productsState.data}
        status={productsState.status}
        activeCategory={activeCategory}
        onSelect={handleSelectCategory}
        ratings={productRatings}
      />
      <SoundServiceSection />
      <PolarizadoSection />
      <MissionBand />
      <TestimonialsSection />
      <VisitStore />
    </>
  )
}
