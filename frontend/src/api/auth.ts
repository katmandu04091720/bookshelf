import { api } from './client';
import type { LoginRequest, Token, User } from '../types/api';

export const authApi = {
  login: (data: LoginRequest) => api.post<Token>('/auth/login', data).then((r) => r.data),
  me: () => api.get<User>('/auth/me').then((r) => r.data),
};
