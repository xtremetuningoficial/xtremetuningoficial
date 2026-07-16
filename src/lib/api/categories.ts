import { supabase } from '../supabase'
import type { Category } from '../../types/product'
import type { AdminCategory, CategoryFormValues } from '../../types/admin'

interface AdminCategoryRow {
  id: string
  slug: string
  name: string
  sort_order: number
  products: { count: number }[]
}

function mapRow(row: AdminCategoryRow): AdminCategory {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sortOrder: row.sort_order,
    productCount: row.products[0]?.count ?? 0,
  }
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('slug, name')
    .order('sort_order')

  if (error) throw error
  return data
}

export async function fetchAdminCategories(): Promise<AdminCategory[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name, sort_order, products(count)')
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
