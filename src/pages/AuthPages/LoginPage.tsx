import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Auth.module.scss';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет вызов Rust-команды для проверки логина
    // Пока имитируем успешный вход
    if (email && password) {
      localStorage.setItem('token', 'mock-jwt');
      navigate('/');
    } else {
      alert('Введите email и пароль');
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
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className={styles.button}>Войти</button>
        </form>
        <p className={styles.footer}>
          Нет аккаунта? <a href="/register">Зарегистрироваться</a>
        </p>
      </div>
    </div>
  );
}