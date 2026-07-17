import { supabase } from '../supabase'
import type { AdminReview, ProductReview, RatingSummary, Review, ReviewSubmission } from '../../types/review'

interface ReviewRow {
  id: string
  rating: number
  author_name: string
  comment: string | null
  created_at: string
}

function mapRow(row: ReviewRow): Review {
  return {
    id: row.id,
    rating: row.rating,
    authorName: row.author_name,
    comment: row.comment,
    createdAt: row.created_at,
  }
}

function summarize(ratings: number[]): RatingSummary {
  if (ratings.length === 0) return { average: 0, count: 0 }
  const total = ratings.reduce((sum, value) => sum + value, 0)
  return { average: total / ratings.length, count: ratings.length }
}

export async function fetchSiteReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, author_name, comment, created_at')
    .eq('target_type', 'site')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(24)

  if (error) throw error
  return (data as ReviewRow[]).map(mapRow)
}

export async function fetchSiteRatingSummary(): Promise<RatingSummary> {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('target_type', 'site')
    .eq('is_approved', true)

  if (error) throw error
  return summarize((data as { rating: number }[]).map((row) => row.rating))
}

export async function fetchProductReviews(productId: string): Promise<ProductReview[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, author_name, comment, created_at')
    .eq('target_type', 'product')
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as ReviewRow[]).map((row) => ({ ...mapRow(row), productId }))
}

export async function fetchProductRatingSummaries(): Promise<Record<string, RatingSummary>> {
  const { data, error } = await supabase
    .from('reviews')
    .select('product_id, rating')
    .eq('target_type', 'product')
    .eq('is_approved', true)

  if (error) throw error

  const byProduct = new Map<string, number[]>()
  for (const row of data as { product_id: string; rating: number }[]) {
    const list = byProduct.get(row.product_id) ?? []
    list.push(row.rating)
    byProduct.set(row.product_id, list)
  }

  const summaries: Record<string, RatingSummary> = {}
  for (const [productId, ratings] of byProduct) {
    summaries[productId] = summarize(ratings)
  }
  return summaries
}

export async function submitReview(input: ReviewSubmission): Promise<void> {
  const { error } = await supabase.from('reviews').insert({
    target_type: input.targetType,
    product_id: input.productId ?? null,
    rating: input.rating,
    author_name: input.authorName.trim(),
    comment: input.comment.trim() || null,
    is_approved: false,
  })

  if (error) throw error
}

interface AdminReviewRow {
  id: string
  target_type: 'site' | 'product'
  product_id: string | null
  rating: number
  author_name: string
  comment: string | null
  is_approved: boolean
  created_at: string
  products: { name: string } | { name: string }[] | null
}

export async function fetchAdminReviews(): Promise<AdminReview[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(
      'id, target_type, product_id, rating, author_name, comment, is_approved, created_at, products(name)',
    )
    .order('is_approved', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data as unknown as AdminReviewRow[]).map((row) => {
    const product = Array.isArray(row.products) ? row.products[0] : row.products
    return {
      id: row.id,
      targetType: row.target_type,
      productId: row.product_id,
      productName: product?.name ?? null,
      rating: row.rating,
      authorName: row.author_name,
      comment: row.comment,
      isApproved: row.is_approved,
      createdAt: row.created_at,
    }
  })
}

export async function approveReview(id: string): Promise<void> {
  const { error } = await supabase.from('reviews').update({ is_approved: true }).eq('id', id)
  if (error) throw error
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.from('reviews').delete().eq('id', id)
  if (error) throw error
}
