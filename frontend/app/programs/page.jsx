'use client';

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

export default function ProgramsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const router = useRouter();
  const { t } = useTranslation();

  const dateKey = formatDate(selectedDate);
  const programs = mockPrograms[dateKey] || [];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="flex flex-col items-center w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#ffffff] mb-4 text-center">
          {t('available_programs')}
        </h1>
        <div className="calendar-center">
          <Calendar
            selectRange
            value={dateRange}
            onChange={(range) => {
              setDateRange(range);
              // If a single date is selected, update selectedDate for program display
              if (Array.isArray(range) && range[0] instanceof Date) {
                setSelectedDate(range[0]);
              } else if (range instanceof Date) {
                setSelectedDate(range);
              }
            }}
            locale="en-GB"
            tileClassName={({ date, view }) => {
              const key = formatDate(date);
              if (view === 'month' && mockPrograms[key]) {
                return 'has-program';
              }
              return '';
            }}
          />
        </div>
        <div className="flex flex-col items-center w-full p-5   border-[#4A2C2A]/30 shadow-[#3a2826]">
          <h2 className="text-lg font-semibold text-[#4A2C2A] mb-3 text-center">
            {formatDateDisplay(selectedDate)}
          </h2>
          {programs.length === 0 ? (
            <p className="text-center text-[#4A2C2A] ">{t('no_programs')}</p>
          ) : (
            <ul className="w-full space-y-3">
              {programs.map((prog, idx) => {
                const isFull = prog.booked >= prog.capacity;
                const borderColor = isFull ? 'border-red-400' : 'border-green-400';
                return (
                  <li
                    key={idx}
                    className={`p-4 rounded-xl bg-[#ffffff] flex items-center justify-between shadow border-2 ${borderColor}`}
                  >
                    <div className="flex flex-col text-[#4A2C2A] ">
                      <span className="text-lg font-bold">{prog.time}</span>
                      <span className="text-base">{prog.name}</span>
                      <span className="text-sm text-[#4A2C2A] ">
                        {t('instructor')}: {prog.instructor}
                      </span>
                      <span className="text-sm font-semibold mt-1">
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
                          `/book/${dateKey}?program=${encodeURIComponent(prog.name)}`
                        )
                      }
                    >
                      {t('book')}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      {/* Add this CSS to your global stylesheet */}
      <style jsx global>{`
        .has-program {
          background: #d1fae5 !important;
          border-radius: 50% !important;
          color: #065f46 !important;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}