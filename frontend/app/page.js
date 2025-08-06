'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b3b18f] mx-auto mb-4"></div>
        <p className="text-[#4A2C2A] font-semibold">Φόρτωση...</p>
      </div>
    </div>
  );
}