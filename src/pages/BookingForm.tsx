import { useState } from 'react';
import styles from '../App.module.scss';

const services = [
  { id: 1, name: 'Расслабляющий массаж', duration: 60, price: 2500 },
  { id: 2, name: 'Антицеллюлитный массаж', duration: 60, price: 2800 },
  { id: 3, name: 'Лимфодренажный массаж', duration: 45, price: 2200 },
];

const masters = [
  { id: 1, name: 'Елена Иванова' },
  { id: 2, name: 'Мария Смирнова' },
];

export default function BookingForm() {
  const [selectedService, setSelectedService] = useState('');
  const [selectedMaster, setSelectedMaster] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет вызов Rust-команды для создания записи
    alert('Запись создана (mock)');
  };

  return (
    <div className={styles.section}>
      <div className={styles.whiteCard}>
        <h3 className={styles.cardTitle}>Запись на услугу</h3>
        <form onSubmit={handleSubmit} className={styles.bookingForm}>
          <label>Услуга</label>
          <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} required>
            <option value="">Выберите услугу</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name} – {s.price} ₽</option>)}
          </select>

          <label>Мастер</label>
          <select value={selectedMaster} onChange={(e) => setSelectedMaster(e.target.value)} required>
            <option value="">Выберите мастера</option>
            {masters.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>

          <label>Дата</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

          <label>Время</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />

          <div className={styles.buttonRow}>
            <button type="submit" className={styles.primaryButton}>Записаться</button>
          </div>
        </form>
      </div>
    </div>
  );
}