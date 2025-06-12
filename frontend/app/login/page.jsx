'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react'; // <-- Add useState and useEffect import
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleLogin = () => {
  setError('');
  if (!username || !password) {
    setError('Please enter both your username (or phone) and password to continue.');
    setShowToast(true);
    return;
  }
  setLoading(true);

    // Mock users
    const users = [
      {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'client',
        username: 'client',
        password: 'client123',
      },
      {
        id: 2,
        name: 'Instructor Jane',
        email: 'jane@instructor.com',
        role: 'instructor',
        username: 'instructor',
        password: 'instructor123',
      },
       {
        id: 3,
        name: 'Admin User',
        email: 'jane@instructor.com',
        role: 'Admin',
        username: 'Admin',
        password: 'Admin123',
      },
    ];

    // Find user by username and password
    const foundUser = users.find(
      (u) => (u.username === username || u.email === username) && u.password === password
    );

   setTimeout(() => {
    setLoading(false);
    if (foundUser) {
  localStorage.setItem('user', JSON.stringify(foundUser));
  if (foundUser.role === 'instructor') {
    router.push('/instructor-dashboard');
  } else if (foundUser.role === 'Admin') {
    router.push('/admin-dashboard');
  } else {
    router.push('/client-dashboard');
  }
}
  }, 1000);
};

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 py-8">
      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center flex-1 w-full max-w-md"
      >
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-lg bg-white/80 rounded-3xl shadow-2xl px-8 py-10 w-full flex flex-col items-center border border-[#a259ec]/30">
          {/* Animated Logo */}
          <motion.div
            initial={{ scale: 0.9, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 8 }}
            className="w-20 h-20 rounded-full bg-[#b3b18f] flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-4"
          >
            🧘‍♀️
          </motion.div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#b3b18f] via-[#A5957E] to-[#4A2C2A] bg-clip-text text-transparent text-center mb-2 tracking-tight drop-shadow">
            Pilates Space
          </h1>
          <p className="text-base text-[#4A2C2A] text-center max-w-xs leading-relaxed mb-8">
            Calm your mind. Strengthen your body.<br />Let’s begin your journey.
          </p>
          {/* Username/Phone Input */}
          <input
            type="text"
            placeholder="Username or Phone"
            className="w-full text-black max-w-xs mb-3 px-4 py-2 rounded-xl border border-[#b3b18f] focus:outline-none focus:ring-2 focus:ring-[#b3b18f] placeholder:text-[#4A2C2A] placeholder:font-semibold"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          {/* Password Input */}
          <input
            type="password"
            placeholder="Password"
            className="w-full max-w-xs mb-5 text-black px-4 py-2 rounded-xl border border-[#b3b18f] focus:outline-none focus:ring-2 focus:ring-[#b3b18f] placeholder:text-[#4A2C2A] placeholder:font-semibold"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          {/* Error Message */}
          {error && (
            <div className="w-full max-w-xs mb-4 text-center text-[#b94a48] bg-[#fbeee6] border border-[#f5c6cb] rounded-xl px-3 py-2 font-semibold text-sm">
              {error}
            </div>
          )}
          {/* CTA Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
            className="w-full max-w-xs py-3 px-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-[#b3b18f] via-[#A5957E] to-[#4A2C2A] transition duration-300 ease-in-out mb-2"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Connecting...' : 'Sign In / Connect'}
          </motion.button>
        </div>
      </motion.main>
      {/* Footer */}
      <div className="mt-8 mb-5 text-xs font-extrabold text-center text-white">
        © {new Date().getFullYear()} Pilates Space. All rights reserved.
      </div>
    </div>
  );
}