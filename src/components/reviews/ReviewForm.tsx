import { useState, type FormEvent } from 'react'
import { submitReview } from '../../lib/api/reviews'
import { getErrorMessage } from '../../lib/errors'
import { StarRating } from './StarRating'
import type { ReviewTargetType } from '../../types/review'

interface ReviewFormProps {
  targetType: ReviewTargetType
  productId?: string
  title?: string
}

export function ReviewForm({ targetType, productId, title = 'Cuéntanos tu experiencia' }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [authorName, setAuthorName] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (rating < 1) {
      setError('Selecciona una calificación de 1 a 5 estrellas.')
      return
    }
    if (!authorName.trim()) {
      setError('Cuéntanos tu nombre.')
      return
    }

    setSubmitting(true)
    try {
      await submitReview({ targetType, productId, rating, authorName, comment })
      setSubmitted(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-ink-900/10 bg-white p-6 text-center">
        <p className="font-display text-lg uppercase text-ink-900">¡Gracias por tu opinión!</p>
        <p className="mt-2 text-sm text-ink-900/60">
          Tu reseña quedó pendiente de revisión y se publicará en cuanto la aprobemos.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-ink-900/10 bg-white p-6">
      <p className="font-display text-lg uppercase text-ink-900">{title}</p>

      <div className="mt-4">
        <span className="mb-1.5 block text-xs font-semibold text-ink-900/60">Tu calificación</span>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <label className="mt-4 block">
        <span className="mb-1 block text-xs font-semibold text-ink-900/60">Tu nombre</span>
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Escribe tu nombre"
          className="w-full rounded-lg border border-ink-900/15 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-900/40 focus:border-electric-500 focus:outline-none"
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-1 block text-xs font-semibold text-ink-900/60">Comentario (opcional)</span>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="¿Qué te pareció?"
          className="w-full rounded-lg border border-ink-900/15 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-900/40 focus:border-electric-500 focus:outline-none"
        />
      </label>

      {error && <p className="mt-3 text-sm text-ember-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 flex w-full items-center justify-center rounded-full bg-electric-500 py-3 text-sm font-bold text-white transition hover:bg-electric-400 disabled:opacity-60"
      >
        {submitting ? 'Enviando...' : 'Enviar reseña'}
      </button>
    </form>
  )
}
