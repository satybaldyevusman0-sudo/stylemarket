// Администратор панели: /admin/:tab (бардык укуктар серверде текшерилет)
import { Link, useParams } from '../lib/router.jsx';
import { useDocumentTitle } from '../lib/hooks.js';
import { fmtMoney } from '../lib/format.js';
import { useI18n } from '../context/I18nContext.jsx';
import site from '../site.js';
import AdminDashboard from '../components/admin/AdminDashboard.jsx';
import AdminCrud from '../components/admin/AdminCrud.jsx';
import ItemForm from '../components/admin/ItemForm.jsx';
import PlanForm from '../components/admin/PlanForm.jsx';
import ItemImage from '../components/catalog/ItemImage.jsx';
import { OrdersAdmin, BookingsAdmin, MessagesAdmin, ReviewsAdmin, UsersAdmin } from '../components/admin/AdminLists.jsx';
import ErrorBoundary from '../components/ui/ErrorBoundary.jsx';

const TABS = [
  ['dashboard', 'adm.dashboard', '📊'], ['items', 'adm.items', '📦'], ['plans', 'adm.plans', '💎'], ['orders', 'adm.orders', '🧾'],
  ['bookings', 'adm.bookings', '📅'], ['messages', 'adm.messages', '✉️'], ['reviews', 'adm.reviews', '⭐'], ['users', 'adm.users', '👥']
];

export default function Admin() {
  const { tab = 'dashboard' } = useParams();
  const { t, tx } = useI18n();
  useDocumentTitle(t('adm.panel'));
  const current = TABS.find((x) => x[0] === tab) ? tab : 'dashboard';
  const catName = (id) => { const c = site.categories.find((x) => x.id === id); return c ? `${c.icon} ${tx(c.name)}` : id; };

  const content = {
    dashboard: <AdminDashboard />,
    items: (
      <AdminCrud resource="items" title={t('adm.items')} Form={ItemForm} searchKeys={['title', 'brand', 'category']}
        columns={[
          { key: 'image', label: '', render: (x) => <ItemImage src={x.image} alt="" className="thumb" /> },
          { key: 'title', label: t('adm.title'), render: (x) => <Link to={`/catalog/${x.id}`}>{tx(x.title)}</Link> },
          { key: 'category', label: t('filter.category'), render: (x) => catName(x.category) },
          { key: 'price', label: t('adm.price'), render: (x) => (x.price ? fmtMoney(x.price, x.currency || site.currency, t) : '—') },
          { key: 'stock', label: t('adm.stock'), render: (x) => (x.stock ?? '—') }
        ]} />
    ),
    plans: (
      <AdminCrud resource="plans" title={t('adm.plans')} Form={PlanForm} searchKeys={['title']}
        columns={[
          { key: 'icon', label: '' },
          { key: 'title', label: t('adm.title'), render: (p) => tx(p.title) },
          { key: 'price', label: t('adm.price'), render: (p) => fmtMoney(p.price, p.currency || site.currency, t) },
          { key: 'popular', label: t('adm.popular'), render: (p) => (p.popular ? '★' : '—') }
        ]} />
    ),
    orders: <OrdersAdmin />, bookings: <BookingsAdmin />, messages: <MessagesAdmin />, reviews: <ReviewsAdmin />, users: <UsersAdmin />
  };

  return (
    <section className="container section admin">
      <h1>🛡️ {t('adm.panel')} — {site.name}</h1>
      <nav className="admin-tabs" aria-label={t('adm.panel')}>
        {TABS.map(([k, label, icon]) => (
          <Link key={k} to={`/admin/${k}`} className={k === current ? 'active' : ''} aria-current={k === current ? 'page' : undefined}>{icon} {t(label)}</Link>
        ))}
      </nav>
      <ErrorBoundary resetKey={current}>{content[current]}</ErrorBoundary>
    </section>
  );
}
