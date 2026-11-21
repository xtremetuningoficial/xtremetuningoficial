import type { CSSProperties } from 'react'
import { GENERAL_INQUIRY_LINK } from '../../lib/whatsapp'

// Frase que entra palabra por palabra cuando el héroe se abre (escena "abre" del kit).
// Sale del texto ya aprobado del negocio (misión y pie de página), no se inventa.
const FRASE = 'Instalación profesional y un servicio honesto y personalizado.'.split(' ')

interface HeroProps {
  /** Productos activos del catálogo; null mientras carga o si falló la consulta. */
  totalProductos?: number | null
}

export function Hero({ totalProductos = null }: HeroProps) {
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
          className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 pb-8 pt-8 sm:gap-10 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6 lg:py-24"
        >
          <div className="relative z-10 min-w-0">
            <h1 className="text-balance font-display text-[2.75rem] uppercase leading-[0.95] text-white sm:text-5xl lg:text-6xl">
              Seguridad y estilo
              <span className="block text-cyan-400">para tu vehículo</span>
            </h1>

            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/80 sm:mt-5 sm:text-lg">
              Accesorios y electricidad automotriz de excelente calidad, con instalación
              profesional y un servicio honesto y personalizado — para carro y moto.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
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

            {/* Sólo hechos del negocio: el número sale del catálogo real y los medios de pago
                son los del pie de página. Sin dato, no se inventa un número. */}
            <p className="mt-6 max-w-lg font-mono text-xs leading-relaxed text-white/70 sm:mt-8 sm:text-sm" aria-live="polite">
              {totalProductos && totalProductos > 0 && (
                <>
                  <strong className="font-bold text-white">
                    {totalProductos} {totalProductos === 1 ? 'producto' : 'productos'}
                  </strong>
                  {' · '}
                </>
              )}
              instalación en el local · pago con Nequi, Daviplata, Addi y tarjeta
            </p>
          </div>

          {/* En celular y tablet la foto real del local va en una banda completa; desde 1024 px
              ocupa el costado derecho del héroe (bloque de arriba). */}
          <div className="relative lg:hidden">
            <img
              src="/carrusel-1.webp"
              alt="El local de Xtreme Tuning por dentro, con alarmas, radios y accesorios en exhibición"
              width={1000}
              height={591}
              fetchPriority="high"
              decoding="async"
              className="aspect-[16/10] w-full rounded-2xl border border-white/10 object-cover object-[60%_40%]"
            />
            {/* Logo de la marca sobre la foto (pedido de William), con sombra suave para leerse. */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-[radial-gradient(ellipse_at_center,rgba(10,14,23,0.78)_0%,rgba(10,14,23,0.35)_45%,transparent_75%)]">
              <img
                src="/logo.webp"
                alt="Xtreme Tuning — Lujos y Accesorios"
                width={594}
                height={420}
                decoding="async"
                className="h-28 w-auto object-contain drop-shadow-[0_4px_18px_rgba(0,0,0,0.75)] sm:h-36"
              />
            </div>
          </div>

          {/* Desde 1024 px el logo va en el costado derecho, sobre la foto del local. */}
          <div className="relative z-10 hidden items-center justify-center lg:flex">
            <span
              className="absolute h-56 w-80 rounded-full bg-[radial-gradient(ellipse,rgba(10,14,23,0.94)_0%,rgba(10,14,23,0.6)_55%,transparent_82%)]"
              aria-hidden="true"
            />
            <img
              src="/logo.webp"
              alt="Xtreme Tuning — Lujos y Accesorios"
              width={594}
              height={420}
              decoding="async"
              className="relative h-40 w-60 object-contain drop-shadow-[0_4px_18px_rgba(0,0,0,0.75)]"
            />
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
