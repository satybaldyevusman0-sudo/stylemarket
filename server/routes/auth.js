import crypto from 'node:crypto';
import * as db from '../lib/db.js';
import { HttpError, send, cookie, redirect, parseCookies, baseUrl } from '../lib/http.js';
import { hashPassword, verifyPassword, signJwt, rateLimit } from '../lib/security.js';
import { validate, rules } from '../lib/validate.js';
import { currentUser, publicUser } from '../lib/guards.js';
import { status, oauthConfig, oauthProfile } from '../lib/integrations.js';

const WEEK = 60 * 60 * 24 * 7;
const loginLimit = rateLimit('login', 10);
const registerLimit = rateLimit('register', 5);

function issue(res, user, status = 200) {
  const token = signJwt({ sub: user.id, role: user.role });
  send(res, status, { user: publicUser(user) }, { 'Set-Cookie': cookie('token', token, { maxAge: WEEK }) });
}

export default function authRoutes(r) {
  r.post('/api/auth/register', async (ctx) => {
    registerLimit(ctx.req);
    const data = validate(await ctx.body(), { name: rules.str(2, 60), email: rules.email(), password: rules.password() });
    const email = data.email.toLowerCase();
    const users = await db.all('users');
    if (users.some((u) => u.email === email)) throw new HttpError(409, 'Бул email менен аккаунт мурунтан бар', { email: 'Email бош эмес' });
    const user = await db.insert('users', { name: data.name, email, passwordHash: hashPassword(data.password), role: 'user', provider: 'local' });
    issue(ctx.res, user, 201);
  });

  r.post('/api/auth/login', async (ctx) => {
    loginLimit(ctx.req);
    const data = validate(await ctx.body(), { email: rules.email(), password: rules.str(1, 128) });
    const user = (await db.all('users')).find((u) => u.email === data.email.toLowerCase());
    if (!user || !verifyPassword(data.password, user.passwordHash)) throw new HttpError(401, 'Email же сырсөз туура эмес');
    if (user.blocked) throw new HttpError(403, 'Аккаунт бөгөттөлгөн');
    issue(ctx.res, user);
  });

  r.post('/api/auth/logout', async (ctx) => {
    send(ctx.res, 200, { ok: true }, { 'Set-Cookie': cookie('token', '', { maxAge: 0 }) });
  });

  r.get('/api/auth/me', async (ctx) => {
    const u = await currentUser(ctx);
    send(ctx.res, 200, { user: publicUser(u) });
  });

  r.put('/api/auth/me', async (ctx) => {
    const u = await currentUser(ctx);
    if (!u) throw new HttpError(401, 'Аккаунтка кириңиз');
    const data = validate(await ctx.body(), { name: rules.str(2, 60) });
    const updated = await db.update('users', u.id, { name: data.name });
    send(ctx.res, 200, { user: publicUser(updated) });
  });

  r.get('/api/auth/providers', async (ctx) => {
    const s = status();
    send(ctx.res, 200, { google: s.google, github: s.github });
  });

  // OAuth: /api/auth/oauth/google -> провайдерге багыттоо
  r.get('/api/auth/oauth/:provider', async (ctx) => {
    const p = ctx.params.provider;
    const cfg = oauthConfig[p];
    if (!cfg) throw new HttpError(404, 'Белгисиз провайдер');
    if (!cfg.id()) return redirect(ctx.res, `${baseUrl(ctx.req)}/login?oauth_error=${p}_not_configured`);
    const state = crypto.randomBytes(16).toString('hex');
    const redirectUri = `${baseUrl(ctx.req)}/api/auth/oauth/${p}/callback`;
    const url = `${cfg.authUrl}?${new URLSearchParams({ client_id: cfg.id(), redirect_uri: redirectUri, response_type: 'code', scope: cfg.scope, state })}`;
    redirect(ctx.res, url, { 'Set-Cookie': cookie('oauth_state', state, { maxAge: 600 }) });
  });

  r.get('/api/auth/oauth/:provider/callback', async (ctx) => {
    const p = ctx.params.provider;
    const origin = baseUrl(ctx.req);
    try {
      if (!oauthConfig[p]) throw new HttpError(404, 'Белгисиз провайдер');
      const { code, state } = ctx.query;
      if (!code || !state || state !== parseCookies(ctx.req).oauth_state) throw new HttpError(400, 'OAuth state туура эмес');
      const profile = await oauthProfile(p, code, `${origin}/api/auth/oauth/${p}/callback`);
      let user = (await db.all('users')).find((u) => u.email === profile.email);
      if (!user) user = await db.insert('users', { name: profile.name, email: profile.email, avatar: profile.avatar, role: 'user', provider: p });
      if (user.blocked) throw new HttpError(403, 'Аккаунт бөгөттөлгөн');
      const token = signJwt({ sub: user.id, role: user.role });
      ctx.res.writeHead(302, { Location: `${origin}/profile`, 'Set-Cookie': [cookie('token', token, { maxAge: WEEK }), cookie('oauth_state', '', { maxAge: 0 })] });
      ctx.res.end();
    } catch (e) {
      redirect(ctx.res, `${origin}/login?oauth_error=${encodeURIComponent(e.message || 'error')}`);
    }
  });
}
