import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header/Header';
import { SearchBar } from './components/SearchBar/SearchBar';
import { NavigationTabs } from './components/NavigationTabs/NavigationTabs';
import { MediaGrid } from './components/MediaGrid/MediaGrid';
import { TrailerModal } from './components/TrailerModal/TrailerModal';
import { EmptyState } from './components/EmptyState/EmptyState';
import { AuthProvider } from './features/auth/context/AuthContext';
import { AuthModal } from './features/auth/components/AuthModal/AuthModal';
import { UserMenu } from './features/auth/components/UserMenu/UserMenu';
import { useWatchlist } from './features/watchlist/hooks/useWatchlist';
import { useMovies } from './features/movies/hooks/useMovies';
import { useSeries } from './features/series/hooks/useSeries';
import { useAnimes } from './features/animes/hooks/useAnimes';
import { useTrailerModal } from './hooks/useTrailerModal';
import { useDebounce } from './hooks/useDebounce';
import { useToast } from './hooks/useToast';
import { useDeepLink } from './hooks/useDeepLink';
import { Toast } from './components/Toast/Toast';
import { shareMediaItem } from './utils/share';
import type { MediaTypeFilter, MediaItem } from './types/media';
import styles from './App.module.css';

const PlaylistMain: FC = () => {
  const [activeTab, setActiveTab] = useState<MediaTypeFilter>('all');
  const [searchInput, setSearchInput] = useState<string>('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const [loadingTrailerId, setLoadingTrailerId] = useState<string | null>(null);

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authPrompt, setAuthPrompt] = useState<string | undefined>(undefined);

  const { watchlist, watchlistCount, isSaved, toggleWatchlist, loading: watchlistLoading } = useWatchlist();

  // Features hooks
  const {
    movies,
    loading: moviesLoading,
    error: moviesError,
    category: movieCategory,
    setCategory: setMovieCategory,
    setSearchQuery: setMovieSearch,
    getTrailer: getMovieTrailer,
    refreshMovies,
  } = useMovies();

  const {
    series,
    loading: seriesLoading,
    error: seriesError,
    category: serieCategory,
    setCategory: setSerieCategory,
    setSearchQuery: setSerieSearch,
    getTrailer: getSerieTrailer,
    refreshSeries,
  } = useSeries();

  const {
    animes,
    loading: animesLoading,
    error: animesError,
    category: animeCategory,
    setCategory: setAnimeCategory,
    setSearchQuery: setAnimeSearch,
    refreshAnimes,
  } = useAnimes();

  // Toast notifications hook
  const { toast, showToast, hideToast } = useToast();

  // Modal hook
  const { isOpen, trailerInfo, openTrailer, closeTrailer } = useTrailerModal();

  // Intercepta títulos compartilhados via link direto (?id=...&type=...)
  useDeepLink({
    onOpenMedia: (trailerUrl, title, item) => {
      openTrailer(trailerUrl, title, item);
    },
    onNotify: (message, type) => {
      showToast(message, type);
    },
  });

  const handleShare = useCallback(async (item: MediaItem) => {
    const result = await shareMediaItem(item);
    if (result.success) {
      if (result.method === 'share') {
        showToast('Compartilhado com sucesso! 🚀', 'success');
      } else {
        showToast('Link copiado para a área de transferência! 🎉', 'success');
      }
    } else {
      showToast('Não foi possível copiar o link. Verifique as permissões.', 'error');
    }
  }, [showToast]);

  // Atualiza busca sincronizada nas features ativas
  useEffect(() => {
    setMovieSearch(debouncedSearch);
    setSerieSearch(debouncedSearch);
    setAnimeSearch(debouncedSearch);
  }, [debouncedSearch, setMovieSearch, setSerieSearch, setAnimeSearch]);

  const handleOpenAuthModal = useCallback((prompt?: string) => {
    setAuthPrompt(prompt);
    setIsAuthModalOpen(true);
  }, []);

  const handleCloseAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthPrompt(undefined);
  }, []);

  const handlePlayTrailer = useCallback(async (item: MediaItem) => {
    setLoadingTrailerId(item.id);
    try {
      if (item.type === 'movie') {
        const trailerUrl = await getMovieTrailer(item.id);
        openTrailer(trailerUrl || '', item.title, item);
      } else if (item.type === 'serie') {
        const trailerUrl = await getSerieTrailer(item.id);
        openTrailer(trailerUrl || '', item.title, item);
      } else if (item.type === 'anime') {
        openTrailer(item.trailerUrl || '', item.title, item);
      }
    } finally {
      setLoadingTrailerId(null);
    }
  }, [getMovieTrailer, getSerieTrailer, openTrailer]);

  const handleToggleWatchlist = useCallback(async (item: MediaItem) => {
    const { saved } = await toggleWatchlist(item);
    if (saved) {
      showToast(`"${item.title}" adicionado à sua lista! 🍿`, 'success');
    } else {
      showToast(`"${item.title}" removido da sua lista.`, 'info');
    }
  }, [toggleWatchlist, showToast]);

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchInput('');
    setActiveTab('all');
    refreshMovies();
    refreshSeries();
    refreshAnimes();
  }, [refreshMovies, refreshSeries, refreshAnimes]);

  // Itens da Watchlist filtrados por busca se aplicável
  const filteredWatchlist = useMemo(() => {
    if (!debouncedSearch.trim()) return watchlist;
    const term = debouncedSearch.toLowerCase();
    return watchlist.filter((item) => item.title.toLowerCase().includes(term));
  }, [watchlist, debouncedSearch]);

  const isGlobalLoading = (activeTab === 'all' && (moviesLoading || seriesLoading || animesLoading))
    || (activeTab === 'movie' && moviesLoading)
    || (activeTab === 'serie' && seriesLoading)
    || (activeTab === 'anime' && animesLoading)
    || (activeTab === 'watchlist' && watchlistLoading);

  const hasAnyItems = (activeTab === 'all' && (movies.length > 0 || series.length > 0 || animes.length > 0))
    || (activeTab === 'movie' && movies.length > 0)
    || (activeTab === 'serie' && series.length > 0)
    || (activeTab === 'anime' && animes.length > 0)
    || (activeTab === 'watchlist' && filteredWatchlist.length > 0);

  const getSearchPlaceholder = (): string => {
    switch (activeTab) {
      case 'movie':
        return 'Buscar filmes...';
      case 'serie':
        return 'Buscar séries...';
      case 'anime':
        return 'Buscar animes...';
      case 'watchlist':
        return 'Buscar na minha lista...';
      default:
        return 'Buscar filmes, séries e animes...';
    }
  };

  return (
    <div className={styles.app}>
      <Header
        onLogoClick={handleResetFilters}
        rightSlot={<UserMenu onOpenAuthModal={() => handleOpenAuthModal()} />}
      />

      {/* Hero & Painel de Controles */}
      <section className={styles.controlPanel}>
        <div className={styles.controlContent}>
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            onClear={handleClearSearch}
            placeholder={getSearchPlaceholder()}
          />

          <NavigationTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            movieCategory={movieCategory}
            onMovieCategoryChange={setMovieCategory}
            serieCategory={serieCategory}
            onSerieCategoryChange={setSerieCategory}
            animeCategory={animeCategory}
            onAnimeCategoryChange={setAnimeCategory}
            watchlistCount={watchlistCount}
          />
        </div>
      </section>

      {/* Conteúdo Principal */}
      <main className={styles.mainContent}>
        {/* Notificações de Erro das APIs se houver */}
        {(moviesError || seriesError || animesError) && (
          <div className={styles.errorBanner} role="alert">
            <p>
              Houve uma instabilidade ao conectar com um dos serviços de catálogo.
            </p>
            <button
              type="button"
              className={styles.retryButton}
              onClick={handleResetFilters}
            >
              Recarregar
            </button>
          </div>
        )}

        {/* Sem itens encontrados */}
        {!isGlobalLoading && !hasAnyItems && activeTab !== 'watchlist' && (
          <EmptyState
            message={
              searchInput.trim()
                ? `Nenhum título encontrado para "${searchInput}".`
                : 'Nenhum título disponível no momento.'
            }
            onReset={handleResetFilters}
          />
        )}

        {/* Visualização: MINHA LISTA */}
        {activeTab === 'watchlist' && (
          <div className={styles.sectionsContainer}>
            {filteredWatchlist.length === 0 ? (
              <EmptyState
                message={
                  searchInput.trim()
                    ? `Nenhum título salvo corresponde a "${searchInput}".`
                    : 'Sua lista para assistir está vazia. Adicione títulos clicando no ícone de salvar (marcador) nos cards ou no modal!'
                }
                resetLabel="Explorar Catálogo"
                onReset={() => setActiveTab('all')}
              />
            ) : (
              <MediaGrid
                title="Minha Lista de Títulos"
                items={filteredWatchlist}
                loading={watchlistLoading}
                onPlayTrailer={handlePlayTrailer}
                loadingTrailerId={loadingTrailerId}
                count={filteredWatchlist.length}
                isSaved={isSaved}
                onToggleWatchlist={handleToggleWatchlist}
                onShare={handleShare}
              />
            )}
          </div>
        )}

        {/* Visualização: TUDO */}
        {activeTab === 'all' && (
          <div className={styles.sectionsContainer}>
            {(moviesLoading || movies.length > 0) && (
              <MediaGrid
                title={searchInput.trim() ? 'Filmes Encontrados' : 'Filmes em Destaque'}
                items={movies}
                loading={moviesLoading}
                onPlayTrailer={handlePlayTrailer}
                loadingTrailerId={loadingTrailerId}
                count={movies.length}
                isSaved={isSaved}
                onToggleWatchlist={handleToggleWatchlist}
                onShare={handleShare}
              />
            )}

            {(seriesLoading || series.length > 0) && (
              <MediaGrid
                title={searchInput.trim() ? 'Séries Encontradas' : 'Séries Populares'}
                items={series}
                loading={seriesLoading}
                onPlayTrailer={handlePlayTrailer}
                loadingTrailerId={loadingTrailerId}
                count={series.length}
                isSaved={isSaved}
                onToggleWatchlist={handleToggleWatchlist}
                onShare={handleShare}
              />
            )}

            {(animesLoading || animes.length > 0) && (
              <MediaGrid
                title={searchInput.trim() ? 'Animes Encontrados' : 'Animes da Temporada'}
                items={animes}
                loading={animesLoading}
                onPlayTrailer={handlePlayTrailer}
                loadingTrailerId={loadingTrailerId}
                count={animes.length}
                isSaved={isSaved}
                onToggleWatchlist={handleToggleWatchlist}
                onShare={handleShare}
              />
            )}
          </div>
        )}

        {/* Visualização: FILMES */}
        {activeTab === 'movie' && (
          <MediaGrid
            title={
              searchInput.trim()
                ? `Filmes: "${searchInput}"`
                : movieCategory === 'now_playing'
                ? 'Filmes em Cartaz'
                : 'Filmes Recomendados e Próximos'
            }
            items={movies}
            loading={moviesLoading}
            onPlayTrailer={handlePlayTrailer}
            loadingTrailerId={loadingTrailerId}
            count={movies.length}
            isSaved={isSaved}
            onToggleWatchlist={handleToggleWatchlist}
            onShare={handleShare}
          />
        )}

        {/* Visualização: SÉRIES */}
        {activeTab === 'serie' && (
          <MediaGrid
            title={
              searchInput.trim()
                ? `Séries: "${searchInput}"`
                : serieCategory === 'on_the_air'
                ? 'Séries no Ar'
                : 'Séries Mais Populares'
            }
            items={series}
            loading={seriesLoading}
            onPlayTrailer={handlePlayTrailer}
            loadingTrailerId={loadingTrailerId}
            count={series.length}
            isSaved={isSaved}
            onToggleWatchlist={handleToggleWatchlist}
            onShare={handleShare}
          />
        )}

        {/* Visualização: ANIMES */}
        {activeTab === 'anime' && (
          <MediaGrid
            title={
              searchInput.trim()
                ? `Animes: "${searchInput}"`
                : animeCategory === 'now'
                ? 'Animes da Temporada Atual'
                : 'Top Animes Mais Populares'
            }
            items={animes}
            loading={animesLoading}
            onPlayTrailer={handlePlayTrailer}
            loadingTrailerId={loadingTrailerId}
            count={animes.length}
            isSaved={isSaved}
            onToggleWatchlist={handleToggleWatchlist}
            onShare={handleShare}
          />
        )}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>
            Playlist © {new Date().getFullYear()} — Autenticação & Firestore integrados com Firebase.
          </p>
        </div>
      </footer>

      {/* Modal de Trailer */}
      <TrailerModal
        isOpen={isOpen}
        trailerInfo={trailerInfo}
        onClose={closeTrailer}
        onShare={handleShare}
        isSaved={trailerInfo?.item ? isSaved(trailerInfo.item.id) : false}
        onToggleWatchlist={handleToggleWatchlist}
      />

      {/* Modal de Autenticação */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuthModal}
        initialPrompt={authPrompt}
      />

      {/* Notificação Toast */}
      <Toast toast={toast} onDismiss={hideToast} />
    </div>
  );
};

export const App: FC = () => {
  return (
    <AuthProvider>
      <PlaylistMain />
    </AuthProvider>
  );
};
