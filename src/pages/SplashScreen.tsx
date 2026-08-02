import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth } from '@/services/firebase/firebase';
import { getUserProfileByUid } from '@/services/firebase/users';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getFirebaseAuth();

    if (!auth) {
      const timer = setTimeout(() => navigate('/login'), 2800);
      return () => clearTimeout(timer);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setTimeout(() => navigate('/login'), 2800);
        return;
      }

      try {
        const profile = await getUserProfileByUid(firebaseUser.uid);

        setTimeout(() => {
          if (profile?.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/home');
          }
        }, 2800);
      } catch {
        setTimeout(() => navigate('/login'), 2800);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-gold blur-3xl" />
        <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-cream blur-3xl" />
      </div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-glass"
        >
          <Leaf className="h-12 w-12 text-cream" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-white tracking-tight"
        >
          ChaiPlus
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-2 text-cream/80 text-sm font-medium"
        >
          Premium Çay & Kahve Deneyimi
        </motion.p>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 120 }}
          transition={{ delay: 1, duration: 1.5 }}
          className="mt-10 h-1 rounded-full bg-gold"
        />
      </motion.div>
    </div>
  );
}