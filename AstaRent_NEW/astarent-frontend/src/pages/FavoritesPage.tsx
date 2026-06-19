import React, { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { listingsApi } from '@/api'
import { Listing } from '@/types'
import ListingCard from '@/components/listings/ListingCard'

export default function FavoritesPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listingsApi.getFavorites().then(r => { setListings(r.data.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Избранные объявления</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-72 animate-pulse"><div className="h-48 bg-gray-200 rounded-t-2xl" /></div>)}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-24">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Нет избранных</h3>
          <p className="text-text text-sm mb-6">Добавляйте понравившиеся объявления в избранное</p>
          <Link to="/listings" className="btn-primary">Найти жильё</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  )
}
