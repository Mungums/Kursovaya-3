import styles from '../App.module.scss';

const appointments = [
  { time: '10:00', client: 'Мария Петрова', service: 'Антицеллюлитный массаж', room: 'Кабинет 1' },
  { time: '12:00', client: 'Анна Сидорова', service: 'Расслабляющий массаж', room: 'Кабинет 1' },
  { time: '14:30', client: 'Елена Козлова', service: 'Лимфодренажный массаж', room: 'Кабинет 1' },
];

export default function MasterPage() {
  return (
    <div className={styles.section}>
      <div className={styles.whiteCard}>
        <h3 className={styles.cardTitle}>Расписание на сегодня</h3>

        <div className={styles.scheduleList}>
          {appointments.map((app, idx) => (
            <div key={idx} className={styles.scheduleItem}>
              <div className={styles.scheduleText}>
                <p className={styles.scheduleTitle}>
                  {app.time} - {app.client}
                </p>
                <p className={styles.infoText}>{app.service}</p>
                <p className={styles.mutedText}>{app.room}</p>
              </div>
              <button className={styles.successButton}>Выполнено</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}