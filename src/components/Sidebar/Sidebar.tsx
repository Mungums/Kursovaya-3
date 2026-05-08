// src/components/Sidebar/Sidebar.tsx
import { Link, useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.scss';

type RoleKey = 'client' | 'admin' | 'master' | 'owner';

interface SidebarProps {
  activeRole: RoleKey;
  onRoleChange: (role: RoleKey) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ activeRole, onRoleChange, isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    onClose();
  };

  return (
    <>
      {/* Оверлей для мобильных устройств */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
        onClick={onClose}
      />

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.header}>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        {/* Переключатели ролей (для демонстрации, можно удалить) */}
        <div className={styles.roleGroup}>
          <button
            className={activeRole === 'client' ? styles.activeRole : ''}
            onClick={() => onRoleChange('client')}
          >
            Клиент
          </button>
          <button
            className={activeRole === 'admin' ? styles.activeRole : ''}
            onClick={() => onRoleChange('admin')}
          >
            Администратор
          </button>
          <button
            className={activeRole === 'master' ? styles.activeRole : ''}
            onClick={() => onRoleChange('master')}
          >
            Мастер
          </button>
          <button
            className={activeRole === 'owner' ? styles.activeRole : ''}
            onClick={() => onRoleChange('owner')}
          >
            Владелец
          </button>
        </div>

        <hr className={styles.divider} />

        <nav className={styles.nav}>
          {/* Ссылки для всех авторизованных пользователей */}
          <Link to="/profile" onClick={onClose}>Профиль</Link>
          <Link to="/booking/new" onClick={onClose}>Новая запись</Link>
          <Link to="/my-bookings" onClick={onClose}>Мои записи</Link>

          {/* Администраторские ссылки */}
          {activeRole === 'admin' && (
            <>
              <Link to="/admin/bookings" onClick={onClose}>Управление записями</Link>
              <Link to="/admin/users" onClick={onClose}>Пользователи</Link>
            </>
          )}

          {/* Ссылки для мастера */}
          {activeRole === 'master' && (
            <Link to="/master/schedule" onClick={onClose}>Моё расписание</Link>
          )}

          {/* Ссылки для владельца */}
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