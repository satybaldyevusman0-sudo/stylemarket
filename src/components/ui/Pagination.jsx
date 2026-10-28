import { useI18n } from '../../context/I18nContext.jsx';

export default function Pagination({ page, pages, onChange }) {
  const { t } = useI18n();
  if (pages <= 1) return null;
  const nums = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== '…') nums.push('…');
  }
  return (
    <nav className="pagination" aria-label="pagination">
      <button className="btn btn--ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>‹ {t('common.prev')}</button>
      {nums.map((n, i) => n === '…'
        ? <span key={`d${i}`} className="pagination__dots">…</span>
        : <button key={n} className={`pagination__num ${n === page ? 'active' : ''}`} aria-current={n === page ? 'page' : undefined} onClick={() => onChange(n)}>{n}</button>)}
      <button className="btn btn--ghost" disabled={page >= pages} onClick={() => onChange(page + 1)}>{t('common.next')} ›</button>
    </nav>
  );
}
