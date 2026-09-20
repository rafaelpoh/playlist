import type { MediaItem } from '@/types/media';
import type { TmdbSerie } from './schemas/seriesSchema';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export function mapTmdbSerieToMediaItem(serie: TmdbSerie): MediaItem {
  return {
    id: `serie-${serie.id}`,
    title: serie.name,
    overview: serie.overview,
    posterUrl: serie.poster_path ? `${TMDB_IMAGE_BASE_URL}${serie.poster_path}` : null,
    type: 'serie',
    score: serie.vote_average ?? null,
    releaseYear: serie.first_air_date ?? null,
  };
}
