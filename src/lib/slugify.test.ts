import { describe, expect, it } from 'vitest'
import { slugify } from './slugify'

describe('slugify', () => {
  it('pasa a minúsculas y une palabras con guion', () => {
    expect(slugify('Luces LED Para Carro')).toBe('luces-led-para-carro')
  })

  it('quita tildes y diéresis', () => {
    expect(slugify('Polarizado Económico Pingüino')).toBe('polarizado-economico-pinguino')
  })

  it('convierte la ñ en n', () => {
    expect(slugify('Año Nuevo Ñandú')).toBe('ano-nuevo-nandu')
  })

  it('funciona igual con texto ya descompuesto (NFD)', () => {
    expect(slugify('Camíon')).toBe('camion')
  })

  it('cadena vacía da cadena vacía', () => {
    expect(slugify('')).toBe('')
  })

  it('solo espacios o símbolos da cadena vacía', () => {
    expect(slugify('   ')).toBe('')
    expect(slugify('¡¿!?')).toBe('')
  })

  it('quita guiones al inicio y al final', () => {
    expect(slugify('  --Sonido Pro--  ')).toBe('sonido-pro')
  })

  it('colapsa símbolos y espacios seguidos en un solo guion', () => {
    expect(slugify('Kit  12V / 24V & más')).toBe('kit-12v-24v-mas')
  })

  it('conserva los números', () => {
    expect(slugify('Parlante 6x9 400W')).toBe('parlante-6x9-400w')
  })

  it('es idempotente', () => {
    const una = slugify('Exploradoras Halógenas H4')
    expect(slugify(una)).toBe(una)
  })
})
