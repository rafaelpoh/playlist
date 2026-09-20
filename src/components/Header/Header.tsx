import { FC, memo, ReactNode } from 'react';
import { Play } from 'lucide-react';
import styles from './Header.module.css';

export interface HeaderProps {
  readonly onLogoClick?: () => void;
  readonly rightSlot?: ReactNode;
}

export const Header: FC<HeaderProps> = memo(({ onLogoClick, rightSlot }) => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div 
          className={styles.brand} 
          onClick={onLogoClick} 
          role="button" 
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onLogoClick?.();
            }
          }}
        >
          <div className={styles.logoBadge}>
            <Play className={styles.playIcon} size={20} />
          </div>
          <div className={styles.brandText}>
            <h1 className={styles.title}>Playlist</h1>
            <span className={styles.tagline}>Filmes • Séries • Animes</span>
          </div>
        </div>
        {rightSlot && <div className={styles.rightSlot}>{rightSlot}</div>}
      </div>
    </header>
  );
});

Header.displayName = 'Header';
