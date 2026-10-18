import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useFavoritesStore } from '../store/favoritesStore';
import styles from './Layout.module.css';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? `${styles.link} ${styles.active}` : styles.link;

export default function Layout() {
  const { token, username, logout } = useAuthStore();
  const favCount = useFavoritesStore((s) => s.items.length);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.inner}>
          <NavLink to="/" className={styles.logo}>
            Книжная полка
          </NavLink>
          <nav className={styles.nav}>
            <NavLink to="/books" className={linkClass}>
              Каталог
            </NavLink>
            <NavLink to="/favorites" className={linkClass}>
              Избранное{favCount > 0 && <span className={styles.count}>{favCount}</span>}
            </NavLink>
            <NavLink to="/profile" className={linkClass}>
              Кабинет
            </NavLink>
            {token ? (
              <button className={styles.logout} onClick={handleLogout}>
                Выйти, {username}
              </button>
            ) : (
              <NavLink to="/login" className={linkClass}>
                Войти
              </NavLink>
            )}
          </nav>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <div className={styles.inner}>Учебный проект по React, 2026</div>
      </footer>
    </div>
  );
}
