import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Заглушка проверки авторизации.
// В реальном приложении здесь должен быть вызов команды Tauri, проверка токена в localStorage или контексте.
const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};