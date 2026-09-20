import { z } from 'zod';

export const TmdbMovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  overview: z.string().default(''),
  poster_path: z.string().nullable().optional(),
  vote_average: z.number().nullable().optional(),
  release_date: z.string().nullable().optional(),
});

export const TmdbMoviesResponseSchema = z.object({
  page: z.number().optional(),
  results: z.array(TmdbMovieSchema).default([]),
  total_pages: z.number().optional(),
  total_results: z.number().optional(),
});

export const TmdbVideoItemSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string().optional(),
  site: z.string(),
  type: z.string(),
});

export const TmdbVideosResponseSchema = z.object({
  id: z.number().optional(),
  results: z.array(TmdbVideoItemSchema).default([]),
});

export type TmdbMovie = z.infer<typeof TmdbMovieSchema>;
export type TmdbMoviesResponse = z.infer<typeof TmdbMoviesResponseSchema>;
export type TmdbVideoItem = z.infer<typeof TmdbVideoItemSchema>;
