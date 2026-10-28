import { useState } from 'react';
import { api } from '../lib/api.js';
import { Link } from '../lib/router.jsx';
import { useFetch, useDocumentTitle } from '../lib/hooks.js';
import { fmtDate, fmtMoney } from '../lib/format.js';
import { useI18n } from '../context/I18nContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import site from '../site.js';
import PageHeader from '../components/layout/PageHeader.jsx';
import FormField from '../components/ui/FormField.jsx';
import { RowsSkeleton } from '../components/ui/Skeleton.jsx';
import { ErrorState, EmptyState } from '../components/ui/States.jsx';

export default function Profile() {
  const { t, lang } = useI18n();
  const { user, setUser } = useAuth();
  const { push } = useToast();
  useDocumentTitle(t('prof.title'));
  const [name, setName] = useState(user.name);
  const [err, setErr] = useState(null);
  const orders = useFetch('/api/orders/my');
  const bookings = useFetch('/api/bookings/my');

  const save = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) return setErr(t('common.min', { n: 2 }));
    try {
      const r = await api('/api/auth/me', { method: 'PUT', body: { name } });
      setUser(r.user); setErr(null); push(t('prof.saved'));
    } catch (e2) { setErr(e2.details?.name || e2.message); }
  };

  const cancel = async (id) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    try { await api(`/api/bookings/${id}/cancel`, { method: 'PATCH', body: {} }); bookings.reload(); } catch (e) { push(e.message, 'error'); }
  };

  return (
    <>
      <PageHeader title={t('prof.title')} subtitle={user.email} />
      <section className="container section profile-grid">
        <form className="card form" onSubmit={save}>
          <div className="profile-head">
            {user.avatar ? <img src={user.avatar} alt="" className="avatar avatar--lg" /> : <span className="avatar avatar--lg">{user.name[0]?.toUpperCase()}</span>}
            <div><b>{user.name}</b><small className="muted block">{t('prof.role')}: {user.role} · {user.provider}</small></div>
          </div>
          <FormField label={t('auth.name')} name="p-name" value={name} onChange={(e) => setName(e.target.value)} error={err} />
          <button className="btn btn--primary">{t('prof.save')}</button>
        </form>

        <div className="stack-lg">
          <div className="card">
            <h2>{t('prof.orders')}</h2>
            {orders.loading ? <RowsSkeleton rows={2} /> : orders.error ? <ErrorState error={orders.error} onRetry={orders.reload} compact />
              : orders.data.items.length === 0 ? <EmptyState icon="🧾" title={t('prof.noOrders')} action={<Link className="btn btn--outline" to="/catalog">{t('cart.go')}</Link>} />
                : (
                  <ul className="list">
                    {orders.data.items.map((o) => (
                      <li key={o.id} className="list__item">
                        <div><b>#{o.id.slice(-6)}</b> · {fmtDate(o.createdAt, lang)}<small className="muted block">{o.items.map((i) => `${i.title} × ${i.qty}`).join(', ')}</small></div>
                        <div className="list__right">
                          <b>{fmtMoney(o.total, o.currency, t)}</b>
                          <span className={`chip chip--st-${o.paymentStatus}`}>{t(`st.${o.paymentStatus}`)}</span>
                          <span className={`chip chip--st-${o.status}`}>{t(`st.${o.status}`)}</span>
                          {o.paymentStatus !== 'paid' && o.status !== 'cancelled' && <Link className="btn btn--primary btn--sm" to={`/checkout?order=${o.id}`}>{t('prof.pay')}</Link>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
          </div>
          <div className="card">
            <h2>{t('prof.bookings')}</h2>
            {bookings.loading ? <RowsSkeleton rows={2} /> : bookings.error ? <ErrorState error={bookings.error} onRetry={bookings.reload} compact />
              : bookings.data.items.length === 0 ? <EmptyState icon="📅" title={t('prof.noBookings')} action={<Link className="btn btn--outline" to="/booking">{t('bk.submit')}</Link>} />
                : (
                  <ul className="list">
                    {bookings.data.items.map((b) => (
                      <li key={b.id} className="list__item">
                        <div><b>{fmtDate(b.date, lang)} · {b.time}</b><small className="muted block">{(site.booking?.formats || []).find((f) => f.id === b.format)?.label?.[lang] || b.format}{b.itemTitle ? ` · ${b.itemTitle}` : ''} {b.topic ? `· ${b.topic}` : ''}</small></div>
                        <div className="list__right">
                          <span className={`chip chip--st-${b.status}`}>{t(`st.${b.status}`)}</span>
                          {b.status === 'pending' && <button className="btn btn--ghost btn--sm" onClick={() => cancel(b.id)}>{t('prof.cancel')}</button>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
          </div>
        </div>
      </section>
    </>
  );
}
