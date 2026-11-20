import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  MAX_DISCOUNT_PERCENT,
  applyDiscount,
  endOfDayBogota,
  formatDiscountEnd,
  isDiscountActive,
  toBogotaDateInput,
} from './pricing'

const AHORA = new Date('2026-11-15T12:00:00-05:00')

describe('isDiscountActive', () => {
  it('0 % no es descuento', () => {
    expect(isDiscountActive(0, null, AHORA)).toBe(false)
  })

  it('porcentaje negativo no es descuento', () => {
    expect(isDiscountActive(-10, null, AHORA)).toBe(false)
  })

  it('sin fecha de fin está vigente', () => {
    expect(isDiscountActive(15, null, AHORA)).toBe(true)
  })

  it('con fecha futura está vigente', () => {
    expect(isDiscountActive(15, '2026-11-15T23:59:59-05:00', AHORA)).toBe(true)
  })

  it('vencido no cuenta', () => {
    expect(isDiscountActive(15, '2026-11-14T23:59:59-05:00', AHORA)).toBe(false)
  })

  it('justo en el instante de vencer ya no cuenta', () => {
    expect(isDiscountActive(15, AHORA.toISOString(), AHORA)).toBe(false)
  })

  it('cadena vacía en la fecha cuenta como sin fecha (vigente)', () => {
    expect(isDiscountActive(15, '', AHORA)).toBe(true)
  })

  it('fecha inválida no se considera vigente', () => {
    expect(isDiscountActive(15, 'no-es-fecha', AHORA)).toBe(false)
  })

  it('sin "now" usa la hora del sistema', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-12-01T00:00:00-05:00'))
    expect(isDiscountActive(20, '2026-11-30T23:59:59-05:00')).toBe(false)
    expect(isDiscountActive(20, '2026-12-01T23:59:59-05:00')).toBe(true)
    vi.useRealTimers()
  })
})

describe('applyDiscount', () => {
  it('sin descuento devuelve el precio tal cual (sin redondear)', () => {
    expect(applyDiscount(123_456, 0)).toBe(123_456)
  })

  it('descuento negativo devuelve el precio tal cual', () => {
    expect(applyDiscount(100_000, -5)).toBe(100_000)
  })

  it('10 % de 150.000 = 135.000', () => {
    expect(applyDiscount(150_000, 10)).toBe(135_000)
  })

  it('redondea a la centena más cercana', () => {
    // 99.990 * 0.85 = 84.991,5 → 85.000 (sube)
    expect(applyDiscount(99_990, 15)).toBe(85_000)
    // 12.340 * 0.9 = 11.106 → 11.100 (baja)
    expect(applyDiscount(12_340, 10)).toBe(11_100)
  })

  it('redondea a la centena hacia arriba desde la mitad', () => {
    // 1.000 * 0.95 = 950 → 1.000 (Math.round sube en .5)
    expect(applyDiscount(1_000, 5)).toBe(1_000)
    // 33.000 * 0.85 = 28.050 → 28.100
    expect(applyDiscount(33_000, 15)).toBe(28_100)
  })

  it('el resultado siempre es múltiplo de 100 cuando hay descuento', () => {
    for (const precio of [1, 99, 4_999, 37_777, 1_234_567]) {
      for (const pct of [1, 7, 33, 50, MAX_DISCOUNT_PERCENT]) {
        expect(applyDiscount(precio, pct) % 100).toBe(0)
      }
    }
  })

  it('con el descuento máximo (90 %) queda el 10 %', () => {
    expect(applyDiscount(250_000, MAX_DISCOUNT_PERCENT)).toBe(25_000)
  })

  it('precio cero con descuento sigue en cero', () => {
    expect(applyDiscount(0, 30)).toBe(0)
  })

  it('un precio menor a 50 pesos con descuento queda en 0', () => {
    expect(applyDiscount(40, 10)).toBe(0)
  })

  it('el tope de descuento es 90', () => {
    expect(MAX_DISCOUNT_PERCENT).toBe(90)
  })
})

describe('endOfDayBogota', () => {
  it('arma el fin del día con la zona -05:00', () => {
    expect(endOfDayBogota('2026-11-15')).toBe('2026-11-15T23:59:59-05:00')
  })

  it('el resultado es una fecha válida', () => {
    expect(Number.isNaN(new Date(endOfDayBogota('2026-02-28')).getTime())).toBe(false)
  })
})

describe('toBogotaDateInput', () => {
  it('convierte un ISO en UTC a la fecha de Colombia', () => {
    // 04:59 UTC del 16 = 23:59 del 15 en Bogotá
    expect(toBogotaDateInput('2026-11-16T04:59:59Z')).toBe('2026-11-15')
  })

  it('ida y vuelta con endOfDayBogota conserva el día', () => {
    const iso = new Date(endOfDayBogota('2026-12-31')).toISOString()
    expect(toBogotaDateInput(iso)).toBe('2026-12-31')
  })
})

describe('formatDiscountEnd', () => {
  const zonaOriginal = process.env.TZ

  afterEach(() => {
    process.env.TZ = zonaOriginal
    vi.resetModules()
  })

  it('en hora de Colombia muestra el día de vencimiento', () => {
    expect(formatDiscountEnd('2026-11-15T23:59:59-05:00')).toBe('15 de noviembre')
  })

  // ERROR REAL (deuda-tecnica.md 2.8): el formateador no fija timeZone, así que en un
  // dispositivo fuera de Colombia (o en el servidor de CI en UTC) un descuento que vence
  // el 15 a las 23:59 de Bogotá se muestra "16 de noviembre". Cuando se corrija con
  // timeZone: 'America/Bogota', esta prueba empezará a pasar: cámbiala a `it`.
  it.fails('en un dispositivo con otra zona horaria debería mostrar el mismo día', async () => {
    process.env.TZ = 'UTC'
    vi.resetModules()
    const { formatDiscountEnd: formatearEnUtc } = await import('./pricing')
    expect(formatearEnUtc('2026-11-15T23:59:59-05:00')).toBe('15 de noviembre')
  })
})
