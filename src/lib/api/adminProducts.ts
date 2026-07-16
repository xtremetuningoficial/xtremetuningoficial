import { supabase } from '../supabase'
import type { AdminProduct, ProductFormValues } from '../../types/admin'
import type { VehicleType } from '../../types/product'

const BUCKET = 'product-images'

const ADMIN_SELECT =
  'id, slug, name, description, price, install_price, stock_quantity, is_active, is_featured, vehicle_type, categories(id, name), product_images(url, sort_order)'

interface AdminProductRow {
  id: string
  slug: string
  name: string
  description: string | null
  price: number
  install_price: number | null
  stock_quantity: number
  is_active: boolean
  is_featured: boolean
  vehicle_type: VehicleType
  categories: { id: string; name: string } | { id: string; name: string }[] | null
  product_images: { url: string; sort_order: number }[] | null
}

function mapRow(row: AdminProductRow): AdminProduct {
  const category = Array.isArray(row.categories) ? row.categories[0] : row.categories
  const images = [...(row.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? '',
    categoryId: category?.id ?? null,
    categoryName: category?.name ?? null,
    price: row.price,
    installPrice: row.install_price ?? 0,
    stockQuantity: row.stock_quantity,
    isActive: row.is_active,
    isFeatured: row.is_featured,
    vehicleType: row.vehicle_type,
    imageUrl: images[0]?.url ?? null,
  }
}

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const { data, error } = await supabase.from('products').select(ADMIN_SELECT).order('name')
  if (error) throw error
  return (data as unknown as AdminProductRow[]).map(mapRow)
}

export async function fetchAdminProductById(id: string): Promise<AdminProduct | null> {
  const { data, error } = await supabase
    .from('products')
    .select(ADMIN_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ? mapRow(data as unknown as AdminProductRow) : null
}

function toRow(values: ProductFormValues) {
  return {
    slug: values.slug,
    name: values.name,
    category_id: values.categoryId,
    vehicle_type: values.vehicleType,
    price: values.price,
    install_price: values.installPrice,
    stock_quantity: values.stockQuantity,
    is_featured: values.isFeatured,
    is_active: values.isActive,
    description: values.description,
  }
}

export async function createProduct(values: ProductFormValues): Promise<{ id: string; slug: string }> {
  const { data, error } = await supabase
    .from('products')
    .insert(toRow(values))
    .select('id, slug')
    .single()

  if (error) throw error
  return data
}

export async function updateProduct(id: string, values: ProductFormValues): Promise<void> {
  const { error } = await supabase.from('products').update(toRow(values)).eq('id', id)
  if (error) throw error
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function setProductActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from('products').update({ is_active: isActive }).eq('id', id)
  if (error) throw error
}

export async function uploadProductImage(slug: string, file: File): Promise<string> {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
  const path = `${slug}-${Date.now()}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || 'image/jpeg',
  })

  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function replaceProductImage(productId: string, url: string): Promise<void> {
  const { error: deleteError } = await supabase
    .from('product_images')
    .delete()
    .eq('product_id', productId)

  if (deleteError) throw deleteError

  const { error: insertError } = await supabase
    .from('product_images')
    .insert({ product_id: productId, url, sort_order: 0 })

  if (insertError) throw insertError
}
