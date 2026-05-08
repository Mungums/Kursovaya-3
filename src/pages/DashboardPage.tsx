// src/pages/DashboardPage.tsx
import styles from '../App.module.scss';

export default function DashboardPage() {
  // Здесь позже будут реальные данные из Rust (invoke)
  const stats = {
    todayRevenue: 45000,
    todayAppointments: 18,
    freeSlots: 6,
    weeklyGrowth: '+12%',
  };

  return (
    <div className={styles.section}>
      <div className={styles.whiteCard}>
        <h3 className={styles.cardTitle}>Добро пожаловать в СПАРк</h3>
        <p className={styles.cardDescription}>
          Здесь вы можете управлять записями, клиентами, расписанием и получать аналитику.
          Используйте меню для навигации.
        </p>

        {/* Быстрая статистика (пример для администратора/владельца) */}
        <div className={styles.threeColumns}>
          <div className={`${styles.infoCard} ${styles.infoGreen}`}>
            <h4 className={styles.infoHeading}>Выручка сегодня</h4>
            <p className={styles.bigValue}>{stats.todayRevenue.toLocaleString()} ₽</p>
          </div>
          <div className={`${styles.infoCard} ${styles.infoBlue}`}>
            <h4 className={styles.infoHeading}>Записей сегодня</h4>
            <p className={styles.bigValue}>{stats.todayAppointments}</p>
          </div>
          <div className={`${styles.infoCard} ${styles.infoOrange}`}>
            <h4 className={styles.infoHeading}>Свободных слотов</h4>
            <p className={styles.bigValue}>{stats.freeSlots}</p>
          </div>
        </div>

        {/* Здесь может быть дополнительная информация, графики, ссылки */}
        <div className={styles.buttonRow}>
          <button className={styles.primaryButton} onClick={() => window.location.href = '/booking/new'}>
            + Новая запись
          </button>
          <button className={styles.secondaryButton} onClick={() => window.location.href = '/my-bookings'}>
            Мои записи
          </button>
        </div>
      </div>
    </div>
  );
}