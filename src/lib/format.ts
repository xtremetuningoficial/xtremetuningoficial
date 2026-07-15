const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export function formatCOP(amount: number): string {
  return currencyFormatter.format(amount).replace('COP', '$').replace(/\s/g, '')
}
