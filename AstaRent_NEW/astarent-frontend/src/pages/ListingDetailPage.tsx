import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Heart, MapPin, Wifi, Armchair, WashingMachine, Snowflake, Car, Trees, ChevronLeft, ChevronRight, MessageCircle, Share2, Eye } from 'lucide-react'
import { listingsApi } from '@/api'
import { Listing } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { useListingsStore } from '@/store/listingsStore'
import { useChatStore } from '@/store/chatStore'
import { StarRating } from '@/components/ui/StarRating'
import ReviewsSection from '@/components/ui/ReviewsSection'

const API_URL = 'http://localhost:5000'

const getPhotoUrl = (photo: string) => {
  if (!photo) return 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'
  if (photo.startsWith('http')) return photo
  return API_URL + photo
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const { toggleFavorite, isFavorited } = useListingsStore()
  const { startChat } = useChatStore()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [photoIdx, setPhotoIdx] = useState(0)
  const [contacting, setContacting] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    listingsApi.getById(id)
      .then(r => { setListing(r.data.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const handleContact = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (!listing) return
    setContacting(true)
    try {
      const chat = await startChat(listing.id)
      navigate('/chats/' + chat.id)
    } finally { setContacting(false) }
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-96 bg-gray-200 rounded-2xl mb-6" />
      <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
    </div>
  )

  if (!listing) return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-4">😕</div>
      <h2 className="text-xl font-bold text-gray-700">Объявление не найдено</h2>
      <button onClick={() => navigate('/listings')} className="btn-primary mt-4">Назад к списку</button>
    </div>
  )

  const favorited = isFavorited(listing.id)
  const photos = listing.photos && listing.photos.length > 0
    ? listing.photos
    : ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop']
  const roomLabel = listing.rooms === 'studio' ? 'Студия' : `${listing.rooms}-комн. квартира`

  const amenityList = [
    { key: 'wifi', icon: <Wifi className="w-4 h-4" />, label: 'Wi-Fi' },
    { key: 'furniture', icon: <Armchair className="w-4 h-4" />, label: 'Мебель' },
    { key: 'washer', icon: <WashingMachine className="w-4 h-4" />, label: 'Стиральная машина' },
    { key: 'fridge', icon: <WashingMachine className="w-4 h-4" />, label: 'Холодильник' },
    { key: 'ac', icon: <Snowflake className="w-4 h-4" />, label: 'Кондиционер' },
    { key: 'balcony', icon: <Trees className="w-4 h-4" />, label: 'Балкон' },
    { key: 'parking', icon: <Car className="w-4 h-4" />, label: 'Парковка' },
  ].filter(a => listing.amenities?.[a.key as keyof typeof listing.amenities])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-text hover:text-primary-600 transition-colors mb-4">
        <ChevronLeft className="w-4 h-4" /> Назад
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Галерея */}
          <div className="relative rounded-2xl overflow-hidden h-72 md:h-96 bg-gray-100">
            <img
              src={getPhotoUrl(photos[photoIdx])}
              alt={listing.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'
              }}
            />
            {photos.length > 1 && (
              <>
                <button onClick={() => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition">
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button onClick={() => setPhotoIdx(i => (i + 1) % photos.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition">
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {photos.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === photoIdx ? 'bg-white w-4' : 'bg-white/60'}`} />)}
                </div>
              </>
            )}
          </div>

          {/* Миниатюры */}
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.map((p, i) => (
                <button key={i} onClick={() => setPhotoIdx(i)} className={`flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === photoIdx ? 'border-primary-600' : 'border-transparent'}`}>
                  <img src={getPhotoUrl(p)} alt="" className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=100&h=80&fit=crop' }} />
                </button>
              ))}
            </div>
          )}

          {/* Инфо */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-xl font-bold text-gray-900">{roomLabel}, {listing.area} м²</h1>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">{listing.price.toLocaleString('ru-RU')} ₸</p>
                <p className="text-xs text-text">в месяц</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-text mb-4">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              {listing.district} район, {listing.address}
            </div>
            <div className="grid grid-cols-3 gap-3 py-4 border-y border-border mb-4">
              {[
                { label: 'Комнаты', value: listing.rooms === 'studio' ? 'Студия' : listing.rooms },
                { label: 'Этаж', value: `${listing.floor}/${listing.totalFloors}` },
                { label: 'Площадь', value: `${listing.area} м²` },
              ].map(d => (
                <div key={d.label} className="text-center">
                  <p className="font-bold text-gray-900 text-base">{d.value}</p>
                  <p className="text-xs text-text mt-0.5">{d.label}</p>
                </div>
              ))}
            </div>
            {listing.description && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Описание</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{listing.description}</p>
              </div>
            )}
            {amenityList.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Удобства</h3>
                <div className="flex flex-wrap gap-2">
                  {amenityList.map(a => (
                    <span key={a.key} className="tag">
                      <span className="text-primary-600">{a.icon}</span>
                      {a.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Отзывы об арендодателе */}
          {listing.landlord?.id && (
            <ReviewsSection
              landlordId={listing.landlord.id}
              listingId={listing.id}
              averageRating={listing.landlord.averageRating || 0}
              reviewCount={listing.landlord.reviewCount || 0}
            />
          )}
        </div>

        {/* Правая колонка */}
        <div className="space-y-4">
          <div className="card p-5 sticky top-20">
            <p className="text-2xl font-bold text-primary-600 mb-0.5">{listing.price.toLocaleString('ru-RU')} ₸</p>
            <p className="text-xs text-text mb-5">в месяц</p>
            {user?.id !== listing.landlord?.id && (
              <button onClick={handleContact} disabled={contacting} className="btn-primary w-full flex items-center justify-center gap-2 mb-3">
                <MessageCircle className="w-4 h-4" />
                {contacting ? 'Открываем чат...' : 'Связаться с арендодателем'}
              </button>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => isAuthenticated ? toggleFavorite(listing.id) : navigate('/login')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${favorited ? 'bg-error/10 border-error text-error' : 'border-border text-gray-700 hover:border-gray-400'}`}
              >
                <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
                {favorited ? 'В избранном' : 'В избранное'}
              </button>
              <button className="px-3 py-2.5 rounded-xl border border-border text-gray-700 hover:border-gray-400 transition-all">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-text mt-3 justify-center">
              <Eye className="w-3.5 h-3.5" /> {listing.viewsCount} просмотров
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">Арендодатель</h3>
            <div className="flex items-center gap-3">
              {listing.landlord?.avatar ? (
                <img src={getPhotoUrl(listing.landlord.avatar)} alt={listing.landlord.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                  {listing.landlord?.name?.[0]}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{listing.landlord?.name}</p>
                <p className="text-xs text-success flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-success rounded-full" /> Арендодатель
                </p>
              </div>
            </div>
            {(listing.landlord?.reviewCount ?? 0) > 0 && (
              <div className="mt-3">
                <StarRating value={listing.landlord?.averageRating || 0} reviewCount={listing.landlord?.reviewCount} size={14} />
              </div>
            )}
            {listing.landlord?.phone && (
              <a href={'tel:' + listing.landlord.phone} className="block mt-4 text-sm text-primary-600 font-medium hover:underline">
                {listing.landlord.phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
