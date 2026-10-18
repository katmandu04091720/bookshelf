import { useState } from 'react';
import type { Book } from '../types/api';
import styles from './BookCover.module.css';

interface BookCoverProps {
  book: Pick<Book, 'title' | 'author' | 'genre' | 'cover_url'>;
}

// Цвет запасной обложки зависит от жанра
const GENRE_CLASS: Record<string, string> = {
  Роман: styles.novel,
  Фантастика: styles.scifi,
  IT: styles.it,
};

/** Обложка по cover_url. Нет ссылки или картинка не загрузилась, рисуем обложку из названия и автора */
export default function BookCover({ book }: BookCoverProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(book.cover_url) && !failed; // в старом избранном из localStorage поля может не быть

  return (
    <div className={styles.cover}>
      {showImage ? (
        <img
          className={styles.image}
          src={book.cover_url}
          alt={`Обложка: ${book.title}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className={`${styles.placeholder} ${GENRE_CLASS[book.genre] ?? styles.novel}`}>
          <span className={styles.phAuthor}>{book.author}</span>
          <span className={styles.phTitle}>{book.title}</span>
        </div>
      )}
    </div>
  );
}
