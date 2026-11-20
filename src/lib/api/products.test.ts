import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// mapRow es lógica pura; el cliente de Supabase no se usa aquí.
vi.mock('../supabase', () => ({ supabase: {}, isSupabaseConfigured: false }))

import { mapRow } from './products'

type ProductRow = Parameters<typeof mapRow>[0]

function fila(cambios: Partial<ProductRow> = {}): ProductRow {
  return {
    id: 'p1',
    slug: 'luces-led',
    name: 'Luces LED',
    description: 'Primera línea\nSegunda línea',
    price: 150_000,
    install_price: 30_000,
    discount_percent: 0,
    discount_ends_at: null,
    is_featured: true,
    vehicle_type: 'carro',
    categories: { slug: 'iluminacion' },
    product_images: [
      { url: 'b.jpg', sort_order: 2, media_type: 'image' },
      { url: 'v.mp4', sort_order: 0, media_type: 'video' },
      { url: 'a.jpg', sort_order: 1, media_type: 'image' },
    ],
    ...cambios,
  }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-15T12:00:00-05:00'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('mapRow (catálogo)', () => {
  it('mapea una fila completa sin descuento', () => {
    expect(mapRow(fila())).toEqual({
      id: 'p1',
      slug: 'luces-led',
      name: 'Luces LED',
      categorySlug: 'iluminacion',
      vehicleType: 'carro',
      price: 150_000,
      regularPrice: 150_000,
      discountPercent: 0,
      discountEndsAt: null,
      installPrice: 30_000,
      description: ['Primera línea', 'Segunda línea'],
      image: 'a.jpg',
      media: [
        { url: 'v.mp4', type: 'video' },
        { url: 'a.jpg', type: 'image' },
        { url: 'b.jpg', type: 'image' },
      ],
      featured: true,
    })
  })

  it('ordena los medios por sort_order sin mutar la fila', () => {
    const original = fila()
    const copia = structuredClone(original.product_images)
    mapRow(original)
    expect(original.product_images).toEqual(copia)
  })

  it('la imagen principal es la primera foto, saltando videos', () => {
    expect(mapRow(fila()).image).toBe('a.jpg')
  })

  it('descuento vigente: aplica el precio con descuento redondeado', () => {
    const p = mapRow(fila({ discount_percent: 15, discount_ends_at: '2026-11-20T23:59:59-05:00' }))
    expect(p.discountPercent).toBe(15)
    expect(p.price).toBe(127_500)
    expect(p.regularPrice).toBe(150_000)
    expect(p.discountEndsAt).toBe('2026-11-20T23:59:59-05:00')
  })

  it('descuento sin fecha de fin está vigente', () => {
    const p = mapRow(fila({ discount_percent: 10, discount_ends_at: null }))
    expect(p.price).toBe(135_000)
    expect(p.discountEndsAt).toBeNull()
  })

  it('descuento vencido: precio normal y sin fecha de fin', () => {
    const p = mapRow(fila({ discount_percent: 15, discount_ends_at: '2026-11-14T23:59:59-05:00' }))
    expect(p.discountPercent).toBe(0)
    expect(p.price).toBe(150_000)
    expect(p.regularPrice).toBe(150_000)
    expect(p.discountEndsAt).toBeNull()
  })

  it('fila incompleta: nulos se vuelven valores seguros', () => {
    const p = mapRow(
      fila({
        description: null,
        install_price: null,
        discount_percent: null,
        categories: null,
        product_images: null,
      }),
    )
    expect(p.description).toEqual([])
    expect(p.installPrice).toBe(0)
    expect(p.discountPercent).toBe(0)
    expect(p.categorySlug).toBe('')
    expect(p.media).toEqual([])
    expect(p.image).toBe('')
  })

  it('categoría como arreglo toma la primera', () => {
    expect(mapRow(fila({ categories: [{ slug: 'sonido' }, { slug: 'otra' }] })).categorySlug).toBe('sonido')
  })

  it('categoría como arreglo vacío da slug vacío', () => {
    expect(mapRow(fila({ categories: [] })).categorySlug).toBe('')
  })

  it('solo videos: no hay imagen principal', () => {
    const p = mapRow(fila({ product_images: [{ url: 'v.mp4', sort_order: 0, media_type: 'video' }] }))
    expect(p.image).toBe('')
    expect(p.media).toHaveLength(1)
  })

  it('descripción: quita líneas vacías', () => {
    expect(mapRow(fila({ description: 'Uno\n\n\nDos\n' })).description).toEqual(['Uno', 'Dos'])
  })

  it('descripción vacía da lista vacía', () => {
    expect(mapRow(fila({ description: '' })).description).toEqual([])
  })

  it('is_featured falso se conserva', () => {
    expect(mapRow(fila({ is_featured: false })).featured).toBe(false)
  })
})
