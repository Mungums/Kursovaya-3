import styles from '../App.module.scss';

export default function OwnerSettingsPage() {
  return (
    <div className={styles.section}>
      <div className={styles.whiteCard}>
        <h3 className={styles.cardTitle}>Настройки системы</h3>
        <p>Здесь будут настройки салона: реквизиты, проценты мастеров, интеграции и т.д.</p>
      </div>
    </div>
  );
}