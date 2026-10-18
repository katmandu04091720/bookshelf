import { Link } from 'react-router-dom';
import type { Book } from '../types/api';
import { useFavoritesStore } from '../store/favoritesStore';
import BookCover from './BookCover';
import styles from './BookCard.module.css';

interface BookCardProps {
  book: Book;
}

/** Книга на полке: обложка стоит на планке, под ней подпись */
export default function BookCard({ book }: BookCardProps) {
  const isFav = useFavoritesStore((s) => s.items.some((b) => b.id === book.id));
  const toggle = useFavoritesStore((s) => s.toggle);

  return (
    <article className={styles.card}>
      <div className={styles.slot}>
        <Link to={`/books/${book.id}`} className={styles.coverLink} tabIndex={-1} aria-hidden>
          <BookCover book={book} />
        </Link>
      </div>
      <div className={styles.label}>
        <h3 className={styles.title}>
          <Link to={`/books/${book.id}`}>{book.title}</Link>
        </h3>
        <p className={styles.author}>{book.author}</p>
        <p className={styles.meta}>
          {book.genre}, {book.year}
        </p>
        <div className={styles.actions}>
          <Link to={`/books/${book.id}`} className={styles.open}>
            Подробнее
          </Link>
          <button
            className={isFav ? `${styles.fav} ${styles.favActive}` : styles.fav}
            onClick={() => toggle(book)}
            aria-pressed={isFav}
          >
            {isFav ? 'В избранном' : 'В избранное'}
          </button>
        </div>
      </div>
    </article>
  );
}
