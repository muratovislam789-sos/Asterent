import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'tenant' as 'tenant' | 'landlord' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await register(form.name, form.email, form.password, form.role)
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Ошибка регистрации')
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Home className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Создать аккаунт</h1>
          <p className="text-text text-sm">Присоединяйтесь к AstaRent</p>
        </div>

        <div className="card p-8">
          {error && <div className="bg-red-50 border border-red-200 text-error text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Имя</label>
              <input type="text" value={form.name} onChange={set('name')} placeholder="Ваше имя" required minLength={2} className="input-default" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" required className="input-default" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Пароль</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Минимум 8 символов" required minLength={8} className="input-default pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Я являюсь</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ v: 'tenant', l: '🏠 Арендатор', d: 'Ищу жильё' }, { v: 'landlord', l: '🔑 Арендодатель', d: 'Сдаю жильё' }].map(r => (
                  <label key={r.v} className={`cursor-pointer border-2 rounded-xl p-3 text-center transition-all ${form.role === r.v ? 'border-primary-600 bg-primary-50' : 'border-border hover:border-gray-300'}`}>
                    <input type="radio" name="role" value={r.v} checked={form.role === r.v} onChange={() => setForm(f => ({ ...f, role: r.v as any }))} className="hidden" />
                    <p className="font-semibold text-sm text-gray-900">{r.l}</p>
                    <p className="text-xs text-text mt-0.5">{r.d}</p>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 text-base mt-2">
              {isLoading ? 'Регистрируем...' : 'Зарегистрироваться'}
            </button>
          </form>

          <p className="text-center text-sm text-text mt-6">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
