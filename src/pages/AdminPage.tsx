import styles from '../App.module.scss';

export default function AdminPage() {
  return (
    <div className={styles.section}>
      <div className={styles.whiteCard}>
        <h3 className={styles.cardTitle}>Календарь записей</h3>

        <div className={styles.threeColumns}>
          <div className={`${styles.infoCard} ${styles.infoGreen}`}>
            <h4 className={styles.infoHeading}>Сегодняшняя выручка</h4>
            <p className={styles.bigValue}>45 000 ₽</p>
            <p className={styles.infoText}>12 чеков</p>
          </div>

          <div className={`${styles.infoCard} ${styles.infoBlue}`}>
            <h4 className={styles.infoHeading}>Записей сегодня</h4>
            <p className={styles.bigValue}>18</p>
          </div>

          <div className={`${styles.infoCard} ${styles.infoOrange}`}>
            <h4 className={styles.infoHeading}>Свободных слотов</h4>
            <p className={styles.bigValue}>6</p>
          </div>
        </div>

        <div className={styles.buttonRow}>
          <button className={styles.primaryButton}>Новая запись</button>
          <button className={styles.secondaryButton}>Новый клиент</button>
        </div>
      </div>
    </div>
  );
}