export interface PolarizadoTier {
  name: string
  description: string
  featured?: boolean
}

// El precio varía mucho según el vehículo, así que estas tarjetas son solo
// informativas — la cotización siempre va por WhatsApp.
export const polarizadoTiers: PolarizadoTier[] = [
  {
    name: 'Polarizado Standard',
    description:
      'Excelente relación calidad-precio, ideal para mayor privacidad y una apariencia elegante.',
  },
  {
    name: 'Polarizado Nano Carbón',
    description:
      'Reduce el calor, bloquea rayos UV y ofrece mayor durabilidad sin afectar la señal electrónica.',
  },
  {
    name: 'Polarizado Cerámico',
    description:
      'Tecnología de alto rendimiento con máxima reducción de calor, excelente visibilidad y protección UV.',
  },
  {
    name: 'Polarizado Cerámico HD',
    description:
      'Máxima claridad, rechazo superior del calor, protección UV de alto nivel y un acabado premium.',
    featured: true,
  },
]
