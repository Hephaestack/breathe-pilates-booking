'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import '../../i18n/i18n';
import Footer from '../components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load remembered username on mount (only in browser)
 useEffect(() => {
    if (typeof window !== 'undefined') {
      const remembered = localStorage.getItem('rememberedCredentials');
      if (remembered) {
        const { username, password } = JSON.parse(remembered);
        setUsername(username);
        setPassword(password);
        setRememberMe(true);
      }
    }
  }, []);

  const handleLogin = () => {
    setError('');
    if (!username || !password) {
      setError(t('login_required'));
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
    ];
    // Find user by username and password
    const foundUser = users.find(
      (u) => (u.username === username || u.email === username) && u.password === password
    );

    setTimeout(() => {
      setLoading(false);
      if (foundUser) {
        localStorage.setItem('user', JSON.stringify(foundUser));
        // Remember Me logic (save both username and password)
        if (rememberMe) {
          localStorage.setItem(
            'rememberedCredentials',
            JSON.stringify({ username, password })
          );
        } else {
          localStorage.removeItem('rememberedCredentials');
        }
        // Save a mock subscription for client users
        if (foundUser.role === 'client') {
          localStorage.setItem(
            'subscription',
            JSON.stringify({
              id: 1,
              type: 'monthly',
              name: 'Monthly Pilates',
              expires: '2025-08-15',
            })
          );
        }
        if (foundUser.role === 'instructor') {
          router.push('/instructor-dashboard');
        } else if (foundUser.role === 'Admin') {
          router.push('/admin-dashboard');
        } else {
          router.push('/client-dashboard');
        }
      } else {
        setError(t('login_incorrect'));
        setShowToast(true);
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
      <LanguageSwitcher />
      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center flex-1 w-full max-w-md "
      >
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-lg bg-white/80 shadow-[#3a2826]   rounded-3xl shadow-2xl px-8 py-10 w-full flex flex-col items-center border border-[#a259ec]/30">

          {/*Logo */}
        <div className="w-28 h-28  rounded-full  flex items-center justify-center shadow-lg mb-5 shadow-[#3a2826]  ">
  <img
    src="logo.svg"
    alt="Logo"
    className="w-50 h-30 object-cover "
    style={{ background: 'none' }}
  />
</div>

          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#b3b18f] via-[#A5957E] to-[#4A2C2A] bg-clip-text text-transparent text-center mb-2 tracking-tight drop-shadow">
            Breath Pilates 
          </h1>
         <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#b3b18f] via-[#A5957E] to-[#4A2C2A] bg-clip-text text-transparent text-center mb-2 tracking-tight drop-shadow"
         >
          Efi Zikou
          </h1>
          <p className="text-base text-[#4A2C2A] text-center max-w-xs leading-relaxed mb-8">
           Brand Phrase
          </p>
          
          {/* Username/Phone Input */}
          <input
            type="text"
            placeholder={t('login_username')}
            className="w-full text-[#4A2C2A] max-w-xs mb-3 px-4 py-2 rounded-xl border border-[#b3b18f] focus:outline-none focus:ring-2 focus:ring-[#b3b18f] placeholder:text-[#4A2C2A] placeholder:font-semibold"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          {/* Password Input */}
          <input
            type="password"
            placeholder={t('login_password')}
            className="w-full max-w-xs mb-3 text-black px-4 py-2 rounded-xl border border-[#b3b18f] focus:outline-none focus:ring-2 focus:ring-[#b3b18f] placeholder:text-[#4A2C2A] placeholder:font-semibold"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          {/* Remember Me Checkbox */}
          <label className="flex items-center w-full max-w-xs mb-5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe((v) => !v)}
              className="form-checkbox accent-[#b3b18f] border-[#b3b18f] mr-2"
              disabled={loading}
            />
            <span className="text-[#4A2C2A] font-semibold text-sm">{t('remember_me')}</span>
          </label>
          {/* Error Message below inputs */}
          {error && (
            <div className="w-full max-w-xs mb-4 text-center text-[#b94a48] bg-[#fbeee6] border border-[#f5c6cb] rounded-xl px-3 py-2 font-semibold text-sm">
              {error}
            </div>
          )}
          {/* CTA Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
            className="btn-primary"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? t('login_connecting') : t('login')}
          </motion.button>
        </div>
      </motion.main>
      <Footer />
    </div>
  );
}