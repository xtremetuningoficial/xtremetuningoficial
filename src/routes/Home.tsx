import { useEffect } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { Hero } from '../components/home/Hero'
import { TrustBar } from '../components/home/TrustBar'
import { CategorySection } from '../components/home/CategorySection'
import { CatalogSection } from '../components/catalog/CatalogSection'
import { SoundServiceSection } from '../components/home/SoundServiceSection'
import { MissionBand } from '../components/home/MissionBand'
import { TestimonialsSection } from '../components/home/TestimonialsSection'
import { VisitStore } from '../components/home/VisitStore'
import { HazardDivider } from '../components/layout/HazardDivider'
import { useProducts } from '../hooks/useProducts'
import { useProductRatings } from '../hooks/useProductRatings'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import type { Category } from '../types/product'

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
      <Hero />
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
      <MissionBand />
      <TestimonialsSection />
      <VisitStore />
    </>
  )
}
