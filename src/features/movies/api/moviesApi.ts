import { TmdbMoviesResponseSchema, TmdbVideosResponseSchema, TmdbMovieSchema } from '../schemas/movieSchema';
import { mapTmdbMovieToMediaItem } from '../types';
import { buildYouTubeEmbedUrl } from '@/utils/security';
import type { MediaItem, MovieCategory } from '@/types/media';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '4470f5b73e6ecdfd6ba10fd320853bd0';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function fetchMoviesByCategory(category: MovieCategory): Promise<ReadonlyArray<MediaItem>> {
  const endpoint = category === 'now_playing' ? '/movie/now_playing' : '/movie/upcoming';
  const url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`;

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
  const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}&page=1`;

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
  const url = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=pt-BR`;

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
  const url = `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=pt-BR`;

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
