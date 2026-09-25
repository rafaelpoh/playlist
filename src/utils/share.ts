import type { MediaItem } from '@/types/media';

/**
 * Gera a URL compartilhável para um título específico.
 */
export function generateShareUrl(item: MediaItem): string {
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const url = new URL(origin + pathname);
  // Remove prefixos como movie-, serie-, anime- para compatibilidade e URLs limpas
  const cleanId = item.id.replace(/^(movie|serie|anime)-/, '');
  url.searchParams.set('id', cleanId);
  url.searchParams.set('type', item.type);
  return url.toString();
}

export interface ShareResult {
  readonly success: boolean;
  readonly method: 'share' | 'clipboard';
  readonly url: string;
}

/**
 * Função utilitária segura para copiar textos para a área de transferência com fallback resiliente.
 */
async function copyToClipboard(text: string): Promise<boolean> {
  // 1. Clipboard API moderna
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (clipboardError) {
    console.warn('[Share] Falha na API navigator.clipboard, tentando fallback:', clipboardError);
  }

  // 2. ExecCommand legado para compatibilidade máxima e testes
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful) {
      return true;
    }
  } catch (execError) {
    console.warn('[Share] Falha no fallback execCommand:', execError);
  }

  return false;
}

/**
 * Executa o compartilhamento via Web Share API se suportado ou copia para a área de transferência.
 */
async function executeShare(data: { title: string; text: string; url: string }): Promise<ShareResult> {
  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(data)) {
    try {
      await navigator.share(data);
      return { success: true, method: 'share', url: data.url };
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, method: 'share', url: data.url };
      }
    }
  }

  const copied = await copyToClipboard(data.url);
  return { success: copied, method: 'clipboard', url: data.url };
}

/**
 * Compartilha o título via Web Share API se disponível, ou copia o link para a área de transferência.
 */
export async function shareMediaItem(item: MediaItem): Promise<ShareResult> {
  const shareUrl = generateShareUrl(item);
  const typeLabel = item.type === 'movie' ? 'filme' : item.type === 'serie' ? 'série' : 'anime';
  return executeShare({
    title: `${item.title} | Playlist`,
    text: `Confira o ${typeLabel} "${item.title}" no Playlist!`,
    url: shareUrl,
  });
}

/**
 * Gera a URL compartilhável para uma lista completa (Watchlist).
 * Suporta inclusão de ID de nuvem (Firestore) e tokens compactados de itens (fallback resiliente).
 */
export function generateWatchlistShareUrl(
  userId: string,
  ownerName?: string | null,
  items?: ReadonlyArray<MediaItem>
): string {
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const url = new URL(origin + pathname);

  if (userId && !userId.startsWith('guest-')) {
    url.searchParams.set('list', userId);
  }

  if (ownerName && ownerName.trim().length > 0) {
    url.searchParams.set('name', ownerName.trim());
  }

  if (items && items.length > 0) {
    // Codifica formato ultra-compacto: "m:550,s:1399,a:21"
    const compactTokens = items
      .map((i) => {
        const typePrefix = i.type === 'serie' ? 's' : i.type === 'anime' ? 'a' : 'm';
        const cleanId = i.id.replace(/^(movie|serie|anime)-/, '');
        return `${typePrefix}:${cleanId}`;
      })
      .join(',');

    url.searchParams.set('items', compactTokens);
  }

  return url.toString();
}

/**
 * Compartilha o link de uma lista completa via Web Share API ou área de transferência.
 */
export async function shareWatchlist(
  userId: string,
  ownerName?: string | null,
  items?: ReadonlyArray<MediaItem>
): Promise<ShareResult> {
  const shareUrl = generateWatchlistShareUrl(userId, ownerName, items);
  const nameLabel = ownerName ? `de ${ownerName}` : 'completa';
  return executeShare({
    title: `Lista ${nameLabel} | Playlist`,
    text: `Confira a lista de títulos ${nameLabel} no Playlist! Acesse agora:`,
    url: shareUrl,
  });
}

