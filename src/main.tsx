import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles.css';
import { initializeDataSource } from '@/services/dataSource';
import { registerForegroundMessaging } from '@/services/firebase/notifications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

void initializeDataSource();

if ('serviceWorker' in navigator) {
  void navigator.serviceWorker.register('/sw.js').catch(() => undefined);
}

void registerForegroundMessaging();

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>,
);
