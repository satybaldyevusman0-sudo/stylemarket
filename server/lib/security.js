// Сырсөздү хэштөө (scrypt) жана JWT (HS256) — кошумча пакетсиз, Node crypto менен.
import crypto from 'node:crypto';
import { HttpError, parseCookies, clientIp } from './http.js';

const DEV_SECRET = 'dev-only-secret-change-me-in-production-please';

export const jwtSecretIsDefault = () => !(process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32);

export function jwtSecret() {
  const s = process.env.JWT_SECRET;
  if (s && s.length >= 32) return s;
  // JWT_SECRET коюлбаса да сайт иштейт: долбоорго туруктуу ачкыч түзүлөт (бардык серверлерде бирдей).
  // Коопсуздук үчүн Vercel → Settings → Environment Variables'ке өз JWT_SECRET'иңизди кошуңуз.
  const seed = process.env.VERCEL_PROJECT_ID || process.env.VERCEL_GIT_REPO_SLUG || process.env.SITE_SLUG || 'local';
  return crypto.createHash('sha256').update(`${DEV_SECRET}:${seed}`).digest('hex');
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.startsWith('scrypt$')) return false;
  const [, salt, hash] = stored.split('$');
  const test = crypto.scryptSync(password, salt, 64);
  const known = Buffer.from(hash, 'hex');
  return known.length === test.length && crypto.timingSafeEqual(known, test);
}

const b64url = (buf) => Buffer.from(buf).toString('base64url');

export function signJwt(payload, expiresInSec = 60 * 60 * 24 * 7) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const body = b64url(JSON.stringify({ ...payload, iat: now, exp: now + expiresInSec }));
  const sig = crypto.createHmac('sha256', jwtSecret()).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

export function verifyJwt(token) {
  if (!token || token.split('.').length !== 3) return null;
  const [header, body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', jwtSecret()).update(`${header}.${body}`).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function tokenFromRequest(req) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return parseCookies(req).token;
}

// Кирүү аракеттерин чектөө (бир IP'ден мүнөтүнө N жолу)
const buckets = new Map();
export function rateLimit(key, limit = 10, windowMs = 60_000) {
  return (req) => {
    const id = `${key}:${clientIp(req)}`;
    const now = Date.now();
    const b = buckets.get(id) || { count: 0, reset: now + windowMs };
    if (now > b.reset) { b.count = 0; b.reset = now + windowMs; }
    b.count += 1;
    buckets.set(id, b);
    if (b.count > limit) throw new HttpError(429, 'Өтө көп аракет. Бир мүнөттөн кийин кайталаңыз.');
  };
}

export const randomId = (prefix = '') => prefix + crypto.randomBytes(8).toString('hex');
