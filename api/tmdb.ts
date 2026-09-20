export const config = {
  runtime: 'edge',
};

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        Allow: 'GET',
      },
    });
  }

  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    return new Response(JSON.stringify({ error: 'Parâmetro "path" obrigatório' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Previne caminhos inválidos ou injeção de URL maliciosa
  const sanitizedPath = path.startsWith('/') ? path : `/${path}`;
  if (sanitizedPath.includes('..') || sanitizedPath.startsWith('//')) {
    return new Response(JSON.stringify({ error: 'Caminho inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error('[Vercel Serverless] TMDB_API_KEY não configurada no ambiente.');
    return new Response(
      JSON.stringify({ error: 'Chave de API do TMDb não configurada no servidor' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Constrói os parâmetros encaminhados para a TMDb com a chave segura injetada
  const targetParams = new URLSearchParams();
  targetParams.set('api_key', apiKey);
  targetParams.set('language', searchParams.get('language') || 'pt-BR');

  for (const [key, value] of searchParams.entries()) {
    if (key !== 'path' && key !== 'api_key' && key !== 'language') {
      targetParams.set(key, value);
    }
  }

  const tmdbUrl = `${TMDB_BASE_URL}${sanitizedPath}?${targetParams.toString()}`;

  try {
    const tmdbResponse = await fetch(tmdbUrl);
    const data = await tmdbResponse.text();

    return new Response(data, {
      status: tmdbResponse.status,
      headers: {
        'Content-Type': 'application/json',
        // Cache na borda por 1 hora se sucesso, com revalidação assíncrona
        'Cache-Control':
          tmdbResponse.status === 200
            ? 'public, s-maxage=3600, stale-while-revalidate=86400'
            : 'no-cache, no-store',
      },
    });
  } catch (error) {
    console.error('[Vercel Serverless] Erro ao comunicar com TMDb:', error);
    return new Response(JSON.stringify({ error: 'Falha ao comunicar com a API do TMDb' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
