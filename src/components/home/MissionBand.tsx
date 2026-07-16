export function MissionBand() {
  return (
    <section className="relative overflow-hidden bg-ink-900 py-16 sm:py-20">
      <div className="circuit-bg pointer-events-none absolute inset-0 opacity-[0.1]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:gap-14">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Nuestra misión
          </span>
          <p className="mt-4 font-display text-2xl uppercase leading-snug text-white sm:text-3xl lg:text-4xl">
            Soluciones integrales en accesorios y electricidad automotriz, con instalación
            profesional y un servicio honesto y personalizado.
          </p>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
            Trabajamos para que cada cliente encuentre todo lo que necesita para mejorar la
            seguridad, el confort y el estilo de su vehículo, garantizando confianza,
            innovación y satisfacción en cada compra.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-2 -z-10 rounded-2xl bg-hazard-400/20 blur-2xl" />
          <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40">
            <img
              src="/local.webp"
              alt="Local de Xtreme Tuning — Lujos y Accesorios"
              loading="lazy"
              className="h-64 w-full object-cover sm:h-80"
            />
          </div>
          <span className="absolute -bottom-4 left-4 rounded-lg bg-hazard-400 px-4 py-2 font-display text-sm uppercase text-ink-900 shadow-lg sm:text-base">
            Visítanos en tienda
          </span>
        </div>
      </div>
    </section>
  )
}
