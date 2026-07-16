export type SoundMediaItem =
  | { type: 'video'; src: string; poster?: string; alt: string }
  | { type: 'image'; src: string; alt: string }

// Vitrina de instalaciones reales de sonido — adaptación, cajas a la medida
// e iluminación. Para agregar más, sube el recurso a /public y agrega una
// entrada aquí, no hay límite de cantidad.
export const soundMedia: SoundMediaItem[] = [
  {
    type: 'video',
    src: '/sonido-video.mp4',
    alt: 'Demostración en video de una instalación de sonido Xtreme Tuning',
  },
  {
    type: 'image',
    src: '/sonido-2.webp',
    alt: 'Baúl con parlantes iluminados y doble subwoofer instalado',
  },
  {
    type: 'image',
    src: '/sonido-6.webp',
    alt: 'Cajas de sonido con luces LED de neón y diseño personalizado',
  },
  {
    type: 'image',
    src: '/sonido-5.webp',
    alt: 'Pod de fibra de vidrio a la medida para la bandeja trasera',
  },
  {
    type: 'image',
    src: '/sonido-9.webp',
    alt: 'Bandeja trasera moldeada a la medida con parlantes iluminados',
  },
  {
    type: 'image',
    src: '/sonido-3.webp',
    alt: 'Caja de sonido personalizada con acrílico y diseño pintado a mano',
  },
  {
    type: 'image',
    src: '/sonido-8.webp',
    alt: 'Adaptación en puerta y caja de parlantes a la medida del vehículo',
  },
  {
    type: 'image',
    src: '/sonido-1.webp',
    alt: 'Módulo de parlantes dobles con tweeters listo para instalar',
  },
  {
    type: 'image',
    src: '/sonido-7.webp',
    alt: 'Pod doble de parlantes en fibra de vidrio, vista de estudio',
  },
  {
    type: 'image',
    src: '/sonido-4.webp',
    alt: 'Vitrina con cajas y subwoofers de distintas marcas disponibles',
  },
]
