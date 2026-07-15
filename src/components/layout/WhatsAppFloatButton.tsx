import { GENERAL_INQUIRY_LINK } from '../../lib/whatsapp'
import { WhatsAppIcon } from './Header'

export function WhatsAppFloatButton() {
  return (
    <a
      href={GENERAL_INQUIRY_LINK}
      target="_blank"
      rel="noreferrer"
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#1fbe5c] py-3 pl-3 pr-4 text-white shadow-lg shadow-black/30 transition hover:pr-5 sm:bottom-6 sm:right-6"
      aria-label="Escríbenos por WhatsApp"
    >
      <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
        <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-white/70" />
        <WhatsAppIcon className="relative h-6 w-6" />
      </span>
      <span className="hidden text-sm font-bold sm:inline">Escríbenos</span>
    </a>
  )
}
