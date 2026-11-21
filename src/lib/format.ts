const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export function formatCOP(amount: number): string {
  return currencyFormatter.format(amount).replace('COP', '$').replace(/\s/g, '')
}

const dateTimeFormatter = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
}

/** Nombre para mostrar: sin emojis (algunos productos se cargaron con ellos) ni espacios dobles. */
export function displayName(name: string): string {
  return name
    .replace(/\p{Extended_Pictographic}|\u{FE0F}|\u{200D}/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/**
 * Viñetas que sirven en una tarjeta: se descartan los rótulos sueltos ("Características:")
 * y las líneas muy cortas, que en la descripción cruda vienen como encabezados.
 */
export function cardBullets(lines: string[], max = 2): string[] {
  return lines
    .map((line) => displayName(line))
    .filter((line) => line.length >= 12 && !line.endsWith(':'))
    .slice(0, max)
}
