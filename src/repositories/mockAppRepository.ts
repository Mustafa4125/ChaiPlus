import type { AppRepository } from '@/repositories/types';
import type { AdminStats, BrandBalance, Customer, FavoriteOrder, Notification, Order, Product, User } from '@/types';
import { adminStats as mockAdminStats, brandBalance as mockBrandBalance, categories as mockCategories, customers as mockCustomers, demoAdmin as mockDemoAdmin, demoUser as mockDemoUser, extraOptions as mockExtraOptions, extraPrice as mockExtraPrice, favoriteOrders as mockFavoriteOrders, notifications as mockNotifications, orders as mockOrders, products as mockProducts, sizeOptions as mockSizeOptions, sizePriceModifier as mockSizePriceModifier } from '@/data/mock';

export class MockAppRepository implements AppRepository {
  getCategories(): string[] {
    return [...mockCategories];
  }

  getProducts(): Product[] {
    return mockProducts.map((product) => ({ ...product }));
  }

  getFavoriteOrders(): FavoriteOrder[] {
    return mockFavoriteOrders.map((favoriteOrder) => ({ ...favoriteOrder, items: favoriteOrder.items.map((item) => ({ ...item })) }));
  }

  getOrders(): Order[] {
    return mockOrders.map((order) => ({ ...order, items: order.items.map((item) => ({ ...item })) }));
  }

  getNotifications(): Notification[] {
    return mockNotifications.map((notification) => ({ ...notification }));
  }

  getBrandBalance(): BrandBalance {
    return {
      ...mockBrandBalance,
      transactions: mockBrandBalance.transactions.map((transaction) => ({ ...transaction })),
    };
  }

  getCustomers(): Customer[] {
    return mockCustomers.map((customer) => ({ ...customer }));
  }

  getAdminStats(): AdminStats {
    return { ...mockAdminStats };
  }

  getDemoUser(): User {
    return { ...mockDemoUser };
  }

  getDemoAdmin(): User {
    return { ...mockDemoAdmin };
  }

  getSizeOptions(): readonly string[] {
    return [...mockSizeOptions];
  }

  getExtraOptions(): string[] {
    return [...mockExtraOptions];
  }

  getSizePriceModifier(): Record<string, number> {
    return { ...mockSizePriceModifier };
  }

  getExtraPrice(): number {
    return mockExtraPrice;
  }
}

export const mockAppRepository = new MockAppRepository();
