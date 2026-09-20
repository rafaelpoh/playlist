import type { MediaItem } from '@/types/media';

/**
 * Gera a URL compartilhável para um título específico.
 */
export function generateShareUrl(item: MediaItem): string {
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const url = new URL(origin + pathname);
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
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, method: 'share', url: shareUrl };
      }
    }
  }

  // Fallback 1: Clipboard API moderna
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      return { success: true, method: 'clipboard', url: shareUrl };
    }
  } catch (clipboardError) {
    console.warn('[Share] Falha na API navigator.clipboard, tentando fallback:', clipboardError);
  }

  // Fallback 2: ExecCommand legado para compatibilidade máxima e ambientes headless
  try {
    const textArea = document.createElement('textarea');
    textArea.value = shareUrl;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful) {
      return { success: true, method: 'clipboard', url: shareUrl };
    }
  } catch (execError) {
    console.warn('[Share] Falha no fallback execCommand:', execError);
  }

  return { success: false, method: 'clipboard', url: shareUrl };
}
