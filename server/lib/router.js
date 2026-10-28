// Кичинекей роутер: "/api/universities/:id" сыяктуу жолдорду колдойт.
export function createRouter() {
  const routes = [];
  const add = (method) => (path, ...handlers) => {
    const keys = [];
    const pattern = new RegExp(
      '^' + path.replace(/\/:([a-zA-Z]+)/g, (_, k) => { keys.push(k); return '/([^/]+)'; }) + '/?$'
    );
    routes.push({ method, pattern, keys, handlers });
  };
  return {
    get: add('GET'), post: add('POST'), put: add('PUT'), patch: add('PATCH'), delete: add('DELETE'),
    match(method, pathname) {
      let pathMatched = false;
      for (const r of routes) {
        const m = pathname.match(r.pattern);
        if (!m) continue;
        pathMatched = true;
        if (r.method !== method) continue;
        const params = {};
        r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
        return { handlers: r.handlers, params };
      }
      return pathMatched ? { methodNotAllowed: true } : null;
    }
  };
}
