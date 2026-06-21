import React, { useEffect, useState } from 'react'
import { reviewsApi } from '@/api'
import { Review } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { StarRating, StarPicker } from './StarRating'

const API_URL = 'http://localhost:5000'
const getPhotoUrl = (photo?: string) => {
  if (!photo) return ''
  if (photo.startsWith('http')) return photo
  return API_URL + photo
}

interface ReviewsSectionProps {
  landlordId: string
  listingId?: string
  averageRating?: number
  reviewCount?: number
}

export default function ReviewsSection({ landlordId, listingId, averageRating = 0, reviewCount = 0 }: ReviewsSectionProps) {
  const { isAuthenticated, user } = useAuthStore()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    reviewsApi.getForLandlord(landlordId)
      .then(r => setReviews(r.data.data?.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [landlordId])

  const canReview = isAuthenticated && user?.role === 'tenant' && user.id !== landlordId
  const alreadyReviewed = reviews.some(r => r.author.id === user?.id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) { setError('Поставьте оценку от 1 до 5'); return }
    setSubmitting(true)
    setError('')
    try {
      await reviewsApi.create({ landlordId, listingId, rating, comment: comment.trim() || undefined })
      setShowForm(false)
      setRating(0)
      setComment('')
      load()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Не удалось отправить отзыв')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm mb-1">Отзывы об арендодателе</h3>
          <StarRating value={averageRating} reviewCount={reviewCount} />
        </div>
        {canReview && !alreadyReviewed && !showForm && (
          <button onClick={() => setShowForm(true)} className="text-sm font-medium text-primary-600 hover:underline">
            Оставить отзыв
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
          <div>
            <p className="text-xs text-text mb-2">Ваша оценка</p>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Расскажите о своём опыте (необязательно)"
            rows={3}
            className="input-field resize-none"
          />
          {error && <p className="text-xs text-error">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary text-sm py-2 px-4">
              {submitting ? 'Отправка...' : 'Отправить отзыв'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-text px-4 py-2">
              Отмена
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-text">Пока нет отзывов об этом арендодателе.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
              {r.author.avatar ? (
                <img src={getPhotoUrl(r.author.avatar)} alt={r.author.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
                  {r.author.name?.[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-gray-900 text-sm">{r.author.name}</p>
                  <span className="text-xs text-text flex-shrink-0">{new Date(r.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
                <StarRating value={r.rating} showValue={false} size={13} />
                {r.comment && <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{r.comment}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
