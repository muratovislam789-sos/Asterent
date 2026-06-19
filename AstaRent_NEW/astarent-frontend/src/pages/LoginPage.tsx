import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Неверный email или пароль')
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Home className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Добро пожаловать</h1>
          <p className="text-text text-sm">Войдите в свой аккаунт AstaRent</p>
        </div>

        <div className="card p-8">
          {error && <div className="bg-red-50 border border-red-200 text-error text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required className="input-default" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Пароль</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Введите пароль" required className="input-default pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 text-base mt-2">
              {isLoading ? 'Входим...' : 'Войти'}
            </button>
          </form>

          <p className="text-center text-sm text-text mt-6">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
