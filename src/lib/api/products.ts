import { supabase } from '../supabase'
import { applyDiscount, isDiscountActive } from '../pricing'
import type { MediaType, Product, VehicleType } from '../../types/product'

const PRODUCT_SELECT =
  'id, slug, name, description, price, install_price, discount_percent, discount_ends_at, is_featured, vehicle_type, categories(slug), product_images(url, sort_order, media_type)'

interface ProductRow {
  id: string
  slug: string
  name: string
  description: string | null
  price: number
  install_price: number | null
  discount_percent: number | null
  discount_ends_at: string | null
  is_featured: boolean
  vehicle_type: VehicleType
  categories: { slug: string } | { slug: string }[] | null
  product_images: { url: string; sort_order: number; media_type: MediaType }[] | null
}

function mapRow(row: ProductRow): Product {
  const media = [...(row.product_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => ({ url: item.url, type: item.media_type }))

  const category = Array.isArray(row.categories) ? row.categories[0] : row.categories
  const discountPercent = isDiscountActive(row.discount_percent ?? 0, row.discount_ends_at)
    ? (row.discount_percent ?? 0)
    : 0

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categorySlug: category?.slug ?? '',
    vehicleType: row.vehicle_type,
    price: applyDiscount(row.price, discountPercent),
    regularPrice: row.price,
    discountPercent,
    discountEndsAt: discountPercent > 0 ? row.discount_ends_at : null,
    installPrice: row.install_price ?? 0,
    description: row.description ? row.description.split('\n').filter(Boolean) : [],
    image: media.find((item) => item.type === 'image')?.url ?? '',
    media,
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
