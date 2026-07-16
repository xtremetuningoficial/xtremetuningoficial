import { WHATSAPP_NUMBER_DISPLAY } from '../../lib/whatsapp'
import { WhatsAppIcon } from '../layout/Header'

const items = [
  { label: 'WhatsApp', value: WHATSAPP_NUMBER_DISPLAY, icon: 'whatsapp' as const },
  { label: 'Pagos', value: 'Nequi · Daviplata · Addi', icon: 'pay' as const },
  { label: 'Tarjetas', value: 'Visa · Mastercard', icon: 'card' as const },
]

export function TrustBar() {
  return (
    <div className="border-b border-ink-900/5 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-4 text-center sm:justify-between sm:px-6">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            {item.icon === 'whatsapp' ? (
              <WhatsAppIcon className="h-4 w-4 text-[#1fbe5c]" />
            ) : item.icon === 'pay' ? (
              <span className="text-base">📲</span>
            ) : (
              <span className="text-base">💳</span>
            )}
            <span className="font-mono text-xs font-semibold text-ink-900/70 sm:text-sm">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
