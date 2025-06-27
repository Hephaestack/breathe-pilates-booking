'use client';
import { useRouter } from 'next/navigation';

export default function BackArrow() {
  const router = useRouter();

  return (
    <button
      aria-label="Go back"
      onClick={() => router.back()}
      className="fixed top-4 left-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 shadow hover:bg-gray-100 transition"
      style={{ backdropFilter: 'blur(4px)' }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 text-[#4A2C2A]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
}