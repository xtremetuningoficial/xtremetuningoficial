import { supabase } from '../supabase'
import type { InventoryMovement, MovementReason } from '../../types/admin'

interface MovementRow {
  id: string
  change: number
  reason: MovementReason
  note: string | null
  created_at: string
}

export async function fetchMovements(productId: string): Promise<InventoryMovement[]> {
  const { data, error } = await supabase
    .from('inventory_movements')
    .select('id, change, reason, note, created_at')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error

  return (data as MovementRow[]).map((row) => ({
    id: row.id,
    change: row.change,
    reason: row.reason,
    note: row.note,
    createdAt: row.created_at,
  }))
}

export async function adjustStock(
  productId: string,
  change: number,
  reason: MovementReason,
  note?: string,
): Promise<number> {
  const { data, error } = await supabase.rpc('adjust_product_stock', {
    p_product_id: productId,
    p_change: change,
    p_reason: reason,
    p_note: note || null,
  })

  if (error) throw error
  return data as number
}
