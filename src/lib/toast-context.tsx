'use client';

import React, { createContext, useCallback, useState, useRef } from 'react';
import { Toast, ToastContextType } from '@/types/toast';

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

const MAX_TOASTS = 5;
const DEFAULT_DURATION = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = toastTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.current.delete(id);
    }
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const duration = toast.duration ?? DEFAULT_DURATION;

    setToasts((prev) => {
      // Remove oldest toast if at max capacity
      const newToasts = prev.length >= MAX_TOASTS ? prev.slice(1) : prev;
      return [...newToasts, { ...toast, id }];
    });

    // Auto-dismiss timer
    const timer = setTimeout(() => {
      removeToast(id);
    }, duration);
    toastTimers.current.set(id, timer);

    return id;
  }, [removeToast]);

  const clearAll = useCallback(() => {
    toastTimers.current.forEach((timer) => clearTimeout(timer));
    toastTimers.current.clear();
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
    </ToastContext.Provider>
  );
}
