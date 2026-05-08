import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Auth.module.scss';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Имитация регистрации
    if (fullName && email && phone && password) {
      localStorage.setItem('token', 'mock-jwt');
      navigate('/');
    } else {
      alert('Заполните все поля');
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
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
          <input
            type="tel"
            placeholder="Телефон"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className={styles.button}>Зарегистрироваться</button>
        </form>
        <p className={styles.footer}>
          Уже есть аккаунт? <a href="/login">Войти</a>
        </p>
      </div>
    </div>
  );
}