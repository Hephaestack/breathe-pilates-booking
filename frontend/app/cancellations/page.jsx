'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


function getUser() {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
}


const cancellations = [
  {
    date: '17/7/2024',
    name: 'Breath Pilates',
    from: '17:00',
    to: '18:00',
    user: 'Maria Papadopoulou', // Only shown to instructors
  },
];

export default function CancellationsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center  px-2 py-8">
      <div className="bg-white rounded-2xl shadow-2xl px-4 py-6 border border-[#4A2C2A]/30  shadow-[#50322f] w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#4A2C2A] flex items-center gap-2">
            Cancellations
          </h2>
          <button
            className="text-2xl text-white hover:text-[#a259ec] transition"
            onClick={() => router.back()}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="text-[#ffffff] bg-[#4A2C2A]">
              <th className="py-1 px-2 font-semibold">Date</th>
              <th className="py-1 px-2 font-semibold">Class</th>
              <th className="py-1 px-2 font-semibold">From</th>
              <th className="py-1 px-2 font-semibold">To</th>
              {user?.role === 'instructor' && (
                <th className="py-1 px-2 font-semibold">User</th>
              )}
            </tr>
          </thead>
          <tbody>
            {cancellations.map((c, idx) => (
              <tr key={idx} className="bg-[#a58e8c]">
                <td className="py-1 px-2 text-center">{c.date}</td>
                <td className="py-1 px-2 text-center">{c.name}</td>
                <td className="py-1 px-2 text-center">{c.from}</td>
                <td className="py-1 px-2 text-center">{c.to}</td>
                {user?.role === 'instructor' && (
                  <td className="py-1 px-2 text-center">{c.user}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center">
          <button
            className="bg-[#4A2C2A] hover:bg-[#4d3634] text-white font-bold py-2 px-8 rounded-xl shadow transition"
            onClick={() => router.back()}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}