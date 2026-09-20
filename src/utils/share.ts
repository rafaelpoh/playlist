import type { MediaItem } from '@/types/media';

/**
 * Gera a URL compartilhável para um título específico.
 */
export function generateShareUrl(item: MediaItem): string {
  const url = new URL(window.location.href);
  url.searchParams.set('id', item.id);
  url.searchParams.set('type', item.type);
  return url.toString();
}

export interface ShareResult {
  readonly success: boolean;
  readonly method: 'share' | 'clipboard';
  readonly url: string;
}

/**
 * Compartilha o título via Web Share API se disponível, ou copia o link para a área de transferência.
 */
export async function shareMediaItem(item: MediaItem): Promise<ShareResult> {
  const shareUrl = generateShareUrl(item);
  const typeLabel = item.type === 'movie' ? 'filme' : item.type === 'serie' ? 'série' : 'anime';
  const shareData = {
    title: `${item.title} | Playlist`,
    text: `Confira o ${typeLabel} "${item.title}" no Playlist!`,
    url: shareUrl,
  };

  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return { success: true, method: 'share', url: shareUrl };
    } catch (error: unknown) {
      // Se o usuário cancelou o menu nativo, não faz fallback agressivo
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, method: 'share', url: shareUrl };
      }
    }
  }

  // Fallback para cópia na área de transferência
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(shareUrl);
    return { success: true, method: 'clipboard', url: shareUrl };
  }

  return { success: false, method: 'clipboard', url: shareUrl };
}
