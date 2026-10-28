// Wikipedia / Wikimedia API аркылуу туура сүрөт табуу (серверде да, браузерде да иштейт).
// 1) так аталыш боюнча (redirect менен) → 2) табылбаса издөө боюнча биринчи сүрөттүү барак.
// Жооп: upload.wikimedia.org'догу сүрөттүн шилтемеси же null.
const API = 'https://en.wikipedia.org/w/api.php';
const isBrowser = typeof window !== 'undefined';

const COMMONS = 'https://commons.wikimedia.org/w/api.php';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 429 (көп суроо) болсо бир аз күтүп, кайра аракет кылат
async function call(params, ms = 7000, api = API, tries = 3) {
  const qs = new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params });
  for (let i = 0; i < tries; i++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    try {
      const r = await fetch(`${api}?${qs}`, {
        signal: ctrl.signal,
        headers: isBrowser ? {} : { 'User-Agent': 'KG-exam-sites/1.0 (https://vercel.com; educational demo)', 'Api-User-Agent': 'KG-exam-sites/1.0' }
      });
      if (r.status === 429 || r.status >= 500) { await sleep(800 * (i + 1) + Math.random() * 600); continue; }
      if (!r.ok) return null;
      return await r.json();
    } catch {
      await sleep(400);
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

// allowLogo = false болсо логотип, желек жана SVG сүрөттөр өткөрүлүп жиберилет (сүрөт керек)
const pickThumb = (pages = [], allowLogo = false) => {
  for (const p of pages) {
    const src = p?.thumbnail?.source || p?.original?.source;
    if (!src) continue;
    if (allowLogo || (!/\.svg/i.test(src) && !/Flag_of|Logo|logo|Coat_of_arms|Emblem/i.test(src))) return src;
  }
  return null;
};

// query "logo:Аталыш" түрүндө болсо — логотипке да уруксат (мис. программалар, кызматтар)
export async function wikiImage(query, size = 900) {
  if (!query) return null;
  const allowLogo = query.startsWith('logo:');
  if (allowLogo) query = query.slice(5);
  const base = { prop: 'pageimages', piprop: 'thumbnail', pithumbsize: String(size), pilicense: 'any' };
  const exact = await call({ action: 'query', titles: query, redirects: '1', ...base });
  const a = pickThumb(exact?.query?.pages, allowLogo);
  if (a) return a;
  const found = await call({ action: 'query', generator: 'search', gsrsearch: query, gsrlimit: '5', gsrnamespace: '0', ...base });
  const pages = (found?.query?.pages || []).sort((x, y) => (x.index || 0) - (y.index || 0));
  return pickThumb(pages, allowLogo);
}

// Wikimedia Commons'тон ошол темадагы кошумча сүрөттөр (галерея үчүн)
export async function commonsImages(query, n = 4, size = 800) {
  if (!query || query.startsWith('logo:')) return [];
  const q = query.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  const res = await call({ action: 'query', generator: 'search', gsrsearch: `${q} filetype:bitmap`, gsrnamespace: '6', gsrlimit: '15', prop: 'imageinfo', iiprop: 'url|mime', iiurlwidth: String(size) }, 7000, COMMONS, 2);
  const pages = (res?.query?.pages || []).sort((a, b) => (a.index || 0) - (b.index || 0));
  const out = [];
  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    if (!ii || !/image\/(jpeg|png|webp)/.test(ii.mime || '')) continue;
    if (/logo|flag|map|coat|diagram|icon/i.test(p.title)) continue;
    out.push(ii.thumburl || ii.url);
    if (out.length >= n) break;
  }
  return out;
}

// Бир нече сурамды чектелген параллелдүүлүк менен чечүү
export async function wikiImages(queries, size = 900, concurrency = 6) {
  const out = new Array(queries.length).fill(null);
  let i = 0;
  const worker = async () => {
    while (i < queries.length) {
      const k = i++;
      out[k] = await wikiImage(queries[k], size);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, queries.length) }, worker));
  return out;
}
