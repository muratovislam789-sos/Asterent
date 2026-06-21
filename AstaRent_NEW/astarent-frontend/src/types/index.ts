// ─── Auth & User ─────────────────────────────────────────────────────────────

export type UserRole = 'tenant' | 'landlord';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// ─── Listings ─────────────────────────────────────────────────────────────────

export type RoomType = 'studio' | '1' | '2' | '3' | '4+';
export type District = 'Есиль' | 'Алматы' | 'Сарыарка' | 'Байконур' | 'Нура' | 'Другой';

export interface Amenities {
  wifi: boolean;
  furniture: boolean;
  washer: boolean;
  fridge: boolean;
  ac: boolean;
  balcony: boolean;
  parking: boolean;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  district: District;
  address: string;
  rooms: RoomType;
  floor: number;
  totalFloors: number;
  area: number;
  amenities: Amenities;
  photos: string[];
  landlord: User;
  createdAt: string;
  updatedAt: string;
  isFavorited?: boolean;
  viewsCount: number;
}

export interface ListingFilters {
  priceMin?: number;
  priceMax?: number;
  district?: District;
  rooms?: RoomType;
  wifi?: boolean;
  furniture?: boolean;
  washer?: boolean;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
  page?: number;
  limit?: number;
}

export interface PaginatedListings {
  listings: Listing[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateListingDto {
  title: string;
  description: string;
  price: number;
  district: District;
  address: string;
  rooms: RoomType;
  floor: number;
  totalFloors: number;
  area: number;
  amenities: Amenities;
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  landlordId: string;
  authorId: string;
  listingId?: string | null;
  rating: number;
  comment?: string;
  createdAt: string;
  author: Pick<User, 'id' | 'name' | 'avatar'>;
}

export interface CreateReviewDto {
  landlordId: string;
  listingId?: string;
  rating: number;
  comment?: string;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
  isRead: boolean;
}

export interface Chat {
  id: string;
  listing: Pick<Listing, 'id' | 'title' | 'photos' | 'price'>;
  tenant: User;
  landlord: User;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  statusCode: number;
}
