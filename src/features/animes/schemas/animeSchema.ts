import { z } from 'zod';

export const JikanAnimeImageSchema = z.object({
  image_url: z.string().nullable().optional(),
  small_image_url: z.string().nullable().optional(),
  large_image_url: z.string().nullable().optional(),
});

export const JikanAnimeTrailerSchema = z.object({
  youtube_id: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  embed_url: z.string().nullable().optional(),
});

export const JikanAnimeSchema = z.object({
  mal_id: z.number(),
  title: z.string(),
  synopsis: z.string().nullable().optional(),
  images: z.object({
    jpg: JikanAnimeImageSchema.optional(),
    webp: JikanAnimeImageSchema.optional(),
  }).optional(),
  score: z.number().nullable().optional(),
  year: z.number().nullable().optional(),
  trailer: JikanAnimeTrailerSchema.nullable().optional(),
});

export const JikanAnimeResponseSchema = z.object({
  data: z.array(JikanAnimeSchema).default([]),
});

export type JikanAnime = z.infer<typeof JikanAnimeSchema>;
export type JikanAnimeResponse = z.infer<typeof JikanAnimeResponseSchema>;
