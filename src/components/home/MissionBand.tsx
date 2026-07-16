export function MissionBand() {
  return (
    <section className="relative overflow-hidden bg-ink-900 py-16 sm:py-20">
      <div className="circuit-bg pointer-events-none absolute inset-0 opacity-[0.1]" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Nuestra misión
          </span>
          <p className="mt-4 font-display text-2xl uppercase leading-snug text-white sm:text-3xl">
            Soluciones integrales en accesorios y electricidad automotriz, con instalación
            profesional y un servicio honesto y personalizado.
          </p>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
            Trabajamos para que cada cliente encuentre todo lo que necesita para mejorar la
            seguridad, el confort y el estilo de su vehículo, garantizando confianza,
            innovación y satisfacción en cada compra.
          </p>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-hazard-400">
            Nuestra visión
          </span>
          <p className="mt-4 font-display text-2xl uppercase leading-snug text-white sm:text-3xl">
            Ser el negocio líder en accesorios y tecnología automotriz del país.
          </p>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
            En Xtreme Tuning aspiramos a consolidarnos como el negocio líder en accesorios y
            tecnología automotriz, siendo reconocidos por ofrecer soluciones completas para
            todo tipo de vehículos. Buscamos brindar a nuestros clientes productos de alta
            calidad y un servicio confiable en polarizados, alarmas, vidrios eléctricos,
            electricidad automotriz, radios, pantallas, parlantes, sonido, iluminación LED,
            elevavidrios, controles, carcasas, escáner automotriz y toda clase de accesorios.
            Nuestro compromiso es innovar constantemente, ampliar nuestro portafolio y
            convertirnos en la primera opción para quienes buscan seguridad, confort,
            tecnología y estilo para su vehículo.
          </p>
        </div>
      </div>
    </section>
  )
}
