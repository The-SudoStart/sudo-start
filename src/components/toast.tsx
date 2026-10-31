'use client';

import { Toast as ToastType } from '@/types/toast';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ToastProps {
  toast: ToastType;
  onDismiss: () => void;
  index: number;
}

// Bracketed systemd-style status labels: the word carries the meaning, not the color.
const tags = {
  success: { label: 'OK', className: 'status-ok', bar: 'var(--ok)' },
  error: { label: 'FAIL', className: 'status-fail', bar: 'var(--fail)' },
  warning: { label: 'WARN', className: 'status-warn', bar: 'var(--warn)' },
  info: { label: 'INFO', className: 'status-info', bar: 'var(--primary)' },
};

export function Toast({ toast, onDismiss, index }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const tag = tags[toast.type];

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
        'relative w-full max-w-sm overflow-hidden rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-2)]',
        'transition-all duration-300 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        isEntering && 'translate-x-full opacity-0',
        isExiting && 'translate-x-full opacity-0',
        !isEntering && !isExiting && 'translate-x-0 opacity-100'
      )}
      style={{
        transform: `translateY(${index * 8}px)`,
      }}
    >
      <div className="flex items-start gap-3">
        <span className={cn('status-tag mt-px shrink-0', tag.className)}>{tag.label}</span>
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
          color: tag.bar,
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
