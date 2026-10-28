// Браузерде Wikipedia API'ден сүрөт алуу (категориялар жана башкы баннер үчүн), localStorage кэш менен.
import { useEffect, useState } from 'react';
import { wikiImage, commonsImages } from '../../site/wiki.js';

const KEY = 'wikiimg:v1';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const mem = read();
const pending = {};

export function useWikiImage(query, size = 900) {
  const id = query ? `${size}|${query}` : '';
  const [url, setUrl] = useState(id ? mem[id] : undefined);
  useEffect(() => {
    if (!id || mem[id] !== undefined) { setUrl(id ? mem[id] : undefined); return; }
    let alive = true;
    (pending[id] ||= wikiImage(query, size)).then((u) => {
      mem[id] = u || null;
      try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch { /* толуп калса — эс гана */ }
      if (alive) setUrl(u || null);
    });
    return () => { alive = false; };
  }, [id]);
  return url; // undefined = жүктөлүүдө, null = табылган жок
}

// Толук барактагы галерея үчүн Wikimedia Commons'тон кошумча сүрөттөр (кэш менен)
const gmem = {};
export function useCommonsGallery(query) {
  const [list, setList] = useState(query ? gmem[query] : undefined);
  useEffect(() => {
    if (!query) { setList(undefined); return; }
    if (gmem[query]) { setList(gmem[query]); return; }
    let alive = true;
    commonsImages(query, 4).then((r) => { gmem[query] = r; if (alive) setList(r); });
    return () => { alive = false; };
  }, [query]);
  return list;
}
