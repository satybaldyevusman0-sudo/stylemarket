// Администратор панели: бардык маршруттар requireAdmin аркылуу СЕРВЕРДЕ текшерилет.
import site from '../../site/config.js';
import * as db from '../lib/db.js';
import { HttpError, send } from '../lib/http.js';
import { validate, rules } from '../lib/validate.js';
import { requireAdmin, publicUser } from '../lib/guards.js';
import { cloudinaryUpload, status } from '../lib/integrations.js';

const i18nText = (min, max) => (v) => {
  if (!v || typeof v !== 'object') return 'ky/ru/en тексттери керек';
  const e = rules.str(min, max)(v.ky);
  if (e) return 'Кыргызча: ' + e;
  for (const l of ['ru', 'en']) { const e2 = rules.optStr(max)(v[l]); if (e2) return `${l}: ${e2}`; }
  return null;
};
const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').slice(0, 60);

function cleanI18n(v) {
  return { ky: (v.ky || '').trim(), ru: (v.ru || '').trim(), en: (v.en || '').trim() };
}

const CATS = site.categories.map((c) => c.id);
const TR = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', ң: 'ng', о: 'o', ө: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ү: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' };
const translit = (s = '') => s.toLowerCase().split('').map((c) => (c in TR ? TR[c] : c)).join('');
const tt = (v) => (typeof v === 'string' ? v : v?.ky || '');

function itemInput(body) {
  const d = validate(body, {
    title: i18nText(2, 160), category: rules.oneOf(CATS), price: rules.optNum(0, 1e10), oldPrice: rules.optNum(0, 1e10),
    currency: rules.oneOf(['KGS', 'USD']), image: rules.optUrl(), desc: i18nText(5, 3000), brand: rules.optStr(80),
    badge: rules.optStr(40), stock: rules.optNum(0, 1e6),
    buyable: (v) => (typeof v === 'boolean' ? null : 'true/false'),
    tags: rules.arr(rules.str(1, 40), 15),
    specs: rules.arr((x) => (Array.isArray(x) && x.length === 2 && typeof x[0] === 'string' && typeof x[1] === 'string' && x[0].trim() && x[1].length <= 200 ? null : 'Мүнөздөмө туура эмес'), 30)
  });
  if (d.oldPrice != null && d.price != null && d.oldPrice <= d.price) throw new HttpError(422, 'Форманы текшериңиз', { oldPrice: 'Эски баа жаңы баадан чоң болушу керек' });
  return {
    title: cleanI18n(d.title), category: d.category, price: d.price ?? 0, oldPrice: d.oldPrice ?? null, currency: d.currency,
    image: d.image || '', ...(d.image ? { imageSource: 'admin' } : {}), desc: cleanI18n(d.desc), brand: d.brand || '', badge: d.badge || '', stock: d.stock ?? null,
    buyable: d.buyable, tags: d.tags.map((x) => x.trim()), specs: d.specs.map(([k, v]) => [k.trim(), v.trim()])
  };
}

function packageInput(body) {
  const d = validate(body, { title: i18nText(2, 120), description: i18nText(2, 600), price: rules.optNum(0, 10_000_000), icon: rules.optStr(8), bookable: (v) => (typeof v === 'boolean' ? null : 'true/false') });
  if (d.price == null) throw new HttpError(422, 'Форманы текшериңиз', { price: 'Баасын жазыңыз' });
  return { title: cleanI18n(d.title), desc: cleanI18n(d.description), price: d.price, currency: site.currency, icon: d.icon || '📦', popular: d.bookable };
}

function crud(r, col, toInput, idFrom) {
  r.get(`/api/admin/${col}`, requireAdmin, async (ctx) => send(ctx.res, 200, { items: await db.all(col) }));
  r.post(`/api/admin/${col}`, requireAdmin, async (ctx) => {
    const input = toInput(await ctx.body());
    let id = idFrom ? idFrom(input) : undefined;
    if (id && (await db.get(col, id))) id = `${id}-${Date.now().toString(36)}`;
    const item = await db.insert(col, { ...input, id });
    send(ctx.res, 201, { item });
  });
  r.put(`/api/admin/${col}/:id`, requireAdmin, async (ctx) => {
    if (!(await db.get(col, ctx.params.id))) throw new HttpError(404, 'Табылган жок');
    const item = await db.update(col, ctx.params.id, toInput(await ctx.body()));
    send(ctx.res, 200, { item });
  });
  r.delete(`/api/admin/${col}/:id`, requireAdmin, async (ctx) => {
    if (!(await db.remove(col, ctx.params.id))) throw new HttpError(404, 'Табылган жок');
    if (col === 'items') {
      await db.removeWhere('reviews', (x) => x.itemId === ctx.params.id);
      await db.removeWhere('favorites', (x) => x.itemId === ctx.params.id);
    }
    send(ctx.res, 200, { ok: true });
  });
}

export default function adminRoutes(r) {
  crud(r, 'items', itemInput, (i) => slug(translit(tt(i.title) || i.title.ru || i.title.en).replace(/[^\x00-\x7F]/g, '')) || 'item');
  crud(r, 'plans', packageInput);

  r.get('/api/admin/users', requireAdmin, async (ctx) => send(ctx.res, 200, { items: (await db.all('users')).map((u) => ({ ...publicUser(u), blocked: !!u.blocked })) }));
  r.patch('/api/admin/users/:id', requireAdmin, async (ctx) => {
    const body = await ctx.body();
    const d = validate(body, { role: rules.oneOf(['user', 'admin']), blocked: (v) => (typeof v === 'boolean' ? null : 'true/false') });
    if (ctx.params.id === ctx.user.id && (d.role !== 'admin' || d.blocked)) throw new HttpError(400, 'Өзүңүздүн админ укугуңузду алып сала албайсыз');
    const u = await db.update('users', ctx.params.id, d);
    if (!u) throw new HttpError(404, 'Колдонуучу табылган жок');
    send(ctx.res, 200, { item: { ...publicUser(u), blocked: !!u.blocked } });
  });
  r.delete('/api/admin/users/:id', requireAdmin, async (ctx) => {
    if (ctx.params.id === ctx.user.id) throw new HttpError(400, 'Өзүңүздү өчүрө албайсыз');
    if (!(await db.remove('users', ctx.params.id))) throw new HttpError(404, 'Колдонуучу табылган жок');
    send(ctx.res, 200, { ok: true });
  });

  const statusRoute = (col, allowed) => r.patch(`/api/admin/${col}/:id`, requireAdmin, async (ctx) => {
    const d = validate(await ctx.body(), { status: rules.oneOf(allowed) });
    const item = await db.update(col, ctx.params.id, d);
    if (!item) throw new HttpError(404, 'Табылган жок');
    send(ctx.res, 200, { item });
  });
  r.get('/api/admin/orders', requireAdmin, async (ctx) => send(ctx.res, 200, { items: (await db.all('orders')).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }));
  statusRoute('orders', ['pending', 'confirmed', 'in_progress', 'done', 'cancelled']);
  r.get('/api/admin/bookings', requireAdmin, async (ctx) => send(ctx.res, 200, { items: (await db.all('bookings')).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)) }));
  statusRoute('bookings', ['pending', 'confirmed', 'done', 'cancelled']);
  r.get('/api/admin/messages', requireAdmin, async (ctx) => send(ctx.res, 200, { items: (await db.all('messages')).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }));
  statusRoute('messages', ['new', 'read', 'answered']);
  r.delete('/api/admin/messages/:id', requireAdmin, async (ctx) => {
    if (!(await db.remove('messages', ctx.params.id))) throw new HttpError(404, 'Табылган жок');
    send(ctx.res, 200, { ok: true });
  });
  r.get('/api/admin/reviews', requireAdmin, async (ctx) => {
    const users = await db.all('users');
    const all = await db.all('items');
    const items = (await db.all('reviews')).map((x) => ({ ...x, userName: users.find((u) => u.id === x.userId)?.name || '—', itemName: tt(all.find((u) => u.id === x.itemId)?.title) || x.itemId }));
    send(ctx.res, 200, { items: items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
  });

  r.post('/api/admin/upload', requireAdmin, async (ctx) => {
    const { dataUrl } = await ctx.body();
    send(ctx.res, 201, await cloudinaryUpload(dataUrl));
  });

  r.get('/api/admin/stats', requireAdmin, async (ctx) => {
    const [users, unis, orders, bookings, messages, reviews, favorites] = await Promise.all(
      ['users', 'items', 'orders', 'bookings', 'messages', 'reviews', 'favorites'].map((c) => db.all(c)));
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date: key.slice(5),
        orders: orders.filter((o) => o.createdAt.slice(0, 10) === key).length,
        bookings: bookings.filter((b) => b.createdAt.slice(0, 10) === key).length,
        revenue: orders.filter((o) => o.paymentStatus === 'paid' && (o.paidAt || o.createdAt).slice(0, 10) === key).reduce((s, o) => s + o.total, 0)
      });
    }
    const byCity = site.categories.map((c) => ({ name: tt(c.name), value: unis.filter((u) => u.category === c.id).length }));
    const favCount = favorites.reduce((m, f) => ({ ...m, [f.itemId]: (m[f.itemId] || 0) + 1 }), {});
    const topFav = Object.entries(favCount).sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([id, value]) => ({ name: tt(unis.find((u) => u.id === id)?.title).slice(0, 22) || id, value }));
    const orderStatus = ['pending', 'confirmed', 'in_progress', 'done', 'cancelled'].map((s) => ({ name: s, value: orders.filter((o) => o.status === s).length }));
    send(ctx.res, 200, {
      totals: {
        users: users.length, admins: users.filter((u) => u.role === 'admin').length, items: unis.length,
        orders: orders.length, paid: orders.filter((o) => o.paymentStatus === 'paid').length,
        revenue: orders.filter((o) => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0),
        bookings: bookings.length, newMessages: messages.filter((m) => m.status === 'new').length, reviews: reviews.length
      },
      days, byCity, topFav, orderStatus,
      integrations: status(), storage: db.storageInfo(),
      generatedAt: new Date().toISOString()
    });
  });
}
