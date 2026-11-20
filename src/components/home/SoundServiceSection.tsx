import { useRef } from 'react'
import { soundMedia, type SoundMediaItem } from '../../data/soundMedia'
import { SOUND_SERVICE_INQUIRY_LINK } from '../../lib/whatsapp'
import { ChevronLeftIcon, ChevronRightIcon } from '../icons'
import { MutedVideoCard } from '../media/MutedVideoCard'

export function SoundServiceSection() {
  const scrollerRef = useRef<HTMLDivElement>(null)

  function scrollByCard(direction: 1 | -1) {
    const scroller = scrollerRef.current
    if (!scroller) return
    const card = scroller.querySelector<HTMLElement>('[data-card]')
    const amount = (card?.offsetWidth ?? 300) + 16
    scroller.scrollBy({ left: amount * direction, behavior: 'smooth' })
  }

  return (
    <section
      id="sonido"
      data-escena="riel"
      aria-labelledby="sonido-titulo"
      className="sonido relative overflow-clip bg-ink-900 py-16 sm:py-20"
    >
      <div className="circuit-bg pointer-events-none absolute inset-0 opacity-[0.1]" aria-hidden="true" />

      <div data-fijo className="relative">
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                Sonido a tu medida
              </span>
              <h2
                id="sonido-titulo"
                className="mt-3 text-balance font-display text-2xl uppercase leading-snug text-white sm:text-3xl"
              >
                Adaptamos y vendemos el equipo de sonido ideal para tu vehículo
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
                Diseñamos cajas y pods a la medida, instalamos parlantes, subwoofers e iluminación
                LED, y te asesoramos en la marca y potencia que mejor le queda a tu carro o moto.
              </p>
            </div>

            <a
              href={SOUND_SERVICE_INQUIRY_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 shrink-0 items-center gap-2 self-start rounded-full bg-electric-500 px-6 text-sm font-bold text-white transition hover:bg-electric-400 active:scale-[0.98] sm:self-auto"
            >
              Cotiza tu instalación
            </a>
          </div>

          <div className="relative mt-8">
            <div
              ref={scrollerRef}
              data-pista
              className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
            >
              {soundMedia.map((item, index) => (
                <div key={item.src} data-card className="w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]">
                  {item.type === 'video' ? (
                    <MutedVideoCard
                      src={item.src}
                      className="aspect-[4/5] rounded-2xl border border-white/10"
                    />
                  ) : (
                    <ImageCard item={item} eager={index < 2} />
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              data-mover="-1"
              onClick={() => scrollByCard(-1)}
              aria-label="Ver foto o video anterior"
              className="absolute -left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-ink-900/90 text-white backdrop-blur transition hover:border-cyan-400 hover:text-cyan-400 sm:flex"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              data-mover="1"
              onClick={() => scrollByCard(1)}
              aria-label="Ver siguiente foto o video"
              className="absolute -right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-ink-900/90 text-white backdrop-blur transition hover:border-cyan-400 hover:text-cyan-400 sm:flex"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Avance del riel: sólo aparece cuando la escena está activa. */}
          <span className="riel-linea mt-5 h-0.5 w-full overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            <i data-riel-lleno className="bg-cyan-400" />
          </span>
        </div>
      </div>
    </section>
  )
}

function ImageCard({ item, eager }: { item: Extract<SoundMediaItem, { type: 'image' }>; eager: boolean }) {
  return (
    <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-ink-800">
      <img
        src={item.src}
        alt={item.alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className="h-full w-full object-cover"
      />
    </div>
  )
}

