import { useState, useEffect, useCallback } from 'react';
import { fetchMoviesByCategory, searchMovies, fetchMovieTrailer } from '../api/moviesApi';
import type { MediaItem, MovieCategory } from '@/types/media';

export function useMovies() {
  const [movies, setMovies] = useState<ReadonlyArray<MediaItem>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<MovieCategory>('now_playing');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadMovies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = searchQuery.trim()
        ? await searchMovies(searchQuery)
        : await fetchMoviesByCategory(category);
      setMovies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar catálogo de filmes');
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery]);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  const getTrailer = useCallback(async (mediaId: string): Promise<string | null> => {
    const numericId = parseInt(mediaId.replace('movie-', ''), 10);
    if (Number.isNaN(numericId)) return null;
    return fetchMovieTrailer(numericId);
  }, []);

  return {
    movies,
    loading,
    error,
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    refreshMovies: loadMovies,
    getTrailer,
  };
}
