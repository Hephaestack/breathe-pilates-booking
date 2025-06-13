'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// CreativeButton with #b3b18f hover color (as in other dashboards)
function CreativeButton({ children, onClick, className = '', ...props }) {
  const btnRef = useRef(null);

  const handleMouseMove = (e) => {
    const btn = btnRef.current;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    btn.style.setProperty('--x', `${x}px`);
    btn.style.setProperty('--y', `${y}px`);
  };

  return (
    <button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={`relative w-full py-3 px-6 text-lg font-semibold rounded-2xl overflow-hidden bg-[#111] text-white transition-colors duration-300 z-10 border-none outline-none group ${className}`}
      style={{
        '--x': '50%',
        '--y': '50%',
      }}
      {...props}
    >
      <span
        className="pointer-events-none absolute left-0 top-0 w-full h-full rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-400"
        style={{
          background:
            'radial-gradient(circle at var(--x, 50%) var(--y, 50%), #b3b18f 10%, transparent 70%)',
          transition: 'transform 0.4s ease',
          zIndex: 0,
        }}
      />
      <span className="relative z-10 transition-colors duration-300 group-hover:text-[#b3b18f]">
        {children}
      </span>
    </button>
  );
}

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
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 py-8">
      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center flex-1 w-full max-w-md"
      >
        <div className="backdrop-blur-lg bg-white/80 rounded-3xl shadow-2xl px-8 py-10 w-full flex flex-col items-center border border-[#4A2C2A]/30 ">
          <h1 className="text-3xl font-extrabold  bg-gradient-to-r from-[#b3b18f] via-[#A5957E] to-[#4A2C2A] bg-clip-text text-transparent  text-center mb-4 tracking-tight drop-shadow">
            Hello, {user.name}
          </h1>
          <p className="text-base text-[#8a7f7e] text-center max-w-xs leading-relaxed mb-8">
            Welcome to your Pilates dashboard!
          </p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="w-full max-w-xs space-y-4"
          >
            <CreativeButton onClick={() => router.push('/programs')}>
              Book a Program
            </CreativeButton>
            <CreativeButton onClick={() => router.push('/bookings')}>
              My Bookings
            </CreativeButton>
            <CreativeButton onClick={() => router.push('/subscriptions')}>
              My Subscriptions
            </CreativeButton>
            <button
              className="w-full py-3 px-6 text-lg font-semibold rounded-2xl bg-[#ffffff] text-[#fc0000] shadow hover:bg-[#ccc] transition duration-300"
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