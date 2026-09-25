import { z } from 'zod';

export const WatchlistItemSchema = z.object({
  id: z.coerce.string(),
  title: z.coerce.string().default('Título'),
  overview: z.coerce.string().default(''),
  posterUrl: z.string().nullable().optional().default(null),
  type: z.union([z.literal('movie'), z.literal('serie'), z.literal('anime')]).catch('movie'),
  score: z.union([z.number(), z.string()]).nullable().optional().transform((v) => {
    if (v === null || v === undefined) return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
  }),
  releaseYear: z.union([z.string(), z.number()]).nullable().optional().transform((v) => {
    if (v === null || v === undefined) return null;
    return String(v);
  }),
  trailerUrl: z.string().nullable().optional().default(null),
  addedAt: z.union([z.number(), z.string()]).nullable().optional().transform((v) => {
    if (v === null || v === undefined) return Date.now();
    const n = Number(v);
    return isNaN(n) ? Date.now() : n;
  }),
});

export type WatchlistDocument = z.infer<typeof WatchlistItemSchema>;
