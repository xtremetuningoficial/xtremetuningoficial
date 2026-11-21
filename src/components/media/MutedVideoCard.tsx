import { useEffect, useRef, useState } from 'react'
import { SpeakerIcon, SpeakerMuteIcon } from '../icons'

interface MutedVideoCardProps {
  src: string
  /** Fotograma del video: es lo único que se descarga hasta que el video está cerca. */
  poster?: string
  /** Qué muestra el video, para lectores de pantalla. */
  label?: string
  className?: string
}

function prefiereQuieto() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Los videos pesan varios MB: no se pide ni un byte (preload="none", sin src) hasta que la
// tarjeta está a una pantalla de distancia. Arranca en silencio y sólo reproduce mientras se
// ve; con "reducir movimiento" no arranca sola y queda el fotograma con el botón de reproducir
// del navegador. Nunca suena sin que el usuario lo pida.
export function MutedVideoCard({ src, poster, label, className = '' }: MutedVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [muted, setMuted] = useState(true)
  const [near, setNear] = useState(false)
  const [quieto] = useState(prefiereQuieto)

  // 1) Cargar cuando se acerca.
  useEffect(() => {
    const card = cardRef.current
    if (!card || near) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true)
      },
      { rootMargin: '100% 0px' },
    )
    observer.observe(card)
    return () => observer.disconnect()
  }, [near])

  // 2) Reproducir sólo mientras se ve (salvo con movimiento reducido).
  useEffect(() => {
    const card = cardRef.current
    const video = videoRef.current
    if (!card || !video || !near || quieto) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.5 },
    )
    observer.observe(card)
    return () => observer.disconnect()
  }, [near, quieto])

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
    if (!video.muted && video.paused) video.play().catch(() => {})
  }

  return (
    <div ref={cardRef} className={`group relative overflow-hidden bg-ink-800 ${className}`}>
      <video
        ref={videoRef}
        src={near ? src : undefined}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        controls={quieto}
        aria-label={label}
        className="h-full w-full object-cover"
      />

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-ink-900/75 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur">
        Video
      </span>

      {!quieto && (
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? 'Activar el sonido del video' : 'Silenciar el video'}
          className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-ink-900/75 text-white backdrop-blur transition hover:bg-ink-900/90"
        >
          {muted ? <SpeakerMuteIcon className="h-5 w-5" /> : <SpeakerIcon className="h-5 w-5" />}
        </button>
      )}
    </div>
  )
}
