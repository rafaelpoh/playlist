import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { WatchlistItemSchema, type WatchlistDocument } from '../schemas/watchlistSchema';
import type { MediaItem } from '@/types/media';

export interface UserProfileData {
  readonly displayName: string | null;
  readonly photoURL?: string | null;
}

/**
 * Salva metadados públicos do perfil para que outros possam identificar a lista compartilhada.
 */
export async function saveUserProfile(
  userId: string,
  profile: { displayName?: string | null; photoURL?: string | null }
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await setDoc(
    userRef,
    {
      displayName: profile.displayName || 'Cineasta',
      photoURL: profile.photoURL || null,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}

/**
 * Busca o perfil público de um usuário para exibir o autor da lista compartilhada.
 */
export async function getUserProfile(userId: string): Promise<UserProfileData | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        displayName: typeof data.displayName === 'string' ? data.displayName : null,
        photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
      };
    }
    return null;
  } catch (err) {
    console.warn('[WatchlistService] Falha ao recuperar perfil público:', err);
    return null;
  }
}

export async function saveToWatchlist(userId: string, item: MediaItem): Promise<void> {
  const docRef = doc(db, 'users', userId, 'watchlist', item.id);
  const data: WatchlistDocument = {
    id: item.id,
    title: item.title,
    overview: item.overview,
    posterUrl: item.posterUrl,
    type: item.type,
    score: item.score,
    releaseYear: item.releaseYear,
    trailerUrl: item.trailerUrl || null,
    addedAt: Date.now(),
  };

  const parsed = WatchlistItemSchema.parse(data);
  await setDoc(docRef, parsed);
}

export async function removeFromWatchlist(userId: string, mediaId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'watchlist', mediaId);
  await deleteDoc(docRef);
}

export function subscribeWatchlist(
  userId: string,
  onUpdate: (items: ReadonlyArray<MediaItem>) => void,
  onError?: (error: Error) => void
): () => void {
  const colRef = collection(db, 'users', userId, 'watchlist');
  const q = query(colRef, orderBy('addedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: MediaItem[] = [];
      snapshot.forEach((docSnap) => {
        try {
          const parsed = WatchlistItemSchema.parse(docSnap.data());
          items.push({
            id: parsed.id,
            title: parsed.title,
            overview: parsed.overview,
            posterUrl: parsed.posterUrl ?? null,
            type: parsed.type,
            score: parsed.score ?? null,
            releaseYear: parsed.releaseYear ?? null,
            trailerUrl: parsed.trailerUrl ?? null,
          });
        } catch (err) {
          console.warn('[WatchlistService] Documento corrompido ignorado:', err);
        }
      });
      onUpdate(items);
    },
    (error) => {
      console.error('[WatchlistService] Erro na sincronização:', error);
      onError?.(error);
    }
  );
}
