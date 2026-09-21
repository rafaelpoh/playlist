import { useEffect, useRef } from 'react';
import { fetchMovieById, fetchMovieTrailer } from '@/features/movies/api/moviesApi';
import { fetchSerieById, fetchSerieTrailer } from '@/features/series/api/seriesApi';
import { fetchAnimeById } from '@/features/animes/api/animesApi';
import type { MediaItem, MediaType } from '@/types/media';

interface UseDeepLinkOptions {
  readonly onOpenMedia: (trailerUrl: string, title: string, item: MediaItem) => void;
  readonly onNotify?: (message: string, type: 'info' | 'error' | 'success') => void;
}

export function useDeepLink({ onOpenMedia, onNotify }: UseDeepLinkOptions): void {
  const hasProcessedRef = useRef<boolean>(false);

  useEffect(() => {
    // Executa apenas uma vez no carregamento inicial da aplicação
    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    const typeParam = params.get('type') as MediaType | null;

    if (!idParam || !typeParam) return;

    const validTypes: ReadonlyArray<MediaType> = ['movie', 'serie', 'anime'];
    if (!validTypes.includes(typeParam)) return;

    // Sanitiza o ID removendo prefixos caso existam (ex: "movie-550" -> "550")
    const cleanId = idParam.replace(/^(movie|serie|anime)-/, '');
    const numericId = parseInt(cleanId, 10);
    if (isNaN(numericId)) return;

    const resolveDeepLink = async () => {
      try {
        let item: MediaItem | null = null;
        let trailerUrl: string | null = null;

        if (typeParam === 'movie') {
          const [fetchedItem, fetchedTrailer] = await Promise.all([
            fetchMovieById(numericId),
            fetchMovieTrailer(numericId),
          ]);
          item = fetchedItem;
          trailerUrl = fetchedTrailer;
        } else if (typeParam === 'serie') {
          const [fetchedItem, fetchedTrailer] = await Promise.all([
            fetchSerieById(numericId),
            fetchSerieTrailer(numericId),
          ]);
          item = fetchedItem;
          trailerUrl = fetchedTrailer;
        } else if (typeParam === 'anime') {
          item = await fetchAnimeById(numericId);
          trailerUrl = item?.trailerUrl ?? null;
        }

        if (item) {
          const finalTrailerUrl = trailerUrl || item.trailerUrl || '';
          onOpenMedia(finalTrailerUrl, item.title, item);
          onNotify?.(`Título compartilhado carregado: "${item.title}"`, 'info');

          // Remove os parâmetros da URL sem recarregar a página
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } else {
          onNotify?.('Título compartilhado não encontrado ou indisponível.', 'error');
        }
      } catch (error) {
        console.error('[DeepLink] Falha ao resolver título compartilhado:', error);
        onNotify?.('Erro ao carregar o título compartilhado.', 'error');
      }
    };

    void resolveDeepLink();
  }, [onOpenMedia, onNotify]);
}
