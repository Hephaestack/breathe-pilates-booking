'use client';

import { useState, useEffect } from 'react';
import '../../i18n/i18n';
import { useTranslation } from 'react-i18next';
import useToast from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';

export default function SubscriptionsPage() {
  function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
  const [subscriptions, setSubscriptions] = useState([]);
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const { toasts, hideToast, showError } = useToast();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        // Get user from localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (!storedUser.id) {
          setError(t('user_not_found'));
          setLoading(false);
          return;
        }
        // Fetch active subscriptions from the correct endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription?user_id=${storedUser.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          throw new Error(t('failed_fetch_subscription'));
        }
        const data = await response.json();
        setDebugData(data); // Save raw response for debugging
        // Handle response as an array of subscriptions
        if (Array.isArray(data) && data.length > 0) {
          setSubscriptions(data);
        } else {
          setSubscriptions([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
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
        {subscriptions.length > 0 ? (
          <div className="space-y-5">
            {subscriptions.map((subscription, idx) => {
              const isPackage = String(subscription.subscription_model).toLowerCase().includes('πακέτο');
              const isSubs = String(subscription.subscription_model).toLowerCase().includes('συνδρομή');
              return (
                <div key={subscription.id || idx} className="p-3 sm:p-4 rounded-xl bg-[#dbdac6] shadow flex flex-col items-center text-[#4A2C2A]">
                  <span className="text-3xl font-bold sm:text-3xl">{subscription.subscription_model}</span>
                  {/* Always show start and end dates if present */}
                  {subscription.start_date && (
                    <div className="mt-2 text-lg font-bold">{t('started')}: {formatDate(subscription.start_date)}</div>
                  )}
                  {subscription.end_date && (
                    <div className="mt-2 text-lg font-bold">{t('expires')}: {formatDate(subscription.end_date)}</div>
                  )}
                  {isPackage && (
                    <>
                      {subscription.package_total !== undefined && (
                        <div className="mt-2 text-lg font-bold">{t('total_lessons')}: {subscription.package_total}</div>
                      )}
                      {subscription.remaining_classes !== undefined && (
                        <div className="mt-2 text-lg font-bold">{t('remaining_lessons')}: {subscription.remaining_classes}</div>
                      )}
                    </>
                  )}
                  {isSubs && (
                    <>
                      
                    </>
                  )}
  
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <p className="font-bold text-center text-[#4A2C2A]">No subscription found</p>
            {debugData && (
              <pre className="max-w-full p-2 mt-4 overflow-x-auto text-xs text-left bg-gray-100 rounded">
                {JSON.stringify(debugData, null, 2)}
              </pre>
            )}
          </>
        )}
      </div>
      <ToastContainer toasts={toasts} hideToast={hideToast} />
    </div>
  );
}
