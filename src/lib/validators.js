// Формалар үчүн клиенттик валидация (сервер да өзүнчө текшерет).
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || '').trim());
export const isPhone = (v) => /^\+?[0-9\s\-()]{7,20}$/.test((v || '').trim());

export function check(values, schema, t) {
  const errors = {};
  for (const [k, rules] of Object.entries(schema)) {
    const v = (values[k] ?? '').toString().trim();
    for (const r of rules) {
      let err = null;
      if (r === 'required' && !v) err = t('common.required');
      else if (r === 'email' && v && !isEmail(v)) err = t('common.invalidEmail');
      else if (r === 'phone' && v && !isPhone(v)) err = t('common.invalidPhone');
      else if (typeof r === 'object' && r.min && v.length < r.min) err = t('common.min', { n: r.min });
      else if (typeof r === 'function') err = r(v, values);
      if (err) { errors[k] = err; break; }
    }
  }
  return errors;
}
