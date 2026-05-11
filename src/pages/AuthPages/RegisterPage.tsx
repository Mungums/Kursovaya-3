import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Auth.module.scss';
import { invoke } from '@tauri-apps/api/core';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();



  useEffect(() => {
    handleRegister();
  })

// Где-то в обработчике отправки формы:
const handleRegister = async () => {
  try {
    const userId = await invoke('create_client', {
      login: 'test',
      password: '123',
      full_name: 'Test User',
      phone: '+79991234567',
      email: null
    });
    console.log('Создан пользователь с id:', userId);
    // редирект на дашборд
  } catch (err) {
    console.error('Ошибка регистрации:', err);
  }
};

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