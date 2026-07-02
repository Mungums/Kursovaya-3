import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import styles from '../App.module.scss';

interface User {
  id: number;
  login: string;
  full_name: string;
  email: string | null;
  phone: string;
  role: string;
}

const currentUserRole = localStorage.getItem('user_role');
let availableRoles = ['Клиент', 'Мастер', 'Бухгалтер'];
if (currentUserRole === 'owner') {
  availableRoles = ['Клиент', 'Администратор', 'Мастер', 'Владелец', 'Бухгалтер'];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await invoke<User[]>('get_users');
      setUsers(data);
    } catch (e) {
      setError('Ошибка загрузки пользователей: ' + e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (updating) return;
    setUpdating(userId);
    try {
      await invoke('update_user_role', {
        input: {
          userId,
          roleName: newRole,
        },
      });
      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, role: newRole } : u
        )
      );
    } catch (e) {
      alert('Ошибка обновления роли: ' + e);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className={styles.section}>
      <div className={styles.whiteCard}>
        <h3 className={styles.cardTitle}>Управление пользователями</h3>
        <table className={styles.usersTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Логин</th>
              <th>ФИО</th>
              <th>Email</th>
              <th>Телефон</th>
              <th>Роль</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.login}</td>
                <td>{user.full_name}</td>
                <td>{user.email || '—'}</td>
                <td>{user.phone}</td>
                <td>{user.role}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={updating === user.id}
                  >
                    {availableRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}