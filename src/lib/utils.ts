import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('tr-TR')} Marka`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function calcItemPrice(
  basePrice: number,
  size: string,
  extrasCount: number,
  sizeModifier: Record<string, number>,
  extraUnitPrice: number,
): number {
  return basePrice + (sizeModifier[size] ?? 0) + extrasCount * extraUnitPrice;
}

export const orderStatusLabels: Record<string, string> = {
  pending: 'Bekliyor',
  preparing: 'Hazırlanıyor',
  ready: 'Yolda',
  yolda: 'Yolda',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal',
};

export const orderStatusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  preparing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ready: 'bg-primary/10 text-primary dark:text-primary-light',
  yolda: 'bg-primary/10 text-primary dark:text-primary-light',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
