import { FC, memo, ReactNode } from 'react';
import { Play } from 'lucide-react';
import styles from './Header.module.css';

export interface HeaderProps {
  readonly onLogoClick?: () => void;
  readonly navigationTabs?: ReactNode;
  readonly searchBar?: ReactNode;
  readonly rightSlot?: ReactNode;
}

export const Header: FC<HeaderProps> = memo(({
  onLogoClick,
  navigationTabs,
  searchBar,
  rightSlot,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo / Marca da Aplicação */}
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
          aria-label="Playlist Home"
        >
          <div className={styles.logoBadge}>
            <Play className={styles.playIcon} size={20} />
          </div>
          <div className={styles.brandText}>
            <h1 className={styles.title}>Playlist</h1>
            <span className={styles.tagline}>Filmes • Séries • Animes</span>
          </div>
        </div>

        {/* Centro: Barra de Navegação e Campo de Busca antes do perfil */}
        <div className={styles.centerActions}>
          {navigationTabs && (
            <div className={styles.navSlot}>
              {navigationTabs}
            </div>
          )}
          {searchBar && (
            <div className={styles.searchSlot}>
              {searchBar}
            </div>
          )}
        </div>

        {/* Direita: Menu do Perfil do Usuário */}
        {rightSlot && (
          <div className={styles.rightSlot}>
            {rightSlot}
          </div>
        )}
      </div>
    </header>
  );
});

Header.displayName = 'Header';
