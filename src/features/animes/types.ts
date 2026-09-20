import type { MediaItem } from '@/types/media';
import type { JikanAnime } from './schemas/animeSchema';
import { sanitizeEmbedUrl, buildYouTubeEmbedUrl } from '@/utils/security';

export function mapJikanAnimeToMediaItem(anime: JikanAnime): MediaItem {
  const posterUrl = anime.images?.webp?.large_image_url 
    || anime.images?.webp?.image_url 
    || anime.images?.jpg?.large_image_url 
    || anime.images?.jpg?.image_url 
    || null;

  let trailerUrl: string | null = null;
  if (anime.trailer?.youtube_id) {
    trailerUrl = buildYouTubeEmbedUrl(anime.trailer.youtube_id);
  } else if (anime.trailer?.embed_url) {
    trailerUrl = sanitizeEmbedUrl(anime.trailer.embed_url);
  }

  return {
    id: `anime-${anime.mal_id}`,
    title: anime.title,
    overview: anime.synopsis ?? '',
    posterUrl,
    type: 'anime',
    score: anime.score ?? null,
    releaseYear: anime.year ? String(anime.year) : null,
    trailerUrl,
  };
}
