import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Eye } from 'lucide-react'
import { listingsApi } from '@/api'
import { Listing } from '@/types'

export default function MyListingsPage() {
  const navigate = useNavigate()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchMyListings = () => {
    setLoading(true)
    listingsApi.getMyListings().then(r => { setListings(r.data.data); setLoading(false) }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchMyListings() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить объявление?')) return
    setDeleting(id)
    try { await listingsApi.delete(id); fetchMyListings() } finally { setDeleting(null) }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Мои объявления</h1>
        <Link to="/listings/create" className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />Создать</Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-24 card">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Нет объявлений</h3>
          <p className="text-text text-sm mb-6">Создайте первое объявление</p>
          <Link to="/listings/create" className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" />Создать объявление</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(l => (
            <div key={l.id} className="card p-4 flex items-center gap-4">
              <img src={l.photos[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=100&h=80&fit=crop'} alt={l.title} className="w-20 h-16 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{l.title}</p>
                <p className="text-sm text-text mt-0.5">{l.district} район · {l.address}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-primary-600 font-bold text-sm">{l.price.toLocaleString('ru-RU')} ₸/мес</span>
                  <span className="flex items-center gap-1 text-xs text-text"><Eye className="w-3 h-3" />{l.viewsCount}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => navigate('/listings/edit/' + l.id)} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
                <button onClick={() => handleDelete(l.id)} disabled={deleting === l.id} className="w-9 h-9 rounded-xl border border-red-200 flex items-center justify-center hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4 text-error" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
