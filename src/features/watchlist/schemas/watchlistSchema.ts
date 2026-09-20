import { z } from 'zod';

export const WatchlistItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  overview: z.string().default(''),
  posterUrl: z.string().nullable().optional(),
  type: z.enum(['movie', 'serie', 'anime']),
  score: z.number().nullable().optional(),
  releaseYear: z.string().nullable().optional(),
  trailerUrl: z.string().nullable().optional(),
  addedAt: z.number().default(() => Date.now()),
});

export type WatchlistDocument = z.infer<typeof WatchlistItemSchema>;
