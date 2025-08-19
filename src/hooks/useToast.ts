import { useState, useCallback } from 'react';

export interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  show: boolean;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    const newToast: ToastState = {
      id,
      message,
      type,
      show: true
    };

    setToasts(prev => [...prev, newToast]);

    // 自动移除 toast
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3500);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, show: false } : toast
    ));

    // 延迟移除，等待动画完成
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  }, []);

  return {
    toasts,
    showToast,
    hideToast
  };
}
