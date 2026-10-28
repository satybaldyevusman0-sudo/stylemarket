import { useState } from 'react';
import { useI18n } from '../../context/I18nContext.jsx';
import site from '../../site.js';
import FormField from '../ui/FormField.jsx';
import I18nInputs from './I18nInputs.jsx';
import ImageUpload from './ImageUpload.jsx';
import { Alert, errorText } from '../ui/States.jsx';

const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
const asObj = (v) => (typeof v === 'string' ? { ky: v, ru: v, en: v } : v || {});

export default function ItemForm({ initial, onSubmit, onCancel }) {
  const { t, tx } = useI18n();
  const [v, setV] = useState({
    title: asObj(initial.title), category: initial.category || site.categories[0].id, price: initial.price ?? '', oldPrice: initial.oldPrice ?? '',
    currency: initial.currency || site.currency, image: initial.image || '', desc: asObj(initial.desc), brand: initial.brand || '',
    badge: typeof initial.badge === 'string' ? initial.badge : tx(initial.badge) || '', stock: initial.stock ?? '', buyable: initial.buyable !== false,
    tags: (initial.tags || []).join(', '), specs: (initial.specs || []).map(([k, val]) => `${k}: ${val}`).join('\n')
  });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ busy: false, error: null });
  const on = (k) => (e) => setV({ ...v, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if ((v.title.ky || '').trim().length < 2) errs.title = t('common.min', { n: 2 });
    if ((v.desc.ky || '').trim().length < 5) errs.desc = t('common.min', { n: 5 });
    if (v.price === '' || Number(v.price) < 0) errs.price = t('common.required');
    const specs = v.specs.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const i = l.indexOf(':'); return i > 0 ? [l.slice(0, i).trim(), l.slice(i + 1).trim()] : null; });
    if (specs.some((x) => !x || !x[1])) errs.specs = 'Формат: аталышы: мааниси';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState({ busy: true, error: null });
    try {
      await onSubmit({
        title: v.title, category: v.category, price: num(v.price), oldPrice: num(v.oldPrice), currency: v.currency, image: v.image, desc: v.desc,
        brand: v.brand, badge: v.badge, stock: num(v.stock), buyable: v.buyable, tags: v.tags.split(',').map((x) => x.trim()).filter(Boolean), specs
      });
    } catch (err) {
      setErrors(err.details || {});
      setState({ busy: false, error: err });
    }
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      {state.error && <Alert type="error">{errorText(state.error, t)}</Alert>}
      <I18nInputs label={`${t('adm.title')} *`} name="i-title" value={v.title} onChange={(x) => setV({ ...v, title: x })} error={errors.title} textarea={false} />
      <div className="form__row">
        <FormField label={t('filter.category')} name="i-cat">
          <select id="f-i-cat" value={v.category} onChange={on('category')}>{site.categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {tx(c.name)}</option>)}</select>
        </FormField>
        <FormField label={`${t('adm.price')} *`} name="i-price" type="number" min={0} value={v.price} onChange={on('price')} error={errors.price} />
        <FormField label={t('adm.oldPrice')} name="i-old" type="number" min={0} value={v.oldPrice} onChange={on('oldPrice')} error={errors.oldPrice} />
        <FormField label={t('adm.currency')} name="i-cur">
          <select id="f-i-cur" value={v.currency} onChange={on('currency')}><option value="KGS">KGS (сом)</option><option value="USD">USD ($)</option></select>
        </FormField>
      </div>
      <div className="form__row">
        <FormField label={t('adm.brand')} name="i-brand" value={v.brand} onChange={on('brand')} error={errors.brand} />
        <FormField label={t('adm.badge')} name="i-badge" value={v.badge} onChange={on('badge')} error={errors.badge} maxLength={40} />
        <FormField label={t('adm.stock')} name="i-stock" type="number" min={0} value={v.stock} onChange={on('stock')} error={errors.stock} />
        <label className="check"><input type="checkbox" checked={v.buyable} onChange={(e) => setV({ ...v, buyable: e.target.checked })} /> {t('adm.buyable')}</label>
      </div>
      <I18nInputs label={`${t('adm.desc')} *`} name="i-desc" value={v.desc} onChange={(x) => setV({ ...v, desc: x })} error={errors.desc} />
      <FormField label={t('adm.specs')} name="i-specs" as="textarea" rows={4} value={v.specs} onChange={on('specs')} error={errors.specs} placeholder="Год: 2026" />
      <FormField label={t('adm.tags')} name="i-tags" value={v.tags} onChange={on('tags')} error={errors.tags} />
      <ImageUpload value={v.image} onChange={(url) => setV({ ...v, image: url })} error={errors.image} />
      <div className="row row--end">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>{t('common.cancel')}</button>
        <button className="btn btn--primary" disabled={state.busy}>{state.busy ? t('common.loading') : t('common.save')}</button>
      </div>
    </form>
  );
}
