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

export default function Login() {
  const { t } = useI18n();
  const { user, login } = useAuth();
  const { push } = useToast();
  const [query] = useQuery();
  useDocumentTitle(t('auth.loginTitle'));
  const [v, setV] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ busy: false, error: null });

  if (user) return <Navigate to={safeNext(query.next)} />;

  const submit = async (e) => {
    e.preventDefault();
    const errs = check(v, { email: ['required', 'email'], password: ['required'] }, t);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState({ busy: true, error: null });
    try {
      const u = await login(v.email, v.password);
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
        <h1>{t('auth.loginTitle')}</h1>
        {query.oauth_error && <Alert type="error">OAuth: {query.oauth_error.replace(/_/g, ' ')}</Alert>}
        {query.next && <Alert type="info">{t('auth.needLogin')}</Alert>}
        {state.error && <Alert type="error">{errorText(state.error, t)}</Alert>}
        <FormField label={t('auth.email')} name="l-email" type="email" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} error={errors.email} />
        <FormField label={t('auth.password')} name="l-password" type="password" autoComplete="current-password" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} error={errors.password} />
        <button className="btn btn--primary btn--lg btn--block" disabled={state.busy}>{state.busy ? t('common.loading') : t('auth.login')}</button>
        <div className="divider"><span>{t('auth.or')}</span></div>
        <OAuthButtons />
        <p className="center">{t('auth.noAccount')} <Link to={`/register${query.next ? `?next=${encodeURIComponent(query.next)}` : ''}`}>{t('nav.register')}</Link></p>
        {import.meta.env.DEV && <p className="muted small center">{t('auth.demo')}</p>}
      </form>
    </section>
  );
}
