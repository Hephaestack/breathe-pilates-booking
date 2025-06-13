'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Example bookings data
const mockBookings = [
  {
    id: 1,
    date: '19/7/2024',
    name: 'ClassTest',
    from: '17:00',
    to: '18:00',
    user: 'Maria Papadopoulou',
  },
  {
    id: 2,
    date: '18/7/2024',
    name: 'ClassTest',
    from: '17:00',
    to: '18:00',
    user: 'Chris Demo',
  },
  {
    id: 3,
    date: '16/7/2024',
    name: 'ClassTest',
    from: '17:00',
    to: '18:00',
    user: 'Anna Example',
  },
];

// Example: get user from localStorage (or use your auth logic)
function getUser() {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState(mockBookings);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleCancel = (id) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-2 py-8">
      <div className="bg-white/80 rounded-2xl shadow-2xl px-4 py-6 border border-[#4A2C2A]/30 shadow-[#3a2826] w-full max-w-md">
        <div className="flex items-center justify-between mb-2 px-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#b3b18f] via-[#A5957E] to-[#4A2C2A] bg-clip-text text-transparent mb-2 tracking-tight drop-shadow flex items-center gap-2">
            <span className="material-icons">My</span>
            Bookings
          </h2>
          <button
            className="text-2xl text-[#4A2C2A] hover:text-[#b3b18f] transition"
            onClick={() => router.back()}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-y-1">
            <thead>
              <tr className="bg-[#b3b18f] text-[#ffffff] font-bold">
                <th className="py-2 px-2 rounded-l-xl font-semibold">Date</th>
                <th className="py-2 px-2 font-semibold">Name</th>
                <th className="py-2 px-2 font-semibold">From</th>
                <th className="py-2 px-2 font-semibold">To</th>
                {user?.role === 'instructor' && (
                  <th className="py-2 px-2 font-semibold">User</th>
                )}
                <th className="py-2 px-2 rounded-r-xl"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'instructor' ? 6 : 5} className="text-center text-black py-8">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="bg-[#ffffff] text-[#ff0000]">
                    <td className="text-[#4A2C2A] font-bold py-2 px-2 text-center rounded-l-xl">{b.date}</td>
                    <td className="text-[#4A2C2A] font-bold py-2 px-2 text-center">{b.name}</td>
                    <td className="text-[#4A2C2A] font-bold py-2 px-2 text-center">{b.from}</td>
                    <td className="text-[#4A2C2A] font-bold py-2 px-2 text-center">{b.to}</td>
                    {user?.role === 'instructor' && (
                      <td className="text-black font-bold py-2 px-2 text-center">{b.user}</td>
                    )}
                    <td className="py-2 px-2 text-center rounded-r-xl"></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}