import { useState } from 'react'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { HazardDivider } from './components/layout/HazardDivider'
import { WhatsAppFloatButton } from './components/layout/WhatsAppFloatButton'
import { Hero } from './components/home/Hero'
import { TrustBar } from './components/home/TrustBar'
import { CategorySection } from './components/home/CategorySection'
import { CatalogSection } from './components/catalog/CatalogSection'
import { MissionBand } from './components/home/MissionBand'

export default function App() {
  const [activeCategory, setActiveCategory] = useState('all')

  return (
    <div className="min-h-screen bg-paper-50">
      <Header />
      <Hero />
      <TrustBar />
      <CategorySection activeCategory={activeCategory} onSelect={setActiveCategory} />
      <HazardDivider />
      <CatalogSection activeCategory={activeCategory} onSelect={setActiveCategory} />
      <MissionBand />
      <Footer />
      <WhatsAppFloatButton />
    </div>
  )
}
