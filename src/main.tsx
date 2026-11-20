import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import App from './App.tsx'
// Tipografías servidas desde el propio sitio (antes venían de Google Fonts y en Firefox
// con caché vacía salía la letra del sistema). Solo latín: cubre español con tildes y ñ.
import '@fontsource/anton/latin-400.css'
import '@fontsource-variable/inter/wght.css'
import '@fontsource/jetbrains-mono/latin-500.css'
import '@fontsource/jetbrains-mono/latin-700.css'
import './index.css'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
)
