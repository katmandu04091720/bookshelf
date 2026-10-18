import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { booksApi } from '../api/books';
import { getErrorMessage } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import { useFavoritesStore } from '../store/favoritesStore';
import AsyncView from '../components/AsyncView';
import type { Book, BookCreate } from '../types/api';
import type { AsyncState } from '../types/async';
import styles from './Page.module.css';

type SubmitState = { status: 'idle' } | AsyncState<Book>;
type FormValues = Omit<BookCreate, 'year'> & { year: string }; // в input год приходит строкой

const EMPTY: FormValues = { title: '', author: '', year: '', genre: 'Роман', description: '', cover_url: '' };

export default function ProfilePage() {
  const me = useAsync(() => authApi.me(), []);
  const books = useAsync(() => booksApi.getAll(), []);
  const removeFavorite = useFavoritesStore((s) => s.remove);

  const [values, setValues] = useState<FormValues>(EMPTY);
  const [submit, setSubmit] = useState<SubmitState>({ status: 'idle' });
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const year = Number(values.year);
  const formValid =
    values.title.trim() !== '' &&
    values.author.trim() !== '' &&
    Number.isInteger(year) &&
    year > 0 &&
    year <= 2100;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formValid) return;
    setSubmit({ status: 'loading' });
    try {
      const created = await booksApi.create({
        ...values,
        title: values.title.trim(),
        author: values.author.trim(),
        cover_url: values.cover_url.trim(),
        year,
      });
      setSubmit({ status: 'success', data: created });
      setValues(EMPTY);
      books.reload();
    } catch (err) {
      setSubmit({ status: 'error', error: getErrorMessage(err) });
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteError(null);
    try {
      await booksApi.remove(id);
      removeFavorite(id); // удалённая книга не должна висеть в избранном
      books.reload();
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    }
  };

  return (
    <>
      <h1 className={styles.title}>Личный кабинет</h1>

      <AsyncView state={me.state} onRetry={me.reload}>
        {(user) => (
          <p className={styles.muted}>
            Вы вошли как <b>{user.full_name}</b> (@{user.username}, id {user.id})
          </p>
        )}
      </AsyncView>

      <h2 className={styles.subtitle}>Добавить книгу</h2>
      <form className={`${styles.panel} ${styles.formWide}`} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="title">Название</label>
          <input id="title" name="title" value={values.title} onChange={handleChange} required />
        </div>
        <div className={styles.field}>
          <label htmlFor="author">Автор</label>
          <input id="author" name="author" value={values.author} onChange={handleChange} required />
        </div>
        <div className={styles.field}>
          <label htmlFor="year">Год</label>
          <input
            id="year"
            name="year"
            type="number"
            min={1}
            max={2100}
            value={values.year}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="genre">Жанр</label>
          <select id="genre" name="genre" value={values.genre} onChange={handleChange}>
            <option>Роман</option>
            <option>Фантастика</option>
            <option>IT</option>
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="cover_url">Ссылка на обложку</label>
          <input
            id="cover_url"
            name="cover_url"
            type="url"
            value={values.cover_url}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>
        <div className={`${styles.field} ${styles.fullRow}`}>
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={values.description}
            onChange={handleChange}
          />
        </div>
        <div className={styles.fullRow}>
          {submit.status === 'error' && <div className={styles.formError}>{submit.error}</div>}
          {submit.status === 'success' && (
            <div className={styles.formSuccess}>
              Добавлено: <Link to={`/books/${submit.data.id}`}>{submit.data.title}</Link>
            </div>
          )}
        </div>
        <div className={styles.fullRow}>
          <button
            className={styles.button}
            type="submit"
            disabled={!formValid || submit.status === 'loading'}
          >
            {submit.status === 'loading' ? 'Сохраняем…' : 'Добавить'}
          </button>
        </div>
      </form>

      <h2 className={styles.subtitle}>Все книги</h2>
      {deleteError && <div className={styles.formError}>{deleteError}</div>}
      <AsyncView state={books.state} onRetry={books.reload}>
        {(list) => (
          <ul className={`${styles.panel} ${styles.list}`}>
            {list.map((b) => (
              <li key={b.id} className={styles.listItem}>
                <Link to={`/books/${b.id}`}>
                  {b.title}, {b.author}
                </Link>
                <button className={styles.buttonGhost} onClick={() => handleDelete(b.id)}>
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        )}
      </AsyncView>
    </>
  );
}
