// Жеңил роутер (History API): Link, NavLink, Routes, useParams, useQuery, navigate.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const RouterCtx = createContext(null);

export function navigate(to, { replace = false } = {}) {
  if (replace) window.history.replaceState({}, '', to);
  else window.history.pushState({}, '', to);
  window.dispatchEvent(new Event('app:navigate'));
}

export function RouterProvider({ children }) {
  const [loc, setLoc] = useState(() => ({ pathname: window.location.pathname, search: window.location.search }));
  useEffect(() => {
    const update = () => setLoc({ pathname: window.location.pathname, search: window.location.search });
    window.addEventListener('popstate', update);
    window.addEventListener('app:navigate', update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('app:navigate', update);
    };
  }, []);
  const value = useMemo(() => ({ ...loc, params: {} }), [loc]);
  return <RouterCtx.Provider value={value}>{children}</RouterCtx.Provider>;
}

export const useLocation = () => useContext(RouterCtx);
export const useParams = () => useContext(RouterCtx).params;

export function useQuery() {
  const { search, pathname } = useLocation();
  const query = useMemo(() => Object.fromEntries(new URLSearchParams(search)), [search]);
  const setQuery = useCallback((patch, opts = { replace: true }) => {
    const next = new URLSearchParams(search);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') next.delete(k);
      else next.set(k, String(v));
    });
    const s = next.toString();
    navigate(pathname + (s ? `?${s}` : ''), opts);
  }, [search, pathname]);
  return [query, setQuery];
}

function matchPath(pattern, pathname) {
  if (pattern === '*') return {};
  const keys = [];
  const re = new RegExp('^' + pattern.replace(/\/:([a-zA-Z]+)/g, (_, k) => { keys.push(k); return '/([^/]+)'; }) + '/?$');
  const m = pathname.match(re);
  if (!m) return null;
  return Object.fromEntries(keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
}

// routes: [{ path, element }]
export function Routes({ routes }) {
  const loc = useLocation();
  for (const r of routes) {
    const params = matchPath(r.path, loc.pathname);
    if (params) return <RouterCtx.Provider value={{ ...loc, params }}>{r.element}</RouterCtx.Provider>;
  }
  return null;
}

function isModified(e) {
  return e.metaKey || e.altKey || e.ctrlKey || e.shiftKey || e.button !== 0;
}

export function Link({ to, children, onClick, replace, ...rest }) {
  const handle = (e) => {
    onClick?.(e);
    if (e.defaultPrevented || isModified(e) || rest.target === '_blank') return;
    e.preventDefault();
    navigate(to, { replace });
  };
  return <a href={to} onClick={handle} {...rest}>{children}</a>;
}

export function NavLink({ to, className = '', end = false, ...rest }) {
  const { pathname } = useLocation();
  const path = to.split('?')[0];
  const active = end || path === '/' ? pathname === path : pathname === path || pathname.startsWith(path + '/');
  return <Link to={to} className={`${className} ${active ? 'active' : ''}`.trim()} aria-current={active ? 'page' : undefined} {...rest} />;
}

export function Navigate({ to, replace = true }) {
  useEffect(() => { navigate(to, { replace }); }, [to, replace]);
  return null;
}
