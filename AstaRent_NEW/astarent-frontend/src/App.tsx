import React, { useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import Header from '@/components/layout/Header'
import PageTransition from '@/components/ui/PageTransition'
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

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/listings" element={<PageTransition><ListingsPage /></PageTransition>} />
        <Route path="/listings/:id" element={<PageTransition><ListingDetailPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        <Route path="/listings/create" element={<LandlordRoute><PageTransition><CreateListingPage /></PageTransition></LandlordRoute>} />
        <Route path="/listings/edit/:id" element={<LandlordRoute><PageTransition><CreateListingPage /></PageTransition></LandlordRoute>} />
        <Route path="/favorites" element={<PrivateRoute><PageTransition><FavoritesPage /></PageTransition></PrivateRoute>} />
        <Route path="/chats" element={<PrivateRoute><PageTransition><ChatsPage /></PageTransition></PrivateRoute>} />
        <Route path="/chats/:id" element={<PrivateRoute><PageTransition><ChatsPage /></PageTransition></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><PageTransition><ProfilePage /></PageTransition></PrivateRoute>} />
        <Route path="/my-listings" element={<LandlordRoute><PageTransition><MyListingsPage /></PageTransition></LandlordRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
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
  }, [isAuthenticated, token])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg flex flex-col">
        <Header />
        <main className="flex-1">
          <AnimatedRoutes />
        </main>
      </div>
    </BrowserRouter>
  )
}
