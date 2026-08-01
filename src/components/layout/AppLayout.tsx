import { Outlet, Navigate } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { useAuthStore } from '@/store/auth';

export function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark">
      <div className="mx-auto max-w-lg min-h-screen pb-28">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
