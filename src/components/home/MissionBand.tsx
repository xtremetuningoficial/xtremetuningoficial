import { ChevronDownIcon } from '../icons'

// Misión y visión del negocio, con su texto aprobado. La visión completa es larga: queda a un
// toque ("Leer la visión completa") para no alargar la página, sin quitar nada.
export function MissionBand() {
  return (
    <section aria-labelledby="mision-titulo" className="relative overflow-hidden bg-ink-900 py-12 sm:py-20">
      <div className="circuit-bg pointer-events-none absolute inset-0 opacity-[0.1]" aria-hidden="true" />
      <h2 id="mision-titulo" className="sr-only">
        Misión y visión de Xtreme Tuning
      </h2>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14">
        <div>
          <h3 className="font-display text-lg uppercase text-cyan-400 sm:text-xl">Nuestra misión</h3>
          <p className="mt-3 text-balance font-display text-2xl uppercase leading-snug text-white sm:text-3xl">
            Soluciones integrales en accesorios y electricidad automotriz, con instalación
            profesional y un servicio honesto y personalizado.
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            Trabajamos para que cada cliente encuentre todo lo que necesita para mejorar la
            seguridad, el confort y el estilo de su vehículo, garantizando confianza,
            innovación y satisfacción en cada compra.
          </p>
        </div>

        <div>
          <h3 className="font-display text-lg uppercase text-hazard-400 sm:text-xl">Nuestra visión</h3>
          <p className="mt-3 text-balance font-display text-2xl uppercase leading-snug text-white sm:text-3xl">
            Ser el negocio líder en accesorios y tecnología automotriz del país.
          </p>
          <details className="group mt-4 max-w-xl">
            <summary className="flex min-h-11 w-max cursor-pointer list-none items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-cyan-400 [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">Leer la visión completa</span>
              <span className="hidden group-open:inline">Ocultar</span>
              <ChevronDownIcon className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-white/70 sm:text-base">
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
          </details>
        </div>
      </div>
    </section>
  )
}
