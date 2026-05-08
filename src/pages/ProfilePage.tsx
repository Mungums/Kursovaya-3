import { useState } from 'react';
import styles from '../App.module.scss';

export default function ProfilePage() {
  // Моковые данные пользователя
  const [user, setUser] = useState({
    fullName: 'Анна Иванова',
    email: 'anna@example.com',
    phone: '+7 912 345 67 89',
    birthDate: '1990-05-15',
    contraindications: 'Аллергия на масло чайного дерева',
    preferences: 'Предпочитает утренние часы, мастер Елена',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(user);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Здесь будет вызов Rust-команды для обновления профиля
    setUser(editForm);
    setIsEditing(false);
  };

  return (
    <div className={styles.section}>
      <div className={styles.whiteCard}>
        <h3 className={styles.cardTitle}>Мой профиль</h3>
        {!isEditing ? (
          <div className={styles.profileInfo}>
            <p><strong>ФИО:</strong> {user.fullName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Телефон:</strong> {user.phone}</p>
            <p><strong>Дата рождения:</strong> {user.birthDate || '—'}</p>
            <p><strong>Противопоказания:</strong> {user.contraindications || '—'}</p>
            <p><strong>Предпочтения:</strong> {user.preferences || '—'}</p>
            <button className={styles.primaryButton} onClick={() => setIsEditing(true)}>
              Редактировать
            </button>
          </div>
        ) : (
          <div className={styles.profileEdit}>
            <input name="fullName" placeholder="ФИО" value={editForm.fullName} onChange={handleChange} className={styles.input} />
            <input name="email" placeholder="Email" value={editForm.email} onChange={handleChange} className={styles.input} />
            <input name="phone" placeholder="Телефон" value={editForm.phone} onChange={handleChange} className={styles.input} />
            <input name="birthDate" type="date" value={editForm.birthDate} onChange={handleChange} className={styles.input} />
            <textarea name="contraindications" placeholder="Противопоказания" value={editForm.contraindications} onChange={handleChange} className={styles.textarea} />
            <textarea name="preferences" placeholder="Предпочтения" value={editForm.preferences} onChange={handleChange} className={styles.textarea} />
            <div className={styles.buttonRow}>
              <button className={styles.primaryButton} onClick={handleSave}>Сохранить</button>
              <button className={styles.secondaryButton} onClick={() => setIsEditing(false)}>Отмена</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}