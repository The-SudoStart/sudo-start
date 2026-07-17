'use client';

import { useContext } from 'react';
import { ToastContext } from '@/lib/toast-context';
import { Toast } from './toast';
import { cn } from '@/lib/utils';

interface ToasterProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
}

const positionStyles = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export function Toaster({ position = 'bottom-right' }: ToasterProps) {
  const context = useContext(ToastContext);

  if (!context) {
    return null;
  }

  const { toasts, removeToast } = context;

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed z-[100] flex flex-col gap-3 p-4 pointer-events-none',
        positionStyles[position]
      )}
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast, index) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            toast={toast}
            onDismiss={() => removeToast(toast.id)}
            index={toasts.length - 1 - index}
          />
        </div>
      ))}
    </div>
  );
}
