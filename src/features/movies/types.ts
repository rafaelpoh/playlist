import type { MediaItem } from '@/types/media';
import type { TmdbMovie } from './schemas/movieSchema';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export function mapTmdbMovieToMediaItem(movie: TmdbMovie): MediaItem {
  return {
    id: `movie-${movie.id}`,
    title: movie.title,
    overview: movie.overview,
    posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
    type: 'movie',
    score: movie.vote_average ?? null,
    releaseYear: movie.release_date ?? null,
  };
}
