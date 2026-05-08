import styles from '../App.module.scss';

export default function ClientPage() {
  return (
    <div className={styles.section}>
      <div className={styles.whiteCard}>
        <h3 className={styles.cardTitle}>Добро пожаловать, Анна!</h3>

        <div className={styles.twoColumns}>
          <div className={`${styles.infoCard} ${styles.infoBlue}`}>
            <h4 className={styles.infoHeading}>Ближайшая запись</h4>
            <p className={styles.infoText}>15 декабря, 14:00</p>
            <p className={styles.infoText}>Расслабляющий массаж</p>
            <p className={styles.infoText}>Мастер: Елена</p>
          </div>

          <div className={`${styles.infoCard} ${styles.infoOrange}`}>
            <h4 className={styles.infoHeading}>Активный абонемент</h4>
            <p className={styles.infoText}>Классический массаж</p>
            <p className={styles.infoText}>Осталось: 3 сеанса</p>
          </div>
        </div>

        <button className={styles.primaryButton}>Записаться онлайн</button>
      </div>
    </div>
  );
}