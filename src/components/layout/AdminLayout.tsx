import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Wallet,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Leaf,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useNavigate } from 'react-router-dom';

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/orders', icon: ClipboardList, label: 'Siparişler' },
  { to: '/admin/customers', icon: Users, label: 'Müşteriler' },
  { to: '/admin/balance', icon: Wallet, label: 'Marka Yükle' },
  { to: '/admin/products', icon: Package, label: 'Ürünler' },
  { to: '/admin/reports', icon: BarChart3, label: 'Raporlar' },
  { to: '/admin/settings', icon: Settings, label: 'Ayarlar' },
];

export function AdminLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/home" replace />;

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark flex">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-primary text-white p-6 shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Çay Ocağı</h1>
            <p className="text-xs text-white/60">Yönetim Paneli</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {adminNav.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}>
              {({ isActive }) => (
                <div
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors',
                    isActive ? 'bg-white/20 font-semibold' : 'hover:bg-white/10',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors mt-4"
        >
          <LogOut className="h-5 w-5" />
          Çıkış Yap
        </button>
      </aside>

      {/* Mobile header + bottom nav */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-5 py-4 bg-primary text-white">
          <button onClick={() => navigate('/home')} className="p-2 rounded-xl hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            <span className="font-bold">Çay Ocağı Admin</span>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-8 overflow-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Outlet />
          </motion.div>
        </main>

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#22262e] border-t border-gray-100 dark:border-white/5 px-2 py-2 flex justify-around">
          {adminNav.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} className="flex-1">
              {({ isActive }) => (
                <div className="flex flex-col items-center py-2">
                  <Icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-gray-400')} />
                  <span className={cn('text-[10px] mt-0.5', isActive ? 'text-primary font-medium' : 'text-gray-400')}>
                    {label}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="lg:hidden h-16" />
      </div>
    </div>
  );
}
