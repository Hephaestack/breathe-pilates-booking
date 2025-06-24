'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import '../../i18n/i18n';

// ...useIsTouchDevice hook...

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.id) {
      fetch('http://localhost:8000/users/' + storedUser.id)
        .then(res => res.json())
        .then(data => setUser({ ...storedUser, name: data.name }));
    }
  }, []);

  if (!user) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 py-8">
      <main className="flex flex-col items-center justify-center flex-1 w-full max-w-md">
        <div className="backdrop-blur-lg bg-white/80 rounded-3xl shadow-2xl px-8 py-10 w-full flex flex-col items-center border border-[#4A2C2A]/30 ">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#b3b18f] via-[#A5957E] to-[#4A2C2A] bg-clip-text text-transparent text-center mb-4 tracking-tight drop-shadow">
            {t('hello', { name: user.name })}
          </h1>
          {subscription?.expires && (
            <p className="text-base text-[#3b3939] text-center max-w-xs leading-relaxed mb-2">
        {subscription?.expires && t('subscription_expires', { expiryDate: subscription.expires })}
            </p>
          )}
          <p className="text-base text-[#8a7f7e] text-center max-w-xs leading-relaxed mb-8">
          
          </p>
          <div className="w-full max-w-xs space-y-4">
            <button
              className="w-full py-3 px-6 text-lg font-semibold rounded-2xl btn-primary"
              onClick={() => router.push('/programs')}
            >
              {t('schedule')}
            </button>
            <button
              className="w-full py-3 px-6 text-lg font-semibold rounded-2xl btn-primary"
              onClick={() => router.push('/bookings')}
            >
              {t('my_bookings')}
            </button>
            <button
              className="w-full py-3 px-6 text-lg font-semibold rounded-2xl btn-primary"
              onClick={() => router.push('/subscriptions')}
            >
              {t('my_subscriptions')}
            </button>
            <button
              className="w-full py-2 px-6 text-lg font-semibold rounded-xl bg-[#ffffff] text-[#fc0000] shadow hover:bg-[#ccc] transition duration-300"
              onClick={() => {
                localStorage.removeItem('user');
                router.push('/login');
              }}
            >
              {t('log_out')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}