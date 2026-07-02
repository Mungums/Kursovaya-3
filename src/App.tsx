import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import styles from './App.module.scss';

type RoleKey = 'client' | 'admin' | 'master' | 'owner';

export default function App() {
  const [activeRole, setActiveRole] = useState<RoleKey>('client');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem('user_role') as RoleKey | null;
    if (savedRole && ['client', 'admin', 'master', 'owner'].includes(savedRole)) {
      setActiveRole(savedRole);
    }
  }, []);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className={styles.app}>
      <Header onMenuClick={openSidebar} />
      <div className={styles.layout}>
        <Sidebar
          activeRole={activeRole}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />
        <main className={styles.content}>
          <div className={styles.container}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}