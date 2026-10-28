import { useState } from 'react';
import { useI18n } from '../../context/I18nContext.jsx';
import FormField from '../ui/FormField.jsx';
import I18nInputs from './I18nInputs.jsx';
import { Alert, errorText } from '../ui/States.jsx';

export default function PlanForm({ initial, onSubmit, onCancel }) {
  const { t } = useI18n();
  const [v, setV] = useState({ title: initial.title || {}, description: initial.desc || {}, price: initial.price ?? '', icon: initial.icon || '📦', bookable: !!initial.popular });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ busy: false, error: null });

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if ((v.title.ky || '').trim().length < 2) errs.title = t('common.required');
    if ((v.description.ky || '').trim().length < 2) errs.description = t('common.required');
    if (v.price === '' || Number(v.price) < 0) errs.price = t('common.required');
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState({ busy: true, error: null });
    try { await onSubmit({ ...v, price: Number(v.price) }); } catch (err) { setErrors(err.details || {}); setState({ busy: false, error: err }); }
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      {state.error && <Alert type="error">{errorText(state.error, t)}</Alert>}
      <I18nInputs label={`${t('adm.title')} *`} name="p-title" value={v.title} onChange={(x) => setV({ ...v, title: x })} error={errors.title} textarea={false} />
      <I18nInputs label={`${t('adm.desc')} *`} name="p-desc" value={v.description} onChange={(x) => setV({ ...v, description: x })} error={errors.description} />
      <div className="form__row">
        <FormField label={`${t('adm.price')} *`} name="p-price" type="number" min={0} value={v.price} onChange={(e) => setV({ ...v, price: e.target.value })} error={errors.price} />
        <FormField label={t('adm.icon')} name="p-icon" value={v.icon} onChange={(e) => setV({ ...v, icon: e.target.value })} maxLength={8} />
        <label className="check"><input type="checkbox" checked={v.bookable} onChange={(e) => setV({ ...v, bookable: e.target.checked })} /> {t('adm.popular')}</label>
      </div>
      <div className="row row--end">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>{t('common.cancel')}</button>
        <button className="btn btn--primary" disabled={state.busy}>{state.busy ? t('common.loading') : t('common.save')}</button>
      </div>
    </form>
  );
}
