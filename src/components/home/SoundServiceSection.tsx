import { useEffect, useRef, useState } from 'react'
import { soundMedia, type SoundMediaItem } from '../../data/soundMedia'
import { SOUND_SERVICE_INQUIRY_LINK } from '../../lib/whatsapp'
import { ChevronLeftIcon, ChevronRightIcon, SpeakerIcon, SpeakerMuteIcon } from '../icons'

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
    <section className="relative overflow-hidden bg-ink-900 py-16 sm:py-20">
      <div className="circuit-bg pointer-events-none absolute inset-0 opacity-[0.1]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Sonido a tu medida
            </span>
            <h2 className="mt-3 font-display text-2xl uppercase leading-snug text-white sm:text-3xl">
              Adaptamos y vendemos el equipo de sonido ideal para tu vehículo
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">
              Diseñamos cajas y pods a la medida, instalamos parlantes, subwoofers e iluminación
              LED, y te asesoramos en la marca y potencia que mejor le queda a tu carro o moto.
            </p>
          </div>

          <a
            href={SOUND_SERVICE_INQUIRY_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-electric-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-electric-400"
          >
            Cotiza tu instalación
          </a>
        </div>

        <div className="relative mt-8">
          <div
            ref={scrollerRef}
            className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
          >
            {soundMedia.map((item, index) => (
              <div key={item.src} data-card className="w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]">
                {item.type === 'video' ? <VideoCard item={item} /> : <ImageCard item={item} eager={index < 2} />}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            aria-label="Ver recurso anterior"
            className="absolute -left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-ink-900/90 text-white backdrop-blur transition hover:border-cyan-400 hover:text-cyan-400 sm:flex"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-label="Ver siguiente recurso"
            className="absolute -right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-ink-900/90 text-white backdrop-blur transition hover:border-cyan-400 hover:text-cyan-400 sm:flex"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
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
        className="h-full w-full object-cover"
      />
    </div>
  )
}

function VideoCard({ item }: { item: Extract<SoundMediaItem, { type: 'video' }> }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const card = cardRef.current
    const video = videoRef.current
    if (!card || !video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.5 },
    )
    observer.observe(card)
    return () => observer.disconnect()
  }, [])

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  return (
    <div
      ref={cardRef}
      className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-ink-800"
    >
      <video
        ref={videoRef}
        src={item.src}
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
      />

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-ink-900/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white/80 backdrop-blur">
        Video
      </span>

      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? 'Activar el sonido del video' : 'Silenciar el video'}
        className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-ink-900/70 text-white backdrop-blur transition hover:bg-ink-900/90"
      >
        {muted ? <SpeakerMuteIcon className="h-4 w-4" /> : <SpeakerIcon className="h-4 w-4" />}
      </button>
    </div>
  )
}
