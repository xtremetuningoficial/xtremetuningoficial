// Igual que data/products.ts: catálogo inicial para scripts/seed-products.ts,
// no lo usa la app (que ya administra categorías desde /admin). Tipo local
// porque el Category real de la app ya incluye iconUrl, que este seed no
// necesita — seedCategories() no lo toca al escribir en Supabase.
interface SeedCategory {
  slug: string
  name: string
}

export const categories: SeedCategory[] = [
  { slug: 'alarmas-carro', name: 'Alarmas para carro' },
  { slug: 'alarmas-moto', name: 'Alarmas para moto' },
  { slug: 'bloqueo-central', name: 'Bloqueo central' },
  { slug: 'radios', name: 'Radios y multimedia' },
]
