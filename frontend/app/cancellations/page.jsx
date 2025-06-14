'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';

function getUser() {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
}

const cancellations = [
  {
    date: '17/7/2024',
    name: 'Breath Pilates',
    from: '17:00',
    to: '18:00',
    user: 'Maria Papadopoulou', // Only shown to instructors
  },
];

export default function CancellationsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    setUser(getUser());
  }, []);

  // Determine if User column should be shown
  const showUser = user?.role === 'instructor';

  return (
    <div className="min-h-screen flex items-center justify-center px-2 py-8">
      <div className="bg-white/80 rounded-2xl shadow-2xl px-4 py-6 border border-[#4A2C2A]/30 shadow-[#3a2826] w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#b3b18f] via-[#A5957E] to-[#4A2C2A] bg-clip-text text-transparent text-center tracking-tight drop-shadow flex items-center gap-2">
            {t('cancellations')}
          </h2>
          <button
            className="text-2xl text-[#4A2C2A] hover:text-[#b3b18f] transition"
            onClick={() => router.back()}
            aria-label={t('cancel')}
          >
            ×
          </button>
        </div>
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="text-white bg-[#b3b18f]">
              <th className="py-1 px-2 font-semibold rounded-tl-xl">{t('date')}</th>
              <th className="py-1 px-2 font-semibold">{t('class')}</th>
              <th className="py-1 px-2 font-semibold">{t('from')}</th>
              <th className={`py-1 px-2 font-semibold ${showUser ? '' : 'rounded-tr-xl'}`}>{t('to')}</th>
              {showUser && (
                <th className="py-1 px-2 font-semibold rounded-tr-xl">{t('user')}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {cancellations.map((c, idx) => (
              <tr key={idx} className="text-[#4A2C2A] bg-[#ffffff]">
                <td className="py-1 px-2 text-center rounded-bl-xl">{c.date}</td>
                <td className="py-1 px-2 text-center">{c.name}</td>
                <td className="py-1 px-2 text-center">{c.from}</td>
                <td className={`py-1 px-2 text-center ${showUser ? '' : 'rounded-br-xl'}`}>{c.to}</td>
                {showUser && (
                  <td className="py-1 px-2 text-center rounded-br-xl">{c.user}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center"></div>
      </div>
    </div>
  );
}