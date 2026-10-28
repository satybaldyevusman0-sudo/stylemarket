import { Link } from '../lib/router.jsx';
import { useFetch, useDocumentTitle } from '../lib/hooks.js';
import { useI18n } from '../context/I18nContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import ItemCard from '../components/catalog/ItemCard.jsx';
import { GridSkeleton } from '../components/ui/Skeleton.jsx';
import { ErrorState, EmptyState } from '../components/ui/States.jsx';

export default function Favorites() {
  const { t } = useI18n();
  const { ids } = useFavorites();
  useDocumentTitle(t('fav.title'));
  // ids өзгөргөндө тизме кайра жүктөлөт
  const { data, error, loading, reload } = useFetch(`/api/favorites?v=${ids.length}`);
  const items = (data?.items || []).filter((u) => ids.includes(u.id));
  return (
    <>
      <PageHeader title={t('fav.title')} />
      <section className="container section">
        {loading ? <GridSkeleton count={3} /> : error ? <ErrorState error={error} onRetry={reload} />
          : items.length === 0
            ? <EmptyState icon="💚" title={t('fav.empty')} action={<Link className="btn btn--primary" to="/catalog">{t('cart.go')}</Link>} />
            : <div className="grid grid--cards">{items.map((u) => <ItemCard key={u.id} item={u} />)}</div>}
      </section>
    </>
  );
}
