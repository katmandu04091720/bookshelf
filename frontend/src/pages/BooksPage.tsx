import { useState } from 'react';
import { booksApi } from '../api/books';
import { useAsync } from '../hooks/useAsync';
import AsyncView from '../components/AsyncView';
import BookCard from '../components/BookCard';
import styles from './Page.module.css';

const GENRES = ['Роман', 'Фантастика', 'IT'] as const;
type Genre = (typeof GENRES)[number];

export default function BooksPage() {
  const [genre, setGenre] = useState<Genre | null>(null);
  const { state, reload } = useAsync(() => booksApi.getAll(genre ?? undefined), [genre]);

  const tab = (value: Genre | null, label: string) => (
    <li key={label}>
      <button
        className={genre === value ? `${styles.tab} ${styles.tabActive}` : styles.tab}
        onClick={() => setGenre(value)}
        aria-pressed={genre === value}
      >
        {label}
      </button>
    </li>
  );

  return (
    <>
      <h1 className={styles.title}>Каталог</h1>
      <ul className={styles.tabs}>
        {tab(null, 'Все')}
        {GENRES.map((g) => tab(g, g))}
      </ul>

      <AsyncView state={state} onRetry={reload}>
        {(books) =>
          books.length === 0 ? (
            <p className={styles.muted}>В этом разделе пока пусто.</p>
          ) : (
            <div className={styles.shelf}>
              {books.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          )
        }
      </AsyncView>
    </>
  );
}
