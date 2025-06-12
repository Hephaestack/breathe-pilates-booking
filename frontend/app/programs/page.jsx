'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';


const mockPrograms = {
  '2025-07-16': [
    {
      time: '09:00',
      name: 'Morning Pilates',
      instructor: { name: 'Anna', id: 1 },
      location: 'Studio A',
      capacity: 10,
      booked: 7,
    },
    {
      time: '18:00',
      name: 'Evening Flow',
      instructor: { name: 'Maria', id: 2 },
      location: 'Studio B',
      capacity: 12,
      booked: 12,
    },
  ],
  '2025-07-17': [
    {
      time: '10:00',
      name: 'Core Strength',
      instructor: { name: 'John', id: 3 },
      location: 'Studio A',
      capacity: 8,
      booked: 5,
    },
  ],
};

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ProgramsPage() {

  const [selectedDate, setSelectedDate] = useState(new Date('2025-07-16'));
  const router = useRouter();

  const dateKey = formatDate(selectedDate);
  const programs = mockPrograms[dateKey] || [];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md flex flex-col items-center">
        <h1 className="text-2xl font-bold text-white mb-4 text-center">
          Available Programs
        </h1>
        <div
          className="w-full mb-6 flex flex-col items-center rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #c0ffb3 0%, #f9f871 100%)',
            borderRadius: '1.5rem',
            padding: '1.5rem 0.5rem 2rem 0.5rem',
          }}
        >
          <Calendar
            locale="el-GR" 
            onChange={setSelectedDate}
            value={selectedDate}
            className="react-calendar w-full border-0 bg-transparent "
            tileClassName={({ date, view }) => {
              const key = formatDate(date);
              if (view === 'month' && mockPrograms[key]) {
                return 'has-program';
              }
              return '';
            }}
          />
          <button
            className="mt-4 px-6 py-2 rounded-xl bg-[#43a1ff] text-white font-bold shadow hover:bg-[#2563eb] transition"
            onClick={() => {
              if (programs.length > 0) {
                router.push(`/book/${dateKey}?program=${encodeURIComponent(programs[0].name)}`);
              } else {
                alert('No programs available for this date.');
              }
            }}
            disabled={programs.length === 0}
          >
            Book Now
          </button>
        </div>
        <div className="w-full  rounded-2xl shadow-lg p-5 flex flex-col items-center">
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
                  className="p-4 rounded-xl bg-[#ffffff] flex flex-col items-center shadow"
                >
                  <span className="font-bold text-lg">{prog.time}</span>
                  <span className="text-base">{prog.name}</span>
                  <span className="text-sm text-gray-700">
                    Instructor: {prog.instructor.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    Location: {prog.location}
                  </span>
                  <span className="text-xs text-gray-500">
                    {prog.booked}/{prog.capacity} booked
                  </span>
                  <button
                    className="mt-2 px-4 py-1 rounded bg-[#3b3541] text-white font-semibold hover:bg-[#a259ec] transition"
                    onClick={() =>
                      router.push(`/book/${dateKey}?program=${encodeURIComponent(prog.name)}`)
                    }
                  >
                    Book
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}