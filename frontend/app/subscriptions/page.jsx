'use client';

import { useState, useEffect } from 'react';
import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';
import useToast from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

export default function SubscriptionsPage() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const { toasts, hideToast, showError } = useToast();

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        // Get user from localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!storedUser.id) {
          setError(t('user_not_found'));
          setLoading(false);
          return;
        }        // Fetch subscription data from the backend
        const response = await fetch(`http://localhost:8000/subscription?user_id=${storedUser.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(t('failed_fetch_subscription'));
        }

        const data = await response.json();
        setSubscription(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className="bg-white/80 rounded-2xl shadow-2xl px-4 py-6 border border-[#4A2C2A]/30 shadow-[#3a2826] w-full max-w-md">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A2C2A] mb-4"></div>
            <p className="text-center text-[#4A2C2A] font-bold">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className="bg-white/80 rounded-2xl shadow-2xl px-4 py-6 border border-[#4A2C2A]/30 shadow-[#3a2826] w-full max-w-md">
          <p className="text-center text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-2 py-8 sm:px-4">
      <div className="bg-white/80 rounded-2xl shadow-2xl px-2 py-6 sm:px-4 border border-[#4A2C2A]/30 shadow-[#3a2826] w-full max-w-md">
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#b3b18f] via-[#A5957E] to-[#4A2C2A] bg-clip-text text-transparent text-center mb-5 tracking-tight drop-shadow">
          {t('my_subscriptions')}
        </h1>
        {subscription && (
          <div className="space-y-5">
            <div className="p-3 sm:p-4 rounded-xl bg-[#dbdac6] shadow flex flex-col items-center text-[#4A2C2A]">
              <span className="text-4xl font-bold sm:text-5xl">{subscription.subscription_model}</span>
              {/* Display different info based on subscription type */}
              {subscription.subscription_model.includes('\u03c3\u03c5\u03bd\u03b4\u03c1\u03bf\u03bc\u03ae') && subscription.subscription_expires && (
                <span className="font-bold text-xs sm:text-sm text-[#4A2C2A] mt-2">
                  {t('started')}: {subscription.subscription_starts}
                </span>
              )}
              {subscription.subscription_model.includes('\u03c0\u03b1\u03ba\u03ad\u03c4\u03bf') && (
                <div className="text-xs sm:text-lg text-[#4A2C2A] mt-2 text-center">
                  {subscription.package_total && (
                    <div className='font-bold'><span className='text-lg'>{t('total_lessons')}:</span> {subscription.package_total}</div>
                  )}
                  {subscription.remaining_classes !== null && (
                    <div className="text-xs sm:text-lg text-[#4A2C2A] mt-2 text-center">
                      {t('remaining_lessons')}: {subscription.remaining_classes}
                    </div>
                  )}
                </div>
              )}
              {subscription.subscription_starts && (
                <span className="font-bold text-xs sm:text-sm text-[#4A2C2A] mt-2">
                  {t('expires')}: {subscription.subscription_expires}
                </span>
              )}
            </div>
          </div>
        )}
        {!subscription && (
          <p className="font-bold text-center text-[#4A2C2A]">No subscription found</p>
        )}
      </div>
      <ToastContainer toasts={toasts} hideToast={hideToast} />
    </div>
  );
}
