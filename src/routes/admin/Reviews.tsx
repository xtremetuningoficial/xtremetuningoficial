import { useState } from 'react'
import { approveReview, deleteReview, fetchAdminReviews } from '../../lib/api/reviews'
import { getErrorMessage } from '../../lib/errors'
import { formatDateTime } from '../../lib/format'
import { summarizeRatings } from '../../lib/ratings'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAdminFeedback } from '../../components/admin/AdminFeedback'
import { EmptyState, ErrorState, SkeletonList } from '../../components/admin/LoadStates'
import { StatTile } from '../../components/admin/StatTile'
import { buttonPrimary, card, iconButtonDanger } from '../../components/admin/ui'
import { StarRating } from '../../components/reviews/StarRating'
import { Tooltip } from '../../components/ui/Tooltip'
import { CheckIcon, PackageIcon, StarIcon, TrashIcon } from '../../components/icons'
import type { AdminReview } from '../../types/review'

type Filter = 'pending' | 'approved' | 'all'

const EMPTY_TEXT: Record<Filter, { title: string; description: string }> = {
  pending: {
    title: 'No hay reseñas por revisar.',
    description: 'Cuando un visitante califique la tienda o un producto, aparece aquí para que la apruebes.',
  },
  approved: {
    title: 'Todavía no has aprobado reseñas.',
    description: 'Las que apruebes se publican en la tienda y suman al promedio.',
  },
  all: {
    title: 'Todavía no hay reseñas.',
    description: 'Comparte el enlace de la tienda con tus clientes para que dejen su calificación.',
  },
}

export default function AdminReviews() {
  useDocumentTitle('Reseñas')
  const { confirm, notify } = useAdminFeedback()
  const load = useAsync(fetchAdminReviews, [])
  const reviews = load.data ?? []
  const [filter, setFilter] = useState<Filter>('pending')
  const [busyId, setBusyId] = useState<string | null>(null)

  async function handleApprove(review: AdminReview) {
    setBusyId(review.id)
    try {
      await approveReview(review.id)
      load.setData((current) => (current ?? []).map((r) => (r.id === review.id ? { ...r, isApproved: true } : r)))
      notify(`Aprobamos la reseña de ${review.authorName}. Ya se ve en la tienda.`)
    } catch (error) {
      notify(`No pudimos aprobar la reseña: ${getErrorMessage(error)}`, 'error')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(review: AdminReview) {
    const accepted = await confirm({
      title: '¿Eliminar esta reseña?',
      message: `La reseña de ${review.authorName} se borra${review.isApproved ? ' de la tienda' : ''} y no se puede recuperar.`,
      confirmLabel: 'Sí, eliminar',
    })
    if (!accepted) return
    setBusyId(review.id)
    try {
      await deleteReview(review.id)
      load.setData((current) => (current ?? []).filter((r) => r.id !== review.id))
      notify('Eliminamos la reseña.')
    } catch (error) {
      notify(`No pudimos eliminar la reseña: ${getErrorMessage(error)}`, 'error')
    } finally {
      setBusyId(null)
    }
  }

  const pendingCount = reviews.filter((r) => !r.isApproved).length
  const approvedCount = reviews.length - pendingCount
  const { average } = summarizeRatings(reviews.filter((r) => r.isApproved).map((r) => r.rating))

  const filtered = reviews.filter((r) => {
    if (filter === 'pending') return !r.isApproved
    if (filter === 'approved') return r.isApproved
    return true
  })

  const filters: [Filter, string][] = [
    ['pending', `Pendientes${pendingCount > 0 ? ` (${pendingCount})` : ''}`],
    ['approved', 'Aprobadas'],
    ['all', 'Todas'],
  ]

  return (
    <div>
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl uppercase text-white sm:text-3xl">Reseñas</h1>
        <p className="text-sm text-white/60">
          Aprueba o elimina las calificaciones que dejan tus visitantes sobre la tienda y los productos.
        </p>
      </div>

      {load.status === 'success' && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatTile label="Total reseñas" value={String(reviews.length)} icon={PackageIcon} accent="white" />
          <StatTile
            label="Pendientes"
            value={String(pendingCount)}
            icon={CheckIcon}
            accent={pendingCount > 0 ? 'hazard' : 'white'}
          />
          <StatTile label="Aprobadas" value={String(approvedCount)} icon={CheckIcon} accent="electric" />
          <StatTile
            label="Promedio aprobado"
            value={average > 0 ? average.toFixed(1) : '—'}
            icon={StarIcon}
            accent="ember"
          />
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filtrar reseñas">
        {filters.map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className={`inline-flex min-h-11 items-center rounded-full px-4 text-xs font-bold uppercase tracking-wide transition ${
              filter === value
                ? 'bg-electric-500 text-white'
                : 'border border-white/20 text-white/70 hover:border-white/35 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {load.status === 'loading' && <SkeletonList rows={3} rowClassName="h-28" />}

      {load.status === 'error' && (
        <ErrorState title="No pudimos cargar las reseñas." detail={load.error} onRetry={load.reload} />
      )}

      {load.status === 'success' && filtered.length === 0 && (
        <EmptyState title={EMPTY_TEXT[filter].title} description={EMPTY_TEXT[filter].description} />
      )}

      {load.status === 'success' && filtered.length > 0 && (
        <ul className="mt-6 space-y-3">
          {filtered.map((review) => {
            const busy = busyId === review.id
            return (
              <li key={review.id} className={`${card} p-4 sm:p-5`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StarRating value={review.rating} size="sm" />
                      <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-white/75">
                        {review.targetType === 'site' ? 'Tienda y servicio' : (review.productName ?? 'Producto')}
                      </span>
                      {!review.isApproved && (
                        <span className="rounded-full bg-hazard-400/15 px-2.5 py-0.5 text-xs font-bold uppercase text-hazard-400">
                          Pendiente
                        </span>
                      )}
                    </div>
                    {review.comment ? (
                      <p className="mt-2.5 max-w-2xl break-words text-sm leading-relaxed text-white/85">
                        {review.comment}
                      </p>
                    ) : (
                      <p className="mt-2.5 text-sm italic text-white/55">Sin comentario, solo calificación.</p>
                    )}
                    <p className="mt-2.5 text-xs text-white/60">
                      <span className="font-semibold text-white/80">{review.authorName}</span> ·{' '}
                      {formatDateTime(review.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {!review.isApproved && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleApprove(review)}
                        className={`${buttonPrimary} flex-1 sm:flex-none`}
                      >
                        <CheckIcon className="h-4 w-4" />
                        {busy ? 'Aprobando…' : 'Aprobar y publicar'}
                      </button>
                    )}
                    <Tooltip label="Eliminar reseña" align="end">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleDelete(review)}
                        aria-label={`Eliminar la reseña de ${review.authorName}`}
                        className={iconButtonDanger}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
