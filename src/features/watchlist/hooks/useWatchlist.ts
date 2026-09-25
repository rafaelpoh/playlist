import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  saveToWatchlist,
  removeFromWatchlist,
  subscribeWatchlist,
} from '../services/watchlistService';
import type { MediaItem } from '@/types/media';

const LOCAL_STORAGE_KEY = '@playlist/watchlist';
const BACKUP_STORAGE_KEY = '@playlist/watchlist_backup';

function getLocalWatchlist(): MediaItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed as MediaItem[];
      }
    }

    // Mecanismo de recuperação apenas se a chave principal nunca foi definida ou foi acidentalmente removida
    const backupRaw = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (backupRaw !== null) {
      const backupParsed = JSON.parse(backupRaw);
      if (Array.isArray(backupParsed)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, backupRaw);
        return backupParsed as MediaItem[];
      }
    }

    return [];
  } catch {
    return [];
  }
}

function setLocalWatchlist(items: ReadonlyArray<MediaItem>): void {
  try {
    const serialized = JSON.stringify(items);
    localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
    // Mantém o backup em sincronia para que exclusões intencionais não sejam revertidas
    localStorage.setItem(BACKUP_STORAGE_KEY, serialized);
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
    // 1. Visitante ou não autenticado: opera estritamente via local storage
    if (!user || user.uid.startsWith('guest-')) {
      const localItems = getLocalWatchlist();
      setWatchlist(localItems);
      setLoading(false);
      return;
    }

    // 2. Autenticado com Firebase: sincroniza com Firestore em tempo real
    setLoading(true);
    let isInitialSnapshot = true;

    const unsubscribe = subscribeWatchlist(
      user.uid,
      (firestoreItems) => {
        if (isInitialSnapshot) {
          isInitialSnapshot = false;

          // Se for o primeiro snapshot e o Firestore estiver vazio mas existirem itens locais prévios (ex: de visitante), migra-os
          if (firestoreItems.length === 0) {
            const initialLocalItems = getLocalWatchlist();
            if (initialLocalItems.length > 0) {
              console.info('[Watchlist] Primeira inicialização: migrando títulos locais para a nuvem...');
              setWatchlist(initialLocalItems);
              setLocalWatchlist(initialLocalItems);
              setLoading(false);
              void Promise.allSettled(
                initialLocalItems.map((item) => saveToWatchlist(user.uid, item))
              );
              return;
            }
          }
        }

        // Para snapshots subsequentes ou quando o Firestore já contém dados:
        // O Firestore é a única fonte da verdade para contas autenticadas.
        // Itens excluídos pelo usuário permanecem excluídos e não são ressuscitados.
        setWatchlist(firestoreItems);
        setLocalWatchlist(firestoreItems);
        setLoading(false);
      },
      (error) => {
        console.warn('[Watchlist] Falha de conexão com Firestore, utilizando cache local:', error);
        const cached = getLocalWatchlist();
        setWatchlist(cached);
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

      // 1. Atualização otimista imediata na memória e no localStorage
      setWatchlist((prev) => {
        const exists = prev.some((i) => i.id === item.id);
        const updated = exists
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
          // Em caso de erro na nuvem, reverte para o estado local persistido
          const cached = getLocalWatchlist();
          setWatchlist(cached);
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
