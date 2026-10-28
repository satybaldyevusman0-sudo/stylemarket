import { Link } from '../lib/router.jsx';
import { useDocumentTitle } from '../lib/hooks.js';
import { fmtMoney } from '../lib/format.js';
import { useI18n } from '../context/I18nContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import CartItem from '../components/CartItem.jsx';
import { EmptyState, Alert } from '../components/ui/States.jsx';

export default function Cart() {
  const { t } = useI18n();
  const { items, totals, clear, mixed } = useCart();
  useDocumentTitle(t('cart.title'));
  return (
    <>
      <PageHeader title={t('cart.title')} />
      <section className="container section">
        {items.length === 0
          ? <EmptyState icon="🛒" title={t('cart.empty')} action={<Link className="btn btn--primary" to="/catalog">{t('cart.go')}</Link>} />
          : (
            <div className="cart-layout">
              <ul className="card cart-list">{items.map((it) => <CartItem key={it.key} item={it} />)}</ul>
              <aside className="card cart-summary">
                {mixed && <Alert type="warn">{t('cart.mixed')}</Alert>}
                {Object.entries(totals).map(([cur, sum]) => <div key={cur} className="cart-summary__row"><span>{t('cart.total')}</span><b>{fmtMoney(sum, cur, t)}</b></div>)}
                {mixed ? <button className="btn btn--primary btn--block btn--lg" disabled>{t('cart.checkout')}</button>
                  : <Link to="/checkout" className="btn btn--primary btn--block btn--lg">{t('cart.checkout')} →</Link>}
                <button className="btn btn--ghost btn--block" onClick={clear}>{t('cart.clear')}</button>
              </aside>
            </div>
          )}
      </section>
    </>
  );
}
