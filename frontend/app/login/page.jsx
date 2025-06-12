'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);

    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'client',
    };

    localStorage.setItem('user', JSON.stringify(mockUser));

    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  return (
  <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-[#a259ec] via-[#fbc2eb] to-[#fd6e6a] px-4 py-8">
    <motion.main
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex flex-col items-center w-full max-w-md flex-1 justify-center"
    >
      {/* Glassmorphism Card */}
      <div className="backdrop-blur-lg bg-white/80 rounded-3xl shadow-2xl px-8 py-10 w-full flex flex-col items-center border border-[#a259ec]/30">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0.9, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 8 }}
          className="w-20 h-20 rounded-full bg-[#a259ec] flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-4"
        >
          🧘‍♀️
        </motion.div>
        <h1 className="text-3xl font-extrabold text-[#a259ec] text-center mb-2 tracking-tight drop-shadow">
          Pilates Space
        </h1>
        <p className="text-base text-gray-700 text-center max-w-xs leading-relaxed mb-8">
          Calm your mind. Strengthen your body.<br />Let’s begin your journey.
        </p>
        {/* CTA Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.03 }}
          className="w-full max-w-xs py-3 px-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-[#a259ec] to-[#fd6e6a] text-white shadow-xl hover:from-[#7c3aed] hover:to-[#ff8fab] transition duration-300 ease-in-out mb-2"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Sign In / Connect'}
        </motion.button>
      </div>
    </motion.main>
    {/* Footer */}
    <div className="text-xs text-gray-400 mt-8 mb-5 text-center">
      © {new Date().getFullYear()} Pilates Space. All rights reserved.
    </div>
  </div>
);
}