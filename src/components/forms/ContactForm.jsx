import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { check } from '../../lib/validators.js';
import { useI18n } from '../../context/I18nContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import FormField from '../ui/FormField.jsx';
import { Alert, errorText } from '../ui/States.jsx';
import NotifyResult from './NotifyResult.jsx';

export default function ContactForm() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [v, setV] = useState({ name: user?.name || '', email: user?.email || '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});

  // Колдонуучу кийинчерээк жүктөлсө — аты жана email автоматтык толтурулат
  useEffect(() => { if (user) setV((x) => ({ ...x, name: x.name || user.name, email: x.email || user.email })); }, [user]);
  const [state, setState] = useState({ busy: false, done: null, error: null });
  const on = (k) => (e) => setV({ ...v, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = check(v, { name: ['required', { min: 2 }], email: ['required', 'email'], message: ['required', { min: 10 }] }, t);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState({ busy: true, done: null, error: null });
    try {
      const r = await api('/api/contact', { method: 'POST', body: v });
      setState({ busy: false, done: r, error: null });
      setV({ ...v, subject: '', message: '' });
    } catch (err) {
      setErrors(err.details || {});
      setState({ busy: false, done: null, error: err });
    }
  };

  return (
    <form className="form card" onSubmit={submit} noValidate>
      {state.done && <Alert type="success">{t('ct.sent')} <NotifyResult notify={state.done.notify} /></Alert>}
      {state.error && <Alert type="error">{errorText(state.error, t)}</Alert>}
      <div className="form__row">
        <FormField label={t('co.name')} name="c-name" value={v.name} onChange={on('name')} error={errors.name} autoComplete="name" />
        <FormField label={t('co.email')} name="c-email" type="email" value={v.email} onChange={on('email')} error={errors.email} autoComplete="email" />
      </div>
      <FormField label={t('co.phone')} name="c-phone" type="tel" value={v.phone} onChange={on('phone')} error={errors.phone} autoComplete="tel" />
      <FormField label={t('ct.subject')} name="c-subject" value={v.subject} onChange={on('subject')} error={errors.subject} maxLength={120} />
      <FormField label={t('ct.message')} name="c-message" as="textarea" rows={5} value={v.message} onChange={on('message')} error={errors.message} maxLength={2000} />
      <button className="btn btn--primary" disabled={state.busy}>{state.busy ? t('common.loading') : t('ct.send')}</button>
    </form>
  );
}
