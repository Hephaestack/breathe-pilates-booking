'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const mockPrograms = {
  '2025-07-16': [
    { time: '09:00', name: 'Morning Pilates', instructor: 'Anna' },
    { time: '18:00', name: 'Evening Flow', instructor: 'Maria' },
  ],
  '2025-07-17': [
    { time: '10:00', name: 'Core Strength', instructor: 'John' },
  ],
  '2025-07-18': [
    { time: '12:00', name: 'Stretch & Relax', instructor: 'Sophie' },
    { time: '19:00', name: 'Power Pilates', instructor: 'Chris' },
  ],
  '2025-07-20': [
    { time: '08:30', name: 'Sunrise Yoga', instructor: 'Helen' },
  ],
};

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ProgramsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const router = useRouter();

  const dateKey = formatDate(selectedDate);
  const programs = mockPrograms[dateKey] || [];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="flex flex-col items-center w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#ffffff] mb-4 text-center">
          Available Programs
        </h1>
        <div className="flex flex-col items-center w-full p-4 mb-6 rounded-2xl">
          <Calendar
            locale="el-GR"
            onChange={setSelectedDate}
            value={selectedDate}
            className="w-full border-0 react-calendar"
            tileClassName={({ date, view }) => {
              const key = formatDate(date);
              if (view === 'month' && mockPrograms[key]) {
                return 'has-program';
              }
              return '';
            }}
          />
          {/* Button moved below the calendar */}
          <button
            className="mt-4 px-6 py-2 bg-[#BFA2DB] text-white font-semibold rounded-xl shadow hover:bg-[#a58e8c] transition"
            onClick={() => router.push('/book/[date]')}
          >
            Book a Program
          </button>
        </div>
        <div className="flex flex-col items-center w-full p-5 bg-white shadow-lg rounded-2xl">
          <h2 className="text-lg font-semibold text-[#000000] mb-3 text-center">
            {selectedDate.toLocaleDateString()}
          </h2>
          {programs.length === 0 ? (
            <p className="text-center text-gray-400">No programs available for this date.</p>
          ) : (
            <ul className="w-full space-y-3">
              {programs.map((prog, idx) => (
                <li
                  key={idx}
                  className="p-4 rounded-xl bg-[#FEC8D8] flex flex-col items-center shadow"
                >
                  <span className="text-lg font-bold">{prog.time}</span>
                  <span className="text-base">{prog.name}</span>
                  <span className="text-sm text-gray-700">Instructor: {prog.instructor}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}