import { useState } from 'react';
import { api } from '../../lib/api.js';
import { Link } from '../../lib/router.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import RatingStars from '../ui/RatingStars.jsx';
import FormField from '../ui/FormField.jsx';

export default function ReviewForm({ itemId, existing, onSaved }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const { push } = useToast();
  const [rating, setRating] = useState(existing?.rating || 0);
  const [text, setText] = useState(existing?.text || '');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (!user) return <p className="muted">{t('rev.login')} <Link to={`/login?next=/catalog/${itemId}`}>{t('nav.login')} →</Link></p>;

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!rating) errs.rating = t('common.required');
    if (text.trim().length < 5) errs.text = t('common.min', { n: 5 });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const r = await api('/api/reviews', { method: 'POST', body: { itemId, rating, text } });
      push(t('rev.saved'));
      onSaved?.(r.item);
    } catch (err) {
      setErrors(err.details || {});
      push(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="review-form card" onSubmit={submit} noValidate>
      <h4>{existing ? t('rev.update') : t('rev.write')}</h4>
      <FormField label={t('rev.rating')} name="rating" error={errors.rating}>
        <RatingStars value={rating} onChange={setRating} label={t('rev.rating')} />
      </FormField>
      <FormField label={t('rev.text')} name="text" as="textarea" rows={3} value={text} onChange={(e) => setText(e.target.value)} error={errors.text} maxLength={1000} />
      <button className="btn btn--primary" disabled={busy}>{busy ? t('common.loading') : existing ? t('rev.update') : t('rev.send')}</button>
    </form>
  );
}
