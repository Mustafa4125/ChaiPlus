import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserRound, Lock, Leaf, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      addToast('Kullanıcı adı ve şifre zorunludur.', 'warning');
      return;
    }

    setLoading(true);

    try {
      const user = await login(username.trim(), password);
      addToast(user.role === 'admin' ? 'Admin paneline giriş yapıldı.' : 'Hoş geldiniz.', 'success');
      navigate(user.role === 'admin' ? '/admin' : '/home');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Giriş başarısız oldu.';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark flex flex-col">
      <div className="relative bg-gradient-to-br from-primary via-primary to-emerald-800 px-6 pt-12 pb-14 rounded-b-[2.5rem] overflow-hidden">
        <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute bottom-0 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
            className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm border border-white/20 shadow-lg mb-5"
          >
            <Leaf className="h-10 w-10 text-cream" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ChaiPlus</h1>
          <div className="flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <p className="text-cream/90 text-xs font-medium">Premium çay ve kahve hizmeti</p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 -mt-10 px-6 pb-8"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleLogin();
          }}
          className="bg-white dark:bg-[#22262e] rounded-3xl shadow-soft-lg p-6 space-y-5"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Tekrar hoş geldiniz</h2>

          <Input
            label="Kullanıcı adı"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="kullaniciadi"
            icon={<UserRound className="h-5 w-5" />}
            autoComplete="username"
          />
          <Input
            label="Şifre"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock className="h-5 w-5" />}
            autoComplete="current-password"
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            }
          />

          <Button fullWidth size="lg" type="submit" loading={loading}>
            Giriş Yap
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
