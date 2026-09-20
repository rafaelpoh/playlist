import { FC, memo } from 'react';
import type { MediaItem } from '@/types/media';
import { MediaCard } from '../MediaCard/MediaCard';
import { SkeletonCard } from '../SkeletonCard/SkeletonCard';
import styles from './MediaGrid.module.css';

export interface MediaGridProps {
  readonly title: string;
  readonly items: ReadonlyArray<MediaItem>;
  readonly loading: boolean;
  readonly onPlayTrailer: (item: MediaItem) => void;
  readonly loadingTrailerId?: string | null;
  readonly count?: number;
  readonly isSaved?: (mediaId: string) => boolean;
  readonly onToggleWatchlist?: (item: MediaItem) => void;
  readonly onShare?: (item: MediaItem) => void;
}

const SKELETON_COUNT = 10;

export const MediaGrid: FC<MediaGridProps> = memo(({
  title,
  items,
  loading,
  onPlayTrailer,
  loadingTrailerId,
  count,
  isSaved,
  onToggleWatchlist,
  onShare,
}) => {
  return (
    <section className={styles.section} aria-label={title}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <div className={styles.accentLine} />
          <h2 className={styles.title}>{title}</h2>
        </div>
        {count !== undefined && !loading && (
          <span className={styles.countBadge}>{count} títulos</span>
        )}
      </div>

      <div className={styles.grid}>
        {loading
          ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <SkeletonCard key={`skeleton-${index}`} />
            ))
          : items.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onPlayTrailer={onPlayTrailer}
                isTrailerLoading={loadingTrailerId === item.id}
                isSaved={isSaved?.(item.id)}
                onToggleWatchlist={onToggleWatchlist}
                onShare={onShare}
              />
            ))}
      </div>
    </section>
  );
});

MediaGrid.displayName = 'MediaGrid';
