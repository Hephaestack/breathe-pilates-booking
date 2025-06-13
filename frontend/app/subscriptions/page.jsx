'use client';

import { useState } from 'react';

const mockSubscriptions = [
  {
    id: 1,
    type: 'monthly',
    name: 'Monthly Pilates',
    expires: '2025-08-15',
  },
  {
    id: 2,
    type: 'package',
    name: '10-Class Package',
    remaining: 4,
  },
];

export default function SubscriptionsPage() {
  const [subscriptions] = useState(mockSubscriptions);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="bg-white/80 rounded-2xl shadow-2xl px-4 py-6 border border-[#4A2C2A]/30  shadow-[#3a2826] w-full max-w-md">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#b3b18f] via-[#A5957E] to-[#4A2C2A] bg-clip-text text-transparent text-center mb-5 tracking-tight drop-shadow">
          My Subscriptions
        </h1>
        <ul className="space-y-5">
          {subscriptions.map((sub) => (
            <li key={sub.id} className="p-4 rounded-xl bg-[#b3a591] shadow flex flex-col items-center">
              <span className="font-bold text-lg">{sub.name}</span>
              {sub.type === 'monthly' && (
                <span className="text-sm text-black mt-2">
                  Expires: {sub.expires}
                </span>
              )}
              {sub.type === 'package' && (
                <span className="text-sm text-black mt-2">
                  Remaining lessons: {sub.remaining}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}