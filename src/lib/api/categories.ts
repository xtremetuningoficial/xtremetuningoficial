import { supabase } from '../supabase'
import type { Category } from '../../types/product'

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('slug, name')
    .order('sort_order')

  if (error) throw error
  return data
}
