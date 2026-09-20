import { TmdbSeriesResponseSchema, TmdbSerieVideosResponseSchema, TmdbSerieSchema } from '../schemas/seriesSchema';
import { mapTmdbSerieToMediaItem } from '../types';
import { buildYouTubeEmbedUrl } from '@/utils/security';
import type { MediaItem, SerieCategory } from '@/types/media';

// Rota de proxy protegida via Vercel Serverless / Vite Dev Middleware
const TMDB_PROXY_BASE = '/api/tmdb';

export async function fetchSeriesByCategory(category: SerieCategory): Promise<ReadonlyArray<MediaItem>> {
  const endpoint = category === 'on_the_air' ? '/tv/on_the_air' : '/tv/popular';
  const url = `${TMDB_PROXY_BASE}?path=${encodeURIComponent(endpoint)}&page=1`;

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
  const url = `${TMDB_PROXY_BASE}?path=/search/tv&query=${encodeURIComponent(query)}&page=1`;

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
  const url = `${TMDB_PROXY_BASE}?path=/tv/${serieId}`;

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
  const url = `${TMDB_PROXY_BASE}?path=/tv/${serieId}/videos`;

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
