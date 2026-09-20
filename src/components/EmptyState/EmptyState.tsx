import { FC, memo } from 'react';
import { Film, RotateCcw } from 'lucide-react';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  readonly message?: string;
  readonly onReset?: () => void;
  readonly resetLabel?: string;
}

export const EmptyState: FC<EmptyStateProps> = memo(({
  message = 'Nenhum resultado encontrado.',
  onReset,
  resetLabel = 'Limpar filtros e busca',
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.iconBadge}>
        <Film size={36} className={styles.icon} />
      </div>
      <p className={styles.message}>{message}</p>
      {onReset && (
        <button type="button" className={styles.button} onClick={onReset}>
          <RotateCcw size={16} />
          <span>{resetLabel}</span>
        </button>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';
