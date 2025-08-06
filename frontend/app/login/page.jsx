'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import '../../i18n/i18n';
import Footer from '../components/Footer';
import useToast from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { toasts, hideToast, showError } = useToast();

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

  const handleLogin = async () => {
    setError('');
    if (!username || !password) {
      showError(t('login_required'));
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: username, password: password }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.id) {
        localStorage.setItem('user', JSON.stringify(data));
        // Remember Me logic (save both username and password)
        if (rememberMe) {
          localStorage.setItem(
            'rememberedCredentials',
            JSON.stringify({ username, password })
          );
        } else {
          localStorage.removeItem('rememberedCredentials');
        }
        
        // Check if user has signed terms before redirecting to dashboard
        const hasSignedTerms = localStorage.getItem("hasSignedTerms");
        
        if (hasSignedTerms !== "true") {
          // User hasn't signed terms - redirect to terms signature page
          router.push('/terms-signature');
        } else {
          // User has signed terms - redirect based on role
          if (data.role === 'instructor') {
            router.push('/instructor-dashboard');
          } else if (data.role === 'Admin') {
            router.push('/admin-dashboard');
          } else {
            router.push('/client-dashboard');
          }
        }
      } else {
        showError(t('login_incorrect'));
      }
    } catch (err) {
      setLoading(false);
      showError(t('login_incorrect'));
    }
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-2 py-8 sm:px-4">
      <LanguageSwitcher />
      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center flex-1 w-full max-w-md "
      >
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-lg bg-white/80 shadow-[#3a2826] rounded-3xl shadow-2xl px-4 sm:px-8 py-6 sm:py-10 w-full flex flex-col items-center ">
          {/*Logo */}
          <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg mb-5 shadow-[#3a2826]">
            <img
              src="logo.svg"
              alt="Logo"
              className="object-cover w-32 h-24"
              style={{ background: 'none' }}
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4A2C2A]text-center mb-1 tracking-tight drop-shadow">
            Breathe Pilates
          </h1>
          <h1 className="text-lg sm:text-lg font-bold text-[#4A2C2A] text-center tracking-tight drop-shadow">
            Efi Zikou
          </h1>
          <p className="text-md sm:text-base text-[#4A2C2A] text-center max-w-xs leading-relaxed mb-5 mt-2">
           move into happiness
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
      <ToastContainer toasts={toasts} hideToast={hideToast} />
    </div>
  );
}