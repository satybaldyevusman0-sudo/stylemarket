import { useFavorites } from '../../context/FavoritesContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import Icon from '../ui/Icon.jsx';

export default function FavoriteButton({ id, withText = false }) {
  const { has, toggle } = useFavorites();
  const { t } = useI18n();
  const on = has(id);
  const label = on ? t('fav.remove') : t('fav.add');
  return (
    <button className={`fav-btn ${on ? 'fav-btn--on' : ''} ${withText ? 'btn btn--outline' : ''}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(id); }}
      aria-pressed={on} aria-label={label} title={label}>
      <Icon name="heart" fill={on} size={withText ? 18 : 20} />
      {withText && <span>{label}</span>}
    </button>
  );
}
