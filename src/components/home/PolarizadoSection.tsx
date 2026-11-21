import { polarizadoTiers } from '../../data/polarizadoTiers'
import { TINT_SERVICE_INQUIRY_LINK } from '../../lib/whatsapp'
import { MutedVideoCard } from '../media/MutedVideoCard'

export function PolarizadoSection() {
  return (
    <section id="polarizado" aria-labelledby="polarizado-titulo" className="bg-white py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <h2 id="polarizado-titulo" className="text-balance font-display text-2xl uppercase text-ink-900 sm:text-3xl">
              Elige el nivel de polarizado ideal para tu vehículo
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-900/70 sm:text-base">
              Desde una opción práctica y elegante hasta la máxima protección contra el calor y
              los rayos UV. El precio varía según cada vehículo — cotízalo sin compromiso.
            </p>
          </div>

          <a
            href={TINT_SERVICE_INQUIRY_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 shrink-0 items-center gap-2 self-start rounded-full bg-electric-500 px-6 text-sm font-bold text-white transition hover:bg-electric-400 active:scale-[0.98] sm:self-auto"
          >
            Cotiza tu polarizado
          </a>
        </div>

        <div className="mt-8 space-y-4 sm:mt-10 sm:space-y-6">
          {/* Escalera de protección: los 4 niveles en una fila (de menor a mayor, como dice el
              texto), cada uno con su medidor. Se encienden en ese orden al bajar (escena "traza"). */}
          <ol
            data-escena="traza"
            className="niveles grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
            aria-label="Niveles de polarizado, de menor a mayor protección"
          >
            {polarizadoTiers.map((tier, i) => (
              <li
                key={tier.name}
                className={`relative flex flex-col overflow-hidden rounded-2xl border-2 p-4 sm:p-5 ${
                  tier.featured
                    ? 'border-electric-500 bg-ink-900 text-white shadow-lg shadow-electric-500/20'
                    : 'border-ink-900/10 bg-white text-ink-900'
                }`}
              >
                <span className="nivel-cinta hazard-stripes absolute inset-x-0 top-0 h-1.5" aria-hidden="true" />
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-mono text-xs font-bold ${tier.featured ? 'text-cyan-400' : 'text-electric-600'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {tier.featured && (
                    <span className="rounded-full bg-hazard-400 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink-900">
                      Recomendado
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-display text-base uppercase leading-tight sm:text-lg">{tier.name}</h3>
                <p className={`mt-2 text-sm leading-relaxed ${tier.featured ? 'text-white/80' : 'text-ink-900/75'}`}>
                  {tier.description}
                </p>
                {/* Medidor: la posición en la escalera, no una cifra inventada. */}
                <div
                  className="mt-auto flex gap-1 pt-4"
                  role="img"
                  aria-label={`Protección: nivel ${i + 1} de ${polarizadoTiers.length}`}
                >
                  {polarizadoTiers.map((_, j) => (
                    <span
                      key={j}
                      className={`h-1.5 flex-1 rounded-full ${
                        j <= i
                          ? tier.featured
                            ? 'bg-cyan-400'
                            : 'bg-electric-500'
                          : tier.featured
                            ? 'bg-white/15'
                            : 'bg-ink-900/10'
                      }`}
                    />
                  ))}
                </div>
              </li>
            ))}
          </ol>

          {/* Foto y video lado a lado en todos los tamaños: formato ancho en escritorio. */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-ink-900/10 sm:aspect-[16/9]">
              <img
                src="/polarizado-1.webp"
                alt="Rollos de lámina de polarizado disponibles en el local"
                loading="lazy"
                decoding="async"
                width={1047}
                height={1180}
                className="h-full w-full object-cover"
              />
            </div>
            <MutedVideoCard
              src="/polarizado-video.mp4"
              poster="/polarizado-video-poster.webp"
              label="Video del servicio de polarizado"
              className="aspect-[4/5] rounded-2xl border border-ink-900/10 sm:aspect-[16/9]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
