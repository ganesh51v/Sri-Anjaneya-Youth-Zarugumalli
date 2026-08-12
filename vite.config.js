import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env file manually so api handlers can read process.env
function loadEnv() {
  try {
    const envContent = readFileSync(path.join(__dirname, '.env'), 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) return;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (key && !(key in process.env)) process.env[key] = val;
    });
  } catch (_) { /* .env missing is fine */ }
}

// Vite dev plugin: execute api/*.js serverless handlers directly in the dev server
function localApiPlugin() {
  return {
    name: 'local-api-middleware',
    configureServer(server) {
      loadEnv();

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();

        // Parse JSON body
        let rawBody = '';
        await new Promise(resolve => {
          req.on('data', chunk => { rawBody += chunk; });
          req.on('end', resolve);
        });
        try { req.body = rawBody ? JSON.parse(rawBody) : {}; }
        catch { req.body = {}; }

        // Wrap res to support the .status(code).json(data) pattern used in api handlers
        res.status = (code) => {
          res.statusCode = code;
          return {
            json: (data) => {
              if (!res.headersSent) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              }
            },
            end: () => { if (!res.headersSent) res.end(); }
          };
        };
        res.json = (data) => {
          if (!res.headersSent) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          }
        };

        try {
          const route = req.url.split('?')[0]; // e.g. /api/chat
          const handlerPath = path.join(__dirname, route + '.js');
          const fileUrl = pathToFileURL(handlerPath).href;
          // Cache-bust on every request so hot-reload works
          const { default: handler } = await import(`${fileUrl}?t=${Date.now()}`);

          if (typeof handler !== 'function') {
            res.statusCode = 500;
            return res.json({ error: 'No default export found in handler.' });
          }

          await handler(req, res);
        } catch (err) {
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'API handler error: ' + err.message }));
          }
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), localApiPlugin()]
});
