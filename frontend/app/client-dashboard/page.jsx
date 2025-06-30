'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import '../../i18n/i18n';

// Add formatDate helper
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// ...useIsTouchDevice hook...

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    console.log('storedUser:', storedUser);
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
    if (storedUser && storedUser.id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/` + storedUser.id)
        .then(res => {
          console.log('User fetch response:', res);
          return res.json();
        })
        .then(data => {
          console.log('User data:', data);
          setUser({ ...storedUser, name: data.name });
        })
        .catch(err => console.error('User fetch error:', err));
      // Fetch subscription info for dashboard
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription?user_id=${storedUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(res => {
          console.log('Subscription fetch response:', res);
          return res.json();
        })
        .then(data => {
          console.log('Subscription data:', data);
          setSubscription(data);
        })
        .catch(err => console.error('Subscription fetch error:', err));
    }
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-white/80 rounded-2xl shadow-2xl px-4 py-6 border border-[#4A2C2A]/30 shadow-[#3a2826] w-full max-w-md"
        >
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A2C2A] mb-4"></div>
            <p className="text-center text-[#4A2C2A] font-bold">{t('loading')}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-2 py-8 sm:px-4">
      <main className="flex flex-col items-center justify-center flex-1 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="backdrop-blur-lg bg-white/80 rounded-3xl shadow-2xl px-4 sm:px-8 py-6 sm:py-10 w-full flex flex-col items-center border border-[#4A2C2A]/30 "
        >
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#b3b18f] via-[#A5957E] to-[#4A2C2A] bg-clip-text text-transparent text-center mb-4 tracking-tight drop-shadow">
            {t('hello', { name: user.name })}
          </h1>
          {/* Subscription info below name, dynamic based on model */}
          {subscription && (
            <div className="text-lg sm:text-xl font-bold text-[#4A2C2A] text-center mb-2 tracking-tight drop-shadow">
              {/* If package model, show remaining classes. If timed, show expiry. */}
              {subscription.subscription_model?.includes('πακέτο') && subscription.remaining_classes !== null && (
                <span>{t('remaining_lessons')}: {subscription.remaining_classes}</span>
              )}
              {subscription.subscription_model?.includes('συνδρομή') && subscription.subscription_expires && (() => {
                const expiry = new Date(subscription.subscription_expires);
                const now = new Date();
                if (expiry < now) {
                  return <span className="text-red-600">{t('subscription_ended')}</span>;
                } else {
                  return <span>{t('subscription_ends')}: {formatDate(subscription.subscription_expires)}</span>;
                }
              })()}
            </div>
          )}
          <p className="text-xs sm:text-base text-[#8a7f7e] text-center max-w-xs leading-relaxed mb-8"></p>
          <div className="w-full max-w-xs space-y-4">
            <button
              className="w-full px-4 py-2 text-base font-semibold sm:py-3 sm:px-6 sm:text-lg rounded-2xl btn-primary"
              onClick={() => router.push('/programs')}
            >
              {t('schedule')}
            </button>
            <button
              className="w-full px-4 py-2 text-base font-semibold sm:py-3 sm:px-6 sm:text-lg rounded-2xl btn-primary"
              onClick={() => router.push('/bookings')}
            >
              {t('my_bookings')}
            </button>
            <button
              className="w-full px-4 py-2 text-base font-semibold sm:py-3 sm:px-6 sm:text-lg rounded-2xl btn-primary"
              onClick={() => router.push('/subscriptions')}
            >
              {t('my_subscriptions')}
            </button>
            <button
              className="w-full py-2 px-4 sm:px-6 text-base sm:text-lg font-semibold rounded-xl bg-[#ffffff] text-[#fc0000] shadow hover:bg-[#ccc] transition duration-300"
              onClick={() => {
                localStorage.removeItem('user');
                router.push('/login');
              }}
            >
              {t('log_out')}
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}