// HTTP жардамчы функциялар: JSON жооп, body окуу, cookie.
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function send(res, status, data, headers = {}) {
  if (res.headersSent) return;
  const body = data === undefined ? '' : JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers
  });
  res.end(body);
}

export function redirect(res, location, headers = {}) {
  res.writeHead(302, { Location: location, ...headers });
  res.end();
}

const MAX_BODY = 6 * 1024 * 1024; // сүрөт жүктөө үчүн 6 МБ чейин

export async function readBody(req) {
  // Vercel кээде body'ни алдын ала окуп коёт
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') return safeParse(req.body);
    if (Buffer.isBuffer(req.body)) return safeParse(req.body.toString('utf8'));
    return req.body;
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new HttpError(413, 'Файл же маалымат өтө чоң');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return safeParse(Buffer.concat(chunks).toString('utf8'));
}

function safeParse(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, 'JSON форматы туура эмес');
  }
}

export function parseCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  header.split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

export function cookie(name, value, { maxAge, httpOnly = true } = {}) {
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL ? '; Secure' : '';
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'SameSite=Lax'];
  if (httpOnly) parts.push('HttpOnly');
  if (maxAge !== undefined) parts.push(`Max-Age=${maxAge}`);
  return parts.join('; ') + secure;
}

export function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
}

export function baseUrl(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  // Локалдык иштетүүдө frontend Vite (5173) аркылуу ачылат
  if (!process.env.VERCEL && host && host.includes(':3001')) return `${proto}://${host.replace(':3001', ':5173')}`;
  return `${proto}://${host}`;
}
