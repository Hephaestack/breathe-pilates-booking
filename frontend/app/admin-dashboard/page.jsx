'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import '../../i18n/i18n';

function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const checkTouch = () =>
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
      );
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);
  return isTouch;
}

function CreativeButton({ children, onClick, className = '', ...props }) {
  const btnRef = useRef(null);
  const isTouch = useIsTouchDevice();

  // Mouse move effect for desktop only
  const handleMouseMove = (e) => {
    if (isTouch) return;
    const btn = btnRef.current;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    btn.style.setProperty('--x', `${x}px`);
    btn.style.setProperty('--y', `${y}px`);
  };

  // Simple tap animation for mobile
  const mobileTapProps = isTouch
    ? {
        whileTap: { scale: 0.96 },
        transition: { type: 'spring', stiffness: 400, damping: 20 },
      }
    : {};

  return (
    <motion.button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={`relative w-full py-3 px-6 text-lg font-semibold rounded-2xl overflow-hidden bg-[#111] text-white transition-colors duration-300 z-10 border-none outline-none group ${className}`}
      style={{
        '--x': '50%',
        '--y': '50%',
      }}
      {...mobileTapProps}
      {...props}
    >
      {!isTouch && (
        <span
          className="absolute top-0 left-0 w-full h-full transition-opacity opacity-0 pointer-events-none rounded-2xl group-hover:opacity-50 duration-400"
          style={{
            background:
              'radial-gradient(circle at var(--x, 50%) var(--y, 50%), #b3b18f 10%, transparent 70%)',
            transition: 'transform 0.4s ease',
            zIndex: 0,
          }}
        />
      )}
      <span className="relative z-10 transition-colors duration-300 group-hover:text-[#b3b18f]">
        {children}
      </span>
    </motion.button>
  );
}

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { t } = useTranslation();
  const isTouch = useIsTouchDevice();

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
        initial={{ opacity: 0, y: isTouch ? 10 : 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: isTouch ? 0.3 : 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center flex-1 w-full max-w-md"
      >
        <div className="backdrop-blur-lg bg-white/60 rounded-3xl shadow-2xl px-8 py-10 w-full flex flex-col items-center border border-[#4A2C2A]/30 ">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#b3b18f] via-[#A5957E] to-[#4A2C2A] bg-clip-text text-transparent text-center mb-2 tracking-tight drop-shadow">
            {t('hello', { name: user.name })}
          </h1>
          <p className="text-base text-[#8a7f7e] text-center max-w-xs leading-relaxed mb-8">
            {t('welcome_admin')}
          </p>
          <motion.div
            initial={{ opacity: 0, y: isTouch ? 4 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: isTouch ? 0.2 : 0.3 }}
            className="w-full max-w-xs space-y-4"
          >
            <CreativeButton onClick={() => router.push('/programs')}>
              {t('programs')}
            </CreativeButton>
            <CreativeButton onClick={() => router.push('/bookings')}>
              {t('bookings')}
            </CreativeButton>
            <CreativeButton onClick={() => router.push('/cancellations')}>
              {t('cancellations')}
            </CreativeButton>
            <CreativeButton onClick={() => router.push('/subscriptions')}>
              {t('subscriptions')}
            </CreativeButton>
            <CreativeButton onClick={() => router.push('/create-user-page')}>
              {t('create_user')}
            </CreativeButton>
            <motion.button
              className="w-full py-3 px-6 text-lg font-semibold rounded-2xl bg-white text-[#fd0000] shadow hover:bg-[#ccc] transition duration-300"
              onClick={() => {
                localStorage.removeItem('user');
                router.push('/login');
              }}
              whileTap={isTouch ? { scale: 0.96 } : undefined}
              transition={isTouch ? { type: 'spring', stiffness: 400, damping: 20 } : undefined}
            >
              {t('log_out')}
            </motion.button>
          </motion.div>
        </div>
      </motion.main>
      <div className="mt-8 mb-5 text-xs font-extrabold text-center text-white">
        {t('footer_copyright', { year: new Date().getFullYear() })}
      </div>
    </div>
  );
}