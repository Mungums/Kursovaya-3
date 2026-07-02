// src/router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import LoginPage from './pages/AuthPages/LoginPage';
import RegisterPage from './pages/AuthPages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import BookingForm from './pages/BookingForm';
import MyBookingsPage from './pages/MyBookingsPage';
import EditBookingForm from './pages/EditBookingForm';
import DashboardPage from './pages/DashboardPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminEditBookingForm from './pages/AdminEditBookingForm';
import MasterSchedulePage from './pages/MasterSchedulePage';
import OwnerAnalyticsPage from './pages/OwnerAnalyticsPage';
import OwnerSettingsPage from './pages/OwnerSettingsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import AdminUsersPage from './pages/AdminUsersPage';
// import AdminServicesPage from './pages/AdminServicesPage';
// import AdminMastersPage from './pages/AdminMastersPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'booking/new', element: <BookingForm /> },
      { path: 'my-bookings', element: <MyBookingsPage /> },
      { path: 'booking/:id/edit', element: <EditBookingForm /> },

      // Администратор
      {
        path: 'admin/bookings',
        element: (
          <RoleGuard allowedRoles={['admin', 'owner']}>
            <AdminBookingsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin/booking/:id/edit',
        element: (
          <RoleGuard allowedRoles={['admin', 'owner']}>
            <AdminEditBookingForm />
          </RoleGuard>
        ),
      },
      {
        path: 'admin/bookings',
        element: (
          <RoleGuard allowedRoles={['admin', 'owner']}>
            <AdminBookingsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <RoleGuard allowedRoles={['admin', 'owner']}>
            <AdminUsersPage />
          </RoleGuard>
        ),
      },
      // {
      //   path: 'admin/services',
      //   element: (
      //     <RoleGuard allowedRoles={['admin','owner']}>
      //       <AdminServicesPage></AdminServicesPage>
      //     </RoleGuard>
      //   )
      // },
      // {
      //   path: 'admin/masters',
      //   element: (
      //     <RoleGuard allowedRoles={['admin','owner']}>
      //       <AdminMastersPage></AdminMastersPage>
      //     </RoleGuard>
      //   )
      // },

      // Мастер
      {
        path: 'master/schedule',
        element: (
          <RoleGuard allowedRoles={['master', 'admin', 'owner']}>
            <MasterSchedulePage />
          </RoleGuard>
        ),
      },

      // Владелец
      {
        path: 'owner/analytics',
        element: (
          <RoleGuard allowedRoles={['owner']}>
            <OwnerAnalyticsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'owner/settings',
        element: (
          <RoleGuard allowedRoles={['owner']}>
            <OwnerSettingsPage />
          </RoleGuard>
        ),
      },

      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);