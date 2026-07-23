import { useEffect, useRef, useState } from 'react'
import { SpeakerIcon, SpeakerMuteIcon } from '../icons'

interface MutedVideoCardProps {
  src: string
  className?: string
}

// Arranca en silencio y solo reproduce cuando entra en el viewport (se
// pausa al salir); un botón de altavoz deja que el usuario le quite el
// mute cuando quiera — nunca suena sin que lo pida.
export function MutedVideoCard({ src, className = '' }: MutedVideoCardProps) {
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
    <div ref={cardRef} className={`group relative overflow-hidden bg-black ${className}`}>
      <video
        ref={videoRef}
        src={src}
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
