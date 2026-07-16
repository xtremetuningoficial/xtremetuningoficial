# Sistema de diseño

## Punto de partida

Dos referencias reales de marca, no un estilo genérico de e-commerce:

- **Logo**: silueta de auto deportivo en trazo azul eléctrico → cian, sobre blanco,
  con una rueda tipo llanta de aleación y una estrella — estética "tuning"/racing.
- **Aviso físico del local**: fondo amarillo tipo señalización industrial, texto en
  azul y naranja con contorno blanco, muy alto contraste, letras grandes en bloque.
  Franja inferior con WhatsApp, Nequi, Daviplata, Visa/Mastercard — confianza y medios
  de pago a la vista.

El sitio no debía convertirse en "e-commerce genérico con logo pegado", ni copiar el
amarillo del aviso como fondo de toda la página (ilegible a gran escala, cansa la
vista en un catálogo largo). La dirección elegida: **extraer** el ADN de ambas piezas
— azul eléctrico/cian del logo, amarillo de señalización + naranja del aviso — y
usarlos con disciplina, no reproducirlos literalmente.

## Paleta (tokens)

| Token | Hex | Uso |
|---|---|---|
| `ink-900` | `#0A0E17` | Fondo de header, hero, franja de misión y footer. Texto sobre superficies claras. |
| `electric-500` | `#145EFF` | Color primario de marca (del logo). CTAs principales, links, focus. |
| `cyan-400` | `#22D3EE` | Acento secundario (del logo). Glows, hovers, detalles sobre fondo oscuro. |
| `hazard-400` | `#FFC400` | Firma visual (del aviso físico). Franjas tipo cinta de peligro, badges de "instalación incluida", detalles de alta atención — usado con moderación, nunca como fondo grande. |
| `ember-500` | `#AB3D0F` | Acento terciario (del aviso físico, oscurecido en Fase 7 para pasar contraste WCAG AA — el naranja vivo original `#FF6A1A` medía 2.6:1 sobre fondos claros, muy por debajo del 4.5:1 requerido). Precio de instalación, etiquetas de oferta. |
| `paper-50` | `#F5F7FA` | Fondo del catálogo y zonas de lectura larga (no blanco puro: reduce fatiga visual). |

Neutrales derivados de `ink-900` (tintas al 10/20/40/70%) para bordes, texto
secundario y superficies de tarjeta — no se listan como tokens de marca aparte.

**Regla de uso:** máximo dos acentos de color por componente. El azul eléctrico es
el color "hazlo" (CTA, acción); el amarillo es el color "atención" (seguridad,
badges); el naranja queda reservado casi exclusivamente al precio de instalación,
para que ese dato se reconozca de un vistazo en todo el catálogo.

## Tipografía

| Rol | Fuente | Por qué |
|---|---|---|
| Display (titulares) | **Anton** | Condensada, extra bold, con la energía de la rotulación de talleres y avisos automotrices — sin caer en el estilo cómic con contorno del aviso físico, que no escala bien a interfaz digital. |
| Cuerpo | **Inter** | Alta legibilidad, soporta bien tildes/eñes, funciona igual de bien en párrafos largos que en botones pequeños. Contraste deliberado frente al display: la marca grita en los titulares y es clara y calmada en el resto. |
| Datos/precio | **JetBrains Mono** | Monoespaciada, evoca el display digital de un radio o de una alarma de auto. Se usa solo para cifras de precio y códigos de producto — un guiño técnico, no la fuente de todo el sitio. |

Escala tipográfica (base 16px, ratio ~1.25):
`text-xs 12 · text-sm 14 · text-base 16 · text-lg 20 · text-xl 25 · text-2xl 31 · text-3xl 39 · text-4xl 49 · text-5xl 61`

Los titulares Anton se usan siempre en mayúsculas con tracking ligeramente negativo
(look de rótulo), nunca en párrafos.

## Layout

```
┌──────────────────────────────────────────┐
│ HEADER (ink-900, sticky)                  │  logo · nav · buscador · WhatsApp · carrito
├──────────────────────────────────────────┤
│ HERO (ink-900)                            │  silueta del auto + "pulso de seguridad"
│   Titular Anton + subtítulo (misión)      │  animado, doble CTA (Ver catálogo / WhatsApp)
├──────────────────────────────────────────┤
│ FRANJA DE CONFIANZA                       │  WhatsApp · Nequi · Daviplata · Visa/Mastercard
├──────────────────────────────────────────┤
│ CATEGORÍAS (paper-50)                     │  4 tarjetas: alarmas carro/moto, bloqueo, radios
├──────────────────────────────────────────┤
│ CATÁLOGO / GRID DE PRODUCTOS (paper-50)   │  1 col móvil → 2 tablet → 3–4 escritorio
├──────────────────────────────────────────┤
│ FRANJA DE MISIÓN (ink-900)                │  texto de misión en grande, patrón sutil tipo circuito
├──────────────────────────────────────────┤
│ FOOTER (ink-900)                          │  contacto, medios de pago, categorías, horario
└──────────────────────────────────────────┘
```

Entre secciones oscuras y claras se usa una **franja de cinta de peligro** (rayas
diagonales amarillo/ink, delgada, 8–10px) como divisor — referencia directa a la
cinta de seguridad de taller, coherente con el negocio de alarmas y no un `<hr>`
genérico.

## Elemento de firma: el "pulso de seguridad"

El negocio vive de la seguridad vehicular (alarmas anti-scan, anti-hijack, bloqueo
central). El elemento distintivo del sitio es un **anillo de pulso tipo radar**
alrededor de la silueta del auto en el hero: un círculo cian que se expande y se
desvanece en loop lento (2.5s), como el barrido de un sistema de alarma armado.

- Se usa **una sola vez** de forma protagónica en el hero.
- Se repite en miniatura como un punto pulsante junto al botón flotante de WhatsApp
  ("en línea, respuesta rápida") — mismo lenguaje visual, escala mínima, refuerza sin
  saturar.
- Respeta `prefers-reduced-motion`: si el usuario lo tiene activado, el anillo se
  muestra estático en vez de animado.

## Componentes con reglas propias

- **ProductCard**: precio del producto en `electric-500`/`ink-900` bold (JetBrains
  Mono), precio de instalación en una etiqueta pequeña `ember-500` con el ícono de
  llave inglesa — el patrón "precio + instalación aparte" es real en todo el
  catálogo, así que se trata como dato estructural, no decorativo.
- **Badge de categoría (carro/moto/universal)**: ícono + texto, nunca solo color, para
  que sea legible también para usuarios con daltonismo.
- **Botón WhatsApp**: siempre el mismo verbo ("Pedir por WhatsApp"), mismo ícono,
  mismo color en todo el sitio — coherencia de vocabulario de interfaz.

## Accesibilidad y calidad mínima

- Contraste AA mínimo en todo texto sobre `ink-900` y `paper-50`.
- **Texto "apagado" (secundario/caption):** mínimo `ink-900/60` sobre fondos claros y
  `white/50` sobre fondos oscuros — opacidades menores (`/40`, `/50` sobre claro) no
  pasan 4.5:1 con los tamaños de letra pequeños que usa el sitio (detectado y
  corregido en la auditoría Lighthouse de la Fase 7). Excepciones válidas: placeholders
  de input, texto de campos deshabilitados, e íconos puramente decorativos.
- Foco de teclado visible (anillo `cyan-400` de 2px) en todos los elementos
  interactivos.
- Animaciones del pulso de seguridad respetan `prefers-reduced-motion`.
- Diseño responsive probado desde 360px de ancho (gama baja de Android, tráfico
  esperado mayoritario) hasta escritorio.
