import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, ClipboardList, User, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cart';

const navItems = [
  { to: '/home', icon: Home, label: 'Ana Sayfa' },
  { to: '/products', icon: ShoppingBag, label: 'Ürünler' },
  { to: '/cart', icon: ShoppingCart, label: 'Sepet' },
  { to: '/orders', icon: ClipboardList, label: 'Siparişler' },
  { to: '/profile', icon: User, label: 'Profil' },
];

export function BottomNav() {
  const itemCount = useCartStore((s) => s.getItemCount());

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-auto max-w-lg px-4 pb-4">
        <div className="flex items-center justify-around rounded-3xl bg-white/90 dark:bg-[#22262e]/90 backdrop-blur-xl shadow-soft-lg border border-white/20 dark:border-white/5 px-2 py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className="relative flex-1">
              {({ isActive }) => (
                <div className="flex flex-col items-center gap-0.5 py-2">
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-1 rounded-2xl bg-primary/10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10">
                    <Icon className={cn('h-5 w-5 transition-colors', isActive ? 'text-primary' : 'text-gray-400')} />
                    {to === '/cart' && itemCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white">
                        {itemCount}
                      </span>
                    )}
                  </div>
                  <span className={cn('relative z-10 text-[10px] font-medium', isActive ? 'text-primary' : 'text-gray-400')}>
                    {label}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
