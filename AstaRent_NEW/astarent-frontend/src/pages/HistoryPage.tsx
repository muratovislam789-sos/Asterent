import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { History, Trash2 } from 'lucide-react'
import { historyApi } from '@/api'
import { Listing } from '@/types'
import ListingCard from '@/components/listings/ListingCard'

interface ViewedListing extends Listing {
  viewedAt: string
}

export default function HistoryPage() {
  const [listings, setListings] = useState<ViewedListing[]>([])
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)

  const fetchHistory = () => {
    setLoading(true)
    historyApi.getAll()
      .then(r => { setListings(r.data.data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchHistory() }, [])

  const handleClear = async () => {
    if (!confirm('Очистить всю историю просмотров?')) return
    setClearing(true)
    try {
      await historyApi.clear()
      setListings([])
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <History className="w-6 h-6 text-primary-600" />
          История просмотров
        </h1>
        {listings.length > 0 && (
          <button
            onClick={handleClear}
            disabled={clearing}
            className="flex items-center gap-2 text-sm text-error hover:bg-red-50 px-3 py-2 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Очистить историю
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-72 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-2xl" />
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-24">
          <History className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">История пуста</h3>
          <p className="text-text text-sm mb-6">Здесь появятся объявления которые вы просматривали</p>
          <Link to="/listings" className="btn-primary">Найти жильё</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((l, i) => (
            <ListingCard key={l.id} listing={l} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
