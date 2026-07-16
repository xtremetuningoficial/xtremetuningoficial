import { useEffect } from 'react'

const SITE_NAME = 'Xtreme Tuning'

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Lujos y Accesorios`
  }, [title])
}
