import { useState, useEffect } from 'react';
import {
  subscribeWatchlist,
  getUserProfile,
  type UserProfileData,
} from '../services/watchlistService';
import type { MediaItem } from '@/types/media';

export interface UseSharedWatchlistReturn {
  readonly items: ReadonlyArray<MediaItem>;
  readonly ownerProfile: UserProfileData | null;
  readonly loading: boolean;
  readonly error: string | null;
}

/**
 * Hook para carregar e sincronizar em tempo real uma lista compartilhada por outro usuário.
 * Este hook opera estritamente em modo de leitura; alterações nos itens devem ser
 * restritas ao proprietário original conforme as regras do Firestore.
 */
export function useSharedWatchlist(sharedUserId: string | null): UseSharedWatchlistReturn {
  const [items, setItems] = useState<ReadonlyArray<MediaItem>>([]);
  const [ownerProfile, setOwnerProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(sharedUserId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sharedUserId) {
      setItems([]);
      setOwnerProfile(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // 1. Busca perfil do dono da lista para identificar visualmente a autoria
    void getUserProfile(sharedUserId).then((profile) => {
      setOwnerProfile(profile);
    });

    // 2. Assina as alterações em tempo real da lista pública
    const unsubscribe = subscribeWatchlist(
      sharedUserId,
      (fetchedItems) => {
        setItems(fetchedItems);
        setLoading(false);
      },
      (err) => {
        console.error('[SharedWatchlist] Erro ao sincronizar lista compartilhada:', err);
        setError('Não foi possível carregar os títulos desta lista. Verifique o link.');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [sharedUserId]);

  return {
    items,
    ownerProfile,
    loading,
    error,
  };
}
