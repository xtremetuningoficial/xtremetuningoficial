export type VehicleType = 'carro' | 'moto' | 'universal'
export type MediaType = 'image' | 'video'

export interface Category {
  slug: string
  name: string
  iconUrl: string | null
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
  /** Precio que paga el cliente hoy (ya con el descuento vigente, si hay). */
  price: number
  /** Precio sin descuento; igual a `price` cuando no hay descuento. */
  regularPrice: number
  /** Porcentaje vigente; 0 si no hay descuento o ya venció. */
  discountPercent: number
  discountEndsAt: string | null
  installPrice: number
  description: string[]
  image: string
  media: ProductMedia[]
  featured?: boolean
}
