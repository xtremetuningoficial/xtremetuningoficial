# Despliegue en Vercel (sin GitHub)

Decidiste desplegar directo desde tu computador con la CLI de Vercel, sin conectar
un repositorio de GitHub. Estos son los pasos exactos, uno de ellos (`vercel login`)
es interactivo y solo lo puedes correr tú.

## 1. Instalar la CLI y autenticarte

```
npm install -g vercel
vercel login
```

`vercel login` abre el navegador para que inicies sesión con tu cuenta (email,
GitHub, GitLab, lo que prefieras). Esto autentica tu cuenta de Vercel — no tiene
relación con tener o no un repo en GitHub.

## 2. Primer despliegue

Desde la raíz del proyecto (`c:\proyectos\xtreme_tuning`):

```
vercel
```

Te va a preguntar (respuestas recomendadas entre paréntesis):

- Set up and deploy? (**Y**)
- Which scope? (tu cuenta)
- Link to existing project? (**N**)
- Project name? (ej. `xtreme-tuning` — esto define tu URL: `xtreme-tuning.vercel.app`)
- Directory? (**./**, valor por defecto)
- Override settings? (**N** — Vercel detecta Vite solo: build `npm run build`, salida `dist`)

Con eso queda un despliegue de prueba (preview), pero **todavía sin las variables de
entorno de Supabase**, así que el sitio se vería sin catálogo. Sigue al paso 3 antes
de dar el despliegue por bueno.

## 3. Variables de entorno

```
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
```

Pega los mismos valores que tienes en tu `.env` local cuando te los pida. Repite con
`preview` y `development` en vez de `production` si quieres que también funcionen esos
entornos (opcional).

⚠️ **Nunca** agregues `SUPABASE_SERVICE_ROLE_KEY` a Vercel — esa key solo se usa desde
tu máquina para los scripts (`npm run db:seed`, `npm run admin:create`), nunca debe
llegar al navegador ni a un entorno de hosting.

## 4. Desplegar a producción

```
vercel --prod
```

Esto te da la URL final (algo como `https://xtreme-tuning.vercel.app`).

## 5. Regenerar el sitemap con el dominio real

El `sitemap.xml`/`robots.txt` que están en el repo ahora mismo usan un dominio de
ejemplo. Con tu URL real:

```
npm run seo:sitemap -- https://xtreme-tuning.vercel.app
vercel --prod
```

(el segundo comando vuelve a desplegar para publicar el sitemap actualizado)

## 6. Verificar que quedó bien

- Abre la URL: navega por categorías, agrega productos al carrito, prueba el botón
  de WhatsApp del checkout.
- Entra a `/admin` y confirma que el login funciona con el correo/contraseña que ya
  configuramos.
- Comparte el link de la home en un chat de WhatsApp contigo mismo para revisar que
  la vista previa (imagen, título, descripción) se vea bien.
- (Opcional) Corre Lighthouse desde Chrome DevTools contra la URL real — debería salir
  mejor que las pruebas locales, porque Vercel sirve con compresión Brotli, HTTP/2 y
  CDN — cosas que el `vite preview` local no tiene.

## Cuando tengas un dominio propio

1. Dashboard de Vercel → tu proyecto → **Settings → Domains** → agrega tu dominio.
2. Sigue las instrucciones de Vercel para apuntar los DNS (normalmente un registro
   `CNAME` o `A`) en el proveedor donde compraste el dominio.
3. Repite el paso 5 (regenerar sitemap) con el dominio final.

## Actualizar el sitio después de este primer despliegue

Como no hay GitHub conectado, cada vez que quieras publicar cambios nuevos:

```
vercel --prod
```

corrido de nuevo desde la carpeta del proyecto sube el estado actual del código.
