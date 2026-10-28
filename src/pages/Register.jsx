import { useState } from 'react';
import { Link, Navigate, navigate, useQuery } from '../lib/router.jsx';
import { useDocumentTitle } from '../lib/hooks.js';
import { check } from '../lib/validators.js';
import { useI18n } from '../context/I18nContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import FormField from '../components/ui/FormField.jsx';
import OAuthButtons from '../components/forms/OAuthButtons.jsx';
import { Alert, errorText } from '../components/ui/States.jsx';

const safeNext = (n) => (n && n.startsWith('/') && !n.startsWith('//') ? n : '/profile');

export default function Register() {
  const { t } = useI18n();
  const { user, register } = useAuth();
  const { push } = useToast();
  const [query] = useQuery();
  useDocumentTitle(t('auth.registerTitle'));
  const [v, setV] = useState({ name: '', email: '', password: '', password2: '' });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ busy: false, error: null });
  const on = (k) => (e) => setV({ ...v, [k]: e.target.value });

  if (user) return <Navigate to={safeNext(query.next)} />;

  const submit = async (e) => {
    e.preventDefault();
    const errs = check(v, {
      name: ['required', { min: 2 }],
      email: ['required', 'email'],
      password: ['required', { min: 8 }, (x) => (!/[A-Za-z]/.test(x) || !/[0-9]/.test(x) ? t('auth.pwHint') : null)],
      password2: ['required', (x, all) => (x !== all.password ? t('auth.mismatch') : null)]
    }, t);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState({ busy: true, error: null });
    try {
      const u = await register(v.name, v.email, v.password);
      push(`${t('auth.welcome')}, ${u.name}!`);
      navigate(safeNext(query.next), { replace: true });
    } catch (err) {
      setErrors(err.details || {});
      setState({ busy: false, error: err });
    }
  };

  return (
    <section className="auth container section">
      <form className="card form auth__card" onSubmit={submit} noValidate>
        <h1>{t('auth.registerTitle')}</h1>
        {state.error && <Alert type="error">{errorText(state.error, t)}</Alert>}
        <FormField label={t('auth.name')} name="r-name" autoComplete="name" value={v.name} onChange={on('name')} error={errors.name} />
        <FormField label={t('auth.email')} name="r-email" type="email" autoComplete="email" value={v.email} onChange={on('email')} error={errors.email} />
        <FormField label={t('auth.password')} name="r-password" type="password" autoComplete="new-password" value={v.password} onChange={on('password')} error={errors.password} hint={t('auth.pwHint')} />
        <FormField label={t('auth.password2')} name="r-password2" type="password" autoComplete="new-password" value={v.password2} onChange={on('password2')} error={errors.password2} />
        <button className="btn btn--primary btn--lg btn--block" disabled={state.busy}>{state.busy ? t('common.loading') : t('auth.register')}</button>
        <div className="divider"><span>{t('auth.or')}</span></div>
        <OAuthButtons />
        <p className="center">{t('auth.haveAccount')} <Link to="/login">{t('nav.login')}</Link></p>
      </form>
    </section>
  );
}
