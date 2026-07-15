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
