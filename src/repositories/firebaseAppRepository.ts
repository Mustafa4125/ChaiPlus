import type { AppRepository } from '@/repositories/types';
import type { AdminStats, BrandBalance, Customer, FavoriteOrder, Notification, Order, Product, User } from '@/types';

export class FirebaseAppRepository implements AppRepository {
  getCategories(): string[] {
    return ['Tümü', 'Çay', 'Kahve', 'Soğuk İçecek'];
  }

  getProducts(): Product[] {
    return [];
  }

  getFavoriteOrders(): FavoriteOrder[] {
    return [];
  }

  getOrders(): Order[] {
    return [];
  }

  getNotifications(): Notification[] {
    return [];
  }

  getBrandBalance(): BrandBalance {
    return {
      customerName: 'Müşteri',
      balance: 0,
      currency: 'Marka',
      lastTopUp: '',
      transactions: [],
    };
  }

  getCustomers(): Customer[] {
    return [];
  }

  getAdminStats(): AdminStats {
    return {
      totalOrders: 0,
      totalRevenue: 0,
      activeCustomers: 0,
      pendingOrders: 0,
      todayOrders: 0,
      popularProduct: 'Çay',
    };
  }

  getDemoUser(): User {
    return {
      id: 'firebase-user',
      name: 'Firebase Kullanıcı',
      email: 'firebase@example.com',
      phone: '',
      avatar: '',
      role: 'customer',
    };
  }

  getDemoAdmin(): User {
    return {
      id: 'firebase-admin',
      name: 'Firebase Admin',
      email: 'admin@example.com',
      phone: '',
      avatar: '',
      role: 'admin',
    };
  }

  getSizeOptions(): readonly string[] {
    return ['Küçük', 'Orta', 'Büyük'];
  }

  getExtraOptions(): string[] {
    return ['Ekstra Süt', 'Ekstra Buz', 'Safran', 'Bal', 'Tarçın'];
  }

  getSizePriceModifier(): Record<string, number> {
    return { Küçük: 0, Orta: 0, Büyük: 0 };
  }

  getExtraPrice(): number {
    return 0;
  }
}

export const firebaseAppRepository = new FirebaseAppRepository();
