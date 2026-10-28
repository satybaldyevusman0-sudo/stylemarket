import { useI18n } from '../../context/I18nContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import site from '../../site.js';
import Icon from '../ui/Icon.jsx';

export default function AddToCartButton({ item, kind = 'item', block = false, big = false }) {
  const { t, tx } = useI18n();
  const { add } = useCart();
  const { push } = useToast();
  if (item.buyable === false || !item.price) return null;
  const out = item.stock === 0;
  return (
    <button className={`btn btn--primary ${block ? 'btn--block' : ''} ${big ? 'btn--lg' : ''}`} disabled={out}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); add(item, kind); push(t('item.added')); }}>
      <Icon name="cart" size={18} /> {out ? t('item.outStock') : tx(site.text.buy) || t('item.addCart')}
    </button>
  );
}
