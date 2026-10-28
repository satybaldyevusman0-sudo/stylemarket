import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

// GET суроо-талабы: loading / error / data / reload.
// loading жолу (path) өзгөргөн замат true болот — эски/бош маалымат менен рендер болбойт.
export function useFetch(path, { enabled = true, interval = 0 } = {}) {
  const active = !!(enabled && path);
  const [state, setState] = useState({ data: null, error: null, key: null });
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((x) => x + 1), []);

  useEffect(() => {
    if (!active) return undefined;
    const ctrl = new AbortController();
    api(path, { signal: ctrl.signal })
      .then((data) => setState({ data, error: null, key: path }))
      .catch((error) => { if (!ctrl.signal.aborted) setState({ data: null, error, key: path }); });
    return () => ctrl.abort();
  }, [path, active, tick]);

  useEffect(() => {
    if (!interval || !active) return undefined;
    const id = setInterval(() => setTick((x) => x + 1), interval);
    return () => clearInterval(id);
  }, [interval, active]);

  const fresh = active && state.key === path;
  return {
    data: fresh ? state.data : null,
    error: fresh ? state.error : null,
    loading: active && !fresh,
    reload
  };
}

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* жеке режимде сактоо мүмкүн эмес */ }
  }, [key, value]);
  return [value, setValue];
}

export function useDebounce(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

export function useDocumentTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} — ItaliaEdu` : 'ItaliaEdu — Италияда окуу';
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
}
