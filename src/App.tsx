import { Component, type ReactNode } from 'react';
import { ToastContainer } from '@/components/ui/Toast';
import AppRoutes from '@/routes/index';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 bg-surface text-center">
          <p className="text-xl font-bold text-gray-800">Bir hata oluştu.</p>
          <p className="text-sm text-gray-500">Sayfayı yenileyin veya tekrar giriş yapın.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="mt-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white"
          >
            Giriş Sayfasına Dön
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
      <ToastContainer />
    </ErrorBoundary>
  );
}
