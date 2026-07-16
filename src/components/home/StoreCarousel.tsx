import { useEffect, useRef, useState, type TouchEvent } from 'react'
import type { StoreImage } from '../../data/storeImages'

const AUTOPLAY_MS = 4500

export function StoreCarousel({ images }: { images: StoreImage[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || images.length <= 1) return
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % images.length)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [paused, images.length])

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

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative h-64 w-full sm:h-96">
        {images.map((image, i) => (
          <img
            key={image.src + i}
            src={image.src}
            alt={image.alt}
            loading={i === 0 ? 'eager' : 'lazy'}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Foto anterior"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ink-900/60 text-white backdrop-blur transition hover:bg-ink-900/80"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Foto siguiente"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ink-900/60 text-white backdrop-blur transition hover:bg-ink-900/80"
          >
            ›
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {images.map((image, i) => (
              <button
                key={image.src + i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir a la foto ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === index ? 'w-6 bg-hazard-400' : 'w-2 bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
