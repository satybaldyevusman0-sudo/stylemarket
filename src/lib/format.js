export const fmtNum = (n) => (typeof n === 'number' ? n.toLocaleString('ru-RU').replace(/ /g, ' ') : '');
export const fmtEur = (n) => (typeof n === 'number' ? `€${n.toLocaleString('en-US')}` : '');
export const fmtSom = (n, t) => `${fmtNum(n)} ${t('common.som')}`;
export const fmtMoney = (n, cur, t) => (cur === 'USD' ? `$${fmtNum(n)}` : fmtSom(n, t));

export function fmtDate(iso, lang = 'ky') {
  if (!iso) return '';
  const d = new Date(iso.length === 10 ? iso + 'T00:00:00' : iso);
  const locale = lang === 'en' ? 'en-GB' : 'ru-RU';
  return d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const initials = (name = '') => name.split(/\s+/).filter((w) => /^[A-ZÀ-Ý]/.test(w)).slice(0, 2).map((w) => w[0]).join('') || name.slice(0, 2).toUpperCase();
