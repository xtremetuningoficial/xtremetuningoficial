import type { ComponentType } from 'react'
import { CarIcon, LockIcon, MotorcycleIcon, RadioIcon } from '../components/icons'

export const categoryIcons: Record<string, ComponentType<{ className?: string }>> = {
  'alarmas-carro': CarIcon,
  'alarmas-moto': MotorcycleIcon,
  'bloqueo-central': LockIcon,
  radios: RadioIcon,
}
