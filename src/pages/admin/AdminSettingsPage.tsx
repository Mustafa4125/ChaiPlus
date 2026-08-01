import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Clock3, BellRing, UserPlus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createUserAccountByAdmin } from '@/services/firebase/users';
import { useToastStore } from '@/store/toast';

const settings = [
  { title: 'Açılış saati', value: '07:30' },
  { title: 'Kapanış saati', value: '19:30' },
  { title: 'Bildirim modu', value: 'Aktif' },
];

export default function AdminSettingsPage() {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'esnaf'>('esnaf');
  const [businessId, setBusinessId] = useState('');
  const [loading, setLoading] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const handleCreateUser = async () => {
    if (!username.trim() || !password.trim()) {
      addToast('Kullanıcı adı ve şifre zorunludur.', 'warning');
      return;
    }

    try {
      setLoading(true);
      await createUserAccountByAdmin({ username, password, name, role, businessId: businessId || undefined });
      addToast(`${role === 'admin' ? 'Admin' : 'Esnaf'} hesabı oluşturuldu.`, 'success');
      setUsername('');
      setName('');
      setPassword('');
      setBusinessId('');
      setRole('esnaf');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Kullanıcı oluşturulamadı.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ayarlar</h1>
        <p className="text-sm text-gray-500">Çay ocağınızın temel ayarlarını yönetin.</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {settings.map((item, index) => (
          <motion.div key={item.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {index === 0 ? <Clock3 className="h-5 w-5" /> : index === 1 ? <Settings className="h-5 w-5" /> : <BellRing className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-sm text-gray-500">{item.title}</p>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">{item.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kullanıcı oluştur</h2>
            <p className="text-sm text-gray-500">Yalnızca admin tarafından oluşturulur.</p>
          </div>
        </div>

        <div className="space-y-4">
          <Input label="Ad Soyad" value={name} onChange={(e) => setName(e.target.value)} placeholder="Esnaf adı" />
          <Input label="Kullanıcı adı" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="esnaf01" />
          <Input label="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          <Input label="İşletme ID" value={businessId} onChange={(e) => setBusinessId(e.target.value)} placeholder="opsiyonel" />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rol</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('esnaf')}
                className={`rounded-2xl border px-3 py-3 text-sm font-medium ${role === 'esnaf' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-600'}`}
              >
                Esnaf
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`rounded-2xl border px-3 py-3 text-sm font-medium ${role === 'admin' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-600'}`}
              >
                Admin
              </button>
            </div>
          </div>

          <Button fullWidth loading={loading} onClick={handleCreateUser}>
            Kullanıcı Oluştur
          </Button>
        </div>
      </Card>
    </div>
  );
}
