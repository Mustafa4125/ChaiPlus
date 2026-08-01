import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Wallet, CheckCircle, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { customers as fallbackCustomers } from '@/services/appDataService';
import { getAllUsersProfiles } from '@/services/firebase/users';
import { topUpCustomerBalance } from '@/services/firebase/balance';
import { useToastStore } from '@/store/toast';

type CustomerOption = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

export default function AdminBrandUploadPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [customers, setCustomers] = useState<CustomerOption[]>(() => fallbackCustomers.map((customer) => ({ id: customer.id, name: customer.name, email: customer.email, avatar: customer.avatar })));
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id ?? '');
  const [amount, setAmount] = useState('100');
  const [loading, setLoading] = useState(false);
  const [lastLoaded, setLastLoaded] = useState<{ customerName: string; amount: number } | null>(null);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const users = await getAllUsersProfiles();
        const mapped = users
          .filter((user) => user.role !== 'admin')
          .map((user) => ({ id: user.uid, name: user.name, email: user.email, avatar: user.avatar }));

        if (mapped.length > 0) {
          setCustomers(mapped);
          setSelectedCustomerId((current) => current || mapped[0].id);
        }
      } catch {
        setCustomers(fallbackCustomers.map((customer) => ({ id: customer.id, name: customer.name, email: customer.email, avatar: customer.avatar })));
      }
    };

    void loadCustomers();
  }, []);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) ?? customers[0],
    [customers, selectedCustomerId],
  );

  const handleUpload = async () => {
    if (!selectedCustomer) return;

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      addToast('Geçerli bir bakiye girin.', 'error');
      return;
    }

    try {
      setLoading(true);
      await topUpCustomerBalance({
        customerId: selectedCustomer.id,
        amount: parsedAmount,
        description: 'Admin tarafından marka yükleme',
        actorId: 'admin',
        actorRole: 'admin',
      });
      setLastLoaded({ customerName: selectedCustomer.name, amount: parsedAmount });
      addToast(`${selectedCustomer.name} için ${parsedAmount} Marka bakiyesi yüklendi.`, 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Bakiye yüklenemedi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marka Yükle</h1>
        <p className="text-sm text-gray-500">Müşteri bakiyesini hızlıca güncelleyin.</p>
      </div>

      <Card>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Müşteri Seçin
          </label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm shadow-soft outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/5 dark:bg-[#22262e]"
          >
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} · {customer.email}
              </option>
            ))}
          </select>

          <Input
            label="Yüklenecek Marka Miktarı"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            icon={<Wallet className="h-5 w-5" />}
          />

          <div className="rounded-2xl bg-primary/5 p-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
              <Sparkles className="h-4 w-4 text-primary" />
              Seçili müşteri: {selectedCustomer?.name}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Bu işlem müşteri marka bakiyesini günceller ve sipariş ödeme akışında kullanılır.
            </p>
          </div>

          <Button fullWidth size="lg" loading={loading} onClick={handleUpload}>
            <Wallet className="h-5 w-5" />
            Bakiyeyi Yükle
          </Button>
        </div>
      </Card>

      {lastLoaded && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="text-center py-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
              <CheckCircle className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Bakiye Güncellendi</h3>
            <p className="text-sm text-gray-500">
              {lastLoaded.customerName} için {lastLoaded.amount} Marka bakiyesi başarıyla eklendi.
            </p>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
