'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  if (!user) return null;

  return (
    <motion.main
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: 'easeOut' }}
  className="min-h-screen bg-[#FAF9F6] p-5 flex flex-col justify-center items-center"
>
      <h1 className="text-2xl font-bold text-[#BFA2DB] mb-6">
        Hello, {user.name} 🌸
      </h1>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="w-full max-w-md space-y-4"
      >
        <button
            className="w-full py-3 rounded-xl bg-[#FEC8D8] text-[#333] shadow hover:bg-[#fcb6c8] transition duration-300"
            onClick={() => router.push('/programs')}
        >
            Available Programs
        </button>
        <button className="w-full py-3 rounded-xl bg-[#BFA2DB] text-white shadow hover:bg-[#a68ec9] transition duration-300">
          My Bookings
        </button>
        {/* Show this button only for instructors */}
        {user.role === 'instructor' && (
          <button className="w-full py-3 rounded-xl bg-[#A0E7E5] text-[#333] shadow hover:bg-[#7fd6d4] transition duration-300">
            All Bookings & Appointments
          </button>
        )}
        <button
          className="w-full py-3 rounded-xl bg-[#ddd] text-[#333] shadow hover:bg-[#ccc] transition duration-300"
          onClick={() => {
            localStorage.removeItem('user');
            router.push('/login');
          }}
        >
          Log Out
        </button>
      </motion.div>
    </motion.main>
  );
}
