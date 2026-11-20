import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Category } from '../../types/product'
import { WHATSAPP_NUMBER_DISPLAY, GENERAL_INQUIRY_LINK } from '../../lib/whatsapp'
import { useCart } from '../../context/CartContext'
import { Tooltip } from '../ui/Tooltip'
import { CartIcon, QrIcon, WhatsAppIcon } from '../icons'
import { ShareQrModal } from './ShareQrModal'
import { CategoriesMenu } from './CategoriesMenu'

// Los íconos ahora viven en components/icons.tsx; se reexportan aquí para no romper
// las importaciones viejas (carrito, detalle de producto).
export { CartIcon, FacebookIcon, PinIcon, QrIcon, WhatsAppIcon } from '../icons'

const iconButton =
  'flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-cyan-400 hover:text-cyan-400 active:scale-95'

export function Header({ categories }: { categories: Category[] }) {
  const { count } = useCart()
  const [qrOpen, setQrOpen] = useState(false)

  return (
    <>
      <header
        data-barra
        className="sticky top-0 z-50 border-b border-white/10 bg-ink-900/95 backdrop-blur supports-[backdrop-filter]:bg-ink-900/90"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2 sm:gap-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-5">
            <Link to="/" className="flex min-h-11 shrink-0 items-center gap-2" aria-label="Xtreme Tuning, ir al inicio">
              <span className="flex h-11 w-14 items-center justify-center sm:h-12 sm:w-16">
                <img src="/logo.webp" alt="" width={594} height={420} className="h-full w-full object-contain" />
              </span>
              <span className="hidden font-display text-lg tracking-tight text-white sm:block" aria-hidden="true">
                XTREME <span className="text-cyan-400">TUNING</span>
              </span>
            </Link>

            <CategoriesMenu categories={categories} />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="tel:+573118664441"
              className="hidden min-h-11 shrink-0 flex-col justify-center whitespace-nowrap text-right font-mono text-xs text-white/70 transition hover:text-cyan-400 lg:flex"
            >
              <span className="block text-white/60">Línea directa</span>
              {WHATSAPP_NUMBER_DISPLAY}
            </a>
            <Tooltip label="Compartir tienda (QR)">
              <button
                type="button"
                onClick={() => setQrOpen(true)}
                aria-label="Generar código QR para compartir la tienda"
                className={iconButton}
              >
                <QrIcon className="h-5 w-5" />
              </button>
            </Tooltip>
            <Tooltip label="Ver carrito">
              <Link
                to="/carrito"
                aria-label={count > 0 ? `Ver carrito, ${count} ${count === 1 ? 'producto' : 'productos'}` : 'Ver carrito'}
                className={`relative ${iconButton}`}
              >
                <CartIcon className="h-5 w-5" />
                {count > 0 && (
                  <span
                    className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-hazard-400 px-1 text-[11px] font-bold text-ink-900"
                    aria-hidden="true"
                  >
                    {count}
                  </span>
                )}
              </Link>
            </Tooltip>
            <a
              href={GENERAL_INQUIRY_LINK}
              target="_blank"
              rel="noreferrer"
              aria-label="Pedir por WhatsApp"
              className="flex h-11 min-w-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-electric-500 px-3 text-sm font-bold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition hover:bg-electric-400 active:scale-95 sm:px-4"
            >
              <WhatsAppIcon className="h-5 w-5" />
              <span className="hidden min-[380px]:inline sm:hidden" aria-hidden="true">WhatsApp</span>
              <span className="hidden sm:inline" aria-hidden="true">Pedir por WhatsApp</span>
            </a>
          </div>
        </div>
      </header>
      {qrOpen && <ShareQrModal onClose={() => setQrOpen(false)} />}
    </>
  )
}
