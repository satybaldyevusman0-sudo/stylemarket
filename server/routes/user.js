// Катталган колдонуучулар үчүн: пикирлер, сүйүктүүлөр, заказдар, бронь, төлөм.
import site from '../../site/config.js';
import * as db from '../lib/db.js';
import { HttpError, send, baseUrl } from '../lib/http.js';
import { validate, rules } from '../lib/validate.js';
import { requireAuth } from '../lib/guards.js';
import { notifyAll, status, stripeCheckout, stripeSession, luhn } from '../lib/integrations.js';

const SLOTS = site.booking?.slots || ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
const FORMATS = (site.booking?.formats || [{ id: 'online' }, { id: 'office' }]).map((f) => f.id);
const tt = (v) => (typeof v === 'string' ? v : v?.ky || v?.en || '');

export default function userRoutes(r) {
  // ---- Пикирлер ----
  r.post('/api/reviews', requireAuth, async (ctx) => {
    const data = validate(await ctx.body(), { itemId: rules.str(1, 80), rating: rules.int(1, 5), text: rules.str(5, 1000) });
    if (!(await db.get('items', data.itemId))) throw new HttpError(404, 'Табылган жок');
    const existing = (await db.all('reviews')).find((x) => x.itemId === data.itemId && x.userId === ctx.user.id);
    const item = existing
      ? await db.update('reviews', existing.id, { rating: data.rating, text: data.text })
      : await db.insert('reviews', { ...data, userId: ctx.user.id });
    send(ctx.res, existing ? 200 : 201, { item: { ...item, userName: ctx.user.name }, updated: !!existing });
  });

  r.delete('/api/reviews/:id', requireAuth, async (ctx) => {
    const rev = await db.get('reviews', ctx.params.id);
    if (!rev) throw new HttpError(404, 'Пикир табылган жок');
    if (rev.userId !== ctx.user.id && ctx.user.role !== 'admin') throw new HttpError(403, 'Өзүңүздүн пикириңизди гана өчүрө аласыз');
    await db.remove('reviews', rev.id);
    send(ctx.res, 200, { ok: true });
  });

  // ---- Сүйүктүүлөр ----
  r.get('/api/favorites', requireAuth, async (ctx) => {
    const favs = (await db.all('favorites')).filter((f) => f.userId === ctx.user.id);
    const all = await db.all('items');
    send(ctx.res, 200, { ids: favs.map((f) => f.itemId), items: favs.map((f) => all.find((u) => u.id === f.itemId)).filter(Boolean) });
  });

  r.post('/api/favorites', requireAuth, async (ctx) => {
    const { itemId } = validate(await ctx.body(), { itemId: rules.str(1, 80) });
    if (!(await db.get('items', itemId))) throw new HttpError(404, 'Табылган жок');
    const exists = (await db.all('favorites')).find((f) => f.userId === ctx.user.id && f.itemId === itemId);
    if (!exists) await db.insert('favorites', { userId: ctx.user.id, itemId });
    send(ctx.res, 201, { ok: true, itemId });
  });

  r.delete('/api/favorites/:itemId', requireAuth, async (ctx) => {
    await db.removeWhere('favorites', (f) => f.userId === ctx.user.id && f.itemId === ctx.params.itemId);
    send(ctx.res, 200, { ok: true });
  });

  // ---- Заказ (корзинадан) ----
  r.post('/api/orders', requireAuth, async (ctx) => {
    const body = await ctx.body();
    const data = validate(body, {
      items: rules.arr((x) => (x && ['item', 'plan'].includes(x.kind) && typeof x.id === 'string' && Number.isInteger(x.qty) && x.qty >= 1 && x.qty <= 20 ? null : 'Корзинадагы элемент туура эмес'), 30),
      name: rules.str(2, 80), phone: rules.phone(), email: rules.email(), address: rules.optStr(300), note: rules.optStr(1000)
    });
    if (!data.items.length) throw new HttpError(422, 'Корзина бош', { items: 'Корзина бош' });
    const [catalog, plans] = await Promise.all([db.all('items'), db.all('plans')]);
    // Баа клиенттен эмес, серверден алынат
    const items = data.items.map((it) => {
      const src = (it.kind === 'plan' ? plans : catalog).find((x) => x.id === it.id);
      if (!src) throw new HttpError(422, 'Табылган жок: ' + it.id);
      if (src.buyable === false) throw new HttpError(422, 'Бул позицияны сатып алууга болбойт: ' + tt(src.title));
      if (!src.price) throw new HttpError(422, 'Баасы жок позиция: ' + tt(src.title));
      return { kind: it.kind, id: src.id, title: tt(src.title), price: src.price, currency: src.currency || site.currency, qty: it.qty };
    });
    const currencies = [...new Set(items.map((i) => i.currency))];
    if (currencies.length > 1) throw new HttpError(422, 'Корзинада ар кандай валюта бар — өзүнчө заказ бериңиз');
    const total = items.reduce((s2, it) => s2 + it.price * it.qty, 0);
    const order = await db.insert('orders', {
      userId: ctx.user.id, items, total, currency: currencies[0],
      customer: { name: data.name, phone: data.phone, email: data.email, address: data.address || '' }, note: data.note || '',
      status: 'pending', paymentStatus: 'unpaid'
    });
    const notify = await notifyAll(`Жаңы заказ #${order.id.slice(-6)}`, `${data.name}, ${data.phone}, ${data.email}\n${data.address || ''}\n${items.map((i) => `• ${i.title} × ${i.qty} = ${i.price * i.qty} ${i.currency}`).join('\n')}\nЖалпы: ${total} ${currencies[0]}`);
    send(ctx.res, 201, { order, notify });
  });

  r.get('/api/orders/my', requireAuth, async (ctx) => {
    const items = (await db.all('orders')).filter((o) => o.userId === ctx.user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    send(ctx.res, 200, { items });
  });

  r.get('/api/orders/:id', requireAuth, async (ctx) => {
    const o = await db.get('orders', ctx.params.id);
    if (!o || (o.userId !== ctx.user.id && ctx.user.role !== 'admin')) throw new HttpError(404, 'Заказ табылган жок');
    send(ctx.res, 200, { order: o });
  });

  // ---- Төлөм ----
  r.post('/api/payments/checkout', requireAuth, async (ctx) => {
    const { orderId } = validate(await ctx.body(), { orderId: rules.str(1, 80) });
    const order = await db.get('orders', orderId);
    if (!order || order.userId !== ctx.user.id) throw new HttpError(404, 'Заказ табылган жок');
    if (order.paymentStatus === 'paid') throw new HttpError(409, 'Заказ мурунтан төлөнгөн');
    if (!status().stripe) return send(ctx.res, 200, { mode: 'demo' });
    const session = await stripeCheckout(order, baseUrl(ctx.req));
    await db.update('orders', order.id, { stripeSessionId: session.id });
    send(ctx.res, 200, { mode: 'stripe', url: session.url });
  });

  r.post('/api/payments/verify', requireAuth, async (ctx) => {
    const { orderId, sessionId } = validate(await ctx.body(), { orderId: rules.str(1, 80), sessionId: rules.str(1, 200) });
    const order = await db.get('orders', orderId);
    if (!order || order.userId !== ctx.user.id) throw new HttpError(404, 'Заказ табылган жок');
    if (!status().stripe) throw new HttpError(503, 'Stripe туташтырылган эмес');
    if (order.stripeSessionId !== sessionId) throw new HttpError(400, 'Сессия бул заказга тиешелүү эмес');
    const s = await stripeSession(sessionId);
    if (s.payment_status === 'paid') {
      const upd = await db.update('orders', order.id, { paymentStatus: 'paid', status: 'confirmed', paidAt: new Date().toISOString(), paymentMode: 'stripe' });
      await notifyAll(`Төлөм алынды #${order.id.slice(-6)}`, `${order.total} ${order.currency} (Stripe)`);
      return send(ctx.res, 200, { order: upd });
    }
    send(ctx.res, 200, { order, pending: true });
  });

  // Stripe ачкычы жок болсо — DEMO төлөм (тест карта 4242 4242 4242 4242)
  r.post('/api/payments/demo', requireAuth, async (ctx) => {
    if (status().stripe) throw new HttpError(400, 'Stripe туташкан — демо төлөм өчүрүлгөн');
    const data = validate(await ctx.body(), { orderId: rules.str(1, 80), card: rules.str(12, 23), exp: rules.str(4, 7), cvc: rules.str(3, 4) });
    const order = await db.get('orders', data.orderId);
    if (!order || order.userId !== ctx.user.id) throw new HttpError(404, 'Заказ табылган жок');
    if (order.paymentStatus === 'paid') throw new HttpError(409, 'Заказ мурунтан төлөнгөн');
    const digits = data.card.replace(/\D/g, '');
    if (!luhn(digits)) throw new HttpError(422, 'Карта номери туура эмес', { card: 'Карта номери туура эмес' });
    if (!/^(0[1-9]|1[0-2])\/?\d{2}$/.test(data.exp.replace(/\s/g, ''))) throw new HttpError(422, 'Мөөнөтү туура эмес', { exp: 'АА/ЖЖ форматында' });
    if (!/^\d{3,4}$/.test(data.cvc)) throw new HttpError(422, 'CVC туура эмес', { cvc: 'CVC туура эмес' });
    if (digits === '4000000000000002') throw new HttpError(402, 'Төлөм четке кагылды (тест карта: declined)');
    const upd = await db.update('orders', order.id, { paymentStatus: 'paid', status: 'confirmed', paidAt: new Date().toISOString(), paymentMode: 'demo', cardLast4: digits.slice(-4) });
    const notify = await notifyAll(`Төлөм (DEMO) #${order.id.slice(-6)}`, `${order.total} ${order.currency}, карта •••• ${digits.slice(-4)}`);
    send(ctx.res, 200, { order: upd, notify });
  });

  // ---- Бронь (консультацияга жазылуу) ----
  r.get('/api/bookings/slots', async (ctx) => {
    const { date } = ctx.query;
    if (!date || rules.date()(date)) throw new HttpError(400, 'Дата туура эмес');
    const busy = (await db.all('bookings')).filter((b) => b.date === date && b.status !== 'cancelled').map((b) => b.time);
    send(ctx.res, 200, { date, slots: SLOTS.map((t) => ({ time: t, free: !busy.includes(t) })) });
  });

  r.post('/api/bookings', requireAuth, async (ctx) => {
    const data = validate(await ctx.body(), {
      date: rules.date(), time: rules.oneOf(SLOTS), format: rules.oneOf(FORMATS), people: rules.optNum(1, 50),
      name: rules.str(2, 80), phone: rules.phone(), email: rules.email(), topic: rules.optStr(500), itemId: rules.optStr(80)
    });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const d = new Date(data.date + 'T00:00:00');
    if (d < today) throw new HttpError(422, 'Өткөн күнгө жазылууга болбойт', { date: 'Келечектеги күндү тандаңыз' });
    if (d.getDay() === 0) throw new HttpError(422, 'Жекшемби — дем алыш күн', { date: 'Жекшемби — дем алыш' });
    const clash = (await db.all('bookings')).some((b) => b.date === data.date && b.time === data.time && b.status !== 'cancelled');
    if (clash) throw new HttpError(409, 'Бул убакыт бош эмес', { time: 'Убакыт бош эмес' });
    if (data.itemId && !(await db.get('items', data.itemId))) throw new HttpError(422, 'Тандалган позиция табылган жок', { itemId: 'Табылган жок' });
    const ref = data.itemId ? await db.get('items', data.itemId) : null;
    const item = await db.insert('bookings', { ...data, itemTitle: ref ? tt(ref.title) : '', userId: ctx.user.id, status: 'pending' });
    const notify = await notifyAll('Жаңы бронь', `${data.date} ${data.time} (${data.format})${data.itemId ? ' — ' + data.itemId : ''}\n${data.name}, ${data.phone}, ${data.email}\n${data.topic || ''}`);
    send(ctx.res, 201, { item, notify });
  });

  r.get('/api/bookings/my', requireAuth, async (ctx) => {
    const items = (await db.all('bookings')).filter((b) => b.userId === ctx.user.id).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    send(ctx.res, 200, { items });
  });

  r.patch('/api/bookings/:id/cancel', requireAuth, async (ctx) => {
    const b = await db.get('bookings', ctx.params.id);
    if (!b || b.userId !== ctx.user.id) throw new HttpError(404, 'Бронь табылган жок');
    const item = await db.update('bookings', b.id, { status: 'cancelled' });
    send(ctx.res, 200, { item });
  });

}
