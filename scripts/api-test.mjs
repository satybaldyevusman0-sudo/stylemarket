// API'нин автоматтык текшерүүсү. Сервер иштеп турганда: `npm run test:api`
const BASE = process.env.BASE || 'http://localhost:3001';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@site.kg';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin12345!';

let passed = 0;
let failed = 0;
const ok = (cond, name, extra = '') => {
  if (cond) { passed++; if (!process.env.QUIET) console.log('  ✓', name); } else { failed++; console.log('  ✗', name, extra); }
};

function client() {
  let cookie = '';
  return async (path, { method = 'GET', body, headers = {} } = {}) => {
    const r = await fetch(BASE + path, {
      method, redirect: 'manual',
      headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}), ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
    for (const c of r.headers.getSetCookie?.() || []) {
      const [pair] = c.split(';');
      if (pair.startsWith('token=')) cookie = pair.endsWith('=') ? '' : pair;
    }
    let data = null;
    try { data = await r.json(); } catch { /* бош */ }
    return { status: r.status, data };
  };
}
const nextWeekday = (offset) => { const d = new Date(); d.setDate(d.getDate() + offset); while (d.getDay() === 0) d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); };

const guest = client(); const user = client(); const admin = client();
const email = `test${Date.now()}@example.com`;

let r = await guest('/api/health');
ok(r.status === 200 && r.data.ok, 'health');
const site = (await guest('/api/site')).data;
ok(site.categories.length >= 3 && site.totalItems >= 8, 'сайттын маалыматы');
r = await guest('/api/items?limit=5');
ok(r.data.items.length === 5 && r.data.pages >= 2, 'каталог + пагинация');
const first = r.data.items[0];
r = await guest(`/api/items?category=${site.categories[0].id}`);
ok(r.data.items.length > 0 && r.data.items.every((x) => x.category === site.categories[0].id), 'фильтр: категория');
r = await guest('/api/items?sort=price_asc&limit=60');
ok(r.data.items.every((x, i, a) => !i || (a[i - 1].price || 0) <= (x.price || 0)), 'иреттөө: баа');
const mid = r.data.items[Math.floor(r.data.items.length / 2)].price;
r = await guest(`/api/items?max=${mid}&limit=60`);
ok(r.data.items.every((x) => (x.price || 0) <= mid), 'фильтр: макс баа');
const word = (typeof first.title === 'string' ? first.title : first.title.ky).split(/\s+/)[0];
r = await guest(`/api/items?q=${encodeURIComponent(word)}`);
ok(r.data.total >= 1, `издөө: ${word}`);
r = await guest(`/api/items/${first.id}`);
ok(r.status === 200 && Array.isArray(r.data.related), 'толук барак');
ok((await guest('/api/items/nope')).status === 404, '404');
const plans = (await guest('/api/plans')).data.items;
ok(Array.isArray(plans), 'тарифтер');
ok((await guest('/api/favorites')).status === 401, 'кирбеген колдонуучу 401');

r = await user('/api/auth/register', { method: 'POST', body: { name: 'A', email: 'bad', password: '1' } });
ok(r.status === 422, 'валидация 422');
r = await user('/api/auth/register', { method: 'POST', body: { name: 'Test User', email, password: 'Secret123' } });
ok(r.status === 201, 'катталуу');
ok((await user('/api/admin/stats')).status === 403, 'колдонуучу админге кире албайт');
ok((await user('/api/favorites', { method: 'POST', body: { itemId: first.id } })).status === 201, 'сүйүктүү');
r = await user('/api/reviews', { method: 'POST', body: { itemId: first.id, rating: 5, text: 'Абдан жакшы!' } });
ok(r.status === 201, 'пикир');
r = await guest(`/api/items/${first.id}`);
ok(r.data.rating === 5, 'рейтинг');

const buyable = (await guest('/api/items?limit=60')).data.items.find((x) => x.buyable !== false && x.price);
const cartItems = [];
if (buyable) cartItems.push({ kind: 'item', id: buyable.id, qty: 2 });
const samePlan = plans.find((p) => (p.currency || buyable?.currency) === (buyable?.currency || p.currency));
if (samePlan && (!buyable || (samePlan.currency || 'KGS') === (buyable.currency || 'KGS'))) cartItems.push({ kind: 'plan', id: samePlan.id, qty: 1 });
r = await user('/api/orders', { method: 'POST', body: { items: cartItems, name: 'Test', phone: '+996555123456', email, address: 'Бишкек' } });
ok(r.status === 201 && r.data.order.total > 0, 'заказ', JSON.stringify(r.data).slice(0, 200));
const orderId = r.data?.order?.id;
r = await user('/api/payments/demo', { method: 'POST', body: { orderId, card: '4242 4242 4242 4242', exp: '12/30', cvc: '123' } });
ok(r.status === 200 && r.data.order.paymentStatus === 'paid', 'DEMO төлөм');

const day = nextWeekday(3);
const slots = (await guest(`/api/bookings/slots?date=${day}`)).data.slots;
r = await user('/api/bookings', { method: 'POST', body: { date: day, time: slots[0].time, format: process.env.FORMAT || undefined, name: 'Test', phone: '+996555123456', email, itemId: first.id } });
if (r.status === 422 && r.data.details?.format) {
  const formats = r.data.details.format.replace(/^.*: /, '').split(', ');
  r = await user('/api/bookings', { method: 'POST', body: { date: day, time: slots[0].time, format: formats[0], name: 'Test', phone: '+996555123456', email, itemId: first.id } });
}
ok(r.status === 201, 'бронь', JSON.stringify(r.data).slice(0, 200));

r = await guest('/api/contact', { method: 'POST', body: { name: 'Test', email: 'a@b.kg', message: 'Салам, суроом бар эле.' } });
ok(r.status === 201, 'байланыш формасы');
r = await guest('/api/chat', { method: 'POST', body: { message: 'whatsapp', lang: 'ky' } });
ok(r.status === 200 && /\+996/.test(r.data.answer), 'чатбот');
r = await guest('/api/external/rates');
ok(r.status === 200 || r.status === 502, `тышкы API: ${r.status}`);

r = await admin('/api/auth/login', { method: 'POST', body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
ok(r.status === 200 && r.data.user.role === 'admin', 'админ кирди');
r = await admin('/api/admin/stats');
ok(r.status === 200 && r.data.totals.orders >= 1, 'статистика');
const newItem = { title: { ky: 'Тест товар', ru: 'Тест', en: 'Test' }, category: site.categories[0].id, price: 100, oldPrice: null, currency: 'KGS', image: '', desc: { ky: 'Тест сүрөттөмөсү', ru: '', en: '' }, brand: '', badge: '', stock: 5, buyable: true, tags: ['test'], specs: [['Түсү', 'Кызыл']] };
r = await admin('/api/admin/items', { method: 'POST', body: newItem });
ok(r.status === 201, 'админ: кошуу', JSON.stringify(r.data).slice(0, 200));
const nid = r.data?.item?.id;
r = await admin(`/api/admin/items/${nid}`, { method: 'PUT', body: { ...newItem, price: 200 } });
ok(r.status === 200 && r.data.item.price === 200, 'админ: өзгөртүү');
ok((await admin(`/api/admin/items/${nid}`, { method: 'DELETE' })).status === 200, 'админ: өчүрүү');
ok((await admin(`/api/admin/orders/${orderId}`, { method: 'PATCH', body: { status: 'done' } })).status === 200, 'админ: заказ статусу');

await user('/api/auth/logout', { method: 'POST', body: {} });
ok((await user('/api/auth/me')).data.user === null, 'чыгуу');

console.log(`Натыйжа: ${passed} өттү, ${failed} ката`);
process.exit(failed ? 1 : 0);
