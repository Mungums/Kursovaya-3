// src/App.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import styles from './App.module.scss';

// Роли пользователя (определяются после логина)
type RoleKey = 'client' | 'admin' | 'master' | 'owner';

export default function App() {
  // В реальном приложении роль берётся из контекста / стора
  const [activeRole, setActiveRole] = useState<RoleKey>('client');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleRoleChange = (role: RoleKey) => {
    setActiveRole(role);
  };

  return (
    <div className={styles.app}>
      <Header onMenuClick={openSidebar} />
      <div className={styles.layout}>
        <Sidebar
          activeRole={activeRole}
          onRoleChange={handleRoleChange}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />
        <main className={styles.content}>
          <div className={styles.container}>
            <Outlet />   {/* Здесь будут рендериться все дочерние маршруты */}
          </div>
        </main>
      </div>
    </div>
  );
}