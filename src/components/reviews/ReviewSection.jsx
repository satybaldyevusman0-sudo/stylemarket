import { api } from '../../lib/api.js';
import { useFetch } from '../../lib/hooks.js';
import { fmtDate } from '../../lib/format.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import RatingStars from '../ui/RatingStars.jsx';
import { RowsSkeleton } from '../ui/Skeleton.jsx';
import { ErrorState, EmptyState } from '../ui/States.jsx';
import ReviewForm from './ReviewForm.jsx';

export default function ReviewSection({ itemId, onChange }) {
  const { user, isAdmin } = useAuth();
  const { t, lang } = useI18n();
  const { push } = useToast();
  const { data, error, loading, reload } = useFetch(`/api/reviews?itemId=${encodeURIComponent(itemId)}`);
  const items = data?.items || [];
  const mine = user && items.find((r) => r.userId === user.id);
  const avg = items.length ? items.reduce((s, r) => s + r.rating, 0) / items.length : 0;

  const del = async (id) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    try {
      await api(`/api/reviews/${id}`, { method: 'DELETE' });
      push(t('rev.deleted'));
      reload(); onChange?.();
    } catch (e) { push(e.message, 'error'); }
  };

  return (
    <section className="reviews" id="reviews">
      <div className="reviews__head">
        <h2>{t('rev.title')}</h2>
        {items.length > 0 && <div className="reviews__avg"><b>{avg.toFixed(1)}</b><RatingStars value={avg} /><small>{items.length} {t('item.reviews')}</small></div>}
      </div>
      <ReviewForm key={mine?.id || 'new'} itemId={itemId} existing={mine} onSaved={() => { reload(); onChange?.(); }} />
      {loading ? <RowsSkeleton rows={3} /> : error ? <ErrorState error={error} onRetry={reload} compact /> : items.length === 0
        ? <EmptyState icon="💬" title={t('rev.empty')} />
        : (
          <ul className="reviews__list">
            {items.map((r) => (
              <li key={r.id} className="review">
                <div className="review__head">
                  <span className="avatar">{r.userName[0]?.toUpperCase()}</span>
                  <div><b>{r.userName}</b><small className="muted">{fmtDate(r.updatedAt || r.createdAt, lang)}</small></div>
                  <RatingStars value={r.rating} size={15} />
                </div>
                <p>{r.text}</p>
                {(isAdmin || r.userId === user?.id) && <button className="btn btn--ghost btn--sm" onClick={() => del(r.id)}>{t('rev.delete')}</button>}
              </li>
            ))}
          </ul>
        )}
    </section>
  );
}
