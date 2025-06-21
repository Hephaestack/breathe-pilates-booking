'use client';

import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const mockPrograms = {
  '2025-07-16': [
    {
      time: '09:00',
      name: 'Morning Pilates',
      instructor: { name: 'Anna', id: 1 },
      location: 'Studio A',
      capacity: 10,
      booked: 7,
    },
    {
      time: '18:00',
      name: 'Evening Flow',
      instructor: { name: 'Maria', id: 2 },
      location: 'Studio B',
      capacity: 12,
      booked: 12,
    },
  ],
  '2025-07-17': [
    {
      time: '10:00',
      name: 'Core Strength',
      instructor: { name: 'John', id: 3 },
      location: 'Studio A',
      capacity: 8,
      booked: 5,
    },
  ],
};

function formatDate(dateString) {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export default function BookDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null); // <-- Add this

  // Load subscription expiry date from localStorage
  useEffect(() => {
    const subData = localStorage.getItem('subscription');
    if (subData) {
      setSubscription(JSON.parse(subData));
    }
  }, []);

  const date = params.date;
  const programName = searchParams.get('program');
  const program =
    mockPrograms[date]?.find((p) => p.name === programName) || null;

  const handleBook = async () => {
    if (!program || program.booked >= program.capacity) return;
    setLoading(true);
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          program: program.name,
          date: date,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(t('booking_confirmed') || 'Booking confirmed!');
        router.push('/programs');
      } else {
        alert(data.message || t('booking_failed') || 'Booking failed!');
      }
    } catch (err) {
      alert(t('booking_failed') || 'Booking failed!');
    }
    setLoading(false);
  };

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/80 rounded-2xl shadow-2xl px-6 py-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-[#4A2C2A] mb-4">
            {t('program_not_found')}
          </h2>
        </div>
      </div>
    );
  }

  const isFull = program.booked >= program.capacity;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-2 py-8">
      <div className="bg-white/80 rounded-2xl shadow-2xl px-4 py-6 border border-[#4A2C2A]/30 w-full max-w-md shadow-[#4A2C2A]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#4A2C2A] flex items-center gap-2">
            {t('booking_details')}
          </h2>
          <button
            className="text-2xl text-[#50322f] hover:text-[#b3b18f] transition"
            onClick={() => router.push('/programs')}
            aria-label={t('cancel')}
          >
            ×
          </button>
        </div>

        {/* Program Info */}
        <div className="bg-[#ffffff] rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="font-semibold text-[#50322f]">{t('class')}</div>
            <div className="font-semibold text-[#50322f]">{t('location')}</div>
            <div className="text-[#50322f]">{program.name}</div>
            <div className="text-[#50322f]">{program.location}</div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="font-semibold text-[#50322f]">
                {t('participants')}:&nbsp;
              </span>
              <span
                className={`inline-block rounded px-2 py-0.5 font-semibold ${
                  isFull
                    ? 'bg-red-200 text-red-800'
                    : 'bg-white text-[#50322f]'
                }`}
              >
                {program.booked} / {program.capacity}
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-sm mt-2">
          <thead>
            <tr className="text-[#4A2C2A] bg-[#dbdac6] font-bold">
              <th className="py-1 px-2 font-semibold rounded-tl-xl">{t('date')}</th>
              <th className="py-1 px-2 font-semibold">{t('from')}</th>
              <th className="py-1 px-2 font-semibold">{t('to')}</th>
              <th className="py-1 px-2 font-semibold">{t('bookings')}</th>
              <th className="py-1 px-2 font-semibold rounded-tr-xl">{t('waitlist')}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-[#ffffff] text-[#4A2C2A]">
              <td className="py-1 px-2 text-center rounded-bl-xl">{formatDate(date)}</td>
              <td className="py-1 px-2 text-center">{program.time}</td>
              <td className="py-1 px-2 text-center">{program.to || '--'}</td>
              <td className="py-1 px-2 text-center">
                <span className="inline-block bg-[#dbdac6] rounded px-2 py-0.5 text-[#50322f] font-semibold">
                  {program.booked} / {program.capacity}
                </span>
              </td>
              <td className="py-1 px-2 text-center rounded-br-xl">
                <span className="inline-block rounded px-2 py-0.5 text-[#4A2C2A] font-semibold">
                  0
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        {/* Book Button */}
        <div className="flex flex-col items-center mt-4">
          <button
            className="px-4 py-2 bg-gradient-to-r from-[#b3b18f] via-[#A5957E] to-[#4A2C2A] text-center tracking-tight drop-shadow text-white font-semibold rounded-xl shadow hover:brightness-110 transition"
            disabled={isFull || loading}
            onClick={handleBook}
          >
            {loading ? t('booking') : t('book_it')}
          </button>
        </div>
      </div>
    </div>
  );
}