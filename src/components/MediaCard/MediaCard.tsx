import { FC, memo, useState, KeyboardEvent, MouseEvent } from 'react';
import { Star, Play, Film, Tv, Flame, ImageOff, Bookmark, Share2 } from 'lucide-react';
import type { MediaItem } from '@/types/media';
import { formatScore, formatReleaseYear, truncateText } from '@/utils/formatters';
import styles from './MediaCard.module.css';

export interface MediaCardProps {
  readonly item: MediaItem;
  readonly onPlayTrailer: (item: MediaItem) => void;
  readonly isTrailerLoading?: boolean;
  readonly isSaved?: boolean;
  readonly onToggleWatchlist?: (item: MediaItem) => void;
  readonly onShare?: (item: MediaItem) => void;
}

const TYPE_CONFIG = {
  movie: { label: 'Filme', icon: Film, className: styles.badgeMovie },
  serie: { label: 'Série', icon: Tv, className: styles.badgeSerie },
  anime: { label: 'Anime', icon: Flame, className: styles.badgeAnime },
} as const;

export const MediaCard: FC<MediaCardProps> = memo(({
  item,
  onPlayTrailer,
  isTrailerLoading = false,
  isSaved = false,
  onToggleWatchlist,
  onShare,
}) => {
  const [imgError, setImgError] = useState<boolean>(false);
  const typeConfig = TYPE_CONFIG[item.type];
  const TypeIcon = typeConfig.icon;
  const year = formatReleaseYear(item.releaseYear);
  const score = formatScore(item.score);

  const handleCardClick = () => {
    onPlayTrailer(item);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPlayTrailer(item);
    }
  };

  const handleBookmarkClick = (e: MouseEvent) => {
    e.stopPropagation();
    onToggleWatchlist?.(item);
  };

  const handleShareClick = (e: MouseEvent) => {
    e.stopPropagation();
    onShare?.(item);
  };

  return (
    <article
      className={styles.card}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalhes e trailer de ${item.title}`}
    >
      {/* Imagem do Poster */}
      <div className={styles.imageWrapper}>
        {item.posterUrl && !imgError ? (
          <img
            src={item.posterUrl}
            alt={item.title}
            className={styles.poster}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.fallbackPoster}>
            <ImageOff size={32} className={styles.fallbackIcon} />
            <span className={styles.fallbackText}>{item.title}</span>
          </div>
        )}

        {/* Badges de Cabeçalho */}
        <div className={styles.badgeContainer}>
          <span className={`${styles.badgeType} ${typeConfig.className}`}>
            <TypeIcon size={12} />
            <span>{typeConfig.label}</span>
          </span>

          <div className={styles.headerActions}>
            {item.score !== null && item.score > 0 && (
              <span className={styles.badgeScore}>
                <Star size={12} className={styles.starIcon} fill="currentColor" />
                <span>{score}</span>
              </span>
            )}

            {onShare && (
              <button
                type="button"
                className={styles.shareBtn}
                onClick={handleShareClick}
                title="Compartilhar título"
                aria-label="Compartilhar título"
              >
                <Share2 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Camada Overlay Interativa */}
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <h3 className={styles.title}>{item.title}</h3>
            {year && <span className={styles.year}>{year}</span>}
            <p className={styles.synopsis}>{truncateText(item.overview, 120)}</p>

            <div className={styles.actionsBar}>
              <button
                type="button"
                className={styles.playButton}
                disabled={isTrailerLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayTrailer(item);
                }}
              >
                <Play size={16} fill="currentColor" />
                <span>{isTrailerLoading ? 'Carregando...' : 'Assistir Trailer'}</span>
              </button>

              {onShare && (
                <button
                  type="button"
                  className={styles.overlayShareBtn}
                  onClick={handleShareClick}
                  title="Compartilhar título"
                  aria-label="Compartilhar título"
                >
                  <Share2 size={15} />
                </button>
              )}

              {onToggleWatchlist && (
                <button
                  type="button"
                  className={`${styles.overlayBookmarkBtn} ${isSaved ? styles.overlayBookmarkActive : ''}`}
                  onClick={handleBookmarkClick}
                  title={isSaved ? 'Remover da minha lista' : 'Salvar na lista'}
                  aria-label={isSaved ? 'Remover da minha lista' : 'Salvar na lista'}
                >
                  <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
});

MediaCard.displayName = 'MediaCard';
