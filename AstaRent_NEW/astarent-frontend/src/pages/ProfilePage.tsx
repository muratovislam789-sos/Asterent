import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, Phone, Heart, MessageCircle, FileText, LogOut, Camera, History } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api'

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuthStore()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saved, setSaved] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const fd = new FormData()
      if (name) fd.append('name', name)
      if (phone) fd.append('phone', phone)
      if (avatarFile) fd.append('avatar', avatarFile)
      const { data } = await authApi.updateProfile(fd)
      updateUser(data.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  const menuItems = [
    { to: '/favorites', icon: <Heart className="w-4 h-4" />, label: 'Избранные объявления' },
    { to: '/history', icon: <History className="w-4 h-4" />, label: 'История просмотров' },
    { to: '/chats', icon: <MessageCircle className="w-4 h-4" />, label: 'Мои чаты' },
    ...(user?.role === 'landlord' ? [{ to: '/my-listings', icon: <FileText className="w-4 h-4" />, label: 'Мои объявления' }] : []),
  ]

  const avatarSrc = avatarPreview || user?.avatar || null

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Мой профиль</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="space-y-4">
          <div className="card p-6 text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              {avatarSrc ? (
                <img src={avatarSrc} alt={user?.name} className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-3xl">
                  {user?.name?.[0] ?? '?'}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center shadow-lg hover:bg-primary-700 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>
            <p className="font-bold text-gray-900">{user?.name}</p>
            <p className="text-xs text-text mt-1">{user?.role === 'landlord' ? 'Арендодатель' : 'Арендатор'}</p>
          </div>

          <div className="card overflow-hidden">
            {menuItems.map(item => (
              <Link key={item.to} to={item.to} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-border/50 text-sm text-gray-700">
                <span className="text-gray-400">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 transition-colors text-sm text-error">
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
          </div>
        </div>

        <div className="md:col-span-2 card p-6">
          <h2 className="font-bold text-gray-900 mb-5">Личные данные</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Имя</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-default pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={user?.email || ''} readOnly className="input-default pl-10 bg-gray-50 cursor-not-allowed text-text" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Телефон</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 701 000 00 00" className="input-default pl-10" />
              </div>
            </div>
            <button type="submit" className={`btn-primary mt-2 ${saved ? 'bg-success hover:bg-success' : ''}`}>
              {saved ? '✓ Сохранено!' : 'Сохранить изменения'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
