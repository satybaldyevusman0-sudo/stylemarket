import { Link } from '../../lib/router.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import site from '../../site.js';
import ItemImage, { isWikiImg } from './ItemImage.jsx';
import FavoriteButton from './FavoriteButton.jsx';
import PriceTag from './PriceTag.jsx';
import AddToCartButton from './AddToCartButton.jsx';
import RatingStars from '../ui/RatingStars.jsx';

export default function ItemCard({ item }) {
  const { t, tx } = useI18n();
  const cat = site.categories.find((c) => c.id === item.category);
  const url = `/catalog/${item.id}`;
  return (
    <article className="card item-card">
      <Link to={url} className="item-card__media" aria-label={tx(item.title)}>
        <ItemImage wiki={isWikiImg(item.image) ? undefined : item.wiki} src={item.image} alt={tx(item.title)} icon={cat?.icon} label={tx(item.title)} />
      </Link>
      <div className="item-card__fav"><FavoriteButton id={item.id} /></div>
      {item.badge && <span className="item-card__badge">{tx(item.badge)}</span>}
      <div className="item-card__body">
        <span className="item-card__cat">{cat?.icon} {tx(cat?.name)}</span>
        <h3><Link to={url}>{tx(item.title)}</Link></h3>
        {item.subtitle && <p className="item-card__sub">{tx(item.subtitle)}</p>}
        <p className="item-card__desc">{tx(item.desc)}</p>
        <div className="item-card__meta">
          <RatingStars value={item.rating || 0} size={14} /> <small className="muted">({item.reviewsCount || 0})</small>
        </div>
        <div className="item-card__foot">
          <PriceTag item={item} />
        </div>
        <div className="item-card__actions">
          <AddToCartButton item={item} block />
          <Link to={url} className="btn btn--outline btn--block">{t('item.details')}</Link>
        </div>
      </div>
    </article>
  );
}
