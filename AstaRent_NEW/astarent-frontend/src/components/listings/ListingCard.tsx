import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, MapPin, Wifi, Armchair, WashingMachine, Snowflake } from 'lucide-react'
import { Listing } from '@/types'
import { useListingsStore } from '@/store/listingsStore'
import { useAuthStore } from '@/store/authStore'

const API_URL = 'http://localhost:5000'

interface ListingCardProps {
  listing: Listing
  compact?: boolean
  index?: number
}

export default function ListingCard({ listing, compact = false, index = 0 }: ListingCardProps) {
  const { toggleFavorite, isFavorited } = useListingsStore()
  const { isAuthenticated } = useAuthStore()
  const favorited = isFavorited(listing.id)

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isAuthenticated) toggleFavorite(listing.id)
  }

  const roomLabel = listing.rooms === 'studio' ? 'Студия' : `${listing.rooms}-комн. квартира`

  const getPhotoUrl = (photo: string) => {
    if (!photo) return 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop'
    if (photo.startsWith('http')) return photo
    return API_URL + photo
  }

  const photoUrl = getPhotoUrl(listing.photos?.[0])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4), ease: 'easeOut' }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/listings/${listing.id}`} className="block group">
        <div className="card overflow-hidden cursor-pointer">
          <div className={`relative overflow-hidden ${compact ? 'h-40' : 'h-52'}`}>
            <img
              src={photoUrl}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop'
              }}
            />
            <motion.button
              onClick={handleFavorite}
              whileTap={{ scale: 0.85 }}
              className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                favorited ? 'bg-error text-white shadow-lg' : 'bg-white/90 text-gray-400 hover:text-error hover:bg-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
            </motion.button>
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-gray-900 font-bold text-sm px-3 py-1.5 rounded-xl shadow-sm">
              {listing.price.toLocaleString('ru-RU')} ₸/мес
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
                {roomLabel}, {listing.area} м²
              </h3>
              <span className="text-primary-600 font-bold text-base whitespace-nowrap">
                {listing.price.toLocaleString('ru-RU')} ₸
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-text mb-3">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{listing.district} район, {listing.address}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-text mb-3">
              <span>{listing.rooms === 'studio' ? 'Студия' : `${listing.rooms} комн.`}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span>{listing.floor}/{listing.totalFloors} эт.</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span>{listing.area} м²</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {listing.amenities?.wifi && <span className="tag"><Wifi className="w-3 h-3" />Wi-Fi</span>}
              {listing.amenities?.furniture && <span className="tag"><Armchair className="w-3 h-3" />Мебель</span>}
              {listing.amenities?.washer && <span className="tag"><WashingMachine className="w-3 h-3" />Стиральная</span>}
              {listing.amenities?.ac && <span className="tag"><Snowflake className="w-3 h-3" />Кондиционер</span>}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
