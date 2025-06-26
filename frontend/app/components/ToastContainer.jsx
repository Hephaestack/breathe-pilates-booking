'use client';

import Toast from './Toast';

const ToastContainer = ({ toasts, hideToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-2 w-full max-w-xs sm:max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto w-full">
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => hideToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
