import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Upload, X, Plus } from 'lucide-react'
import { listingsApi } from '@/api'

const DISTRICTS = ['Есиль', 'Алматы', 'Сарыарка', 'Байконур', 'Нура', 'Другой']
const ROOM_TYPES = [{ v: 'studio', l: 'Студия' }, { v: '1', l: '1 комната' }, { v: '2', l: '2 комнаты' }, { v: '3', l: '3 комнаты' }, { v: '4+', l: '4+' }]
const AMENITIES = [{ k: 'wifi', l: 'Wi-Fi' }, { k: 'furniture', l: 'Мебель' }, { k: 'washer', l: 'Стиральная машина' }, { k: 'fridge', l: 'Холодильник' }, { k: 'ac', l: 'Кондиционер' }, { k: 'balcony', l: 'Балкон' }, { k: 'parking', l: 'Парковка' }]

export default function CreateListingPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [form, setForm] = useState({
    title: '', description: '', price: '', district: 'Есиль', address: '',
    rooms: 'studio', floor: '1', totalFloors: '9', area: '',
    amenities: { wifi: false, furniture: false, washer: false, fridge: false, ac: false, balcony: false, parking: false }
  })

  useEffect(() => {
    if (isEdit && id) {
      listingsApi.getById(id).then(r => {
        const l = r.data.data
        setForm({ title: l.title, description: l.description, price: String(l.price), district: l.district, address: l.address, rooms: l.rooms, floor: String(l.floor), totalFloors: String(l.totalFloors), area: String(l.area), amenities: l.amenities })
        setPhotoPreviews(l.photos)
      })
    }
  }, [id])

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 10 - photos.length)
    const newPhotos = [...photos, ...files]
    setPhotos(newPhotos)
    files.forEach(f => { const r = new FileReader(); r.onload = ev => setPhotoPreviews(p => [...p, ev.target?.result as string]); r.readAsDataURL(f) })
  }

  const removePhoto = (i: number) => {
    setPhotos(p => p.filter((_, idx) => idx !== i))
    setPhotoPreviews(p => p.filter((_, idx) => idx !== i))
  }

  const setField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const toggleAmenity = (k: string) => setForm(f => ({ ...f, amenities: { ...f.amenities, [k]: !f.amenities[k as keyof typeof f.amenities] } }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'amenities') fd.append(k, JSON.stringify(v))
        else fd.append(k, String(v))
      })
      photos.forEach(p => fd.append('photos', p))
      if (isEdit && id) await listingsApi.update(id, fd)
      else await listingsApi.create(fd)
      navigate('/my-listings')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Ошибка при сохранении')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Редактировать объявление' : 'Создать объявление'}</h1>

      {error && <div className="bg-red-50 border border-red-200 text-error text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photos */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Фотографии <span className="text-text font-normal text-sm">(до 10)</span></h2>
          <div className="flex flex-wrap gap-3">
            {photoPreviews.map((src, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden group">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            {photoPreviews.length < 10 && (
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all">
                <Upload className="w-5 h-5 text-gray-400 mb-1" />
                <span className="text-xs text-gray-400">Добавить</span>
                <input type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Main info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Основная информация</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Заголовок *</label>
            <input type="text" value={form.title} onChange={setField('title')} required placeholder="Напр: Уютная 2-комн. квартира в Есильском районе" className="input-default" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Описание</label>
            <textarea value={form.description} onChange={setField('description')} rows={4} placeholder="Подробное описание жилья..." className="input-default resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Цена (₸/мес) *</label>
              <input type="number" value={form.price} onChange={setField('price')} required min="1" placeholder="150000" className="input-default" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Площадь (м²) *</label>
              <input type="number" value={form.area} onChange={setField('area')} required min="1" placeholder="60" className="input-default" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Район *</label>
              <select value={form.district} onChange={setField('district')} className="input-default">
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Тип жилья *</label>
              <select value={form.rooms} onChange={setField('rooms')} className="input-default">
                {ROOM_TYPES.map(r => <option key={r.v} value={r.v}>{r.l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Адрес *</label>
            <input type="text" value={form.address} onChange={setField('address')} required placeholder="ул. Сыганак, 10/3" className="input-default" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Этаж</label>
              <input type="number" value={form.floor} onChange={setField('floor')} min="1" className="input-default" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Этажей в доме</label>
              <input type="number" value={form.totalFloors} onChange={setField('totalFloors')} min="1" className="input-default" />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Удобства</h2>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map(a => (
              <button key={a.k} type="button" onClick={() => toggleAmenity(a.k)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${form.amenities[a.k as keyof typeof form.amenities] ? 'bg-primary-600 text-white border-primary-600' : 'border-border text-gray-700 hover:border-primary-300'}`}>
                {a.l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-outline flex-1">Отмена</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
            {loading ? 'Сохраняем...' : isEdit ? 'Сохранить изменения' : 'Опубликовать'}
          </button>
        </div>
      </form>
    </div>
  )
}
