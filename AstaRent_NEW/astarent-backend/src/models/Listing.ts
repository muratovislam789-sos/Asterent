export type RoomType = 'studio' | '1' | '2' | '3' | '4+'
export type District = 'Есиль' | 'Алматы' | 'Сарыарка' | 'Байконур' | 'Нура' | 'Другой'

export interface Amenities {
  wifi: boolean
  furniture: boolean
  washer: boolean
  fridge: boolean
  ac: boolean
  balcony: boolean
  parking: boolean
}

export interface Listing {
  id: string
  title: string
  description: string
  price: number
  district: District
  address: string
  rooms: RoomType
  floor: number
  totalFloors: number
  area: number
  amenities: Amenities
  photos: string[]
  landlordId: string
  viewsCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateListingDTO {
  title: string
  description: string
  price: number
  district: District
  address: string
  rooms: RoomType
  floor: number
  totalFloors: number
  area: number
  amenities: Amenities
}

export interface ListingFilters {
  search?: string
  district?: District
  rooms?: RoomType
  priceMin?: number
  priceMax?: number
  wifi?: boolean
  furniture?: boolean
  washer?: boolean
  sortBy?: 'price_asc' | 'price_desc' | 'newest'
  page?: number
  limit?: number
}
