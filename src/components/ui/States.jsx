// Ката, бош маалымат жана жүктөлүү абалдары.
import { useI18n } from '../../context/I18nContext.jsx';
import Icon from './Icon.jsx';

export function errorText(error, t) {
  if (!error) return '';
  if (error.message === 'offline' || error.message === 'timeout') return t('common.offline');
  return error.message || t('common.error');
}

export function ErrorState({ error, onRetry, compact = false }) {
  const { t } = useI18n();
  return (
    <div className={`state state--error ${compact ? 'state--compact' : ''}`} role="alert">
      <div className="state__icon">⚠️</div>
      <h3>{t('common.error')}</h3>
      <p>{errorText(error, t)}</p>
      {onRetry && <button className="btn btn--outline" onClick={onRetry}>{t('common.retry')}</button>}
    </div>
  );
}

export function EmptyState({ title, text, action, icon = '🔍' }) {
  const { t } = useI18n();
  return (
    <div className="state">
      <div className="state__icon">{icon}</div>
      <h3>{title || t('common.empty')}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function Spinner({ label }) {
  const { t } = useI18n();
  return (
    <div className="spinner-wrap" role="status">
      <span className="spinner" />
      <span className="sr-only">{label || t('common.loading')}</span>
    </div>
  );
}

export function Alert({ type = 'info', title, children }) {
  return (
    <div className={`alert alert--${type}`} role={type === 'error' ? 'alert' : 'note'}>
      <Icon name={type === 'error' ? 'info' : type === 'success' ? 'check' : 'info'} />
      <div>{title && <strong>{title}. </strong>}{children}</div>
    </div>
  );
}
