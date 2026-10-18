// Интерфейсы 1-в-1 повторяют Pydantic-схемы из backend/main.py

export interface LoginRequest {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  full_name: string;
}

export interface BookBase {
  title: string;
  author: string;
  year: number;
  genre: string;
  description: string;
  cover_url: string;
}

export type BookCreate = BookBase;

export interface Book extends BookBase {
  id: number;
}

/** Формат ошибки FastAPI: detail: строка (HTTPException) или массив (ошибки валидации 422) */
export interface ApiErrorBody {
  detail: string | { msg: string; loc: (string | number)[] }[];
}
