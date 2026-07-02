import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { writeFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import { tempDir, join } from '@tauri-apps/api/path';
import styles from '../App.module.scss';

interface Appointment {
  id: number;
  service_name: string;
  master_name: string;
  start_time: string;
  end_time: string;
  status: string;
  price: number;
}

export default function MyBookingsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = Number(localStorage.getItem('user_id'));

  const fetchAppointments = async () => {
    try {
      const data = await invoke<Appointment[]>('get_client_appointments', {
        clientUserId: userId,
      });
      setAppointments(data);
    } catch (e) {
      setError('Ошибка загрузки записей: ' + e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const cancelAppointment = async (id: number) => {
    if (!confirm('Отменить запись?')) return;
    try {
      await invoke('cancel_appointment', { appointmentId: id });
      alert('Запись отменена');
      fetchAppointments();
    } catch (e) {
      alert('Ошибка отмены: ' + e);
    }
  };

  const handleReceipt = async (appointmentId: number) => {
    console.log('🔍 Запрос чека для ID:', appointmentId);
    try {
      const pdfBytes = await invoke<number[]>('generate_receipt', { appointmentId });
      console.log('📄 Получено байт:', pdfBytes.length);

      if (!pdfBytes || pdfBytes.length === 0) {
        throw new Error('PDF пуст');
      }

      const fileName = `чек_${appointmentId}.pdf`;

      await writeFile(fileName, new Uint8Array(pdfBytes), { baseDir: BaseDirectory.Temp });
      console.log('✅ Файл сохранён во временную папку');

      const dir = await tempDir();
      const fullPath = await join(dir, fileName);
      await invoke('open_file', { path: fullPath });
    } catch (e) {
      console.error('❌ Ошибка при формировании чека:', e);
      alert('Ошибка: ' + e);
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className={styles.section}>
      <div className={styles.whiteCard}>
        <h3 className={styles.cardTitle}>Мои записи</h3>
        {appointments.length === 0 ? (
          <p>У вас пока нет записей.</p>
        ) : (
          <div className={styles.appointmentsList}>
            {appointments.map((a) => (
              <div key={a.id} className={styles.appointmentItem}>
                <div>
                  <p><strong>{a.service_name}</strong></p>
                  <p>Мастер: {a.master_name}</p>
                  <p>Дата и время: {new Date(a.start_time).toLocaleString()}</p>
                  <p>Статус: {a.status === 'scheduled' ? 'Запланирована' : a.status}</p>
                  <p>Цена: {a.price} ₽</p>
                </div>
                <div className={styles.actions}>
                  {a.status === 'scheduled' && (
                    <button className={styles.secondaryButton} onClick={() => cancelAppointment(a.id)}>
                      Отменить
                    </button>
                  )}
                  {(a.status === 'scheduled' || a.status === 'completed') && (
                    <button className={styles.primaryButton} onClick={() => handleReceipt(a.id)}>
                      Посмотреть чек
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}