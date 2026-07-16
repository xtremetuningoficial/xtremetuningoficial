import { supabase } from '../supabase'
import type { Category } from '../../types/product'
import type { AdminCategory } from '../../types/admin'

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
    .select('id, slug, name')
    .order('sort_order')

  if (error) throw error
  return data
}
