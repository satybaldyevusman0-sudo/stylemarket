import { useFetch } from '../../lib/hooks.js';
import { useI18n } from '../../context/I18nContext.jsx';
import Icon from '../ui/Icon.jsx';

// Google/GitHub кирүү: сервер OAuth ачкычтары коюлганын текшерет.
export default function OAuthButtons() {
  const { t } = useI18n();
  const { data } = useFetch('/api/auth/providers');
  const btn = (p, label, icon) => {
    const enabled = !!data?.[p];
    return enabled
      ? <a className={`btn btn--oauth btn--${p}`} href={`/api/auth/oauth/${p}`}>{icon}{label}</a>
      : <button type="button" className={`btn btn--oauth btn--${p}`} disabled title={t('auth.oauthOff')}>{icon}{label}<small>{t('auth.oauthOff')}</small></button>;
  };
  return (
    <div className="oauth">
      {btn('google', t('auth.google'), <span className="g-logo" aria-hidden="true">G</span>)}
      {btn('github', t('auth.github'), <Icon name="github" size={18} />)}
    </div>
  );
}
