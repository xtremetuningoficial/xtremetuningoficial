import { defineConfig } from 'vitest/config'

// Configuración aparte de vite.config.ts: las pruebas unitarias son de lógica pura
// y no necesitan los plugins de React ni de Tailwind.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    // Hora de Colombia por defecto, como el taller y sus clientes. Las pruebas que
    // necesitan otra zona la cambian ellas mismas.
    env: { TZ: 'America/Bogota' },
  },
})
