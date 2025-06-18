'use client';
import { usePathname } from 'next/navigation';
import BackArrow from './BackArrow';

export default function ShowBackArrow() {
  const pathname = usePathname();
  if (pathname === '/login') return null;
  return <BackArrow />;
}