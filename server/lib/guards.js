// Кирүү текшерүүлөрү: колдонуучу жана админ ролу сервер тарабынан текшерилет.
import { HttpError } from './http.js';
import { tokenFromRequest, verifyJwt } from './security.js';
import * as db from './db.js';

export async function currentUser(ctx) {
  if (ctx.user !== undefined) return ctx.user;
  const payload = verifyJwt(tokenFromRequest(ctx.req));
  ctx.user = payload ? await db.get('users', payload.sub) : null;
  // Убактылуу базада (Vercel /tmp) колдонуучу жоголуп кетсе — кол коюлган JWT'ден калыбына келтиребиз
  if (payload && !ctx.user && payload.email) {
    const users = await db.all('users');
    ctx.user = users.find((u) => u.email === payload.email) || null;
    if (!ctx.user) {
      ctx.user = await db.insert('users', { id: payload.sub, name: payload.name || payload.email, email: payload.email, avatar: payload.avatar || '', role: payload.role === 'admin' ? 'admin' : 'user', provider: payload.provider || 'local', restored: true });
    }
  }
  if (ctx.user?.blocked) ctx.user = null;
  return ctx.user;
}

export async function requireAuth(ctx) {
  const u = await currentUser(ctx);
  if (!u) throw new HttpError(401, 'Бул аракет үчүн аккаунтка кириңиз');
}

export async function requireAdmin(ctx) {
  const u = await currentUser(ctx);
  if (!u) throw new HttpError(401, 'Аккаунтка кириңиз');
  if (u.role !== 'admin') throw new HttpError(403, 'Бул бөлүм администратор үчүн гана');
}

export const publicUser = (u) => u && ({ id: u.id, name: u.name, email: u.email, role: u.role, avatar: u.avatar || '', provider: u.provider, createdAt: u.createdAt });
