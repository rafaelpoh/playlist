export type MediaType = 'movie' | 'serie' | 'anime';

export type MediaTypeFilter = 'all' | 'movie' | 'serie' | 'anime' | 'watchlist' | 'shared-watchlist';

export type MovieCategory = 'now_playing' | 'upcoming';
export type SerieCategory = 'on_the_air' | 'popular';
export type AnimeCategory = 'now' | 'popular';

export interface TrailerInfo {
  readonly url: string;
  readonly title: string;
  readonly item?: MediaItem;
}

export interface MediaItem {
  readonly id: string;
  readonly title: string;
  readonly overview: string;
  readonly posterUrl: string | null;
  readonly type: MediaType;
  readonly score: number | null;
  readonly releaseYear: string | null;
  readonly trailerUrl?: string | null;
}
