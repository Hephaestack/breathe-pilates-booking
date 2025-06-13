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
      <div className="bg-white rounded-2xl shadow-2xl px-6 py-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#4A2C2A] mb-6 text-center">
          My Subscriptions
        </h1>
        <ul className="space-y-5">
          {subscriptions.map((sub) => (
            <li key={sub.id} className="p-4 rounded-xl bg-[#FEC8D8] shadow flex flex-col items-center">
              <span className="font-bold text-lg">{sub.name}</span>
              {sub.type === 'monthly' && (
                <span className="text-sm text-gray-700 mt-2">
                  Expires: {sub.expires}
                </span>
              )}
              {sub.type === 'package' && (
                <span className="text-sm text-gray-700 mt-2">
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