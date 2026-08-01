import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import SplashScreen from '@/pages/SplashScreen';
import LoginPage from '@/pages/LoginPage';
import HomePage from '@/pages/HomePage';
import BrandBalancePage from '@/pages/BrandBalancePage';
import FavoriteOrdersPage from '@/pages/FavoriteOrdersPage';
import PopularProductsPage from '@/pages/PopularProductsPage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import OrderSuccessPage from '@/pages/OrderSuccessPage';
import OrdersPage from '@/pages/OrdersPage';
import OrderDetailPage from '@/pages/OrderDetailPage';
import NotificationsPage from '@/pages/NotificationsPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage';
import AdminBrandUploadPage from '@/pages/admin/AdminBrandUploadPage';
import AdminCustomersPage from '@/pages/admin/AdminCustomersPage';
import AdminProductsPage from '@/pages/admin/AdminProductsPage';
import AdminReportsPage from '@/pages/admin/AdminReportsPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/order-success" element={<OrderSuccessPage />} />

      <Route element={<AppLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/brand-balance" element={<BrandBalancePage />} />
        <Route path="/favorites" element={<FavoriteOrdersPage />} />
        <Route path="/popular" element={<PopularProductsPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/customers" element={<AdminCustomersPage />} />
        <Route path="/admin/balance" element={<AdminBrandUploadPage />} />
        <Route path="/admin/brands" element={<AdminBrandUploadPage />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
