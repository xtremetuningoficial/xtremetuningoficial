import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
)
