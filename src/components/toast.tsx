'use client';

import { Toast as ToastType } from '@/types/toast';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ToastProps {
  toast: ToastType;
  onDismiss: () => void;
  index: number;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const styles = {
  success: {
    border: 'border-primary/50',
    bg: 'bg-primary/10',
    icon: 'text-primary',
    glow: 'shadow-[0_0_20px_rgba(0,255,128,0.15)]',
  },
  error: {
    border: 'border-destructive/50',
    bg: 'bg-destructive/10',
    icon: 'text-destructive',
    glow: 'shadow-[0_0_20px_rgba(255,80,80,0.15)]',
  },
  warning: {
    border: 'border-yellow-500/50',
    bg: 'bg-yellow-500/10',
    icon: 'text-yellow-500',
    glow: 'shadow-[0_0_20px_rgba(255,200,0,0.15)]',
  },
  info: {
    border: 'border-blue-500/50',
    bg: 'bg-blue-500/10',
    icon: 'text-blue-500',
    glow: 'shadow-[0_0_20px_rgba(100,150,255,0.15)]',
  },
};

export function Toast({ toast, onDismiss, index }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const Icon = icons[toast.type];
  const style = styles[toast.type];

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setIsEntering(false), 50);
    return () => clearTimeout(enterTimer);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 300);
  };

  // Handle keyboard dismissal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
      e.preventDefault();
      handleDismiss();
    }
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative w-full max-w-sm rounded-lg border p-4 shadow-lg backdrop-blur-sm',
        'transition-all duration-300 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        style.border,
        style.bg,
        style.glow,
        isEntering && 'translate-x-full opacity-0',
        isExiting && 'translate-x-full opacity-0',
        !isEntering && !isExiting && 'translate-x-0 opacity-100'
      )}
      style={{
        transform: `translateY(${index * 8}px)`,
      }}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', style.icon)} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="font-semibold text-sm text-foreground mb-0.5">
              {toast.title}
            </p>
          )}
          <p className="text-sm text-foreground/90 break-words">
            {toast.message}
          </p>
          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick();
                handleDismiss();
              }}
              className="mt-2 text-xs font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
              style={{ color: 'var(--primary)' }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 rounded hover:bg-foreground/10 transition-colors"
          aria-label="Dismiss notification"
          title="Dismiss"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Progress bar for auto-dismiss */}
      <div
        className="absolute bottom-0 left-0 h-0.5 bg-current opacity-30"
        style={{
          width: '100%',
          animation: `shrink ${toast.duration ?? 4000}ms linear forwards`,
          color: toast.type === 'success' ? 'var(--primary)' : 
                 toast.type === 'error' ? 'var(--destructive)' :
                 toast.type === 'warning' ? '#eab308' : '#3b82f6',
        }}
      />

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
