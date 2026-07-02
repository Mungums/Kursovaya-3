import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Auth.module.scss';
import { invoke } from '@tauri-apps/api/core';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await invoke('register_user', {
        input: {
          login: email,
          password,
          full_name: fullName,
          phone,
          email,
          role: 'Клиент',
        },
      });

      localStorage.setItem('token', 'mock-jwt');
      navigate('/');
    } catch (err) {
      console.error('Ошибка регистрации:', err);
      alert(`Ошибка: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>СПАРк</h1>
        <h2 className={styles.subtitle}>Регистрация</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="ФИО"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="email"
            placeholder="Email (будет использован как логин)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="tel"
            placeholder="Телефон"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        <p className={styles.footer}>
          Уже есть аккаунт? <a href="/login">Войти</a>
        </p>
      </div>
    </div>
  );
}