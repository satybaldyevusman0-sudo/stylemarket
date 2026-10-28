import site from '../../site/config.js';
import * as db from '../lib/db.js';
import { HttpError, send } from '../lib/http.js';
import { validate, rules } from '../lib/validate.js';
import { rateLimit } from '../lib/security.js';
import { status, notifyAll, exchangeRates } from '../lib/integrations.js';
import { chatAnswer } from '../lib/chatbot.js';

const contactLimit = rateLimit('contact', 5);
const chatLimit = rateLimit('chat', 30);

function ratingMap(reviews) {
  const m = {};
  for (const r of reviews) {
    m[r.itemId] ||= { sum: 0, count: 0 };
    m[r.itemId].sum += r.rating;
    m[r.itemId].count += 1;
  }
  return m;
}
export const withRating = (x, m) => ({ ...x, rating: m[x.id] ? Math.round((m[x.id].sum / m[x.id].count) * 10) / 10 : 0, reviewsCount: m[x.id]?.count || 0 });
const text = (v) => (typeof v === 'string' ? v : [v?.ky, v?.ru, v?.en].filter(Boolean).join(' '));

export default function publicRoutes(r) {
  r.get('/api/health', async (ctx) => send(ctx.res, 200, { ok: true, site: site.slug, time: new Date().toISOString(), storage: db.storageInfo().driver }));
  r.get('/api/integrations', async (ctx) => send(ctx.res, 200, { ...status(), storage: db.storageInfo() }));

  // Сайттын жалпы маалыматы (категориялар, статистика)
  r.get('/api/site', async (ctx) => {
    const items = await db.all('items');
    const counts = items.reduce((m, x) => ({ ...m, [x.category]: (m[x.category] || 0) + 1 }), {});
    send(ctx.res, 200, {
      name: site.name, categories: site.categories.map((c) => ({ ...c, count: counts[c.id] || 0 })),
      totalItems: items.length, features: site.features || [], sources: site.sources || [], dataNote: site.dataNote || null
    });
  });

  r.get('/api/items', async (ctx) => {
    const q = ctx.query;
    const m = ratingMap(await db.all('reviews'));
    let items = (await db.all('items')).map((x) => withRating(x, m));
    const prices = items.map((x) => x.price || 0);
    if (q.q) {
      const s = q.q.toLowerCase().trim();
      items = items.filter((x) => [text(x.title), text(x.desc), x.brand, ...(x.tags || []), ...(x.specs || []).map((sp) => sp[1])].filter(Boolean).join(' ').toLowerCase().includes(s));
    }
    if (q.category) items = items.filter((x) => x.category === q.category);
    if (q.min) items = items.filter((x) => (x.price || 0) >= Number(q.min));
    if (q.max) items = items.filter((x) => (x.price || 0) <= Number(q.max));
    if (q.tag) items = items.filter((x) => (x.tags || []).includes(q.tag));
    const name = (x) => text(x.title).toLowerCase();
    const sorters = {
      popular: (a, b) => (b.popular || 0) - (a.popular || 0) || b.rating - a.rating,
      price_asc: (a, b) => (a.price || 0) - (b.price || 0),
      price_desc: (a, b) => (b.price || 0) - (a.price || 0),
      rating: (a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount,
      new: (a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''),
      name: (a, b) => name(a).localeCompare(name(b))
    };
    items = [...items].sort(sorters[q.sort] || sorters.popular);
    const limit = Math.min(Math.max(parseInt(q.limit, 10) || 12, 1), 60);
    const total = items.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(Math.max(parseInt(q.page, 10) || 1, 1), pages);
    send(ctx.res, 200, {
      items: items.slice((page - 1) * limit, page * limit), total, page, pages, limit,
      priceRange: { min: Math.min(...prices, 0), max: Math.max(...prices, 0) }
    });
  });

  r.get('/api/items/:id', async (ctx) => {
    const x = await db.get('items', ctx.params.id);
    if (!x) throw new HttpError(404, 'Табылган жок');
    const m = ratingMap(await db.all('reviews'));
    const all = (await db.all('items')).filter((y) => y.category === x.category && y.id !== x.id).slice(0, 4).map((y) => withRating(y, m));
    send(ctx.res, 200, { ...withRating(x, m), related: all });
  });

  r.get('/api/plans', async (ctx) => send(ctx.res, 200, { items: await db.all('plans') }));

  r.get('/api/reviews', async (ctx) => {
    const { itemId } = ctx.query;
    if (!itemId) throw new HttpError(400, 'itemId керек');
    const users = await db.all('users');
    const items = (await db.all('reviews')).filter((x) => x.itemId === itemId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((x) => ({ ...x, userName: users.find((u) => u.id === x.userId)?.name || 'Колдонуучу' }));
    send(ctx.res, 200, { items });
  });

  r.post('/api/contact', async (ctx) => {
    contactLimit(ctx.req);
    const data = validate(await ctx.body(), { name: rules.str(2, 80), email: rules.email(), phone: rules.optStr(30), subject: rules.optStr(120), message: rules.str(10, 2000) });
    const item = await db.insert('messages', { ...data, type: 'contact', status: 'new' });
    const notify = await notifyAll('Жаңы кат', `${data.name} <${data.email}> ${data.phone || ''}\n${data.subject || ''}\n\n${data.message}`);
    send(ctx.res, 201, { id: item.id, notify });
  });

  r.post('/api/chat', async (ctx) => {
    chatLimit(ctx.req);
    const body = await ctx.body();
    const data = validate(body, { message: rules.str(1, 500) });
    send(ctx.res, 200, chatAnswer(data.message, body.lang, await db.all('items')));
  });

  r.get('/api/external/rates', async (ctx) => {
    send(ctx.res, 200, { ...(await exchangeRates()), source: 'https://open.er-api.com (ExchangeRate-API, ачык API)' });
  });
}
