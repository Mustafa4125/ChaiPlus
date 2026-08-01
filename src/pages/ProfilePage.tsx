import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet,
  Heart,
  Bell,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/auth';
import { useThemeStore } from '@/store/theme';
import { useToastStore } from '@/store/toast';
import { cn } from '@/lib/utils';

const menuItems = [
  { to: '/brand-balance', icon: Wallet, label: 'Marka Bakiyesi', desc: 'Marka ve işlemler' },
  { to: '/favorites', icon: Heart, label: 'Favori Siparişler', desc: 'Hızlı sipariş' },
  { to: '/notifications', icon: Bell, label: 'Bildirimler', desc: 'Sipariş ve kampanyalar' },
];

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggle } = useThemeStore();
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    addToast('Çıkış yapıldı', 'info');
    navigate('/login');
  };

  return (
    <div className="pb-8">
      <PageHeader title="Profil" />

      <div className="px-5 space-y-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card glass className="flex items-center gap-4">
            <img src={user?.avatar} alt={user?.name} className="h-16 w-16 rounded-2xl object-cover" />
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </Card>
        </motion.div>

        <div className="space-y-2">
          {menuItems.map(({ to, icon: Icon, label, desc }, i) => (
            <motion.button
              key={to}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(to)}
              className="w-full flex items-center gap-4 p-4 rounded-3xl bg-white dark:bg-[#22262e] shadow-soft hover:shadow-soft-lg transition-all"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </motion.button>
          ))}
        </div>

        <Card>
          <button onClick={toggle} className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-gold" />}
              <span className="font-medium text-sm">Karanlık Mod</span>
            </div>
            <div
              className={cn(
                'relative h-7 w-12 rounded-full transition-colors',
                theme === 'dark' ? 'bg-primary' : 'bg-gray-200',
              )}
            >
              <motion.div
                layout
                className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow"
                animate={{ left: theme === 'dark' ? '22px' : '2px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
          </button>
        </Card>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 text-red-500 font-medium text-sm"
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}
