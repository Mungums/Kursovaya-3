import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../App.module.scss';
import { invoke } from '@tauri-apps/api/core';

interface Profile {
  user_id: number;
  login: string;
  full_name: string;
  email: string | null;
  phone: string;
  role: string;
  birth_date: string | null;
  medical_contraindications: string | null;
  discount_percent: number | null;
  card_number: string | null;
  position: string | null;
  hire_date: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await invoke<Profile>('get_profile', { userId: parseInt(userId) });
        setProfile(data);
        setEditForm(data);
        setError(null);
      } catch (err) {
        setError('Ошибка загрузки профиля: ' + err);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    try {
      const updatedFields: Partial<Profile> = {};
      if (editForm.full_name !== profile.full_name) updatedFields.full_name = editForm.full_name;
      if (editForm.email !== profile.email) updatedFields.email = editForm.email || null;
      if (editForm.phone !== profile.phone) updatedFields.phone = editForm.phone;
      if (editForm.medical_contraindications !== profile.medical_contraindications) {
        updatedFields.medical_contraindications = editForm.medical_contraindications || null;
      }
      if (editForm.birth_date !== profile.birth_date) {
        updatedFields.birth_date = editForm.birth_date || null;
      }

      if (Object.keys(updatedFields).length === 0) {
        setIsEditing(false);
        return;
      }

      await invoke<string>('update_profile', {
        userId: profile.user_id,
        input: {
          fullName: updatedFields.full_name,
          phone: updatedFields.phone,
          email: updatedFields.email,
          medicalContraindications: updatedFields.medical_contraindications,
          birthDate: updatedFields.birth_date,
        },
      });

      setProfile({ ...profile, ...updatedFields });
      setIsEditing(false);
      alert('Профиль обновлён');
    } catch (err) {
      alert('Ошибка обновления: ' + err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.section}>
        <div className={styles.whiteCard}>Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.section}>
        <div className={styles.whiteCard}>Ошибка: {error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.section}>
        <div className={styles.whiteCard}>Профиль не найден</div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <div className={styles.whiteCard}>
        <h3 className={styles.cardTitle}>Мой профиль</h3>
        {!isEditing ? (
          <div className={styles.profileInfo}>
            <p><strong>ФИО:</strong> {profile.full_name}</p>
            <p><strong>Email:</strong> {profile.email || '—'}</p>
            <p><strong>Телефон:</strong> {profile.phone}</p>
            <p><strong>Дата рождения:</strong> {profile.birth_date || '—'}</p>
            <p><strong>Противопоказания:</strong> {profile.medical_contraindications || '—'}</p>
            <p><strong>Роль:</strong> {profile.role}</p>
            {profile.discount_percent !== null && (
              <p><strong>Скидка:</strong> {profile.discount_percent}%</p>
            )}
            {profile.card_number && (
              <p><strong>Карта лояльности:</strong> {profile.card_number}</p>
            )}
            {profile.position && (
              <p><strong>Должность:</strong> {profile.position}</p>
            )}
            <button className={styles.primaryButton} onClick={() => setIsEditing(true)}>
              Редактировать
            </button>
          </div>
        ) : (
          <div className={styles.profileEdit}>
            <input
              name="full_name"
              placeholder="ФИО"
              value={editForm.full_name || ''}
              onChange={handleChange}
              className={styles.input}
            />
            <input
              name="email"
              placeholder="Email"
              value={editForm.email || ''}
              onChange={handleChange}
              className={styles.input}
            />
            <input
              name="phone"
              placeholder="Телефон"
              value={editForm.phone || ''}
              onChange={handleChange}
              className={styles.input}
            />
            <input
              name="birth_date"
              type="date"
              value={editForm.birth_date || ''}
              onChange={handleChange}
              className={styles.input}
            />
            <textarea
              name="medical_contraindications"
              placeholder="Противопоказания"
              value={editForm.medical_contraindications || ''}
              onChange={handleChange}
              className={styles.textarea}
            />
            <div className={styles.buttonRow}>
              <button className={styles.primaryButton} onClick={handleSave} disabled={saving}>
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button className={styles.secondaryButton} onClick={() => setIsEditing(false)}>
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}