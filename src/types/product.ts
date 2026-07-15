export type VehicleType = 'carro' | 'moto' | 'universal'

export interface Category {
  slug: string
  name: string
}

export interface Product {
  id: string
  slug: string
  name: string
  categorySlug: string
  vehicleType: VehicleType
  price: number
  installPrice: number
  description: string[]
  image: string
  images?: string[]
  featured?: boolean
}
