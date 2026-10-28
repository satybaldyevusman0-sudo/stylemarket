// Wikipedia / Wikimedia API аркылуу туура сүрөт табуу (серверде да, браузерде да иштейт).
// 1) так аталыш боюнча (redirect менен) → 2) табылбаса издөө боюнча биринчи сүрөттүү барак.
// Жооп: upload.wikimedia.org'догу сүрөттүн шилтемеси же null.
const API = 'https://en.wikipedia.org/w/api.php';
const isBrowser = typeof window !== 'undefined';

async function call(params, ms = 7000) {
  const qs = new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params });
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(`${API}?${qs}`, {
      signal: ctrl.signal,
      headers: isBrowser ? {} : { 'User-Agent': 'KG-exam-sites/1.0 (https://vercel.com; educational demo)', 'Api-User-Agent': 'KG-exam-sites/1.0' }
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
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
