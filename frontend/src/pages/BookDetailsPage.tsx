import { Link, useParams } from 'react-router-dom';
import { booksApi } from '../api/books';
import { useAsync } from '../hooks/useAsync';
import { useFavoritesStore } from '../store/favoritesStore';
import AsyncView from '../components/AsyncView';
import BookCover from '../components/BookCover';
import NotFoundPage from './NotFoundPage';
import styles from './Page.module.css';

type BookParams = { id: string };

export default function BookDetailsPage() {
  const { id } = useParams<BookParams>();
  const bookId = Number(id);
  const isValidId = Number.isInteger(bookId) && bookId > 0;

  // Хуки нельзя вызывать условно, поэтому при битом id запрос просто отклоняем
  const { state, reload } = useAsync(
    () => (isValidId ? booksApi.getById(bookId) : Promise.reject(new Error('bad id'))),
    [bookId],
  );
  const toggle = useFavoritesStore((s) => s.toggle);
  const isFav = useFavoritesStore((s) => s.items.some((b) => b.id === bookId));

  if (!isValidId) return <NotFoundPage />;

  return (
    <>
      <Link to="/books" className={styles.back}>
        Назад в каталог
      </Link>
      <AsyncView state={state} onRetry={reload}>
        {(book) => (
          <article className={styles.details}>
            <div className={styles.detailsCover}>
              <BookCover book={book} />
            </div>
            <div>
              <h1 className={styles.title}>{book.title}</h1>
              <p className={styles.detailsAuthor}>{book.author}</p>
              {book.description && <p className={styles.description}>{book.description}</p>}
              <dl className={styles.facts}>
                <dt>Жанр</dt>
                <dd>{book.genre}</dd>
                <dt>Год издания</dt>
                <dd>{book.year}</dd>
              </dl>
              <button className={styles.button} onClick={() => toggle(book)}>
                {isFav ? 'Убрать из избранного' : 'Добавить в избранное'}
              </button>
            </div>
          </article>
        )}
      </AsyncView>
    </>
  );
}
