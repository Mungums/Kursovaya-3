import { useState } from 'react';
import styles from './dashboard.module.scss';

type RoleKey = 'client' | 'admin' | 'master' | 'owner';

type Appointment = {
  time: string;
  client: string;
  service: string;
  room: string;
};

const appointments: Appointment[] = [
  {
    time: '10:00',
    client: 'Мария Петрова',
    service: 'Антицеллюлитный массаж',
    room: 'Кабинет 1',
  },
  {
    time: '12:00',
    client: 'Анна Сидорова',
    service: 'Расслабляющий массаж',
    room: 'Кабинет 1',
  },
  {
    time: '14:30',
    client: 'Елена Козлова',
    service: 'Лимфодренажный массаж',
    room: 'Кабинет 1',
  },
];

const roles: Record<
  RoleKey,
  {
    title: string;
    content: React.ReactNode;
  }
> = {
  client: {
    title: 'Личный кабинет',
    content: (
      <div className={styles.section}>
        <div className={styles.whiteCard}>
          <h3 className={styles.cardTitle}>Добро пожаловать, Анна!</h3>

          <div className={styles.twoColumns}>
            <div className={`${styles.infoCard} ${styles.infoBlue}`}>
              <h4 className={styles.infoHeading}>Ближайшая запись</h4>
              <p className={styles.infoText}>15 декабря, 14:00</p>
              <p className={styles.infoText}>Расслабляющий массаж</p>
              <p className={styles.infoText}>Мастер: Елена</p>
            </div>

            <div className={`${styles.infoCard} ${styles.infoOrange}`}>
              <h4 className={styles.infoHeading}>Активный абонемент</h4>
              <p className={styles.infoText}>Классический массаж</p>
              <p className={styles.infoText}>Осталось: 3 сеанса</p>
            </div>
          </div>

          <button className={styles.primaryButton}>Записаться онлайн</button>
        </div>
      </div>
    ),
  },

  admin: {
    title: 'Администрирование',
    content: (
      <div className={styles.section}>
        <div className={styles.whiteCard}>
          <h3 className={styles.cardTitle}>Календарь записей</h3>

          <div className={styles.threeColumns}>
            <div className={`${styles.infoCard} ${styles.infoGreen}`}>
              <h4 className={styles.infoHeading}>Сегодняшняя выручка</h4>
              <p className={styles.bigValue}>45,000 ₽</p>
              <p className={styles.infoText}>12 чеков</p>
            </div>

            <div className={`${styles.infoCard} ${styles.infoBlue}`}>
              <h4 className={styles.infoHeading}>Записей сегодня</h4>
              <p className={styles.bigValue}>18</p>
            </div>

            <div className={`${styles.infoCard} ${styles.infoOrange}`}>
              <h4 className={styles.infoHeading}>Свободных слотов</h4>
              <p className={styles.bigValue}>6</p>
            </div>
          </div>

          <div className={styles.buttonRow}>
            <button className={styles.primaryButton}>Новая запись</button>
            <button className={styles.secondaryButton}>Новый клиент</button>
          </div>
        </div>
      </div>
    ),
  },

  master: {
    title: 'Рабочее место мастера',
    content: (
      <div className={styles.section}>
        <div className={styles.whiteCard}>
          <h3 className={styles.cardTitle}>Расписание на сегодня</h3>

          <div className={styles.scheduleList}>
            {appointments.map((appointment) => (
              <div
                key={`${appointment.time}-${appointment.client}`}
                className={styles.scheduleItem}
              >
                <div className={styles.scheduleText}>
                  <p className={styles.scheduleTitle}>
                    {appointment.time} - {appointment.client}
                  </p>
                  <p className={styles.infoText}>{appointment.service}</p>
                  <p className={styles.mutedText}>{appointment.room}</p>
                </div>

                <button className={styles.successButton}>Выполнено</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },

  owner: {
    title: 'Панель владельца',
    content: (
      <div className={styles.section}>
        <div className={styles.whiteCard}>
          <h3 className={styles.cardTitle}>Аналитика</h3>

          <div className={styles.fourColumns}>
            <div className={`${styles.infoCard} ${styles.infoGreen}`}>
              <h4 className={styles.infoHeading}>Выручка за месяц</h4>
              <p className={styles.bigValue}>1,250,000 ₽</p>
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
              <p className={styles.bigValue}>3,200 ₽</p>
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
    ),
  },
};

export default function Dashboard() {
  const [activeRole, setActiveRole] = useState<RoleKey>('client');

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.logo}>СПАРк</h1>

          <div className={styles.profile}>
            <div className={styles.avatar} />
            <span className={styles.profileText}>Профиль</span>
          </div>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            {Object.entries(roles).map(([key, role]) => {
              const roleKey = key as RoleKey;
              const isActive = activeRole === roleKey;

              return (
                <button
                  key={roleKey}
                  onClick={() => setActiveRole(roleKey)}
                  className={`${styles.navButton} ${
                    isActive ? styles.navButtonActive : ''
                  }`}
                >
                  {role.title}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className={styles.main}>
          <div className={styles.container}>
            <h2 className={styles.pageTitle}>{roles[activeRole].title}</h2>
            {roles[activeRole].content}
          </div>
        </main>
      </div>
    </div>
  );
}