/**
 * formatters.ts
 * Funções puras de transformação e formatação de dados para exibição.
 */

/**
 * Extrai o ano a partir de uma data no formato YYYY-MM-DD ou retorna o próprio valor.
 */
export function formatReleaseYear(dateString: string | null | undefined): string | null {
  if (!dateString) return null;
  const match = dateString.match(/^\d{4}/);
  return match ? match[0] : null;
}

/**
 * Formata notas decimais para 1 casa decimal (ex: 8.35 -> 8.4).
 */
export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined || Number.isNaN(score) || score === 0) {
    return 'N/A';
  }
  return score.toFixed(1);
}

/**
 * Trunca textos longos de sinopse mantendo integridade visual.
 */
export function truncateText(text: string, maxLength: number = 140): string {
  if (!text) return 'Sinopse não disponível.';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}
