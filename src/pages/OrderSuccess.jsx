import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Link, useQuery } from '../lib/router.jsx';
import { useDocumentTitle } from '../lib/hooks.js';
import { fmtMoney } from '../lib/format.js';
import { useI18n } from '../context/I18nContext.jsx';
import { Spinner, ErrorState, Alert } from '../components/ui/States.jsx';

export default function OrderSuccess() {
  const { t } = useI18n();
  const [query] = useQuery();
  const [state, setState] = useState({ order: null, error: null, loading: true });
  useDocumentTitle(t('ok.title'));

  useEffect(() => {
    if (!query.order) { setState({ order: null, error: new Error('order?'), loading: false }); return; }
    const p = query.session_id
      ? api('/api/payments/verify', { method: 'POST', body: { orderId: query.order, sessionId: query.session_id } })
      : api(`/api/orders/${encodeURIComponent(query.order)}`);
    p.then((r) => setState({ order: r.order, error: null, loading: false }))
      .catch((e) => setState({ order: null, error: e, loading: false }));
  }, [query.order, query.session_id]);

  if (state.loading) return <div className="container section"><Spinner label={t('ok.pending')} /></div>;
  if (state.error) return <div className="container section"><ErrorState error={state.error} /></div>;
  const paid = state.order.paymentStatus === 'paid';
  return (
    <section className="container section">
      <div className="card success">
        <div className="success__icon">{paid ? '🎉' : '⏳'}</div>
        <h1>{paid ? t('ok.title') : t('ok.pending')}</h1>
        {paid && <p>{t('ok.text')}</p>}
        <p>{t('ok.number')}: <b>#{state.order.id.slice(-6)}</b> · {fmtMoney(state.order.total, state.order.currency, t)}</p>
        {state.order.paymentMode === 'demo' && <Alert type="info">DEMO · •••• {state.order.cardLast4}</Alert>}
        <div className="row center">
          <Link className="btn btn--primary" to="/profile">{t('ok.toProfile')}</Link>
          <Link className="btn btn--ghost" to="/">{t('common.home')}</Link>
        </div>
      </div>
    </section>
  );
}
