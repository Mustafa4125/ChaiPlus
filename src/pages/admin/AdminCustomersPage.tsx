import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, Phone, UserPlus, Wallet, Trash2, Pencil, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading';
import { Skeleton } from '@/components/ui/Skeleton';
import { createUserAccountByAdmin, getAllUsersProfiles, updateUserAccountByAdmin } from '@/services/firebase/users';
import { deductBalanceForOrder, getBalanceForUser, topUpCustomerBalance } from '@/services/firebase/balance';
import { formatPrice } from '@/lib/utils';
import { useToastStore } from '@/store/toast';

interface CustomerRecord {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  isActive: boolean;
  balance: number;
  businessId?: string;
}

const emptyForm = {
  name: '',
  username: '',
  password: '',
  email: '',
  phone: '',
  businessId: '',
  initialBalance: '0',
};

export default function AdminCustomersPage() {
  const loading = useSimulatedLoading(700);
  const addToast = useToastStore((s) => s.addToast);
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const loadCustomers = async () => {
    try {
      const profiles = await getAllUsersProfiles();
      const mapped = await Promise.all(
        profiles
          .filter((profile) => profile.role === 'customer')
          .map(async (profile) => {
            const balance = await getBalanceForUser(profile.uid);
            return {
              id: profile.uid,
              username: profile.username,
              name: profile.name,
              email: profile.email,
              phone: profile.phone,
              avatar: profile.avatar,
              isActive: profile.isActive !== false,
              businessId: profile.businessId,
              balance: balance.balance,
            };
          }),
      );

      setCustomers(mapped);
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Müşteriler yüklenemedi.', 'error');
    }
  };

  useEffect(() => {
    void loadCustomers();
  }, []);

  const filtered = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase()) ||
      customer.username.toLowerCase().includes(search.toLowerCase()),
  );

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.username.trim()) {
      addToast('Ad soyad ve kullanıcı adı zorunludur.', 'warning');
      return;
    }

    if (!editingId && !form.password.trim()) {
      addToast('Yeni müşteri için şifre zorunludur.', 'warning');
      return;
    }

    try {
      setCreating(true);

      if (editingId) {
        await updateUserAccountByAdmin({
          uid: editingId,
          username: form.username,
          name: form.name,
          email: form.email,
          phone: form.phone,
          businessId: form.businessId || undefined,
        });
        addToast('Müşteri bilgileri güncellendi.', 'success');
      } else {
        const created = await createUserAccountByAdmin({
          username: form.username,
          password: form.password,
          name: form.name,
          email: form.email || undefined,
          role: 'customer',
          businessId: form.businessId || undefined,
        });

        const initialBalance = Number(form.initialBalance || 0);
        if (initialBalance > 0) {
          await topUpCustomerBalance({
            customerId: created.id,
            amount: initialBalance,
            description: 'İlk marka yükleme',
            actorId: 'admin',
            actorRole: 'admin',
          });
        }

        addToast('Müşteri oluşturuldu.', 'success');
      }

      resetForm();
      await loadCustomers();
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'İşlem tamamlanamadı.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (customer: CustomerRecord) => {
    setEditingId(customer.id);
    setForm({
      name: customer.name,
      username: customer.username,
      password: '',
      email: customer.email,
      phone: customer.phone,
      businessId: customer.businessId ?? '',
      initialBalance: '0',
    });
  };

  const handleToggleStatus = async (customer: CustomerRecord) => {
    try {
      await updateUserAccountByAdmin({
        uid: customer.id,
        isActive: !customer.isActive,
      });
      await loadCustomers();
      addToast(customer.isActive ? 'Müşteri pasif yapıldı.' : 'Müşteri aktif yapıldı.', 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Durum güncellenemedi.', 'error');
    }
  };

  const handleTopUp = async (customer: CustomerRecord) => {
    const amountText = window.prompt(`${customer.name} için marka miktarını girin:`, '100');
    if (amountText === null) return;

    const amount = Number(amountText);
    if (!Number.isFinite(amount) || amount <= 0) {
      addToast('Geçerli bir marka miktarı girin.', 'warning');
      return;
    }

    try {
      await topUpCustomerBalance({
        customerId: customer.id,
        amount,
        description: 'Admin tarafından marka yükleme',
        actorId: 'admin',
        actorRole: 'admin',
      });
      await loadCustomers();
      addToast(`${amount} marka yüklendi.`, 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Marka yüklenemedi.', 'error');
    }
  };

  const handleClearBalance = async (customer: CustomerRecord) => {
    if (customer.balance <= 0) {
      addToast('Silinecek marka kalmadı.', 'info');
      return;
    }

    try {
      await deductBalanceForOrder({
        userId: customer.id,
        amount: customer.balance,
        description: 'Admin tarafından marka silme',
        actorId: 'admin',
        actorRole: 'admin',
      });
      await loadCustomers();
      addToast('Müşteri bakiyesi sıfırlandı.', 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Bakiye silinemedi.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-52 w-full" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Müşteri Yönetimi</h1>
        <p className="text-sm text-gray-500">{customers.length} müşteri kaydı</p>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingId ? 'Müşteri bilgilerini güncelle' : 'Yeni müşteri oluştur'}
            </h2>
            <p className="text-sm text-gray-500">Firestore ile eşitlenir.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Ad Soyad" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Müşteri adı" />
          <Input label="Kullanıcı Adı" value={form.username} onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))} placeholder="musteri01" />
          {!editingId && (
            <Input label="Şifre" type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} placeholder="••••••••" />
          )}
          <Input label="E-posta" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="ornek@chaiplus.com" />
          <Input label="Telefon" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="0555 123 45 67" />
          <Input label="İşletme ID" value={form.businessId} onChange={(e) => setForm((prev) => ({ ...prev, businessId: e.target.value }))} placeholder="opsiyonel" />
          {!editingId && (
            <Input label="İlk Marka Bakiyesi" value={form.initialBalance} onChange={(e) => setForm((prev) => ({ ...prev, initialBalance: e.target.value }))} placeholder="0" />
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <Button onClick={handleSubmit} loading={creating}>
            {editingId ? 'Güncelle' : 'Oluştur'}
          </Button>
          {editingId && (
            <Button variant="outline" onClick={resetForm}>
              İptal
            </Button>
          )}
        </div>
      </Card>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Müşteri ara..."
          className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white dark:bg-[#22262e] border border-gray-100 dark:border-white/5 shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {filtered.map((customer, i) => (
          <motion.div key={customer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card hover className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{customer.name}</h3>
                    <Badge variant={customer.isActive ? 'primary' : 'muted'}>
                      {customer.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                    <Mail className="h-3 w-3" />
                    {customer.email || 'E-posta yok'}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                    <Phone className="h-3 w-3" />
                    {customer.phone || 'Telefon yok'}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">@{customer.username}</span>
                    <span className="font-semibold text-primary">{formatPrice(customer.balance)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(customer)}>
                  <Pencil className="h-4 w-4" /> Düzenle
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleToggleStatus(customer)}>
                  {customer.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  {customer.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleTopUp(customer)}>
                  <Wallet className="h-4 w-4" /> Marka Yükle
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleClearBalance(customer)}>
                  <Trash2 className="h-4 w-4" /> Marka Sil
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">Müşteri bulunamadı</div>
      )}
    </div>
  );
}
