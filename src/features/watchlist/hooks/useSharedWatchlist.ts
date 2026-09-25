import { useState, useEffect } from 'react';
import {
  subscribeWatchlist,
  getUserProfile,
  type UserProfileData,
} from '../services/watchlistService';
import { fetchMovieById } from '@/features/movies/api/moviesApi';
import { fetchSerieById } from '@/features/series/api/seriesApi';
import { fetchAnimeById } from '@/features/animes/api/animesApi';
import type { MediaItem } from '@/types/media';

export interface UseSharedWatchlistParams {
  readonly sharedUserId: string | null;
  readonly itemsParam?: string | null;
  readonly nameParam?: string | null;
}

export interface UseSharedWatchlistReturn {
  readonly items: ReadonlyArray<MediaItem>;
  readonly ownerProfile: UserProfileData | null;
  readonly loading: boolean;
  readonly error: string | null;
}

async function resolveItemsFromTokens(tokensStr: string): Promise<MediaItem[]> {
  const tokens = tokensStr.split(',').map((t) => t.trim()).filter(Boolean);
  const promises = tokens.map(async (token): Promise<MediaItem | null> => {
    const [typePrefix, rawId] = token.split(':');
    if (!typePrefix || !rawId) return null;
    const numId = parseInt(rawId, 10);
    if (isNaN(numId)) return null;

    try {
      if (typePrefix === 's') {
        return await fetchSerieById(numId);
      } else if (typePrefix === 'a') {
        return await fetchAnimeById(numId);
      } else {
        return await fetchMovieById(numId);
      }
    } catch {
      return null;
    }
  });

  const results = await Promise.allSettled(promises);
  const items: MediaItem[] = [];
  results.forEach((res) => {
    if (res.status === 'fulfilled' && res.value !== null) {
      items.push(res.value);
    }
  });
  return items;
}

/**
 * Hook para carregar e sincronizar em tempo real uma lista compartilhada por outro usuário.
 * Suporta sincronização reativa com Firestore e fallback direto via tokens na URL,
 * garantindo que listas de convidados ou em transição nunca apareçam apagadas.
 */
export function useSharedWatchlist({
  sharedUserId,
  itemsParam,
  nameParam,
}: UseSharedWatchlistParams): UseSharedWatchlistReturn {
  const [items, setItems] = useState<ReadonlyArray<MediaItem>>([]);
  const [ownerProfile, setOwnerProfile] = useState<UserProfileData | null>(() => {
    return nameParam ? { displayName: nameParam, photoURL: null } : null;
  });
  const [loading, setLoading] = useState<boolean>(Boolean(sharedUserId || itemsParam));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (nameParam) {
      setOwnerProfile({ displayName: nameParam, photoURL: null });
    }
  }, [nameParam]);

  useEffect(() => {
    let isCancelled = false;

    if (!sharedUserId && !itemsParam) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // 1. Se houver tokens compactados de itens na URL, resolve imediatamente
    if (itemsParam) {
      void resolveItemsFromTokens(itemsParam).then((resolved) => {
        if (!isCancelled && resolved.length > 0) {
          setItems(resolved);
          setLoading(false);
        }
      });
    }

    // 2. Se houver usuário compartilhado na nuvem (Firestore)
    if (sharedUserId && !sharedUserId.startsWith('guest-')) {
      void getUserProfile(sharedUserId).then((profile) => {
        if (!isCancelled && profile) {
          setOwnerProfile(profile);
        }
      });

      const unsubscribe = subscribeWatchlist(
        sharedUserId,
        (cloudItems) => {
          if (isCancelled) return;
          if (cloudItems.length > 0) {
            setItems(cloudItems);
            setLoading(false);
          } else if (!itemsParam) {
            setItems([]);
            setLoading(false);
          }
        },
        (err) => {
          if (isCancelled) return;
          console.warn('[SharedWatchlist] Falha ao sincronizar com Firestore:', err);
          if (!itemsParam) {
            setError('Não foi possível carregar os títulos desta lista. Verifique o link.');
          }
          setLoading(false);
        }
      );

      return () => {
        isCancelled = true;
        unsubscribe();
      };
    } else if (!itemsParam) {
      setLoading(false);
    }

    return () => {
      isCancelled = true;
    };
  }, [sharedUserId, itemsParam]);

  return {
    items,
    ownerProfile,
    loading,
    error,
  };
}
