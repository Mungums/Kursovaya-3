// src/router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import LoginPage from './pages/AuthPages/LoginPage';
import RegisterPage from './pages/AuthPages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import BookingForm from './pages/BookingForm';
import MyBookingsPage from './pages/MyBookingsPage';
import EditBookingForm from './pages/EditBookingForm';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminEditBookingForm from './pages/AdminEditBookingForm';
import MasterSchedulePage from './pages/MasterSchedulePage';
import OwnerAnalyticsPage from './pages/OwnerAnalyticsPage';
import OwnerSettingsPage from './pages/OwnerSettingsPage';
import DashboardPage from './pages/DashboardPage';
import { ProtectedRoute } from './components/ProtectedRoute';

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
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'booking/new',
        element: <BookingForm />,
      },
      {
        path: 'my-bookings',
        element: <MyBookingsPage />,
      },
      {
        path: 'booking/:id/edit',
        element: <EditBookingForm />,
      },
      {
        path: 'admin/bookings',
        element: <AdminBookingsPage />,
      },
      {
        path: 'admin/booking/:id/edit',
        element: <AdminEditBookingForm />,
      },
      {
        path: 'master/schedule',
        element: <MasterSchedulePage />,
      },
      {
        path: 'owner/analytics',
        element: <OwnerAnalyticsPage />,
      },
      {
        path: 'owner/settings',
        element: <OwnerSettingsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);