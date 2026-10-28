// Маалымат базасы адаптери.
//  1) UPSTASH_REDIS_REST_URL + TOKEN (же Vercel KV_REST_API_URL + TOKEN) — Vercel'де туруктуу сактоо.
//  2) Локалдык компьютерде — server/data/db.json файлы.
//  3) Vercel'де база жок болсо — убактылуу эс (/tmp), маалымат өчүп калышы мүмкүн (админде эскертүү чыгат).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import site from '../../site/config.js';
import siteItems from '../../site/items.js';
import { hashPassword, randomId } from './security.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PREFIX = `${site.slug}:`;

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

function pickDriver() {
  if (REDIS_URL && REDIS_TOKEN) return 'redis';
  if (process.env.VERCEL) return 'tmp';
  return 'file';
}
export const driver = pickDriver();

const filePath = driver === 'tmp'
  ? `/tmp/${site.slug}-db.json`
  : path.join(__dirname, '..', 'data', 'db.json');

let fileCache = null;
function loadFile() {
  if (fileCache) return fileCache;
  try {
    fileCache = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    fileCache = {};
  }
  return fileCache;
}
function saveFile() {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = filePath + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(fileCache, null, 2));
  fs.renameSync(tmp, filePath);
}

async function redis(command) {
  const r = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  if (!r.ok) throw new Error(`Redis error ${r.status}`);
  const data = await r.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

async function rawRead(col) {
  if (driver === 'redis') {
    const v = await redis(['GET', PREFIX + col]);
    return v ? JSON.parse(v) : null;
  }
  const data = loadFile();
  return data[col] ?? null;
}

async function rawWrite(col, value) {
  if (driver === 'redis') {
    await redis(['SET', PREFIX + col, JSON.stringify(value)]);
    return;
  }
  loadFile()[col] = value;
  saveFile();
}

function defaultAdmin() {
  const email = process.env.ADMIN_EMAIL || (process.env.VERCEL ? null : 'admin@site.kg');
  const password = process.env.ADMIN_PASSWORD || (process.env.VERCEL ? null : 'Admin12345!');
  if (!email || !password) return [];
  return [{
    id: randomId('u_'), name: 'Администратор', email: email.toLowerCase(),
    passwordHash: hashPassword(password), role: 'admin', provider: 'local',
    createdAt: new Date().toISOString()
  }];
}

const seeds = {
  items: () => siteItems.map((x, i) => ({ ...x, createdAt: new Date(Date.UTC(2026, 9, 1 + (i % 27))).toISOString() })),
  plans: () => site.plans || [],
  users: defaultAdmin,
  reviews: () => [],
  favorites: () => [],
  orders: () => [],
  bookings: () => [],
  messages: () => []
};

export const COLLECTIONS = Object.keys(seeds);

export async function all(col) {
  if (!seeds[col]) throw new Error('Unknown collection ' + col);
  let items = await rawRead(col);
  if (items === null) {
    items = seeds[col]();
    await rawWrite(col, items);
  }
  return items;
}

export async function get(col, id) {
  return (await all(col)).find((x) => x.id === id) || null;
}

export async function insert(col, doc) {
  const items = await all(col);
  const item = { createdAt: new Date().toISOString(), ...doc, id: doc.id || randomId(col.slice(0, 2) + '_') };
  items.push(item);
  await rawWrite(col, items);
  return item;
}

export async function update(col, id, patch) {
  const items = await all(col);
  const i = items.findIndex((x) => x.id === id);
  if (i === -1) return null;
  items[i] = { ...items[i], ...patch, id, updatedAt: new Date().toISOString() };
  await rawWrite(col, items);
  return items[i];
}

export async function remove(col, id) {
  const items = await all(col);
  const next = items.filter((x) => x.id !== id);
  if (next.length === items.length) return false;
  await rawWrite(col, next);
  return true;
}

export async function removeWhere(col, pred) {
  const items = await all(col);
  const next = items.filter((x) => !pred(x));
  if (next.length !== items.length) await rawWrite(col, next);
  return items.length - next.length;
}

export function storageInfo() {
  return {
    driver,
    persistent: driver !== 'tmp',
    warning: driver === 'tmp'
      ? 'Vercel\'де туруктуу база туташтырылган эмес: маалымат убактылуу сакталат жана жоголушу мүмкүн. Upstash Redis кошуңуз (README).'
      : null
  };
}
