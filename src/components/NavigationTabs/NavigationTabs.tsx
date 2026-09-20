import { FC, memo } from 'react';
import { Sparkles, Film, Tv, Flame, Bookmark } from 'lucide-react';
import type { MediaTypeFilter, MovieCategory, SerieCategory, AnimeCategory } from '@/types/media';
import styles from './NavigationTabs.module.css';

export interface NavigationTabsProps {
  readonly activeTab: MediaTypeFilter;
  readonly onTabChange: (tab: MediaTypeFilter) => void;
  readonly movieCategory: MovieCategory;
  readonly onMovieCategoryChange: (category: MovieCategory) => void;
  readonly serieCategory: SerieCategory;
  readonly onSerieCategoryChange: (category: SerieCategory) => void;
  readonly animeCategory: AnimeCategory;
  readonly onAnimeCategoryChange: (category: AnimeCategory) => void;
  readonly watchlistCount?: number;
}

export const NavigationTabs: FC<NavigationTabsProps> = memo(({
  activeTab,
  onTabChange,
  movieCategory,
  onMovieCategoryChange,
  serieCategory,
  onSerieCategoryChange,
  animeCategory,
  onAnimeCategoryChange,
  watchlistCount = 0,
}) => {
  return (
    <div className={styles.wrapper}>
      {/* Abas Principais */}
      <nav className={styles.mainTabs} aria-label="Filtro de tipo de mídia">
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'all' ? styles.tabActive : ''}`}
          onClick={() => onTabChange('all')}
        >
          <Sparkles size={16} />
          <span>Tudo</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${styles.tabMovie} ${activeTab === 'movie' ? styles.tabActiveMovie : ''}`}
          onClick={() => onTabChange('movie')}
        >
          <Film size={16} />
          <span>Filmes</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${styles.tabSerie} ${activeTab === 'serie' ? styles.tabActiveSerie : ''}`}
          onClick={() => onTabChange('serie')}
        >
          <Tv size={16} />
          <span>Séries</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${styles.tabAnime} ${activeTab === 'anime' ? styles.tabActiveAnime : ''}`}
          onClick={() => onTabChange('anime')}
        >
          <Flame size={16} />
          <span>Animes</span>
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${styles.tabWatchlist} ${activeTab === 'watchlist' ? styles.tabActiveWatchlist : ''}`}
          onClick={() => onTabChange('watchlist')}
        >
          <Bookmark size={16} />
          <span>Minha Lista</span>
          {watchlistCount > 0 && (
            <span className={styles.tabBadge}>{watchlistCount}</span>
          )}
        </button>
      </nav>

      {/* Sub-categorias dinâmicas contextuais */}
      {activeTab === 'movie' && (
        <div className={styles.subFilterGroup} aria-label="Categorias de filmes">
          <button
            type="button"
            className={`${styles.subFilterBtn} ${movieCategory === 'now_playing' ? styles.subFilterActive : ''}`}
            onClick={() => onMovieCategoryChange('now_playing')}
          >
            Em Cartaz
          </button>
          <button
            type="button"
            className={`${styles.subFilterBtn} ${movieCategory === 'upcoming' ? styles.subFilterActive : ''}`}
            onClick={() => onMovieCategoryChange('upcoming')}
          >
            Próximos Lançamentos
          </button>
        </div>
      )}

      {activeTab === 'serie' && (
        <div className={styles.subFilterGroup} aria-label="Categorias de séries">
          <button
            type="button"
            className={`${styles.subFilterBtn} ${serieCategory === 'on_the_air' ? styles.subFilterActive : ''}`}
            onClick={() => onSerieCategoryChange('on_the_air')}
          >
            Séries no Ar
          </button>
          <button
            type="button"
            className={`${styles.subFilterBtn} ${serieCategory === 'popular' ? styles.subFilterActive : ''}`}
            onClick={() => onSerieCategoryChange('popular')}
          >
            Mais Populares
          </button>
        </div>
      )}

      {activeTab === 'anime' && (
        <div className={styles.subFilterGroup} aria-label="Categorias de animes">
          <button
            type="button"
            className={`${styles.subFilterBtn} ${animeCategory === 'now' ? styles.subFilterActive : ''}`}
            onClick={() => onAnimeCategoryChange('now')}
          >
            Temporada Atual
          </button>
          <button
            type="button"
            className={`${styles.subFilterBtn} ${animeCategory === 'popular' ? styles.subFilterActive : ''}`}
            onClick={() => onAnimeCategoryChange('popular')}
          >
            Top Animes
          </button>
        </div>
      )}
    </div>
  );
});

NavigationTabs.displayName = 'NavigationTabs';
