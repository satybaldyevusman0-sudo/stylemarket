// Жалпы CRUD таблица: тизме, издөө, кошуу, өзгөртүү, өчүрүү.
import { useState } from 'react';
import { api } from '../../lib/api.js';
import { useFetch } from '../../lib/hooks.js';
import { useI18n } from '../../context/I18nContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Modal from '../ui/Modal.jsx';
import Icon from '../ui/Icon.jsx';
import { RowsSkeleton } from '../ui/Skeleton.jsx';
import { ErrorState, EmptyState } from '../ui/States.jsx';

export default function AdminCrud({ resource, columns, Form, searchKeys = ['name'], title }) {
  const { t } = useI18n();
  const { push } = useToast();
  const { data, error, loading, reload } = useFetch(`/api/admin/${resource}`);
  const [editing, setEditing] = useState(null); // null | {} (жаңы) | item
  const [q, setQ] = useState('');

  const items = (data?.items || []).filter((x) => !q || searchKeys.some((k) => JSON.stringify(x[k] ?? '').toLowerCase().includes(q.toLowerCase())));

  const save = async (body) => {
    const isNew = !editing?.id;
    const r = await api(isNew ? `/api/admin/${resource}` : `/api/admin/${resource}/${encodeURIComponent(editing.id)}`, { method: isNew ? 'POST' : 'PUT', body });
    push(t('adm.saved'));
    setEditing(null);
    reload();
    return r;
  };

  const del = async (item) => {
    if (!window.confirm(`${t('common.confirmDelete')}\n${item.name || item.id}`)) return;
    try {
      await api(`/api/admin/${resource}/${encodeURIComponent(item.id)}`, { method: 'DELETE' });
      push(t('adm.deleted'));
      reload();
    } catch (e) { push(e.message, 'error'); }
  };

  return (
    <div className="stack">
      <div className="admin-toolbar">
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('adm.searchPh')} aria-label={t('adm.searchPh')} />
        <button className="btn btn--primary" onClick={() => setEditing({})}><Icon name="plus" size={18} /> {t('common.add')}</button>
      </div>
      {loading ? <RowsSkeleton /> : error ? <ErrorState error={error} onRetry={reload} /> : items.length === 0 ? <EmptyState /> : (
        <div className="table-wrap card">
          <table className="table">
            <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}<th /></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  {columns.map((c) => <td key={c.key} data-label={c.label}>{c.render ? c.render(it) : String(it[c.key] ?? '—')}</td>)}
                  <td className="table__actions">
                    <button className="icon-btn" onClick={() => setEditing(it)} aria-label={t('common.edit')} title={t('common.edit')}><Icon name="edit" size={18} /></button>
                    <button className="icon-btn icon-btn--danger" onClick={() => del(it)} aria-label={t('common.delete')} title={t('common.delete')}><Icon name="trash" size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={!!editing} title={`${editing?.id ? t('common.edit') : t('adm.new')} — ${title}`} onClose={() => setEditing(null)} wide>
        {editing && <Form initial={editing} onSubmit={save} onCancel={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}
