import { supabase } from '../supabase'
import { compressImage } from '../compressImage'
import { slugify } from '../slugify'
import { endOfDayBogota, toBogotaDateInput } from '../pricing'
import { getErrorMessage, isUniqueViolation } from '../errors'
import type { AdminProduct, AdminProductMedia, ProductFormValues } from '../../types/admin'
import type { MediaType, VehicleType } from '../../types/product'

const BUCKET = 'product-images'
const MAX_VIDEO_BYTES = 30 * 1024 * 1024
export const MAX_MEDIA_PER_PRODUCT = 3

const ADMIN_SELECT =
  'id, slug, name, description, price, install_price, discount_percent, discount_ends_at, stock_quantity, is_active, is_featured, vehicle_type, categories(id, name), product_images(url, sort_order, media_type)'

interface AdminProductRow {
  id: string
  slug: string
  name: string
  description: string | null
  price: number
  install_price: number | null
  discount_percent: number | null
  discount_ends_at: string | null
  stock_quantity: number
  is_active: boolean
  is_featured: boolean
  vehicle_type: VehicleType
  categories: { id: string; name: string } | { id: string; name: string }[] | null
  product_images: { url: string; sort_order: number; media_type: MediaType }[] | null
}

export function mapRow(row: AdminProductRow): AdminProduct {
  const category = Array.isArray(row.categories) ? row.categories[0] : row.categories
  const media = [...(row.product_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => ({ url: item.url, mediaType: item.media_type }))

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? '',
    categoryId: category?.id ?? null,
    categoryName: category?.name ?? null,
    price: row.price,
    installPrice: row.install_price ?? 0,
    discountPercent: row.discount_percent ?? 0,
    discountEndsAt: row.discount_ends_at,
    stockQuantity: row.stock_quantity,
    isActive: row.is_active,
    isFeatured: row.is_featured,
    vehicleType: row.vehicle_type,
    imageUrl: media.find((item) => item.mediaType === 'image')?.url ?? null,
    media,
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
    name: values.name,
    category_id: values.categoryId,
    vehicle_type: values.vehicleType,
    price: values.price,
    install_price: values.installPrice,
    discount_percent: values.discountPercent,
    discount_ends_at:
      values.discountPercent > 0 && values.discountEndsOn ? endOfDayBogota(values.discountEndsOn) : null,
    stock_quantity: values.stockQuantity,
    is_featured: values.isFeatured,
    is_active: values.isActive,
    description: values.description,
  }
}

export async function createProduct(values: ProductFormValues): Promise<{ id: string; slug: string }> {
  const baseSlug = slugify(values.name)
  const row = toRow(values)

  for (let attempt = 1; attempt <= 30; attempt += 1) {
    const slug = attempt === 1 ? baseSlug : `${baseSlug}-${attempt}`
    const { data, error } = await supabase
      .from('products')
      .insert({ ...row, slug })
      .select('id, slug')
      .single()

    if (!error) return data
    if (!isUniqueViolation(error)) throw error
  }

  throw new Error('No pudimos generar un slug único para este producto.')
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

export function detectMediaType(file: File): MediaType | null {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  return null
}

export function validateMediaFile(file: File): string | null {
  const mediaType = detectMediaType(file)
  if (!mediaType) return 'Solo se permiten imágenes o videos.'
  if (mediaType === 'video' && file.size > MAX_VIDEO_BYTES) {
    return 'El video no puede pesar más de 30 MB.'
  }
  return null
}

export async function uploadProductMedia(slug: string, file: File): Promise<AdminProductMedia> {
  const mediaType = detectMediaType(file)
  if (!mediaType) throw new Error('Solo se permiten imágenes o videos.')

  const uploadFile = mediaType === 'image' ? await compressImage(file) : file
  const ext = uploadFile.name.includes('.') ? uploadFile.name.split('.').pop() : mediaType === 'image' ? 'jpg' : 'mp4'
  const path = `${slug}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, uploadFile, {
    contentType: uploadFile.type || (mediaType === 'image' ? 'image/jpeg' : 'video/mp4'),
  })

  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, mediaType }
}

/** Producto de la base → valores del formulario de edición. */
export function productToFormValues(product: AdminProduct): ProductFormValues {
  return {
    name: product.name,
    categoryId: product.categoryId ?? '',
    vehicleType: product.vehicleType,
    price: product.price,
    installPrice: product.installPrice,
    discountPercent: product.discountPercent,
    discountEndsOn: product.discountEndsAt ? toBogotaDateInput(product.discountEndsAt) : '',
    stockQuantity: product.stockQuantity,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    description: product.description,
  }
}

/** Un recurso del formulario: uno que ya está en Storage o un archivo nuevo por subir. */
export type MediaDraft = { kind: 'existing'; media: AdminProductMedia } | { kind: 'new'; file: File }

export interface SavedProduct {
  id: string
  slug: string
}

/**
 * El producto quedó guardado en la base, pero las fotos no.
 * Lleva el producto creado y lo que alcanzó a subir, para reintentar sobre el
 * mismo producto (sin crear `mi-producto-2`) y sin volver a subir lo que ya subió.
 */
export class ProductMediaSaveError extends Error {
  readonly product: SavedProduct
  /** Mismo orden que los borradores; `null` donde la subida no alcanzó a terminar. */
  readonly resolved: (AdminProductMedia | null)[]

  constructor(product: SavedProduct, resolved: (AdminProductMedia | null)[], cause: unknown) {
    super(getErrorMessage(cause))
    this.name = 'ProductMediaSaveError'
    this.product = product
    this.resolved = resolved
  }
}

/**
 * Guarda un producto completo: datos, subida de archivos nuevos y orden de medios.
 * Si `existing` viene, actualiza; si no, crea.
 */
export async function saveProduct(input: {
  existing: SavedProduct | null
  values: ProductFormValues
  media: MediaDraft[]
}): Promise<SavedProduct> {
  let product: SavedProduct
  if (input.existing) {
    await updateProduct(input.existing.id, input.values)
    product = input.existing
  } else {
    product = await createProduct(input.values)
  }

  const resolved: (AdminProductMedia | null)[] = input.media.map((draft) =>
    draft.kind === 'existing' ? draft.media : null,
  )

  try {
    for (const [index, draft] of input.media.entries()) {
      if (draft.kind === 'new') resolved[index] = await uploadProductMedia(product.slug, draft.file)
    }
    await replaceProductMedia(
      product.id,
      resolved.filter((item): item is AdminProductMedia => item !== null),
    )
  } catch (error) {
    throw new ProductMediaSaveError(product, resolved, error)
  }

  return product
}

export async function replaceProductMedia(productId: string, items: AdminProductMedia[]): Promise<void> {
  const { error: deleteError } = await supabase
    .from('product_images')
    .delete()
    .eq('product_id', productId)

  if (deleteError) throw deleteError
  if (items.length === 0) return

  const { error: insertError } = await supabase.from('product_images').insert(
    items.map((item, index) => ({
      product_id: productId,
      url: item.url,
      sort_order: index,
      media_type: item.mediaType,
    })),
  )

  if (insertError) throw insertError
}
