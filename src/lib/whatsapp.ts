import type { Product } from '../types/product'
import { formatCOP } from './format'

export const WHATSAPP_NUMBER = '573118664441'
export const WHATSAPP_NUMBER_DISPLAY = '311 866 4441'

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export function buildProductInquiryLink(product: Product): string {
  const message = [
    `Hola Xtreme Tuning, estoy interesado en:`,
    `*${product.name}*`,
    product.discountPercent > 0
      ? `Producto: ${formatCOP(product.price)} (−${product.discountPercent} %, antes ${formatCOP(product.regularPrice)}) · Instalación: ${formatCOP(product.installPrice)}`
      : `Producto: ${formatCOP(product.price)} · Instalación: ${formatCOP(product.installPrice)}`,
    `¿Me confirman disponibilidad?`,
  ].join('\n')

  return buildWhatsAppLink(message)
}

export const GENERAL_INQUIRY_LINK = buildWhatsAppLink(
  'Hola Xtreme Tuning, quiero más información sobre sus productos.',
)

export const SOUND_SERVICE_INQUIRY_LINK = buildWhatsAppLink(
  'Hola Xtreme Tuning, quiero cotizar una adaptación o instalación de equipo de sonido para mi vehículo.',
)

export const TINT_SERVICE_INQUIRY_LINK = buildWhatsAppLink(
  'Hola Xtreme Tuning, quiero cotizar un polarizado para mi vehículo.',
)

export interface CartInquiryItem {
  product: Product
  quantity: number
}

export function buildCartInquiryLink(items: CartInquiryItem[]): string {
  const productsTotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const installTotal = items.reduce(
    (sum, item) => sum + item.product.installPrice * item.quantity,
    0,
  )
  const savings = items.reduce(
    (sum, item) => sum + (item.product.regularPrice - item.product.price) * item.quantity,
    0,
  )

  const lines = [
    'Hola Xtreme Tuning, quiero pedir esto:',
    '',
    ...items.map((item) => {
      const subtotal = (item.product.price + item.product.installPrice) * item.quantity
      const discount = item.product.discountPercent > 0 ? ` (−${item.product.discountPercent} %)` : ''
      return `• ${item.quantity}x *${item.product.name}*${discount} — ${formatCOP(subtotal)}`
    }),
    '',
    `Productos: ${formatCOP(productsTotal)}`,
    ...(savings > 0 ? [`Ahorro por descuentos: ${formatCOP(savings)}`] : []),
    `Instalación: ${formatCOP(installTotal)}`,
    `*Total: ${formatCOP(productsTotal + installTotal)}*`,
    '',
    '¿Me confirman disponibilidad y cómo coordinamos el pago y la instalación?',
  ]

  return buildWhatsAppLink(lines.join('\n'))
}
