import { TmdbSeriesResponseSchema, TmdbSerieVideosResponseSchema, TmdbSerieSchema } from '../schemas/seriesSchema';
import { mapTmdbSerieToMediaItem } from '../types';
import { buildYouTubeEmbedUrl } from '@/utils/security';
import type { MediaItem, SerieCategory } from '@/types/media';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '4470f5b73e6ecdfd6ba10fd320853bd0';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function fetchSeriesByCategory(category: SerieCategory): Promise<ReadonlyArray<MediaItem>> {
  const endpoint = category === 'on_the_air' ? '/tv/on_the_air' : '/tv/popular';
  const url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro ao buscar séries: ${response.statusText}`);
  }

  const json = await response.json();
  const parsed = TmdbSeriesResponseSchema.parse(json);

  return parsed.results
    .filter((s) => Boolean(s.poster_path))
    .map(mapTmdbSerieToMediaItem);
}

export async function searchSeries(query: string): Promise<ReadonlyArray<MediaItem>> {
  const url = `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}&page=1`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro ao buscar séries por termo: ${response.statusText}`);
  }

  const json = await response.json();
  const parsed = TmdbSeriesResponseSchema.parse(json);

  return parsed.results
    .filter((s) => Boolean(s.poster_path))
    .map(mapTmdbSerieToMediaItem);
}

export async function fetchSerieById(serieId: number): Promise<MediaItem | null> {
  const url = `${TMDB_BASE_URL}/tv/${serieId}?api_key=${TMDB_API_KEY}&language=pt-BR`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const json = await response.json();
    const parsed = TmdbSerieSchema.parse(json);
    return mapTmdbSerieToMediaItem(parsed);
  } catch (error) {
    console.warn(`[SeriesApi] Erro ao buscar série por ID ${serieId}:`, error);
    return null;
  }
}

export async function fetchSerieTrailer(serieId: number): Promise<string | null> {
  const url = `${TMDB_BASE_URL}/tv/${serieId}/videos?api_key=${TMDB_API_KEY}&language=pt-BR`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const json = await response.json();
    const parsed = TmdbSerieVideosResponseSchema.parse(json);

    // Prioriza trailer oficial no YouTube
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
    console.warn(`[SeriesApi] Não foi possível carregar o trailer da série ${serieId}:`, error);
    return null;
  }
}
