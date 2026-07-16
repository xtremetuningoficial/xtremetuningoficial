import type { VehicleType } from './product'

export interface AdminCategory {
  id: string
  slug: string
  name: string
  sortOrder: number
  productCount: number
}

export interface CategoryFormValues {
  name: string
  slug: string
}

export interface AdminProduct {
  id: string
  slug: string
  name: string
  description: string
  categoryId: string | null
  categoryName: string | null
  price: number
  installPrice: number
  stockQuantity: number
  isActive: boolean
  isFeatured: boolean
  vehicleType: VehicleType
  imageUrl: string | null
}

export interface ProductFormValues {
  name: string
  categoryId: string
  vehicleType: VehicleType
  price: number
  installPrice: number
  stockQuantity: number
  isFeatured: boolean
  isActive: boolean
  description: string
}

export type MovementReason = 'venta_tienda' | 'ingreso_mercancia' | 'ajuste' | 'venta_online'

export const MOVEMENT_REASON_LABELS: Record<MovementReason, string> = {
  venta_tienda: 'Venta en tienda',
  ingreso_mercancia: 'Ingreso de mercancía',
  ajuste: 'Ajuste',
  venta_online: 'Venta en línea',
}

export interface InventoryMovement {
  id: string
  change: number
  reason: MovementReason
  note: string | null
  createdAt: string
}
