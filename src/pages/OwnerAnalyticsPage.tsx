import styles from '../App.module.scss';

export default function OwnerAnalyticsPage() {
  return (
    <div className={styles.section}>
      <div className={styles.whiteCard}>
        <h3 className={styles.cardTitle}>Аналитика</h3>

        <div className={styles.fourColumns}>
          <div className={`${styles.infoCard} ${styles.infoGreen}`}>
            <h4 className={styles.infoHeading}>Выручка за месяц</h4>
            <p className={styles.bigValue}>1 250 000 ₽</p>
          </div>
          <div className={`${styles.infoCard} ${styles.infoBlue}`}>
            <h4 className={styles.infoHeading}>Новые клиенты</h4>
            <p className={styles.bigValue}>47</p>
          </div>
          <div className={`${styles.infoCard} ${styles.infoOrange}`}>
            <h4 className={styles.infoHeading}>Загрузка мастеров</h4>
            <p className={styles.bigValue}>85%</p>
          </div>
          <div className={`${styles.infoCard} ${styles.infoPurple}`}>
            <h4 className={styles.infoHeading}>Средний чек</h4>
            <p className={styles.bigValue}>3 200 ₽</p>
          </div>
        </div>

        <div className={styles.bottomGrid}>
          <div>
            <h4 className={styles.subTitle}>Топ услуги</h4>
            <div className={styles.list}>
              <div className={styles.listItem}>
                <span>Расслабляющий массаж</span>
                <span className={styles.boldText}>156 записей</span>
              </div>
              <div className={styles.listItem}>
                <span>Антицеллюлитный массаж</span>
                <span className={styles.boldText}>98 записей</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className={styles.subTitle}>Рейтинг мастеров</h4>
            <div className={styles.list}>
              <div className={styles.listItem}>
                <span>Елена Иванова</span>
                <span className={styles.boldText}>92% загрузка</span>
              </div>
              <div className={styles.listItem}>
                <span>Мария Смирнова</span>
                <span className={styles.boldText}>87% загрузка</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}