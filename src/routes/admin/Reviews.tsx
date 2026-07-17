import { useEffect, useState } from 'react'
import { approveReview, deleteReview, fetchAdminReviews } from '../../lib/api/reviews'
import { formatDateTime } from '../../lib/format'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { StatTile } from '../../components/admin/StatTile'
import { StarRating } from '../../components/reviews/StarRating'
import { Tooltip } from '../../components/ui/Tooltip'
import { CheckIcon, PackageIcon, StarIcon, TrashIcon } from '../../components/icons'
import type { AdminReview } from '../../types/review'

type Filter = 'pending' | 'approved' | 'all'

export default function AdminReviews() {
  useDocumentTitle('Reseñas')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [filter, setFilter] = useState<Filter>('pending')
  const [busyId, setBusyId] = useState<string | null>(null)

  async function load() {
    setStatus('loading')
    try {
      const data = await fetchAdminReviews()
      setReviews(data)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleApprove(review: AdminReview) {
    setBusyId(review.id)
    try {
      await approveReview(review.id)
      setReviews((current) => current.map((r) => (r.id === review.id ? { ...r, isApproved: true } : r)))
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(review: AdminReview) {
    if (!window.confirm('¿Eliminar esta reseña? Esta acción no se puede deshacer.')) return
    setBusyId(review.id)
    try {
      await deleteReview(review.id)
      setReviews((current) => current.filter((r) => r.id !== review.id))
    } finally {
      setBusyId(null)
    }
  }

  const pendingCount = reviews.filter((r) => !r.isApproved).length
  const approvedCount = reviews.filter((r) => r.isApproved).length
  const approvedRatings = reviews.filter((r) => r.isApproved)
  const average =
    approvedRatings.length > 0
      ? approvedRatings.reduce((sum, r) => sum + r.rating, 0) / approvedRatings.length
      : 0

  const filtered = reviews.filter((r) => {
    if (filter === 'pending') return !r.isApproved
    if (filter === 'approved') return r.isApproved
    return true
  })

  return (
    <div>
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl uppercase text-white sm:text-3xl">Reseñas</h1>
        <p className="text-sm text-white/50">
          Aprueba o elimina las calificaciones que dejan tus visitantes sobre la tienda y los
          productos.
        </p>
      </div>

      {status === 'success' && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatTile label="Total reseñas" value={String(reviews.length)} icon={PackageIcon} accent="white" />
          <StatTile
            label="Pendientes"
            value={String(pendingCount)}
            icon={CheckIcon}
            accent={pendingCount > 0 ? 'hazard' : 'white'}
          />
          <StatTile label="Aprobadas" value={String(approvedCount)} icon={CheckIcon} accent="electric" />
          <StatTile label="Promedio aprobado" value={average > 0 ? average.toFixed(1) : '—'} icon={StarIcon} accent="ember" />
        </div>
      )}

      <div className="mt-8 flex gap-2">
        {(
          [
            ['pending', `Pendientes${pendingCount > 0 ? ` (${pendingCount})` : ''}`],
            ['approved', 'Aprobadas'],
            ['all', 'Todas'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
              filter === value
                ? 'bg-electric-500 text-white'
                : 'border border-white/15 text-white/60 hover:border-white/30 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {status === 'loading' && (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-ink-800" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <p className="mt-6 rounded-xl bg-ember-500/10 px-4 py-6 text-center text-ember-400">
          No pudimos cargar las reseñas. Intenta recargar la página.
        </p>
      )}

      {status === 'success' && (
        <div className="mt-6 space-y-3">
          {filtered.length === 0 && (
            <p className="rounded-2xl border border-white/10 bg-ink-800 px-4 py-10 text-center text-sm text-white/50">
              No hay reseñas en esta categoría.
            </p>
          )}

          {filtered.map((review) => (
            <div key={review.id} className="rounded-2xl border border-white/10 bg-ink-800 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StarRating value={review.rating} size="sm" />
                    <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-white/70">
                      {review.targetType === 'site' ? 'Sitio y servicio' : review.productName ?? 'Producto'}
                    </span>
                    {!review.isApproved && (
                      <span className="rounded-full bg-hazard-400/15 px-2.5 py-0.5 text-xs font-bold uppercase text-hazard-400">
                        Pendiente
                      </span>
                    )}
                  </div>
                  {review.comment && (
                    <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-white/80">{review.comment}</p>
                  )}
                  <p className="mt-2.5 text-xs text-white/50">
                    <span className="font-semibold text-white/70">{review.authorName}</span> ·{' '}
                    {formatDateTime(review.createdAt)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {!review.isApproved && (
                    <Tooltip label="Aprobar y publicar">
                      <button
                        type="button"
                        disabled={busyId === review.id}
                        onClick={() => handleApprove(review)}
                        aria-label="Aprobar reseña"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/5 hover:text-electric-400 disabled:opacity-50"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    </Tooltip>
                  )}
                  <Tooltip label="Eliminar reseña">
                    <button
                      type="button"
                      disabled={busyId === review.id}
                      onClick={() => handleDelete(review)}
                      aria-label="Eliminar reseña"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-ember-500/10 hover:text-ember-400 disabled:opacity-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
