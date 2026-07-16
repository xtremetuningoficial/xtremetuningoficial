// Crea (o resetea la contraseña de) el usuario administrador del panel /admin.
// Requiere SUPABASE_SERVICE_ROLE_KEY en .env. Uso: npm run admin:create -- correo@ejemplo.com

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'node:crypto'
import WebSocket from 'ws'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.argv[2]

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Faltan VITE_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en tu .env.')
  process.exit(1)
}

if (!email) {
  console.error('Uso: npm run admin:create -- correo@ejemplo.com')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  realtime: { transport: WebSocket as never },
})

function generatePassword(): string {
  return randomBytes(12).toString('base64url')
}

async function main() {
  const password = generatePassword()

  const { data: existing } = await supabase.auth.admin.listUsers()
  const existingUser = existing?.users.find((u) => u.email === email)

  if (existingUser) {
    const { error } = await supabase.auth.admin.updateUserById(existingUser.id, { password })
    if (error) throw error
    console.log(`Contraseña actualizada para ${email}`)
  } else {
    const { error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (error) throw error
    console.log(`Usuario admin creado: ${email}`)
  }

  console.log('\nEntra en /admin/login con:')
  console.log(`  Correo:      ${email}`)
  console.log(`  Contraseña:  ${password}`)
  console.log('\n(Guárdala ahora — no se vuelve a mostrar. Puedes cambiarla luego desde el dashboard de Supabase.)')
}

main().catch((error) => {
  console.error('Error creando el usuario admin:', error.message)
  process.exit(1)
})
