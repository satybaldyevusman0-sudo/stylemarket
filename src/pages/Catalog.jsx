import { useEffect, useState } from 'react';
import { qs } from '../lib/api.js';
import { useQuery } from '../lib/router.jsx';
import { useFetch, useDebounce, useDocumentTitle } from '../lib/hooks.js';
import { useI18n } from '../context/I18nContext.jsx';
import site from '../site.js';
import PageHeader from '../components/layout/PageHeader.jsx';
import Filters from '../components/catalog/Filters.jsx';
import ItemCard from '../components/catalog/ItemCard.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { GridSkeleton } from '../components/ui/Skeleton.jsx';
import { ErrorState, EmptyState } from '../components/ui/States.jsx';
import Icon from '../components/ui/Icon.jsx';

export default function Catalog() {
  const { t, tx } = useI18n();
  useDocumentTitle(tx(site.text.catalog));
  const [query, setQuery] = useQuery();
  const [text, setText] = useState(query.q || '');
  const debounced = useDebounce(text);
  const min = useDebounce(query.min || '', 400);
  const max = useDebounce(query.max || '', 400);

  useEffect(() => { setText(query.q || ''); }, [query.q]);
  useEffect(() => {
    if ((query.q || '') !== debounced.trim()) setQuery({ q: debounced.trim(), page: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const { data, error, loading, reload } = useFetch(`/api/items${qs({ ...query, min, max, limit: 12 })}`);

  return (
    <>
      <PageHeader title={tx(site.text.catalog)} subtitle={tx(site.text.catalogText)}>
        <div className="searchbar searchbar--big">
          <Icon name="search" size={22} />
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={tx(site.text.search) || t('search.placeholder')} aria-label={t('search.go')} maxLength={80} />
          {text && <button className="icon-btn" onClick={() => setText('')} aria-label={t('list.reset')}><Icon name="close" size={18} /></button>}
        </div>
      </PageHeader>
      <section className="container section">
        <Filters query={query} setQuery={setQuery} />
        {data && !loading && <p className="muted result-count">{t('list.found')}: <b>{data.total}</b></p>}
        {loading ? <GridSkeleton count={8} /> : error ? <ErrorState error={error} onRetry={reload} />
          : data.items.length === 0
            ? <EmptyState action={<button className="btn btn--outline" onClick={() => { setText(''); setQuery({ category: '', min: '', max: '', q: '', page: '' }); }}>{t('list.reset')}</button>} />
            : (
              <>
                <div className="grid grid--cards">{data.items.map((x) => <ItemCard key={x.id} item={x} />)}</div>
                <Pagination page={data.page} pages={data.pages} onChange={(p) => { setQuery({ page: p > 1 ? p : '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
              </>
            )}
      </section>
    </>
  );
}
