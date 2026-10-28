// Жөнөкөй валидация: ар бир талаа үчүн эреже, ката болсо 422 кайтарат.
import { HttpError } from './http.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9\s\-()]{7,20}$/;
const URL_RE = /^https?:\/\/[^\s]+$/i;

export const rules = {
  str: (min = 1, max = 500) => (v) => {
    if (typeof v !== 'string') return 'Текст болушу керек';
    const t = v.trim();
    if (t.length < min) return min === 1 ? 'Бул талаа милдеттүү' : `Кеминде ${min} белги`;
    if (t.length > max) return `Эң көп ${max} белги`;
    return null;
  },
  optStr: (max = 500) => (v) => (v === undefined || v === null || v === '' ? null : rules.str(0, max)(v)),
  email: () => (v) => (typeof v === 'string' && EMAIL.test(v.trim()) ? null : 'Email туура эмес'),
  phone: () => (v) => (typeof v === 'string' && PHONE.test(v.trim()) ? null : 'Телефон номери туура эмес'),
  optUrl: () => (v) => (!v ? null : typeof v === 'string' && URL_RE.test(v) ? null : 'Шилтеме http(s):// менен башталышы керек'),
  int: (min, max) => (v) => (Number.isInteger(v) && v >= min && v <= max ? null : `${min}–${max} аралыгындагы бүтүн сан`),
  optNum: (min = 0, max = 1e9) => (v) => (v === null || v === undefined || v === '' ? null : typeof v === 'number' && v >= min && v <= max ? null : 'Сан туура эмес'),
  oneOf: (list) => (v) => (list.includes(v) ? null : `Уруксат берилген маанилер: ${list.join(', ')}`),
  date: () => (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v)) ? null : 'Дата туура эмес (ЖЖЖЖ-АА-КК)'),
  arr: (itemRule, max = 50) => (v) => {
    if (!Array.isArray(v)) return 'Тизме болушу керек';
    if (v.length > max) return `Эң көп ${max} элемент`;
    for (const x of v) { const e = itemRule(x); if (e) return e; }
    return null;
  },
  password: () => (v) => {
    if (typeof v !== 'string' || v.length < 8) return 'Сырсөз кеминде 8 белги';
    if (!/[A-Za-z]/.test(v) || !/[0-9]/.test(v)) return 'Сырсөздө тамга жана сан болушу керек';
    if (v.length > 128) return 'Сырсөз өтө узун';
    return null;
  }
};

export function validate(body, schema) {
  const errors = {};
  for (const [key, rule] of Object.entries(schema)) {
    const err = rule(body?.[key]);
    if (err) errors[key] = err;
  }
  if (Object.keys(errors).length) throw new HttpError(422, 'Форманы текшериңиз', errors);
  const out = {};
  for (const key of Object.keys(schema)) {
    const v = body[key];
    out[key] = typeof v === 'string' ? v.trim() : v;
  }
  return out;
}
