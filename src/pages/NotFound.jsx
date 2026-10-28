import { Link } from '../lib/router.jsx';
import { useDocumentTitle } from '../lib/hooks.js';
import { useI18n } from '../context/I18nContext.jsx';

export default function NotFound() {
  const { t } = useI18n();
  useDocumentTitle('404');
  return (
    <section className="container section state">
      <div className="nf-code">4<span>0</span>4</div>
      <h1>{t('common.notFound')}</h1>
      <Link to="/" className="btn btn--primary">{t('common.home')}</Link>
    </section>
  );
}
