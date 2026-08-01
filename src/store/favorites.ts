import { create } from 'zustand';
import type { FavoriteOrder } from '@/types';

interface FavoritesState {
  favorites: FavoriteOrder[];
  setFavorites: (favorites: FavoriteOrder[]) => void;
  addFavorite: (favorite: FavoriteOrder) => void;
  removeFavorite: (id: string) => void;
  updateFavoriteName: (id: string, name: string) => void;
}

export const useFavoritesStore = create<FavoritesState>()((set) => ({
  favorites: [],
  setFavorites: (favorites) => set({ favorites }),
  addFavorite: (favorite) => set((state) => ({ favorites: [favorite, ...state.favorites.filter((item) => item.id !== favorite.id)] })),
  removeFavorite: (id) => set((state) => ({ favorites: state.favorites.filter((item) => item.id !== id) })),
  updateFavoriteName: (id, name) => set((state) => ({ favorites: state.favorites.map((item) => (item.id === id ? { ...item, name } : item)) })),
}));
