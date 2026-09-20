/**
 * security.ts
 * Regras de segurança estrita para prevenção de XSS e validação de URLs externas.
 * Em conformidade com o módulo 4.4 e 4.5 do Check-Mate v2.0.
 */

const ALLOWED_EMBED_ORIGINS = new Set([
  'https://www.youtube.com',
  'https://youtube.com',
  'https://www.youtube-nocookie.com',
]);

/**
 * Cria a URL segura para embed de trailer no YouTube a partir da chave do vídeo.
 */
export function buildYouTubeEmbedUrl(videoKey: string): string {
  // Garante que a chave do vídeo contenha apenas caracteres alfanuméricos e traços/sublinhados comuns do YouTube
  const sanitizedKey = videoKey.replace(/[^a-zA-Z0-9_-]/g, '');
  return `https://www.youtube-nocookie.com/embed/${sanitizedKey}?autoplay=1&rel=0`;
}

/**
 * Valida e formata uma URL de embed externa (como a fornecida pela Jikan API).
 * Assegura protocolo HTTPS e domínio estritamente permitido.
 */
export function sanitizeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (parsed.protocol !== 'https:') {
      return null;
    }

    if (!ALLOWED_EMBED_ORIGINS.has(parsed.origin)) {
      return null;
    }

    // Adiciona autoplay e rel=0 de forma segura aos parâmetros
    parsed.searchParams.set('autoplay', '1');
    parsed.searchParams.set('rel', '0');

    return parsed.toString();
  } catch {
    return null;
  }
}
