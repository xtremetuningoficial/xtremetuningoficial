export const MAX_DISCOUNT_PERCENT = 90

/** El descuento cuenta si es mayor a 0 y no ha vencido (sin fecha = vigente). */
export function isDiscountActive(percent: number, endsAt: string | null, now = new Date()): boolean {
  if (percent <= 0) return false
  if (!endsAt) return true
  return new Date(endsAt).getTime() > now.getTime()
}

/** Precio con descuento, redondeado a la centena como se cobra en tienda. */
export function applyDiscount(price: number, percent: number): number {
  if (percent <= 0) return price
  return Math.round((price * (100 - percent)) / 10000) * 100
}

/** Colombia no cambia de horario: siempre UTC−5. */
const BOGOTA_OFFSET = '-05:00'

// Fijar la zona evita que la fecha salga un día corrida en un celular con otra zona horaria.
const endDateFormatter = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'long',
  timeZone: 'America/Bogota',
})

export function formatDiscountEnd(endsAt: string): string {
  return endDateFormatter.format(new Date(endsAt))
}

/** "2026-11-15" (input date) → fin de ese día en hora de Colombia. */
export function endOfDayBogota(date: string): string {
  return `${date}T23:59:59${BOGOTA_OFFSET}`
}

/** "2026-11-15" (input date) → mediodía de ese día en hora de Colombia, para mostrarlo sin correrse. */
export function dateInputToBogotaNoon(date: string): string {
  return `${date}T12:00:00${BOGOTA_OFFSET}`
}

/** ISO → "YYYY-MM-DD" en hora de Colombia, para el input date. */
export function toBogotaDateInput(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date(iso))
}
