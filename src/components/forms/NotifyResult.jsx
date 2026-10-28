// Telegram/почта билдирүүсүнүн абалын көрсөтөт.
import { useI18n } from '../../context/I18nContext.jsx';

export default function NotifyResult({ notify }) {
  const { t } = useI18n();
  if (!notify) return null;
  const any = notify.telegram?.sent || notify.email?.sent;
  if (any) return <small className="muted">✓ Telegram: {notify.telegram?.sent ? '✓' : '—'} · Email: {notify.email?.sent ? '✓' : '—'}</small>;
  return <small className="muted">ℹ️ {t('common.notifyOff')}</small>;
}
