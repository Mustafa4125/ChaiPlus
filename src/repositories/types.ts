import type { AdminStats, BrandBalance, Customer, FavoriteOrder, Notification, Order, Product, User } from '@/types';

export interface AppRepository {
  getCategories(): string[];
  getProducts(): Product[];
  getFavoriteOrders(): FavoriteOrder[];
  getOrders(): Order[];
  getNotifications(): Notification[];
  getBrandBalance(): BrandBalance;
  getCustomers(): Customer[];
  getAdminStats(): AdminStats;
  getDemoUser(): User;
  getDemoAdmin(): User;
  getSizeOptions(): readonly string[];
  getExtraOptions(): string[];
  getSizePriceModifier(): Record<string, number>;
  getExtraPrice(): number;
}
