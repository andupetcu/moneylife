'use client';

import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { colors, radius, shadows } from '../lib/design-tokens';

type ToastType = 'success' | 'info' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const TOAST_COLORS: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
  success: { bg: '#ECFDF5', border: colors.success, text: '#065F46', icon: '✅' },
  info: { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF', icon: 'ℹ️' },
  error: { bg: '#FEF2F2', border: colors.danger, text: '#991B1B', icon: '❌' },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [exiting, setExiting] = useState(false);
  const style = TOAST_COLORS[toast.type];

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), 2600);
    const removeTimer = setTimeout(() => onRemove(toast.id), 3000);
    return () => { clearTimeout(exitTimer); clearTimeout(removeTimer); };
  }, [toast.id, onRemove]);

  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: radius.md,
        background: style.bg,
        border: `1px solid ${style.border}`,
        boxShadow: shadows.elevated,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minWidth: 260,
        maxWidth: 360,
        animation: exiting ? 'toastOut 0.4s ease forwards' : 'toastIn 0.3s ease',
        pointerEvents: 'auto' as const,
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0 }}>{style.icon}</span>
      <span style={{ fontSize: 14, fontWeight: 500, color: style.text, flex: 1 }}>{toast.message}</span>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setToasts(prev => [...prev.slice(-4), { id, message, type }]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 80,
          right: 20,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: 'none',
        }}>
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onRemove={removeToast} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
