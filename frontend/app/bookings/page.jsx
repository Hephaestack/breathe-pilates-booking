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

// Helper function to format time to HH:mm (removes seconds)
function formatTime(timeString) {
  if (!timeString) return '';
  // Handles both 'HH:mm:ss' and 'HH:mm' formats
  const [hour, minute] = timeString.split(':');
  return `${hour}:${minute}`;
}

// Get user from localStorage
function getUser() {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
}

// Helper to check if a booking is due (date+from time is in the past)
function isBookingDue(dateStr, fromTime) {
  if (!dateStr || !fromTime) return false;
  const [day, month, year] = dateStr.split('/');
  const [hour, minute] = fromTime.split(':');
  const bookingDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
  return bookingDate < new Date();
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${storedUser.id}`);
        
        if (!response.ok) {
          throw new Error(t('failed_fetch_user_data'));
        }

        const userData = await response.json();
        
        // Transform bookings data to match the expected format
        let transformedBookings = userData.bookings?.map(booking => {
          const [fromRaw, toRaw] = booking.class_.time.split('-').map(s => s.trim());
          return {
            id: booking.id,
            date: formatDate(booking.class_.date),
            name: booking.class_.class_name,
            from: formatTime(fromRaw),
            to: formatTime(toRaw),
            user: userData.name,
            status: booking.status,
            class_id: booking.class_id,
            booking_id: booking.id
          };
        }) || [];

        // Sort bookings by date, then by 'from' time (earliest first)
        transformedBookings = transformedBookings.slice().sort((a, b) => {
          // Parse date as YYYY-MM-DD for comparison
          const parseDate = (d) => {
            const [day, month, year] = d.split('/');
            return new Date(`${year}-${month}-${day}`);
          };
          const dateA = parseDate(a.date);
          const dateB = parseDate(b.date);
          if (dateA < dateB) return -1;
          if (dateA > dateB) return 1;
          // If same date, compare time
          const getMinutes = (t) => {
            if (!t) return 0;
            const [h, m] = t.split(':');
            return parseInt(h, 10) * 60 + parseInt(m, 10);
          };
          return getMinutes(a.from) - getMinutes(b.from);
        });

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}?user_id=${storedUser.id}`, {
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

  useEffect(() => {
    const hideScrollbar = () => {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.documentElement.style.height = '100vh';
    };

    const restoreScrollbar = () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.height = '';
    };

    if (loading) {
      hideScrollbar();
    } else {
      restoreScrollbar();
    }

    return () => {
      restoreScrollbar();
    };
  }, [loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-2 py-8 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-white/70 rounded-2xl shadow-2xl px-2 py-6 sm:px-4 border border-[#4A2C2A]/30 shadow-[#3a2826] w-full max-w-md"
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

  // Split bookings into upcoming and due
  const upcomingBookings = bookings.filter(b => !isBookingDue(b.date, b.from));
  const dueBookings = bookings.filter(b => isBookingDue(b.date, b.from));

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
        <div className="flex justify-center w-full">
          <motion.table
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
            className="w-full max-w-xs mx-auto text-xs border-collapse sm:max-w-full sm:text-sm"
          >
            <thead>
              <tr className="bg-[#dbdac6] text-[#4A2C2A] text-center">
                <th className="px-2 py-3 font-bold text-center border-b border-[#dbdac6] rounded-tl-xl">{t('date')}</th>
                <th className="px-2 py-3 font-bold text-center border-b border-[#dbdac6]">{t('name')}</th>
                <th className="px-2 py-3 font-bold text-center border-b border-[#dbdac6]">{t('time')}</th>
                <th className="px-2 py-3 font-bold text-center border-b border-[#dbdac6] rounded-tr-xl"></th>
              </tr>
            </thead>
            <tbody>
              {upcomingBookings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-[#4A2C2A] bg-white   rounded-bl-xl rounded-br-xl">
                    <div className="flex flex-col items-center">
                      <div className="mb-2 text-base font-bold">{t('no_bookings_found')}</div>
                     </div>
                  </td>
                </tr>
              ) : (
                upcomingBookings.map((b, index) => (
                  <motion.tr
                    key={b.booking_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index, ease: 'easeOut' }}
                    className={`text-center bg-white ${index < upcomingBookings.length - 1 ? 'border-b border-[#dbdac6]' : 'rounded-bl-xl rounded-br-xl'}`}
                  >
                    <td className={`py-2 px-2 text-[#4A2C2A] font-bold ${index === upcomingBookings.length - 1 ? 'rounded-bl-xl' : ''}`}>{b.date}</td>
                    <td className="py-2 px-2 text-[#4A2C2A] font-bold">{b.name}</td>
                    <td className="py-2 px-2 text-[#4A2C2A] font-bold">
                      {b.from}{b.to && ` - ${b.to}`}
                    </td>
                    <td className={`py-2 px-2 ${index === upcomingBookings.length - 1 ? 'rounded-br-xl' : ''}`}>
                      <button
                        onClick={() => handleCancelBooking(b.booking_id)}
                        className="px-3 py-1 text-xs font-bold text-white bg-red-600 rounded-full hover:bg-red-700"
                      >
                        {t('cancel')}
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </motion.table>
        </div>
      </motion.div>
      {/* Due Bookings Table */}
      {dueBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl px-1 py-2 sm:px-6 sm:py-8 border border-[#4A2C2A]/30 shadow-[#3a2826] w-full max-w-md sm:max-w-2xl flex flex-col items-center mt-8"
        >
          <div className="flex items-center justify-center w-full mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-500 tracking-tight drop-shadow text-center w-full">
              {t('past_bookings') || 'Past Bookings'}
            </h2>
          </div>
          <div className="flex justify-center w-full">
            <motion.table
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              className="w-full max-w-xs mx-auto text-xs border-collapse sm:max-w-full sm:text-sm"
            >
              <thead>
                <tr className="bg-[#dbdac6] text-[#4A2C2A] text-center">
                  <th className="px-2 py-3 font-bold text-center border-b border-[#dbdac6] rounded-tl-xl">{t('date')}</th>
                  <th className="px-2 py-3 font-bold text-center border-b border-[#dbdac6]">{t('name')}</th>
                  <th className="px-2 py-3 font-bold text-center border-b border-[#dbdac6]">{t('time')}</th>
                  <th className="px-2 py-3 font-bold text-center border-b border-[#dbdac6] rounded-tr-xl"></th>
                </tr>
              </thead>
              <tbody>
                {dueBookings.map((b, index) => (
                  <motion.tr
                    key={b.booking_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index, ease: 'easeOut' }}
                    className={`text-center bg-white opacity-60  ${index === dueBookings.length - 1 ? 'border-b-0' : ''}
                    ${index < dueBookings.length - 1 ? 'border-b border-[#dbdac6]' : 'rounded-bl-xl rounded-br-xl'}`}
                  >
                    <td className={`py-2 px-2 text-[#4A2C2A] font-bold ${index === dueBookings.length - 1 ? 'rounded-bl-xl' : ''}`}>{b.date}</td>
                    <td className="py-2 px-2 text-[#4A2C2A] font-bold">{b.name}</td>
                    <td className="py-2 px-2 text-[#4A2C2A] font-bold">
                      {b.from}{b.to && ` - ${b.to}`}
                    </td>
                    <td className={`py-2 px-2 ${index === dueBookings.length - 1 ? 'rounded-br-xl' : ''}`}>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </motion.table>
          </div>
        </motion.div>
      )}
      <ToastContainer toasts={toasts} hideToast={hideToast} />
    </div>
  );
}