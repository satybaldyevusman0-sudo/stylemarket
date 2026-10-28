import { useFetch, useDocumentTitle } from '../lib/hooks.js';
import { useI18n } from '../context/I18nContext.jsx';
import site from '../site.js';
import PageHeader from '../components/layout/PageHeader.jsx';
import PriceTag from '../components/catalog/PriceTag.jsx';
import AddToCartButton from '../components/catalog/AddToCartButton.jsx';
import { GridSkeleton } from '../components/ui/Skeleton.jsx';
import { ErrorState, EmptyState } from '../components/ui/States.jsx';

export default function Plans() {
  const { t, tx } = useI18n();
  useDocumentTitle(tx(site.text.plans));
  const { data, error, loading, reload } = useFetch('/api/plans');
  return (
    <>
      <PageHeader title={tx(site.text.plans)} subtitle={tx(site.text.plansText)} />
      <section className="container section">
        {loading ? <GridSkeleton count={3} /> : error ? <ErrorState error={error} onRetry={reload} /> : data.items.length === 0 ? <EmptyState /> : (
          <div className="plans">
            {data.items.map((p) => (
              <article key={p.id} className={`card plan ${p.popular ? 'plan--popular' : ''}`}>
                {p.popular && <span className="plan__ribbon">{t('plans.popular')}</span>}
                <div className="plan__icon" aria-hidden="true">{p.icon}</div>
                <h3>{tx(p.title)}</h3>
                <PriceTag item={p} big />
                <p className="muted">{tx(p.desc)}</p>
                {p.features && <ul className="plan__list">{p.features.map((f, i) => <li key={i}>✓ {tx(f)}</li>)}</ul>}
                <AddToCartButton item={p} kind="plan" block />
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
