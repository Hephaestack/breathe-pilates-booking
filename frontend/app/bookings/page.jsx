'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';
import useToast from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

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
  const { toasts, hideToast, showSuccess, showError } = useToast();

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const storedUser = getUser();
        if (!storedUser || !storedUser.id) {
          setError(t('user_not_found'));
          setLoading(false);
          return;
        }

        setUser(storedUser);

        // Fetch user data with bookings
        const response = await fetch(`http://localhost:8000/users/${storedUser.id}`);
        
        if (!response.ok) {
          throw new Error(t('failed_fetch_user_data'));
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

  const handleCancelBooking = async (bookingId) => {
    try {
      const storedUser = getUser();
      if (!storedUser || !storedUser.id) {
        showError(t('user_not_found'));
        return;
      }

      const response = await fetch(`http://localhost:8000/bookings/${bookingId}?user_id=${storedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showSuccess(t('cancel_successful'));
        // Ανανέωσε τις κρατήσεις
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const data = await response.json();
        showError(t('cancel_error') + (data.detail ? ': ' + data.detail : ''));
      }
    } catch (error) {
      console.error('Error:', error);
      showError(t('cancel_connection_error'));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-2 py-8">
        <div className="bg-white/80 rounded-2xl shadow-2xl px-4 py-6 border border-[#4A2C2A]/30 shadow-[#3a2826] w-full max-w-md">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A2C2A] mb-4"></div>
            <p className="text-center text-[#4A2C2A] font-bold">{t('loading')}</p>
          </div>
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
        <div className="flex items-center justify-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#b3b18f] via-[#A5957E] to-[#4A2C2A] bg-clip-text text-transparent tracking-tight drop-shadow text-center">
            {t('my_bookings')}
          </h2>
        </div>
          <div className="overflow-hidden shadow-lg rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#dbdac6] text-[#4A2C2A] ">
                <th className="px-4 py-4 font-extrabold text-center ">{t('date')}</th>
                <th className="px-4 py-4 font-bold text-center">{t('name')}</th>
                <th className="px-4 py-4 font-extrabold text-center">{t('time')}</th>
                <th className="px-4 py-4 font-extrabold text-center"></th>
                {user?.role === 'instructor' && (
                  <th className="px-4 py-4 font-semibold text-center">{t('user')}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'instructor' ? 5 : 4} className="py-12 text-center text-[#4A2C2A] bg-white">
                    <div className="flex flex-col items-center">
                      <div className="mb-2 text-lg font-medium">{t('no_bookings_found')}</div>
                      <div className="text-sm text-gray-500">{t('no_bookings_yet')}</div>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((b, index) => (
                  <tr key={b.booking_id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-white'} border-b border-gray-200 transition-colors duration-150`}>
                    <td className="py-4 px-4 text-[#4A2C2A] text-center font-semibold">{b.date}</td>
                    <td className="py-4 px-4 text-[#4A2C2A]  text-center font-semibold">{b.name}</td>
                    <td className="py-4 px-4 text-[#4A2C2A]  text-center font-semibold">
                      {b.from}{b.to && ` - ${b.to}`}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleCancelBooking(b.booking_id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors">
                        {t('cancel')}
                      </button>
                    </td>
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
      <ToastContainer toasts={toasts} hideToast={hideToast} />
    </div>
  );
}