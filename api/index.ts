import type { IncomingMessage, ServerResponse } from 'http';
import express, { Request, Response } from 'express';
import diagnosticMiddleware from '../server-diagnostic.js';
import { createApiApp } from '../serverApp.js';

const app = express();
app.use(diagnosticMiddleware);
app.use(createApiApp());

// Catch-all for Vercel requests whose rewritten path may omit the /api prefix
app.use((req: Request, res: Response) => {
  console.warn(
    `[vercel-api-404] Unmatched Vercel route: method=${req.method} originalUrl=${req.originalUrl} url=${req.url} path=${req.path}`
  );
  res.status(404).json({
    error: 'Vercel API route not matched',
    method: req.method,
    originalUrl: req.originalUrl,
    url: req.url,
    path: req.path,
  });
});

export default function handler(req: IncomingMessage, res: ServerResponse) {
  console.log(
    `[vercel-entry] ${req.method} rawUrl=${req.url} host=${req.headers.host || 'unknown'}`
  );
  return app(req as unknown as Request, res as unknown as Response);
}
