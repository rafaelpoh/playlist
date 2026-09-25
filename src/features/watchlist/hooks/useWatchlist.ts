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
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Mantém backup sempre atualizado com a última versão válida
        localStorage.setItem(BACKUP_STORAGE_KEY, raw);
        return parsed as MediaItem[];
      }
    }

    // Mecanismo de recuperação: se a chave principal foi zerada, restaura do backup
    const backupRaw = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (backupRaw) {
      const backupParsed = JSON.parse(backupRaw);
      if (Array.isArray(backupParsed) && backupParsed.length > 0) {
        console.info('[Watchlist] Recuperados títulos a partir do backup resiliente!');
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
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    // Nunca sobrescreve o backup com lista vazia para evitar perda catastrófica
    if (items.length > 0) {
      localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(items));
    }
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

    // Se estiver autenticado no Firebase, sincroniza de forma segura sem risco de apagar itens locais
    setLoading(true);

    const localItems = getLocalWatchlist();

    const unsubscribe = subscribeWatchlist(
      user.uid,
      (firestoreItems) => {
        // Se o Firestore retornar 0 itens mas existirem itens locais válidos, PRESERVA os itens locais e força upload
        if (firestoreItems.length === 0 && localItems.length > 0) {
          console.info('[Watchlist] Firestore inicial vazio. Preservando títulos locais e enviando para a nuvem...');
          setWatchlist(localItems);
          setLocalWatchlist(localItems);
          setLoading(false);
          void Promise.allSettled(localItems.map((item) => saveToWatchlist(user.uid, item)));
          return;
        }

        // Mescla itens locais com itens do Firestore sem duplicidade
        const mergedMap = new Map<string, MediaItem>();
        localItems.forEach((i) => mergedMap.set(i.id, i));
        firestoreItems.forEach((i) => mergedMap.set(i.id, i));
        const mergedList = Array.from(mergedMap.values());

        // Se houver algum item local pendente que ainda não subiu para a nuvem, sincroniza
        const firestoreIds = new Set(firestoreItems.map((i) => i.id));
        const missingInCloud = localItems.filter((i) => !firestoreIds.has(i.id));
        if (missingInCloud.length > 0) {
          void Promise.allSettled(missingInCloud.map((item) => saveToWatchlist(user.uid, item)));
        }

        setWatchlist(mergedList);
        setLoading(false);
        setLocalWatchlist(mergedList);
      },
      (error) => {
        console.warn('[Watchlist] Falha de conexão com Firestore, utilizando backup local:', error);
        setWatchlist(localItems);
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
