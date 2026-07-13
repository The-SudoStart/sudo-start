'use client';

import { useContext, useCallback } from 'react';
import { ToastContext } from '@/lib/toast-context';
import { ToastType, ToastOptions } from '@/types/toast';

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { addToast, removeToast, clearAll } = context;

  const createToast = useCallback(
    (type: ToastType) =>
      (message: string, options?: ToastOptions) => {
        return addToast({
          type,
          message,
          duration: options?.duration,
          action: options?.action,
        });
      },
    [addToast]
  );

  return {
    toast: {
      success: createToast('success'),
      error: createToast('error'),
      warning: createToast('warning'),
      info: createToast('info'),
    },
    dismiss: removeToast,
    dismissAll: clearAll,
  };
}
