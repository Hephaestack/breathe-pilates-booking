'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
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

  // Guard: Don't render until user is loaded
  if (!user) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 py-8">
      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center flex-1 w-full max-w-md"
      >
        <div className="backdrop-blur-lg bg-white/60 rounded-3xl shadow-2xl px-8 py-10 w-full flex flex-col items-center border border-[#4A2C2A]/30 ">
          <h1 className="text-3xl font-extrabold text-[#4A2C2A] text-center mb-4 tracking-tight drop-shadow">
            Hello, {user.name}
          </h1>
          <p className="text-base text-[#8a7f7e] text-center max-w-xs leading-relaxed mb-8">
            Welcome to your Admin dashboard! You have full access to all data and management tools.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="w-full max-w-xs space-y-4"
          >
            <button
              className="w-full py-3 px-6 text-lg font-semibold rounded-2xl text-white bg-gradient-to-b from-[#221816] via-[#0f0b0a] to-[#0b0a08] hover:bg-gradient-to-br  focus:ring-yellow-300 dark:focus:ring-yellow-800 shadow-lg shadow-brown-500/50 dark:shadow-md"
              onClick={() => router.push('/programs')}
            >
              All Programs
            </button>
            <button
              className="w-full py-3 px-6 text-lg font-semibold rounded-2xl text-white bg-gradient-to-b from-[#221816] via-[#0f0b0a] to-[#0b0a08] hover:bg-gradient-to-br  focus:ring-yellow-300 dark:focus:ring-yellow-800 shadow-lg shadow-brown-500/50 dark:shadow-md"
              onClick={() => router.push('/bookings')}
            >
              All Bookings
            </button>
            <button
              className="w-full py-3 px-6 text-lg font-semibold rounded-2xl text-white bg-gradient-to-b from-[#221816] via-[#0f0b0a] to-[#0b0a08] hover:bg-gradient-to-br  focus:ring-yellow-300 dark:focus:ring-yellow-800 shadow-lg shadow-brown-500/50 dark:shadow-md"
              onClick={() => router.push('/cancellations')}
            >
              All Cancellations
            </button>
            <button
              className="w-full py-3 px-6 text-lg font-semibold rounded-2xl text-white bg-gradient-to-b from-[#221816] via-[#0f0b0a] to-[#0b0a08] hover:bg-gradient-to-br  focus:ring-yellow-300 dark:focus:ring-yellow-800 shadow-lg shadow-brown-500/50 dark:shadow-md"
              onClick={() => router.push('/users')}
            >
              All Users
            </button>
            <button
              className="w-full py-3 px-6 text-lg font-semibold rounded-2xl text-white bg-gradient-to-b from-[#221816] via-[#0f0b0a] to-[#0b0a08] hover:bg-gradient-to-br  focus:ring-yellow-300 dark:focus:ring-yellow-800 shadow-lg shadow-brown-500/50 dark:shadow-md"
              onClick={() => router.push('/subscriptions')}
            >
              All Subscriptions
            </button>
                  <button
              className="w-full py-3 px-6 text-lg font-semibold rounded-2xl bg-gradient-to-b from-[#221816] via-[#0f0b0a] to-[#0b0a08] text-[#f5e9e0] shadow-[0_4px_32px_0_rgba(72,41,37,0.6)] hover:shadow-[0_0_16px_4px_rgba(72,41,37,0.25)] transition duration-300 ease-in-out border-none outline-none"
              onClick={() => router.push('/create-user-page')}
            >
            Create User
            </button>
            <button
              className="w-full py-3 px-6 text-lg font-semibold rounded-2xl bg-[#fff] text-[#fd0000] shadow hover:bg-[#ccc] transition duration-300"
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
      <div className="mt-8 mb-5 text-xs font-extrabold text-center text-white">
        © {new Date().getFullYear()} Pilates Space. All rights reserved.
      </div>
    </div>
  );
}