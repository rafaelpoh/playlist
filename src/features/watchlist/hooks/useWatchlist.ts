import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  saveToWatchlist,
  removeFromWatchlist,
  subscribeWatchlist,
} from '../services/watchlistService';
import type { MediaItem } from '@/types/media';

const LOCAL_STORAGE_KEY = '@playlist/watchlist';

function getLocalWatchlist(): MediaItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MediaItem[]) : [];
  } catch {
    return [];
  }
}

function setLocalWatchlist(items: ReadonlyArray<MediaItem>): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('[Watchlist] Falha ao persistir no localStorage:', error);
  }
}

export interface ToggleWatchlistResult {
  readonly saved: boolean;
}

export function useWatchlist() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<ReadonlyArray<MediaItem>>(() => getLocalWatchlist());
  const [loading, setLoading] = useState<boolean>(true);

  // Conjunto para lookup instantâneo O(1) de itens salvos
  const savedIds = useMemo(() => {
    return new Set(watchlist.map((item) => item.id));
  }, [watchlist]);

  useEffect(() => {
    // Se não estiver logado com conta real (ou for visitante), usa os dados locais
    if (!user || user.uid.startsWith('guest-')) {
      const localItems = getLocalWatchlist();
      setWatchlist(localItems);
      setLoading(false);
      return;
    }

    // Se estiver autenticado no Firebase, migra itens locais se houver e sincroniza em tempo real com Firestore
    setLoading(true);

    const localItems = getLocalWatchlist();
    if (localItems.length > 0) {
      // Faz upload de itens que foram salvos antes do login para a nuvem
      void Promise.allSettled(localItems.map((item) => saveToWatchlist(user.uid, item))).then(() => {
        console.info('[Watchlist] Itens locais sincronizados com o Firestore com sucesso.');
      });
    }

    const unsubscribe = subscribeWatchlist(
      user.uid,
      (items) => {
        setWatchlist(items);
        setLoading(false);
        // Mantém backup local sincronizado
        setLocalWatchlist(items);
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
    async (item: MediaItem): Promise<ToggleWatchlistResult> => {
      const currentlySaved = savedIds.has(item.id);
      const nextSaved = !currentlySaved;

      // 1. Atualiza estado em memória e localStorage imediatamente (resposta instantânea)
      setWatchlist((prev) => {
        const updated = currentlySaved
          ? prev.filter((i) => i.id !== item.id)
          : [item, ...prev];
        setLocalWatchlist(updated);
        return updated;
      });

      // 2. Se autenticado no Firestore com conta real, sincroniza na nuvem
      if (user && !user.uid.startsWith('guest-')) {
        try {
          if (currentlySaved) {
            await removeFromWatchlist(user.uid, item.id);
          } else {
            await saveToWatchlist(user.uid, item);
          }
        } catch (error) {
          console.error('[Watchlist] Erro ao sincronizar com Firestore:', error);
        }
      }

      return { saved: nextSaved };
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
