import { Link } from 'react-router-dom';
import { useFavoritesStore } from '../store/favoritesStore';
import BookCard from '../components/BookCard';
import styles from './Page.module.css';

export default function FavoritesPage() {
  const { items, clear } = useFavoritesStore();

  return (
    <>
      <h1 className={styles.title}>Избранное</h1>
      {items.length === 0 ? (
        <p className={styles.lead}>
          Здесь пока ничего нет. Отметьте книги в{' '}
          <Link to="/books" className={styles.textLink}>
            каталоге
          </Link>
          , и они появятся на этой полке.
        </p>
      ) : (
        <>
          <p className={styles.lead}>
            Отложено книг: {items.length}.{' '}
            <button className={styles.buttonGhost} onClick={clear}>
              Очистить
            </button>
          </p>
          <div className={styles.shelf}>
            {items.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
