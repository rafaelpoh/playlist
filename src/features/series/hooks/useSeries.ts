import { useState, useEffect, useCallback } from 'react';
import { fetchSeriesByCategory, searchSeries, fetchSerieTrailer } from '../api/seriesApi';
import type { MediaItem, SerieCategory } from '@/types/media';

export function useSeries() {
  const [series, setSeries] = useState<ReadonlyArray<MediaItem>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<SerieCategory>('on_the_air');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadSeries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = searchQuery.trim()
        ? await searchSeries(searchQuery)
        : await fetchSeriesByCategory(category);
      setSeries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar catálogo de séries');
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery]);

  useEffect(() => {
    loadSeries();
  }, [loadSeries]);

  const getTrailer = useCallback(async (mediaId: string): Promise<string | null> => {
    const numericId = parseInt(mediaId.replace('serie-', ''), 10);
    if (Number.isNaN(numericId)) return null;
    return fetchSerieTrailer(numericId);
  }, []);

  return {
    series,
    loading,
    error,
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    refreshSeries: loadSeries,
    getTrailer,
  };
}
