import { supabase } from '../supabase'
import { compressImage } from '../compressImage'
import type { Category } from '../../types/product'
import type { AdminCategory, CategoryFormValues } from '../../types/admin'

const ICON_BUCKET = 'category-icons'

interface AdminCategoryRow {
  id: string
  slug: string
  name: string
  sort_order: number
  icon_url: string | null
  products: { count: number }[]
}

function mapRow(row: AdminCategoryRow): AdminCategory {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sortOrder: row.sort_order,
    productCount: row.products[0]?.count ?? 0,
    iconUrl: row.icon_url,
  }
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('slug, name, icon_url')
    .order('sort_order')

  if (error) throw error
  return data.map((row) => ({ slug: row.slug, name: row.name, iconUrl: row.icon_url }))
}

export async function fetchAdminCategories(): Promise<AdminCategory[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name, sort_order, icon_url, products(count)')
    .order('sort_order')

  if (error) throw error
  return (data as unknown as AdminCategoryRow[]).map(mapRow)
}

export async function createCategory(values: CategoryFormValues): Promise<void> {
  const { data: last } = await supabase
    .from('categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase.from('categories').insert({
    name: values.name,
    slug: values.slug,
    sort_order: (last?.sort_order ?? -1) + 1,
  })

  if (error) throw error
}

export async function updateCategory(id: string, values: CategoryFormValues): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .update({ name: values.name, slug: values.slug })
    .eq('id', id)

  if (error) throw error
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

export async function uploadCategoryIcon(id: string, slug: string, file: File): Promise<string> {
  const optimized = await compressImage(file)
  const ext = optimized.name.includes('.') ? optimized.name.split('.').pop() : 'jpg'
  const path = `${slug}-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage.from(ICON_BUCKET).upload(path, optimized, {
    contentType: optimized.type || 'image/jpeg',
  })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(ICON_BUCKET).getPublicUrl(path)

  const { error: updateError } = await supabase
    .from('categories')
    .update({ icon_url: data.publicUrl })
    .eq('id', id)
  if (updateError) throw updateError

  return data.publicUrl
}

export async function removeCategoryIcon(id: string): Promise<void> {
  const { error } = await supabase.from('categories').update({ icon_url: null }).eq('id', id)
  if (error) throw error
}

export async function swapCategoryOrder(
  a: { id: string; sortOrder: number },
  b: { id: string; sortOrder: number },
): Promise<void> {
  const [{ error: errorA }, { error: errorB }] = await Promise.all([
    supabase.from('categories').update({ sort_order: b.sortOrder }).eq('id', a.id),
    supabase.from('categories').update({ sort_order: a.sortOrder }).eq('id', b.id),
  ])

  if (errorA) throw errorA
  if (errorB) throw errorB
}
