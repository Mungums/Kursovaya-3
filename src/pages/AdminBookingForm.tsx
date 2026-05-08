import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../App.module.scss';

const clients = [
  { id: 1, name: 'Анна Иванова' },
  { id: 2, name: 'Петр Петров' },
];
const services = [
  { id: 1, name: 'Расслабляющий массаж' },
  { id: 2, name: 'Антицеллюлитный массаж' },
];
const masters = [
  { id: 1, name: 'Елена Иванова' },
  { id: 2, name: 'Мария Смирнова' },
];

const statuses = ['Запланирована', 'Подтверждена', 'Выполнена', 'Отменена'];

export default function AdminEditBookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [clientId, setClientId] = useState(1);
  const [serviceId, setServiceId] = useState(1);
  const [masterId, setMasterId] = useState(1);
  const [date, setDate] = useState('2026-05-15');
  const [time, setTime] = useState('14:00');
  const [status, setStatus] = useState('Запланирована');
  const [comment, setComment] = useState('');

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Запись ${id} обновлена администратором`);
    navigate('/admin');
  };

  return (
    <div className={styles.section}>
      <div className={styles.whiteCard}>
        <h3 className={styles.cardTitle}>Редактирование записи #{id} (администратор)</h3>
        <form onSubmit={handleUpdate} className={styles.bookingForm}>
          <label>Клиент</label>
          <select value={clientId} onChange={(e) => setClientId(Number(e.target.value))}>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <label>Услуга</label>
          <select value={serviceId} onChange={(e) => setServiceId(Number(e.target.value))}>
            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <label>Мастер</label>
          <select value={masterId} onChange={(e) => setMasterId(Number(e.target.value))}>
            {masters.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>

          <label>Дата</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

          <label>Время</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />

          <label>Статус</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {statuses.map(s => <option key={s}>{s}</option>)}
          </select>

          <label>Комментарий</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className={styles.textarea} />

          <div className={styles.buttonRow}>
            <button type="submit" className={styles.primaryButton}>Сохранить изменения</button>
            <button type="button" className={styles.secondaryButton} onClick={() => navigate('/admin')}>Назад</button>
          </div>
        </form>
      </div>
    </div>
  );
}