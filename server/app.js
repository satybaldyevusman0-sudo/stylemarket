// Негизги API handler. Локалдык (server/dev.js) жана Vercel (api/index.js) экөөндө тең иштейт.
import { createRouter } from './lib/router.js';
import { HttpError, send, readBody } from './lib/http.js';
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';

const router = createRouter();
authRoutes(router);
publicRoutes(router);
userRoutes(router);
adminRoutes(router);

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  // Vercel rewrite: /api/xxx -> /api?__path=xxx
  let pathname = url.pathname;
  const rewritten = url.searchParams.get('__path');
  if (rewritten !== null) {
    pathname = '/api/' + rewritten.replace(/^\/+/, '');
    url.searchParams.delete('__path');
  }
  pathname = pathname.replace(/\/+$/, '') || '/';

  const query = Object.fromEntries(url.searchParams.entries());
  let bodyCache;
  const ctx = { req, res, query, params: {}, body: async () => (bodyCache ??= await readBody(req)) };

  try {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const type = req.headers['content-type'] || '';
      if (!type.includes('application/json')) throw new HttpError(415, 'Content-Type: application/json керек');
    }
    const match = router.match(req.method, pathname);
    if (!match) throw new HttpError(404, 'API маршруту табылган жок');
    if (match.methodNotAllowed) throw new HttpError(405, 'Бул метод колдоого алынбайт');
    ctx.params = match.params;
    for (const h of match.handlers) {
      await h(ctx);
      if (res.headersSent || res.writableEnded) break;
    }
    if (!res.headersSent) send(res, 204);
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    if (status === 500) console.error('[api]', req.method, pathname, err);
    send(res, status, {
      error: status === 500 ? 'Сервердик ката. Кийинчерээк кайталаңыз.' : err.message,
      details: err.details || undefined
    });
  }
}
