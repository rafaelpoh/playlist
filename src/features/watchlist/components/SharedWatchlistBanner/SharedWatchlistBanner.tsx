import { FC, memo } from 'react';
import { Share2, Lock, Bookmark, Compass } from 'lucide-react';
import styles from './SharedWatchlistBanner.module.css';

export interface SharedWatchlistBannerProps {
  readonly ownerName: string | null;
  readonly onShareLink: () => void;
  readonly onGoToMyWatchlist: () => void;
  readonly onExploreCatalog: () => void;
  readonly itemCount: number;
}

export const SharedWatchlistBanner: FC<SharedWatchlistBannerProps> = memo(({
  ownerName,
  onShareLink,
  onGoToMyWatchlist,
  onExploreCatalog,
  itemCount,
}) => {
  const displayName = ownerName || 'Cineasta';

  return (
    <section className={styles.banner} aria-label="Informações da lista compartilhada">
      <div className={styles.content}>
        <div className={styles.infoCol}>
          <div className={styles.badgeRow}>
            <span className={styles.readOnlyBadge}>
              <Lock size={12} aria-hidden="true" />
              <span>Modo Somente Leitura</span>
            </span>
            <span className={styles.countBadge}>
              {itemCount} {itemCount === 1 ? 'título salvo' : 'títulos salvos'}
            </span>
          </div>

          <h2 className={styles.title}>
            Lista de <span className={styles.highlightName}>{displayName}</span>
          </h2>

          <p className={styles.description}>
            Você está visualizando uma lista compartilhada pública. Somente o criador desta lista pode adicionar ou excluir itens. Ao clicar no marcador dos títulos, você salva o item na sua própria lista pessoal.
          </p>
        </div>

        <div className={styles.actionsGroup}>
          <button
            type="button"
            className={styles.shareBtn}
            onClick={onShareLink}
            title="Copiar link de compartilhamento"
          >
            <Share2 size={15} aria-hidden="true" />
            <span>Compartilhar Link</span>
          </button>

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={onGoToMyWatchlist}
            title="Ir para a sua própria lista"
          >
            <Bookmark size={15} aria-hidden="true" />
            <span>Minha Lista</span>
          </button>

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={onExploreCatalog}
            title="Explorar filmes, séries e animes"
          >
            <Compass size={15} aria-hidden="true" />
            <span>Explorar Catálogo</span>
          </button>
        </div>
      </div>
    </section>
  );
});

SharedWatchlistBanner.displayName = 'SharedWatchlistBanner';
