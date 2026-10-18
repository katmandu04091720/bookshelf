import { useCallback, useEffect, useState } from 'react';
import type { AsyncState } from '../types/async';
import { getErrorMessage } from '../api/client';

/**
 * Выполняет асинхронную функцию и отдаёт состояние loading/error/success.
 * deps: когда перезапускать запрос (как у useEffect).
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false; // защита от гонки, если deps сменились до ответа
    setState({ status: 'loading' });
    fn()
      .then((data) => !cancelled && setState({ status: 'success', data }))
      .catch((e: unknown) => !cancelled && setState({ status: 'error', error: getErrorMessage(e) }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  return { state, reload };
}
