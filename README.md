# Книжная полка

Итоговый проект по курсу «Разработка веб-приложений (React)». Каталог книг: фронтенд на React + TypeScript (Vite), бэкенд на FastAPI, вход по JWT.

## Запуск

Нужны Python 3.10+ и Node.js 18+. Бэкенд и фронтенд запускаются в двух разных терминалах.

Бэкенд:

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

На Linux/macOS активация venv: `source venv/bin/activate`. Документация API открывается на http://localhost:8000/docs

Фронтенд:

```
cd frontend
npm install
npm run dev
```

Сайт: http://localhost:5173

Логин `student`, пароль `ithub2026`.

## Страницы

- `/` главная, первая полка книг
- `/books` каталог с фильтром по жанрам
- `/books/:id` страница книги (параметр из useParams)
- `/favorites` избранное
- `/login` вход
- `/profile` личный кабинет, только для вошедших (PrivateRoute). Здесь можно добавить и удалить книгу
- всё остальное открывает страницу 404

## Как устроено

Запросы идут через axios-клиент в `src/api/client.ts`. Request-интерсептор подставляет токен в заголовок Authorization, response-интерсептор при ответе 401 разлогинивает пользователя.

Типы в `src/types/api.ts` повторяют Pydantic-схемы из `backend/main.py`.

Состояние запроса описано типом `AsyncState<T>` (loading / error / success) в `src/types/async.ts`. Хук `useAsync` его заполняет, компонент `AsyncView` отрисовывает все три варианта.

Zustand: `authStore` хранит токен, `favoritesStore` хранит избранное. Оба сохраняются в localStorage.

Стили написаны на CSS Modules, в `index.css` только сброс и переменные.

Обложки берутся по ссылке из поля `cover_url`. Если картинка не загрузилась, рисуется простая обложка с названием и автором.

Книги хранятся в памяти сервера, после перезапуска бэкенда список возвращается к исходному.

## API

- `POST /auth/login` получить токен
- `GET /auth/me` текущий пользователь (нужен токен)
- `GET /books`, `GET /books?genre=IT` список книг
- `GET /books/{id}` одна книга
- `POST /books` добавить книгу (нужен токен)
- `DELETE /books/{id}` удалить книгу (нужен токен)
