// Заказдар, броньдор, каттар, пикирлер жана колдонуучулар (статус өзгөртүү/өчүрүү).
import { useState } from 'react';
import { api } from '../../lib/api.js';
import { useFetch } from '../../lib/hooks.js';
import { fmtDate, fmtMoney } from '../../lib/format.js';
import { useI18n } from '../../context/I18nContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { RowsSkeleton } from '../ui/Skeleton.jsx';
import { ErrorState, EmptyState } from '../ui/States.jsx';
import Pagination from '../ui/Pagination.jsx';
import Icon from '../ui/Icon.jsx';
import site from '../../site.js';

function formatLabel(id) {
  const f = (site.booking?.formats || []).find((x) => x.id === id);
  return f ? (f.label.ky || id) : id;
}

const PER = 10;

function useList(resource) {
  const f = useFetch(`/api/admin/${resource}`);
  const [page, setPage] = useState(1);
  const items = f.data?.items || [];
  const pages = Math.max(1, Math.ceil(items.length / PER));
  return { ...f, items, page: Math.min(page, pages), pages, setPage, shown: items.slice((Math.min(page, pages) - 1) * PER, Math.min(page, pages) * PER) };
}

function StatusSelect({ value, options, onChange }) {
  const { t } = useI18n();
  return (
    <select className={`status-select chip--st-${value}`} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => <option key={o} value={o}>{t(`st.${o}`)}</option>)}
    </select>
  );
}

function Shell({ list, children, head }) {
  if (list.loading) return <RowsSkeleton />;
  if (list.error) return <ErrorState error={list.error} onRetry={list.reload} />;
  if (!list.items.length) return <EmptyState />;
  return (
    <>
      <div className="table-wrap card"><table className="table"><thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>
      <Pagination page={list.page} pages={list.pages} onChange={list.setPage} />
    </>
  );
}

function usePatch(resource, list) {
  const { push } = useToast();
  const { t } = useI18n();
  return async (id, body) => {
    try { await api(`/api/admin/${resource}/${id}`, { method: 'PATCH', body }); push(t('adm.saved')); list.reload(); } catch (e) { push(e.message, 'error'); }
  };
}

export function OrdersAdmin() {
  const { t, lang } = useI18n();
  const list = useList('orders');
  const patch = usePatch('orders', list);
  return (
    <Shell list={list} head={['#', t('co.name'), t('adm.items'), t('cart.total'), t('co.payTitle'), 'Status', t('bk.date')]}>
      {list.shown.map((o) => (
        <tr key={o.id}>
          <td data-label="#">#{o.id.slice(-6)}</td>
          <td data-label={t('co.name')}>{o.customer?.name}<small className="muted block">{o.customer?.phone} · {o.customer?.email}{o.customer?.address ? ` · ${o.customer.address}` : ''}</small></td>
          <td data-label={t('adm.items')}>{o.items.map((i) => `${i.title} × ${i.qty}`).join(', ')}</td>
          <td data-label={t('cart.total')}><b>{fmtMoney(o.total, o.currency, t)}</b></td>
          <td data-label={t('co.payTitle')}><span className={`chip chip--st-${o.paymentStatus}`}>{t(`st.${o.paymentStatus}`)}</span>{o.paymentMode && <small className="muted block">{o.paymentMode}</small>}</td>
          <td data-label="Status"><StatusSelect value={o.status} options={['pending', 'confirmed', 'in_progress', 'done', 'cancelled']} onChange={(s) => patch(o.id, { status: s })} /></td>
          <td data-label={t('bk.date')}>{fmtDate(o.createdAt, lang)}</td>
        </tr>
      ))}
    </Shell>
  );
}

export function BookingsAdmin() {
  const { t, lang } = useI18n();
  const list = useList('bookings');
  const patch = usePatch('bookings', list);
  return (
    <Shell list={list} head={[t('bk.date'), t('co.name'), t('bk.format'), t('bk.topic'), 'Status']}>
      {list.shown.map((b) => (
        <tr key={b.id}>
          <td data-label={t('bk.date')}><b>{fmtDate(b.date, lang)}</b> {b.time}</td>
          <td data-label={t('co.name')}>{b.name}<small className="muted block">{b.phone} · {b.email}</small></td>
          <td data-label={t('bk.format')}>{formatLabel(b.format)}{b.itemTitle && <small className="muted block">{b.itemTitle}</small>}{b.people ? <small className="muted block">👥 {b.people}</small> : null}</td>
          <td data-label={t('bk.topic')}>{b.topic || '—'}</td>
          <td data-label="Status"><StatusSelect value={b.status} options={['pending', 'confirmed', 'done', 'cancelled']} onChange={(s) => patch(b.id, { status: s })} /></td>
        </tr>
      ))}
    </Shell>
  );
}

export function MessagesAdmin() {
  const { t, lang } = useI18n();
  const { push } = useToast();
  const list = useList('messages');
  const patch = usePatch('messages', list);
  const del = async (id) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    try { await api(`/api/admin/messages/${id}`, { method: 'DELETE' }); push(t('adm.deleted')); list.reload(); } catch (e) { push(e.message, 'error'); }
  };
  return (
    <Shell list={list} head={[t('bk.date'), 'Type', t('co.name'), t('ct.message'), 'Status', '']}>
      {list.shown.map((m) => (
        <tr key={m.id}>
          <td data-label={t('bk.date')}>{fmtDate(m.createdAt, lang)}</td>
          <td data-label="Type"><span className="tag">{m.type}</span></td>
          <td data-label={t('co.name')}>{m.name}<small className="muted block">{m.email}{m.phone ? ` · ${m.phone}` : ''}</small></td>
          <td data-label={t('ct.message')}>{m.subject && <b>{m.subject}: </b>}{m.message || '—'}</td>
          <td data-label="Status"><StatusSelect value={m.status} options={['new', 'read', 'answered']} onChange={(s) => patch(m.id, { status: s })} /></td>
          <td><button className="icon-btn icon-btn--danger" onClick={() => del(m.id)} aria-label={t('common.delete')}><Icon name="trash" size={18} /></button></td>
        </tr>
      ))}
    </Shell>
  );
}

export function ReviewsAdmin() {
  const { t, lang } = useI18n();
  const { push } = useToast();
  const list = useList('reviews');
  const del = async (id) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    try { await api(`/api/reviews/${id}`, { method: 'DELETE' }); push(t('adm.deleted')); list.reload(); } catch (e) { push(e.message, 'error'); }
  };
  return (
    <Shell list={list} head={[t('bk.date'), t('adm.items'), t('auth.name'), t('rev.rating'), t('rev.text'), '']}>
      {list.shown.map((r) => (
        <tr key={r.id}>
          <td data-label={t('bk.date')}>{fmtDate(r.createdAt, lang)}</td>
          <td data-label={t('adm.items')}>{r.itemName}</td>
          <td data-label={t('auth.name')}>{r.userName}</td>
          <td data-label={t('rev.rating')}>{'★'.repeat(r.rating)}</td>
          <td data-label={t('rev.text')}>{r.text}</td>
          <td><button className="icon-btn icon-btn--danger" onClick={() => del(r.id)} aria-label={t('common.delete')}><Icon name="trash" size={18} /></button></td>
        </tr>
      ))}
    </Shell>
  );
}

export function UsersAdmin() {
  const { t, lang } = useI18n();
  const { user: me } = useAuth();
  const { push } = useToast();
  const list = useList('users');
  const patch = usePatch('users', list);
  const del = async (id) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    try { await api(`/api/admin/users/${id}`, { method: 'DELETE' }); push(t('adm.deleted')); list.reload(); } catch (e) { push(e.message, 'error'); }
  };
  return (
    <Shell list={list} head={[t('auth.name'), t('auth.email'), t('prof.role'), 'Status', t('bk.date'), '']}>
      {list.shown.map((u) => (
        <tr key={u.id}>
          <td data-label={t('auth.name')}>{u.name} {u.id === me.id && <span className="tag">you</span>}</td>
          <td data-label={t('auth.email')}>{u.email}<small className="muted block">{u.provider}</small></td>
          <td data-label={t('prof.role')}>
            <select value={u.role} disabled={u.id === me.id} onChange={(e) => patch(u.id, { role: e.target.value, blocked: !!u.blocked })}>
              <option value="user">user</option><option value="admin">admin</option>
            </select>
          </td>
          <td data-label="Status">
            <label className="check"><input type="checkbox" checked={!!u.blocked} disabled={u.id === me.id} onChange={(e) => patch(u.id, { role: u.role, blocked: e.target.checked })} /> blocked</label>
          </td>
          <td data-label={t('bk.date')}>{fmtDate(u.createdAt, lang)}</td>
          <td>{u.id !== me.id && <button className="icon-btn icon-btn--danger" onClick={() => del(u.id)} aria-label={t('common.delete')}><Icon name="trash" size={18} /></button>}</td>
        </tr>
      ))}
    </Shell>
  );
}
