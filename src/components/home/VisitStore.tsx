import { PinIcon } from '../icons'
import { STORE_ADDRESS } from '../../lib/contact'
import { storeImages } from '../../data/storeImages'
import { StoreCarousel } from './StoreCarousel'

export function VisitStore() {
  return (
    <section aria-labelledby="tienda-titulo" className="bg-ink-900 pb-16 sm:pb-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2
          id="tienda-titulo"
          className="inline-flex items-center gap-2 rounded-full bg-hazard-400 px-4 py-1.5 font-display text-sm uppercase text-ink-900 shadow-lg sm:text-base"
        >
          Visítanos en tienda
        </h2>

        <div className="mt-8 text-left">
          <StoreCarousel images={storeImages} />
        </div>

        <p className="mt-5 flex items-center justify-center gap-2 text-sm text-white/75 sm:text-base">
          <PinIcon className="h-5 w-5 shrink-0 text-hazard-400" />
          {STORE_ADDRESS}
        </p>
      </div>
    </section>
  )
}
