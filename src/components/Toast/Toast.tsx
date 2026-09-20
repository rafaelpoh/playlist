import { FC, memo } from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import type { ToastState } from '@/hooks/useToast';
import styles from './Toast.module.css';

export interface ToastProps {
  readonly toast: ToastState | null;
  readonly onDismiss: () => void;
}

export const Toast: FC<ToastProps> = memo(({ toast, onDismiss }) => {
  if (!toast) return null;

  const Icon = toast.type === 'error' ? AlertCircle : toast.type === 'info' ? Info : CheckCircle2;

  return (
    <aside
      className={`${styles.toast} ${styles[toast.type]}`}
      role="status"
      aria-live="polite"
    >
      <Icon size={18} className={styles.icon} />
      <span className={styles.message}>{toast.message}</span>
      <button
        type="button"
        className={styles.dismissBtn}
        onClick={onDismiss}
        aria-label="Fechar notificação"
      >
        <X size={14} />
      </button>
    </aside>
  );
});

Toast.displayName = 'Toast';
