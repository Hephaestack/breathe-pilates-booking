'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function SubscriptionModal({ isOpen, onClose, userId }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  console.log('SubscriptionModal render:', { isOpen, userId });

  useEffect(() => {
    if (isOpen && userId) {
      fetchSubscription();
    }
    
    // Prevent body scroll when modal is open (mobile optimization)
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    // Add escape key listener
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, userId, onClose]);

  const fetchSubscription = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription?user_id=${userId}`, {
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

  if (!isOpen) {
    console.log('Modal not open, returning null');
    return null;
  }

  console.log('Rendering modal');

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        touchAction: 'none'
      }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0"
        onClick={onClose}
        style={{ touchAction: 'none' }}
      />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl border w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderColor: 'rgba(74, 44, 42, 0.3)',
          touchAction: 'auto',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div 
          className="sticky top-0 p-4 rounded-t-2xl"
          style={{
            background: 'linear-gradient(to right, #b3b18f, #A5957E, #4A2C2A)'
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {t('my_subscriptions')}
            </h2>
            <button
              onClick={onClose}
              className="text-white p-2 rounded-full"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                minHeight: '44px',
                minWidth: '44px'
              }}
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div 
          className="p-4"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
          }}
        >
          {loading && (
            <div className="flex flex-col items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A2C2A] mb-4"></div>
              <p className="text-center text-[#4A2C2A] font-bold">{t('loading')}</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-center text-red-600">Error: {error}</p>
            </div>
          )}

          {subscription && !loading && !error && (
            <div className="space-y-4">
              <div 
                className="p-4 rounded-xl shadow"
                style={{ backgroundColor: '#dbdac6' }}
              >
                <div className="text-center">
                  <h3 
                    className="text-2xl font-bold mb-3"
                    style={{ color: '#4A2C2A' }}
                  >
                    {subscription.subscription_model}
                  </h3>
                  
                  {/* Display different info based on subscription type */}
                  {subscription.subscription_model.includes('συνδρομή') && subscription.subscription_expires && (
                    <div className="space-y-2">
                      <div 
                        className="text-lg"
                        style={{ color: '#4A2C2A' }}
                      >
                        <span className="font-semibold">{t('started')}:</span>
                        <br />
                        {formatDate(subscription.subscription_starts)}
                      </div>
                      <div 
                        className="text-lg"
                        style={{ color: '#4A2C2A' }}
                      >
                        <span className="font-semibold">{t('expires')}:</span>
                        <br />
                        {formatDate(subscription.subscription_expires)}
                      </div>
                    </div>
                  )}
                  
                  {subscription.subscription_model.includes('πακέτο') && (
                    <div className="space-y-3">
                      {subscription.package_total && (
                        <div 
                          className="text-lg"
                          style={{ color: '#4A2C2A' }}
                        >
                          <span className="font-semibold">{t('total_lessons')}:</span>
                          <br />
                          <span className="text-xl font-bold">{subscription.package_total}</span>
                        </div>
                      )}
                      {subscription.remaining_classes !== null && (
                        <div 
                          className="text-lg"
                          style={{ color: '#4A2C2A' }}
                        >
                          <span className="font-semibold">{t('remaining_lessons')}:</span>
                          <br />
                          <span className="text-2xl font-bold text-green-600">
                            {subscription.remaining_classes}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {subscription.subscription_starts && subscription.subscription_expires && (
                    <div 
                      className="mt-3 text-lg"
                      style={{ color: '#4A2C2A' }}
                    >
                      <span className="font-semibold">{t('expires')}:</span>
                      <br />
                      {formatDate(subscription.subscription_expires)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!subscription && !loading && !error && (
            <div 
              className="p-4 rounded-xl border"
              style={{ 
                backgroundColor: '#f9fafb',
                borderColor: '#d1d5db'
              }}
            >
              <p 
                className="text-center font-bold"
                style={{ color: '#4A2C2A' }}
              >
                {t('no_subscription_found') || 'No subscription found'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="p-4 border-t"
          style={{ borderColor: 'rgba(74, 44, 42, 0.2)' }}
        >
          <button
            onClick={onClose}
            className="w-full py-3 px-4 text-white font-semibold rounded-xl"
            style={{
              background: 'linear-gradient(to right, #b3b18f, #A5957E, #4A2C2A)',
              minHeight: '44px',
              touchAction: 'manipulation'
            }}
          >
            {t('close') || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
