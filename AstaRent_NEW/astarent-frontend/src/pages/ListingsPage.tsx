import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, Search, X } from 'lucide-react'
import { useListingsStore } from '@/store/listingsStore'
import ListingCard from '@/components/listings/ListingCard'
import ListingFilters from '@/components/listings/ListingFilters'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'price_asc', label: 'Цена: по возрастанию' },
  { value: 'price_desc', label: 'Цена: по убыванию' },
]

export default function ListingsPage() {
  const { listings, total, isLoading, filters, setFilters, fetchListings } = useListingsStore()
  const [searchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    const init: any = {}
    if (searchParams.get('search')) init.search = searchParams.get('search')
    if (searchParams.get('priceMin')) init.priceMin = Number(searchParams.get('priceMin'))
    if (searchParams.get('priceMax')) init.priceMax = Number(searchParams.get('priceMax'))
    if (searchParams.get('district')) init.district = searchParams.get('district')
    fetchListings({ ...filters, ...init })
    if (init.search) setSearchInput(init.search)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({ search: searchInput || undefined })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex items-center bg-white rounded-xl border border-border px-4 py-2.5 gap-2 shadow-sm">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Поиск по объявлениям..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400"
          />
          {searchInput && (
            <button type="button" onClick={() => { setSearchInput(''); setFilters({ search: undefined }) }}>
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </form>
        <select
          value={filters.sortBy || 'newest'}
          onChange={e => setFilters({ sortBy: e.target.value as any })}
          className="bg-white border border-border rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none cursor-pointer shadow-sm"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center gap-2 bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm">
          <SlidersHorizontal className="w-4 h-4" />
          Фильтры
        </button>
      </div>

      <div className="flex gap-6">
        {/* Desktop Filters */}
        <aside className="hidden md:block w-64 flex-shrink-0 sticky top-20 h-fit">
          <ListingFilters />
        </aside>

        {/* Listings grid */}
        <div className="flex-1">
          <p className="text-sm text-text mb-4">Найдено <span className="font-semibold text-gray-900">{total}</span> объявлений</p>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(9)].map((_, i) => (<div key={i} className="card h-72 animate-pulse"><div className="h-48 bg-gray-200 rounded-t-2xl" /><div className="p-4 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div></div>))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Объявления не найдены</h3>
              <p className="text-text text-sm">Попробуйте изменить фильтры</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {listings.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 max-h-[85vh] overflow-y-auto">
            <ListingFilters onClose={() => setShowFilters(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
