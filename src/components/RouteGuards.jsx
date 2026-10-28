// Private routes: кирбеген колдонуучу /login'ге, админ эмес колдонуучу 403'кө.
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { Navigate, useLocation, Link } from '../lib/router.jsx';
import { Spinner } from './ui/States.jsx';

export function PrivateRoute({ children }) {
  const { user, ready } = useAuth();
  const { pathname, search } = useLocation();
  if (!ready) return <Spinner />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(pathname + search)}`} />;
  return children;
}

export function AdminRoute({ children }) {
  const { user, ready, isAdmin } = useAuth();
  const { t } = useI18n();
  const { pathname } = useLocation();
  if (!ready) return <Spinner />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(pathname)}`} />;
  if (!isAdmin) {
    return (
      <div className="container section state">
        <div className="state__icon">🔒</div>
        <h3>403</h3>
        <p>{t('nav.admin')}: admin role required.</p>
        <Link className="btn btn--primary" to="/">{t('common.home')}</Link>
      </div>
    );
  }
  return children;
}
