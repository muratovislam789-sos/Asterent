import { create } from 'zustand';
import { Listing, ListingFilters, PaginatedListings } from '@/types';
import { listingsApi } from '@/api';

interface ListingsStore {
  listings: Listing[];
  total: number;
  totalPages: number;
  currentPage: number;
  filters: ListingFilters;
  isLoading: boolean;
  favorites: string[];

  fetchListings: (filters?: ListingFilters) => Promise<void>;
  setFilters: (filters: Partial<ListingFilters>) => void;
  resetFilters: () => void;

  fetchFavorites: () => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  isFavorited: (id: string) => boolean;
}

const defaultFilters: ListingFilters = {
  page: 1,
  limit: 12,
  sortBy: 'newest',
};

export const useListingsStore = create<ListingsStore>((set, get) => ({
  listings: [],
  total: 0,
  totalPages: 0,
  currentPage: 1,
  filters: defaultFilters,
  isLoading: false,
  favorites: [],

  fetchListings: async (overrideFilters) => {
    const filters = overrideFilters || get().filters;
    set({ isLoading: true });
    try {
      const { data } = await listingsApi.getAll(filters as Record<string, unknown>);
      const result: PaginatedListings = data.data;
      set({
        listings: result.listings,
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.page,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  setFilters: (newFilters) => {
    const updated = { ...get().filters, ...newFilters, page: 1 };
    set({ filters: updated });
    get().fetchListings(updated);
  },

  resetFilters: () => {
    set({ filters: defaultFilters });
    get().fetchListings(defaultFilters);
  },

  fetchFavorites: async () => {
    try {
      const { data } = await listingsApi.getFavorites();
      const ids = (data.data as Listing[]).map((l) => l.id);
      set({ favorites: ids });
    } catch {}
  },

  toggleFavorite: async (id) => {
    const { favorites } = get();
    const isFav = favorites.includes(id);
    set({ favorites: isFav ? favorites.filter((f) => f !== id) : [...favorites, id] });
    try {
      await listingsApi.toggleFavorite(id);
    } catch {
      // revert
      set({ favorites: isFav ? [...get().favorites, id] : get().favorites.filter((f) => f !== id) });
    }
  },

  isFavorited: (id) => get().favorites.includes(id),
}));
