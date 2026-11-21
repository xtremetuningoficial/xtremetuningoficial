import { describe, expect, it } from 'vitest'
import { cardBullets, displayName } from './format'

describe('displayName', () => {
  it('quita emojis y deja el nombre limpio', () => {
    expect(displayName('🔥 Alarma Ultra UT5100 🚗')).toBe('Alarma Ultra UT5100')
    expect(displayName('Cera ✨  premium')).toBe('Cera premium')
  })

  it('no toca un nombre normal', () => {
    expect(displayName('Radio Android 7"')).toBe('Radio Android 7"')
  })
})

describe('cardBullets', () => {
  it('descarta rótulos que terminan en dos puntos y líneas cortas', () => {
    expect(
      cardBullets(['Características:', 'Sí', 'Bloqueo central de 4 puertas', 'Incluye 2 controles remotos', 'Otra más']),
    ).toEqual(['Bloqueo central de 4 puertas', 'Incluye 2 controles remotos'])
  })

  it('respeta el máximo', () => {
    expect(cardBullets(['Primera línea larga', 'Segunda línea larga'], 1)).toEqual(['Primera línea larga'])
  })
})
