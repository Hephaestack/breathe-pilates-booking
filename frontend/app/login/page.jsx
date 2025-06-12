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
  <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#fffaf5] px-6">
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center w-full max-w-md flex-1 justify-center"
    >
      {/* Logo / Icon */}
      <div className="flex flex-col items-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-[#BFA2DB] flex items-center justify-center text-white text-2xl font-bold shadow-md">
          🧘‍♀️
        </div>
        <h1 className="text-2xl font-semibold text-[#BFA2DB] text-center">
          Welcome to Your Pilates Space
        </h1>
        <p className="text-sm text-gray-500 text-center max-w-xs leading-relaxed">
          Calm your mind. Strengthen your body. Let’s begin.
        </p>
      </div>

      {/* CTA Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        className="mt-10 w-full max-w-xs py-3 px-6 text-base font-medium rounded-xl bg-[#BFA2DB] text-white shadow-lg hover:bg-[#a78cd8] transition duration-300 ease-in-out"
        onClick={handleLogin}
      >
        {loading ? 'Connecting...' : 'Sign In / Connect'}
      </motion.button>
    </motion.main>

    {/* Footer */}
    <div className="text-xs text-gray-400 mt-8 mb-5">
      © {new Date().getFullYear()} Your Pilates Space. All rights reserved.
    </div>
  </div>
);
}