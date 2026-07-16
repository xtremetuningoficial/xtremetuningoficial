import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export function ShareQrModal({ onClose }: { onClose: () => void }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : ''

  useEffect(() => {
    QRCode.toDataURL(siteUrl, {
      width: 320,
      margin: 1,
      color: { dark: '#0a0e17', light: '#ffffff' },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null))
  }, [siteUrl])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleDownload() {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = 'xtreme-tuning-qr.png'
    link.click()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-900/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Código QR para compartir la tienda"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-ink-900/10 bg-white p-6 text-center shadow-2xl"
      >
        <h2 className="font-display text-lg uppercase text-ink-900">Comparte la tienda</h2>
        <p className="mt-1 text-sm text-ink-900/60">
          Escanea este código para abrir la tienda en tu celular
        </p>

        <div className="mt-5 flex items-center justify-center">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Código QR de Xtreme Tuning" className="h-56 w-56" />
          ) : (
            <div className="h-56 w-56 animate-pulse rounded-lg bg-paper-100" />
          )}
        </div>

        <p className="mt-3 break-all font-mono text-xs text-ink-900/50">{siteUrl}</p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-ink-900/15 py-2.5 text-sm font-bold text-ink-900/70 transition hover:border-ink-900/30"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!qrDataUrl}
            className="flex-1 rounded-full bg-electric-500 py-2.5 text-sm font-bold text-white transition hover:bg-electric-400 disabled:opacity-60"
          >
            Descargar
          </button>
        </div>
      </div>
    </div>
  )
}
