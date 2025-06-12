'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function getUser() {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
}

const mockSubscription = {
  type: 'Monthly',
  status: 'Active',
  expires: '15/07/2025',
  autoRenew: true,
  paymentMethod: 'Visa •••• 1234',
  nextBilling: '15/06/2025',
};

export default function SubscriptionPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(mockSubscription);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleCancel = () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) return;
    setCancelling(true);
    setTimeout(() => {
      setSubscription((prev) => ({
        ...prev,
        status: 'Cancelled',
        autoRenew: false,
      }));
      setCancelling(false);
      setCancelled(true);
    }, 1200);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-2 py-8">
      <div className="bg-white rounded-2xl shadow-2xl px-6 py-8 border border-[#BFA2DB]/30 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#7f53c7] flex items-center gap-2">
            <span className="material-icons text-[#43e97b]">Test</span>
            Subscription
          </h2>
          <button
            className="text-2xl text-gray-400 hover:text-[#a259ec] transition"
            onClick={() => router.back()}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="bg-[#f8f6ff] rounded-xl p-4 mb-4">
          <div className="flex flex-col gap-2">
            <div>
              <span className="font-semibold text-[#7f53c7]">Type: </span>
              <span className="text-[#333]">{subscription.type}</span>
            </div>
            <div>
              <span className="font-semibold text-[#7f53c7]">Status: </span>
              <span className={subscription.status === 'Active' ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                {subscription.status}
              </span>
            </div>
            <div>
              <span className="font-semibold text-[#7f53c7]">Expires: </span>
              <span className="text-[#333]">{subscription.expires}</span>
            </div>
            <div>
              <span className="font-semibold text-[#7f53c7]">Auto-renew: </span>
              <span className="text-[#333]">{subscription.autoRenew ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="font-semibold text-[#7f53c7]">Payment: </span>
              <span className="text-[#333]">{subscription.paymentMethod}</span>
            </div>
            {subscription.autoRenew && (
              <div>
                <span className="font-semibold text-[#7f53c7]">Next billing: </span>
                <span className="text-[#333]">{subscription.nextBilling}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center">
          {subscription.status === 'Active' ? (
            <button
              className="bg-[#ff1500] hover:bg-[#e4574f] text-white font-bold py-2 px-8 rounded-xl shadow transition mb-2 disabled:opacity-60"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
            </button>
          ) : (
            <span className="text-[#a259ec] font-semibold mb-2">Subscription is cancelled.</span>
          )}
          {cancelled && (
            <div className="text-green-600 font-semibold mb-2">Your subscription has been cancelled.</div>
          )}
          <button
            className="mt-2 bg-[#43a1ff] hover:bg-[#2563eb] text-white font-bold py-2 px-8 rounded-xl shadow transition"
            onClick={() => router.back()}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}