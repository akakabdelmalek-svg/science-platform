import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import diagnosticMiddleware from './server-diagnostic.js';
import { createApiApp, appMetadata } from './serverApp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
app.use(diagnosticMiddleware);
app.use(createApiApp());

const isProduction = process.env.NODE_ENV === 'production';
// In AI Studio dev/preview nginx proxies port 8080 -> 3000 (DEFAULT_APP_PORT=3000).
const PORT = isProduction
  ? Number(process.env.DEFAULT_APP_PORT || process.env.PORT || 3000)
  : 3000;

// =================== SERVE FRONTEND (NODE SERVER) ===================

async function startServer() {
  let viteServer: { close: () => Promise<void> } | null = null;

  try {
    const distPath = path.resolve(__dirname, 'dist');
    const hasDistBuild = fs.existsSync(path.join(distPath, 'index.html'));

    if (!isProduction || !hasDistBuild) {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: false,
          ws: false,
          allowedHosts: true,
          watch:
            process.env.DISABLE_HMR === 'true'
              ? null
              : { ignored: ['**/dist/**', '**/node_modules/**', '**/.git/**', '**/.data/**', '**/*.tar.gz'] },
        },
        appType: 'spa',
      });
      viteServer = vite;
      app.use(vite.middlewares);
    } else {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running at http://localhost:${PORT} (${appMetadata.name})`);
    });

    server.on('error', (err: any) => {
      console.error('HTTP server error:', err);
      if (err?.code === 'EADDRINUSE') {
        process.exit(1);
      }
    });

    let shuttingDown = false;
    const shutdown = async () => {
      if (shuttingDown) return;
      shuttingDown = true;
      const forceTimer = setTimeout(() => process.exit(0), 500);
      try {
        if (viteServer) {
          await viteServer.close();
        }
      } catch {}
      try {
        if (typeof server.closeAllConnections === 'function') {
          server.closeAllConnections();
        }
        server.close(() => {
          clearTimeout(forceTimer);
          process.exit(0);
        });
      } catch {
        clearTimeout(forceTimer);
        process.exit(0);
      }
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
