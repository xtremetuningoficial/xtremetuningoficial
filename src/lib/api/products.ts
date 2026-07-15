import { supabase } from '../supabase'
import type { Product, VehicleType } from '../../types/product'

const PRODUCT_SELECT =
  'id, slug, name, description, price, install_price, is_featured, vehicle_type, categories(slug), product_images(url, sort_order)'

interface ProductRow {
  id: string
  slug: string
  name: string
  description: string | null
  price: number
  install_price: number | null
  is_featured: boolean
  vehicle_type: VehicleType
  categories: { slug: string } | { slug: string }[] | null
  product_images: { url: string; sort_order: number }[] | null
}

function mapRow(row: ProductRow): Product {
  const images = [...(row.product_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => image.url)

  const category = Array.isArray(row.categories) ? row.categories[0] : row.categories

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categorySlug: category?.slug ?? '',
    vehicleType: row.vehicle_type,
    price: row.price,
    installPrice: row.install_price ?? 0,
    description: row.description ? row.description.split('\n').filter(Boolean) : [],
    image: images[0] ?? '',
    images,
    featured: row.is_featured,
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return (data as unknown as ProductRow[]).map(mapRow)
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw error
  return data ? mapRow(data as unknown as ProductRow) : null
}
