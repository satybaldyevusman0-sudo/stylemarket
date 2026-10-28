import { useI18n } from '../../context/I18nContext.jsx';
import { fmtMoney } from '../../lib/format.js';
import site from '../../site.js';

export default function PriceTag({ item, big = false }) {
  const { t, tx } = useI18n();
  const cur = item.currency || site.currency;
  if (!item.price) return <span className="price">{tx(item.priceLabel) || '—'}</span>;
  return (
    <span className={`price ${big ? 'price--big' : ''}`}>
      {item.priceFrom && <small>{tx({ ky: 'баштап ', ru: 'от ', en: 'from ' })}</small>}
      {fmtMoney(item.price, cur, t)}
      {item.priceSuffix && <small> {tx(item.priceSuffix)}</small>}
      {item.oldPrice ? <s className="price__old">{fmtMoney(item.oldPrice, cur, t)}</s> : null}
    </span>
  );
}
