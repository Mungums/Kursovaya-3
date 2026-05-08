// components/Header/Header.tsx
import styles from './Header.module.scss';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <button className={styles.burger} onClick={onMenuClick}>
            ☰
          </button>
          <h1 className={styles.logo}>СПАРк</h1>
        </div>
        <div className={styles.profile}>
          <div className={styles.avatar} />
          <span className={styles.profileText}>Профиль</span>
        </div>
      </div>
    </header>
  );
}