import React, { useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import Header from '@/components/layout/Header'
import HomePage from '@/pages/HomePage'
import ListingsPage from '@/pages/ListingsPage'
import ListingDetailPage from '@/pages/ListingDetailPage'
import CreateListingPage from '@/pages/CreateListingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import FavoritesPage from '@/pages/FavoritesPage'
import ChatsPage from '@/pages/ChatsPage'
import ProfilePage from '@/pages/ProfilePage'
import MyListingsPage from '@/pages/MyListingsPage'

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

const LandlordRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'landlord') return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const { checkAuth, isAuthenticated, token } = useAuthStore()
  const { connect, disconnect } = useChatStore()
  const connectedRef = useRef(false)

  useEffect(() => { checkAuth() }, [])

  useEffect(() => {
    if (isAuthenticated && token && !connectedRef.current) {
      connectedRef.current = true
      connect(token)
    }
    if (!isAuthenticated && connectedRef.current) {
      connectedRef.current = false
      disconnect()
    }
    return () => {
      // Cleanup only on full unmount, not on every re-render
    }
  }, [isAuthenticated, token])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/listings/:id" element={<ListingDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/listings/create" element={<LandlordRoute><CreateListingPage /></LandlordRoute>} />
            <Route path="/listings/edit/:id" element={<LandlordRoute><CreateListingPage /></LandlordRoute>} />
            <Route path="/favorites" element={<PrivateRoute><FavoritesPage /></PrivateRoute>} />
            <Route path="/chats" element={<PrivateRoute><ChatsPage /></PrivateRoute>} />
            <Route path="/chats/:id" element={<PrivateRoute><ChatsPage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/my-listings" element={<LandlordRoute><MyListingsPage /></LandlordRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
