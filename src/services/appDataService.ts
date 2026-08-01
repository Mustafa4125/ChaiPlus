import { mockAppRepository, MockAppRepository } from '@/repositories/mockAppRepository';
import type { AppRepository } from '@/repositories/types';
import type { AdminStats, BrandBalance, Customer, FavoriteOrder, Notification, Order, Product, User } from '@/types';

export class AppDataService {
  private repository: AppRepository;

  constructor(repository: AppRepository = mockAppRepository) {
    this.repository = repository;
  }

  setRepository(repository: AppRepository) {
    this.repository = repository;
    syncDataExports();
  }

  getCategories() {
    return this.repository.getCategories();
  }

  getProducts() {
    return this.repository.getProducts();
  }

  getFavoriteOrders() {
    return this.repository.getFavoriteOrders();
  }

  getOrders() {
    return this.repository.getOrders();
  }

  getNotifications() {
    return this.repository.getNotifications();
  }

  getBrandBalance() {
    return this.repository.getBrandBalance();
  }

  getCustomers() {
    return this.repository.getCustomers();
  }

  getAdminStats() {
    return this.repository.getAdminStats();
  }

  getDemoUser() {
    return this.repository.getDemoUser();
  }

  getDemoAdmin() {
    return this.repository.getDemoAdmin();
  }

  getSizeOptions() {
    return this.repository.getSizeOptions();
  }

  getExtraOptions() {
    return this.repository.getExtraOptions();
  }

  getSizePriceModifier() {
    return this.repository.getSizePriceModifier();
  }

  getExtraPrice() {
    return this.repository.getExtraPrice();
  }
}

export const appDataService = new AppDataService();
export const createAppDataService = (repository?: AppRepository) => new AppDataService(repository ?? new MockAppRepository());

export let categories: string[] = [];
export let products: Product[] = [];
export let favoriteOrders: FavoriteOrder[] = [];
export let orders: Order[] = [];
export let notifications: Notification[] = [];
export let brandBalance: BrandBalance = {
  customerName: 'Müşteri',
  balance: 0,
  currency: 'Marka',
  lastTopUp: '',
  transactions: [],
};
export let customers: Customer[] = [];
export let adminStats: AdminStats = {
  totalOrders: 0,
  totalRevenue: 0,
  activeCustomers: 0,
  pendingOrders: 0,
  todayOrders: 0,
  popularProduct: 'Çay',
};
export let demoUser: User = {
  id: 'demo-user',
  name: 'Demo Kullanıcı',
  email: 'demo@example.com',
  phone: '',
  avatar: '',
  role: 'customer',
};
export let demoAdmin: User = {
  id: 'demo-admin',
  name: 'Demo Admin',
  email: 'admin@example.com',
  phone: '',
  avatar: '',
  role: 'admin',
};
export let sizeOptions: readonly string[] = [];
export let extraOptions: string[] = [];
export let sizePriceModifier: Record<string, number> = {};
export let extraPrice = 0;

export const syncDataExports = () => {
  categories = appDataService.getCategories();
  products = appDataService.getProducts();
  favoriteOrders = appDataService.getFavoriteOrders();
  orders = appDataService.getOrders();
  notifications = appDataService.getNotifications();
  brandBalance = appDataService.getBrandBalance();
  customers = appDataService.getCustomers();
  adminStats = appDataService.getAdminStats();
  demoUser = appDataService.getDemoUser();
  demoAdmin = appDataService.getDemoAdmin();
  sizeOptions = appDataService.getSizeOptions();
  extraOptions = appDataService.getExtraOptions();
  sizePriceModifier = appDataService.getSizePriceModifier();
  extraPrice = appDataService.getExtraPrice();
};

syncDataExports();

export const getDataSourceName = () => 'mock';
