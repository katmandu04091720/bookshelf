import { Link } from 'react-router-dom';
import styles from './Page.module.css';

export default function NotFoundPage() {
  return (
    <section className={styles.notFound}>
      <h1 className={styles.title}>Страница не найдена</h1>
      <p className={styles.lead}>Ошибка 404. Проверьте адрес или вернитесь в каталог.</p>
      <Link to="/books" className={styles.button}>
        Открыть каталог
      </Link>
    </section>
  );
}
