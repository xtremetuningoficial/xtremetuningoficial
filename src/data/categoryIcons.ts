import type { ComponentType } from 'react'
import { CarIcon, LockIcon, MotorcycleIcon, RadioIcon, TagIcon } from '../components/icons'

export const categoryIcons: Record<string, ComponentType<{ className?: string }>> = {
  'alarmas-carro': CarIcon,
  'alarmas-moto': MotorcycleIcon,
  'bloqueo-central': LockIcon,
  radios: RadioIcon,
}

// Categorías creadas desde el panel admin no tienen un ícono propio todavía.
export const DEFAULT_CATEGORY_ICON = TagIcon
