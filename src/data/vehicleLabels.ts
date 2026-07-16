import type { ComponentType } from 'react'
import { CarIcon, MotorcycleIcon, WrenchIcon } from '../components/icons'
import type { VehicleType } from '../types/product'

export const vehicleLabels: Record<VehicleType, { icon: ComponentType<{ className?: string }>; label: string }> = {
  carro: { icon: CarIcon, label: 'Carro' },
  moto: { icon: MotorcycleIcon, label: 'Moto' },
  universal: { icon: WrenchIcon, label: 'Universal' },
}
