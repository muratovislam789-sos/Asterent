import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Search, Heart, MessageCircle, User, Plus, LogOut, Menu, X, Bell
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { totalUnread } = useChatStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) =>
    location.pathname === path ? 'text-primary-600 font-semibold' : 'text-gray-600 hover:text-primary-600';

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AstaRent</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className={`text-sm transition-colors ${isActive('/')}`}>
              Главная
            </Link>
            <Link to="/listings" className={`text-sm transition-colors ${isActive('/listings')}`}>
              Объявления
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/favorites" className={`text-sm transition-colors ${isActive('/favorites')}`}>
                  Избранное
                </Link>
                <Link to="/chats" className={`relative text-sm transition-colors ${isActive('/chats')}`}>
                  Чаты
                  {totalUnread > 0 && (
                    <span className="absolute -top-2 -right-3 bg-error text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                  )}
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {user?.role === 'landlord' && (
                  <button
                    onClick={() => navigate('/listings/create')}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Разместить
                  </button>
                )}
                <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-800">{user?.name.split(' ')[0]}</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-text">Войти</Link>
                <Link to="/register" className="btn-primary">Регистрация</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-border">
          <div className="px-4 py-4 space-y-2">
            <MobileNavLink to="/" label="Главная" icon={<Home className="w-4 h-4" />} onClick={() => setMobileMenuOpen(false)} />
            <MobileNavLink to="/listings" label="Объявления" icon={<Search className="w-4 h-4" />} onClick={() => setMobileMenuOpen(false)} />
            {isAuthenticated && (
              <>
                <MobileNavLink to="/favorites" label="Избранное" icon={<Heart className="w-4 h-4" />} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink
                  to="/chats"
                  label={`Чаты${totalUnread > 0 ? ` (${totalUnread})` : ''}`}
                  icon={<MessageCircle className="w-4 h-4" />}
                  onClick={() => setMobileMenuOpen(false)}
                />
                <MobileNavLink to="/profile" label="Профиль" icon={<User className="w-4 h-4" />} onClick={() => setMobileMenuOpen(false)} />
                {user?.role === 'landlord' && (
                  <MobileNavLink to="/listings/create" label="Разместить объявление" icon={<Plus className="w-4 h-4" />} onClick={() => setMobileMenuOpen(false)} />
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-error hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Выйти
                </button>
              </>
            )}
            {!isAuthenticated && (
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="btn-outline flex-1 text-center" onClick={() => setMobileMenuOpen(false)}>Войти</Link>
                <Link to="/register" className="btn-primary flex-1 text-center" onClick={() => setMobileMenuOpen(false)}>Регистрация</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const MobileNavLink: React.FC<{
  to: string; label: string; icon: React.ReactNode; onClick: () => void;
}> = ({ to, label, icon, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
  >
    <span className="text-gray-400">{icon}</span>
    {label}
  </Link>
);

export default Header;
