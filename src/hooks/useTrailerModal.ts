import { useState, useCallback, useEffect } from 'react';
import type { TrailerInfo } from '@/types/media';

export function useTrailerModal() {
  const [trailerInfo, setTrailerInfo] = useState<TrailerInfo | null>(null);

  const openTrailer = useCallback((url: string, title: string) => {
    setTrailerInfo({ url, title });
  }, []);

  const closeTrailer = useCallback(() => {
    setTrailerInfo(null);
  }, []);

  // Bloqueia o scroll da página enquanto o modal estiver aberto e escuta tecla Escape
  useEffect(() => {
    if (!trailerInfo) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeTrailer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [trailerInfo, closeTrailer]);

  return {
    isOpen: trailerInfo !== null,
    trailerInfo,
    openTrailer,
    closeTrailer,
  };
}
