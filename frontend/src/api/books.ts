import { api } from './client';
import type { Book, BookCreate } from '../types/api';

export const booksApi = {
  getAll: (genre?: string) =>
    api.get<Book[]>('/books', { params: genre ? { genre } : undefined }).then((r) => r.data),
  getById: (id: number) => api.get<Book>(`/books/${id}`).then((r) => r.data),
  create: (data: BookCreate) => api.post<Book>('/books', data).then((r) => r.data),
  remove: (id: number) => api.delete<void>(`/books/${id}`).then(() => undefined),
};
