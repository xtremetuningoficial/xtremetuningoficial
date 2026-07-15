import type { Product } from '../types/product'
import { formatCOP } from './format'

export const WHATSAPP_NUMBER = '573508277999'
export const WHATSAPP_NUMBER_DISPLAY = '350 827 7999'
export const WHATSAPP_NUMBER_ALT_DISPLAY = '311 866 4441'

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export function buildProductInquiryLink(product: Product): string {
  const message = [
    `Hola Xtreme Tuning, estoy interesado en:`,
    `*${product.name}*`,
    `Producto: ${formatCOP(product.price)} · Instalación: ${formatCOP(product.installPrice)}`,
    `¿Me confirman disponibilidad?`,
  ].join('\n')

  return buildWhatsAppLink(message)
}

export const GENERAL_INQUIRY_LINK = buildWhatsAppLink(
  'Hola Xtreme Tuning, quiero más información sobre sus productos.',
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

  const lines = [
    'Hola Xtreme Tuning, quiero pedir esto:',
    '',
    ...items.map((item) => {
      const subtotal = (item.product.price + item.product.installPrice) * item.quantity
      return `• ${item.quantity}x *${item.product.name}* — ${formatCOP(subtotal)}`
    }),
    '',
    `Productos: ${formatCOP(productsTotal)}`,
    `Instalación: ${formatCOP(installTotal)}`,
    `*Total: ${formatCOP(productsTotal + installTotal)}*`,
    '',
    '¿Me confirman disponibilidad y cómo coordinamos el pago y la instalación?',
  ]

  return buildWhatsAppLink(lines.join('\n'))
}
