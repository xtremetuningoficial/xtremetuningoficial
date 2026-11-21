import { GENERAL_INQUIRY_LINK } from '../../lib/whatsapp'
import { WhatsAppIcon } from '../icons'

export function WhatsAppFloatButton() {
  return (
    <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-50 sm:bottom-6 sm:right-6 lg:hidden">
      <a
          href={GENERAL_INQUIRY_LINK}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-2 rounded-full min-h-12 bg-[#128c4a] py-3 pl-3 pr-3 sm:pr-4 text-white shadow-lg shadow-black/30 transition hover:bg-[#0f7a40] active:scale-95"
          aria-label="Escríbenos por WhatsApp"
        >
          <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
            <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-white/70" />
            <WhatsAppIcon className="relative h-6 w-6" />
          </span>
          <span className="hidden text-sm font-bold sm:inline">Escríbenos</span>
        </a>
    </div>
  )
}
