'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';
import useToast from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import { motion } from 'framer-motion';

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
        // Remove the cancelled booking from state immediately
        setBookings(prev => prev.filter(b => b.booking_id !== bookingId));
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
      <div className="flex flex-col items-center justify-center min-h-screen px-2 py-8 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-white/80 rounded-2xl shadow-2xl px-2 py-6 sm:px-4 border border-[#4A2C2A]/30 shadow-[#3a2826] w-full max-w-md"
        >
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A2C2A] mb-4"></div>
            <p className="text-center text-[#4A2C2A] font-bold">{t('loading')}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-2 py-8 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-white/80 rounded-2xl shadow-2xl px-2 py-6 sm:px-4 border border-[#4A2C2A]/30 shadow-[#3a2826] w-full max-w-md"
        >
          <p className="text-center text-red-600">Error: {error}</p>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-1 py-4 sm:px-4 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl px-1 py-2 sm:px-6 sm:py-8 border border-[#4A2C2A]/30 shadow-[#3a2826] w-full max-w-md sm:max-w-2xl flex flex-col items-center"
      >
        <div className="flex items-center justify-center w-full mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-[#b3b18f] via-[#A5957E] to-[#4A2C2A] bg-clip-text text-transparent tracking-tight drop-shadow text-center w-full">
            {t('my_bookings')}
          </h2>
        </div>
        <div className="flex justify-center w-full overflow-x-auto">
          <motion.table
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
            className="w-full max-w-xs mx-auto text-xs sm:max-w-full sm:text-sm"
          >
            <thead>
              <tr className="bg-[#dbdac6] text-[#4A2C2A] text-center">
                <th className="px-1 py-2 font-extrabold text-center sm:px-2 sm:py-3 whitespace-nowrap">{t('date')}</th>
                <th className="px-1 py-2 font-extrabold text-center sm:px-2 sm:py-3 whitespace-nowrap">{t('name')}</th>
                <th className="px-1 py-2 font-extrabold text-center sm:px-2 sm:py-3 whitespace-nowrap">{t('time')}</th>
                <th className="px-1 py-2 font-extrabold text-center sm:px-2 sm:py-3 whitespace-nowrap"></th>
                {user?.role === 'instructor' && (
                  <th className="px-1 py-2 font-semibold text-center sm:px-2 sm:py-3 whitespace-nowrap">{t('user')}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'instructor' ? 5 : 4} className="py-6 sm:py-10 text-center text-[#4A2C2A] bg-white">
                    <div className="flex flex-col items-center">
                      <div className="mb-2 text-base font-medium sm:text-lg">{t('no_bookings_found')}</div>
                      <div className="text-xs text-gray-500 sm:text-sm">{t('no_bookings_yet')}</div>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((b, index) => (
                  <motion.tr
                    key={b.booking_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index, ease: 'easeOut' }}
                    className="text-center transition-colors duration-150 border-b border-gray-200"
                  >
                    <td className="py-1 px-1 sm:py-2 sm:px-2 text-[#4A2C2A] font-semibold break-words max-w-[80px] align-middle">{b.date}</td>
                    <td className="py-1 px-1 sm:py-2 sm:px-2 text-[#4A2C2A] font-semibold break-words max-w-[100px] align-middle">{b.name}</td>
                    <td className="py-1 px-1 sm:py-2 sm:px-2 text-[#4A2C2A] font-semibold break-words max-w-[80px] align-middle">
                      {b.from}{b.to && ` - ${b.to}`}
                    </td>
                    <td className="px-1 py-1 align-middle sm:py-2 sm:px-2">
                      <button
                        onClick={() => handleCancelBooking(b.booking_id)}
                        className="block px-2 py-1 mx-auto text-xs font-bold text-white transition-colors bg-red-600 rounded-full hover:bg-red-700">
                        {t('cancel')}
                      </button>
                    </td>
                    {user?.role === 'instructor' && (
                      <td className="py-1 px-1 sm:py-2 sm:px-2 text-[#4A2C2A] font-medium text-center break-words max-w-[80px] align-middle">{b.user}</td>
                    )}
                  </motion.tr>
                ))
              )}
            </tbody>
          </motion.table>
        </div>
      </motion.div>
      <ToastContainer toasts={toasts} hideToast={hideToast} />
    </div>
  );
}