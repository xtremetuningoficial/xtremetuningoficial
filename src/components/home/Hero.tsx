import { GENERAL_INQUIRY_LINK } from '../../lib/whatsapp'

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-ink-900">
      <div className="circuit-bg pointer-events-none absolute inset-0 opacity-[0.12]" />
      <div className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-electric-500/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-hazard-400/40 bg-hazard-400/10 px-3 py-1 text-xs font-bold tracking-wide text-hazard-400">
            ALARMAS · RADIOS · BLOQUEO CENTRAL · ELECTRICIDAD AUTOMOTRIZ
          </span>

          <h1 className="mt-5 font-display text-4xl uppercase leading-[0.95] text-white sm:text-5xl lg:text-6xl">
            Seguridad y estilo
            <span className="block text-cyan-400">para tu vehículo</span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
            Accesorios y electricidad automotriz de excelente calidad, con instalación
            profesional y un servicio honesto y personalizado — para carro y moto.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#catalogo"
              className="rounded-full bg-electric-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-electric-500/25 transition hover:bg-electric-400"
            >
              Ver catálogo
            </a>
            <a
              href={GENERAL_INQUIRY_LINK}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:border-cyan-400 hover:text-cyan-400"
            >
              Pedir por WhatsApp
            </a>
          </div>

          <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/10 pt-6 font-mono">
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-white/50">Catálogo</dt>
              <dd className="text-lg font-bold text-white">13+ productos</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-white/50">Instalación</dt>
              <dd className="text-lg font-bold text-white">Profesional</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-white/50">Garantía</dt>
              <dd className="text-lg font-bold text-white">Oficial</dd>
            </div>
          </dl>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="relative flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80">
            <div className="absolute -inset-16 overflow-hidden rounded-full sm:-inset-24" aria-hidden="true">
              <img
                src="/carrusel-1.webp"
                alt=""
                className="h-full w-full scale-110 object-cover object-[60%_35%] opacity-80 grayscale contrast-125"
              />
              <div className="absolute inset-0 bg-electric-500/20 mix-blend-color" />
              <div className="absolute inset-0 bg-ink-900/50 mix-blend-multiply" />
              <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_28%,var(--color-ink-900)_70%)]" />
            </div>

            <span
              className="pulse-ring absolute inset-0 rounded-full border-2 border-cyan-400/50"
              style={{ animationDelay: '0s' }}
            />
            <span
              className="pulse-ring absolute inset-0 rounded-full border-2 border-cyan-400/50"
              style={{ animationDelay: '0.85s' }}
            />
            <span
              className="pulse-ring absolute inset-0 rounded-full border-2 border-cyan-400/50"
              style={{ animationDelay: '1.7s' }}
            />
            <span className="absolute inset-8 rounded-full bg-ink-800 ring-1 ring-white/10" />
            <span className="relative flex h-32 w-48 items-center justify-center sm:h-40 sm:w-60">
              <img
                src="/logo.webp"
                alt="Xtreme Tuning — Lujos y Accesorios"
                className="h-full w-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
              />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
