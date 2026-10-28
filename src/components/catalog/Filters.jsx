import { useI18n } from '../../context/I18nContext.jsx';
import site from '../../site.js';

export default function Filters({ query, setQuery }) {
  const { t, tx } = useI18n();
  const active = ['category', 'min', 'max', 'q'].some((k) => query[k]);
  return (
    <div className="filters" aria-label={t('filter.title')}>
      <div className="chips-row" role="group" aria-label={t('filter.category')}>
        <button className={`chip-btn ${!query.category ? 'active' : ''}`} onClick={() => setQuery({ category: '', page: '' })}>{t('cat.all')}</button>
        {site.categories.map((c) => (
          <button key={c.id} className={`chip-btn ${query.category === c.id ? 'active' : ''}`} onClick={() => setQuery({ category: c.id, page: '' })}>{c.icon} {tx(c.name)}</button>
        ))}
      </div>
      <div className="filters__row">
        <label className="filter"><span>{t('filter.min')}</span>
          <input type="number" min="0" inputMode="numeric" value={query.min || ''} onChange={(e) => setQuery({ min: e.target.value, page: '' })} placeholder="0" />
        </label>
        <label className="filter"><span>{t('filter.max')}</span>
          <input type="number" min="0" inputMode="numeric" value={query.max || ''} onChange={(e) => setQuery({ max: e.target.value, page: '' })} placeholder="∞" />
        </label>
        <label className="filter"><span>{t('filter.sort')}</span>
          <select value={query.sort || 'popular'} onChange={(e) => setQuery({ sort: e.target.value === 'popular' ? '' : e.target.value, page: '' })}>
            {['popular', 'price_asc', 'price_desc', 'rating', 'new', 'name'].map((s) => <option key={s} value={s}>{t(`sort.${s}`)}</option>)}
          </select>
        </label>
        {active && <button className="btn btn--ghost filters__reset" onClick={() => setQuery({ category: '', min: '', max: '', q: '', page: '' })}>✕ {t('list.reset')}</button>}
      </div>
    </div>
  );
}
