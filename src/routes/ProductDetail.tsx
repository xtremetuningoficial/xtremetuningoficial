import { useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useProduct } from '../hooks/useProduct'
import { useProductReviews } from '../hooks/useProductReviews'
import { formatCOP, formatDateTime } from '../lib/format'
import { buildProductInquiryLink, GENERAL_INQUIRY_LINK } from '../lib/whatsapp'
import { vehicleLabels } from '../data/vehicleLabels'
import { WhatsAppIcon } from '../components/layout/Header'
import { CheckIcon, PlayIcon } from '../components/icons'
import { QuantityStepper } from '../components/cart/QuantityStepper'
import { StarRating } from '../components/reviews/StarRating'
import { ReviewForm } from '../components/reviews/ReviewForm'
import { useCart } from '../context/CartContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import type { Category, ProductMedia } from '../types/product'

export default function ProductDetail() {
  const { slug } = useParams()
  const { status, data: product, error } = useProduct(slug)
  const { reviews, status: reviewsStatus } = useProductReviews(product?.id)
  const categoriesState = useOutletContext<{ data: Category[] }>()
  const { quantityOf, addItem, setQuantity } = useCart()

  useDocumentTitle(product?.name)

  if (status === 'loading') {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-2xl bg-paper-100" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-paper-100" />
            <div className="h-4 w-full animate-pulse rounded bg-paper-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-paper-100" />
            <div className="h-10 w-1/2 animate-pulse rounded bg-paper-100" />
          </div>
        </div>
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <p className="font-display text-xl uppercase text-ink-900">No pudimos cargar este producto</p>
        <p className="mt-2 text-sm text-ink-900/60">{error ?? 'Intenta de nuevo en un momento.'}</p>
        <a
          href={GENERAL_INQUIRY_LINK}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-electric-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-electric-400"
        >
          Escribir por WhatsApp
        </a>
      </section>
    )
  }

  if (status === 'not-found' || !product) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <p className="font-display text-xl uppercase text-ink-900">Producto no encontrado</p>
        <p className="mt-2 text-sm text-ink-900/60">
          Puede que ya no esté disponible. Mira el resto del catálogo.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-electric-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-electric-400"
        >
          Ver catálogo
        </Link>
      </section>
    )
  }

  const gallery = product.media.length > 0 ? product.media : [{ url: product.image, type: 'image' as const }]
  const categoryName =
    categoriesState.data.find((c) => c.slug === product.categorySlug)?.name ?? product.categorySlug

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-ink-900/60 sm:text-sm">
        <Link to="/" className="hover:text-electric-500">
          Inicio
        </Link>
        <span>/</span>
        <Link to={`/categoria/${product.categorySlug}`} className="hover:text-electric-500">
          {categoryName}
        </Link>
        <span>/</span>
        <span className="text-ink-900/70">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <Gallery media={gallery} name={product.name} />

        <div>
          {(() => {
            const VehicleIcon = vehicleLabels[product.vehicleType].icon
            return (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-900/5 px-2.5 py-1 text-xs font-semibold text-ink-900/70">
                <VehicleIcon className="h-3.5 w-3.5" />
                {vehicleLabels[product.vehicleType].label}
              </span>
            )
          })()}

          <h1 className="mt-3 font-display text-2xl uppercase leading-tight text-ink-900 sm:text-3xl">
            {product.name}
          </h1>

          {reviewsStatus === 'success' && reviews.length > 0 && (
            <a href="#resenas" className="mt-2 flex items-center gap-2">
              <StarRating value={reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length} size="sm" />
              <span className="text-sm text-ink-900/60">
                {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)} ·{' '}
                {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
              </span>
            </a>
          )}

          {product.description.length > 0 && (
            <ul className="mt-5 space-y-2 text-sm text-ink-900/70 sm:text-base">
              {product.description.map((line) => (
                <li key={line} className="flex gap-2">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-electric-500" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex flex-wrap items-end gap-4 rounded-2xl border border-ink-900/10 bg-white p-5 font-mono-price">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-900/60">Producto</p>
              <p className="text-2xl font-bold text-ink-900 sm:text-3xl">{formatCOP(product.price)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-ember-500">Instalación</p>
              <p className="text-lg font-bold text-ember-500">{formatCOP(product.installPrice)}</p>
            </div>
          </div>

          {(() => {
            const quantity = quantityOf(product.slug)
            return quantity > 0 ? (
              <div className="mt-6 flex items-center gap-3">
                <QuantityStepper
                  quantity={quantity}
                  onIncrease={() => setQuantity(product.slug, quantity + 1)}
                  onDecrease={() => setQuantity(product.slug, quantity - 1)}
                />
                <Link
                  to="/carrito"
                  className="flex flex-1 items-center justify-center rounded-full bg-ink-900 py-3.5 text-sm font-bold text-white transition hover:bg-ink-800"
                >
                  Ver carrito
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => addItem(product.slug)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-electric-500 py-3.5 text-sm font-bold text-white transition hover:bg-electric-400"
              >
                Agregar al carrito
              </button>
            )
          })()}

          <a
            href={buildProductInquiryLink(product)}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-ink-900/60 transition hover:text-electric-500"
          >
            <WhatsAppIcon className="h-4 w-4" />
            ¿Prefieres preguntar antes? Escríbenos
          </a>

          <Link
            to={`/categoria/${product.categorySlug}`}
            className="mt-4 block text-center text-sm font-semibold text-ink-900/60 transition hover:text-electric-500"
          >
            ← Ver más en esta categoría
          </Link>
        </div>
      </div>

      <div id="resenas" className="mt-14 scroll-mt-20 border-t border-ink-900/10 pt-10 sm:mt-16">
        <h2 className="font-display text-xl uppercase text-ink-900 sm:text-2xl">Reseñas de este producto</h2>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            {reviewsStatus === 'loading' && (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-paper-100" />
                ))}
              </div>
            )}

            {reviewsStatus === 'success' && reviews.length === 0 && (
              <p className="rounded-2xl border border-ink-900/10 bg-white p-6 text-sm text-ink-900/60">
                Este producto todavía no tiene reseñas — ¡sé el primero en calificarlo!
              </p>
            )}

            {reviewsStatus === 'success' && reviews.length > 0 && (
              <ul className="space-y-4">
                {reviews.map((review) => (
                  <li key={review.id} className="rounded-2xl border border-ink-900/10 bg-white p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <StarRating value={review.rating} size="sm" />
                      <span className="font-mono text-xs text-ink-900/40">
                        {formatDateTime(review.createdAt)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-3 text-sm leading-relaxed text-ink-900/70">{review.comment}</p>
                    )}
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-900/50">
                      {review.authorName}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <ReviewForm targetType="product" productId={product.id} title="Califica este producto" />
        </div>
      </div>
    </section>
  )
}

function Gallery({ media, name }: { media: ProductMedia[]; name: string }) {
  const [active, setActive] = useState(0)
  const current = media[active]

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-2xl border border-ink-900/10 bg-paper-100">
        {current.type === 'video' ? (
          <video src={current.url} controls playsInline className="h-full w-full object-cover" />
        ) : (
          <img src={current.url} alt={name} className="h-full w-full object-cover" />
        )}
      </div>

      {media.length > 1 && (
        <div className="mt-3 flex gap-2">
          {media.map((item, index) => (
            <button
              key={item.url}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ver ${item.type === 'video' ? 'video' : 'foto'} ${index + 1} de ${media.length}`}
              className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 transition ${
                index === active ? 'border-electric-500' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              {item.type === 'video' ? (
                <>
                  <video src={item.url} muted playsInline className="h-full w-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-ink-900/25">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-900/70 text-white">
                      <PlayIcon className="h-3 w-3" />
                    </span>
                  </span>
                </>
              ) : (
                <img src={item.url} alt="" className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
