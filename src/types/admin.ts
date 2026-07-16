import type { VehicleType } from './product'

export interface AdminCategory {
  id: string
  slug: string
  name: string
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
  slug: string
  categoryId: string
  vehicleType: VehicleType
  price: number
  installPrice: number
  stockQuantity: number
  isFeatured: boolean
  isActive: boolean
  description: string
}
