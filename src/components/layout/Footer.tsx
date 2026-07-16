import { Link } from 'react-router-dom'
import type { Category } from '../../types/product'
import { WHATSAPP_NUMBER_ALT_DISPLAY, WHATSAPP_NUMBER_DISPLAY } from '../../lib/whatsapp'
import { WhatsAppIcon } from './Header'

export function Footer({ categories }: { categories: Category[] }) {
  return (
    <footer className="bg-ink-900 text-white/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <span className="mb-4 inline-flex h-14 w-20 items-center justify-center rounded-md bg-white p-1.5">
            <img src="/logo.webp" alt="Xtreme Tuning" className="h-full w-full object-contain" />
          </span>
          <p className="max-w-xs text-sm leading-relaxed">
            Soluciones integrales en accesorios y electricidad automotriz: productos de
            calidad, instalación profesional y un servicio honesto y personalizado.
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm tracking-wide text-hazard-400">CATEGORÍAS</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link to={`/categoria/${category.slug}`} className="transition hover:text-cyan-400">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm tracking-wide text-hazard-400">CONTACTO</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <WhatsAppIcon className="h-4 w-4 text-[#1fbe5c]" />
              <span className="font-mono">{WHATSAPP_NUMBER_DISPLAY}</span>
            </li>
            <li className="flex items-center gap-2">
              <WhatsAppIcon className="h-4 w-4 text-[#1fbe5c]" />
              <span className="font-mono">{WHATSAPP_NUMBER_ALT_DISPLAY}</span>
            </li>
          </ul>
          <h3 className="mt-6 font-display text-sm tracking-wide text-hazard-400">
            MEDIOS DE PAGO
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {['Nequi', 'Daviplata', 'Mastercard', 'Visa'].map((method) => (
              <span
                key={method}
                className="rounded border border-white/15 px-2.5 py-1 text-xs font-semibold text-white/70"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Xtreme Tuning · Lujos y Accesorios. Precios sujetos a
        cambio sin previo aviso.
      </div>
    </footer>
  )
}
