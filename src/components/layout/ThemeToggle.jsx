import { useTheme } from '../../context/ThemeContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import Icon from '../ui/Icon.jsx';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const label = theme === 'dark' ? t('theme.light') : t('theme.dark');
  return (
    <button className="icon-btn" onClick={toggle} aria-label={label} title={label}>
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
    </button>
  );
}
