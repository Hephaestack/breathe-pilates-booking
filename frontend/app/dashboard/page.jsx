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
  <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-[#a259ec] via-[#fbc2eb] to-[#fd6e6a] px-4 py-8">
    <motion.main
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex flex-col items-center w-full max-w-md flex-1 justify-center"
    >
      <div className="backdrop-blur-lg bg-white/80 rounded-3xl shadow-2xl px-8 py-10 w-full flex flex-col items-center border border-[#a259ec]/30">
        <h1 className="text-3xl font-extrabold text-[#a259ec] text-center mb-4 tracking-tight drop-shadow">
          Hello, {user.name} 🌸
        </h1>
        <p className="text-base text-gray-700 text-center max-w-xs leading-relaxed mb-8">
          Welcome to your Pilates dashboard!
        </p>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="w-full max-w-xs space-y-4"
        >
          <button
            className="w-full py-3 px-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-[#a259ec] to-[#fd6e6a] text-white shadow-xl hover:from-[#7c3aed] hover:to-[#ff8fab] transition duration-300 ease-in-out"
            onClick={() => router.push('/programs')}
          >
            Available Programs
          </button>
          <button className="w-full py-3 px-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-[#a259ec] to-[#43e97b] text-white shadow-xl hover:from-[#7c3aed] hover:to-[#38f9d7] transition duration-300 ease-in-out">
            My Bookings
          </button>
          {user.role === 'instructor' && (
            <button className="w-full py-3 px-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-[#43e97b] to-[#a259ec] text-white shadow-xl hover:from-[#38f9d7] hover:to-[#7c3aed] transition duration-300 ease-in-out">
              All Bookings & Appointments
            </button>
          )}
          <button
            className="w-full py-3 px-6 text-lg font-semibold rounded-xl bg-[#ddd] text-[#333] shadow hover:bg-[#ccc] transition duration-300"
            onClick={() => {
              localStorage.removeItem('user');
              router.push('/login');
            }}
          >
            Log Out
          </button>
        </motion.div>
      </div>
    </motion.main>
    <div className="text-xs text-gray-400 mt-8 mb-5 text-center">
      © {new Date().getFullYear()} Pilates Space. All rights reserved.
    </div>
  </div>
);
}
