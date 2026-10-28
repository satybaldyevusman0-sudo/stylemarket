// Заказды тариздөө: 1) байланыш маалыматы → заказ түзүү, 2) төлөм (Stripe же DEMO).
import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Link, navigate, useQuery } from '../lib/router.jsx';
import { useDocumentTitle } from '../lib/hooks.js';
import { check } from '../lib/validators.js';
import { fmtMoney } from '../lib/format.js';
import { useI18n } from '../context/I18nContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import FormField from '../components/ui/FormField.jsx';
import { Alert, EmptyState, Spinner, errorText } from '../components/ui/States.jsx';

function PaymentStep({ order }) {
  const { t } = useI18n();
  const [mode, setMode] = useState(null);
  const [card, setCard] = useState({ card: '', exp: '', cvc: '' });
  const [errors, setErrors] = useState({});

  const [state, setState] = useState({ busy: false, error: null });

  useEffect(() => {
    api('/api/payments/checkout', { method: 'POST', body: { orderId: order.id } })
      .then((r) => {
        if (r.mode === 'stripe') window.location.href = r.url;
        else setMode('demo');
      })
      .catch((e) => setState({ busy: false, error: e }));
  }, [order.id]);

  const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExp = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };

  const pay = async (e) => {
    e.preventDefault();
    const errs = check(card, { card: ['required', { min: 19 }], exp: ['required', { min: 5 }], cvc: ['required', { min: 3 }] }, t);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState({ busy: true, error: null });
    try {
      await api('/api/payments/demo', { method: 'POST', body: { orderId: order.id, ...card } });
      navigate(`/order/success?order=${order.id}`, { replace: true });
    } catch (err) {
      setErrors(err.details || {});
      setState({ busy: false, error: err });
    }
  };

  if (state.error && !mode) return <Alert type="error">{errorText(state.error, t)}</Alert>;
  if (!mode) return <div className="card"><Spinner /><p className="center muted">{t('co.stripeNote')}</p></div>;
  return (
    <form className="card form" onSubmit={pay} noValidate>
      <h2>{t('co.payTitle')} — {fmtMoney(order.total, order.currency, t)}</h2>
      <Alert type="info">{t('co.demoNote')}</Alert>
      {state.error && <Alert type="error">{errorText(state.error, t)}</Alert>}
      <FormField label={t('co.card')} name="card" inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242"
        value={card.card} onChange={(e) => setCard({ ...card, card: fmtCard(e.target.value) })} error={errors.card} />
      <div className="form__row">
        <FormField label={t('co.exp')} name="exp" inputMode="numeric" autoComplete="cc-exp" placeholder="12/28" value={card.exp} onChange={(e) => setCard({ ...card, exp: fmtExp(e.target.value) })} error={errors.exp} />
        <FormField label={t('co.cvc')} name="cvc" inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} error={errors.cvc} />
      </div>
      <button className="btn btn--primary btn--lg btn--block" disabled={state.busy}>{state.busy ? t('common.loading') : `${t('co.pay')} ${fmtMoney(order.total, order.currency, t)}`}</button>
    </form>
  );
}

export default function Checkout() {
  const { t, tx } = useI18n();
  const { user } = useAuth();
  const { items, totals, clear, mixed } = useCart();
  const { push } = useToast();
  const [query] = useQuery();
  useDocumentTitle(t('co.title'));
  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(!!query.order);
  const [v, setV] = useState({ name: user?.name || '', phone: '+996 ', email: user?.email || '', address: '', note: '' });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ busy: false, error: null });
  const on = (k) => (e) => setV({ ...v, [k]: e.target.value });
  // Колдонуучу кийинчерээк жүктөлсө — аты жана email автоматтык толтурулат
  useEffect(() => { if (user) setV((x) => ({ ...x, name: x.name || user.name, email: x.email || user.email })); }, [user]);

  // Профилден төлөнбөгөн заказды улантуу: /checkout?order=ID
  useEffect(() => {
    if (!query.order) return;
    api(`/api/orders/${encodeURIComponent(query.order)}`)
      .then((r) => { if (r.order.paymentStatus === 'paid') navigate(`/order/success?order=${r.order.id}`, { replace: true }); else setOrder(r.order); })
      .catch((e) => setState({ busy: false, error: e }))
      .finally(() => setLoadingOrder(false));
  }, [query.order]);

  const place = async (e) => {
    e.preventDefault();
    const errs = check(v, { name: ['required', { min: 2 }], phone: ['required', 'phone'], email: ['required', 'email'] }, t);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState({ busy: true, error: null });
    try {
      const r = await api('/api/orders', { method: 'POST', body: { ...v, items: items.map((i) => ({ kind: i.kind, id: i.id, qty: i.qty })) } });
      setOrder(r.order);
      clear();
      push(t('co.created'));
      navigate(`/checkout?order=${r.order.id}`, { replace: true });
    } catch (err) {
      setErrors(err.details || {});
      setState({ busy: false, error: err });
    }
  };

  if (loadingOrder) return <Spinner />;

  return (
    <>
      <PageHeader title={t('co.title')} />
      <section className="container section">
        {query.cancelled && <Alert type="warn">{t('co.cancelled')}</Alert>}
        {order ? (
          <div className="cart-layout">
            <PaymentStep order={order} />
            <aside className="card cart-summary">
              <h3>#{order.id.slice(-6)}</h3>
              <ul className="summary-list">{order.items.map((i) => <li key={i.kind + i.id}><span>{i.title} × {i.qty}</span><b>{fmtMoney(i.price * i.qty, i.currency, t)}</b></li>)}</ul>
              <div className="cart-summary__row"><span>{t('cart.total')}</span><b>{fmtMoney(order.total, order.currency, t)}</b></div>
            </aside>
          </div>
        ) : items.length === 0 ? (
          <>
            {state.error && <Alert type="error">{errorText(state.error, t)}</Alert>}
            <EmptyState icon="🛒" title={t('cart.empty')} action={<Link className="btn btn--primary" to="/catalog">{t('cart.go')}</Link>} />
          </>
        ) : (
          <div className="cart-layout">
            <form className="card form" onSubmit={place} noValidate>
              <h2>{t('co.contacts')}</h2>
              {state.error && <Alert type="error">{errorText(state.error, t)}</Alert>}
              <div className="form__row">
                <FormField label={t('co.name')} name="o-name" value={v.name} onChange={on('name')} error={errors.name} autoComplete="name" />
                <FormField label={t('co.phone')} name="o-phone" type="tel" value={v.phone} onChange={on('phone')} error={errors.phone} autoComplete="tel" />
              </div>
              <FormField label={t('co.email')} name="o-email" type="email" value={v.email} onChange={on('email')} error={errors.email} autoComplete="email" />
              <FormField label={t('co.address')} name="o-address" value={v.address} onChange={on('address')} error={errors.address} autoComplete="street-address" maxLength={300} />
              <FormField label={t('co.note')} name="o-note" as="textarea" rows={3} value={v.note} onChange={on('note')} error={errors.note} maxLength={1000} />
              {mixed && <Alert type="warn">{t('cart.mixed')}</Alert>}
              <button className="btn btn--primary btn--lg" disabled={state.busy || mixed}>{state.busy ? t('common.loading') : t('co.place')}</button>
            </form>
            <aside className="card cart-summary">
              <ul className="summary-list">{items.map((i) => <li key={i.key}><span>{tx(i.title)} × {i.qty}</span><b>{fmtMoney(i.price * i.qty, i.currency, t)}</b></li>)}</ul>
              {Object.entries(totals).map(([cur, sum]) => <div key={cur} className="cart-summary__row"><span>{t('cart.total')}</span><b>{fmtMoney(sum, cur, t)}</b></div>)}
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
