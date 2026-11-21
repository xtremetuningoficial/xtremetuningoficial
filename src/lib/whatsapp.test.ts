import { describe, expect, it } from 'vitest'
import type { Product } from '../types/product'
import {
  GENERAL_INQUIRY_LINK,
  SOUND_SERVICE_INQUIRY_LINK,
  TINT_SERVICE_INQUIRY_LINK,
  WHATSAPP_NUMBER,
  buildCartInquiryLink,
  buildProductInquiryLink,
  buildWhatsAppLink,
} from './whatsapp'

/** Saca el texto del enlace de wa.me ya decodificado. */
function mensaje(link: string): string {
  const url = new URL(link)
  return url.searchParams.get('text') ?? ''
}

function producto(cambios: Partial<Product> = {}): Product {
  return {
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
    description: [],
    image: '',
    media: [],
    ...cambios,
  }
}

describe('buildWhatsAppLink', () => {
  it('apunta a wa.me con el número del taller', () => {
    expect(buildWhatsAppLink('hola')).toBe(`https://wa.me/${WHATSAPP_NUMBER}?text=hola`)
  })

  it('codifica espacios, saltos de línea, tildes, ñ y signos especiales', () => {
    const texto = 'Hola, ¿tienen señal?\n*Año 2026* & 50 % #1 +57 =ok'
    const link = buildWhatsAppLink(texto)
    const query = link.split('?text=')[1]
    // `*` (negrita de WhatsApp) es un carácter seguro en la URL y no se codifica.
    expect(query).not.toMatch(/[ \n&#+=?]/)
    expect(query).toContain('%0A')
    expect(query).toContain('%C3%B1') // ñ
    expect(decodeURIComponent(query)).toBe(texto)
    expect(mensaje(link)).toBe(texto)
  })

  it('mensaje vacío deja el parámetro text vacío', () => {
    expect(buildWhatsAppLink('')).toBe(`https://wa.me/${WHATSAPP_NUMBER}?text=`)
  })

  it('el número va sin "+" ni espacios (formato de wa.me)', () => {
    expect(WHATSAPP_NUMBER).toMatch(/^57\d{10}$/)
  })
})

describe('enlaces fijos de consulta', () => {
  it.each([
    ['general', GENERAL_INQUIRY_LINK, 'más información'],
    ['sonido', SOUND_SERVICE_INQUIRY_LINK, 'equipo de sonido'],
    ['polarizado', TINT_SERVICE_INQUIRY_LINK, 'polarizado'],
  ])('consulta %s saluda al taller y nombra el servicio', (_nombre, link, palabra) => {
    const texto = mensaje(link)
    expect(texto.startsWith('Hola Xtreme Tuning')).toBe(true)
    expect(texto).toContain(palabra)
  })
})

describe('buildProductInquiryLink', () => {
  it('sin descuento muestra precio e instalación', () => {
    const texto = mensaje(buildProductInquiryLink(producto()))
    expect(texto).toBe(
      [
        'Hola Xtreme Tuning, estoy interesado en:',
        '*Luces LED*',
        'Producto: $150.000 · Instalación: $30.000',
        '¿Me confirman disponibilidad?',
      ].join('\n'),
    )
  })

  it('con descuento muestra el porcentaje y el precio anterior', () => {
    const texto = mensaje(
      buildProductInquiryLink(producto({ price: 135_000, regularPrice: 150_000, discountPercent: 10 })),
    )
    expect(texto).toContain('Producto: $135.000 (−10 %, antes $150.000) · Instalación: $30.000')
  })

  it('sin instalación (0 = no aplica) no la menciona', () => {
    const texto = mensaje(buildProductInquiryLink(producto({ installPrice: 0 })))
    expect(texto).toContain('Producto: $150.000')
    expect(texto).not.toContain('Instalación')
  })

  it('nombres con símbolos no rompen la URL', () => {
    const link = buildProductInquiryLink(producto({ name: 'Kit 12V & 24V #1 ñ' }))
    expect(link).not.toMatch(/[ &#]/)
    expect(mensaje(link)).toContain('*Kit 12V & 24V #1 ñ*')
  })
})

describe('buildCartInquiryLink', () => {
  it('suma productos, instalación y total sin descuentos', () => {
    const texto = mensaje(
      buildCartInquiryLink([
        { product: producto(), quantity: 2 },
        { product: producto({ id: 'p2', name: 'Parlante', price: 80_000, regularPrice: 80_000, installPrice: 0 }), quantity: 1 },
      ]),
    )
    expect(texto).toContain('• 2x *Luces LED* — $360.000')
    expect(texto).toContain('• 1x *Parlante* — $80.000')
    expect(texto).toContain('Productos: $380.000')
    expect(texto).toContain('Instalación: $60.000')
    expect(texto).toContain('*Total: $440.000*')
    expect(texto).not.toContain('Ahorro')
  })

  it('si nada del pedido lleva instalación, omite esa línea', () => {
    const texto = mensaje(buildCartInquiryLink([{ product: producto({ installPrice: 0 }), quantity: 1 }]))
    expect(texto).not.toContain('Instalación')
    expect(texto).toContain('*Total: $150.000*')
  })

  it('con descuento muestra el porcentaje por línea y el ahorro total', () => {
    const texto = mensaje(
      buildCartInquiryLink([
        { product: producto({ price: 135_000, regularPrice: 150_000, discountPercent: 10 }), quantity: 3 },
      ]),
    )
    expect(texto).toContain('• 3x *Luces LED* (−10 %) — $495.000')
    expect(texto).toContain('Productos: $405.000')
    expect(texto).toContain('Ahorro por descuentos: $45.000')
    expect(texto).toContain('Instalación: $90.000')
    expect(texto).toContain('*Total: $495.000*')
  })

  it('el total es productos + instalación', () => {
    const texto = mensaje(
      buildCartInquiryLink([
        { product: producto({ price: 12_300, regularPrice: 13_700, discountPercent: 10, installPrice: 5_000 }), quantity: 4 },
      ]),
    )
    // 12.300*4 = 49.200; 5.000*4 = 20.000
    expect(texto).toContain('Productos: $49.200')
    expect(texto).toContain('Ahorro por descuentos: $5.600')
    expect(texto).toContain('*Total: $69.200*')
  })

  it('carrito vacío arma un mensaje con totales en cero', () => {
    const texto = mensaje(buildCartInquiryLink([]))
    expect(texto.startsWith('Hola Xtreme Tuning, quiero pedir esto:')).toBe(true)
    expect(texto).toContain('Productos: $0')
    expect(texto).toContain('*Total: $0*')
  })

  it('el enlace queda bien codificado (sin espacios ni saltos crudos)', () => {
    const link = buildCartInquiryLink([{ product: producto(), quantity: 1 }])
    expect(link.startsWith(`https://wa.me/${WHATSAPP_NUMBER}?text=`)).toBe(true)
    expect(link).not.toMatch(/[ \n]/)
  })
})
