import { Link } from 'react-router-dom';
import { booksApi } from '../api/books';
import { useAsync } from '../hooks/useAsync';
import AsyncView from '../components/AsyncView';
import BookCard from '../components/BookCard';
import styles from './Page.module.css';

const SHELF_SIZE = 5;

export default function HomePage() {
  const { state, reload } = useAsync(() => booksApi.getAll(), []);

  return (
    <>
      <h1 className={styles.title}>Что почитать</h1>
      <p className={styles.lead}>
        Классика, фантастика и пара книг для программистов. Добавляйте понравившееся в избранное, а после
        входа пополняйте каталог сами.
      </p>

      <AsyncView state={state} onRetry={reload}>
        {(books) => (
          <>
            <div className={styles.shelf}>
              {books.slice(0, SHELF_SIZE).map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
            {books.length > SHELF_SIZE && (
              <p className={styles.more}>
                <Link to="/books" className={styles.button}>
                  Смотреть весь каталог
                </Link>
              </p>
            )}
          </>
        )}
      </AsyncView>
    </>
  );
}
