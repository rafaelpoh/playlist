import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devTmdbApiKey = env.TMDB_API_KEY || '4470f5b73e6ecdfd6ba10fd320853bd0';

  return {
    plugins: [
      react(),
      {
        name: 'local-tmdb-dev-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (!req.url?.startsWith('/api/tmdb')) {
              return next();
            }

            try {
              const reqUrl = new URL(req.url, 'http://localhost:3000');
              const path = reqUrl.searchParams.get('path');

              if (!path) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Parâmetro "path" obrigatório' }));
                return;
              }

              const sanitizedPath = path.startsWith('/') ? path : `/${path}`;
              const targetParams = new URLSearchParams();
              targetParams.set('api_key', devTmdbApiKey);
              targetParams.set('language', reqUrl.searchParams.get('language') || 'pt-BR');

              for (const [key, value] of reqUrl.searchParams.entries()) {
                if (key !== 'path' && key !== 'api_key' && key !== 'language') {
                  targetParams.set(key, value);
                }
              }

              const tmdbUrl = `https://api.themoviedb.org/3${sanitizedPath}?${targetParams.toString()}`;
              const tmdbRes = await fetch(tmdbUrl);
              const data = await tmdbRes.text();

              res.statusCode = tmdbRes.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(data);
            } catch (error) {
              console.error('[Vite Dev Proxy] Erro ao comunicar com TMDb:', error);
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Erro no proxy local do TMDb' }));
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 3000,
      open: false,
    },
  };
});
