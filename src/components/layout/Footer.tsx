import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Category } from '../../types/product'
import { GENERAL_INQUIRY_LINK, WHATSAPP_NUMBER_DISPLAY } from '../../lib/whatsapp'
import { FACEBOOK_URL, STORE_ADDRESS } from '../../lib/contact'
import { FacebookIcon, PinIcon, QrIcon, WhatsAppIcon } from '../icons'
import { ShareQrModal } from './ShareQrModal'

export function Footer({ categories, spaceForFloat = false }: { categories: Category[]; spaceForFloat?: boolean }) {
  const [qrOpen, setQrOpen] = useState(false)

  return (
    <footer className="bg-ink-900 text-white/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          {/* Logo de la marca (pedido de William: no se quita) junto al nombre. */}
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex h-14 w-20 items-center justify-center">
              <img
                src="/logo.webp"
                alt="Xtreme Tuning"
                width={594}
                height={420}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain"
              />
            </span>
            <p className="font-display text-2xl leading-none tracking-tight text-white" aria-hidden="true">
              XTREME <span className="text-cyan-400">TUNING</span>
            </p>
          </div>
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
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-[#25d366] transition hover:border-[#25d366]"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Síguenos en Facebook"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-[#4b93f5] transition hover:border-[#4b93f5]"
            >
              <FacebookIcon className="h-5 w-5" />
            </a>
            <button
              type="button"
              onClick={() => setQrOpen(true)}
              className="flex h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-semibold text-white/85 transition hover:border-cyan-400 hover:text-cyan-400"
            >
              <QrIcon className="h-5 w-5" />
              Compartir con QR
            </button>
          </div>
        </div>

        <div>
          <h2 className="font-display text-sm tracking-wide text-hazard-400">CATEGORÍAS</h2>
          <ul className="mt-3 text-sm">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  to={`/categoria/${category.slug}`}
                  className="flex min-h-11 items-center py-1 transition hover:text-cyan-400"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm tracking-wide text-hazard-400">CONTACTO</h2>
          <ul className="mt-3 text-sm">
            <li className="flex items-center gap-2">
              <WhatsAppIcon className="h-5 w-5 shrink-0 text-[#25d366]" />
              <a
                href={GENERAL_INQUIRY_LINK}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-11 items-center font-mono transition hover:text-cyan-400"
              >
                {WHATSAPP_NUMBER_DISPLAY}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <FacebookIcon className="h-5 w-5 shrink-0 text-[#4b93f5]" />
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-11 items-center transition hover:text-cyan-400"
              >
                Xtreme Tuning en Facebook
              </a>
            </li>
            <li className="flex items-start gap-2 py-2.5">
              <PinIcon className="mt-0.5 h-5 w-5 shrink-0 text-hazard-400" />
              <span>{STORE_ADDRESS}</span>
            </li>
          </ul>
          <h2 className="mt-6 font-display text-sm tracking-wide text-hazard-400">
            MEDIOS DE PAGO
          </h2>
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

      {/* En celular deja espacio para que el botón flotante de WhatsApp no tape el texto. */}
      <div className={`border-t border-white/10 px-4 pt-5 text-center text-xs text-white/60 ${spaceForFloat ? 'pb-24 lg:pb-5' : 'pb-5'}`}>
        © {new Date().getFullYear()} Xtreme Tuning · Lujos y Accesorios. Precios sujetos a
        cambio sin previo aviso.
      </div>
      {qrOpen && <ShareQrModal onClose={() => setQrOpen(false)} />}
    </footer>
  )
}
