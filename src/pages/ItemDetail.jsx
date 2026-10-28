import { Fragment, useState } from 'react';
import { Link, useParams } from '../lib/router.jsx';
import { useFetch, useDocumentTitle } from '../lib/hooks.js';
import { useI18n } from '../context/I18nContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import site from '../site.js';
import ItemImage from '../components/catalog/ItemImage.jsx';
import ItemCard from '../components/catalog/ItemCard.jsx';
import PriceTag from '../components/catalog/PriceTag.jsx';
import FavoriteButton from '../components/catalog/FavoriteButton.jsx';
import AddToCartButton from '../components/catalog/AddToCartButton.jsx';
import ContactButtons from '../components/ContactButtons.jsx';
import ReviewSection from '../components/reviews/ReviewSection.jsx';
import RatingStars from '../components/ui/RatingStars.jsx';
import { DetailSkeleton } from '../components/ui/Skeleton.jsx';
import { ErrorState } from '../components/ui/States.jsx';

export default function ItemDetail() {
  const { id } = useParams();
  const { t, tx } = useI18n();
  const { push } = useToast();
  const { data: x, error, loading, reload } = useFetch(`/api/items/${encodeURIComponent(id)}`);
  const [active, setActive] = useState(0);
  useDocumentTitle(x ? tx(x.title) : null, x ? tx(x.desc) : undefined);

  if (loading) return <DetailSkeleton />;
  if (error) {
    return (
      <div className="container section">
        <ErrorState error={error} onRetry={error.status === 404 ? undefined : reload} />
        <p className="center"><Link to="/catalog" className="btn btn--ghost">{t('item.back')}</Link></p>
      </div>
    );
  }
  const cat = site.categories.find((c) => c.id === x.category);
  const images = [x.image, ...(x.gallery || [])].filter(Boolean);
  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); push(t('item.copied')); } catch { push(window.location.href, 'info'); }
  };

  return (
    <article className="container section detail">
      <Link to="/catalog" className="btn btn--ghost btn--sm">{t('item.back')}</Link>
      <div className="detail__top">
        <div className="gallery">
          <ItemImage src={images[active]} alt={tx(x.title)} className="gallery__main" icon={cat?.icon} eager />
          {images.length > 1 && (
            <div className="gallery__thumbs">
              {images.map((src, i) => (
                <button key={src} className={i === active ? 'active' : ''} onClick={() => setActive(i)} aria-label={`${i + 1}`}>
                  <ItemImage src={src} alt="" icon={cat?.icon} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="detail__info">
          <Link to={`/catalog?category=${x.category}`} className="chip">{cat?.icon} {tx(cat?.name)}</Link>
          <h1>{tx(x.title)}</h1>
          {x.subtitle && <p className="detail__sub">{tx(x.subtitle)}</p>}
          <a href="#reviews" className="detail__rating"><RatingStars value={x.rating} /> <b>{x.rating || '—'}</b> <small>({x.reviewsCount} {t('item.reviews')})</small></a>
          <PriceTag item={x} big />
          {x.priceNote !== false && site.priceNote && <small className="muted">ℹ️ {tx(site.priceNote)}</small>}
          {x.stock != null && <span className={`chip ${x.stock > 0 ? 'chip--ok' : 'chip--no'}`}>{x.stock > 0 ? `✓ ${t('item.inStock')}` : t('item.outStock')}</span>}
          <div className="row">
            <AddToCartButton item={x} big />
            <Link to={`/booking?item=${x.id}`} className="btn btn--outline btn--lg">{tx(site.text.bookBtn) || t('item.book')}</Link>
            <FavoriteButton id={x.id} />
            <button className="icon-btn" onClick={share} title={t('item.share')} aria-label={t('item.share')}>🔗</button>
          </div>
          {x.buyable === false && <small className="muted">{t('item.notBuyable')}</small>}
          <ContactButtons compact text={`${site.name}: ${tx(x.title)} — ${window.location.href}`} />
        </div>
      </div>

      <div className="detail-grid">
        <div className="stack-lg">
          <section className="card">
            <h2>{t('item.desc')}</h2>
            <p className="lead">{tx(x.desc)}</p>
            {x.long && <p>{tx(x.long)}</p>}
            {x.tags?.length > 0 && <div className="tags">{x.tags.map((g) => <Link key={g} className="tag" to={`/catalog?q=${encodeURIComponent(g)}`}>#{g}</Link>)}</div>}
            {x.source && <p className="small muted">{t('common.source')}: <a href={x.source} target="_blank" rel="noopener noreferrer">{x.source.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]} ↗</a></p>}
          </section>
          <ReviewSection itemId={x.id} onChange={reload} />
        </div>
        <aside>
          {x.specs?.length > 0 && (
            <div className="card sticky">
              <h2>{t('item.specs')}</h2>
              <dl className="facts">
                {x.specs.map(([k, v]) => <Fragment key={k}><dt>{tx(site.specLabels?.[k]) || k}</dt><dd>{v}</dd></Fragment>)}
              </dl>
            </div>
          )}
        </aside>
      </div>

      {x.related?.length > 0 && (
        <section>
          <h2>{t('item.related')}</h2>
          <div className="grid grid--cards">{x.related.map((r) => <ItemCard key={r.id} item={r} />)}</div>
        </section>
      )}
    </article>
  );
}
