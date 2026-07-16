export type VehicleType = 'carro' | 'moto' | 'universal'
export type MediaType = 'image' | 'video'

export interface Category {
  slug: string
  name: string
}

export interface ProductMedia {
  url: string
  type: MediaType
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
  media: ProductMedia[]
  featured?: boolean
}
