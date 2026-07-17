import { useEffect, useState } from 'react'
import { fetchSiteRatingSummary, fetchSiteReviews } from '../../lib/api/reviews'
import { StarRating } from '../reviews/StarRating'
import { ReviewForm } from '../reviews/ReviewForm'
import type { RatingSummary, Review } from '../../types/review'

export function TestimonialsSection() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState<RatingSummary>({ average: 0, count: 0 })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    Promise.all([fetchSiteReviews(), fetchSiteRatingSummary()])
      .then(([reviewsData, summaryData]) => {
        setReviews(reviewsData)
        setSummary(summaryData)
        setStatus('success')
      })
      .catch(() => setStatus('error'))
  }, [])

  return (
    <section className="relative overflow-hidden bg-ink-900 py-16 sm:py-20">
      <div className="circuit-bg pointer-events-none absolute inset-0 opacity-[0.1]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Califícanos</span>
            <h2 className="mt-3 font-display text-2xl uppercase leading-snug text-white sm:text-3xl">
              Lo que opinan de la tienda y el servicio
            </h2>

            {status === 'success' && summary.count > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <StarRating value={summary.average} />
                <span className="font-mono-price text-lg font-bold text-white">
                  {summary.average.toFixed(1)}
                </span>
                <span className="text-sm text-white/50">
                  ({summary.count} {summary.count === 1 ? 'reseña' : 'reseñas'})
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowForm((current) => !current)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-electric-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-electric-400"
          >
            {showForm ? 'Cerrar' : 'Danos tu opinión'}
          </button>
        </div>

        {showForm && (
          <div className="mt-8 max-w-lg">
            <ReviewForm targetType="site" title="Cuéntanos tu experiencia" />
          </div>
        )}

        <div className="mt-8">
          {status === 'loading' && (
            <div className="grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl bg-ink-800" />
              ))}
            </div>
          )}

          {status === 'error' && (
            <p className="rounded-2xl border border-white/10 bg-ink-800 px-6 py-10 text-center text-white/50">
              No pudimos cargar las reseñas en este momento.
            </p>
          )}

          {status === 'success' && reviews.length === 0 && (
            <p className="rounded-2xl border border-white/10 bg-ink-800 px-6 py-10 text-center text-white/60">
              Todavía no hay reseñas — ¡sé el primero en contarnos qué te pareció!
            </p>
          )}

          {status === 'success' && reviews.length > 0 && (
            <div className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="w-[85%] shrink-0 snap-start rounded-2xl border border-white/10 bg-ink-800 p-5 sm:w-[46%] lg:w-[31%]"
                >
                  <StarRating value={review.rating} size="sm" />
                  {review.comment && (
                    <p className="mt-3 text-sm leading-relaxed text-white/70">"{review.comment}"</p>
                  )}
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-white/50">
                    {review.authorName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
