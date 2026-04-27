'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: { icon: CheckCircle, color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
    error:   { icon: XCircle,     color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
    warning: { icon: AlertCircle, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.2)' },
  };

  const { icon: Icon, color, bg, border } = styles[type];

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-2xl shadow-2xl backdrop-blur-sm fade-up max-w-sm w-full"
      style={{ backgroundColor: bg, border: `1px solid ${border}` }}
    >
      <Icon size={18} style={{ color }} className="shrink-0 mt-0.5" />
      <p className="text-sm flex-1 leading-relaxed" style={{ color }}>
        {message}
      </p>
      <button
        onClick={onClose}
        className="shrink-0 p-0.5 rounded-lg transition-colors"
        style={{ color, opacity: 0.6 }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ── Global Toast Manager ──────────────────────────────────────────────────────
type ToastItem = { id: string; message: string; type: ToastType };

let addToastFn: ((msg: string, type: ToastType) => void) | null = null;

export function showToast(message: string, type: ToastType = 'error') {
  addToastFn?.(message, type);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    addToastFn = (message, type) => {
      const id = Math.random().toString(36).slice(2);
      setToasts(t => [...t, { id, message, type }]);
    };
    return () => { addToastFn = null; };
  }, []);

  const remove = (id: string) => setToasts(t => t.filter(x => x.id !== id));

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={() => remove(toast.id)} />
      ))}
    </div>
  );
}