import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import styles from '../App.module.scss';

interface Service {
  id: number;
  name: string;
  duration_minutes: number;
  price: number;
}

interface Master {
  id: number;
  full_name: string;
  specialization: string | null;
  rating: number | null;
}

export default function BookingForm() {
  const [services, setServices] = useState<Service[]>([]);
  const [masters, setMasters] = useState<Master[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedMaster, setSelectedMaster] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await invoke<Service[]>('get_services');
        setServices(data);
      } catch (e) {
        setError('Ошибка загрузки услуг: ' + e);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (!selectedService) {
      setMasters([]);
      setSelectedMaster('');
      return;
    }

    const fetchMasters = async () => {
      try {
        const data = await invoke<Master[]>('get_masters_for_service', {
          serviceId: Number(selectedService),
        });
        setMasters(data);
        setSelectedMaster('');
      } catch (e) {
        setError('Ошибка загрузки мастеров: ' + e);
      }
    };
    fetchMasters();
  }, [selectedService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedMaster || !date || !time) {
      alert('Заполните все поля');
      return;
    }

    setLoading(true);
    try {
      const start = new Date(`${date}T${time}`);
      const service = services.find(s => s.id === Number(selectedService));
      const end = new Date(start.getTime() + (service?.duration_minutes || 60) * 60000);

      const result = await invoke('create_appointment', {
        input: {
          client_user_id: Number(localStorage.getItem('user_id')),
          master_id: Number(selectedMaster),
          service_id: Number(selectedService),
          room_id: 1,
          start_time: start.toISOString().slice(0, 19),
          end_time: end.toISOString().slice(0, 19),
          comment: '',
          use_abonement: false,
        },
      });
      alert('Запись создана! ID: ' + result);
      setSelectedService('');
      setSelectedMaster('');
      setDate('');
      setTime('');
    } catch (err) {
      alert('Ошибка: ' + err);
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className={styles.section}>
      <div className={styles.whiteCard}>
        <h3 className={styles.cardTitle}>Запись на услугу</h3>
        <form onSubmit={handleSubmit} className={styles.bookingForm}>
          <label>Услуга</label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            required
          >
            <option value="">Выберите услугу</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} – {s.price}₽ ({s.duration_minutes} мин)
              </option>
            ))}
          </select>

          <label>Мастер</label>
          <select
            value={selectedMaster}
            onChange={(e) => setSelectedMaster(e.target.value)}
            required
            disabled={!selectedService}
          >
            <option value="">{selectedService ? 'Выберите мастера' : 'Сначала выберите услугу'}</option>
            {masters.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name} {m.rating ? `⭐ ${m.rating}` : ''}
              </option>
            ))}
          </select>

          <label>Дата</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

          <label>Время</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />

          <div className={styles.buttonRow}>
            <button type="submit" className={styles.primaryButton} disabled={loading}>
              {loading ? 'Запись...' : 'Записаться'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}