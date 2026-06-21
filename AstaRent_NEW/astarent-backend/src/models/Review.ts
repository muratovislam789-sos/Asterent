export interface Review {
  id: string
  landlordId: string
  authorId: string
  listingId: string | null
  rating: number
  comment: string | null
  createdAt: string
  author: {
    id: string
    name: string
    avatar?: string
  }
}

export interface CreateReviewDTO {
  landlordId: string
  listingId?: string
  rating: number
  comment?: string
}

export interface LandlordRatingSummary {
  averageRating: number
  totalReviews: number
}
