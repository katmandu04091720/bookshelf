import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Book } from '../types/api';

/** Хранилище «Избранное», не связано с авторизацией */
interface FavoritesState {
  items: Book[];
  add: (book: Book) => void;
  remove: (id: number) => void;
  toggle: (book: Book) => void;
  isFavorite: (id: number) => boolean;
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (book) =>
        set((s) => (s.items.some((b) => b.id === book.id) ? s : { items: [...s.items, book] })),
      remove: (id) => set((s) => ({ items: s.items.filter((b) => b.id !== id) })),
      toggle: (book) => (get().isFavorite(book.id) ? get().remove(book.id) : get().add(book)),
      isFavorite: (id) => get().items.some((b) => b.id === id),
      clear: () => set({ items: [] }),
    }),
    { name: 'bookshelf-favorites' },
  ),
);
