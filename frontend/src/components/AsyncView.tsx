import type { ReactNode } from 'react';
import type { AsyncState } from '../types/async';
import styles from './AsyncView.module.css';

interface AsyncViewProps<T> {
  state: AsyncState<T>;
  onRetry?: () => void;
  children: (data: T) => ReactNode;
}

/** Единая отрисовка трёх состояний запроса: loading / error / success */
export default function AsyncView<T>({ state, onRetry, children }: AsyncViewProps<T>) {
  switch (state.status) {
    case 'loading':
      return (
        <p className={styles.loading} aria-live="polite">
          Загружаем…
        </p>
      );
    case 'error':
      return (
        <div className={styles.error} role="alert">
          <p className={styles.errorText}>{state.error}</p>
          {onRetry && (
            <button className={styles.retry} onClick={onRetry}>
              Попробовать снова
            </button>
          )}
        </div>
      );
    case 'success':
      return <>{children(state.data)}</>;
  }
}
