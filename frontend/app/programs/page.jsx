'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const mockPrograms = {
  '2025-07-16': [
    { time: '09:00', name: 'Morning Pilates', instructor: 'Anna', capacity: 10, booked: 7 },
    { time: '18:00', name: 'Evening Flow', instructor: 'Maria', capacity: 12, booked: 12 },
  ],
  '2025-07-17': [
    { time: '10:00', name: 'Core Strength', instructor: 'John', capacity: 8, booked: 5 },
  ],
  '2025-07-18': [
    { time: '12:00', name: 'Stretch & Relax', instructor: 'Sophie', capacity: 10, booked: 3 },
    { time: '19:00', name: 'Power Pilates', instructor: 'Chris', capacity: 10, booked: 10 },
  ],
  '2025-07-20': [
    { time: '08:30', name: 'Sunrise Yoga', instructor: 'Helen', capacity: 8, booked: 2 },
  ],
};

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getNextDays(startDate, count = 5) {
  const days = [];
  let current = new Date(startDate);
  for (let i = 0; i < count; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

export default function ProgramsPage() {
  const { t, i18n } = useTranslation();
  const calendarLocale = i18n.language === 'gr' ? 'el-GR' : 'en-US';
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [selecting, setSelecting] = useState(false);
  const lastClickRef = useRef({ date: null, time: 0 });
  const justClearedRef = useRef(false);
  const [filter, setFilter] = useState('');
  const router = useRouter();

  // Επόμενες 5 μέρες για το row
  const daysRow = getNextDays(new Date());

  // Επιλεγμένη μέρα (αν range, πάρε την πρώτη)
  const selectedDate = dateRange[0] || new Date();

  // Προγράμματα για την επιλεγμένη μέρα
  const programs = mockPrograms[formatDate(selectedDate)] || [];
  const filteredPrograms = filter
    ? programs.filter(
        (p) =>
          p.name.toLowerCase().includes(filter.toLowerCase()) ||
          p.instructor.toLowerCase().includes(filter.toLowerCase())
      )
    : programs;

  // Calendar day click handler
  const handleDayClick = (date) => {
    const now = Date.now();
    if (
      lastClickRef.current.date &&
      lastClickRef.current.date.getTime() === date.getTime() &&
      now - lastClickRef.current.time < 300
    ) {
      // Double click detected: clear selection
      setDateRange([null, null]);
      setSelecting(false);
      lastClickRef.current = { date: null, time: 0 };
      justClearedRef.current = true;
    } else {
      // Single click: select date
      setDateRange([date, date]);
      setSelecting(true);
      lastClickRef.current = { date, time: now };
      justClearedRef.current = false;
    }
  };

  // Optional: handle double click on tile (for clearing)
  const handleDoubleClickDay = (date) => {
    setDateRange([null, null]);
    setSelecting(false);
    lastClickRef.current = { date: null, time: 0 };
    justClearedRef.current = true;
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen px-4 py-6 ">
      {/* Logo */}
      <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center mb-2 shadow border border-[#b3b18f]">
        <span className="text-xs text-[#4A2C2A]">logo</span>
      </div>

      {/* Days Row */}
      <div className="flex flex-row items-center justify-center w-full max-w-xs mb-3 space-x-2">
        {daysRow.map((day, idx) => (
          <button
            key={idx}
            className={`w-12 h-12 rounded-xl font-bold border flex flex-col items-center justify-center transition
              ${formatDate(day) === formatDate(selectedDate)
                ? 'bg-[#b3b18f] text-white border-[#b3b18f]'
                : 'bg-white/80 text-[#4A2C2A] border-[#b3b18f]'
              }`}
            onClick={() => setDateRange([day, day])}
          >
            <span className="text-xs">{day.toLocaleDateString('el-GR', { weekday: 'short' })}</span>
            <span className="text-base">{day.getDate()}</span>
          </button>
        ))}
      </div>

      {/* Calendar with selectRange */}
      <div className="calendar-center w-full max-w-xs mb-3">
        <Calendar
          selectRange
          locale={calendarLocale}
          value={dateRange}
          onChange={(range) => {
            if (justClearedRef.current) {
              justClearedRef.current = false;
              return;
            }
            if (Array.isArray(range) && range[1]) {
              setDateRange(range);
              setSelecting(false);
            }
          }}
          onClickDay={handleDayClick}
          tileClassName={({ date, view }) => {
            const key = formatDate(date);
            if (view === 'month' && mockPrograms[key]) {
              return 'has-program';
            }
            return '';
          }}
          tileContent={({ date, view }) =>
            view === 'month' ? (
              <div
                style={{ width: '100%', height: '100%' }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleDoubleClickDay(date);
                }}
              />
            ) : null
          }
        />
      </div>

      {/* Προγράμματα */}
      <div className="w-full max-w-xs flex-1 rounded-2xl border border-[#b3b18f] p-4 bg-white/80 shadow text-[#4A2C2A] min-h-[200px]">
        {filteredPrograms.length === 0 ? (
          <div className="text-center text-[#4A2C2A]  font-semibold mt-8">Δεν βρέθηκαν προγράμματα</div>
        ) : (
          filteredPrograms.map((prog, idx) => {
            const isFull = prog.booked >= prog.capacity;
            return (
              <div
                key={idx}
                className="mb-4 p-3 rounded-xl border border-[#b3b18f] bg-[#f9f9f6]/80 flex flex-col"
              >
                <div className="flex flex-row justify-between items-center">
                  <div>
                    <div className="text-lg font-bold text-[#4A2C2A] ">{prog.name}</div>
                    <div className="text-sm">{prog.time} - {prog.instructor}</div>
                    <div className="text-xs mt-1">{prog.booked} / {prog.capacity}</div>
                  </div>
                  <button
                    className={`ml-2 px-3 py-1 rounded-xl font-semibold shadow transition text-xs
                      ${isFull
                        ? 'bg-red-400 text-white cursor-not-allowed'
                        : 'bg-[#045e04] text-white hover:bg-[#a5957e]'
                      }`}
                    disabled={isFull}
                    onClick={() =>
                      router.push(
                        `/book/${formatDate(selectedDate)}?program=${encodeURIComponent(prog.name)}`
                      )
                    }
                  >
                    {t('book')}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style jsx global>{`
        .has-program {
          background: #B5651D !important;
          border-radius: 50% !important;
          color: #065f46 !important;
          font-weight: bold;
          position: relative;
          z-index: 2;
        }
      `}</style>
    </div>
  );
}