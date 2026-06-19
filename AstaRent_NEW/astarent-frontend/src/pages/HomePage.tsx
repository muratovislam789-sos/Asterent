import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, ChevronRight } from 'lucide-react'
import { useListingsStore } from '@/store/listingsStore'
import ListingCard from '@/components/listings/ListingCard'

const DISTRICTS = [
  { name: 'Есиль', count: '120+', img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=300&fit=crop' },
  { name: 'Алматы', count: '135+', img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop' },
  { name: 'Сарыарка', count: '100+', img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop' },
  { name: 'Байконур', count: '120+', img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { listings, isLoading, fetchListings } = useListingsStore()
  const [query, setQuery] = useState('')
  const [priceFrom, setPriceFrom] = useState('')
  const [priceTo, setPriceTo] = useState('')

  React.useEffect(() => { fetchListings({ limit: 6, sortBy: 'newest' }) }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (query) params.set('search', query)
    if (priceFrom) params.set('priceMin', priceFrom)
    if (priceTo) params.set('priceMax', priceTo)
    navigate('/listings?' + params.toString())
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[420px] md:h-[500px] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&h=900&fit=crop" alt="Астана" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
            Найдите идеальное<br />жильё в Астане
          </h1>
          <p className="text-white/90 text-base md:text-lg mb-8 drop-shadow">Быстрый, безопасный и удобный поиск жилья</p>
          <div className="bg-white rounded-2xl p-3 shadow-2xl w-full max-w-3xl flex flex-col md:flex-row gap-2">
            <div className="flex items-center gap-2 flex-1 px-2">
              <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0" />
              <input type="text" placeholder="Район, адрес или название..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400" />
            </div>
            <div className="hidden md:block w-px bg-gray-200 self-stretch" />
            <input type="number" placeholder="Цена от" value={priceFrom} onChange={e => setPriceFrom(e.target.value)} className="text-sm outline-none text-gray-800 placeholder-gray-400 px-3 w-28 hidden md:block" />
            <div className="hidden md:block w-px bg-gray-200 self-stretch" />
            <input type="number" placeholder="Цена до" value={priceTo} onChange={e => setPriceTo(e.target.value)} className="text-sm outline-none text-gray-800 placeholder-gray-400 px-3 w-28 hidden md:block" />
            <button onClick={handleSearch} className="btn-primary flex items-center gap-2 justify-center"><Search className="w-4 h-4" />Найти</button>
          </div>
        </div>
      </section>

      {/* Districts */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Популярные районы</h2>
          <button onClick={() => navigate('/listings')} className="btn-text flex items-center gap-1 text-sm">Все районы <ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DISTRICTS.map(d => (
            <button key={d.name} onClick={() => navigate('/listings?district=' + d.name)} className="relative h-36 rounded-2xl overflow-hidden group cursor-pointer">
              <img src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-3 text-left">
                <p className="text-white font-bold text-base">{d.name}</p>
                <p className="text-white/80 text-xs">{d.count} объявлений</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Latest listings */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Последние объявления</h2>
          <button onClick={() => navigate('/listings')} className="btn-text flex items-center gap-1 text-sm">Все объявления <ChevronRight className="w-4 h-4" /></button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (<div key={i} className="card h-72 animate-pulse"><div className="h-48 bg-gray-200 rounded-t-2xl" /><div className="p-4 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div></div>))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </section>
    </div>
  )
}
