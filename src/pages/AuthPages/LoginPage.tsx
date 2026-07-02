import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Auth.module.scss';
import { invoke } from '@tauri-apps/api/core';

const roleMap: Record<string, string> = {
  'Клиент': 'client',
  'Администратор': 'admin',
  'Мастер': 'master',
  'Владелец': 'owner',
  'Бухгалтер': 'accountant',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await invoke<{ user_id: number; full_name: string; role: string }>('login_user', {
        input: {
          login: email,
          password,
        },
      });

      console.log('Вход выполнен:', result);

      const englishRole = roleMap[result.role] || 'client';

      localStorage.setItem('token', 'mock-jwt');
      localStorage.setItem('user_role', englishRole);
      localStorage.setItem('user_id', String(result.user_id));

      navigate('/');
    } catch (err) {
      console.error('Ошибка входа:', err);
      alert(`Ошибка: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>СПАРк</h1>
        <h2 className={styles.subtitle}>Вход в аккаунт</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Email (логин)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        <p className={styles.footer}>
          Нет аккаунта? <a href="/register">Зарегистрироваться</a>
        </p>
      </div>
    </div>
  );
}