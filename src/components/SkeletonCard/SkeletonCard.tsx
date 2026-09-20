import { FC, memo } from 'react';
import styles from './SkeletonCard.module.css';

export const SkeletonCard: FC = memo(() => {
  return (
    <div className={styles.skeletonCard} aria-hidden="true">
      <div className={styles.shimmer} />
      <div className={styles.footerPlaceholder}>
        <div className={styles.lineShort} />
        <div className={styles.lineLong} />
      </div>
    </div>
  );
});

SkeletonCard.displayName = 'SkeletonCard';
