import { FC, memo, MouseEvent } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { TrailerInfo } from '@/types/media';
import styles from './TrailerModal.module.css';

export interface TrailerModalProps {
  readonly isOpen: boolean;
  readonly trailerInfo: TrailerInfo | null;
  readonly onClose: () => void;
}

export const TrailerModal: FC<TrailerModalProps> = memo(({
  isOpen,
  trailerInfo,
  onClose,
}) => {
  if (!isOpen || !trailerInfo) return null;

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="trailer-modal-title"
    >
      <div className={styles.modalContent}>
        {/* Barra Superior do Modal */}
        <div className={styles.modalHeader}>
          <h2 id="trailer-modal-title" className={styles.modalTitle}>
            {trailerInfo.title}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar trailer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Container do Iframe / Vídeo */}
        <div className={styles.videoContainer}>
          {trailerInfo.url ? (
            <iframe
              src={trailerInfo.url}
              title={`Trailer de ${trailerInfo.title}`}
              className={styles.iframe}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className={styles.notFoundContainer}>
              <AlertCircle size={40} className={styles.alertIcon} />
              <p>Trailer indisponível no momento para este título.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

TrailerModal.displayName = 'TrailerModal';
