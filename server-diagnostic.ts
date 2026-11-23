import { NextFunction, Request, Response } from 'express';

export function diagnosticMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const timestamp = new Date().toISOString();
  console.log(`[server-diagnostic] ${timestamp} | ${req.method} ${req.url}`);
  next();
}

export default diagnosticMiddleware;
