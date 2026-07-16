import { PinIcon } from '../layout/Header'
import { STORE_ADDRESS } from '../../lib/contact'
import { storeImages } from '../../data/storeImages'
import { StoreCarousel } from './StoreCarousel'

export function VisitStore() {
  return (
    <section className="bg-ink-900 pb-16 sm:pb-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-hazard-400 px-4 py-1.5 font-display text-sm uppercase text-ink-900 shadow-lg sm:text-base">
          Visítanos en tienda
        </span>

        <div className="mt-8 text-left">
          <StoreCarousel images={storeImages} />
        </div>

        <p className="mt-5 flex items-center justify-center gap-2 text-sm text-white/60 sm:text-base">
          <PinIcon className="h-4 w-4 shrink-0 text-hazard-400" />
          {STORE_ADDRESS}
        </p>
      </div>
    </section>
  )
}
