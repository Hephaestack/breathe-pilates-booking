'use client';

import { useState } from 'react';
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
};

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ProgramsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateKey = formatDate(selectedDate);
  const programs = mockPrograms[dateKey] || [];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#FAF9F6] px-4 py-8">
      <div className="w-full max-w-md flex flex-col items-center">
        <h1 className="text-2xl font-bold text-[#BFA2DB] mb-4 text-center">
          Available Programs
        </h1>
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 w-full flex flex-col items-center">
          <Calendar
                locale="el-GR"
                onChange={setSelectedDate}
                value={selectedDate}
                className="react-calendar border-0 w-full"
                tileClassName={({ date, view }) => {
                    const key = formatDate(date);
                    if (view === 'month' && mockPrograms[key]) {
                    return 'has-program';
                    }
                    return '';
             }}
                />
        </div>
        <div className="w-full bg-white rounded-2xl shadow-lg p-5 flex flex-col items-center">
          <h2 className="text-lg font-semibold text-[#BFA2DB] mb-3 text-center">
            {selectedDate.toLocaleDateString()}
          </h2>
          {programs.length === 0 ? (
            <p className="text-gray-400 text-center">No programs available for this date.</p>
          ) : (
            <ul className="space-y-3 w-full">
              {programs.map((prog, idx) => (
                <li
                  key={idx}
                  className="p-4 rounded-xl bg-[#FEC8D8] flex flex-col items-center shadow"
                >
                  <span className="font-bold text-lg">{prog.time}</span>
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