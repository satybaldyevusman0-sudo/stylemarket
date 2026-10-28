// Тышкы кызматтар: Telegram, Email (Resend), Stripe, Cloudinary, OAuth (Google/GitHub).
// Ар бири env-ачкычтар коюлганда гана иштейт; болбосо түшүнүктүү билдирүү кайтарылат.
import crypto from 'node:crypto';
import { HttpError } from './http.js';
import site from '../../site/config.js';

const env = (k) => process.env[k] || '';

export const status = () => ({
  telegram: !!(env('TELEGRAM_BOT_TOKEN') && env('TELEGRAM_CHAT_ID')),
  email: !!(env('RESEND_API_KEY') && env('NOTIFY_EMAIL')),
  stripe: !!env('STRIPE_SECRET_KEY'),
  cloudinary: !!(env('CLOUDINARY_CLOUD_NAME') && env('CLOUDINARY_API_KEY') && env('CLOUDINARY_API_SECRET')),
  google: !!(env('GOOGLE_CLIENT_ID') && env('GOOGLE_CLIENT_SECRET')),
  github: !!(env('GITHUB_CLIENT_ID') && env('GITHUB_CLIENT_SECRET'))
});

async function withTimeout(url, opts = {}, ms = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

// ---------- Билдирүүлөр ----------
export async function sendTelegram(text) {
  if (!status().telegram) return { sent: false, reason: 'not_configured' };
  try {
    const r = await withTimeout(`https://api.telegram.org/bot${env('TELEGRAM_BOT_TOKEN')}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env('TELEGRAM_CHAT_ID'), text, disable_web_page_preview: true })
    });
    return { sent: r.ok, reason: r.ok ? null : `http_${r.status}` };
  } catch (e) {
    return { sent: false, reason: e.name === 'AbortError' ? 'timeout' : 'network' };
  }
}

export async function sendEmail(subject, text, to = env('NOTIFY_EMAIL')) {
  if (!status().email) return { sent: false, reason: 'not_configured' };
  try {
    const r = await withTimeout('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env('MAIL_FROM') || `${site.name} <onboarding@resend.dev>`, to: [to], subject, text })
    });
    return { sent: r.ok, reason: r.ok ? null : `http_${r.status}` };
  } catch (e) {
    return { sent: false, reason: e.name === 'AbortError' ? 'timeout' : 'network' };
  }
}

export async function notifyAll(subject, text) {
  const [telegram, email] = await Promise.all([sendTelegram(`${site.logo} ${site.name}: ${subject}\n\n${text}`), sendEmail(`[${site.name}] ${subject}`, text)]);
  return { telegram, email };
}

// ---------- Stripe (Checkout) ----------
function form(obj, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (v !== null && typeof v === 'object') form(v, key, out);
    else if (v !== undefined) out.append(key, String(v));
  }
  return out;
}

async function stripe(pathname, method = 'GET', body) {
  const r = await withTimeout(`https://api.stripe.com/v1/${pathname}`, {
    method,
    headers: { Authorization: `Bearer ${env('STRIPE_SECRET_KEY')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body ? form(body).toString() : undefined
  }, 15000);
  const data = await r.json();
  if (!r.ok) throw new HttpError(502, `Stripe катасы: ${data?.error?.message || r.status}`);
  return data;
}

export async function stripeCheckout(order, origin) {
  const line_items = {};
  order.items.forEach((it, i) => {
    line_items[i] = {
      quantity: it.qty,
      price_data: {
        currency: (order.currency || 'KGS').toLowerCase(),
        unit_amount: Math.round(it.price * 100),
        product_data: { name: it.title }
      }
    };
  });
  return stripe('checkout/sessions', 'POST', {
    mode: 'payment',
    success_url: `${origin}/order/success?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout?cancelled=1`,
    client_reference_id: order.id,
    customer_email: order.customer?.email,
    line_items
  });
}

export const stripeSession = (id) => stripe(`checkout/sessions/${encodeURIComponent(id)}`);

// Тест карталарын текшерүү (Luhn) — DEMO төлөм үчүн
export function luhn(num) {
  const s = String(num).replace(/\D/g, '');
  if (s.length < 13 || s.length > 19) return false;
  let sum = 0;
  let dbl = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let d = Number(s[i]);
    if (dbl) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

// ---------- Cloudinary ----------
export async function cloudinaryUpload(dataUrl) {
  if (!status().cloudinary) throw new HttpError(503, 'Cloudinary туташтырылган эмес. CLOUDINARY_* ачкычтарын .env файлына кошуңуз же сүрөттүн шилтемесин (URL) колдонуңуз.');
  if (typeof dataUrl !== 'string' || !/^data:image\/(png|jpe?g|webp|gif);base64,/.test(dataUrl)) {
    throw new HttpError(422, 'PNG, JPG, WEBP же GIF сүрөт гана жүктөлөт');
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = site.slug;
  const signature = crypto.createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${env('CLOUDINARY_API_SECRET')}`).digest('hex');
  const r = await withTimeout(`https://api.cloudinary.com/v1_1/${env('CLOUDINARY_CLOUD_NAME')}/image/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file: dataUrl, api_key: env('CLOUDINARY_API_KEY'), timestamp, folder, signature })
  }, 20000);
  const data = await r.json();
  if (!r.ok) throw new HttpError(502, `Cloudinary катасы: ${data?.error?.message || r.status}`);
  return { url: data.secure_url, publicId: data.public_id };
}

// ---------- OAuth ----------
export const oauthConfig = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: 'openid email profile',
    id: () => env('GOOGLE_CLIENT_ID'),
    secret: () => env('GOOGLE_CLIENT_SECRET')
  },
  github: {
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    scope: 'read:user user:email',
    id: () => env('GITHUB_CLIENT_ID'),
    secret: () => env('GITHUB_CLIENT_SECRET')
  }
};

export async function oauthProfile(provider, code, redirectUri) {
  const cfg = oauthConfig[provider];
  const tr = await withTimeout(cfg.tokenUrl, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: cfg.id(), client_secret: cfg.secret(), code, redirect_uri: redirectUri, grant_type: 'authorization_code' }).toString()
  });
  const tok = await tr.json();
  if (!tok.access_token) throw new HttpError(401, 'OAuth токен алынган жок');
  const auth = { Authorization: `Bearer ${tok.access_token}`, 'User-Agent': site.name };
  if (provider === 'google') {
    const p = await (await withTimeout('https://openidconnect.googleapis.com/v1/userinfo', { headers: auth })).json();
    if (!p.email || p.email_verified === false) throw new HttpError(401, 'Google email тастыкталган эмес');
    return { email: p.email.toLowerCase(), name: p.name || p.email, avatar: p.picture || '' };
  }
  const u = await (await withTimeout('https://api.github.com/user', { headers: auth })).json();
  let email = u.email;
  if (!email) {
    const emails = await (await withTimeout('https://api.github.com/user/emails', { headers: auth })).json();
    email = Array.isArray(emails) ? (emails.find((e) => e.primary && e.verified) || emails.find((e) => e.verified))?.email : null;
  }
  if (!email) throw new HttpError(401, 'GitHub аккаунтунда тастыкталган email жок');
  return { email: email.toLowerCase(), name: u.name || u.login, avatar: u.avatar_url || '' };
}

// ---------- Ачык API: валюта курстары (open.er-api.com, ачкычсыз) ----------
let ratesCache = { at: 0, data: null };
export async function exchangeRates() {
  if (ratesCache.data && Date.now() - ratesCache.at < 3 * 3600_000) return { ...ratesCache.data, cached: true };
  try {
    const r = await withTimeout('https://open.er-api.com/v6/latest/USD', {}, 8000);
    if (!r.ok) throw new Error(String(r.status));
    const j = await r.json();
    if (j.result !== 'success') throw new Error('bad');
    const pick = ['KGS', 'KZT', 'RUB', 'EUR', 'CNY', 'TRY', 'UZS', 'AED', 'GBP', 'JPY'];
    const data = { base: 'USD', updated: j.time_last_update_utc, rates: Object.fromEntries(pick.filter((k) => j.rates[k]).map((k) => [k, j.rates[k]])) };
    ratesCache = { at: Date.now(), data };
    return { ...data, cached: false };
  } catch {
    throw new HttpError(502, 'Валюта курстарынын API\'си (open.er-api.com) жооп берген жок. Кийинчерээк кайталаңыз.');
  }
}
