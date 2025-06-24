'use client';
import { useRef } from 'react';
import { useState } from 'react';
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
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [selecting, setSelecting] = useState(false);
  const lastClickRef = useRef({ date: null, time: 0 });
  const justClearedRef = useRef(false); // <-- Add this ref
  const router = useRouter();

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
      justClearedRef.current = true; // <-- Set flag
    } else {
      // Single click: select date
      setDateRange([date, date]);
      setSelecting(true);
      lastClickRef.current = { date, time: now };
      justClearedRef.current = false; // <-- Reset flag
    }
  };
  // Get all dates in the selected range
  const [start, end] = dateRange;
  const datesInRange =
    start && end
      ? getDatesInRange(start, end)
      : start
      ? [start]
      : [];

  // Collect all programs in the range
  const programsInRange = datesInRange
    .map((date) => {
      const key = formatDate(date);
      return { date, programs: mockPrograms[key] || [] };
    })
    .filter((entry) => entry.programs.length > 0);

 return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="  bg-white/80 backdrop-blur-lg  rounded-3xl shadow-2xl shadow-[#3a2826] px-8 py-10 w-full flex flex-col items-center  max-w-md">
        <h1 className=" text-2xl font-bold mb-9 text-center">
          {t('available_programs')}
        </h1>
        <div className="calendar-center drop-shadow-xl shadow-[#302f2f]">
          <Calendar
  selectRange
  locale={calendarLocale}
            value={dateRange}
            onChange={(range) => {
              if (justClearedRef.current) {
                // Prevent range selection after double-click clear
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
        <div className="flex flex-col items-center w-full p-5 border-[#4A2C2A]/30 shadow-[#3a2826]">
          <h2 className="text-lg font-semibold text-[#4A2C2A] mb-3 text-center">
  {start && end
    ? start.getTime() === end.getTime()
      ? formatDateDisplay(start)
      : `${formatDateDisplay(start)} - ${formatDateDisplay(end)}`
    : start
    ? formatDateDisplay(start)
    : ''}
</h2>
          {programsInRange.length === 0 ? (
            <p className="text-center text-[#4A2C2A] ">{t('no_programs')}</p>
          ) : (
            <ul className="w-full space-y-6">
              {programsInRange.map(({ date, programs }) => (
                <li key={formatDate(date)}>
                  <div className="font-bold mb-2 text-[#4A2C2A]">
                    {formatDateDisplay(date)}
                  </div>
                  <ul className="space-y-3">
                    {programs.map((prog, idx) => {
                      const isFull = prog.booked >= prog.capacity;
                      const borderColor = isFull
                        ? 'border-red-400'
                        : 'border-green-400';
                      return (
                        <li
                          key={idx}
                          className={`p-4 rounded-xl bg-[#ffffff] flex items-center justify-between shadow border-2 ${borderColor}`}
                        >
                          <div className="flex flex-col text-[#4A2C2A] ">
                            <span className="text-lg font-bold">{prog.time}</span>
                            <span className="text-base">{prog.name}</span>
                            <span className="mt-1 text-sm font-semibold">
                              {prog.booked} / {prog.capacity}
                            </span>
                          </div>
                          <button
                            className={`ml-4 px-4 py-2 rounded-xl font-semibold shadow transition ${
                              isFull
                                ? 'bg-red-500 text-white cursor-not-allowed'
                                : 'bg-green-400 text-white hover:bg-green-500'
                            }`}
                            disabled={isFull}
                            onClick={() =>
                              router.push(
                                `/book/${formatDate(date)}?program=${encodeURIComponent(
                                  prog.name
                                )}`
                              )
                            }
                          >
                            {t('book')}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
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
  /* Only highlight range dates that also have a program */
  .react-calendar__tile--range.has-program,
  .react-calendar__tile--active.has-program,
  .react-calendar__tile--rangeStart.has-program,
  .react-calendar__tile--rangeEnd.has-program {
    background: #34d399 !important;
    color: #fff !important;
  }
  /* Range dates without a program: use light brown */
  .react-calendar__tile--range:not(.has-program),
  .react-calendar__tile--rangeStart:not(.has-program),
  .react-calendar__tile--rangeEnd:not(.has-program) {
    background: #e7c9a9 !important; /* Light brown */
    color: #4A2C2A !important;      /* Dark brown text */
    border-radius: 50% !important;
  }
  /* Today in range, but not a program */
  .react-calendar__tile--now.react-calendar__tile--range:not(.has-program) {
    background: #e7c9a9 !important;
    color: #4A2C2A !important;
  }
`}</style>
    </div>
  );
}