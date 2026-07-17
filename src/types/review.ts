export type ReviewTargetType = 'site' | 'product'

export interface Review {
  id: string
  rating: number
  authorName: string
  comment: string | null
  createdAt: string
}

export interface ProductReview extends Review {
  productId: string
}

export interface RatingSummary {
  average: number
  count: number
}

export interface ReviewSubmission {
  targetType: ReviewTargetType
  productId?: string
  rating: number
  authorName: string
  comment: string
}

export interface AdminReview {
  id: string
  targetType: ReviewTargetType
  productId: string | null
  productName: string | null
  rating: number
  authorName: string
  comment: string | null
  isApproved: boolean
  createdAt: string
}
