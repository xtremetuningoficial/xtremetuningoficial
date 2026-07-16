import { Link } from 'react-router-dom'
import type { Category } from '../../types/product'
import { GENERAL_INQUIRY_LINK, WHATSAPP_NUMBER_DISPLAY } from '../../lib/whatsapp'
import { FACEBOOK_URL, STORE_ADDRESS } from '../../lib/contact'
import { FacebookIcon, PinIcon, WhatsAppIcon } from './Header'

export function Footer({ categories }: { categories: Category[] }) {
  return (
    <footer className="bg-ink-900 text-white/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <span className="mb-4 inline-flex h-14 w-20 items-center justify-center">
            <img src="/logo.webp" alt="Xtreme Tuning" className="h-full w-full object-contain" />
          </span>
          <p className="max-w-xs text-sm leading-relaxed">
            Soluciones integrales en accesorios y electricidad automotriz: productos de
            calidad, instalación profesional y un servicio honesto y personalizado.
          </p>

          <div className="mt-5 flex items-center gap-3">
            <a
              href={GENERAL_INQUIRY_LINK}
              target="_blank"
              rel="noreferrer"
              aria-label="Escríbenos por WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[#1fbe5c] transition hover:border-[#1fbe5c]"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Síguenos en Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[#1877f2] transition hover:border-[#1877f2]"
            >
              <FacebookIcon className="h-4 w-4" />
            </a>
          </div>
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
              <FacebookIcon className="h-4 w-4 text-[#1877f2]" />
              <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="transition hover:text-cyan-400">
                Xtreme Tuning en Facebook
              </a>
            </li>
            <li className="flex items-start gap-2">
              <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-hazard-400" />
              <span>{STORE_ADDRESS}</span>
            </li>
          </ul>
          <h3 className="mt-6 font-display text-sm tracking-wide text-hazard-400">
            MEDIOS DE PAGO
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {['Nequi', 'Daviplata', 'Addi', 'Mastercard', 'Visa'].map((method) => (
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
