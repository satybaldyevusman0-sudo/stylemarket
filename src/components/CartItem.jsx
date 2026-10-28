import { useI18n } from '../context/I18nContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { fmtMoney } from '../lib/format.js';
import ItemImage from './catalog/ItemImage.jsx';
import Icon from './ui/Icon.jsx';

export default function CartItem({ item }) {
  const { t, tx } = useI18n();
  const { setQty, remove } = useCart();
  return (
    <li className="cart-item">
      <ItemImage src={item.image} alt="" className="cart-item__img" icon={item.icon} />
      <div className="cart-item__info">
        <b>{tx(item.title)}</b>
        <small className="muted">{fmtMoney(item.price, item.currency, t)}</small>
      </div>
      <div className="qty" aria-label={t('cart.qty')}>
        <button onClick={() => setQty(item.key, item.qty - 1)} disabled={item.qty <= 1} aria-label="-">−</button>
        <span>{item.qty}</span>
        <button onClick={() => setQty(item.key, item.qty + 1)} disabled={item.qty >= 20} aria-label="+">+</button>
      </div>
      <b className="cart-item__sum">{fmtMoney(item.price * item.qty, item.currency, t)}</b>
      <button className="icon-btn" onClick={() => remove(item.key)} aria-label={t('cart.remove')} title={t('cart.remove')}><Icon name="trash" size={18} /></button>
    </li>
  );
}
