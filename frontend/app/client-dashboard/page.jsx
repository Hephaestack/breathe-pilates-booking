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
  const [subscriptions, setSubscriptions] = useState([]);
  const [remainingClasses, setRemainingClasses] = useState(null);
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/` + storedUser.id)
        .then(res => res.json())
        .then(data => setUser({ ...storedUser, name: data.name }))
        .catch(err => console.error('User fetch error:', err));

      // Fetch subscriptions using the same method as the subscriptions page
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription?user_id=${storedUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setSubscriptions(data);
          } else {
            setSubscriptions([]);
          }
        })
        .catch(err => setSubscriptions([]));

      // Fetch remaining classes from new endpoint (optional, fallback)
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${storedUser.id}/remaining_classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch remaining classes');
          return res.json();
        })
        .then(data => {
          setRemainingClasses(data);
        })
        .catch(err => {
          setRemainingClasses(null);
        });
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

  // Show all subscriptions below the name (same as subscriptions page)
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
          {subscriptions.length > 0 && (
            <div className="w-full mb-2 space-y-2">
              {(() => {
                // Find unique subscription model names
                const uniqueNames = Array.from(new Set(subscriptions.map(s => s.subscription_model)));
                const showNames = uniqueNames.length > 1;
                return subscriptions.map((subscription, idx) => {
                  const isPackage = String(subscription.subscription_model).toLowerCase().includes('πακέτο');
                  const isSubs = String(subscription.subscription_model).toLowerCase().includes('συνδρομή');
                  return (
                    <div key={subscription.id || idx} className="text-lg sm:text-xl font-bold text-[#4A2C2A] text-center tracking-tight drop-shadow bg-white/60 rounded-xl py-2">
                      {showNames && (
                        <div className="mb-1 text-base sm:text-lg font-semibold text-[#7a6a5e]">{subscription.subscription_model}</div>
                      )}
                      {isPackage && (
                        <span>
                          {t('remaining_lessons')}: {typeof subscription.remaining_classes === 'number' && !isNaN(subscription.remaining_classes)
                            ? subscription.remaining_classes
                            : typeof remainingClasses === 'number' && !isNaN(remainingClasses)
                              ? remainingClasses
                              : t('loading')}
                        </span>
                      )}
                      {isSubs && subscription.end_date && (
                        (() => {
                          const expiry = new Date(subscription.end_date);
                          const now = new Date();
                          if (expiry < now) {
                            return <span className="text-red-600">{t('subscription_ended')}</span>;
                          } else {
                            return <span>{t('subscription_ends')}: {formatDate(subscription.end_date)}</span>;
                          }
                        })()
                      )}
                    </div>
                  );
                });
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