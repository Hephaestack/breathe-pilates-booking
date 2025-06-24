'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Get user from localStorage
function getUser() {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const storedUser = getUser();
        if (!storedUser || !storedUser.id) {
          setError('User not found');
          setLoading(false);
          return;
        }

        setUser(storedUser);

        // Fetch user data with bookings
        const response = await fetch(`http://localhost:8000/users/${storedUser.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        
        // Transform bookings data to match the expected format
        const transformedBookings = userData.bookings?.map(booking => ({
          id: booking.id,
          date: formatDate(booking.class_.date),
          name: booking.class_.class_name,
          from: booking.class_.time.split('-')[0]?.trim() || booking.class_.time,
          to: booking.class_.time.split('-')[1]?.trim() || '',
          user: userData.name,
          status: booking.status,
          class_id: booking.class_id,
          booking_id: booking.id
        })) || [];

        setBookings(transformedBookings);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-2 py-8">
        <div className="bg-white/80 rounded-2xl shadow-2xl px-4 py-6 border border-[#4A2C2A]/30 shadow-[#3a2826] w-full max-w-md">
          <p className="text-center text-[#4A2C2A]">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-2 py-8">
        <div className="bg-white/80 rounded-2xl shadow-2xl px-4 py-6 border border-[#4A2C2A]/30 shadow-[#3a2826] w-full max-w-md">
          <p className="text-center text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl px-6 py-8 border border-[#4A2C2A]/30 shadow-[#3a2826] w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#b3b18f] via-[#A5957E] to-[#4A2C2A] bg-clip-text text-transparent tracking-tight drop-shadow">
            {t('my_bookings')}
          </h2>
          <button
            className="text-3xl text-[#4A2C2A] hover:text-[#b3b18f] transition-colors duration-200"
            onClick={() => router.back()}
            aria-label={t('cancel')}
          >
            ×
          </button>
        </div>
          <div className="overflow-hidden shadow-lg rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#dbdac6] text-[#4A2C2A]">
                <th className="px-4 py-4 font-semibold text-center">{t('date')}</th>
                <th className="px-4 py-4 font-semibold text-center">{t('name')}</th>
                <th className="px-4 py-4 font-semibold text-center">Time</th>
                {user?.role === 'instructor' && (
                  <th className="px-4 py-4 font-semibold text-center">{t('user')}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'instructor' ? 4 : 3} className="py-12 text-center text-[#4A2C2A] bg-white">
                    <div className="flex flex-col items-center">
                      <div className="mb-2 text-lg font-medium">{t('no_bookings_found')}</div>
                      <div className="text-sm text-gray-500">You haven't made any bookings yet</div>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((b, index) => (
                  <tr key={b.booking_id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-150`}>
                    <td className="py-4 px-4 text-[#4A2C2A] font-medium text-center">{b.date}</td>
                    <td className="py-4 px-4 text-[#4A2C2A] font-medium text-center">{b.name}</td>
                    <td className="py-4 px-4 text-[#4A2C2A] font-medium text-center">{b.from}{b.to && ` - ${b.to}`}</td>
                    {user?.role === 'instructor' && (
                      <td className="py-4 px-4 text-[#4A2C2A] font-medium text-center">{b.user}</td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}