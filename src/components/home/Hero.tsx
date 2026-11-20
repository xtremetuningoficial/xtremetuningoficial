import type { CSSProperties } from 'react'
import { GENERAL_INQUIRY_LINK } from '../../lib/whatsapp'

// Frase que entra palabra por palabra cuando el héroe se abre (escena "abre" del kit).
// Sale del texto ya aprobado del negocio (misión y pie de página), no se inventa.
const FRASE = 'Instalación profesional y un servicio honesto y personalizado.'.split(' ')

export function Hero() {
  return (
    <section id="inicio" data-escena="abre" className="heroe relative bg-ink-900">
      <div data-fijo className="heroe-fijo relative overflow-clip">
        <div className="circuit-bg pointer-events-none absolute inset-0 opacity-[0.12]" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-electric-500/20 blur-3xl"
          aria-hidden="true"
        />

        {/* Foto real del local. En desktop cubre el costado derecho y, con el scroll, se abre a
            todo el ancho (clip-path en index.css). */}
        <div className="heroe-foto pointer-events-none absolute inset-0 hidden overflow-hidden lg:block" aria-hidden="true">
          <img
            src="/carrusel-1.webp"
            alt=""
            width={1000}
            height={591}
            fetchPriority="high"
            decoding="async"
            className="heroe-foto-img h-full w-full object-cover object-[65%_40%]"
          />
          <div className="heroe-foto-velo absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-900/50 via-transparent to-ink-900/60" />
        </div>

        <div data-telon className="heroe-telon" aria-hidden="true" />

        <div
          data-sale
          className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6 lg:py-24"
        >
          <div className="relative z-10 min-w-0">
            <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-hazard-400/40 bg-hazard-400/10 px-3 py-1 text-[11px] font-bold tracking-wide text-hazard-400 sm:text-xs">
              ALARMAS · RADIOS · BLOQUEO CENTRAL · ELECTRICIDAD AUTOMOTRIZ
            </p>

            <h1 className="mt-5 text-balance font-display text-4xl uppercase leading-[0.95] text-white sm:text-5xl lg:text-6xl">
              Seguridad y estilo
              <span className="block text-cyan-400">para tu vehículo</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
              Accesorios y electricidad automotriz de excelente calidad, con instalación
              profesional y un servicio honesto y personalizado — para carro y moto.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#catalogo"
                className="inline-flex min-h-12 items-center rounded-full bg-electric-500 px-6 text-sm font-bold text-white shadow-lg shadow-electric-500/25 transition hover:bg-electric-400 active:scale-[0.98]"
              >
                Ver catálogo
              </a>
              <a
                href={GENERAL_INQUIRY_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center rounded-full border border-white/25 px-6 text-sm font-bold text-white transition hover:border-cyan-400 hover:text-cyan-400 active:scale-[0.98]"
              >
                Pedir por WhatsApp
              </a>
            </div>

            <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/10 pt-6 font-mono">
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-white/60">Catálogo</dt>
                <dd className="text-lg font-bold text-white">13+ productos</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-white/60">Instalación</dt>
                <dd className="text-lg font-bold text-white">Profesional</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-white/60">Garantía</dt>
                <dd className="text-lg font-bold text-white">Oficial</dd>
              </div>
            </dl>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80">
              {/* En mobile/tablet no hay panel de fondo, así que la foto envuelve el aro aquí */}
              <div className="absolute -inset-16 overflow-hidden rounded-full sm:-inset-24 lg:hidden" aria-hidden="true">
                <img
                  src="/carrusel-1.webp"
                  alt=""
                  width={1000}
                  height={591}
                  fetchPriority="high"
                  decoding="async"
                  className="h-full w-full scale-110 object-cover object-[60%_35%]"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_28%,var(--color-ink-900)_70%)]" />
              </div>

              <span className="pulse-ring absolute inset-0 rounded-full border-2 border-cyan-400/50" aria-hidden="true" />
              <span
                className="pulse-ring absolute inset-0 rounded-full border-2 border-cyan-400/50"
                style={{ animationDelay: '0.85s' }}
                aria-hidden="true"
              />
              <span
                className="pulse-ring absolute inset-0 rounded-full border-2 border-cyan-400/50"
                style={{ animationDelay: '1.7s' }}
                aria-hidden="true"
              />
              {/* Sombra suave tras el isotipo, para que el resto del aro deje ver la foto a color */}
              <span
                className="absolute left-1/2 top-1/2 h-44 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(10,14,23,0.94)_0%,rgba(10,14,23,0.6)_55%,transparent_82%)] sm:h-56 sm:w-80"
                aria-hidden="true"
              />
              <span className="relative flex h-32 w-48 items-center justify-center sm:h-40 sm:w-60">
                <img
                  src="/logo.webp"
                  alt="Xtreme Tuning — Lujos y Accesorios"
                  width={594}
                  height={420}
                  decoding="async"
                  className="h-full w-full object-contain drop-shadow-[0_4px_18px_rgba(0,0,0,0.75)]"
                />
              </span>
            </div>
          </div>
        </div>

        {/* Duplica un texto que ya está en la página: los lectores de pantalla lo omiten. */}
        <p data-frase aria-hidden="true" className="heroe-frase" style={{ '--n': FRASE.length } as CSSProperties}>
          {FRASE.map((palabra, i) => (
            <span key={i} style={{ '--i': i } as CSSProperties}>
              {palabra}{' '}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
