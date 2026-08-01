import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, ShoppingBag, Tag, Info, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading';
import { ListItemSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/store/toast';
import { useAuthStore } from '@/store/auth';
import { markAllNotificationsAsReadForUser, subscribeToNotifications } from '@/services/firebase/notifications';
import type { Notification } from '@/types';

const typeIcons = {
  order: ShoppingBag,
  promo: Tag,
  system: Info,
};

const typeColors = {
  order: 'bg-primary/10 text-primary',
  promo: 'bg-gold/10 text-gold',
  system: 'bg-blue-50 text-blue-500 dark:bg-blue-900/20',
};

export default function NotificationsPage() {
  const loading = useSimulatedLoading(600);
  const addToast = useToastStore((s) => s.addToast);
  const user = useAuthStore((s) => s.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }

    const unsubscribe = subscribeToNotifications(user.id, setNotifications);
    return unsubscribe;
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div>
        <PageHeader title="Bildirimler" showBack />
        <div className="px-5 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Bildirimler"
        subtitle={unreadCount > 0 ? `${unreadCount} okunmamış` : 'Tümü okundu'}
        showBack
        rightAction={
          unreadCount > 0 ? (
            <button
              onClick={async () => {
                if (!user?.id) return;
                await markAllNotificationsAsReadForUser(user.id);
                addToast('Tüm bildirimler okundu olarak işaretlendi', 'info');
              }}
              className="text-xs text-primary font-medium"
            >
              Tümünü Oku
            </button>
          ) : undefined
        }
      />

      <div className="px-5 mb-3">
        <div className="flex items-center gap-2 rounded-2xl bg-primary/5 px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
          <Sparkles className="h-4 w-4 text-primary" />
          Sipariş takibi, kampanyalar ve güncel operasyon bilgileri burada görünür.
        </div>
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="Bildirim yok" description="Yeni bildirimler burada görünecek." />
      ) : (
        <div className="px-5 space-y-3 pb-4">
          {notifications.map((notif, i) => {
            const Icon = typeIcons[notif.type];
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className={cn('flex gap-4', !notif.read && 'border-l-4 border-l-primary')}>
                  <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl shrink-0', typeColors[notif.type])}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('font-semibold text-sm', !notif.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400')}>
                        {notif.title}
                      </p>
                      {!notif.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{formatRelativeTime(notif.createdAt)}</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
