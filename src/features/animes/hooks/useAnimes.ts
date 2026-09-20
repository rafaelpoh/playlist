import { useState, useEffect, useCallback } from 'react';
import { fetchAnimesByCategory, searchAnimes } from '../api/animesApi';
import type { MediaItem, AnimeCategory } from '@/types/media';

export function useAnimes() {
  const [animes, setAnimes] = useState<ReadonlyArray<MediaItem>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<AnimeCategory>('now');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadAnimes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = searchQuery.trim()
        ? await searchAnimes(searchQuery)
        : await fetchAnimesByCategory(category);
      setAnimes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar catálogo de animes');
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery]);

  useEffect(() => {
    loadAnimes();
  }, [loadAnimes]);

  const getTrailer = useCallback(async (mediaId: string): Promise<string | null> => {
    const item = animes.find((a) => a.id === mediaId);
    return item?.trailerUrl ?? null;
  }, [animes]);

  return {
    animes,
    loading,
    error,
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    refreshAnimes: loadAnimes,
    getTrailer,
  };
}
