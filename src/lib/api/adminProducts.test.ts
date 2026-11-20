import { describe, expect, it, vi } from 'vitest'

// mapRow es lógica pura; el cliente de Supabase no se usa aquí.
vi.mock('../supabase', () => ({ supabase: {}, isSupabaseConfigured: false }))

import { MAX_MEDIA_PER_PRODUCT, mapRow } from './adminProducts'

type AdminProductRow = Parameters<typeof mapRow>[0]

function fila(cambios: Partial<AdminProductRow> = {}): AdminProductRow {
  return {
    id: 'p1',
    slug: 'luces-led',
    name: 'Luces LED',
    description: 'Texto',
    price: 150_000,
    install_price: 30_000,
    discount_percent: 15,
    discount_ends_at: '2020-01-01T23:59:59-05:00',
    stock_quantity: 4,
    is_active: true,
    is_featured: false,
    vehicle_type: 'moto',
    categories: { id: 'c1', name: 'Iluminación' },
    product_images: [
      { url: 'b.jpg', sort_order: 1, media_type: 'image' },
      { url: 'v.mp4', sort_order: 0, media_type: 'video' },
    ],
    ...cambios,
  }
}

describe('mapRow (admin)', () => {
  it('mapea una fila completa', () => {
    expect(mapRow(fila())).toEqual({
      id: 'p1',
      slug: 'luces-led',
      name: 'Luces LED',
      description: 'Texto',
      categoryId: 'c1',
      categoryName: 'Iluminación',
      price: 150_000,
      installPrice: 30_000,
      discountPercent: 15,
      discountEndsAt: '2020-01-01T23:59:59-05:00',
      stockQuantity: 4,
      isActive: true,
      isFeatured: false,
      vehicleType: 'moto',
      imageUrl: 'b.jpg',
      media: [
        { url: 'v.mp4', mediaType: 'video' },
        { url: 'b.jpg', mediaType: 'image' },
      ],
    })
  })

  it('el admin recibe el descuento crudo, aunque esté vencido (lo resuelve la UI)', () => {
    const p = mapRow(fila())
    expect(p.discountPercent).toBe(15)
    expect(p.price).toBe(150_000)
  })

  it('fila incompleta: nulos se vuelven valores seguros', () => {
    const p = mapRow(
      fila({
        description: null,
        install_price: null,
        discount_percent: null,
        discount_ends_at: null,
        categories: null,
        product_images: null,
      }),
    )
    expect(p.description).toBe('')
    expect(p.installPrice).toBe(0)
    expect(p.discountPercent).toBe(0)
    expect(p.discountEndsAt).toBeNull()
    expect(p.categoryId).toBeNull()
    expect(p.categoryName).toBeNull()
    expect(p.media).toEqual([])
    expect(p.imageUrl).toBeNull()
  })

  it('categoría como arreglo toma la primera; arreglo vacío da null', () => {
    expect(mapRow(fila({ categories: [{ id: 'c9', name: 'Sonido' }] })).categoryId).toBe('c9')
    expect(mapRow(fila({ categories: [] })).categoryId).toBeNull()
  })

  it('solo videos: imageUrl es null', () => {
    expect(mapRow(fila({ product_images: [{ url: 'v.mp4', sort_order: 0, media_type: 'video' }] })).imageUrl).toBeNull()
  })

  it('stock en cero se conserva (no se confunde con vacío)', () => {
    expect(mapRow(fila({ stock_quantity: 0 })).stockQuantity).toBe(0)
  })

  it('el límite de medios por producto es 3', () => {
    expect(MAX_MEDIA_PER_PRODUCT).toBe(3)
  })
})
