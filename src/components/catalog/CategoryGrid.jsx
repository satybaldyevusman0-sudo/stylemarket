import { Link } from '../../lib/router.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import ItemImage from './ItemImage.jsx';

export default function CategoryGrid({ categories = [] }) {
  const { t, tx } = useI18n();
  return (
    <div className="cat-grid">
      {categories.map((c) => (
        <Link key={c.id} to={`/catalog?category=${c.id}`} className="cat-tile">
          <ItemImage src={c.image} alt={tx(c.name)} icon={c.icon} />
          <span className="cat-tile__shade" />
          <span className="cat-tile__text">
            <b>{c.icon} {tx(c.name)}</b>
            {c.count != null && <small>{c.count} {t('home.items')}</small>}
          </span>
        </Link>
      ))}
    </div>
  );
}
