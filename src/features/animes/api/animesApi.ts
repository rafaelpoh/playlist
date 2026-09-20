import { JikanAnimeResponseSchema, JikanSingleAnimeResponseSchema } from '../schemas/animeSchema';
import { mapJikanAnimeToMediaItem } from '../types';
import type { MediaItem, AnimeCategory } from '@/types/media';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

export async function fetchAnimesByCategory(category: AnimeCategory): Promise<ReadonlyArray<MediaItem>> {
  const endpoint = category === 'now' ? '/seasons/now' : '/top/anime';
  const url = `${JIKAN_BASE_URL}${endpoint}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro ao buscar animes: ${response.statusText}`);
  }

  const json = await response.json();
  const parsed = JikanAnimeResponseSchema.parse(json);

  return parsed.data
    .filter((a) => Boolean(a.images?.webp?.image_url || a.images?.jpg?.image_url))
    .map(mapJikanAnimeToMediaItem);
}

export async function searchAnimes(query: string): Promise<ReadonlyArray<MediaItem>> {
  const url = `${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(query)}&sfw=true`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro ao buscar animes por termo: ${response.statusText}`);
  }

  const json = await response.json();
  const parsed = JikanAnimeResponseSchema.parse(json);

  return parsed.data
    .filter((a) => Boolean(a.images?.webp?.image_url || a.images?.jpg?.image_url))
    .map(mapJikanAnimeToMediaItem);
}

export async function fetchAnimeById(animeId: number): Promise<MediaItem | null> {
  const url = `${JIKAN_BASE_URL}/anime/${animeId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const json = await response.json();
    const parsed = JikanSingleAnimeResponseSchema.parse(json);
    return mapJikanAnimeToMediaItem(parsed.data);
  } catch (error) {
    console.warn(`[AnimeApi] Erro ao buscar anime por ID ${animeId}:`, error);
    return null;
  }
}
