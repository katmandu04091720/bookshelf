"""API для учебного каталога книг: книги, вход по JWT."""
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

SECRET_KEY = "change-me-in-production"  # для прода вынести в .env
ALGORITHM = "HS256"
TOKEN_TTL_MINUTES = 60

app = FastAPI(title="Bookshelf API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Pydantic-схемы (зеркалятся в frontend/src/types/api.ts) ----------
class LoginRequest(BaseModel):
    username: str = Field(min_length=3)
    password: str = Field(min_length=6)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class User(BaseModel):
    id: int
    username: str
    full_name: str


class BookBase(BaseModel):
    title: str = Field(min_length=1)
    author: str = Field(min_length=1)
    year: int = Field(ge=0, le=2100)
    genre: str
    description: str = ""
    cover_url: str = ""  # ссылка на обложку, если пусто, фронт рисует заглушку


class BookCreate(BookBase):
    pass


class Book(BookBase):
    id: int


# ---------- «База данных» в памяти ----------
# In-memory хранилище, сбрасывается при рестарте. Для реального проекта нужна БД
USERS = {"student": {"id": 1, "username": "student", "full_name": "Студент ITHub", "password": "ithub2026"}}

LITRES = "https://cdn.litres.ru/pub/c/cover_415"  # обложки русских изданий с ЛитРес

BOOKS: list[Book] = [
    Book(id=1, title="Мастер и Маргарита", author="Михаил Булгаков", year=1967, genre="Роман",
         description="Сатана приезжает в Москву 1930-х, и всё идёт не по плану.",
         cover_url=f"{LITRES}/74182066.webp"),
    Book(id=2, title="Пикник на обочине", author="Аркадий и Борис Стругацкие", year=1972, genre="Фантастика",
         description="Зона, сталкеры и Золотой шар, исполняющий желания.",
         cover_url=f"{LITRES}/23467386.webp"),
    Book(id=3, title="Преступление и наказание", author="Фёдор Достоевский", year=1866, genre="Роман",
         description="Студент Раскольников проверяет на себе теорию о «право имеющих».",
         cover_url=f"{LITRES}/74149111.webp"),
    Book(id=4, title="Чистый код", author="Роберт Мартин", year=2008, genre="IT",
         description="Как писать код, который потом не стыдно читать.",
         cover_url=f"{LITRES}/6444478.webp"),
    Book(id=5, title="Грокаем алгоритмы", author="Адитья Бхаргава", year=2016, genre="IT",
         description="Алгоритмы с картинками, без боли.",
         cover_url=f"{LITRES}/39158380.webp"),
    Book(id=6, title="Солярис", author="Станислав Лем", year=1961, genre="Фантастика",
         description="Разумный океан и учёные, которые не могут его понять.",
         cover_url=f"{LITRES}/131925.webp"),
]


# ---------- JWT ----------
bearer = HTTPBearer(auto_error=False)


def create_token(username: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_TTL_MINUTES)
    return jwt.encode({"sub": username, "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)


def current_user(creds: HTTPAuthorizationCredentials | None = Depends(bearer)) -> User:
    unauthorized = HTTPException(status.HTTP_401_UNAUTHORIZED, "Не авторизован",
                                 headers={"WWW-Authenticate": "Bearer"})
    if creds is None:
        raise unauthorized
    try:
        username = jwt.decode(creds.credentials, SECRET_KEY, algorithms=[ALGORITHM])["sub"]
    except jwt.PyJWTError:
        raise unauthorized
    u = USERS.get(username)
    if u is None:
        raise unauthorized
    return User(id=u["id"], username=u["username"], full_name=u["full_name"])


# ---------- Эндпоинты ----------
@app.post("/auth/login", response_model=Token)
def login(data: LoginRequest):
    u = USERS.get(data.username)
    if u is None or u["password"] != data.password:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Неверный логин или пароль")
    return Token(access_token=create_token(data.username))


@app.get("/auth/me", response_model=User)
def me(user: User = Depends(current_user)):
    return user


@app.get("/books", response_model=list[Book])
def list_books(genre: str | None = None):
    return [b for b in BOOKS if genre is None or b.genre == genre]


@app.get("/books/{book_id}", response_model=Book)
def get_book(book_id: int):
    for b in BOOKS:
        if b.id == book_id:
            return b
    raise HTTPException(status.HTTP_404_NOT_FOUND, "Книга не найдена")


@app.post("/books", response_model=Book, status_code=status.HTTP_201_CREATED)
def create_book(data: BookCreate, _: User = Depends(current_user)):
    book = Book(id=max((b.id for b in BOOKS), default=0) + 1, **data.model_dump())
    BOOKS.append(book)
    return book


@app.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: int, _: User = Depends(current_user)):
    for i, b in enumerate(BOOKS):
        if b.id == book_id:
            BOOKS.pop(i)
            return
    raise HTTPException(status.HTTP_404_NOT_FOUND, "Книга не найдена")
