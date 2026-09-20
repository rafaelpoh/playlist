import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  saveToWatchlist,
  removeFromWatchlist,
  subscribeWatchlist,
} from '../services/watchlistService';
import type { MediaItem } from '@/types/media';

export function useWatchlist() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<ReadonlyArray<MediaItem>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Conjunto para lookup instantâneo O(1) de itens salvos
  const savedIds = useMemo(() => {
    return new Set(watchlist.map((item) => item.id));
  }, [watchlist]);

  useEffect(() => {
    if (!user) {
      setWatchlist([]);
      setLoading(false);
      return;
    }

    if (user.uid.startsWith('guest-')) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeWatchlist(
      user.uid,
      (items) => {
        setWatchlist(items);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const isSaved = useCallback(
    (mediaId: string): boolean => {
      return savedIds.has(mediaId);
    },
    [savedIds]
  );

  const toggleWatchlist = useCallback(
    async (item: MediaItem): Promise<boolean> => {
      if (!user) {
        return false; // Indica necessidade de login
      }

      if (user.uid.startsWith('guest-')) {
        setWatchlist((prev) =>
          savedIds.has(item.id)
            ? prev.filter((i) => i.id !== item.id)
            : [item, ...prev]
        );
        return true;
      }

      if (savedIds.has(item.id)) {
        await removeFromWatchlist(user.uid, item.id);
      } else {
        await saveToWatchlist(user.uid, item);
      }
      return true;
    },
    [user, savedIds]
  );

  return {
    watchlist,
    watchlistCount: watchlist.length,
    isSaved,
    toggleWatchlist,
    loading,
    isAuthenticated: user !== null,
  };
}
