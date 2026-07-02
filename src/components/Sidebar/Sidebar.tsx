// src/components/Sidebar/Sidebar.tsx
import { Link, useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.scss';

type RoleKey = 'client' | 'admin' | 'master' | 'owner';

interface SidebarProps {
  activeRole: RoleKey;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ activeRole, isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
    navigate('/login');
    onClose();
  };

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
        onClick={onClose}
      />
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.header}>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <nav className={styles.nav}>
          <Link to="/dashboard" onClick={onClose}>Главная</Link>
          <Link to="/profile" onClick={onClose}>Профиль</Link>
          <Link to="/booking/new" onClick={onClose}>Новая запись</Link>
          <Link to="/my-bookings" onClick={onClose}>Мои записи</Link>

          {activeRole === 'admin' && (
            <>
              <Link to="/admin/bookings" onClick={onClose}>Управление записями</Link>
              <Link to="/admin/users" onClick={onClose}>Пользователи</Link>
              <Link to="/admin/services" onClick={onClose}>Услуги</Link>
              <Link to="/admin/masters" onClick={onClose}>Мастера</Link>
            </>
          )}

          {activeRole === 'master' && (
            <Link to="/master/schedule" onClick={onClose}>Моё расписание</Link>
          )}

          {activeRole === 'owner' && (
            <>
              <Link to="/owner/analytics" onClick={onClose}>Аналитика</Link>
              <Link to="/owner/settings" onClick={onClose}>Настройки</Link>
            </>
          )}

          <button onClick={handleLogout} className={styles.logoutButton}>
            Выйти
          </button>
        </nav>
      </aside>
    </>
  );
}