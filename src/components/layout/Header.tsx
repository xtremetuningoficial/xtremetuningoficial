import { categories } from '../../data/categories'
import { WHATSAPP_NUMBER_DISPLAY, GENERAL_INQUIRY_LINK } from '../../lib/whatsapp'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-ink-900/95 backdrop-blur supports-[backdrop-filter]:bg-ink-900/90 border-b border-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <a href="#inicio" className="flex shrink-0 items-center gap-2">
          <span className="flex h-11 w-14 items-center justify-center rounded-md bg-white p-1 sm:h-12 sm:w-16">
            <img src="/logo.png" alt="Xtreme Tuning" className="h-full w-full object-contain" />
          </span>
          <span className="hidden font-display text-lg tracking-tight text-white sm:block">
            XTREME <span className="text-cyan-400">TUNING</span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {categories.map((category) => (
            <a
              key={category.slug}
              href="#catalogo"
              className="text-sm font-semibold text-white/80 transition hover:text-cyan-400"
            >
              {category.shortName}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="tel:+573508277999"
            className="hidden text-right text-xs font-mono text-white/60 sm:block"
          >
            <span className="block text-white/40">Línea directa</span>
            {WHATSAPP_NUMBER_DISPLAY}
          </a>
          <a
            href={GENERAL_INQUIRY_LINK}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-electric-500 px-3.5 py-2 text-sm font-bold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition hover:bg-electric-400 sm:px-4"
          >
            <WhatsAppIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Pedir por WhatsApp</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        </div>
      </div>
    </header>
  )
}

export function WhatsAppIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.58-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.148.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.001 2.003c-5.514 0-9.997 4.483-9.997 9.997 0 1.762.463 3.483 1.343 4.997L2 22l5.117-1.318a9.96 9.96 0 0 0 4.884 1.317h.004c5.514 0 9.997-4.483 9.997-9.997 0-2.67-1.04-5.18-2.928-7.07a9.935 9.935 0 0 0-7.073-2.929zm0 18.174h-.003a8.19 8.19 0 0 1-4.175-1.145l-.3-.178-3.037.782.81-2.96-.195-.304a8.156 8.156 0 0 1-1.253-4.372c0-4.516 3.674-8.19 8.156-8.19a8.12 8.12 0 0 1 5.773 2.393 8.113 8.113 0 0 1 2.39 5.8c-.002 4.516-3.676 8.19-8.166 8.19z" />
    </svg>
  )
}
