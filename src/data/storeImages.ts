export interface StoreImage {
  src: string
  alt: string
}

// Carrusel de "Visítanos en tienda" — fotos reales del local.
// Para agregar más, súbelas a /public (conviértelas a WebP si puedes) y
// agrega una entrada aquí, no hay límite de cantidad.
export const storeImages: StoreImage[] = [
  { src: '/carrusel-7.webp', alt: 'Aviso y entrada del local Xtreme Tuning' },
  { src: '/carrusel-6.webp', alt: 'Fachada del local de Xtreme Tuning desde la calle' },
  { src: '/carrusel-1.webp', alt: 'Vitrina de accesorios de sonido y cuidado automotriz' },
  { src: '/carrusel-2.webp', alt: 'Vitrina de luces LED y faros junto a la entrada del local' },
  { src: '/carrusel-3.webp', alt: 'Estantería con productos de cuidado automotriz y radios de seguridad' },
  { src: '/carrusel-4.webp', alt: 'Vitrina de faros y accesorios cerca de la entrada del local' },
  { src: '/carrusel-5.webp', alt: 'Vitrina de controles y llaves para vehículo' },
  { src: '/carrusel-8.webp', alt: 'Vitrina de radios y pantallas Android para vehículo' },
  { src: '/carrusel-9.webp', alt: 'Vitrina de parlantes, subwoofers y elevavidrios eléctricos' },
  { src: '/carrusel-10.webp', alt: 'Mostrador con alarmas y luces LED, pagos con Nequi y Daviplata' },
  { src: '/carrusel-11.webp', alt: 'Vitrina de amplificadores y subwoofers, crédito Addi disponible' },
]
