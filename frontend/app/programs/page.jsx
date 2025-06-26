'use client';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import useToast from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import { motion } from 'framer-motion';

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateDisplay(date) {
  // Returns DD/MM/YYYY
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
}

function getDatesInRange(start, end) {
  const dates = [];
  let current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export default function ProgramsPage() {
  const { t, i18n } = useTranslation();
  const calendarLocale = i18n.language === 'gr' ? 'el-GR' : 'en-US';
  const [selectedDate, setSelectedDate] = useState(new Date());
  const lastClickRef = useRef({ date: null, time: 0 });
  const justClearedRef = useRef(false);  const router = useRouter();
  const { toasts, hideToast, showSuccess, showError } = useToast();
  
  const [programsByDate, setProgramsByDate] = useState({});
  const [bookingLoading, setBookingLoading] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(true);

  useEffect(() => {
    setProgramsLoading(true);
    fetch('http://localhost:8000/classes')
      .then(res => res.json())
      .then(data => {
        const grouped = {};
        data.forEach(prog => {
          const key = prog.date;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(prog);
        });
        setProgramsByDate(grouped);
      })
      .finally(() => setProgramsLoading(false));
  }, []);
  useEffect(() => {
    // Fetch user bookings if logged in
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      fetch(`http://localhost:8000/users/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data.bookings)) {
            setUserBookings(data.bookings.map(b => b.class_id));
          } else {
            setUserBookings([]);
          }
        })
        .catch(() => setUserBookings([]));
    }
  }, []);
  const handleDayClick = (date) => {
    const now = Date.now();
    if (
      lastClickRef.current.date &&
      lastClickRef.current.date.getTime() === date.getTime() &&
      now - lastClickRef.current.time < 300
    ) {
      setSelectedDate(null);
      lastClickRef.current = { date: null, time: 0 };
      justClearedRef.current = true;
    } else {
      setSelectedDate(date);
      lastClickRef.current = { date, time: now };
      justClearedRef.current = false;
    }
  };

  // Get programs for the selected date
  const programsForSelectedDate = selectedDate 
    ? programsByDate[formatDate(selectedDate)] || []
    : [];

const handleBookProgram = async (program) => {
  try {
    setBookingLoading(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      showError(t('booking_login_required'));
      setBookingLoading(false);
      return;
    }

    const bookingData = {
      class_id: program.id,
      status: 'confirmed'
    };

    const response = await fetch(`http://localhost:8000/bookings?user_id=${user.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });

    const data = await response.json();

    if (response.ok) {
      showSuccess(t('booking_successful'));
      // Update participants count in state without reload
      setProgramsByDate(prev => {
        const dateKey = program.date;
        if (!prev[dateKey]) return prev;
        return {
          ...prev,
          [dateKey]: prev[dateKey].map(p =>
            p.id === program.id
              ? { ...p, current_participants: p.current_participants + 1 }
              : p
          )
        };
      });
      // Add to userBookings immediately for instant feedback
      setUserBookings(prev => [...prev, program.id]);
    } else {
      showError(t('booking_error') + (data.detail ? ': ' + data.detail : ''));
    }
  } catch (error) {
    console.error('Error:', error);
    showError(t('booking_connection_error'));
  } finally {
    setBookingLoading(false);
  }
};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-2 py-8 sm:px-4">
      {/* Booking loading overlay */}
      {bookingLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col items-center justify-center px-8 py-8 shadow-2xl bg-white/90 rounded-2xl"
          >
            <div className="animate-spin-pulse rounded-full h-12 w-12 border-b-4 border-[#b3b18f] mb-4"></div>
            <div className="text-base text-[#4A2C2A]">Booking in progress...</div>
          </motion.div>
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl shadow-[#3a2826] px-2 sm:px-6 py-4 sm:py-10 w-full flex flex-col items-center max-w-full sm:max-w-lg"
      >
        <h1 className="mb-6 text-xl font-bold text-center sm:text-2xl">
          {t('available_programs')}
        </h1>
        <div className="calendar-center drop-shadow-xl shadow-[#302f2f] w-full overflow-x-auto">
          <Calendar
            locale={calendarLocale}
            value={selectedDate}
            onChange={(date) => {
              if (justClearedRef.current) {
                justClearedRef.current = false;
                return;
              }
              setSelectedDate(date);
            }}
            onClickDay={handleDayClick}
            tileClassName={({ date, view }) => {
              const key = formatDate(date);
              if (view === 'month' && programsByDate[key]) {
                return 'has-program';
              }
              return '';
            }}
            tileContent={({ date, view }) =>
              view === 'month' ? (
                <div
                  style={{ width: '100%', height: '100%' }}
                />
              ) : null
            }
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="flex flex-col items-center w-full p-2 sm:p-5 border-[#4A2C2A]/30 shadow-[#3a2826]"
        >
          <h2 className="text-base sm:text-lg font-semibold text-[#4A2C2A] mb-3 text-center">
            {selectedDate ? formatDateDisplay(selectedDate) : ''}
          </h2>
          {programsLoading ? (
            <div className="flex items-center justify-center w-full py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A2C2A] mr-3"></div>
              <span className="text-[#4A2C2A] font-bold">{t('loading')}</span>
            </div>
          ) : programsForSelectedDate.length === 0 ? (
            <p className="text-center text-[#4A2C2A] ">{t('no_programs')}</p>
          ) : (
            <ul className="w-full space-y-4">
              {programsForSelectedDate.map((prog, idx) => {
                const isFull = prog.current_participants >= prog.max_participants;
                const isBooked = userBookings.includes(prog.id);
                return (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 * idx, ease: 'easeOut' }}
                    className="p-2 bg-white border-teal-300 rounded-2xl border-1 sm:p-4"
                  >
                    <div className="text-center">
                      <div className="text-base sm:text-lg font-bold text-[#4A2C2A] mb-2">{prog.time} - {prog.class_name}</div>
                      <div className="text-xs sm:text-sm text-[#4A2C2A] mb-4">
                        {prog.current_participants} / {prog.max_participants}
                      </div>
                      <button
                        className={`w-full font-bold py-2 sm:py-3 px-2 sm:px-6 rounded-xl transition-colors ${
                          isBooked
                            ? 'bg-red-500 text-white cursor-not-allowed opacity-80'
                            : isFull || bookingLoading
                              ? 'bg-red-500 text-white cursor-not-allowed opacity-60'
                              : 'bg-green-400 text-white hover:bg-green-500'
                        }`}
                        disabled={isFull || bookingLoading || isBooked}
                        onClick={() => !isBooked && handleBookProgram(prog)}
                      >
                        {isBooked ? 'Booked' : t('book')}
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </motion.div>
      </motion.div>
      <ToastContainer toasts={toasts} hideToast={hideToast} />
      <style jsx global>{`
        /* Days with programs */
        .has-program {
          background: #dbdac6 !important; /* light brown */
          border-radius: 50% !important;
          color: #4A2C2A !important;
          font-weight: bold;
          position: relative;
          z-index: 2;
        }
        /* Selected/Active day styling - any day */
        .react-calendar__tile--active {
          background: #b3b18f !important; /* more intense brown */
          color: #fff !important;
          border-radius: 50% !important;
          font-weight: 600 !important;
          border: none !important;
        }
        /* Selected day with program */
        .react-calendar__tile--active.has-program {
          background: #b3b18f !important; /* more intense brown */
          color: #fff !important;
          border: none !important;
        }
        /* Spinner pulse animation */
        @keyframes spin-pulse {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.15); }
          100% { transform: rotate(360deg) scale(1); }
        }
        .animate-spin-pulse {
          animation: spin-pulse 1s linear infinite;
        }
        /* Removed all styling for .react-calendar__tile--now (current date) */
      `}</style>
    </div>
  );
}