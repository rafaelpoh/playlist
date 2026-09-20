import { TmdbMoviesResponseSchema, TmdbVideosResponseSchema, TmdbMovieSchema } from '../schemas/movieSchema';
import { mapTmdbMovieToMediaItem } from '../types';
import { buildYouTubeEmbedUrl } from '@/utils/security';
import type { MediaItem, MovieCategory } from '@/types/media';

// Rota de proxy protegida via Vercel Serverless / Vite Dev Middleware
const TMDB_PROXY_BASE = '/api/tmdb';

export async function fetchMoviesByCategory(category: MovieCategory): Promise<ReadonlyArray<MediaItem>> {
  const endpoint = category === 'now_playing' ? '/movie/now_playing' : '/movie/upcoming';
  const url = `${TMDB_PROXY_BASE}?path=${encodeURIComponent(endpoint)}&page=1`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro ao buscar filmes: ${response.statusText}`);
  }

  const json = await response.json();
  const parsed = TmdbMoviesResponseSchema.parse(json);

  return parsed.results
    .filter((m) => Boolean(m.poster_path))
    .map(mapTmdbMovieToMediaItem);
}

export async function searchMovies(query: string): Promise<ReadonlyArray<MediaItem>> {
  const url = `${TMDB_PROXY_BASE}?path=/search/movie&query=${encodeURIComponent(query)}&page=1`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro ao buscar filmes por termo: ${response.statusText}`);
  }

  const json = await response.json();
  const parsed = TmdbMoviesResponseSchema.parse(json);

  return parsed.results
    .filter((m) => Boolean(m.poster_path))
    .map(mapTmdbMovieToMediaItem);
}

export async function fetchMovieById(movieId: number): Promise<MediaItem | null> {
  const url = `${TMDB_PROXY_BASE}?path=/movie/${movieId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const json = await response.json();
    const parsed = TmdbMovieSchema.parse(json);
    return mapTmdbMovieToMediaItem(parsed);
  } catch (error) {
    console.warn(`[MovieApi] Erro ao buscar filme por ID ${movieId}:`, error);
    return null;
  }
}

export async function fetchMovieTrailer(movieId: number): Promise<string | null> {
  const url = `${TMDB_PROXY_BASE}?path=/movie/${movieId}/videos`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const json = await response.json();
    const parsed = TmdbVideosResponseSchema.parse(json);

    // Prioriza trailers oficiais no YouTube
    const trailer = parsed.results.find(
      (video) => video.type === 'Trailer' && video.site.toLowerCase() === 'youtube'
    ) || parsed.results.find(
      (video) => video.site.toLowerCase() === 'youtube'
    );

    if (trailer?.key) {
      return buildYouTubeEmbedUrl(trailer.key);
    }
    return null;
  } catch (error) {
    console.warn(`[MovieApi] Não foi possível carregar o trailer para o filme ${movieId}:`, error);
    return null;
  }
}
