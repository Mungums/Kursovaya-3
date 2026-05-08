import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../App.module.scss';

// Моковые данные записи (по id)
const mockBooking = {
  id: 1,
  service: 'Расслабляющий массаж',
  master: 'Елена Иванова',
  date: '2026-05-15',
  time: '14:00',
};

export default function EditBookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [date, setDate] = useState(mockBooking.date);
  const [time, setTime] = useState(mockBooking.time);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Вызов Rust-команды для обновления
    alert(`Запись ${id} обновлена на ${date} ${time}`);
    navigate('/');
  };

  const handleCancel = () => {
    // Вызов отмены записи
    alert(`Запись ${id} отменена`);
    navigate('/');
  };

  return (
    <div className={styles.section}>
      <div className={styles.whiteCard}>
        <h3 className={styles.cardTitle}>Редактирование записи #{id}</h3>
        <form onSubmit={handleUpdate} className={styles.bookingForm}>
          <label>Услуга</label>
          <input type="text" value={mockBooking.service} disabled />
          <label>Мастер</label>
          <input type="text" value={mockBooking.master} disabled />
          <label>Дата</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <label>Время</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          <div className={styles.buttonRow}>
            <button type="submit" className={styles.primaryButton}>Сохранить</button>
            <button type="button" className={styles.secondaryButton} onClick={handleCancel}>Отменить запись</button>
          </div>
        </form>
      </div>
    </div>
  );
}