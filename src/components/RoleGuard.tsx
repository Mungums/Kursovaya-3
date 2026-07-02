// src/components/RoleGuard.tsx
import { Navigate } from 'react-router-dom';

type RoleKey = 'client' | 'admin' | 'master' | 'owner';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: RoleKey[];
  redirectTo?: string;
}

export default function RoleGuard({ children, allowedRoles, redirectTo = '/dashboard' }: RoleGuardProps) {
  const role = localStorage.getItem('user_role') as RoleKey | null;

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}