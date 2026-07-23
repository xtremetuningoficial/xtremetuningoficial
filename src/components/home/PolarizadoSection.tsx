import { polarizadoTiers } from '../../data/polarizadoTiers'
import { TINT_SERVICE_INQUIRY_LINK } from '../../lib/whatsapp'
import { MutedVideoCard } from '../media/MutedVideoCard'

export function PolarizadoSection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-ember-500">
              Polarizado a tu medida
            </span>
            <h2 className="mt-3 font-display text-2xl uppercase text-ink-900 sm:text-3xl">
              Elige el nivel de polarizado ideal para tu vehículo
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-900/60 sm:text-base">
              Desde una opción práctica y elegante hasta la máxima protección contra el calor y
              los rayos UV. El precio varía según cada vehículo — cotízalo sin compromiso.
            </p>
          </div>

          <a
            href={TINT_SERVICE_INQUIRY_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-electric-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-electric-400"
          >
            Cotiza tu polarizado
          </a>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {polarizadoTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 ${
                  tier.featured ? 'border-electric-500 shadow-lg shadow-electric-500/10' : 'border-ink-900/10'
                }`}
              >
                {tier.featured && (
                  <span className="absolute right-0 top-0 rounded-bl-xl bg-hazard-400 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-900">
                    Recomendado
                  </span>
                )}
                <span className="text-xs font-bold uppercase tracking-widest text-electric-500">
                  {tier.tag}
                </span>
                <h3 className="mt-2 font-display text-lg uppercase leading-tight text-ink-900">
                  {tier.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-900/60">{tier.description}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-ink-900/10">
              <img
                src="/polarizado-1.webp"
                alt="Rollos de lámina de polarizado disponibles en el local"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <MutedVideoCard
              src="/polarizado-video.mp4"
              className="aspect-[4/3] rounded-2xl border border-ink-900/10"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
