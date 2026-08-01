export type OrderStatus = 'pending' | 'preparing' | 'yolda' | 'delivered' | 'cancelled';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isPopular?: boolean;
  rating: number;
  ratingCount?: number;
  prepTime: string;
  calories?: number;
  tags?: string[];
  isActive?: boolean;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  extras: string[];
  note?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  size: string;
  extras: string[];
}

export interface Order {
  id: string;
  userId?: string;
  customerName?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
  estimatedTime?: string;
  balanceDeducted?: boolean;
}

export interface FavoriteOrder {
  id: string;
  userId?: string;
  name: string;
  items: OrderItem[];
  total: number;
  orderCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'promo' | 'system';
  read: boolean;
  createdAt: string;
}

export interface BrandBalance {
  customerName: string;
  balance: number;
  currency: string;
  lastTopUp: string;
  transactions: BrandTransaction[];
}

export interface BrandTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  status: 'active' | 'inactive';
  avatar: string;
}

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  activeCustomers: number;
  pendingOrders: number;
  todayOrders: number;
  popularProduct: string;
}

export interface User {
  id: string;
  username?: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'customer' | 'esnaf' | 'admin';
  businessId?: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
