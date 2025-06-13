'use client';

import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

// Mock data for demonstration (replace with your real data/fetch)
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

function formatDate(dateString) {
  // Expects dateString in 'YYYY-MM-DD'
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export default function BookDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const date = params.date;
  const programName = searchParams.get('program');
  const program =
    mockPrograms[date]?.find((p) => p.name === programName) || null;

  // Booking handler: sends only program and date, user info comes from backend JWT
  const handleBook = async () => {
    if (!program || program.booked >= program.capacity) return;
    setLoading(true);
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // sends cookies (with JWT) automatically
        body: JSON.stringify({
          program: program.name,
          date: date,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Booking confirmed!');
        router.push('/programs');
      } else {
        alert(data.message || 'Booking failed!');
      }
    } catch (err) {
      alert('Booking failed!');
    }
    setLoading(false);
  };

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="bg-white rounded-2xl shadow-2xl px-6 py-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-[#000000] mb-4">Program not found</h2>
          <button
            className="mt-4 px-6 py-2 bg-[#ffffff] text-black rounded-xl font-semibold hover:bg-[#222122] transition"
            onClick={() => router.push('/programs')}
          >
            Back to Calendar
          </button>
        </div>
      </div>
    );
  }

  // Determine border color based on availability
  const isFull = program.booked >= program.capacity;
  const borderColor = isFull ? 'border-red-300' : 'border-green-300';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center  px-2 py-8">
      <div className={`bg-white rounded-2xl shadow-2xl px-4 py-6 border-4 ${borderColor} w-full max-w-md shadow-[#50322f]`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#000000] flex items-center gap-2 ">
            Booking Details
          </h2>
          <button
            className="text-2xl text-gray-400 hover:text-[#ffffff] transition"
            onClick={() => router.push('/programs')}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="bg-gradient-to-r from-[#a09e7e] via-[#A5957E] to-[#50322f] rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="font-semibold text-[#ffffff]">Class</div>
            <div className="font-semibold text-[#ffffff]">Location</div>
            <div className="text-[#fff]">{program.name}</div>
            <div className="text-[#fff]">{program.location}</div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="font-semibold text-[#fff]">
                Participants:&nbsp;
              </span>
              <span className={`inline-block rounded px-2 py-0.5 font-semibold ${isFull ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                {program.booked} / {program.capacity}
              </span>
            </div>
            <button
              className="ml-4 px-4 py-2 bg-[#black] text-white font-semibold rounded-xl shadow hover:bg-[#a58e8c] transition"
              disabled={isFull || loading}
              onClick={handleBook}
            >
              {loading ? 'Booking...' : 'Book a Program'}
            </button>
          </div>
        </div>
        <table className="w-full text-sm mt-2">
          <thead>
            <tr className="text-[#50322f] bg-[#ffffff]">
              <th className="py-1 px-2 font-semibold">Date</th>
              <th className="py-1 px-2 font-semibold">From</th>
              <th className="py-1 px-2 font-semibold">To</th>
              <th className="py-1 px-2 font-semibold">Bookings</th>
              <th className="py-1 px-2 font-semibold">Waitlist</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-[#b3b18f]">
              <td className="py-1 px-2 text-center">{formatDate(date)}</td>
              <td className="py-1 px-2 text-center">{program.time}</td>
              <td className="py-1 px-2 text-center">{program.to || '--'}</td>
              <td className="py-1 px-2 text-center">
                <span className="inline-block bg-[#b3b18f] rounded px-2 py-0.5 text-[#ffffff] font-semibold">
                  {program.booked} / {program.capacity}
                </span>
              </td>
              <td className="py-1 px-2 text-center">
                <span className="inline-block bg-[#b3b18f] rounded px-2 py-0.5 text-[#ffffff] font-semibold">
                  0
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="flex flex-col items-center mt-4">
          <button
            className="bg-[#4A2C2A] hover:bg-[#724340] text-white font-bold py-2 px-8 rounded-xl shadow transition mb-2"
            onClick={() => router.push('/programs')}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}