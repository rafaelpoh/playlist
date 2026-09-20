import { useState, useCallback, useRef } from 'react';

export type ToastType = 'success' | 'info' | 'error';

export interface ToastState {
  readonly message: string;
  readonly type: ToastType;
  readonly id: number;
}

export function useToast(defaultDurationMs: number = 4000) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success', durationMs = defaultDurationMs) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setToast({
        message,
        type,
        id: Date.now(),
      });

      timerRef.current = setTimeout(() => {
        setToast(null);
        timerRef.current = null;
      }, durationMs);
    },
    [defaultDurationMs]
  );

  return {
    toast,
    showToast,
    hideToast,
  };
}
