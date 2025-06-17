'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';
import 'react-calendar/dist/Calendar.css';

// Toast library (simple, no extra install needed)
function Toast({ message, onClose }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#4A2C2A] text-white px-6 py-3 rounded-xl shadow-lg z-50 font-semibold text-center">
      {message}
    </div>
  );
}

const Calendar = dynamic(() => import('react-calendar'), { ssr: false });

const availableSubscriptions = [
  { id: 1, name: 'Monthly Pilates' },
  { id: 2, name: '10-Class Package' },
  { id: 3, name: 'Unlimited Summer' },
];

export default function CreateUserPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    subscription: '',
  });
  const [dateRange, setDateRange] = useState([null, null]);
  const [toast, setToast] = useState(null);

  // Double-click logic
  const lastClickRef = useRef({ date: null, time: 0 });
  const justClearedRef = useRef(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleDayClick = (date) => {
    const now = Date.now();
    if (
      lastClickRef.current.date &&
      lastClickRef.current.date.getTime() === date.getTime() &&
      now - lastClickRef.current.time < 300
    ) {
      // Double click detected: clear selection
      setDateRange([null, null]);
      lastClickRef.current = { date: null, time: 0 };
      justClearedRef.current = true;
    } else {
      // Single click: select date
      setDateRange([date, date]);
      lastClickRef.current = { date, time: now };
      justClearedRef.current = false;
    }
  };

  const handleCalendarChange = (range) => {
    if (justClearedRef.current) {
      justClearedRef.current = false;
      return;
    }
    if (Array.isArray(range) && range[1]) {
      setDateRange(range);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Username must be numbers only
    if (!/^\d+$/.test(form.name)) {
      setToast(t('username_numbers_only'));
      return;
    }
    // Location must be numbers and letters only (no symbols)
    if (!/^[\w\s\d]+$/i.test(form.city)) {
      setToast(t('location_letters_numbers_only'));
      return;
    }

    let startDate, endDate;
    if (Array.isArray(dateRange) && dateRange[0] && dateRange[1]) {
      startDate = dateRange[0];
      endDate = dateRange[1];
    } else if (dateRange && dateRange[0]) {
      startDate = endDate = dateRange[0];
    } else {
      setToast(t('select_dates'));
      return;
    }

    alert(
      t('user_created') +
        ':\n' +
        JSON.stringify(
          {
            ...form,
            startDate: startDate?.toLocaleDateString('en-GB'),
            endDate: endDate?.toLocaleDateString('en-GB'),
          },
          null,
          2
        )
    );
    setForm({
      name: '',
      phone: '',
      city: '',
      subscription: '',
    });
    setDateRange([null, null]);
  };

  // For display
  let displayDates = '';
  if (Array.isArray(dateRange) && dateRange[0] && dateRange[1]) {
    displayDates = t('selected_dates', {
      start: dateRange[0].toLocaleDateString('en-GB'),
      end: dateRange[1].toLocaleDateString('en-GB'),
    });
  } else if (dateRange && dateRange[0]) {
    displayDates = t('selected_dates', {
      start: dateRange[0].toLocaleDateString('en-GB'),
      end: dateRange[0].toLocaleDateString('en-GB'),
    });
  } else {
    displayDates = t('select_dates');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-2xl px-6 py-8 shadow-[#4A2C2A]">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#b3b18f] via-[#A5957E] to-[#000000] bg-clip-text text-transparent tracking-tight drop-shadow text-center">
          {t('create_user')}
        </h1>
        <form
          className="flex flex-col gap-4 text-[#4A2C2A]"
          onSubmit={handleSubmit}
        >
          {/* Name */}
          <label className="font-semibold">
            {t('name')}
            <input
              className="block w-full p-2 mt-1 border rounded focus:outline-none"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>
          {/* Phone */}
          <label className="font-semibold">
            Phone
            <input
              className="block w-full p-2 mt-1 border rounded focus:outline-none"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </label>
          {/* Location */}
          <label className="font-semibold">
            {t('location')}
            <input
              className="block w-full p-2 mt-1 border rounded focus:outline-none"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
            />
          </label>
          {/* Subscription */}
          <label className="font-semibold">
            {t('subscription')}
            <select
              className="block w-full p-2 mt-1 border rounded focus:outline-none"
              name="subscription"
              value={form.subscription}
              onChange={handleChange}
              required
            >
              <option value="">{t('select_subscription')}</option>
              {availableSubscriptions.map((sub) => (
                <option key={sub.id} value={sub.name}>
                  {sub.name}
                </option>
              ))}
            </select>
          </label>
          {/* Calendar */}
          <label className="font-semibold text-center">{t('start_end_date')}</label>
          <div className="calendar-center">
           <Calendar
  selectRange
  value={dateRange}
  onChange={handleCalendarChange}
  onClickDay={handleDayClick}
  locale="en-GB"
/>
          </div>
          <div className="mt-2 text-sm text-[#4A2C2A] text-center">
            {displayDates}
          </div>
          {/* Submit */}
          <button
            type="submit"
            className="text-white mt-4 px-6 py-2 bg-gradient-to-r from-[#b3b18f] via-[#A5957E] to-[#4A2C2A] duration-300 ease-in-out font-semibold rounded-xl shadow transition"
          >
            {t('create')}
          </button>
        </form>
        <div className="flex justify-between mt-6"></div>
      </div>
      <style jsx global>{`
  .react-calendar__tile--range,
  .react-calendar__tile--rangeStart,
  .react-calendar__tile--rangeEnd {
    background: #e7c9a9 !important; /* Light brown */
    color: #4A2C2A !important;      /* Dark brown text */
    border-radius: 50% !important;
  }
  .react-calendar__tile--now.react-calendar__tile--range {
    background: #e7c9a9 !important;
    color: #4A2C2A !important;
  }
`}</style>
    </div>
  );
}