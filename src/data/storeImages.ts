export interface StoreImage {
  src: string
  alt: string
}

// Carrusel de "Visítanos en tienda". Para agregar fotos reales del local,
// súbelas a /public y agrega una entrada aquí — no hay límite de cantidad.
// Por ahora usamos la única foto real disponible (local.webp) repetida como
// placeholder en las demás posiciones; reemplázalas cuando tengas más fotos.
export const storeImages: StoreImage[] = [
  { src: '/local.webp', alt: 'Vitrinas de accesorios en el local de Xtreme Tuning' },
  { src: '/local.webp', alt: 'Xtreme Tuning — Lujos y Accesorios' }, // TODO: reemplazar por foto real 2
  { src: '/local.webp', alt: 'Xtreme Tuning — Lujos y Accesorios' }, // TODO: reemplazar por foto real 3
  { src: '/local.webp', alt: 'Xtreme Tuning — Lujos y Accesorios' }, // TODO: reemplazar por foto real 4
]
