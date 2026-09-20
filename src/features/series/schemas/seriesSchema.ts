import { z } from 'zod';

export const TmdbSerieSchema = z.object({
  id: z.number(),
  name: z.string(),
  overview: z.string().default(''),
  poster_path: z.string().nullable().optional(),
  vote_average: z.number().nullable().optional(),
  first_air_date: z.string().nullable().optional(),
});

export const TmdbSeriesResponseSchema = z.object({
  page: z.number().optional(),
  results: z.array(TmdbSerieSchema).default([]),
  total_pages: z.number().optional(),
  total_results: z.number().optional(),
});

export const TmdbSerieVideoItemSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string().optional(),
  site: z.string(),
  type: z.string(),
});

export const TmdbSerieVideosResponseSchema = z.object({
  id: z.number().optional(),
  results: z.array(TmdbSerieVideoItemSchema).default([]),
});

export type TmdbSerie = z.infer<typeof TmdbSerieSchema>;
export type TmdbSeriesResponse = z.infer<typeof TmdbSeriesResponseSchema>;
export type TmdbSerieVideoItem = z.infer<typeof TmdbSerieVideoItemSchema>;
