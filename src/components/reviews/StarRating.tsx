import { StarIcon } from '../icons'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-7 w-7' } as const

export function StarRating({ value, onChange, size = 'md' }: StarRatingProps) {
  if (!onChange) {
    const rounded = Math.round(value)
    return (
      <span
        className="inline-flex items-center gap-0.5 text-hazard-400"
        role="img"
        aria-label={`${value.toFixed(1)} de 5 estrellas`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon key={star} filled={star <= rounded} className={SIZE_CLASSES[size]} />
        ))}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-hazard-400">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`Calificar con ${star} estrella${star === 1 ? '' : 's'}`}
          className="transition hover:scale-110"
        >
          <StarIcon filled={star <= value} className={SIZE_CLASSES[size]} />
        </button>
      ))}
    </span>
  )
}
