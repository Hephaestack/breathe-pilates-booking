'use client';

import { useState, useEffect } from 'react';

const Toast = ({ message, type = 'success', duration, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  const getDuration = () => {
    if (duration !== undefined) return duration;
    switch (type) {
      case 'error':
        return 4000; // error stays for 4s
      case 'success':
        return 3000;
      case 'warning':
        return 4000;
      case 'info':
        return 3500;
      default:
        return 3000;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 300); // Animation duration
    }, getDuration());

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    const baseStyles =
      "relative flex items-center gap-2 px-4 py-2 rounded-xl shadow-2xl backdrop-blur-lg border font-semibold transition-all duration-300 transform w-auto min-w-[180px] max-w-[90vw]";
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500/90 border-green-400/50 text-white ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`;
      case 'error':
        return `${baseStyles} bg-red-500/90 border-red-400/50 text-white ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`;
      case 'warning':
        return `${baseStyles} bg-yellow-500/90 border-yellow-400/50 text-white ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`;
      case 'info':
        return `${baseStyles} bg-blue-500/90 border-blue-400/50 text-white ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`;
      default:
        return `${baseStyles} bg-gray-500/90 border-gray-400/50 text-white ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={getToastStyles()}>
      {getIcon()}
      <span className="flex-1 text-sm text-left">{message}</span>
      <button
        onClick={() => {
          setIsLeaving(true);
          setTimeout(() => {
            setIsVisible(false);
            onClose();
          }, 300);
        }}
        className="flex items-center self-stretch justify-center p-1 ml-2 transition-colors rounded-full hover:bg-white/20"
        style={{ alignSelf: 'stretch', marginLeft: 'auto' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
