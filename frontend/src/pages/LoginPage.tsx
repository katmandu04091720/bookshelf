import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { getErrorMessage } from '../api/client';
import { useAuthStore } from '../store/authStore';
import type { LoginRequest } from '../types/api';
import styles from './Page.module.css';

type FormErrors = Partial<Record<keyof LoginRequest, string>>;
type SubmitState = { status: 'idle' } | { status: 'loading' } | { status: 'error'; error: string };
interface LocationState {
  from?: string;
}

function validate(v: LoginRequest): FormErrors {
  const errors: FormErrors = {};
  if (!v.username.trim()) errors.username = 'Введите логин';
  else if (v.username.trim().length < 3) errors.username = 'Минимум 3 символа';
  if (!v.password) errors.password = 'Введите пароль';
  else if (v.password.length < 6) errors.password = 'Минимум 6 символов';
  return errors;
}

export default function LoginPage() {
  const token = useAuthStore((s) => s.token);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const from = (useLocation().state as LocationState | null)?.from ?? '/profile';

  const [values, setValues] = useState<LoginRequest>({ username: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submit, setSubmit] = useState<SubmitState>({ status: 'idle' });

  if (token) return <Navigate to={from} replace />;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmit({ status: 'loading' });
    try {
      const data = { username: values.username.trim(), password: values.password };
      const { access_token } = await authApi.login(data);
      login(access_token, data.username);
      navigate(from, { replace: true });
    } catch (err) {
      setSubmit({ status: 'error', error: getErrorMessage(err) });
    }
  };

  const inputClass = (field: keyof LoginRequest) => (errors[field] ? styles.inputError : undefined);

  return (
    <div className={styles.panel}>
      <h1 className={styles.title}>Вход</h1>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="username">Логин</label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            value={values.username}
            onChange={handleChange}
            className={inputClass('username')}
          />
          {errors.username && <span className={styles.fieldError}>{errors.username}</span>}
        </div>
        <div className={styles.field}>
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={handleChange}
            className={inputClass('password')}
          />
          {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
        </div>

        {submit.status === 'error' && <div className={styles.formError}>{submit.error}</div>}

        <button className={styles.button} type="submit" disabled={submit.status === 'loading'}>
          {submit.status === 'loading' ? 'Входим…' : 'Войти'}
        </button>
        <p className={styles.hint}>
          Тестовый пользователь: <b>student</b> / <b>ithub2026</b>
        </p>
      </form>
    </div>
  );
}
