import { JikanAnimeResponseSchema } from '../schemas/animeSchema';
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
