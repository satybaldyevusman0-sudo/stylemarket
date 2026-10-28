import { useState } from 'react';
import { navigate } from '../../lib/router.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import Icon from '../ui/Icon.jsx';
import site from '../../site.js';

export default function SearchBar({ big = false, onDone }) {
  const { t, tx } = useI18n();
  const [q, setQ] = useState('');
  const submit = (e) => {
    e.preventDefault();
    navigate(`/catalog${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
    onDone?.();
  };
  return (
    <form className={`searchbar ${big ? 'searchbar--big' : ''}`} onSubmit={submit} role="search">
      <Icon name="search" size={big ? 22 : 18} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tx(site.text.search) || t('search.placeholder')} aria-label={t('search.go')} maxLength={80} />
      {big && <button className="btn btn--primary" type="submit">{t('search.go')}</button>}
    </form>
  );
}
