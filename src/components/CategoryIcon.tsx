import { categoryIcons, DEFAULT_CATEGORY_ICON } from '../data/categoryIcons'

interface CategoryIconProps {
  category: { slug: string; iconUrl?: string | null }
  className?: string
}

// Si el admin subió un ícono para la categoría, se usa esa imagen; si no,
// cae al ícono SVG por defecto según el slug (o el genérico si no hay uno
// mapeado).
export function CategoryIcon({ category, className = 'h-5 w-5' }: CategoryIconProps) {
  if (category.iconUrl) {
    return <img
        src={category.iconUrl}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className={`object-contain ${className}`}
      />
  }

  const Icon = categoryIcons[category.slug] ?? DEFAULT_CATEGORY_ICON
  return <Icon className={className} />
}
