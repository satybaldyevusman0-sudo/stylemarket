import { useFetch } from '../../lib/hooks.js';
import { fmtMoney } from '../../lib/format.js';
import site from '../../site.js';
import { useI18n } from '../../context/I18nContext.jsx';
import { ActivityChart, RevenueChart, PieBlock, HBarChart } from './AdminCharts.jsx';
import { RowsSkeleton } from '../ui/Skeleton.jsx';
import { ErrorState, Alert } from '../ui/States.jsx';

export default function AdminDashboard() {
  const { t } = useI18n();
  // "Realtime": ар 15 секундда жаңыртылат (Vercel serverless'те WebSocket туруктуу иштебейт)
  const { data, error, loading, reload } = useFetch('/api/admin/stats', { interval: 15000 });
  if (loading) return <RowsSkeleton rows={6} />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const T = data.totals;
  const kpis = [
    ['👥', T.users, t('adm.users')], ['📦', T.items, t('adm.items')], ['🧾', T.orders, t('adm.orders')],
    ['💳', fmtMoney(T.revenue, site.currency, t), t('adm.revenue')], ['📅', T.bookings, t('adm.bookings')], ['✉️', T.newMessages, t('adm.messages')], ['⭐', T.reviews, t('adm.reviews')]
  ];
  return (
    <div className="stack-lg">
      {data.storage.warning && <Alert type="warn">{data.storage.warning}</Alert>}
      <p className="muted small live"><span className="live__dot" /> {t('adm.live')} · {new Date(data.generatedAt).toLocaleTimeString()}</p>
      <div className="kpis">
        {kpis.map(([i, v, l]) => <div key={l} className="card kpi"><span className="kpi__icon">{i}</span><b>{v}</b><small>{l}</small></div>)}
      </div>
      <div className="grid grid--2">
        <div className="card"><h3>{t('adm.ordersByDay')}</h3><ActivityChart data={data.days} /></div>
        <div className="card"><h3>{t('adm.revenue')} </h3><RevenueChart data={data.days} /></div>
        <div className="card"><h3>{t('adm.byCat')}</h3><PieBlock data={data.byCity} /></div>
        <div className="card"><h3>{t('adm.orderStatus')}</h3><PieBlock data={data.orderStatus} nameMap={(n) => t(`st.${n}`)} /></div>
        <div className="card"><h3>{t('adm.topFav')}</h3><HBarChart data={data.topFav} /></div>
        <div className="card">
          <h3>{t('adm.integrations')}</h3>
          <ul className="integrations">
            {Object.entries(data.integrations).map(([k, on]) => (
              <li key={k}><span>{k}</span><span className={`chip ${on ? 'chip--verified' : 'chip--muted'}`}>{on ? `✓ ${t('adm.connected')}` : t('adm.notConnected')}</span></li>
            ))}
            <li><span>storage</span><span className={`chip ${data.storage.persistent ? 'chip--verified' : 'chip--unverified'}`}>{data.storage.driver}</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
