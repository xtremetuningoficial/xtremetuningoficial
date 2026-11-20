import { useEffect, useRef, useState, type TouchEvent } from 'react'
import type { StoreImage } from '../../data/storeImages'
import { ChevronLeftIcon, ChevronRightIcon } from '../icons'

const AUTOPLAY_MS = 4500

function prefiereQuieto() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function StoreCarousel({ images }: { images: StoreImage[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  // Con "reducir movimiento" no avanza solo: las fotos se pasan con las flechas.
  const [quieto] = useState(prefiereQuieto)

  useEffect(() => {
    if (quieto || paused || images.length <= 1) return
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % images.length)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [quieto, paused, images.length])

  function goTo(next: number) {
    setIndex(((next % images.length) + images.length) % images.length)
  }

  const touchStartX = useRef<number | null>(null)

  function handleTouchStart(event: TouchEvent) {
    setPaused(true)
    touchStartX.current = event.touches[0].clientX
  }

  function handleTouchEnd(event: TouchEvent) {
    if (touchStartX.current !== null) {
      const deltaX = event.changedTouches[0].clientX - touchStartX.current
      if (deltaX > 40) goTo(index - 1)
      else if (deltaX < -40) goTo(index + 1)
    }
    touchStartX.current = null
    setPaused(false)
  }

  const flecha =
    'absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink-900/70 text-white backdrop-blur transition hover:bg-ink-900/90 active:scale-95'

  return (
    <div
      role="region"
      aria-roledescription="carrusel"
      aria-label="Fotos de la tienda"
      className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative aspect-[4/3] w-full sm:aspect-auto sm:h-96">
        {images.map((image, i) => (
          <img
            key={image.src + i}
            src={image.src}
            alt={image.alt}
            aria-hidden={i === index ? undefined : true}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button type="button" onClick={() => goTo(index - 1)} aria-label="Foto anterior" className={`left-3 ${flecha}`}>
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => goTo(index + 1)} aria-label="Foto siguiente" className={`right-3 ${flecha}`}>
            <ChevronRightIcon className="h-5 w-5" />
          </button>

          {/* En celular, contador; desde 640 px, puntos con área de toque de 44 px. */}
          <p
            className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink-900/70 px-3 py-1 font-mono text-xs font-bold text-white backdrop-blur sm:hidden"
            aria-live="polite"
          >
            {index + 1} / {images.length}
          </p>
          <div className="absolute bottom-1 left-1/2 hidden -translate-x-1/2 sm:flex">
            {images.map((image, i) => (
              <button
                key={image.src + i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir a la foto ${i + 1} de ${images.length}`}
                aria-current={i === index ? 'true' : undefined}
                className="group flex h-11 w-11 items-center justify-center"
              >
                <span
                  className={`block h-2 rounded-full transition-all ${
                    i === index ? 'w-6 bg-hazard-400' : 'w-2 bg-white/60 group-hover:bg-white/85'
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
